import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building2, Users, TrendingUp, Target } from "lucide-react";

const BusinessPartner = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    industry: "",
    description: "",
    goals: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Partnership request submitted!",
        description: "Our team will review your application and contact you within 3-5 business days.",
      });
      setFormData({
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        website: "",
        industry: "",
        description: "",
        goals: "",
      });
      setIsLoading(false);
    }, 1500);
  };

  const benefits = [
    {
      icon: Users,
      title: "Reach Thousands of Fans",
      description: "Connect with our engaged community of passionate Mets fans",
    },
    {
      icon: TrendingUp,
      title: "Boost Your Brand",
      description: "Increase visibility and brand awareness in the sports community",
    },
    {
      icon: Target,
      title: "Targeted Marketing",
      description: "Reach your ideal audience with precision marketing opportunities",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Building2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Business Partnership
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Partner with MetsXMFanZone to reach thousands of engaged baseball fans
            </p>
          </div>

          {/* Benefits Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center text-foreground mb-8">
              Why Partner With Us?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
                      <benefit.icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                    <CardDescription>{benefit.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          {/* Application Form */}
          <section className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Partnership Application</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll review your partnership proposal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="companyName" className="text-sm font-medium mb-2 block">
                        Company Name *
                      </label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="contactName" className="text-sm font-medium mb-2 block">
                        Contact Name *
                      </label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="text-sm font-medium mb-2 block">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="text-sm font-medium mb-2 block">
                        Phone Number *
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="website" className="text-sm font-medium mb-2 block">
                        Website
                      </label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://"
                      />
                    </div>
                    <div>
                      <label htmlFor="industry" className="text-sm font-medium mb-2 block">
                        Industry *
                      </label>
                      <Input
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        required
                        placeholder="e.g., Sports Equipment, Food & Beverage"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="text-sm font-medium mb-2 block">
                      Company Description *
                    </label>
                    <Textarea
                      id="description"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      placeholder="Tell us about your company and what you offer"
                    />
                  </div>

                  <div>
                    <label htmlFor="goals" className="text-sm font-medium mb-2 block">
                      Partnership Goals *
                    </label>
                    <Textarea
                      id="goals"
                      rows={4}
                      value={formData.goals}
                      onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                      required
                      placeholder="What are you hoping to achieve through this partnership?"
                    />
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Partnership Requirements:</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Established business with relevant products/services</li>
                      <li>• Alignment with sports and entertainment values</li>
                      <li>• Commitment to quality customer experience</li>
                      <li>• Marketing budget for promotional activities</li>
                    </ul>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? "Submitting Application..." : "Submit Partnership Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessPartner;
