import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tag, X, CreditCard, Shield, ArrowLeft } from "lucide-react";
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
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "helcim" | "square">("helcim");
  const [showPromoCode, setShowPromoCode] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
      // Handle free plan - create subscription directly
      if (plan.id === "free") {
        const springTrainingEnd = new Date("2026-03-31T23:59:59Z");
        const { error } = await supabase
          .from("subscriptions")
          .insert({
            user_id: user.id,
            plan_type: "free",
            status: "active",
            amount: 0,
            currency: "USD",
            start_date: new Date().toISOString(),
            end_date: springTrainingEnd.toISOString(),
            payment_method: "free",
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

      toast({
        title: "Processing...",
        description: "Creating your payment session",
      });

      if (paymentMethod === "paypal") {
        const { data, error } = await supabase.functions.invoke("create-paypal-order", {
          body: { planType: plan.id, promoCode: appliedPromo },
        });

        if (error) throw error;

        if (data?.approvalUrl) {
          window.location.href = data.approvalUrl;
        } else {
          toast({
            title: "Error",
            description: "Failed to create payment session. Please try again.",
            variant: "destructive",
          });
        }
      } else if (paymentMethod === "square") {
        const { data, error } = await supabase.functions.invoke("create-square-checkout", {
          body: { planType: plan.id },
        });

        if (error) throw error;

        if (data?.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          toast({
            title: "Error",
            description: "Failed to create Square checkout. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        const { data, error } = await supabase.functions.invoke("create-helcim-checkout", {
          body: { planType: plan.id, promoCode: appliedPromo },
        });

        if (error) throw error;

        if (data?.checkoutToken && data?.secretToken) {
          sessionStorage.setItem("helcim_checkout_token", data.checkoutToken);
          sessionStorage.setItem("helcim_secret_token", data.secretToken);
          onOpenChange(false);
          navigate(`/helcim-checkout?token=${data.checkoutToken}`);
        } else {
          toast({
            title: "Error",
            description: "Failed to get payment tokens. Please try again.",
            variant: "destructive",
          });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePromo}
                  className="h-7 w-7 p-0"
                >
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
                  <Button onClick={handleApplyPromo} className="h-10 px-4">
                    Apply
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPromoCode(false)}
                  className="text-xs text-muted-foreground"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPromoCode(true)}
                className="w-full justify-start h-10"
              >
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

          <Separator />

          {/* Payment Method - Only show for paid plans */}
          {plan.priceValue > 0 && (
            <div>
              <Label className="text-sm font-medium text-foreground mb-3 block">
                Payment Method
              </Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as "paypal" | "helcim" | "square")}
                className="space-y-2"
              >
                <label
                  htmlFor="helcim"
                  className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <RadioGroupItem value="helcim" id="helcim" />
                  <div className="flex items-center gap-2 flex-1">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Credit/Debit Card</span>
                    <span className="text-xs text-primary ml-auto">Primary</span>
                  </div>
                </label>
                <label
                  htmlFor="square"
                  className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <RadioGroupItem value="square" id="square" />
                  <div className="flex items-center gap-2 flex-1">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Square</span>
                  </div>
                </label>
                <label
                  htmlFor="paypal"
                  className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <RadioGroupItem value="paypal" id="paypal" />
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm font-medium">PayPal</span>
                    <span className="text-xs text-muted-foreground ml-auto">Backup</span>
                  </div>
                </label>
              </RadioGroup>
            </div>
          )}

          {/* Subscribe Button */}
          <Button
            className="w-full h-12 text-base font-semibold"
            size="lg"
            onClick={handleSubscribe}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : plan.priceValue === 0 ? "Activate Free Plan" : `Pay ${plan.price}`}
          </Button>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Secure checkout powered by Helcim, Square & PayPal</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
