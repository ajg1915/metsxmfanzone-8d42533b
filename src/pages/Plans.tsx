import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const Plans = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'helcim'>('paypal');

  const handleSubscribe = async (planType: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    try {
      toast({
        title: "Processing...",
        description: "Creating your payment session",
      });

      if (paymentMethod === 'paypal') {
        const { data, error } = await supabase.functions.invoke('create-paypal-order', {
          body: { planType },
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
        const { data, error } = await supabase.functions.invoke('create-helcim-checkout', {
          body: { planType },
        });

        if (error) throw error;

        if (data?.checkoutToken && data?.secretToken) {
          sessionStorage.setItem('helcim_checkout_token', data.checkoutToken);
          sessionStorage.setItem('helcim_secret_token', data.secretToken);
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
      console.error('Error creating payment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for casual fans",
      features: [
        "Limited highlights access",
        "Community forum access",
        "Game schedules",
        "Free Spring Training Live",
      ],
      notIncluded: [
        "Live streaming",
        "Full game replays",
        "Exclusive content",
        "Ad-free experience",
      ],
      cta: "Sign Up Free",
      popular: false,
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "per month",
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
      cta: "Start 7-Day Free Trial",
      popular: true,
    },
    {
      name: "Annual",
      price: "$99.99",
      period: "per year",
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
      cta: "Start Annual Plan",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Mets Fan Subscription Plans - Premium Access | MetsXMFanZone</title>
        <meta name="description" content="Choose your MetsXMFanZone plan. Get unlimited access to live Mets streams, game replays, exclusive content, and more. Start your free trial today." />
        <meta name="keywords" content="Mets subscription, Mets premium, baseball streaming plans, Mets fan membership, live stream subscription" />
        <link rel="canonical" href="https://www.metsxmfanzone.com/plans" />
      </Helmet>
      <Navigation />
      <main className="pt-16">
        <section className="py-8 sm:py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-3 sm:mb-4">
                Choose Your Plan
              </h1>
              <p className="text-sm sm:text-base text-foreground max-w-2xl mx-auto mb-6">
                Get unlimited access to live games, replays, highlights, and exclusive Mets content
              </p>
              
              <Card className="max-w-md mx-auto border-2 border-primary bg-card">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg text-primary">Select Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'paypal' | 'helcim')}>
                    <div className="flex items-center space-x-2 mb-3">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="text-sm sm:text-base cursor-pointer">PayPal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="helcim" id="helcim" />
                      <Label htmlFor="helcim" className="text-sm sm:text-base cursor-pointer">Credit/Debit Card (Helcim)</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {plans.map((plan, index) => (
                <Card 
                  key={index} 
                  className={`border-2 ${plan.popular ? 'border-primary shadow-2xl scale-105' : 'border-primary'} bg-card relative overflow-hidden transition-all hover:shadow-xl`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0">
                      <Badge className="bg-primary text-primary-foreground rounded-none rounded-bl-lg px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
                        MOST POPULAR
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pt-6 sm:pt-8">
                    <CardTitle className="text-lg sm:text-xl md:text-2xl text-primary mb-2">{plan.name}</CardTitle>
                    <div className="mb-3 sm:mb-4">
                      <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-sm sm:text-base text-muted-foreground ml-2">/ {plan.period}</span>
                    </div>
                    <CardDescription className="text-sm sm:text-base text-foreground">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <Button 
                      className="w-full text-sm sm:text-base" 
                      size="lg"
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => {
                        if (plan.name === 'Free') {
                          navigate('/auth');
                        } else {
                          handleSubscribe(plan.name.toLowerCase());
                        }
                      }}
                    >
                      {plan.cta}
                    </Button>
                    
                    <div className="space-y-2 sm:space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-2 sm:gap-3">
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm text-foreground">{feature}</span>
                        </div>
                      ))}
                      {plan.notIncluded.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-2 sm:gap-3 opacity-50">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5"></div>
                          <span className="text-xs sm:text-sm text-muted-foreground line-through">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 sm:mt-16 text-center">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary mb-6 sm:mb-8">Frequently Asked Questions</h2>
              <div className="max-w-3xl mx-auto space-y-4">
                <Card className="border-2 border-primary bg-card text-left">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg text-primary">Can I cancel anytime?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm sm:text-base text-foreground">
                      Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-primary bg-card text-left">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg text-primary">What's included in the free trial?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm sm:text-base text-foreground">
                      The 7-day free trial gives you full access to all Premium features. No credit card required to start.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary bg-card text-left">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg text-primary">Can I watch on multiple devices?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm sm:text-base text-foreground">
                      Yes! Premium and Annual plans allow streaming on up to 3 devices simultaneously.
                    </p>
                  </CardContent>
                </Card>
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