import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Shield, CreditCard, ArrowLeft, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

const FORM_HTML = `
<div id="helcimResults" style="font-size:14px;color:#ef4444;margin-bottom:8px;"></div>
<input type="hidden" id="token" />
<input type="hidden" id="amount" />
<input type="hidden" id="response" value="" />
<input type="hidden" id="responseMessage" value="" />
<input type="hidden" id="cardToken" value="" />

<div style="margin-bottom:16px;">
  <label for="cardNumber" style="display:block;font-size:14px;font-weight:500;margin-bottom:6px;">Card number</label>
  <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" inputmode="numeric" autocomplete="cc-number"
    style="width:100%;height:44px;padding:8px 12px 8px 36px;border:1px solid hsl(var(--border));border-radius:6px;font-size:16px;background:hsl(var(--background));color:hsl(var(--foreground));" />
</div>

<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;">
  <div>
    <label for="cardExpiryMonth" style="display:block;font-size:14px;font-weight:500;margin-bottom:6px;">Month</label>
    <input type="text" id="cardExpiryMonth" placeholder="MM" maxlength="2" inputmode="numeric" autocomplete="cc-exp-month"
      style="width:100%;height:44px;padding:8px 12px;border:1px solid hsl(var(--border));border-radius:6px;font-size:16px;background:hsl(var(--background));color:hsl(var(--foreground));" />
  </div>
  <div>
    <label for="cardExpiryYear" style="display:block;font-size:14px;font-weight:500;margin-bottom:6px;">Year</label>
    <input type="text" id="cardExpiryYear" placeholder="YY" maxlength="2" inputmode="numeric" autocomplete="cc-exp-year"
      style="width:100%;height:44px;padding:8px 12px;border:1px solid hsl(var(--border));border-radius:6px;font-size:16px;background:hsl(var(--background));color:hsl(var(--foreground));" />
  </div>
  <div>
    <label for="cardCVV" style="display:block;font-size:14px;font-weight:500;margin-bottom:6px;">CVV</label>
    <input type="text" id="cardCVV" placeholder="123" maxlength="4" inputmode="numeric" autocomplete="cc-csc"
      style="width:100%;height:44px;padding:8px 12px;border:1px solid hsl(var(--border));border-radius:6px;font-size:16px;background:hsl(var(--background));color:hsl(var(--foreground));" />
  </div>
</div>

<div style="margin-bottom:16px;">
  <label for="cardHolderName" style="display:block;font-size:14px;font-weight:500;margin-bottom:6px;">Name on card</label>
  <input type="text" id="cardHolderName" placeholder="John Doe" autocomplete="cc-name"
    style="width:100%;height:44px;padding:8px 12px;border:1px solid hsl(var(--border));border-radius:6px;font-size:16px;background:hsl(var(--background));color:hsl(var(--foreground));" />
</div>
`;

const HelcimCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const checkoutToken = searchParams.get('token') || sessionStorage.getItem('helcim_checkout_token');
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const formInjected = useRef(false);

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

  // Inject form HTML into unmanaged container
  useEffect(() => {
    if (!formContainerRef.current || formInjected.current) return;
    
    const form = document.createElement('form');
    form.name = 'helcimForm';
    form.id = 'helcimForm';
    form.method = 'POST';
    form.innerHTML = FORM_HTML;
    formContainerRef.current.appendChild(form);
    formInjected.current = true;

    // Set token and amount
    const tokenEl = form.querySelector('#token') as HTMLInputElement;
    if (tokenEl) tokenEl.value = helcimJsToken || '';

    // Listen for Helcim.js response
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      setIsProcessing(false);
      const responseField = form.querySelector('#response') as HTMLInputElement;
      const responseMessageField = form.querySelector('#responseMessage') as HTMLInputElement;

      if (responseField?.value === '1') {
        sessionStorage.removeItem('checkout_plan_info');
        navigate(`/payment-success?session_id=${checkoutToken}`);
      } else {
        const msg = responseMessageField?.value || 'Payment was declined. Please try again.';
        toast({ title: "Payment Failed", description: msg, variant: "destructive" });
      }
    });

    return () => {
      // Don't remove on cleanup - let the container handle it
    };
  }, [helcimJsToken, checkoutToken, navigate, toast]);

  // Update amount when planInfo changes
  useEffect(() => {
    const amountEl = document.getElementById('amount') as HTMLInputElement;
    if (amountEl && planInfo) {
      amountEl.value = planInfo.priceValue?.toFixed(2) || '0.00';
    }
  }, [planInfo]);

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

          {/* Unmanaged container for Helcim.js form - React won't touch this */}
          <div ref={formContainerRef} className="flex-1" />

          <Separator className="my-4" />

          {/* Pay Button - kept in React for state management */}
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