import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OnboardingWalkthrough from "@/components/OnboardingWalkthrough";
import NotificationSettings from "@/components/NotificationSettings";
import { Badge } from "@/components/ui/badge";
import { User, CreditCard, Calendar, ArrowUpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userPlan, setUserPlan] = useState<"free" | "premium" | "annual">("free");
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("active");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?mode=login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        // Fetch subscription
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!subError && subData) {
          setUserPlan(subData.plan_type as "free" | "premium" | "annual");
          setSubscriptionStatus(subData.status);
          if (subData.end_date) {
            setSubscriptionEndDate(new Date(subData.end_date));
          }
        }

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (!profileError && profileData) {
          setFullName(profileData.full_name || "");
          setAvatarUrl(profileData.avatar_url || "");
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          avatar_url: avatarUrl 
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setProfileDialogOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <OnboardingWalkthrough onComplete={() => {}} />
      <Navigation />
      <main className="pt-16">
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="mb-8">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-2">
                Welcome Back!
              </h1>
              <p className="text-foreground">
                Manage your account and subscription
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* User Profile Card */}
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-foreground">{user.email}</p>
                  </div>
                  {fullName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="text-foreground">{fullName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="text-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                          Update your profile information below.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="avatarUrl">Avatar URL</Label>
                          <Input
                            id="avatarUrl"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="https://example.com/avatar.jpg"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setProfileDialogOpen(false)}
                          disabled={savingProfile}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSaveProfile}
                          disabled={savingProfile}
                        >
                          {savingProfile ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Current Plan Card */}
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <CreditCard className="w-5 h-5" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={userPlan === "free" ? "secondary" : "default"}>
                        {userPlan.toUpperCase()}
                      </Badge>
                      {userPlan === "free" && (
                        <Badge variant="outline" className="text-xs">
                          Limited Access
                        </Badge>
                      )}
                    </div>
                    <p className="text-foreground font-semibold text-2xl">
                      {userPlan === "free" ? "$0" : userPlan === "premium" ? "$12.99/mo" : "$129.99/yr"}
                    </p>
                  </div>
                  {userPlan === "free" ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Upgrade to Premium for full access to all features
                      </p>
                      <Button 
                        className="w-full gap-2"
                        onClick={() => navigate("/plans")}
                      >
                        <ArrowUpCircle className="w-4 h-4" />
                        Upgrade to Premium
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Next billing: </span>
                        <span className="text-foreground">
                          {subscriptionEndDate ? subscriptionEndDate.toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <Dialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            Manage Subscription
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Subscription Details</DialogTitle>
                            <DialogDescription>
                              Manage your subscription and billing
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Current Plan</Label>
                              <div className="flex items-center gap-2">
                                <Badge variant="default">
                                  {userPlan.toUpperCase()}
                                </Badge>
                                <span className="text-foreground font-semibold">
                                  {userPlan === "premium" ? "$12.99/mo" : "$129.99/yr"}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Status</Label>
                              <div className="flex items-center gap-2">
                                <Badge variant={subscriptionStatus === "active" ? "default" : "secondary"}>
                                  {subscriptionStatus.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Next Billing Date</Label>
                              <p className="text-foreground">
                                {subscriptionEndDate ? subscriptionEndDate.toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                            <div className="pt-4 space-y-2">
                              <Button 
                                className="w-full"
                                onClick={() => {
                                  setSubscriptionDialogOpen(false);
                                  navigate("/plans");
                                }}
                              >
                                Change Plan
                              </Button>
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => setSubscriptionDialogOpen(false)}
                              >
                                Close
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <NotificationSettings />

            {/* Features Access Card */}
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-primary">Your Access</CardTitle>
                <CardDescription>
                  {userPlan === "free" 
                    ? "You're on the free plan with limited features" 
                    : "You have full access to all premium features"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg border-2 ${userPlan !== "free" ? "border-primary bg-primary/10" : "border-muted bg-muted/20"}`}>
                    <h3 className="font-semibold text-foreground mb-2">Live Streams</h3>
                    <p className="text-sm text-muted-foreground">
                      {userPlan === "free" ? "Limited access" : "Full access to all live games"}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg border-2 ${userPlan !== "free" ? "border-primary bg-primary/10" : "border-muted bg-muted/20"}`}>
                    <h3 className="font-semibold text-foreground mb-2">Game Replays</h3>
                    <p className="text-sm text-muted-foreground">
                      {userPlan === "free" ? "Not available" : "Full game replays on demand"}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg border-2 ${userPlan !== "free" ? "border-primary bg-primary/10" : "border-muted bg-muted/20"}`}>
                    <h3 className="font-semibold text-foreground mb-2">Exclusive Content</h3>
                    <p className="text-sm text-muted-foreground">
                      {userPlan === "free" ? "Not available" : "Behind-the-scenes and interviews"}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg border-2 ${userPlan !== "free" ? "border-primary bg-primary/10" : "border-muted bg-muted/20"}`}>
                    <h3 className="font-semibold text-foreground mb-2">Ad-Free</h3>
                    <p className="text-sm text-muted-foreground">
                      {userPlan === "free" ? "Ads supported" : "Enjoy without interruptions"}
                    </p>
                  </div>
                </div>

                {userPlan === "free" && (
                  <div className="mt-6 p-4 bg-primary/5 border-2 border-primary rounded-lg">
                    <p className="text-sm text-foreground mb-3">
                      🎉 <strong>Special Offer:</strong> Start your 7-day free trial of Premium today!
                    </p>
                    <Button 
                      className="w-full md:w-auto"
                      onClick={() => navigate("/plans")}
                    >
                      Start Free Trial
                    </Button>
                  </div>
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

export default Dashboard;
