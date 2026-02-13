import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Shield, CreditCard, ArrowLeft, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import metsLogo from "@/assets/metsxmfanzone-logo.png";

interface PlanInfo {
  name: string;
  price: string;
  priceValue: number;
  period: string;
  billingNote?: string;
  description: string;
}

declare global {
  interface Window {
    helcimProcess: () => void;
  }
}

const HelcimCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const checkoutToken = searchParams.get('token') || sessionStorage.getItem('helcim_checkout_token');
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const helcimJsToken = import.meta.env.VITE_HELCIM_JS_TOKEN;

  useEffect(() => {
    if (!checkoutToken) {
      navigate('/pricing');
      return;
    }
    const stored = sessionStorage.getItem('checkout_plan_info');
    if (stored) {
      try { setPlanInfo(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, [checkoutToken, navigate]);

  // Hide nav
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'helcim-checkout-styles';
    style.textContent = `#nav-root { display: none !important; }`;
    document.head.appendChild(style);
    return () => {
      const existing = document.getElementById('helcim-checkout-styles');
      if (existing) existing.remove();
    };
  }, []);

  // Load Helcim.js script
  useEffect(() => {
    if (!helcimJsToken) {
      console.warn('VITE_HELCIM_JS_TOKEN not configured');
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://secure.myhelcim.com/js/version2.js';
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      toast({ title: "Error", description: "Failed to load payment system.", variant: "destructive" });
    };
    document.head.appendChild(script);
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [helcimJsToken, toast]);

  // Listen for Helcim.js form submission results
  useEffect(() => {
    if (!formRef.current) return;

    const form = formRef.current;
    const handleSubmit = (e: Event) => {
      e.preventDefault();
      setIsProcessing(false);

      // Check for response fields injected by Helcim.js
      const responseField = document.getElementById('response') as HTMLInputElement;
      const responseMessageField = document.getElementById('responseMessage') as HTMLInputElement;

      if (responseField?.value === '1') {
        sessionStorage.removeItem('checkout_plan_info');
        navigate(`/payment-success?session_id=${checkoutToken}`);
      } else {
        const msg = responseMessageField?.value || 'Payment was declined. Please try again.';
        toast({ title: "Payment Failed", description: msg, variant: "destructive" });
      }
    };

    form.addEventListener('submit', handleSubmit);
    return () => form.removeEventListener('submit', handleSubmit);
  }, [checkoutToken, navigate, toast]);

  const handleProcessPayment = () => {
    if (!scriptLoaded || !helcimJsToken) {
      toast({ title: "Error", description: "Payment system not ready. Please wait.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);

    if (typeof window.helcimProcess === 'function') {
      window.helcimProcess();
    } else {
      setIsProcessing(false);
      toast({ title: "Error", description: "Payment processor not available.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col md:flex-row">
      {/* Left Panel - Order Summary */}
      <div className="w-full md:w-[45%] bg-muted/30 border-r border-border p-6 sm:p-10 lg:p-16 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/pricing')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <img src={metsLogo} alt="MetsXM" className="h-8 w-8 object-contain" />
          <span className="font-semibold text-foreground">MetsXM FanZone</span>
        </div>

        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-1">Your order</p>
          <p className="text-4xl font-bold text-foreground">{planInfo?.price || '$--'}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {planInfo ? `Billed ${planInfo.period}` : ''}
          </p>
        </div>

        {planInfo && (
          <div className="space-y-4 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{planInfo.name} Plan</p>
                  <p className="text-xs text-muted-foreground">{planInfo.description}</p>
                </div>
              </div>
              <p className="font-semibold text-foreground text-sm whitespace-nowrap">{planInfo.price}</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{planInfo.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-foreground">$0.00</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between font-semibold text-base">
              <span className="text-foreground">Due today</span>
              <span className="text-foreground">{planInfo.price}</span>
            </div>
          </div>
        )}

        <div className="mt-auto pt-8 flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Secure checkout · 256-bit SSL encrypted</span>
        </div>
      </div>

      {/* Right Panel - Custom Card Form */}
      <div className="w-full md:w-[55%] p-6 sm:p-10 lg:p-16 flex flex-col">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
          <h2 className="text-xl font-bold text-foreground mb-1">Payment</h2>
          <p className="text-sm text-muted-foreground mb-6">Enter your card details to complete your purchase.</p>

          {/* Helcim.js Form */}
          <form
            ref={formRef}
            name="helcimForm"
            id="helcimForm"
            method="POST"
            className="space-y-4 flex-1"
          >
            {/* Hidden results div for Helcim.js */}
            <div id="helcimResults" className="text-sm text-destructive"></div>

            {/* Helcim.js config token */}
            <input type="hidden" id="token" value={helcimJsToken || ''} />

            {/* Amount */}
            <input type="hidden" id="amount" value={planInfo?.priceValue?.toFixed(2) || '0.00'} />

            {/* Hidden response fields */}
            <input type="hidden" id="response" value="" />
            <input type="hidden" id="responseMessage" value="" />
            <input type="hidden" id="cardToken" value="" />

            {/* Card Number */}
            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="text-sm font-medium text-foreground">
                Card number
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  className="h-11 pl-10 text-[16px]"
                  inputMode="numeric"
                  autoComplete="cc-number"
                />
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Expiry & CVV Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cardExpiryMonth" className="text-sm font-medium text-foreground">
                  Month
                </Label>
                <Input
                  type="text"
                  id="cardExpiryMonth"
                  placeholder="MM"
                  maxLength={2}
                  className="h-11 text-[16px]"
                  inputMode="numeric"
                  autoComplete="cc-exp-month"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardExpiryYear" className="text-sm font-medium text-foreground">
                  Year
                </Label>
                <Input
                  type="text"
                  id="cardExpiryYear"
                  placeholder="YY"
                  maxLength={2}
                  className="h-11 text-[16px]"
                  inputMode="numeric"
                  autoComplete="cc-exp-year"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardCVV" className="text-sm font-medium text-foreground">
                  CVV
                </Label>
                <Input
                  type="text"
                  id="cardCVV"
                  placeholder="123"
                  maxLength={4}
                  className="h-11 text-[16px]"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                />
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="space-y-2">
              <Label htmlFor="cardHolderName" className="text-sm font-medium text-foreground">
                Name on card
              </Label>
              <Input
                type="text"
                id="cardHolderName"
                placeholder="John Doe"
                className="h-11 text-[16px]"
                autoComplete="cc-name"
              />
            </div>

            <Separator className="my-2" />

            {/* Pay Button */}
            <Button
              type="button"
              id="buttonProcess"
              className="w-full h-12 text-base font-semibold"
              size="lg"
              onClick={handleProcessPayment}
              disabled={isProcessing || !scriptLoaded}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Pay {planInfo?.price || ''}
                </>
              )}
            </Button>
          </form>

          {/* Trust badges */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>Powered by Helcim · PCI-DSS Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelcimCheckout;
