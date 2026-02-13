import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Shield, CreditCard, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const HelcimCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState("");
  const checkoutToken = searchParams.get('token') || sessionStorage.getItem('helcim_checkout_token');

  const handleMessage = useCallback((event: MessageEvent) => {
    if (!checkoutToken) return;
    const helcimPayJsIdentifierKey = 'helcim-pay-js-' + checkoutToken;

    if (event.data.eventName === helcimPayJsIdentifierKey) {
      if (event.data.eventStatus === 'SUCCESS') {
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

  // Lock body overflow on mount, restore on unmount
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  useEffect(() => {
    if (!checkoutToken) {
      navigate('/pricing');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://secure.helcim.app/helcim-pay/services/start.js';
    script.async = true;

    script.onload = () => {
      setStatus('ready');
      setTimeout(() => {
        if (typeof window.appendHelcimPayIframe === 'function') {
          window.appendHelcimPayIframe(checkoutToken, true);
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

  // Inject CSS to ensure Helcim iframe takes over the full viewport
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'helcim-checkout-styles';
    style.textContent = `
      html, body {
        overflow: hidden !important;
        height: 100dvh !important;
      }
      #nav-root {
        display: none !important;
      }
      .helcim-pay-iframe-wrapper,
      .helcim-pay-iframe-wrapper iframe,
      div[id*="helcimPayIframe"] {
        z-index: 999999 !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100dvh !important;
        border: none !important;
        background: #fff !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existing = document.getElementById('helcim-checkout-styles');
      if (existing) existing.remove();
    };
  }, []);

  // Once iframe is active, return null so no React content competes
  if (status === 'ready') {
    return null;
  }

  if (status === 'error') {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center space-y-4 max-w-sm text-center">
          <AlertCircle className="w-10 h-10 text-destructive" />
          <h2 className="text-xl font-bold text-foreground">Payment Error</h2>
          <p className="text-muted-foreground text-sm">{errorMsg}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/pricing')}>
              Back to Plans
            </Button>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center space-y-6 max-w-sm text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <h2 className="text-xl font-bold text-foreground">Preparing Secure Payment</h2>
        <p className="text-muted-foreground text-sm">Loading your payment form...</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>256-bit SSL encrypted</span>
        </div>
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
