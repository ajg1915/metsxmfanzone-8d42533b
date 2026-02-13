import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CreditCard, Shield, Lock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/metsxmfanzone-logo.png";

const HelcimCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dots, setDots] = useState("");
  const checkoutToken = searchParams.get('token') || sessionStorage.getItem('helcim_checkout_token');

  // Animated dots for loading text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.body.classList.add('helcim-active');

    if (!checkoutToken) {
      navigate('/plans');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://secure.helcim.app/helcim-pay/services/start.js';
    script.async = true;

    script.onload = () => {
      if (typeof window.appendHelcimPayIframe === 'function') {
        window.appendHelcimPayIframe(checkoutToken, true);
        // Delay hiding loading screen to let iframe render
        setTimeout(() => setIsLoading(false), 2000);
      } else {
        navigate('/payment-error');
      }
    };

    script.onerror = () => {
      navigate('/payment-error');
    };

    document.head.appendChild(script);

    const handleMessage = (event: MessageEvent) => {
      const helcimPayJsIdentifierKey = 'helcim-pay-js-' + checkoutToken;
      if (event.data.eventName === helcimPayJsIdentifierKey) {
        if (event.data.eventStatus === 'SUCCESS') {
          navigate(`/payment-success?session_id=${checkoutToken}`);
        }
        if (event.data.eventStatus === 'ABORTED') {
          navigate('/payment-error');
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
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [checkoutToken, navigate]);

  // Once Helcim iframe launches, show minimal backdrop
  if (!isLoading) {
    return <div className="fixed inset-0 bg-background z-[9998]" />;
  }

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
          {/* Animated card icon */}
          <motion.div
            animate={{ rotateY: [0, 180, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6"
          >
            <CreditCard className="w-10 h-10 text-primary" />
          </motion.div>

          <h2 className="text-xl font-bold text-foreground mb-2 text-center">
            Preparing Checkout{dots}
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Setting up your secure payment form. This will only take a moment.
          </p>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-8">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "90%" }}
              transition={{ duration: 4, ease: "easeOut" }}
            />
          </div>

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

      {/* Footer */}
      <div className="px-4 py-3 text-center">
        <p className="text-[10px] text-muted-foreground/50">
          Powered by Helcim · Payments secured with 256-bit encryption
        </p>
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
