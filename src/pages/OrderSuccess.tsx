import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const capturePayment = async () => {
      const paypalOrderId = searchParams.get('token');

      if (!paypalOrderId) {
        setStatus('error');
        toast.error("Invalid order session");
        setTimeout(() => navigate('/shop'), 3000);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('capture-shop-order', {
          body: { paypalOrderId },
        });

        if (error) throw error;

        if (data.success) {
          setStatus('success');
          toast.success("Payment successful! Your order has been placed.");
          setTimeout(() => navigate('/shop'), 4000);
        } else {
          throw new Error('Capture failed');
        }
      } catch (err) {
        console.error('Error capturing order:', err);
        setStatus('error');
        toast.error("Payment could not be completed. Please contact support.");
        setTimeout(() => navigate('/shop'), 4000);
      }
    };

    capturePayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-12">
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-center text-primary">Order Processing</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                {status === 'processing' && (
                  <>
                    <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                    <p className="text-foreground text-center">Completing your purchase...</p>
                  </>
                )}
                {status === 'success' && (
                  <>
                    <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                    <p className="text-foreground text-center font-semibold text-xl mb-2">Order Placed!</p>
                    <p className="text-muted-foreground text-center">A confirmation email has been sent. Redirecting to shop...</p>
                  </>
                )}
                {status === 'error' && (
                  <>
                    <XCircle className="w-16 h-16 text-red-500 mb-4" />
                    <p className="text-foreground text-center font-semibold text-xl mb-2">Payment Failed</p>
                    <p className="text-muted-foreground text-center">Redirecting back to shop...</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default OrderSuccess;
