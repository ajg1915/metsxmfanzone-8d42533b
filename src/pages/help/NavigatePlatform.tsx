import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const NavigatePlatform = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Navigating the Platform - MetsXMFanZone Help</title>
        <meta name="description" content="Learn how to navigate MetsXMFanZone and discover all features including live streams, community, blog, and more." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/help/navigate-platform" />
      </Helmet>
      <Navigation />
      <main className="pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
          <Link to="/help-center" className="inline-flex items-center text-primary hover:underline mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help Center
          </Link>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl text-primary">Navigating the Platform</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg prose-slate dark:prose-invert max-w-none space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-primary border-b pb-3">Main Navigation Menu</h2>
                <p className="text-muted-foreground leading-relaxed">Access key sections from the navigation bar at the top of every page:</p>
              </div>
              
              <div className="grid gap-6">
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-xl font-semibold text-primary">Home</h3>
                  <p className="text-muted-foreground leading-relaxed">Your starting point featuring latest updates, stories, news tracker, and upcoming streams.</p>
                </div>
                
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-xl font-semibold text-primary">Live</h3>
                  <p className="text-muted-foreground leading-relaxed">Watch live streams of Mets games, analysis, and special events. Available for Premium and Annual plan members.</p>
                </div>
                
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-xl font-semibold text-primary">Spring Training</h3>
                  <p className="text-muted-foreground leading-relaxed">Access exclusive spring training content, game previews, and matchup information.</p>
                </div>
                
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-xl font-semibold text-primary">Community</h3>
                  <p className="text-muted-foreground leading-relaxed">Connect with fellow Mets fans, share posts, view business advertisements, and participate in discussions.</p>
                </div>
                
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-xl font-semibold text-primary">Blog</h3>
                  <p className="text-muted-foreground leading-relaxed">Read the latest articles, analysis, and news about the New York Mets.</p>
                </div>
                
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-xl font-semibold text-primary">Gallery</h3>
                  <p className="text-muted-foreground leading-relaxed">Browse photos and video highlights from games and events.</p>
                </div>
                
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-xl font-semibold text-primary">Podcast</h3>
                  <p className="text-muted-foreground leading-relaxed">Listen to podcast episodes and catch live podcast shows.</p>
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-2xl font-bold text-primary">Mobile Features</h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong className="text-foreground">Pull to Refresh:</strong> Drag down on any page to refresh content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong className="text-foreground">Hamburger Menu:</strong> Tap the menu icon to access all navigation links</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong className="text-foreground">App Install:</strong> Add MetsXMFanZone to your home screen for a native app experience</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-2xl font-bold text-primary">Dashboard</h2>
                <p className="text-muted-foreground leading-relaxed">Access your personal dashboard to manage your profile, subscription, and preferences.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NavigatePlatform;
