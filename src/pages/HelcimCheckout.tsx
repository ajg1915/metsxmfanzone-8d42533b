import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-2xl">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <h2 className="text-2xl font-bold text-foreground">Loading Payment</h2>
                <p className="text-muted-foreground text-center">
                  Please wait while we prepare your secure payment form...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Complete Your Payment</h2>
                <p className="text-muted-foreground text-center">
                  The secure payment form should appear above. If it doesn't, please refresh the page.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
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
