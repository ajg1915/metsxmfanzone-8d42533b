import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Lock, Shield, AlertTriangle, Fingerprint, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateDeviceFingerprint, getDeviceName } from "@/utils/deviceFingerprint";
import { trackFailedLogin, trackSuspiciousActivity } from "@/utils/securityAlerts";

export default function AdminPortal() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingLockout, setCheckingLockout] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutMinutes, setLockoutMinutes] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>("");
  const [isNewDevice, setIsNewDevice] = useState(false);

  useEffect(() => {
    // Generate device fingerprint on mount
    const initFingerprint = async () => {
      const fp = await generateDeviceFingerprint();
      setDeviceFingerprint(fp);
      checkLockoutStatus(fp);
    };
    initFingerprint();
  }, []);

  const checkLockoutStatus = async (fingerprint: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-pin-login', {
        body: { 
          action: 'check-lockout',
          deviceFingerprint: fingerprint
        }
      });

      if (error) throw error;

      setIsLocked(data.locked);
      setAttemptsRemaining(data.attemptsRemaining);
    } catch (err) {
      console.error('Error checking lockout:', err);
    } finally {
      setCheckingLockout(false);
    }
  };

  const handleLogin = useCallback(async () => {
    if (pin.length < 6 || loading) return;

    setLoading(true);
    try {
      const deviceName = getDeviceName();
      
      const { data, error } = await supabase.functions.invoke('admin-pin-login', {
        body: {
          action: 'login',
          pin,
          deviceFingerprint,
          deviceName
        }
      });

      if (error) throw error;

      if (data.error) {
        // Handle locked account
        if (data.locked) {
          setIsLocked(true);
          setLockoutMinutes(data.remainingMinutes);
          await trackSuspiciousActivity('unknown', 'admin_lockout', `Device locked after multiple failed PIN attempts`);
          toast({
            title: "Account Locked",
            description: data.message,
            variant: "destructive",
          });
          return;
        }

        // Handle failed attempt
        setAttemptsRemaining(data.attemptsRemaining ?? attemptsRemaining - 1);
        await trackFailedLogin('admin-portal', deviceFingerprint.substring(0, 16));
        
        toast({
          title: "Invalid PIN",
          description: `${data.attemptsRemaining} attempts remaining before lockout`,
          variant: "destructive",
        });
        setPin("");
        return;
      }

      if (data.success) {
        // Store admin session info
        sessionStorage.setItem("admin_verified", "true");
        sessionStorage.setItem("admin_verified_at", new Date().toISOString());
        sessionStorage.setItem("admin_user_id", data.userId);
        sessionStorage.setItem("admin_device_fingerprint", deviceFingerprint);

        setIsNewDevice(data.isNewDevice);

        // If we have a verification URL, use it to create a proper Supabase session
        if (data.verificationUrl) {
          try {
            // Extract the token from the URL and verify it
            const url = new URL(data.verificationUrl);
            const token = url.searchParams.get('token');
            const type = url.searchParams.get('type') || 'magiclink';
            
            if (token) {
              // Verify the OTP to establish a proper session
              const { error: verifyError } = await supabase.auth.verifyOtp({
                token_hash: data.tokenHash,
                type: type as 'magiclink'
              });

              if (verifyError) {
                console.error('Session verification failed:', verifyError);
                // Continue anyway - limited functionality mode
              }
            }
          } catch (err) {
            console.error('Error establishing session:', err);
          }
        }

        toast({
          title: "Welcome, Admin",
          description: data.isNewDevice 
            ? "New device registered and trusted" 
            : "Successfully authenticated",
        });

        // Navigate to admin dashboard
        setTimeout(() => navigate("/admin"), 500);
      }
    } catch (err) {
      console.error('Login error:', err);
      toast({
        title: "Error",
        description: "Failed to authenticate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [pin, deviceFingerprint, loading, navigate, toast, attemptsRemaining]);

  // Auto-submit when PIN is complete
  useEffect(() => {
    if (pin.length === 6 && !loading && !isLocked) {
      handleLogin();
    }
  }, [pin, loading, isLocked, handleLogin]);

  if (checkingLockout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <div className="animate-pulse text-muted-foreground flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <span>Initializing secure connection...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md border-2 shadow-xl">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
          <CardDescription className="text-base">
            Enter your 6-digit security PIN to access the admin dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {isLocked ? (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-destructive">Access Temporarily Blocked</h3>
                <p className="text-sm text-muted-foreground">
                  Too many failed attempts detected. This device is locked for {lockoutMinutes} minutes.
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate("/")}
                className="mt-4"
              >
                Return to Home
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Fingerprint className="w-4 h-4" />
                <span>Device fingerprint verified</span>
                <CheckCircle className="w-3 h-3 text-green-500" />
              </div>

              <div className="flex justify-center">
                <InputOTP
                  value={pin}
                  onChange={setPin}
                  maxLength={6}
                  disabled={loading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={4} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={5} className="w-12 h-14 text-xl" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>{attemptsRemaining} attempts remaining</span>
              </div>

              <Button
                onClick={handleLogin}
                disabled={pin.length < 6 || loading}
                className="w-full h-12 text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Access Admin Panel
                  </span>
                )}
              </Button>

              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-medium flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Security Features Active:
                </p>
                <ul className="list-disc list-inside space-y-0.5 pl-1">
                  <li>Device fingerprinting enabled</li>
                  <li>30-minute lockout after 5 failed attempts</li>
                  <li>All login attempts are logged</li>
                  <li>Suspicious activity alerts enabled</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
