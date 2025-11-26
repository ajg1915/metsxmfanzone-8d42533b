import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const OfflineViewing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Download and Offline Viewing - MetsXMFanZone Help</title>
        <meta name="description" content="Learn about offline viewing options and content availability on MetsXMFanZone." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/help/offline-viewing" />
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
              <CardTitle className="text-2xl sm:text-3xl">Download and Offline Viewing</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <h2>Offline Viewing Options</h2>
              <p>MetsXMFanZone offers limited offline viewing capabilities through our Progressive Web App (PWA).</p>
              
              <h2>Installing the PWA</h2>
              <p>Install MetsXMFanZone as an app on your device for the best offline experience:</p>
              
              <h3>Mobile (iOS/Android)</h3>
              <ol>
                <li>Visit metsxmfanzone.com in your mobile browser</li>
                <li>Look for the "Add to Home Screen" or "Install App" prompt</li>
                <li>Follow the installation instructions</li>
                <li>Access the app from your home screen</li>
              </ol>
              
              <h3>Desktop (Windows/Mac/Linux)</h3>
              <ol>
                <li>Visit metsxmfanzone.com in Chrome, Edge, or other compatible browser</li>
                <li>Look for the install icon in the address bar</li>
                <li>Click "Install" to add to your desktop</li>
                <li>Launch from your applications menu</li>
              </ol>
              
              <h2>What Works Offline</h2>
              <p>Once installed, certain features work with limited or no internet:</p>
              <ul>
                <li>Previously loaded pages and content</li>
                <li>Cached images and media</li>
                <li>Basic navigation structure</li>
              </ul>
              
              <h2>What Requires Internet</h2>
              <ul>
                <li>Live streams and video playback</li>
                <li>Real-time updates and new content</li>
                <li>Community posts and comments</li>
                <li>Account authentication</li>
              </ul>
              
              <h2>Download Limitations</h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="font-semibold text-blue-800 dark:text-blue-200">Note:</p>
                <p className="text-blue-700 dark:text-blue-300">Due to licensing restrictions and streaming agreements, direct video downloads are not available. All video content must be streamed online with an active internet connection.</p>
              </div>
              
              <h2>Improving Offline Experience</h2>
              <p>To make the most of offline capabilities:</p>
              <ul>
                <li>Browse pages while online to cache content</li>
                <li>Ensure you have a stable connection when loading new content</li>
                <li>Keep the PWA updated for best performance</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OfflineViewing;
