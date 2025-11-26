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
              <CardTitle className="text-2xl sm:text-3xl">Navigating the Platform</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <h2>Main Navigation Menu</h2>
              <p>Access key sections from the navigation bar at the top of every page:</p>
              
              <h3>Home</h3>
              <p>Your starting point featuring latest updates, stories, news tracker, and upcoming streams.</p>
              
              <h3>Live</h3>
              <p>Watch live streams of Mets games, analysis, and special events. Available for Premium and Annual plan members.</p>
              
              <h3>Spring Training</h3>
              <p>Access exclusive spring training content, game previews, and matchup information.</p>
              
              <h3>Community</h3>
              <p>Connect with fellow Mets fans, share posts, view business advertisements, and participate in discussions.</p>
              
              <h3>Blog</h3>
              <p>Read the latest articles, analysis, and news about the New York Mets.</p>
              
              <h3>Gallery</h3>
              <p>Browse photos and video highlights from games and events.</p>
              
              <h3>Podcast</h3>
              <p>Listen to podcast episodes and catch live podcast shows.</p>
              
              <h2>Mobile Features</h2>
              <ul>
                <li><strong>Pull to Refresh:</strong> Drag down on any page to refresh content</li>
                <li><strong>Hamburger Menu:</strong> Tap the menu icon to access all navigation links</li>
                <li><strong>App Install:</strong> Add MetsXMFanZone to your home screen for a native app experience</li>
              </ul>
              
              <h2>Dashboard</h2>
              <p>Access your personal dashboard to manage your profile, subscription, and preferences.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NavigatePlatform;
