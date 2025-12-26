import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { PenLine, CheckCircle } from "lucide-react";
import AuthBackground from "@/components/AuthBackground";
import authLogo from "@/assets/metsxmfanzone-logo-auth.png";

const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  reason: z.string().min(20, "Please tell us why you want to be a writer (at least 20 characters)"),
  portfolioUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

const WriterRegister = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [reason, setReason] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const validated = registerSchema.parse({ 
        fullName, 
        email, 
        password, 
        reason,
        portfolioUrl: portfolioUrl || undefined
      });
      
      setLoading(true);

      // First, sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: `${window.location.origin}/writer-auth`,
          data: {
            full_name: validated.fullName,
          }
        }
      });

      if (authError) {
        toast({
          title: "Registration failed",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      if (!authData.user) {
        toast({
          title: "Registration failed",
          description: "Could not create account. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Create the writer application
      const { error: appError } = await supabase
        .from("writer_applications")
        .insert({
          user_id: authData.user.id,
          full_name: validated.fullName,
          email: validated.email,
          reason: validated.reason,
          portfolio_url: validated.portfolioUrl || null,
          status: "pending",
        });

      if (appError) {
        console.error("Application error:", appError);
        // Still show success since account was created
      }

      // Sign out the user - they need approval first
      await supabase.auth.signOut();

      setSubmitted(true);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <AuthBackground />
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
          <CardHeader className="space-y-1">
            <div className="flex flex-col items-center gap-3 mb-4">
              <img 
                src={authLogo} 
                alt="MetsXMFanZone" 
                className="h-20 w-auto object-contain"
              />
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Application Submitted!</CardTitle>
            <CardDescription className="text-center">
              Your writer application has been submitted successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-muted-foreground">
              <p className="mb-4">
                An administrator will review your application and you'll receive an email once a decision has been made.
              </p>
              <p className="text-sm">
                This process usually takes 1-3 business days.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline">
                <Link to="/writer-auth">Back to Writer Login</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/">Return to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <AuthBackground />
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex flex-col items-center gap-3 mb-4">
            <img 
              src={authLogo} 
              alt="MetsXMFanZone" 
              className="h-20 w-auto object-contain"
            />
            <div className="flex items-center gap-2">
              <PenLine className="h-5 w-5 text-[#FF5910]" />
              <span className="text-lg font-bold text-[#FF5910]">Writer Portal</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Apply to Become a Writer</CardTitle>
          <CardDescription className="text-center">
            Submit your application to join our team of writers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="writer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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

            <div className="space-y-2">
              <Label htmlFor="reason">Why do you want to be a writer?</Label>
              <Textarea
                id="reason"
                placeholder="Tell us about your passion for the Mets and writing experience..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                disabled={loading}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolioUrl">Portfolio/Writing Sample URL (Optional)</Label>
              <Input
                id="portfolioUrl"
                type="url"
                placeholder="https://yourportfolio.com"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm space-y-3">
            <p className="text-muted-foreground">
              Already have writer access?{" "}
              <Link to="/writer-auth" className="text-primary hover:underline">
                Sign in here
              </Link>
            </p>
            <p className="text-muted-foreground">
              Just a fan?{" "}
              <Link to="/auth" className="text-primary hover:underline">
                Sign in as a fan
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WriterRegister;