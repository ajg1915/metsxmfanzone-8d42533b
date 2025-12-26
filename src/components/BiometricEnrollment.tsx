import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Fingerprint, Smartphone, Shield, X, CheckCircle, AlertCircle } from "lucide-react";
import { browserSupportsWebAuthn, startRegistration } from "@simplewebauthn/browser";

interface BiometricEnrollmentProps {
  onComplete?: () => void;
  onSkip?: () => void;
  showAsCard?: boolean;
  showTitle?: boolean;
}

const BiometricEnrollment = ({ 
  onComplete, 
  onSkip, 
  showAsCard = true,
  showTitle = true 
}: BiometricEnrollmentProps) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [deviceType, setDeviceType] = useState<"fingerprint" | "face" | "passkey">("passkey");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkSupport = async () => {
      const supported = browserSupportsWebAuthn();
      setIsSupported(supported);

      // Detect device type for appropriate messaging
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes("iphone") || userAgent.includes("ipad") || userAgent.includes("mac")) {
        setDeviceType("face"); // Face ID / Touch ID
      } else if (userAgent.includes("android")) {
        setDeviceType("fingerprint");
      } else if (userAgent.includes("windows")) {
        setDeviceType("passkey"); // Windows Hello
      }

      // Check if user already has passkeys
      if (supported) {
        await checkExistingPasskeys();
      }
    };

    checkSupport();
  }, []);

  const checkExistingPasskeys = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data: passkeys } = await supabase
        .from("user_passkeys")
        .select("id")
        .eq("user_id", session.session.user.id);

      if (passkeys && passkeys.length > 0) {
        setIsEnrolled(true);
      }
    } catch (err) {
      console.error("Error checking existing passkeys:", err);
    }
  };

  const getDeviceName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("iPhone")) return "iPhone";
    if (userAgent.includes("iPad")) return "iPad";
    if (userAgent.includes("Mac")) return "Mac";
    if (userAgent.includes("Android")) return "Android Device";
    if (userAgent.includes("Windows")) return "Windows PC";
    if (userAgent.includes("Linux")) return "Linux Device";
    return "Device";
  };

  const handleEnrollBiometric = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get registration options from the server
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        setError("Please log in first to set up biometric login.");
        toast({
          title: "Not authenticated",
          description: "Please log in first to set up biometric login.",
          variant: "destructive",
        });
        return;
      }

      const deviceName = getDeviceName();

      // Request registration options from server
      const response = await supabase.functions.invoke("webauthn-register-options", {
        body: { deviceName },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to get registration options");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      const { options } = response.data;

      if (!options) {
        throw new Error("No registration options received from server");
      }

      // Start the WebAuthn registration using SimpleWebAuthn
      const credential = await startRegistration({
        optionsJSON: options,
      });

      // Verify the registration with the server
      const verifyResponse = await supabase.functions.invoke("webauthn-register-verify", {
        body: { 
          credential: {
            id: credential.id,
            rawId: credential.rawId,
            response: {
              attestationObject: credential.response.attestationObject,
              clientDataJSON: credential.response.clientDataJSON,
              transports: credential.response.transports,
            },
            type: credential.type,
          },
          deviceName,
        },
      });

      if (verifyResponse.error) {
        throw new Error(verifyResponse.error.message || "Failed to verify registration");
      }

      if (verifyResponse.data?.error) {
        throw new Error(verifyResponse.data.error);
      }

      setIsEnrolled(true);
      toast({
        title: "Biometric enrolled!",
        description: `You can now use ${deviceType === "face" ? "Face ID" : deviceType === "fingerprint" ? "fingerprint" : "biometric"} to sign in quickly.`,
      });

      onComplete?.();
    } catch (error: any) {
      console.error("Biometric enrollment error:", error);
      
      // Handle specific WebAuthn errors
      if (error.name === "NotAllowedError") {
        setError("Enrollment was cancelled. You can try again when ready.");
        toast({
          title: "Cancelled",
          description: "Biometric enrollment was cancelled. You can try again later.",
        });
      } else if (error.name === "InvalidStateError") {
        setError("This device is already registered.");
        toast({
          title: "Already registered",
          description: "This biometric credential is already registered to your account.",
        });
      } else if (error.name === "NotSupportedError") {
        setError("Your device doesn't support biometric authentication.");
        toast({
          title: "Not supported",
          description: "Your device or browser doesn't support biometric authentication.",
          variant: "destructive",
        });
      } else if (error.message?.includes("excludeCredentials")) {
        setError("You already have a passkey registered for this device.");
        toast({
          title: "Already enrolled",
          description: "You already have biometric login enabled for this device.",
        });
      } else {
        setError(error.message || "Failed to enroll biometric. Please try again.");
        toast({
          title: "Enrollment failed",
          description: error.message || "Failed to set up biometric login. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return null; // Don't show if not supported
  }

  const Icon = deviceType === "face" ? Shield : Fingerprint;
  const title = deviceType === "face" ? "Enable Face ID / Touch ID" : 
                deviceType === "fingerprint" ? "Enable Fingerprint Login" : 
                "Enable Quick Login";
  const description = deviceType === "face" 
    ? "Sign in faster using Face ID or Touch ID on this device."
    : deviceType === "fingerprint"
    ? "Sign in faster using your fingerprint on this device."
    : "Sign in faster using Windows Hello or a security key.";

  const content = (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      )}

      {isEnrolled && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Biometric login is enabled for this device</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="flex gap-2">
        {!isEnrolled ? (
          <>
            <Button 
              onClick={handleEnrollBiometric} 
              disabled={isLoading}
              className="flex-1"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              {isLoading ? "Setting up..." : "Enable Biometric Login"}
            </Button>
            {onSkip && (
              <Button 
                variant="outline" 
                onClick={onSkip}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <Button 
            onClick={handleEnrollBiometric} 
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            <Smartphone className="h-4 w-4 mr-2" />
            {isLoading ? "Adding..." : "Add Another Device"}
          </Button>
        )}
      </div>
    </div>
  );

  if (!showAsCard) {
    return content;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Faster Sign-in Available
        </CardTitle>
        <CardDescription>
          Set up biometric authentication for quicker access
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};

export default BiometricEnrollment;
