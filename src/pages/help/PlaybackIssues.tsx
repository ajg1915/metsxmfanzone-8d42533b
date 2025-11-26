import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PlaybackIssues = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Troubleshooting Playback Issues - MetsXMFanZone Help</title>
        <meta name="description" content="Fix common video playback issues on MetsXMFanZone including buffering, loading errors, and quality problems." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/help/playback-issues" />
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
              <CardTitle className="text-2xl sm:text-3xl">Troubleshooting Playback Issues</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg prose-slate dark:prose-invert max-w-none space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground border-b pb-3">Common Issues and Solutions</h2>
              </div>
              
              <div className="space-y-4 p-5 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
                <h3 className="text-xl font-semibold text-foreground">Video Won't Load or Start</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">If your video won't play:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Refresh the page</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Clear your browser cache and cookies</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Try a different browser</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Disable browser extensions or ad blockers</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Check if your subscription is active</span></li>
                </ul>
              </div>
              
              <div className="space-y-4 p-5 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
                <h3 className="text-xl font-semibold text-foreground">Constant Buffering</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">To reduce buffering issues:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Lower the video quality setting (see <Link to="/help/video-quality" className="text-primary hover:underline font-medium">Video Quality Settings</Link>)</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Close other apps and browser tabs using bandwidth</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Move closer to your WiFi router</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Restart your router/modem</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Test your internet speed (minimum 5 Mbps recommended)</span></li>
                </ul>
              </div>
              
              <div className="space-y-4 p-5 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                <h3 className="text-xl font-semibold text-foreground">Poor Video Quality</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">If video appears blurry or pixelated:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Manually select a higher quality setting (720p or 1080p)</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Check your internet connection speed</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Ensure quality setting isn't stuck on "Auto" with slow connection</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Try watching at a different time when network traffic is lower</span></li>
                </ul>
              </div>
              
              <div className="space-y-4 p-5 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
                <h3 className="text-xl font-semibold text-foreground">Audio/Video Out of Sync</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">If audio and video don't match:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Pause and resume the video</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Refresh the page</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Try a different browser</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Clear browser cache</span></li>
                </ul>
              </div>
              
              <div className="space-y-4 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                <h3 className="text-xl font-semibold text-foreground">Error Messages</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">Common error codes and fixes:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span><strong className="text-foreground">"Video unavailable":</strong> Stream may have ended or subscription required</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span><strong className="text-foreground">"Playback error":</strong> Try refreshing or different browser</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span><strong className="text-foreground">"Network error":</strong> Check internet connection</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span><strong className="text-foreground">"Too many devices":</strong> You've exceeded the 2-device limit</span></li>
                </ul>
              </div>
              
              <div className="space-y-6 pt-6 border-t">
                <h2 className="text-2xl font-bold text-foreground">Browser Compatibility</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">Recommended browsers for best performance:</p>
                <div className="grid gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-3">
                    <span className="text-2xl">🌐</span>
                    <span className="text-muted-foreground">Google Chrome (latest version)</span>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-3">
                    <span className="text-2xl">🦊</span>
                    <span className="text-muted-foreground">Mozilla Firefox (latest version)</span>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-3">
                    <span className="text-2xl">🧭</span>
                    <span className="text-muted-foreground">Safari (latest version for Mac/iOS)</span>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-3">
                    <span className="text-2xl">📐</span>
                    <span className="text-muted-foreground">Microsoft Edge (latest version)</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-2xl font-bold text-foreground">System Requirements</h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">✓</span><span><strong className="text-foreground">Internet:</strong> Minimum 5 Mbps download speed</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">✓</span><span><strong className="text-foreground">Browser:</strong> Latest version recommended</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">✓</span><span><strong className="text-foreground">JavaScript:</strong> Must be enabled</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">✓</span><span><strong className="text-foreground">Cookies:</strong> Must be enabled</span></li>
                </ul>
              </div>
              
              <div className="space-y-4 pt-6 border-t bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-foreground">Still Having Issues?</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">If problems persist after trying these solutions, please <Link to="/contact" className="text-primary hover:underline font-medium">contact support</Link> with:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Description of the issue</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Browser and device information</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Error messages (if any)</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Your subscription plan</span></li>
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

export default PlaybackIssues;