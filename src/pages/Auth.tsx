import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import citiFieldBg from "@/assets/citi-field-background.png";

const phoneRegex = /^(\+1)?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z.string().optional().refine((val) => !val || phoneRegex.test(val), {
    message: "Invalid phone number format (e.g., 555-123-4567)",
  }),
  smsOptIn: z.boolean().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const newPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const [isLogin, setIsLogin] = useState(mode === "login" || mode !== "signup");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(mode === "reset");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Update isLogin based on mode parameter
    if (mode === "login") {
      setIsLogin(true);
      setIsResettingPassword(false);
    } else if (mode === "signup") {
      setIsLogin(false);
      setIsResettingPassword(false);
    } else if (mode === "reset") {
      setIsResettingPassword(true);
      setIsLogin(false);
      setIsForgotPassword(false);
    }
  }, [mode]);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = signupSchema.parse({ email, password, fullName, phoneNumber, smsOptIn });
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: validated.fullName,
            phone_number: validated.phoneNumber || null,
            sms_notifications_enabled: validated.smsOptIn || false,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Account exists",
            description: "This email is already registered. Please login instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Signup failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      if (data.user) {
        // Update profile with phone number and SMS preference
        if (validated.phoneNumber || validated.smsOptIn) {
          await supabase
            .from("profiles")
            .update({
              phone_number: validated.phoneNumber || null,
              sms_notifications_enabled: validated.smsOptIn || false,
            })
            .eq("id", data.user.id);
        }

        toast({
          title: "Success!",
          description: "Please check your email to confirm your account.",
        });
        navigate(`/confirm-account?email=${encodeURIComponent(validated.email)}`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signup failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = loginSchema.parse({ email, password });
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Login failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        
        // Check subscription plan to determine redirect
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("plan_type, status")
          .eq("user_id", data.user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Redirect based on plan: if premium or annual go home, otherwise go to plans
        if (subscription && (subscription.plan_type === "premium" || subscription.plan_type === "annual")) {
          navigate("/");
        } else {
          navigate("/plans");
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = resetPasswordSchema.parse({ email });
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link. Please check your inbox.",
      });
      
      // Return to login after successful request
      setTimeout(() => {
        setIsForgotPassword(false);
        setEmail("");
      }, 2000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = newPasswordSchema.parse({ password, confirmPassword });
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: validated.password,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Password updated!",
        description: "Your password has been successfully reset.",
      });
      
      navigate("/");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-slowZoom"
        style={{ backgroundImage: `url(${citiFieldBg})` }}
      />
      <div className="absolute inset-0 bg-mets-blue/50" />
      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isResettingPassword ? "Set New Password" : isForgotPassword ? "Reset Password" : isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-center">
            {isResettingPassword
              ? "Enter your new password below"
              : isForgotPassword
              ? "Enter your email to receive a password reset link"
              : isLogin
              ? "Enter your credentials to access your account"
              : "Sign up to join the Mets fan community"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isResettingPassword ? handleUpdatePassword : isForgotPassword ? handleForgotPassword : isLogin ? handleLogin : handleSignup} className="space-y-4">
            {!isLogin && !isForgotPassword && !isResettingPassword && (
              <>
                <div className="bg-muted/50 border border-border rounded-md p-3 text-sm text-muted-foreground">
                  <p>Your account will be created instantly. Welcome emails may be delayed but this won't affect your access.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number (optional)</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="555-123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="smsOptIn"
                    checked={smsOptIn}
                    onCheckedChange={(checked) => setSmsOptIn(checked === true)}
                    disabled={loading || !phoneNumber}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="smsOptIn"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Receive SMS notifications
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get text alerts for news, live streams, and updates. Msg & data rates may apply.
                    </p>
                  </div>
                </div>
              </>
            )}
            
            {!isResettingPassword && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="fan@mets.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}

            {!isForgotPassword && !isResettingPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs text-primary hover:underline"
                      disabled={loading}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}

            {isResettingPassword && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : isResettingPassword ? "Update Password" : isForgotPassword ? "Send Reset Link" : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm space-y-2">
            {!isResettingPassword && (
              isForgotPassword ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setEmail("");
                  }}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  Back to login
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setEmail("");
                    setPassword("");
                    setFullName("");
                    setPhoneNumber("");
                    setSmsOptIn(false);
                  }}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;