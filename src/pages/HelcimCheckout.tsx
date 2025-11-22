import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const HelcimCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const checkoutToken = searchParams.get('token') || sessionStorage.getItem('helcim_checkout_token');

  useEffect(() => {
    if (!checkoutToken) {
      navigate('/plans');
      return;
    }

    // Load HelcimPay.js script
    const script = document.createElement('script');
    script.src = 'https://myhelcim.com/js/version2.js';
    script.async = true;
    script.onload = () => {
      // Initialize Helcim modal when script loads
      if (window.helcimPay) {
        window.helcimPay.init({
          token: checkoutToken,
          onSuccess: (transaction: any) => {
            console.log('Payment successful:', transaction);
            // Redirect to success page with checkout token
            navigate(`/payment-success?session_id=${checkoutToken}`);
          },
          onError: (error: any) => {
            console.error('Payment error:', error);
            navigate('/payment-error');
          },
          onCancel: () => {
            console.log('Payment cancelled');
            navigate('/payment-error');
          }
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [checkoutToken, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <h2 className="text-2xl font-bold text-foreground">Loading Payment</h2>
              <p className="text-muted-foreground text-center">
                Please wait while we prepare your secure payment form...
              </p>
            </div>
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
    helcimPay: any;
  }
}

export default HelcimCheckout;
