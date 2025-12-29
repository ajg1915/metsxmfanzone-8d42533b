import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OnboardingWalkthrough from "@/components/OnboardingWalkthrough";
import NotificationSettings from "@/components/NotificationSettings";
import PasskeyManager from "@/components/PasskeyManager";
import CreateBusinessAdForm from "@/components/CreateBusinessAdForm";
import { Badge } from "@/components/ui/badge";
import { User, CreditCard, Calendar, ArrowUpCircle, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("active");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPG, PNG, WebP, or GIF image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

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
      <main className="pt-12">
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
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={avatarUrl} alt="Profile avatar" />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {fullName ? fullName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{fullName || "Set your name"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
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
                        {/* Avatar Upload Section */}
                        <div className="space-y-2">
                          <Label>Profile Picture</Label>
                          <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                              <AvatarImage src={avatarUrl} alt="Profile avatar" />
                              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                {fullName ? fullName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarUpload}
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingAvatar}
                                className="w-full"
                              >
                                {uploadingAvatar ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Photo
                                  </>
                                )}
                              </Button>
                              <p className="text-xs text-muted-foreground">
                                JPG, PNG, WebP or GIF. Max 2MB.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
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
                  <div className="pt-2 border-t">
                    <Link 
                      to="/help/return-policy" 
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      View Return Policy
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            <NotificationSettings />
            
            <PasskeyManager />

            <CreateBusinessAdForm userId={user.id} />

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
