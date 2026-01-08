import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Radio, Users, Clock, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: Mic,
    title: "Professional Platform",
    description: "Access to our established podcast network and audience"
  },
  {
    icon: Radio,
    title: "Live Streaming",
    description: "Stream live to thousands of engaged Mets fans"
  },
  {
    icon: Users,
    title: "Community Access",
    description: "Connect with passionate fans and fellow podcasters"
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    description: "Choose your own streaming times and format"
  }
];

export default function PodcasterApplication() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    experience: "",
    podcast_topic: "",
    sample_url: "",
    equipment_description: "",
    availability: "",
    social_links: ""
  });

  useEffect(() => {
    if (!authLoading && user) {
      checkExistingApplication();
      // Pre-fill email from user profile
      fetchUserProfile();
    } else if (!authLoading && !user) {
      setCheckingApplication(false);
    }
  }, [user, authLoading]);

  const fetchUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();
    
    if (data) {
      setFormData(prev => ({
        ...prev,
        full_name: data.full_name || "",
        email: data.email || user.email || ""
      }));
    }
  };

  const checkExistingApplication = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("podcaster_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setExistingApplication(data);
    } catch (error) {
      console.error("Error checking application:", error);
    } finally {
      setCheckingApplication(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to submit an application",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!formData.full_name || !formData.email || !formData.podcast_topic) {
      toast({
        title: "Required Fields",
        description: "Please fill in your name, email, and podcast topic",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("podcaster_applications")
        .insert({
          user_id: user.id,
          ...formData
        });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you soon.",
      });
      
      checkExistingApplication();
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Approved</span>;
      case "rejected":
        return <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">Not Approved</span>;
      default:
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">Pending Review</span>;
    }
  };

  if (authLoading || checkingApplication) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Become a Podcaster | MetsXMFanZone</title>
        <meta name="description" content="Join the MetsXMFanZone podcast network. Apply to become a podcaster and share your Mets passion with thousands of fans." />
      </Helmet>
      
      <Navigation />
      
      <main className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Mic className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Join Our Podcast Network</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Become a <span className="text-primary">MetsXM Podcaster</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Share your passion for Mets baseball with our community. Join our lineup of content creators and reach thousands of engaged fans.
            </p>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
          >
            {benefits.map((benefit, index) => (
              <Card key={benefit.title} className="glass-card border-primary/10">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Application Form or Status */}
          {existingApplication ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="glass-card max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>Application Submitted</CardTitle>
                  <CardDescription>
                    Your podcaster application is being reviewed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Status</span>
                    {getStatusBadge(existingApplication.status)}
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Submitted</span>
                    <span className="text-sm">
                      {new Date(existingApplication.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Topic</span>
                    <span className="text-sm">{existingApplication.podcast_topic}</span>
                  </div>
                  {existingApplication.status === "rejected" && (
                    <p className="text-sm text-muted-foreground text-center">
                      You can submit a new application with updated information.
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="glass-card max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Apply to Become a Podcaster</CardTitle>
                  <CardDescription>
                    Fill out the form below to join our podcast network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!user && (
                    <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-sm text-center">
                        Please{" "}
                        <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/auth")}>
                          sign in
                        </Button>{" "}
                        to submit an application
                      </p>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name *</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="podcast_topic">Podcast Topic/Focus *</Label>
                      <Input
                        id="podcast_topic"
                        value={formData.podcast_topic}
                        onChange={(e) => setFormData({ ...formData, podcast_topic: e.target.value })}
                        placeholder="e.g., Game analysis, Player interviews, History of the Mets"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Podcasting/Broadcasting Experience</Label>
                      <Textarea
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        placeholder="Tell us about any previous podcasting or broadcasting experience..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sample_url">Sample Content URL</Label>
                      <Input
                        id="sample_url"
                        type="url"
                        value={formData.sample_url}
                        onChange={(e) => setFormData({ ...formData, sample_url: e.target.value })}
                        placeholder="Link to your existing content (YouTube, SoundCloud, etc.)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="equipment">Equipment Description</Label>
                      <Textarea
                        id="equipment"
                        value={formData.equipment_description}
                        onChange={(e) => setFormData({ ...formData, equipment_description: e.target.value })}
                        placeholder="What equipment do you have for recording/streaming?"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="availability">Availability</Label>
                      <Input
                        id="availability"
                        value={formData.availability}
                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        placeholder="e.g., Weekday evenings, Weekend mornings"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="social_links">Social Media Links</Label>
                      <Textarea
                        id="social_links"
                        value={formData.social_links}
                        onChange={(e) => setFormData({ ...formData, social_links: e.target.value })}
                        placeholder="Twitter, Instagram, YouTube, etc."
                        rows={2}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading || !user}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
}