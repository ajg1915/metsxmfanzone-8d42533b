import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

const HelcimCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const checkoutToken = searchParams.get('token') || sessionStorage.getItem('helcim_checkout_token');

  useEffect(() => {
    if (!checkoutToken) {
      navigate('/plans');
      return;
    }

    // Load HelcimPay.js script from correct URL
    const script = document.createElement('script');
    script.src = 'https://secure.helcim.app/helcim-pay/services/start.js';
    script.async = true;
    
    script.onload = () => {
      console.log('HelcimPay.js script loaded');
      setIsLoading(false);
      
      // Call appendHelcimPayIframe to display the modal
      if (typeof window.appendHelcimPayIframe === 'function') {
        window.appendHelcimPayIframe(checkoutToken, true);
      } else {
        console.error('appendHelcimPayIframe function not found');
      }
    };

    script.onerror = () => {
      console.error('Failed to load HelcimPay.js script');
      navigate('/payment-error');
    };

    document.head.appendChild(script);

    // Listen for HelcimPay.js iFrame events
    const handleMessage = (event: MessageEvent) => {
      const helcimPayJsIdentifierKey = 'helcim-pay-js-' + checkoutToken;

      if (event.data.eventName === helcimPayJsIdentifierKey) {
        console.log('Helcim event received:', event.data);

        if (event.data.eventStatus === 'SUCCESS') {
          console.log('Transaction success!', event.data.eventMessage);
          // Redirect to success page with checkout token
          navigate(`/payment-success?session_id=${checkoutToken}`);
        }

        if (event.data.eventStatus === 'ABORTED') {
          console.error('Transaction failed!', event.data.eventMessage);
          navigate('/payment-error');
        }

        if (event.data.eventStatus === 'HIDE') {
          console.log('Modal closed by user');
          navigate('/plans');
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      // Only remove script if it exists in the DOM
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [checkoutToken, navigate]);

  // Once the Helcim iframe launches, hide everything else
  if (!isLoading) {
    return (
      <div className="min-h-screen bg-background" />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <Loader2 className="w-16 h-16 text-primary animate-spin" />
      <h2 className="text-2xl font-bold text-foreground mt-4">Loading Payment</h2>
      <p className="text-muted-foreground text-center mt-2">
        Please wait while we prepare your secure payment form...
      </p>
    </div>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    appendHelcimPayIframe: (checkoutToken: string, allowExit?: boolean) => void;
  }
}

export default HelcimCheckout;
