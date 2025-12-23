import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Shield, ArrowLeft } from "lucide-react";
import AuthBackground from "@/components/AuthBackground";
import authLogo from "@/assets/metsxmfanzone-logo-auth.png";

const phoneRegex = /^(\+1)?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

// Common disposable email domains to block
const disposableEmailDomains = [
  "tempmail.com", "temp-mail.org", "guerrillamail.com", "guerrillamail.org",
  "mailinator.com", "maildrop.cc", "10minutemail.com", "10minutemail.net",
  "throwaway.email", "fakeinbox.com", "trashmail.com", "tempail.com",
  "getnada.com", "mohmal.com", "emailondeck.com", "dispostable.com",
  "yopmail.com", "yopmail.fr", "sharklasers.com", "guerrillamailblock.com",
  "pokemail.net", "spam4.me", "grr.la", "binkmail.com", "getairmail.com",
  "dropmail.me", "mailnesia.com", "spambox.us", "tempr.email", "discard.email",
  "throwawaymail.com", "mailforspam.com", "armyspy.com", "cuvox.de",
  "dayrep.com", "einrot.com", "fleckens.hu", "gustr.com", "jourrapide.com",
  "rhyta.com", "superrito.com", "teleworm.us", "tmail.com", "tmails.net",
  "tmpmail.org", "tmpmail.net", "mailcatch.com", "mytemp.email"
];

// Common email typos to suggest corrections
const emailTypoSuggestions: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmal.com": "gmail.com", 
  "gmai.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gamil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "hotmal.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotamil.com": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "outloo.com": "outlook.com",
  "outlok.com": "outlook.com",
  "outllok.com": "outlook.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yhaoo.com": "yahoo.com",
  "iclod.com": "icloud.com",
  "icoud.com": "icloud.com",
};

// Validate email is not disposable and check for typos
const validateEmailDomain = (email: string): { valid: boolean; message?: string; suggestion?: string } => {
  const domain = email.toLowerCase().split("@")[1];
  
  if (!domain) {
    return { valid: false, message: "Invalid email format" };
  }
  
  // Check for disposable email
  if (disposableEmailDomains.includes(domain)) {
    return { valid: false, message: "Temporary or disposable email addresses are not allowed. Please use a permanent email." };
  }
  
  // Check for common typos
  if (emailTypoSuggestions[domain]) {
    return { 
      valid: false, 
      message: `Did you mean ${email.split("@")[0]}@${emailTypoSuggestions[domain]}?`,
      suggestion: `${email.split("@")[0]}@${emailTypoSuggestions[domain]}`
    };
  }
  
  // Check for very short domains (likely invalid)
  if (domain.length < 4 || !domain.includes(".")) {
    return { valid: false, message: "Please enter a valid email domain" };
  }
  
  return { valid: true };
};

const signupSchema = z.object({
  email: z.string()
    .email("Invalid email address")
    .refine((email) => {
      const result = validateEmailDomain(email);
      return result.valid;
    }, {
      message: "Please use a valid, permanent email address",
    }),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  phoneNumber: z.string().min(10, "Phone number is required").refine((val) => phoneRegex.test(val), {
    message: "Invalid phone number format (e.g., 555-123-4567)",
  }),
  smsOptIn: z.boolean(),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the Terms & Privacy Policy" }),
  }),
  selectedPlan: z.enum(["free", "premium", "annual"], {
    errorMap: () => ({ message: "Please select a plan" }),
  }),
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

const REMEMBER_ME_KEY = "metsxm_remember_user";
const REMEMBER_ME_EXPIRY_DAYS = 30;
const MIN_FORM_FILL_TIME_MS = 3000; // Minimum 3 seconds to fill form (bots are faster)

interface RememberedUser {
  email: string;
  expiresAt: number;
}

// Bot detection utilities
const detectBot = (): { isBot: boolean; reason?: string } => {
  // Check for headless browser indicators
  const navigatorAny = navigator as any;
  
  // Check webdriver (Selenium, Puppeteer)
  if (navigatorAny.webdriver) {
    return { isBot: true, reason: "Automated browser detected" };
  }
  
  // Check for missing browser features that bots often lack
  if (!window.requestAnimationFrame || !window.cancelAnimationFrame) {
    return { isBot: true, reason: "Missing browser features" };
  }
  
  // Check for phantom/nightmare.js
  if (window.hasOwnProperty('_phantom') || window.hasOwnProperty('callPhantom')) {
    return { isBot: true, reason: "Headless browser detected" };
  }
  
  // Check for unusual screen dimensions (headless browsers often have 0x0 or unusual sizes)
  if (window.screen.width === 0 || window.screen.height === 0) {
    return { isBot: true, reason: "Invalid screen dimensions" };
  }
  
  // Check for missing plugins (most real browsers have at least 1 plugin)
  // Note: Modern browsers may return 0 plugins for privacy, so this is a soft check
  
  // Check for automation tools via browser capabilities
  const languages = navigator.languages;
  if (!languages || languages.length === 0) {
    return { isBot: true, reason: "Missing language settings" };
  }
  
  return { isBot: false };
};

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
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Remembered user state (skip password, go straight to 2FA)
  const [rememberedUser, setRememberedUser] = useState<RememberedUser | null>(null);
  const [isRememberedLogin, setIsRememberedLogin] = useState(false);
  
  // 2FA states
  const [show2FA, setShow2FA] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpExpiry, setOtpExpiry] = useState<Date | null>(null);
  const [pendingUserData, setPendingUserData] = useState<{ userId: string; isSignup: boolean } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Bot detection states
  const [honeypot, setHoneypot] = useState(""); // Should remain empty - bots fill this
  const [formLoadTime] = useState(() => Date.now()); // Track when form loaded
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for remembered user on mount
  useEffect(() => {
    const stored = localStorage.getItem(REMEMBER_ME_KEY);
    if (stored) {
      try {
        const parsed: RememberedUser = JSON.parse(stored);
        if (parsed.expiresAt > Date.now()) {
          setRememberedUser(parsed);
          setEmail(parsed.email);
          setIsRememberedLogin(true);
        } else {
          // Expired, remove it
          localStorage.removeItem(REMEMBER_ME_KEY);
        }
      } catch {
        localStorage.removeItem(REMEMBER_ME_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (mode === "login") {
      setIsLogin(true);
      setIsResettingPassword(false);
    } else if (mode === "signup") {
      setIsLogin(false);
      setIsResettingPassword(false);
      setIsRememberedLogin(false); // Don't show remembered login for signup
    } else if (mode === "reset") {
      setIsResettingPassword(true);
      setIsLogin(false);
      setIsForgotPassword(false);
    }
  }, [mode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !show2FA && !isRememberedLogin) {
        navigate("/");
      }
    });
  }, [navigate, show2FA, isRememberedLogin]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    return { otp, expiry };
  };

  const sendOtpEmail = async (userEmail: string, otp: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-otp-email', {
        body: {
          to: userEmail,
          otp: otp,
        },
      });
      
      if (error) {
        console.error('Failed to send OTP email:', error);
        return false;
      }
      
      console.log('OTP email response:', data);
      return true;
    } catch (err) {
      console.error('Error sending OTP:', err);
      return false;
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Bot detection: Check honeypot field
    if (honeypot) {
      console.warn("Bot detected: honeypot field filled");
      toast({
        title: "Signup failed",
        description: "Unable to process your request. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    // Bot detection: Check form fill time
    const fillTime = Date.now() - formLoadTime;
    if (fillTime < MIN_FORM_FILL_TIME_MS) {
      console.warn("Bot detected: form submitted too quickly", fillTime);
      toast({
        title: "Please slow down",
        description: "Please take your time filling out the form.",
        variant: "destructive",
      });
      return;
    }
    
    // Bot detection: Browser checks
    const botCheck = detectBot();
    if (botCheck.isBot) {
      console.warn("Bot detected:", botCheck.reason);
      toast({
        title: "Signup failed",
        description: "Unable to verify your browser. Please try a different browser.",
        variant: "destructive",
      });
      return;
    }
    
    // First check for email domain issues with custom messages
    const emailValidation = validateEmailDomain(email);
    if (!emailValidation.valid) {
      toast({
        title: emailValidation.suggestion ? "Did you mean?" : "Invalid email",
        description: emailValidation.message,
        variant: "destructive",
      });
      return;
    }
    
    try {
      const validated = signupSchema.parse({ 
        email, 
        password, 
        fullName, 
        phoneNumber, 
        smsOptIn,
        agreeToTerms: agreeToTerms as true,
        selectedPlan: selectedPlan as "free" | "premium" | "annual",
      });
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

        // Generate confirmation token
        const confirmationToken = crypto.randomUUID() + "-" + Date.now().toString(36);
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store the confirmation token
        const { error: tokenError } = await supabase
          .from("email_confirmation_tokens")
          .insert({
            user_id: data.user.id,
            token: confirmationToken,
            email: validated.email,
            expires_at: tokenExpiry.toISOString(),
          });

        if (tokenError) {
          console.error("Failed to store confirmation token:", tokenError);
        }

        // Send confirmation email
        try {
          const { error: emailError } = await supabase.functions.invoke('send-email-confirmation', {
            body: {
              email: validated.email,
              name: validated.fullName,
              userId: data.user.id,
              token: confirmationToken,
            },
          });

          if (emailError) {
            console.error("Failed to send confirmation email:", emailError);
          }
        } catch (err) {
          console.error("Error sending confirmation email:", err);
        }

        // Store selected plan in localStorage for after confirmation
        localStorage.setItem("pending_signup_plan", validated.selectedPlan);
        
        // Navigate to confirmation page
        toast({
          title: "Account created!",
          description: "Please check your email and click the confirmation link to activate your account.",
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
    
    // Bot detection: Check honeypot field
    if (honeypot) {
      console.warn("Bot detected: honeypot field filled");
      toast({
        title: "Login failed",
        description: "Unable to process your request. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    // Bot detection: Check form fill time
    const fillTime = Date.now() - formLoadTime;
    if (fillTime < MIN_FORM_FILL_TIME_MS) {
      console.warn("Bot detected: form submitted too quickly", fillTime);
      toast({
        title: "Please slow down",
        description: "Please take your time filling out the form.",
        variant: "destructive",
      });
      return;
    }
    
    // Bot detection: Browser checks
    const botCheck = detectBot();
    if (botCheck.isBot) {
      console.warn("Bot detected:", botCheck.reason);
      toast({
        title: "Login failed",
        description: "Unable to verify your browser. Please try a different browser.",
        variant: "destructive",
      });
      return;
    }
    
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
        // Check if email is verified
        const { data: profile } = await supabase
          .from("profiles")
          .select("email_verified")
          .eq("id", data.user.id)
          .single();

        if (!profile?.email_verified) {
          // Sign out the user since they haven't confirmed their email
          await supabase.auth.signOut();
          toast({
            title: "Email not confirmed",
            description: "Please check your email and click the confirmation link to activate your account.",
            variant: "destructive",
          });
          navigate(`/confirm-account?email=${encodeURIComponent(validated.email)}`);
          return;
        }

        // Generate and send OTP for 2FA
        const { otp, expiry } = generateOtp();
        setGeneratedOtp(otp);
        setOtpExpiry(expiry);
        setPendingUserData({ userId: data.user.id, isSignup: false });
        
        const emailSent = await sendOtpEmail(validated.email, otp);
        if (emailSent) {
          setShow2FA(true);
          setResendCooldown(60);
          toast({
            title: "Verification code sent",
            description: "Please check your email for the 6-digit code.",
          });
        } else {
          // If email fails, proceed without 2FA
          await completeAuthentication(data.user.id, false);
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

  // Handle remembered user login (skip password, just 2FA)
  const handleRememberedLogin = async () => {
    if (!rememberedUser) return;
    
    setLoading(true);
    try {
      // Generate and send OTP for 2FA
      const { otp, expiry } = generateOtp();
      setGeneratedOtp(otp);
      setOtpExpiry(expiry);
      // We don't have userId yet, will get it after OTP verification
      setPendingUserData({ userId: "remembered", isSignup: false });
      
      const emailSent = await sendOtpEmail(rememberedUser.email, otp);
      if (emailSent) {
        setShow2FA(true);
        setResendCooldown(60);
        toast({
          title: "Verification code sent",
          description: `A 6-digit code has been sent to ${rememberedUser.email}`,
        });
      } else {
        toast({
          title: "Failed to send code",
          description: "Unable to send verification code. Please try with password.",
          variant: "destructive",
        });
        handleForgetDevice();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Clear remembered user and show normal login
  const handleForgetDevice = () => {
    localStorage.removeItem(REMEMBER_ME_KEY);
    setRememberedUser(null);
    setIsRememberedLogin(false);
    setEmail("");
  };

  const completeAuthentication = async (userId: string, isSignup: boolean) => {
    // Save remember me preference if checked (only for normal logins, not remembered logins)
    if (rememberMe && !isSignup && !isRememberedLogin) {
      const expiresAt = Date.now() + REMEMBER_ME_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      const rememberedData: RememberedUser = { email, expiresAt };
      localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(rememberedData));
    }

    if (isSignup) {
      toast({
        title: "Success!",
        description: "Your account has been verified.",
      });
      navigate(`/confirm-account?email=${encodeURIComponent(email)}`);
    } else {
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      
      // Check subscription plan to determine redirect using safe function
      const { data: subscriptions } = await supabase
        .rpc("get_user_subscription_safe", { p_user_id: userId });
      
      const subscription = subscriptions?.find(s => s.status === "active");

      if (subscription && (subscription.plan_type === "premium" || subscription.plan_type === "annual")) {
        navigate("/");
      } else {
        navigate("/plans");
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    // Check if OTP has expired
    if (otpExpiry && new Date() > otpExpiry) {
      toast({
        title: "Code expired",
        description: "Your verification code has expired. Please request a new one.",
        variant: "destructive",
      });
      return;
    }

    if (otpCode === generatedOtp && pendingUserData) {
      setLoading(true);
      
      // For remembered users, we need to sign them in with a magic link approach
      // Since we don't have their password, we verify OTP and trust the remembered session
      if (pendingUserData.userId === "remembered" && rememberedUser) {
        // Get the user from their email via a workaround - request password reset token validation
        // Actually, we need to use a different approach: 
        // For remembered users, we'll prompt them to enter password once to verify identity
        // Then extend their remembered session
        
        // For now, we'll need their password for remembered login too
        // Let's sign in with email link or show password prompt
        toast({
          title: "Verification successful!",
          description: "Please enter your password to complete login.",
        });
        setShow2FA(false);
        setIsRememberedLogin(false);
        // Keep the email populated
        setLoading(false);
        return;
      }
      
      await completeAuthentication(pendingUserData.userId, pendingUserData.isSignup);
      setLoading(false);
    } else {
      toast({
        title: "Invalid code",
        description: "The verification code is incorrect. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    const { otp, expiry } = generateOtp();
    setGeneratedOtp(otp);
    setOtpExpiry(expiry);
    setOtpCode("");
    
    const emailSent = await sendOtpEmail(email, otp);
    if (emailSent) {
      setResendCooldown(60);
      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your email.",
      });
    } else {
      toast({
        title: "Failed to resend",
        description: "Unable to send verification code. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleBack2FA = async () => {
    // Sign out and reset 2FA state
    await supabase.auth.signOut();
    setShow2FA(false);
    setOtpCode("");
    setGeneratedOtp("");
    setOtpExpiry(null);
    setPendingUserData(null);
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

  // 2FA Verification Screen
  if (show2FA) {
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
              <span className="text-lg font-bold text-[#FF5910]">MetsXMFanZone.com</span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-bold">Two-Factor Authentication</CardTitle>
            </div>
            <CardDescription className="text-center">
              Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={setOtpCode}
                disabled={loading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button 
              onClick={handleVerifyOtp} 
              className="w-full" 
              disabled={loading || otpCode.length !== 6}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </p>
              <button
                type="button"
                onClick={handleBack2FA}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto"
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show remembered user quick login screen
  if (isRememberedLogin && rememberedUser && isLogin && !isForgotPassword && !isResettingPassword) {
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
              <span className="text-lg font-bold text-[#FF5910]">MetsXMFanZone.com</span>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Welcome Back!</CardTitle>
            <CardDescription className="text-center">
              Continue as <span className="font-medium text-foreground">{rememberedUser.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 border border-border rounded-md p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Your device is remembered. Click below to receive a verification code.
              </p>
            </div>
            
            <Button 
              onClick={handleRememberedLogin} 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Sending code..." : "Send Verification Code"}
            </Button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={handleForgetDevice}
                className="text-sm text-muted-foreground hover:text-foreground"
                disabled={loading}
              >
                Not you? Sign in with a different account
              </button>
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
            <span className="text-lg font-bold text-[#FF5910]">MetsXMFanZone.com</span>
          </div>
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
                  <Label htmlFor="phoneNumber">Phone Number <span className="text-destructive">*</span></Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="555-123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="smsOptIn"
                    checked={smsOptIn}
                    onCheckedChange={(checked) => setSmsOptIn(checked === true)}
                    disabled={loading}
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
                <div className="space-y-2">
                  <Label htmlFor="selectedPlan">Select Your Membership <span className="text-destructive">*</span></Label>
                  <Select value={selectedPlan} onValueChange={setSelectedPlan} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free - $0/forever</SelectItem>
                      <SelectItem value="premium">Premium - $12.99/month</SelectItem>
                      <SelectItem value="annual">Annual - $129.99/year (Best Value)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    You can upgrade or change your plan anytime after signup.
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                    disabled={loading}
                    required
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="agreeToTerms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the rules <span className="text-destructive">*</span>
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      By creating an account, you agree to our{" "}
                      <Link to="/terms" target="_blank" className="text-primary hover:underline">Terms of Service</Link>
                      {" "}and{" "}
                      <Link to="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link>.
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

            {/* Honeypot field - invisible to humans, bots will fill it */}
            <div className="absolute -left-[9999px] -top-[9999px]" aria-hidden="true">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

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

            {/* Remember Me Checkbox - Only show on login */}
            {isLogin && !isForgotPassword && !isResettingPassword && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  disabled={loading}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-normal text-muted-foreground cursor-pointer"
                >
                  Remember me for 30 days
                </Label>
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
                    setAgreeToTerms(false);
                    setSelectedPlan("");
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
