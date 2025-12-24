import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const UpdateProfile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Update Profile Information - MetsXMFanZone Help</title>
        <meta name="description" content="Learn how to update your profile information, avatar, and account settings on MetsXMFanZone." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/help/update-profile" />
      </Helmet>
      <Navigation />
      <main className="pt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
          <Link to="/help-center" className="inline-flex items-center text-primary hover:underline mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help Center
          </Link>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl text-primary">Update Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg prose-slate dark:prose-invert max-w-none space-y-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-primary border-b pb-3">Accessing Your Profile</h2>
                <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-muted-foreground leading-relaxed mb-4">To update your profile information:</p>
                  <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                    <li>Log in to your MetsXMFanZone account</li>
                    <li>Click on your profile icon or name in the top right</li>
                    <li>Select "Dashboard" or "Settings"</li>
                    <li>Navigate to the profile section</li>
                  </ol>
                </div>
              </div>
              
              <div className="space-y-6 pt-6 border-t">
                <h2 className="text-2xl font-bold text-primary">Profile Information</h2>
                
                <div className="grid gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                    <h3 className="text-xl font-semibold text-primary mb-2">Full Name</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2"><span className="text-primary">•</span><span>Update your display name</span></li>
                      <li className="flex items-start gap-2"><span className="text-primary">•</span><span>This appears on all your posts and comments</span></li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                    <h3 className="text-xl font-semibold text-primary mb-2">Email Address</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2"><span className="text-primary">•</span><span>Update your email for account notifications</span></li>
                      <li className="flex items-start gap-2"><span className="text-primary">•</span><span>Used for password recovery</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UpdateProfile;