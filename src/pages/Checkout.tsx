import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  Shield,
  Lock,
  Tag,
  X,
  ArrowLeft,
  CreditCard,
  Loader2,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/metsxmfanzone-logo.png";

const PLANS: Record<
  string,
  {
    id: string;
    name: string;
    price: string;
    priceValue: number;
    period: string;
    billingNote: string;
    tagline: string;
    features: string[];
  }
> = {
  premium: {
    id: "premium",
    name: "Premium Monthly",
    price: "$12.99",
    priceValue: 12.99,
    period: "/month",
    billingNote: "Billed monthly. Cancel anytime.",
    tagline: "Most popular for true fans",
    features: [
      "All live streams in HD",
      "Full game replays",
      "All highlights",
      "Community forum access",
      "Ad-free experience",
      "Exclusive content",
      "Multi-device access",
    ],
  },
  annual: {
    id: "annual",
    name: "Annual Plan",
    price: "$129.99",
    priceValue: 129.99,
    period: "/year",
    billingNote: "Billed annually. Save $25.89 vs monthly.",
    tagline: "Best value — save 2 months",
    features: [
      "Everything in Premium",
      "Save $25.89/year",
      "Priority support",
      "Early access to content",
      "Exclusive merchandise discounts",
      "VIP community badge",
    ],
  },
};

const Checkout = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [showPromo, setShowPromo] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const plan = planId ? PLANS[planId] : null;

  useEffect(() => {
    if (!plan) navigate("/plans");
  }, [plan, navigate]);

  if (!plan) return null;

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      setAppliedPromo(promoCode.trim().toUpperCase());
      toast({ title: "Promo Applied", description: `Code "${promoCode.toUpperCase()}" added` });
      setShowPromo(false);
    }
  };

  const handlePay = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in first.", variant: "destructive" });
      navigate("/auth");
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-helcim-checkout", {
        body: { planType: plan.id, promoCode: appliedPromo },
      });

      if (error) throw error;

      if (data?.checkoutToken && data?.secretToken) {
        sessionStorage.setItem("helcim_checkout_token", data.checkoutToken);
        sessionStorage.setItem("helcim_secret_token", data.secretToken);
        navigate(`/helcim-checkout?token=${data.checkoutToken}`);
      } else {
        throw new Error("Failed to create payment session");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast({
        title: "Payment Error",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Checkout — {plan.name} | MetsXMFanZone</title>
      </Helmet>

      {/* Top bar */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3.5">
          <button
            onClick={() => navigate("/plans")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Plans</span>
          </button>
          <img src={logo} alt="MetsXMFanZone" className="h-8" />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure</span>
          </div>
        </div>
      </header>

      {/* Main content — split layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-14">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* LEFT — Plan details */}
          <div className="order-2 lg:order-1">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {plan.tagline}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              {plan.name}
            </h1>
            <p className="text-muted-foreground mb-8">{plan.billingNote}</p>

            <div className="space-y-4">
              {plan.features.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground text-sm sm:text-base">{f}</span>
                </div>
              ))}
            </div>

            {/* Trust section */}
            <div className="mt-10 flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-primary" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-primary" />
                <span>PCI Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-primary" />
                <span>7-day money-back guarantee</span>
              </div>
            </div>
          </div>

          {/* RIGHT — Order summary */}
          <div className="order-1 lg:order-2">
            <div className="bg-card border border-border rounded-2xl p-5 sm:p-8 shadow-lg">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Order Summary
              </h2>

              {/* Plan line item */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-medium text-foreground">{plan.name}</p>
                  <p className="text-sm text-muted-foreground">{plan.period.replace("/", "Billed ")}</p>
                </div>
                <span className="text-lg font-semibold text-foreground">{plan.price}</span>
              </div>

              <Separator className="my-4" />

              {/* Promo code */}
              {appliedPromo ? (
                <div className="flex items-center justify-between bg-primary/10 p-3 rounded-lg mb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">{appliedPromo}</span>
                  </div>
                  <button
                    onClick={() => {
                      setAppliedPromo(null);
                      setPromoCode("");
                    }}
                    className="p-1 hover:bg-primary/20 rounded"
                  >
                    <X className="w-4 h-4 text-primary" />
                  </button>
                </div>
              ) : showPromo ? (
                <div className="mb-4 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                      className="h-10"
                    />
                    <Button onClick={handleApplyPromo} size="sm" className="h-10 px-4">
                      Apply
                    </Button>
                  </div>
                  <button
                    onClick={() => setShowPromo(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowPromo(true)}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 mb-4 transition-colors"
                >
                  <Tag className="w-4 h-4" />
                  Add promotion code
                </button>
              )}

              <Separator className="my-4" />

              {/* Totals */}
              <div className="space-y-2 mb-6">
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
              </div>

              <div className="flex justify-between font-bold text-lg mb-8">
                <span className="text-foreground">Total due today</span>
                <span className="text-foreground">{plan.price}</span>
              </div>

              {/* Pay button */}
              <Button
                className="w-full h-13 sm:h-12 text-base font-semibold rounded-xl"
                size="lg"
                onClick={handlePay}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Pay {plan.price}
                  </>
                )}
              </Button>

              {/* Payment method info */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-3.5 h-3.5" />
                <span>Secure checkout powered by Helcim · 256-bit encryption</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
