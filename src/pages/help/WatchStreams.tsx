import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const WatchStreams = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Watching Live Streams - MetsXMFanZone Help</title>
        <meta name="description" content="Guide to watching live Mets game streams on MetsXMFanZone including device requirements and streaming tips." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/help/watch-streams" />
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
              <CardTitle className="text-2xl sm:text-3xl">Watching Live Streams</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <h2>Requirements</h2>
              <p>To watch live streams on MetsXMFanZone:</p>
              <ul>
                <li>Active Premium ($9.99/month) or Annual ($99.99/year) subscription</li>
                <li>Stable internet connection (minimum 5 Mbps recommended)</li>
                <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
              </ul>
              
              <h2>How to Watch</h2>
              <h3>Step 1: Navigate to Live Page</h3>
              <p>Click "Live" in the main navigation menu to access the live streaming section.</p>
              
              <h3>Step 2: Select a Stream</h3>
              <p>Browse available live streams and click on the stream you want to watch.</p>
              
              <h3>Step 3: Enjoy the Stream</h3>
              <p>The video player will load automatically. Use the controls to adjust volume, quality, and fullscreen mode.</p>
              
              <h2>Device Restrictions</h2>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="font-semibold text-yellow-800 dark:text-yellow-200">Important:</p>
                <p className="text-yellow-700 dark:text-yellow-300">Users who access live streams from more than 2 devices or accounts will face automatic penalties including account restriction, plan downgrade, or account deactivation without warning.</p>
              </div>
              
              <h2>Supported Devices</h2>
              <ul>
                <li>Desktop computers (Windows, Mac, Linux)</li>
                <li>Tablets (iPad, Android tablets)</li>
                <li>Mobile phones (iPhone, Android)</li>
                <li>Smart TVs with web browsers</li>
              </ul>
              
              <h2>Troubleshooting</h2>
              <p>If you experience issues with streaming, see our <Link to="/help/playback-issues" className="text-primary hover:underline">Troubleshooting Playback Issues</Link> guide.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WatchStreams;
