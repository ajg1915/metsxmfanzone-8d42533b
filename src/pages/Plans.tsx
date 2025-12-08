import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, ChevronUp, Tag, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Plans = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "helcim">("paypal");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPromoCode, setShowPromoCode] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleSubscribe = async (planType: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      toast({
        title: "Processing...",
        description: "Creating your payment session",
      });

      if (paymentMethod === "paypal") {
        const { data, error } = await supabase.functions.invoke("create-paypal-order", {
          body: { planType, promoCode: appliedPromo },
        });

        if (error) throw error;

        if (data?.orderId && data?.approvalUrl) {
          window.location.href = data.approvalUrl;
        } else {
          toast({
            title: "Error",
            description: "Failed to create payment session. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        const { data, error } = await supabase.functions.invoke("create-helcim-checkout", {
          body: { planType, promoCode: appliedPromo },
        });

        if (error) throw error;

        if (data?.checkoutToken && data?.secretToken) {
          sessionStorage.setItem("helcim_checkout_token", data.checkoutToken);
          sessionStorage.setItem("helcim_secret_token", data.secretToken);
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

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      priceValue: 0,
      period: "forever",
      description: "Perfect for casual fans",
      features: ["Limited highlights access", "Community forum access", "Game schedules", "Free Spring Training Live"],
      notIncluded: ["Live streaming", "Full game replays", "Exclusive content", "Ad-free experience"],
      cta: "Sign Up Free",
      popular: false,
    },
    {
      id: "premium",
      name: "Premium",
      price: "$12.99",
      priceValue: 12.99,
      period: "per month",
      billingNote: "Billed monthly",
      description: "Most popular for true fans",
      features: [
        "All live streams",
        "Full game replays",
        "All highlights",
        "Community forum access",
        "Ad-free experience",
        "Exclusive content",
        "HD streaming",
        "Multi-device access",
      ],
      notIncluded: [],
      cta: "Subscribe to Premium",
      popular: true,
    },
    {
      id: "annual",
      name: "Annual",
      price: "$129.99",
      priceValue: 129.99,
      period: "per year",
      billingNote: "Billed annually",
      description: "Best value - Save 2 months",
      features: [
        "Everything in Premium",
        "Save $20/year",
        "Priority support",
        "Early access to content",
        "Exclusive merchandise discounts",
        "VIP community badge",
      ],
      notIncluded: [],
      cta: "Subscribe to Annual",
      popular: false,
    },
  ];

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  const faqs = [
    {
      question: "What's the difference between Free and Premium plans?",
      answer:
        "Free plan gives you basic access to highlights and community features. Premium unlocks all live streams, full game replays, HD quality, ad-free experience, and exclusive content.",
    },
    {
      question: "Can I switch between monthly and yearly billing?",
      answer:
        "Yes! You can switch between monthly and annual billing anytime. When you switch to annual, you'll save the equivalent of 2 months compared to monthly billing.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept PayPal and all major credit/debit cards through Helcim secure payment processing.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes! You can cancel your subscription at any time from your account settings. Your access will continue until the end of your billing period.",
    },
    {
      question: "Is there a refund policy?",
      answer:
        "We offer a 7-day money-back guarantee for first-time subscribers. If you're not satisfied, contact support within 7 days for a full refund.",
    },
    {
      question: "Can I watch on multiple devices?",
      answer:
        "Premium and Annual plans allow streaming on up to 2 devices simultaneously. Accounts found accessing from more than 2 devices may be restricted.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Mets Fan Subscription Plans - Premium Access | MetsXMFanZone</title>
        <meta
          name="description"
          content="Choose your MetsXMFanZone plan. Get unlimited access to live Mets streams, game replays, exclusive content, and more. Start your free trial today."
        />
        <meta
          name="keywords"
          content="Mets subscription, Mets premium, baseball streaming plans, Mets fan membership, live stream subscription"
        />
        <link rel="canonical" href="https://www.metsxmfanzone.com/plans" />
      </Helmet>
      <Navigation />
      <main className="pt-16">
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
                Choose Your Plan
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                Get unlimited access to live games, replays, highlights, and exclusive Mets content
              </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
              {/* Plans Selection - Left Side */}
              <div className="lg:col-span-3 space-y-4">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    } ${plan.popular ? "relative" : ""}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-2 left-4 bg-primary text-primary-foreground text-xs">
                        MOST POPULAR
                      </Badge>
                    )}
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                              selectedPlan === plan.id
                                ? "border-primary bg-primary"
                                : "border-muted-foreground"
                            }`}
                          >
                            {selectedPlan === plan.id && (
                              <Check className="w-3 h-3 text-primary-foreground" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground text-base sm:text-lg">
                              {plan.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                            {plan.billingNote && (
                              <p className="text-xs text-muted-foreground mt-1">{plan.billingNote}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg sm:text-xl font-bold text-foreground">{plan.price}</p>
                          <p className="text-xs text-muted-foreground">{plan.period}</p>
                        </div>
                      </div>

                      {/* Expandable Features */}
                      {selectedPlan === plan.id && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {plan.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="text-sm text-foreground">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Checkout Summary - Right Side */}
              <div className="lg:col-span-2">
                <Card className="sticky top-24 border-border bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-foreground">MetsXMFanZone</CardTitle>
                      <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                        <CollapsibleTrigger className="text-sm text-primary flex items-center gap-1 hover:underline">
                          Details
                          {showDetails ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </CollapsibleTrigger>
                      </Collapsible>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedPlanData ? (
                      <>
                        {/* Plan Summary */}
                        <div className="text-center py-2">
                          <p className="text-sm text-muted-foreground">Subscribe to {selectedPlanData.name}</p>
                          <p className="text-3xl font-bold text-foreground mt-1">
                            {selectedPlanData.price}
                            <span className="text-base font-normal text-muted-foreground ml-1">
                              {selectedPlanData.period}
                            </span>
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedPlanData.name} Plan ({selectedPlanData.billingNote || "One-time"})
                          </p>
                        </div>

                        {/* Expandable Details */}
                        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                          <CollapsibleContent className="space-y-3">
                            <div className="border-t border-border pt-3 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-foreground">{selectedPlanData.name}</span>
                                <span className="text-foreground">{selectedPlanData.price}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {selectedPlanData.billingNote || "Free forever"}
                              </p>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Promo Code Section */}
                        <div className="border-t border-border pt-3">
                          {appliedPromo ? (
                            <div className="flex items-center justify-between bg-primary/10 p-2 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium text-primary">{appliedPromo}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRemovePromo}
                                className="h-6 w-6 p-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : showPromoCode ? (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Enter code"
                                  value={promoCode}
                                  onChange={(e) => setPromoCode(e.target.value)}
                                  className="h-9 text-sm"
                                />
                                <Button size="sm" onClick={handleApplyPromo} className="h-9 px-3">
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
                              className="w-full justify-start text-sm"
                            >
                              <Tag className="w-4 h-4 mr-2" />
                              Add promotion code
                            </Button>
                          )}
                        </div>

                        {/* Subtotal */}
                        <div className="border-t border-border pt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="text-foreground">{selectedPlanData.price}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-base">
                            <span className="text-foreground">Total due today</span>
                            <span className="text-foreground">{selectedPlanData.price}</span>
                          </div>
                        </div>

                        {/* Payment Method */}
                        <div className="border-t border-border pt-3">
                          <p className="text-sm font-medium text-foreground mb-3">Payment Method</p>
                          <RadioGroup
                            value={paymentMethod}
                            onValueChange={(value) => setPaymentMethod(value as "paypal" | "helcim")}
                            className="space-y-2"
                          >
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer">
                              <RadioGroupItem value="paypal" id="paypal" />
                              <Label htmlFor="paypal" className="text-sm cursor-pointer flex-1">
                                PayPal
                              </Label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer">
                              <RadioGroupItem value="helcim" id="helcim" />
                              <Label htmlFor="helcim" className="text-sm cursor-pointer flex-1">
                                Credit/Debit Card
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Subscribe Button */}
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={() => {
                            if (selectedPlanData.id === "free") {
                              navigate("/auth");
                            } else {
                              handleSubscribe(selectedPlanData.id);
                            }
                          }}
                        >
                          {selectedPlanData.cta}
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Select a plan to continue</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* FAQs Section - Clean accordion style like the screenshot */}
            <div className="mt-12 sm:mt-16">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-6 sm:mb-8">
                Frequently Asked Questions
              </h2>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full space-y-0">
                  {faqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`item-${index}`}
                      className="border-b border-border py-1"
                    >
                      <AccordionTrigger className="text-left text-base sm:text-lg font-medium text-foreground hover:no-underline py-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm sm:text-base pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Plans;
