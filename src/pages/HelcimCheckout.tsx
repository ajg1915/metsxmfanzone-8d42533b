import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CreditCard, Shield, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/metsxmfanzone-logo.png";

declare global {
  interface Window {
    appendHelcimPayIframe: (checkoutToken: string, allowExit?: boolean) => void;
  }
}

const HelcimCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const checkoutToken = searchParams.get('token') || sessionStorage.getItem('helcim_checkout_token');

  useEffect(() => {
    if (!checkoutToken) {
      navigate('/plans');
      return;
    }

    document.body.classList.add('helcim-active');

    // Load the Helcim script
    const script = document.createElement('script');
    script.src = 'https://secure.helcim.app/helcim-pay/services/start.js';
    script.async = true;

    script.onload = () => {
      if (typeof window.appendHelcimPayIframe === 'function') {
        window.appendHelcimPayIframe(checkoutToken, true);
        // Give iframe time to render, then hide our loading screen
        setTimeout(() => setStatus("ready"), 1500);
      } else {
        setStatus("error");
      }
    };

    script.onerror = () => setStatus("error");

    document.head.appendChild(script);

    // Listen for payment result messages
    const handleMessage = (event: MessageEvent) => {
      const key = 'helcim-pay-js-' + checkoutToken;
      if (event.data.eventName === key) {
        if (event.data.eventStatus === 'SUCCESS') {
          sessionStorage.removeItem('helcim_checkout_token');
          sessionStorage.removeItem('helcim_secret_token');
          navigate('/dashboard');
        }
        if (event.data.eventStatus === 'ABORTED') {
          navigate('/plans');
        }
        if (event.data.eventStatus === 'HIDE') {
          navigate('/plans');
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      document.body.classList.remove('helcim-active');
      window.removeEventListener('message', handleMessage);
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [checkoutToken, navigate]);

  // Once Helcim iframe is injected and ready, hide our UI completely so nothing blocks it
  if (status === "ready") {
    return null;
  }

  if (status === "error") {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[9998] gap-4 px-6">
        <div className="text-destructive text-center space-y-2">
          <CreditCard className="w-12 h-12 mx-auto opacity-50" />
          <h2 className="text-xl font-bold">Payment Unavailable</h2>
          <p className="text-sm text-muted-foreground">Could not load the payment form. Please try again.</p>
        </div>
        <button
          onClick={() => navigate('/plans')}
          className="mt-4 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
        >
          Back to Plans
        </button>
      </div>
    );
  }

  // Loading state
  return (
    <div className="fixed inset-0 bg-background flex flex-col z-[9998]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <button
          onClick={() => navigate('/plans')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <img src={logo} alt="MetsXMFanZone" className="h-7" />
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" />
          <span>Secure</span>
        </div>
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center max-w-sm w-full"
        >
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-6" />
          <h2 className="text-xl font-bold text-foreground mb-2 text-center">
            Loading Secure Checkout
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Preparing your payment form…
          </p>

          {/* Trust badges */}
          <div className="flex items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-1.5 text-xs">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <Lock className="w-3.5 h-3.5 text-primary" />
              <span>PCI Compliant</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-4 py-3 text-center">
        <p className="text-[10px] text-muted-foreground/50">
          Powered by Helcim · 256-bit encryption
        </p>
      </div>
    </div>
  );
};

export default HelcimCheckout;
