import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import authLogo from "@/assets/metsxmfanzone-logo-auth.png";

export default function ConfirmAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  const { toast } = useToast();

  const [verificationState, setVerificationState] = useState<"pending" | "verifying" | "success" | "error" | "waiting">("waiting");
  const [errorMessage, setErrorMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Verify token if present
  useEffect(() => {
    if (token && email) {
      verifyEmail();
    }
  }, [token, email]);

  const verifyEmail = async () => {
    if (!token || !email) return;

    setVerificationState("verifying");
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-email-confirmation', {
        body: { token, email },
      });

      if (error || data?.error) {
        setVerificationState("error");
        setErrorMessage(data?.error || error?.message || "Failed to verify email");
        return;
      }

      setVerificationState("success");
      toast({
        title: "Email confirmed!",
        description: "Your account is now active. You can log in.",
      });
    } catch (err: any) {
      setVerificationState("error");
      setErrorMessage(err.message || "An error occurred during verification");
    }
  };

  const handleResendConfirmation = async () => {
    if (!email || resendCooldown > 0) return;

    setResendLoading(true);
    try {
      // First, look up the user by email in email_confirmation_tokens
      const { data: existingToken, error: lookupError } = await supabase
        .from("email_confirmation_tokens")
        .select("user_id")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let userId = existingToken?.user_id;

      // If no token found, we can't resend – user may not have signed up yet
      if (!userId) {
        toast({
          title: "Account not found",
          description: "No pending account found for this email. Please sign up first.",
          variant: "destructive",
        });
        setResendLoading(false);
        return;
      }

      // Generate a new token
      const newToken = crypto.randomUUID() + "-" + Date.now().toString(36);
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Insert new token into the database
      const { error: insertError } = await supabase
        .from("email_confirmation_tokens")
        .insert({
          user_id: userId,
          token: newToken,
          email: email,
          expires_at: tokenExpiry.toISOString(),
        });

      if (insertError) {
        console.error("Failed to store new confirmation token:", insertError);
        throw new Error("Failed to generate confirmation link");
      }

      // Send confirmation email via edge function
      const { error } = await supabase.functions.invoke('send-email-confirmation', {
        body: {
          email,
          name: "Mets Fan",
          userId: userId,
          token: newToken,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Confirmation email sent",
        description: "Please check your inbox (and spam folder) for the new confirmation link.",
      });
      setResendCooldown(60);
    } catch (err: any) {
      console.error("Resend confirmation error:", err);
      toast({
        title: "Failed to resend",
        description: err.message || "Unable to send confirmation email. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  // Check if there's a pending plan selection
  const hasPendingPlan = localStorage.getItem("pending_signup_plan");
  
  const handleContinueAfterConfirmation = () => {
    if (hasPendingPlan) {
      navigate("/plans?required=true");
    } else {
      navigate("/auth?mode=login");
    }
  };

  // Show success state
  if (verificationState === "success") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-20 flex items-center justify-center">
          <Card className="w-full max-w-md border-green-500/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-green-500">Email Confirmed!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <p className="text-muted-foreground">
                {hasPendingPlan 
                  ? "Your account is now active. Please select your subscription plan to continue."
                  : "Your account has been successfully verified. You can now log in and start enjoying MetsXMFanZone!"
                }
              </p>
              <Button
                onClick={handleContinueAfterConfirmation}
                className="w-full bg-[#FF5910] hover:bg-[#FF5910]/90"
              >
                {hasPendingPlan ? "Select Your Plan" : "Continue to Login"}
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (verificationState === "error") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-20 flex items-center justify-center">
          <Card className="w-full max-w-md border-destructive/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl text-destructive">Verification Failed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <p className="text-muted-foreground">
                {errorMessage || "The confirmation link is invalid or has expired."}
              </p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={handleResendConfirmation}
                  disabled={resendLoading || resendCooldown > 0}
                  className="w-full"
                >
                  {resendLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Confirmation Email"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth?mode=login")}
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Show verifying state
  if (verificationState === "verifying") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-20 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <CardTitle className="text-2xl">Verifying Email...</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Please wait while we confirm your email address.
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Default: waiting for confirmation (user just signed up)
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <img src={authLogo} alt="MetsXMFanZone" className="w-20 h-20 mx-auto" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#FF5910]/10 flex items-center justify-center">
              <Mail className="w-8 h-8 text-[#FF5910]" />
            </div>
            
            <p className="text-muted-foreground">
              We've sent a confirmation link to:
            </p>
            {email && (
              <p className="font-semibold text-lg text-[#FF5910]">{email}</p>
            )}
            <p className="text-muted-foreground text-sm">
              Click the link in the email to activate your account. The link expires in 24 hours.
            </p>
            
            <div className="bg-muted/50 rounded-lg p-4 text-left">
              <p className="text-sm font-medium mb-2">Didn't receive the email?</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Check your spam or junk folder</li>
                <li>• Make sure you entered the correct email</li>
                <li>• Wait a few minutes and try again</li>
              </ul>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                variant="outline"
                onClick={handleResendConfirmation}
                disabled={resendLoading || resendCooldown > 0}
                className="w-full"
              >
                {resendLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Confirmation Email"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/auth?mode=login")}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}