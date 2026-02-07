import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Fingerprint } from "lucide-react";
import AuthBackground from "@/components/AuthBackground";
import authLogo from "@/assets/metsxmfanzone-logo-auth.png";
import { trackFailedLogin } from "@/utils/securityAlerts";
import { browserSupportsWebAuthn, startAuthentication } from "@simplewebauthn/browser";
import AuthLoadingScreen from "@/components/auth/AuthLoadingScreen";
import OTPVerificationForm from "@/components/auth/OTPVerificationForm";

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
const REMEMBER_ME_EXPIRY_HOURS = 48;
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
  const [sendingOtp, setSendingOtp] = useState(false); // New: smooth loading during OTP send
  const [otpCode, setOtpCode] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpExpiry, setOtpExpiry] = useState<Date | null>(null);
  const [pendingUserData, setPendingUserData] = useState<{ userId: string; isSignup: boolean } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Bot detection states
  const [honeypot, setHoneypot] = useState(""); // Should remain empty - bots fill this
  const [formLoadTime] = useState(() => Date.now()); // Track when form loaded
  
  // Biometric login states
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [showBiometricEmailInput, setShowBiometricEmailInput] = useState(false);
  const [biometricEmail, setBiometricEmail] = useState("");
  const [biometricError, setBiometricError] = useState<string | null>(null);
  const [biometricPendingUserId, setBiometricPendingUserId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for remembered user on mount and biometric support
  useEffect(() => {
    // Check biometric support
    setBiometricSupported(browserSupportsWebAuthn());
    
    const stored = localStorage.getItem(REMEMBER_ME_KEY);
    if (stored) {
      try {
        const parsed: RememberedUser = JSON.parse(stored);
        if (parsed.expiresAt > Date.now()) {
          setRememberedUser(parsed);
          setEmail(parsed.email);
          setIsRememberedLogin(true);
        } else {
          localStorage.removeItem(REMEMBER_ME_KEY);
        }
      } catch {
        localStorage.removeItem(REMEMBER_ME_KEY);
      }
    }
  }, []);

  // Biometric login handler with 2FA
  const handleBiometricLogin = async () => {
    if (!biometricEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email to use biometric login.",
        variant: "destructive",
      });
      return;
    }

    setBiometricLoading(true);
    setBiometricError(null);
    
    try {
      // Step 1: Get login options from server
      const optionsResponse = await supabase.functions.invoke("webauthn-login-options", {
        body: { email: biometricEmail },
      });

      if (optionsResponse.error) {
        throw new Error(optionsResponse.error.message || "Failed to get login options");
      }

      if (optionsResponse.data?.error) {
        throw new Error(optionsResponse.data.error);
      }

      const { options, userId } = optionsResponse.data;

      if (!options) {
        throw new Error("No login options received. Please register a passkey first.");
      }

      // Step 2: Start biometric authentication using SimpleWebAuthn
      const credential = await startAuthentication({
        optionsJSON: options,
      });

      // Step 3: Verify with server
      const verifyResponse = await supabase.functions.invoke("webauthn-login-verify", {
        body: {
          credential: {
            id: credential.id,
            rawId: credential.rawId,
            response: {
              authenticatorData: credential.response.authenticatorData,
              clientDataJSON: credential.response.clientDataJSON,
              signature: credential.response.signature,
            },
            type: credential.type,
          },
          email: biometricEmail,
        },
      });

      if (verifyResponse.error) {
        throw new Error(verifyResponse.error.message || "Authentication failed");
      }

      if (verifyResponse.data?.error) {
        throw new Error(verifyResponse.data.error);
      }

      // Step 4: Biometric verified - now trigger 2FA with loading screen
      setBiometricLoading(false);
      setSendingOtp(true); // Show loading screen
      
      // Generate and send OTP for 2FA
      const { otp, expiry } = generateOtp();
      setGeneratedOtp(otp);
      setOtpExpiry(expiry);
      
      // Send OTP email
      const otpSent = await sendOtpEmail(biometricEmail, otp);
      setSendingOtp(false); // Hide loading screen
      
      if (!otpSent) {
        toast({
          title: "Verification issue",
          description: "Could not send verification code. Please try password login.",
          variant: "destructive",
        });
        return;
      }

      // Store user info for after 2FA
      setBiometricPendingUserId(userId);
      setPendingUserData({ userId, isSignup: false });
      
      // Show 2FA screen
      setShow2FA(true);
      setShowBiometricEmailInput(false);
      setResendCooldown(60);

    } catch (error: any) {
      console.error("Biometric login error:", error);
      
      // Handle specific WebAuthn errors
      if (error.name === "NotAllowedError") {
        setBiometricError("Biometric authentication was cancelled.");
        toast({
          title: "Cancelled",
          description: "Biometric authentication was cancelled.",
        });
      } else if (error.name === "SecurityError") {
        setBiometricError("Security error. Please ensure you're on a secure connection.");
        toast({
          title: "Security Error",
          description: "Please ensure you're using HTTPS.",
          variant: "destructive",
        });
      } else if (error.message?.includes("No passkeys found")) {
        setBiometricError("No biometric credentials found. Please register first from your account settings.");
        toast({
          title: "No passkeys found",
          description: "Please register a passkey first from your account dashboard.",
          variant: "destructive",
        });
      } else if (error.message?.includes("not found")) {
        setBiometricError("Account not found. Please check your email or sign up.");
        toast({
          title: "Account not found",
          description: "No account found with this email. Please sign up first.",
          variant: "destructive",
        });
      } else {
        setBiometricError(error.message || "Biometric authentication failed. Try password login.");
        toast({
          title: "Login failed",
          description: error.message || "Biometric authentication failed. Try password login.",
          variant: "destructive",
        });
        
        // Track failed login attempt
        trackFailedLogin(biometricEmail, "biometric_failed");
      }
    } finally {
      setBiometricLoading(false);
    }
  };

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
      // IMPORTANT: During password recovery (reset link), Supabase creates a session.
      // We must NOT redirect away from /auth?mode=reset, otherwise the user never
      // sees the "Set New Password" screen.
      if (session && !show2FA && !isRememberedLogin && !isResettingPassword) {
        navigate("/");
      }
    });
  }, [navigate, show2FA, isRememberedLogin, isResettingPassword]);

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
      const { data, error } = await supabase.functions.invoke("send-otp-email", {
        body: {
          to: userEmail,
          otp,
        },
      });

      if (error) {
        console.error("Failed to send OTP email:", error);
        return false;
      }

      if (!data?.success) {
        console.error("OTP email function returned failure:", data);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error sending OTP:", err);
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
        // Update profile with phone number, SMS preference, and ensure email_verified is false
        try {
          const updateData: Record<string, any> = { email_verified: false };
          if (validated.phoneNumber) updateData.phone_number = validated.phoneNumber;
          if (validated.smsOptIn) updateData.sms_notifications_enabled = true;
          
          await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", data.user.id);
        } catch (profileUpdateErr) {
          console.error("Profile update error (non-blocking):", profileUpdateErr);
        }

        // Send confirmation email - the edge function handles token creation with service role
        try {
          const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-email-confirmation', {
            body: {
              email: validated.email.toLowerCase().trim(),
              name: validated.fullName,
              userId: data.user.id,
              // Token will be generated by the edge function
            },
          });

          if (emailError) {
            console.error("Failed to send confirmation email:", emailError);
            toast({
              title: "Account created",
              description: "Account created but we couldn't send the confirmation email. Please try resending from the confirmation page.",
              variant: "destructive",
            });
          }
          
          console.log("Confirmation email sent:", emailResult);
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
        navigate(`/confirm-account?email=${encodeURIComponent(validated.email.toLowerCase().trim())}`);
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
        // Track failed login attempt for security alerts
        trackFailedLogin(validated.email);
        
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
        // Check if email is verified in profiles table
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("email_verified")
          .eq("id", data.user.id)
          .maybeSingle();

        // If profile lookup fails or profile doesn't exist, that's a different issue
        if (profileError) {
          console.error("Profile lookup error:", profileError);
          toast({
            title: "Account Error",
            description: "There was an issue accessing your account. Please contact support.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          return;
        }

        // Check if email_verified is explicitly true (handles null case)
        if (profile?.email_verified !== true) {
          // Sign out the user since they haven't confirmed their email
          await supabase.auth.signOut();
          toast({
            title: "Email Not Verified",
            description: "Your email address hasn't been verified yet. Please check your email for the confirmation link, or click 'Resend' on the next page.",
            variant: "destructive",
          });
          navigate(`/confirm-account?email=${encodeURIComponent(validated.email.toLowerCase().trim())}`);
          return;
        }

        // Generate and send OTP for 2FA - show loading screen during send
        setLoading(false); // Hide form loading
        setSendingOtp(true); // Show OTP sending screen
        
        const { otp, expiry } = generateOtp();
        setGeneratedOtp(otp);
        setOtpExpiry(expiry);
        setPendingUserData({ userId: data.user.id, isSignup: false });
        
        const emailSent = await sendOtpEmail(validated.email, otp);
        setSendingOtp(false); // Hide loading screen
        
        if (emailSent) {
          setShow2FA(true);
          setResendCooldown(60);
        } else {
          toast({
            title: "2FA email not delivered",
            description: "We couldn't send your 6-digit code by email. You'll be logged in without 2FA for now.",
            variant: "destructive",
          });
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
    
    setSendingOtp(true); // Show loading screen
    try {
      // Generate and send OTP for 2FA
      const { otp, expiry } = generateOtp();
      setGeneratedOtp(otp);
      setOtpExpiry(expiry);
      // We don't have userId yet, will get it after OTP verification
      setPendingUserData({ userId: "remembered", isSignup: false });
      
      const emailSent = await sendOtpEmail(rememberedUser.email, otp);
      setSendingOtp(false); // Hide loading screen
      
      if (emailSent) {
        setShow2FA(true);
        setResendCooldown(60);
      } else {
        toast({
          title: "Failed to send code",
          description: "Unable to send verification code. Please try with password.",
          variant: "destructive",
        });
        handleForgetDevice();
      }
    } catch (error) {
      setSendingOtp(false);
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
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
      const expiresAt = Date.now() + REMEMBER_ME_EXPIRY_HOURS * 60 * 60 * 1000;
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
      
      // Check user roles first for role-based redirect
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      
      // Check if user is admin
      const isAdmin = roles?.some(r => r.role === "admin");
      if (isAdmin) {
        navigate("/admin");
        return;
      }
      
      // Check if user is writer
      const isWriter = roles?.some(r => r.role === "writer");
      if (isWriter) {
        navigate("/writer");
        return;
      }
      
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

      // First check if we have a valid session (required for password update)
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast({
          title: "Session expired",
          description: "Your password reset link has expired. Please request a new one.",
          variant: "destructive",
        });
        setIsResettingPassword(false);
        setIsForgotPassword(true);
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: validated.password,
      });

      if (error) {
        // Handle specific auth session errors
        if (error.message.includes("session") || error.message.includes("Auth session missing")) {
          toast({
            title: "Session expired",
            description: "Your password reset link has expired. Please request a new one.",
            variant: "destructive",
          });
          setIsResettingPassword(false);
          setIsForgotPassword(true);
          return;
        }
        
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // IMPORTANT: If user successfully reset password via email link, they've proven email ownership
      // Mark their email as verified in the profiles table
      const userId = sessionData.session.user.id;
      await supabase
        .from("profiles")
        .update({ email_verified: true })
        .eq("id", userId);

      toast({
        title: "Password updated!",
        description: "Your password has been successfully reset. Please log in with your new password.",
      });
      
      // Sign out and redirect to login so user can log in with new password
      await supabase.auth.signOut();
      setIsResettingPassword(false);
      setIsLogin(true);
      setPassword("");
      setConfirmPassword("");
      navigate("/auth?mode=login");
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

  // Loading screen while sending OTP
  if (sendingOtp) {
    return (
      <AuthLoadingScreen 
        title="Sending Verification Code"
        description="Please wait while we send your secure code..."
        type="otp"
      />
    );
  }

  // 2FA Verification Screen - using new streamlined component
  if (show2FA) {
    return (
      <OTPVerificationForm
        email={email}
        otpCode={otpCode}
        onOtpChange={setOtpCode}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        onBack={handleBack2FA}
        loading={loading}
        resendCooldown={resendCooldown}
      />
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
              : "Sign up to join MetsXMFanZone"}
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
                  Remember me for 48 hours
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

            {/* Biometric Login Option */}
            {isLogin && !isForgotPassword && !isResettingPassword && biometricSupported && (
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                
                {showBiometricEmailInput ? (
                  <div className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Enter email for biometric login"
                      value={biometricEmail}
                      onChange={(e) => {
                        setBiometricEmail(e.target.value);
                        setBiometricError(null);
                      }}
                      disabled={biometricLoading}
                      className={biometricError ? "border-destructive" : ""}
                    />
                    
                    {biometricError && (
                      <p className="text-xs text-destructive">{biometricError}</p>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={handleBiometricLogin}
                        disabled={biometricLoading || !biometricEmail}
                      >
                        <Fingerprint className="h-4 w-4 mr-2" />
                        {biometricLoading ? "Authenticating..." : "Continue with Biometric"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setShowBiometricEmailInput(false);
                          setBiometricError(null);
                          setBiometricEmail("");
                        }}
                        disabled={biometricLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowBiometricEmailInput(true)}
                  >
                    <Fingerprint className="h-4 w-4 mr-2" />
                    Sign in with Biometrics
                  </Button>
                )}
              </div>
            )}

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
            
            {/* Writer Portal Link */}
            <div className="pt-2 border-t border-border/50">
              <Link 
                to="/writer-auth" 
                className="text-muted-foreground hover:text-primary text-xs flex items-center justify-center gap-1"
              >
                Are you a writer? Sign in to Writer Portal →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
