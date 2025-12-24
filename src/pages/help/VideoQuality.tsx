import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
const VideoQuality = () => {
  return <div className="min-h-screen bg-background">
      <Helmet>
        <title>Video Quality Settings - MetsXMFanZone Help</title>
        <meta name="description" content="Learn how to adjust video quality settings for optimal streaming on MetsXMFanZone based on your internet speed." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/help/video-quality" />
      </Helmet>
      <Navigation />
      <main className="pt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl text-primary">
          <Link to="/help-center" className="inline-flex items-center text-primary hover:underline mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help Center
          </Link>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl text-primary">Video Quality Settings</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg prose-slate dark:prose-invert max-w-none space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-primary border-b pb-3">Available Quality Options</h2>
                <p className="text-muted-foreground leading-relaxed">MetsXMFanZone streams are available in multiple quality settings:</p>
              </div>
              
              <div className="grid gap-6">
                <div className="space-y-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                  <h3 className="text-xl font-semibold text-primary">Auto (Recommended)</h3>
                  <p className="text-muted-foreground leading-relaxed">Automatically adjusts quality based on your internet connection speed for optimal viewing without buffering.</p>
                </div>
                
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-xl font-semibold text-primary">1080p (Full HD)</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Best quality available</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Requires minimum 8 Mbps connection</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Recommended for high-speed broadband</span></li>
                  </ul>
                </div>
                
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-xl font-semibold text-primary">720p (HD)</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Good quality with lower bandwidth</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Requires minimum 5 Mbps connection</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Recommended for standard broadband</span></li>
                  </ul>
                </div>
                
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-xl font-semibold text-primary">480p (SD)</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Standard definition quality</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Requires minimum 2.5 Mbps connection</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Recommended for slower connections or mobile data</span></li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-6 pt-6 border-t">
                <h2 className="text-2xl font-bold text-primary">How to Change Quality</h2>
                <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
                  <li>Click on the video player while watching a stream</li>
                  <li>Look for the settings/gear icon in the player controls</li>
                  <li>Click on "Quality" option</li>
                  <li>Select your preferred quality level</li>
                </ol>
              </div>
              
              <div className="space-y-6 pt-6 border-t">
                <h2 className="text-2xl font-bold text-primary">Recommended Settings</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left p-3 font-semibold text-foreground">Connection Type</th>
                        <th className="text-left p-3 font-semibold text-foreground">Recommended Quality</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border"><td className="p-3">Fiber/High-speed Broadband</td><td className="p-3">Auto or 1080p</td></tr>
                      <tr className="border-b border-border"><td className="p-3">Standard Broadband</td><td className="p-3">720p</td></tr>
                      <tr className="border-b border-border"><td className="p-3">Mobile Data/Slower Connections</td><td className="p-3">480p</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-2xl font-bold text-primary">Troubleshooting Buffering</h2>
                <p className="text-muted-foreground leading-relaxed">If you experience buffering issues, try lowering the quality setting or see our <Link to="/help/playback-issues" className="text-primary hover:underline font-medium">Troubleshooting Playback Issues</Link> guide.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>;
};
export default VideoQuality;