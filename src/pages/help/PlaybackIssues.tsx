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
            <CardContent className="prose prose-slate max-w-none">
              <h2>Common Issues and Solutions</h2>
              
              <h3>Video Won't Load or Start</h3>
              <p>If your video won't play:</p>
              <ul>
                <li>Refresh the page</li>
                <li>Clear your browser cache and cookies</li>
                <li>Try a different browser</li>
                <li>Disable browser extensions or ad blockers</li>
                <li>Check if your subscription is active</li>
              </ul>
              
              <h3>Constant Buffering</h3>
              <p>To reduce buffering issues:</p>
              <ul>
                <li>Lower the video quality setting (see <Link to="/help/video-quality" className="text-primary hover:underline">Video Quality Settings</Link>)</li>
                <li>Close other apps and browser tabs using bandwidth</li>
                <li>Move closer to your WiFi router</li>
                <li>Restart your router/modem</li>
                <li>Test your internet speed (minimum 5 Mbps recommended)</li>
              </ul>
              
              <h3>Poor Video Quality</h3>
              <p>If video appears blurry or pixelated:</p>
              <ul>
                <li>Manually select a higher quality setting (720p or 1080p)</li>
                <li>Check your internet connection speed</li>
                <li>Ensure quality setting isn't stuck on "Auto" with slow connection</li>
                <li>Try watching at a different time when network traffic is lower</li>
              </ul>
              
              <h3>Audio/Video Out of Sync</h3>
              <p>If audio and video don't match:</p>
              <ul>
                <li>Pause and resume the video</li>
                <li>Refresh the page</li>
                <li>Try a different browser</li>
                <li>Clear browser cache</li>
              </ul>
              
              <h3>Error Messages</h3>
              <p>Common error codes and fixes:</p>
              <ul>
                <li><strong>"Video unavailable":</strong> Stream may have ended or subscription required</li>
                <li><strong>"Playback error":</strong> Try refreshing or different browser</li>
                <li><strong>"Network error":</strong> Check internet connection</li>
                <li><strong>"Too many devices":</strong> You've exceeded the 2-device limit</li>
              </ul>
              
              <h2>Browser Compatibility</h2>
              <p>Recommended browsers for best performance:</p>
              <ul>
                <li>Google Chrome (latest version)</li>
                <li>Mozilla Firefox (latest version)</li>
                <li>Safari (latest version for Mac/iOS)</li>
                <li>Microsoft Edge (latest version)</li>
              </ul>
              
              <h2>System Requirements</h2>
              <ul>
                <li>Internet: Minimum 5 Mbps download speed</li>
                <li>Browser: Latest version recommended</li>
                <li>JavaScript: Must be enabled</li>
                <li>Cookies: Must be enabled</li>
              </ul>
              
              <h2>Still Having Issues?</h2>
              <p>If problems persist after trying these solutions, please <Link to="/contact" className="text-primary hover:underline">contact support</Link> with:</p>
              <ul>
                <li>Description of the issue</li>
                <li>Browser and device information</li>
                <li>Error messages (if any)</li>
                <li>Your subscription plan</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PlaybackIssues;
