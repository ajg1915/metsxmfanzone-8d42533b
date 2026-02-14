import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CheckoutModal from "@/components/CheckoutModal";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

const Plans = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { tier, loading: subscriptionLoading } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  
  // Check if user must select a plan (coming from signup)
  const pendingPlan = localStorage.getItem("pending_signup_plan");
  const mustSelectPlan = searchParams.get("required") === "true" || !!pendingPlan;
  const [hasPlanSelected, setHasPlanSelected] = useState(false);
  
  // Block navigation if plan selection is required
  useEffect(() => {
    if (mustSelectPlan && !hasPlanSelected) {
      // Prevent back navigation
      const handlePopState = (e: PopStateEvent) => {
        e.preventDefault();
        window.history.pushState(null, "", window.location.href);
      };
      
      window.history.pushState(null, "", window.location.href);
      window.addEventListener("popstate", handlePopState);
      
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [mustSelectPlan, hasPlanSelected]);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    
    if (planId === "free") {
      // Free plan - mark as selected and redirect to home
      localStorage.removeItem("pending_signup_plan");
      setHasPlanSelected(true);
      navigate("/");
      return;
    }
    
    setCheckoutOpen(true);
  };
  
  const handleCheckoutClose = (open: boolean) => {
    setCheckoutOpen(open);
    
    // If checkout was completed successfully, clear the pending plan
    if (!open && selectedPlan && selectedPlan !== "free") {
      // Check if subscription was created
      if (tier === "premium" || tier === "annual") {
        localStorage.removeItem("pending_signup_plan");
        setHasPlanSelected(true);
      }
    }
  };

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      priceValue: 0,
      period: "30 days",
      description: "Try it free for February & March only",
      trialNote: "Free access expires after 30 days. Upgrade to keep watching!",
      features: ["Limited highlights access", "Community forum access", "Game schedules", "Free Spring Training Live"],
      notIncluded: ["Live streaming", "Full game replays", "Exclusive content", "Ad-free experience"],
      cta: "Start Free (30 Days)",
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
        "We offer a 7-day money-back guarantee for first-time subscribers. This trial applies only to the regular season (not Spring Training or off-season). If you're not satisfied, contact support within 7 days for a full refund.",
    },
    {
      question: "How long does the Free plan last?",
      answer:
        "The Free plan is available for 30 days during February and March only. After that, you'll need to upgrade to a paid plan (Premium or Annual) to continue accessing content.",
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
        <title>Mets Fan Pricing - Premium Access | MetsXMFanZone</title>
        <meta
          name="description"
          content="Choose your MetsXMFanZone membership. Get unlimited access to live Mets streams, game replays, exclusive content, and more. Start your free trial today."
        />
        <meta
          name="keywords"
          content="Mets subscription, Mets premium, baseball streaming pricing, Mets fan membership, live stream subscription"
        />
        <link rel="canonical" href="https://www.metsxmfanzone.com/pricing" />
      </Helmet>
      {!mustSelectPlan && <Navigation />}
      <main className={mustSelectPlan ? "pt-8" : "pt-12"}>
        <section className="py-8 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            {/* Required Plan Selection Banner */}
            {mustSelectPlan && (
              <div className="mb-8 bg-primary/10 border border-primary/30 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Please Select a Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    To complete your account setup, please select a subscription plan below. You can choose the Free plan if you want basic access, or upgrade to Premium for full features.
                  </p>
                </div>
              </div>
            )}
            
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                Choose Your Plan
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Get unlimited access to live games, replays, highlights, and exclusive Mets content
              </p>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative transition-all hover:shadow-lg ${
                    plan.popular ? "border-primary ring-2 ring-primary/20" : "border-border"
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                      MOST POPULAR
                    </Badge>
                  )}
                  <CardContent className="p-6 pt-8">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                      <div className="mb-2">
                        <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                        <span className="text-muted-foreground ml-1">/{plan.period === "30 days" ? "30 days" : plan.period.replace("per ", "")}</span>
                      </div>
                      {plan.billingNote && (
                        <p className="text-xs text-muted-foreground">{plan.billingNote}</p>
                      )}
                      {(plan as any).trialNote && (
                        <p className="text-[10px] text-primary font-medium mt-1">{(plan as any).trialNote}</p>
                      )}
                    </div>

                    <Button
                      className="w-full mb-6"
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleSelectPlan(plan.id)}
                    >
                      {plan.cta}
                    </Button>

                    <div className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* FAQs Section */}
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8">
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border-b border-border"
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
        </section>
      </main>
      {!mustSelectPlan && <Footer />}

      {/* Checkout Modal */}
      <CheckoutModal
        open={checkoutOpen}
        onOpenChange={handleCheckoutClose}
        plan={selectedPlanData || null}
      />
    </div>
  );
};

export default Plans;
