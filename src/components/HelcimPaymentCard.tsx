import { useState, useEffect, useRef } from "react";
import { CreditCard, Loader2, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface HelcimPaymentCardProps {
  amount?: number;
  currency?: string;
  onPaymentSuccess?: (response: unknown) => void;
  onPaymentError?: (error: unknown) => void;
  className?: string;
}

// Placeholder variables - update these with your actual credentials
const HELCIM_TOKEN = "YOUR_HELCIM_TOKEN";
const HELCIM_GATEWAY_ID = "YOUR_GATEWAY_ID";

declare global {
  interface Window {
    HelcimPay?: {
      setToken: (token: string) => void;
      setGatewayId: (gatewayId: string) => void;
      setAmount: (amount: number) => void;
      setCurrency: (currency: string) => void;
      render: (containerId: string) => void;
    };
  }
}

const HelcimPaymentCard = ({
  amount = 0,
  currency = "USD",
  onPaymentSuccess,
  onPaymentError,
  className,
}: HelcimPaymentCardProps) => {
  const [isScriptLoading, setIsScriptLoading] = useState(true);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if script is already loaded
    if (window.HelcimPay) {
      setIsScriptLoaded(true);
      setIsScriptLoading(false);
      return;
    }

    // Dynamically load Helcim.js script
    const script = document.createElement("script");
    script.src = "https://secure.helcim.com/js/version2.js";
    script.async = true;

    script.onload = () => {
      console.log("Helcim.js script loaded successfully");
      setIsScriptLoaded(true);
      setIsScriptLoading(false);
    };

    script.onerror = () => {
      console.error("Failed to load Helcim.js script");
      setError("Failed to load payment processor. Please refresh and try again.");
      setIsScriptLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup: only remove if script exists in DOM
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    // Initialize Helcim form once script is loaded
    if (isScriptLoaded && window.HelcimPay && containerRef.current) {
      try {
        window.HelcimPay.setToken(HELCIM_TOKEN);
        window.HelcimPay.setGatewayId(HELCIM_GATEWAY_ID);
        window.HelcimPay.setAmount(amount);
        window.HelcimPay.setCurrency(currency);
        window.HelcimPay.render("helcim-pay-container");
      } catch (err) {
        console.error("Error initializing Helcim:", err);
        setError("Failed to initialize payment form.");
      }
    }
  }, [isScriptLoaded, amount, currency]);

  const handlePayNow = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // The Helcim form handles the actual payment submission
      // This button can trigger form validation or custom logic
      console.log("Processing payment...");
      
      // Simulate success callback for demo
      if (onPaymentSuccess) {
        onPaymentSuccess({ status: "success" });
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("Payment processing failed. Please try again.");
      if (onPaymentError) {
        onPaymentError(err);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className={cn(
      "w-full max-w-md mx-auto overflow-hidden",
      "bg-gradient-to-br from-card to-card/80",
      "border-border/50 shadow-xl shadow-primary/5",
      "backdrop-blur-sm",
      className
    )}>
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-foreground">
              Secure Payment
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Complete your purchase securely
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Amount Display */}
        {amount > 0 && (
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
            <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
            <span className="text-2xl font-bold text-foreground">
              {currency} {amount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Loading State */}
        {isScriptLoading && (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading payment form...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        {/* Helcim Payment Form Container */}
        <div
          id="helcim-pay-container"
          ref={containerRef}
          className={cn(
            "min-h-[200px] rounded-lg transition-opacity duration-300",
            isScriptLoading ? "opacity-0" : "opacity-100"
          )}
        />

        {/* Pay Now Button */}
        <Button
          onClick={handlePayNow}
          disabled={isScriptLoading || isProcessing || !!error}
          size="lg"
          className={cn(
            "w-full h-12 text-base font-semibold",
            "bg-primary hover:bg-primary/90",
            "shadow-lg shadow-primary/25 hover:shadow-primary/40",
            "transition-all duration-300"
          )}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Pay Now
            </>
          )}
        </Button>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Secured by Helcim • 256-bit SSL encryption
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default HelcimPaymentCard;
