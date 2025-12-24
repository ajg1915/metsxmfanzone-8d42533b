import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const FollowFans = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Following Other Fans - MetsXMFanZone Help</title>
        <meta name="description" content="Learn how to connect with and follow other Mets fans on MetsXMFanZone." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/help/follow-fans" />
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
              <CardTitle className="text-2xl sm:text-3xl text-primary">Following Other Fans</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg prose-slate dark:prose-invert max-w-none space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-primary border-b pb-3">Discovering Fans</h2>
                <p className="text-muted-foreground leading-relaxed">Connect with fellow Mets supporters on MetsXMFanZone:</p>
              </div>
              
              <div className="grid gap-6">
                <div className="space-y-3 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                  <h3 className="text-xl font-semibold text-primary">In the Community Feed</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Browse posts in the <Link to="/community" className="text-primary hover:underline font-medium">Community</Link> section</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Click on usernames to view profiles</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>See posts, comments, and activity</span></li>
                  </ul>
                </div>
                
                <div className="space-y-3 p-5 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
                  <h3 className="text-xl font-semibold text-primary">In Comments</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Engage with fans who comment on blog posts</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Reply to comments you find interesting</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Check out profiles of active community members</span></li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-6 pt-6 border-t">
                <h2 className="text-2xl font-bold text-primary">Following Users</h2>
                <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-muted-foreground leading-relaxed mb-4">To follow another fan:</p>
                  <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                    <li>Navigate to their profile</li>
                    <li>Click the "Follow" button</li>
                    <li>You'll now see their activity in your feed</li>
                  </ol>
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-2xl font-bold text-primary">Benefits of Following</h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>See posts from fans you follow in your personalized feed</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>Get notifications about their activity</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>Build a network of like-minded Mets supporters</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>Participate in focused discussions</span></li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FollowFans;