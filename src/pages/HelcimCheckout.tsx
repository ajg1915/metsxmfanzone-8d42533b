import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Shield, CreditCard, ArrowLeft } from "lucide-react";
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
  const checkoutToken = searchParams.get('token') || sessionStorage.getItem('helcim_checkout_token');

  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);

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

  // Hide nav on this page
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

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col md:flex-row">
      {/* Left Panel - Order Summary */}
      <div className="w-full md:w-[45%] bg-muted/30 p-6 sm:p-10 lg:p-16 flex flex-col">
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

      {/* Right Panel - Payment placeholder */}
      <div className="w-full md:w-[55%] flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <CreditCard className="w-10 h-10 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Payment</h3>
          <p className="text-muted-foreground text-sm">Enter your payment details to complete your order.</p>
        </div>
      </div>
    </div>
  );
};

export default HelcimCheckout;
