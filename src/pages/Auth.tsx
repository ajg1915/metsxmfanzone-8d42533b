import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
import { lovable } from "@/integrations/lovable/index";

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
  paymentMethod: z.enum(["paypal"], {
    errorMap: () => ({ message: "Please select a payment method" }),
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
const REMEMBER_PIN_KEY = "metsxm_remember_pin";
const REMEMBER_ME_EXPIRY_HOURS = 720; // 30 days
const MIN_FORM_FILL_TIME_MS = 3000;

interface RememberedUser {
  email: string;
  pin?: string; // Optional PIN for quick login
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
  const { user: authUser, loading: authLoading } = useAuth();
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
  const [paymentMethod, setPaymentMethod] = useState<string>("paypal");
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
  
  // Store credentials for re-authentication after OTP
  const [pendingCredentials, setPendingCredentials] = useState<{ email: string; password: string } | null>(null);
  
  // Biometric login states
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [showBiometricEmailInput, setShowBiometricEmailInput] = useState(false);
  const [biometricEmail, setBiometricEmail] = useState("");
  const [biometricError, setBiometricError] = useState<string | null>(null);
  const [biometricPendingUserId, setBiometricPendingUserId] = useState<string | null>(null);
  const [biometricAuthToken, setBiometricAuthToken] = useState<{ token: string; verificationUrl: string } | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast({
          title: "Google Sign-In Failed",
          description: result.error.message || "Could not sign in with Google.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Google Sign-In Error",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

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

      // Step 4: Biometric verified - establish session directly (no 2FA)
      setBiometricLoading(false);
      
      // Establish Supabase session using the auth token
      const authToken = verifyResponse.data.token;
      const verificationUrl = verifyResponse.data.verificationUrl;
      
      if (authToken) {
        try {
          const { error: sessionError } = await supabase.auth.verifyOtp({
            token_hash: authToken,
            type: 'magiclink',
          });
          
          if (sessionError && verificationUrl) {
            const url = new URL(verificationUrl);
            const token = url.searchParams.get('token') || url.hash?.match(/token=([^&]+)/)?.[1];
            if (token) {
              await supabase.auth.verifyOtp({
                token_hash: token,
                type: 'magiclink',
              });
            }
          }
        } catch (err) {
          console.error("Error establishing biometric session:", err);
        }
      }
      
      toast({
        title: "Welcome back!",
        description: "Biometric login successful.",
      });
      
      await completeAuthentication(userId, false);
      setShowBiometricEmailInput(false);

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
    // Only redirect if auth has finished loading and user is confirmed logged in
    // Don't redirect during remembered login flow or password reset
    if (!authLoading && authUser && !isRememberedLogin && !isResettingPassword) {
      // Check if this is a new Google OAuth user who needs to select a plan
      const checkAndRedirect = async () => {
        // Check if user has a subscription
        const { data: subscriptions } = await supabase
          .rpc("get_user_subscription_safe", { p_user_id: authUser.id });
        
        const activeSubscription = subscriptions?.find((s: any) => s.status === "active");
        
        if (!activeSubscription) {
          // New user or no plan - send to pricing
          // Mark email as verified for Google OAuth users (they verified via Google)
          const provider = authUser.app_metadata?.provider;
          if (provider === "google") {
            await supabase
              .from("profiles")
              .update({ email_verified: true })
              .eq("id", authUser.id);
          }
          navigate("/pricing?required=true", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      };
      checkAndRedirect();
    }
  }, [authUser, authLoading, navigate, show2FA, isRememberedLogin, isResettingPassword, sendingOtp]);

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
        paymentMethod: paymentMethod as "paypal",
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
            preferred_payment_method: validated.paymentMethod,
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

        // Store selected plan and payment method in localStorage for after confirmation
        localStorage.setItem("pending_signup_plan", validated.selectedPlan);
        localStorage.setItem("pending_signup_payment_method", validated.paymentMethod);
        
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
      setSendingOtp(true); // Prevent redirect race condition before auth completes

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      });

      if (error) {
        setSendingOtp(false);
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

        if (profileError) {
          console.error("Profile lookup error:", profileError);
          toast({
            title: "Account Error",
            description: "There was an issue accessing your account. Please contact support.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          setSendingOtp(false);
          return;
        }

        if (profile?.email_verified !== true) {
          setSendingOtp(false);
          await supabase.auth.signOut();
          toast({
            title: "Email Not Verified",
            description: "Your email address hasn't been verified yet. Please check your email for the confirmation link, or click 'Resend' on the next page.",
            variant: "destructive",
          });
          navigate(`/confirm-account?email=${encodeURIComponent(validated.email.toLowerCase().trim())}`);
          return;
        }

        // Email verified - complete authentication directly (no 2FA)
        setSendingOtp(false);
        
        // Save remember me preference
        if (rememberMe) {
          const expiresAt = Date.now() + REMEMBER_ME_EXPIRY_HOURS * 60 * 60 * 1000;
          const rememberedData: RememberedUser = { email: validated.email, expiresAt };
          localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(rememberedData));
        }

        await completeAuthentication(data.user.id, false);
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

  // Handle remembered user login - just go to password login
  const handleRememberedLogin = async () => {
    if (!rememberedUser) return;
    // Skip remembered flow, just pre-fill email and show password login
    setIsRememberedLogin(false);
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
        navigate("/admin", { replace: true });
        return;
      }
      
      // Check if user is writer
      const isWriter = roles?.some(r => r.role === "writer");
      if (isWriter) {
        navigate("/writer", { replace: true });
        return;
      }
      
      // Check subscription plan to determine redirect using safe function
      const { data: subscriptions } = await supabase
        .rpc("get_user_subscription_safe", { p_user_id: userId });
      
      const subscription = subscriptions?.find(s => s.status === "active");

      if (subscription && (subscription.plan_type === "premium" || subscription.plan_type === "annual")) {
        navigate("/", { replace: true });
      } else {
        navigate("/pricing?required=true", { replace: true });
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
      if (pendingUserData.userId === "remembered" && rememberedUser) {
        toast({
          title: "Verification successful!",
          description: "Please enter your password to complete login.",
        });
        setShow2FA(false);
        setIsRememberedLogin(false);
        setLoading(false);
        return;
      }
      
      // For password logins, re-authenticate now that OTP is verified
      if (pendingCredentials) {
        const { error: reAuthError } = await supabase.auth.signInWithPassword({
          email: pendingCredentials.email,
          password: pendingCredentials.password,
        });
        setPendingCredentials(null); // Clear stored credentials
        
        if (reAuthError) {
          toast({
            title: "Authentication Error",
            description: "Could not complete login. Please try again.",
            variant: "destructive",
          });
          setShow2FA(false);
          setLoading(false);
          return;
        }
        
        await completeAuthentication(pendingUserData.userId, pendingUserData.isSignup);
        setLoading(false);
        return;
      }
      
      // For biometric logins, establish Supabase session using magic link token
      if (biometricAuthToken) {
        try {
          // Try verifying with the hashed token
          if (biometricAuthToken.token) {
            const { error: sessionError } = await supabase.auth.verifyOtp({
              token_hash: biometricAuthToken.token,
              type: 'magiclink',
            });
            
            if (sessionError) {
              console.error("Session establishment failed with token_hash:", sessionError);
              // Fallback: try using the verification URL directly
              if (biometricAuthToken.verificationUrl) {
                try {
                  const url = new URL(biometricAuthToken.verificationUrl);
                  const token = url.searchParams.get('token') || url.hash?.match(/token=([^&]+)/)?.[1];
                  const type = url.searchParams.get('type') || 'magiclink';
                  if (token) {
                    const { error: fallbackError } = await supabase.auth.verifyOtp({
                      token_hash: token,
                      type: type as 'magiclink',
                    });
                    if (fallbackError) {
                      console.error("Fallback session establishment failed:", fallbackError);
                      // Last resort: sign in with email link
                      const { error: signInError } = await supabase.auth.signInWithOtp({
                        email: biometricEmail,
                        options: { shouldCreateUser: false },
                      });
                      if (signInError) {
                        toast({
                          title: "Session Error",
                          description: "Biometric verified but couldn't establish session. Please try password login.",
                          variant: "destructive",
                        });
                        setLoading(false);
                        setBiometricAuthToken(null);
                        setShow2FA(false);
                        return;
                      }
                      // OTP sent - user needs to check email again
                      toast({
                        title: "One more step",
                        description: "Please check your email for a login link to complete sign-in.",
                      });
                      setLoading(false);
                      setBiometricAuthToken(null);
                      setShow2FA(false);
                      return;
                    }
                  }
                } catch (urlErr) {
                  console.error("Error parsing verification URL:", urlErr);
                }
              }
            }
          }
        } catch (err) {
          console.error("Error establishing biometric session:", err);
        }
        setBiometricAuthToken(null);
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
    
    const targetEmail = biometricPendingUserId ? biometricEmail : email;
    const emailSent = await sendOtpEmail(targetEmail, otp);
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
    setBiometricAuthToken(null);
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


  // Show remembered user quick login screen
  if (isRememberedLogin && rememberedUser && isLogin && !isForgotPassword && !isResettingPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <AuthBackground />
        {/* Decorative glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-[120px]" />
        </div>
        <div className="w-full max-w-sm relative z-10">
          <div className="rounded-2xl border border-muted/40 bg-card/90 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-secondary via-primary to-secondary" />
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex flex-col items-center gap-3">
                <img src={authLogo} alt="MetsXMFanZone" className="h-16 w-auto object-contain" />
                <span className="text-sm font-bold text-primary">MetsXMFanZone.com</span>
              </div>
              <div className="text-center">
                <h1 className="text-lg font-bold text-foreground">Welcome Back!</h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Continue as <span className="font-medium text-foreground">{rememberedUser.email}</span>
                </p>
              </div>
              <div className="bg-muted/30 border border-muted/30 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  Your device is remembered. Click below to continue.
                </p>
              </div>
              <Button onClick={handleRememberedLogin} className="w-full h-10 rounded-xl text-sm font-semibold" disabled={loading}>
                {loading ? "Loading..." : "Continue to Sign In"}
              </Button>
              <div className="text-center">
                <button type="button" onClick={handleForgetDevice} className="text-xs text-muted-foreground hover:text-foreground" disabled={loading}>
                  Not you? Sign in with a different account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <AuthBackground />
      {/* Decorative glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[250px] h-[250px] rounded-full bg-primary/5 blur-[100px]" />
      </div>
      <div className="w-full max-w-sm relative z-10">
        <div className="rounded-2xl border border-muted/40 bg-card/90 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-secondary via-primary to-secondary" />
          <div className="p-5 sm:p-6">
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2 mb-2">
                <img src={authLogo} alt="MetsXMFanZone" className="h-14 w-auto object-contain" />
                <span className="text-xs font-bold text-primary">MetsXMFanZone.com</span>
              </div>
              <div className="text-center">
                <h1 className="text-lg font-bold text-foreground">
                  {isResettingPassword ? "Set New Password" : isForgotPassword ? "Reset Password" : isLogin ? "Welcome Back" : "Create Account"}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isResettingPassword
                    ? "Enter your new password below"
                    : isForgotPassword
                    ? "Enter your email to receive a reset link"
                    : isLogin
                    ? "Enter your credentials to continue"
                    : "Sign up to join MetsXMFanZone"}
                </p>
              </div>
            </div>
            <div className="mt-4">
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
                  <Label htmlFor="signupEmail">Email <span className="text-destructive">*</span></Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    placeholder="fan@mets.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Password <span className="text-destructive">*</span></Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                      <SelectItem value="free">Free (Spring Training) - $0</SelectItem>
                      <SelectItem value="premium">Premium - $12.99/month</SelectItem>
                      <SelectItem value="annual">Annual - $129.99/year (Best Value)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    You can upgrade or change your plan anytime after signup.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method <span className="text-destructive">*</span></Label>
                  <div className="flex items-center gap-2 rounded-md border border-input bg-muted/50 px-3 py-2">
                    <img src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png" alt="PayPal" className="h-5 object-contain" />
                    <span className="text-sm text-foreground font-medium">PayPal</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All payments are processed securely via PayPal. Free plans won't be charged.
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
            
            {!isResettingPassword && (isLogin || isForgotPassword) && (
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

            {isLogin && !isForgotPassword && !isResettingPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-xs text-primary hover:underline"
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
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

            <Button 
              type="submit" 
              className="w-full" 
              disabled={
                loading || 
                (!isLogin && !isForgotPassword && !isResettingPassword && (
                  !fullName.trim() || !email.trim() || !password || !phoneNumber.trim() || !selectedPlan || !agreeToTerms
                ))
              }
            >
              {loading 
                ? "Loading..." 
                : isResettingPassword 
                ? "Update Password" 
                : isForgotPassword 
                ? "Send Reset Link" 
                : isLogin 
                ? "Sign In" 
                : !selectedPlan 
                ? "Select a Membership to Continue"
                : !agreeToTerms
                ? "Agree to Terms to Continue"
                : "Create Account"}
            </Button>


            {/* Biometric Login Option */}
            {isLogin && !isForgotPassword && !isResettingPassword && biometricSupported && (
              <div className="space-y-3">
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

          <div className="mt-4 text-center text-xs space-y-2">
            {!isResettingPassword && (
              isForgotPassword ? (
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(false); setEmail(""); }}
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
                    setEmail(""); setPassword(""); setFullName("");
                    setPhoneNumber(""); setSmsOptIn(false);
                    setAgreeToTerms(false); setSelectedPlan("");
                  }}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              )
            )}
            {isLogin && !isForgotPassword && !isResettingPassword && (
              <Link to="/admin" className="block mt-2 text-[10px] text-muted-foreground/60 hover:text-primary transition-colors">
                Admin Login
              </Link>
            )}
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
