import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tag, X, Shield, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import metsLogo from "@/assets/metsxmfanzone-logo.png";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface Plan {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  period: string;
  billingNote?: string;
  description: string;
  features: string[];
}

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan | null;
}

const CheckoutModal = ({ open, onOpenChange, plan }: CheckoutModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPromoCode, setShowPromoCode] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card'>('paypal');

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setIsProcessing(false);
      setPaymentMethod('paypal');
    }
  }, [open]);

  const handleSubscribe = async () => {
    if (!plan) return;

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe",
        variant: "destructive",
      });
      onOpenChange(false);
      navigate("/auth");
      return;
    }

    setIsProcessing(true);

    try {
      // Handle free plan
      if (plan.id === "free") {
        const { error } = await supabase
          .from("subscriptions")
          .insert({
            user_id: user.id,
            plan_type: "free",
            status: "active",
            amount: 0,
            currency: "USD",
            start_date: new Date().toISOString(),
          });

        if (error) throw error;

        toast({
          title: "Welcome!",
          description: "Your free plan has been activated",
        });
        onOpenChange(false);
        navigate("/");
        return;
      }

      if (paymentMethod === 'paypal') {
        // PayPal flow - redirect to PayPal approval
        const { data, error } = await supabase.functions.invoke("create-paypal-order", {
          body: { planType: plan.id, promoCode: appliedPromo },
        });

        if (error) throw error;

        if (data?.approvalUrl) {
          // Redirect to PayPal
          window.location.href = data.approvalUrl;
        } else {
          throw new Error("Failed to create PayPal order");
        }
      } else {
        // Helcim card flow - create checkout and redirect to Helcim page
        const { data, error } = await supabase.functions.invoke("create-helcim-checkout", {
          body: { planType: plan.id, promoCode: appliedPromo },
        });

        if (error) throw error;

        if (data?.checkoutToken && data?.secretToken) {
          sessionStorage.setItem("helcim_checkout_token", data.checkoutToken);
          sessionStorage.setItem("helcim_secret_token", data.secretToken);
          sessionStorage.setItem("checkout_plan_info", JSON.stringify({
            name: plan.name,
            price: plan.price,
            priceValue: plan.priceValue,
            period: plan.period,
            billingNote: plan.billingNote,
            description: plan.description,
          }));
          onOpenChange(false);
          navigate(`/helcim-checkout?token=${data.checkoutToken}`);
        } else {
          throw new Error("Failed to create card checkout session");
        }
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      setAppliedPromo(promoCode.trim().toUpperCase());
      toast({
        title: "Promo Code Applied",
        description: `Code "${promoCode.toUpperCase()}" has been applied`,
      });
      setShowPromoCode(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => {
      if (isProcessing) return;
      onOpenChange(v);
    }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <img src={metsLogo} alt="MetsXM" className="h-8 w-8 object-contain" />
            <DialogTitle className="text-xl font-semibold">Checkout</DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Complete your {plan.name} plan subscription
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-foreground">{plan.name} Plan</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{plan.price}</p>
                <p className="text-xs text-muted-foreground">{plan.period}</p>
              </div>
            </div>
            {plan.billingNote && (
              <p className="text-xs text-muted-foreground">{plan.billingNote}</p>
            )}
          </div>

          <Separator />

          {/* Promo Code Section */}
          <div>
            {appliedPromo ? (
              <div className="flex items-center justify-between bg-primary/10 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{appliedPromo}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRemovePromo} className="h-7 w-7 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : showPromoCode ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="h-10"
                    onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                  />
                  <Button onClick={handleApplyPromo} className="h-10 px-4">Apply</Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowPromoCode(false)} className="text-xs text-muted-foreground">
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowPromoCode(true)} className="w-full justify-start h-10">
                <Tag className="w-4 h-4 mr-2" />
                Add promotion code
              </Button>
            )}
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{plan.price}</span>
            </div>
            {appliedPromo && (
              <div className="flex justify-between text-sm">
                <span className="text-primary">Promo discount</span>
                <span className="text-primary">-$0.00</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold text-base">
              <span className="text-foreground">Total due today</span>
              <span className="text-foreground">{plan.price}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          {plan.priceValue > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Payment method</p>
                
                {/* PayPal - Primary */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    paymentMethod === 'paypal'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border bg-muted/30 hover:border-muted-foreground/30'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'paypal' ? 'border-primary' : 'border-muted-foreground/40'
                  }`}>
                    {paymentMethod === 'paypal' && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">PayPal</p>
                    <p className="text-xs text-muted-foreground">Fast & secure checkout</p>
                  </div>
                  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.648h6.012c1.993 0 3.415.44 4.224 1.308.762.818 1.016 1.958.756 3.388l-.01.062v.56l.436.248c.37.195.666.427.89.696.3.36.494.812.577 1.342.085.545.057 1.191-.083 1.918-.161.837-.422 1.566-.776 2.163a4.57 4.57 0 0 1-1.216 1.393c-.489.378-1.063.66-1.707.837-.627.172-1.338.258-2.113.258h-.502a1.52 1.52 0 0 0-1.503 1.284l-.026.144-.435 2.755-.019.103a.134.134 0 0 1-.132.114H7.076Z" fill="#253B80"/>
                    <path d="M19.432 8.027c-.01.066-.022.133-.035.203-.797 4.085-3.525 5.494-7.007 5.494H10.62a.86.86 0 0 0-.85.729l-.907 5.747-.257 1.63a.453.453 0 0 0 .448.524h3.145a.757.757 0 0 0 .748-.639l.03-.162.593-3.756.038-.207a.757.757 0 0 1 .748-.64h.471c3.047 0 5.433-1.238 6.132-4.818.292-1.496.14-2.745-.632-3.622a3.01 3.01 0 0 0-.862-.683Z" fill="#179BD7"/>
                    <path d="M18.503 7.647a6.587 6.587 0 0 0-.813-.18 10.308 10.308 0 0 0-1.636-.12h-4.96a.754.754 0 0 0-.748.64l-1.056 6.688-.03.197a.86.86 0 0 1 .85-.73h1.77c3.482 0 6.21-1.408 7.007-5.493.024-.121.044-.24.06-.354a4.206 4.206 0 0 0-.444-.648Z" fill="#222D65"/>
                  </svg>
                </button>

                {/* Helcim Card - Secondary */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border bg-muted/30 hover:border-muted-foreground/30'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'card' ? 'border-primary' : 'border-muted-foreground/40'
                  }`}>
                    {paymentMethod === 'card' && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">Credit / Debit Card</p>
                    <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
                  </div>
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* Subscribe Button */}
          <Button
            className="w-full h-12 text-base font-semibold"
            size="lg"
            onClick={handleSubscribe}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : plan.priceValue === 0 ? (
              "Activate Free Plan"
            ) : paymentMethod === 'paypal' ? (
              `Pay ${plan.price} with PayPal`
            ) : (
              `Pay ${plan.price} with Card`
            )}
          </Button>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Secure checkout · 256-bit SSL encrypted</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
