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
      <main className="pt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
          <Link to="/help-center" className="inline-flex items-center text-primary hover:underline mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help Center
          </Link>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl text-primary">Download and Offline Viewing</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg prose-slate dark:prose-invert max-w-none space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-primary border-b pb-3">Offline Viewing Options</h2>
                <p className="text-muted-foreground leading-relaxed">MetsXMFanZone offers limited offline viewing capabilities through our Progressive Web App (PWA).</p>
              </div>
              
              <div className="space-y-6 pt-6 border-t">
                <h2 className="text-2xl font-bold text-primary">Installing the PWA</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">Install MetsXMFanZone as an app on your device for the best offline experience:</p>
                
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-xl font-semibold text-primary">Mobile (iOS/Android)</h3>
                  <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                    <li>Visit metsxmfanzone.com in your mobile browser</li>
                    <li>Look for the "Add to Home Screen" or "Install App" prompt</li>
                    <li>Follow the installation instructions</li>
                    <li>Access the app from your home screen</li>
                  </ol>
                </div>
                
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-xl font-semibold text-primary">Desktop (Windows/Mac/Linux)</h3>
                  <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                    <li>Visit metsxmfanzone.com in Chrome, Edge, or other compatible browser</li>
                    <li>Look for the install icon in the address bar</li>
                    <li>Click "Install" to add to your desktop</li>
                    <li>Launch from your applications menu</li>
                  </ol>
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-2xl font-bold text-primary">What Works Offline</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">Once installed, certain features work with limited or no internet:</p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-green-500 font-bold">✓</span><span>Previously loaded pages and content</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500 font-bold">✓</span><span>Cached images and media</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500 font-bold">✓</span><span>Basic navigation structure</span></li>
                </ul>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-2xl font-bold text-primary">What Requires Internet</h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-orange-500 font-bold">!</span><span>Live streams and video playback</span></li>
                  <li className="flex items-start gap-2"><span className="text-orange-500 font-bold">!</span><span>Real-time updates and new content</span></li>
                  <li className="flex items-start gap-2"><span className="text-orange-500 font-bold">!</span><span>Community posts and comments</span></li>
                  <li className="flex items-start gap-2"><span className="text-orange-500 font-bold">!</span><span>Account authentication</span></li>
                </ul>
              </div>
              
              <div className="space-y-4 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-l-4 border-blue-500 mt-6">
                <h2 className="text-xl font-bold text-blue-900 dark:text-blue-200">Download Limitations</h2>
                <p className="text-blue-800 dark:text-blue-300 leading-relaxed"><strong>Note:</strong> Due to licensing restrictions and streaming agreements, direct video downloads are not available. All video content must be streamed online with an active internet connection.</p>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-2xl font-bold text-primary">Improving Offline Experience</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">To make the most of offline capabilities:</p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Browse pages while online to cache content</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Ensure you have a stable connection when loading new content</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Keep the PWA updated for best performance</span></li>
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

export default OfflineViewing;
