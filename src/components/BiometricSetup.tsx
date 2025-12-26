import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Fingerprint, Smartphone, Shield, X } from "lucide-react";
import { browserSupportsWebAuthn, startRegistration } from "@simplewebauthn/browser";

interface BiometricSetupProps {
  onComplete?: () => void;
  onSkip?: () => void;
  showAsCard?: boolean;
}

const BiometricSetup = ({ onComplete, onSkip, showAsCard = true }: BiometricSetupProps) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceType, setDeviceType] = useState<"fingerprint" | "face" | "passkey">("passkey");
  const { toast } = useToast();

  useEffect(() => {
    // Check if WebAuthn is supported
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
    };

    checkSupport();
  }, []);

  const getDeviceName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("iPhone")) return "iPhone";
    if (userAgent.includes("iPad")) return "iPad";
    if (userAgent.includes("Mac")) return "Mac";
    if (userAgent.includes("Android")) return "Android Device";
    if (userAgent.includes("Windows")) return "Windows PC";
    return "Device";
  };

  const handleSetupPasskey = async () => {
    setIsLoading(true);

    try {
      // Get registration options from the server
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast({
          title: "Not authenticated",
          description: "Please log in first to set up biometric login.",
          variant: "destructive",
        });
        return;
      }

      const deviceName = getDeviceName();

      const response = await supabase.functions.invoke("webauthn-register-options", {
        body: { deviceName },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to get registration options");
      }

      const { options } = response.data;

      // Convert challenge and user.id to appropriate format
      const registrationOptions = {
        ...options,
        challenge: options.challenge,
        user: {
          ...options.user,
          id: new TextEncoder().encode(options.user.id),
        },
        excludeCredentials: options.excludeCredentials?.map((cred: any) => ({
          ...cred,
          id: Uint8Array.from(atob(cred.id.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0)),
        })),
      };

      // Start the WebAuthn registration
      const credential = await startRegistration(registrationOptions);

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

      toast({
        title: "Passkey created!",
        description: `You can now use ${deviceType === "face" ? "Face ID" : deviceType === "fingerprint" ? "fingerprint" : "biometric"} to sign in.`,
      });

      onComplete?.();
    } catch (error: any) {
      console.error("Passkey setup error:", error);
      
      // Handle user cancellation
      if (error.name === "NotAllowedError") {
        toast({
          title: "Setup cancelled",
          description: "You can set up biometric login later from your account settings.",
        });
      } else {
        toast({
          title: "Setup failed",
          description: error.message || "Failed to set up passkey. Please try again.",
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
    <>
      <div className="flex items-center gap-4 mb-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={handleSetupPasskey} 
          disabled={isLoading}
          className="flex-1"
        >
          <Smartphone className="h-4 w-4 mr-2" />
          {isLoading ? "Setting up..." : "Enable Now"}
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
      </div>
    </>
  );

  if (!showAsCard) {
    return <div className="space-y-4">{content}</div>;
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

export default BiometricSetup;
