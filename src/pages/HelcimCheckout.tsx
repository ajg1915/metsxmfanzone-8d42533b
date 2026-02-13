import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Shield, CreditCard, AlertCircle, ArrowLeft, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import metsLogo from "@/assets/metsxmfanzone-logo.png";

interface PlanInfo {
  name: string;
  price: string;
  priceValue: number;
  period: string;
  billingNote?: string;
  description: string;
}

const HelcimCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState("");
  const checkoutToken = searchParams.get('token') || sessionStorage.getItem('helcim_checkout_token');

  // Retrieve plan info from sessionStorage
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('checkout_plan_info');
    if (stored) {
      try {
        setPlanInfo(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, []);

  const handleMessage = useCallback((event: MessageEvent) => {
    if (!checkoutToken) return;
    const helcimPayJsIdentifierKey = 'helcim-pay-js-' + checkoutToken;

    if (event.data.eventName === helcimPayJsIdentifierKey) {
      if (event.data.eventStatus === 'SUCCESS') {
        sessionStorage.removeItem('checkout_plan_info');
        navigate(`/payment-success?session_id=${checkoutToken}`);
      }
      if (event.data.eventStatus === 'ABORTED') {
        navigate('/payment-error');
      }
      if (event.data.eventStatus === 'HIDE') {
        navigate('/pricing');
      }
    }
  }, [checkoutToken, navigate]);

  useEffect(() => {
    if (!checkoutToken) {
      navigate('/pricing');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://secure.helcim.app/helcim-pay/services/start.js';
    script.async = true;

    script.onload = () => {
      setTimeout(() => {
        if (typeof window.appendHelcimPayIframe === 'function') {
          window.appendHelcimPayIframe(checkoutToken, true);
          setStatus('ready');
        } else {
          setStatus('error');
          setErrorMsg('Payment form failed to initialize. Please try again.');
        }
      }, 500);
    };

    script.onerror = () => {
      setStatus('error');
      setErrorMsg('Failed to load payment system. Please check your connection and try again.');
    };

    document.head.appendChild(script);
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [checkoutToken, navigate, handleMessage]);

  // Style the Helcim iframe to sit inside the right panel instead of full-screen
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'helcim-checkout-styles';
    style.textContent = `
      #nav-root { display: none !important; }

      .helcim-pay-iframe-wrapper,
      div[id*="helcimPayIframe"] {
        z-index: 50 !important;
        position: fixed !important;
        top: 0 !important;
        right: 0 !important;
        left: auto !important;
        width: 100vw !important;
        height: 100dvh !important;
        border: none !important;
        background: #fff !important;
      }
      .helcim-pay-iframe-wrapper iframe,
      div[id*="helcimPayIframe"] iframe {
        width: 100% !important;
        height: 100% !important;
        border: none !important;
      }

      @media (min-width: 768px) {
        .helcim-pay-iframe-wrapper,
        div[id*="helcimPayIframe"] {
          width: 55% !important;
          left: auto !important;
          right: 0 !important;
          border-left: 1px solid hsl(var(--border)) !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existing = document.getElementById('helcim-checkout-styles');
      if (existing) existing.remove();
    };
  }, []);

  // Error state
  if (status === 'error') {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center space-y-4 max-w-sm text-center">
          <AlertCircle className="w-10 h-10 text-destructive" />
          <h2 className="text-xl font-bold text-foreground">Payment Error</h2>
          <p className="text-muted-foreground text-sm">{errorMsg}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/pricing')}>Back to Plans</Button>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex">
      {/* Left Panel - Order Summary (visible on desktop, hidden on mobile when iframe is ready) */}
      <div className={`w-full md:w-[45%] bg-muted/30 p-6 sm:p-10 lg:p-16 flex flex-col ${status === 'ready' ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/pricing')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <img src={metsLogo} alt="MetsXM" className="h-8 w-8 object-contain" />
          <span className="font-semibold text-foreground">MetsXM FanZone</span>
        </div>

        {/* Order Total */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-1">Your order</p>
          <p className="text-4xl font-bold text-foreground">
            {planInfo?.price || '$--'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {planInfo ? `Billed ${planInfo.period}` : ''}
          </p>
        </div>

        {/* Line Items */}
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

        {/* Security footer */}
        <div className="mt-auto pt-8 flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Secure checkout · 256-bit SSL encrypted</span>
        </div>
      </div>

      {/* Right Panel - Payment (Helcim iframe loads here) */}
      <div className={`w-full md:w-[55%] flex flex-col items-center justify-center p-6 ${status === 'ready' ? 'hidden md:flex' : ''}`}>
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <h3 className="text-lg font-bold text-foreground">Loading Payment Form</h3>
            <p className="text-muted-foreground text-sm">Preparing your secure checkout...</p>
          </div>
        )}
      </div>
    </div>
  );
};

declare global {
  interface Window {
    appendHelcimPayIframe: (checkoutToken: string, allowExit?: boolean) => void;
  }
}

export default HelcimCheckout;
