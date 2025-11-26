import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const VideoQuality = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Video Quality Settings - MetsXMFanZone Help</title>
        <meta name="description" content="Learn how to adjust video quality settings for optimal streaming on MetsXMFanZone based on your internet speed." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/help/video-quality" />
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
              <CardTitle className="text-2xl sm:text-3xl">Video Quality Settings</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <h2>Available Quality Options</h2>
              <p>MetsXMFanZone streams are available in multiple quality settings:</p>
              
              <h3>Auto (Recommended)</h3>
              <p>Automatically adjusts quality based on your internet connection speed for optimal viewing without buffering.</p>
              
              <h3>1080p (Full HD)</h3>
              <ul>
                <li>Best quality available</li>
                <li>Requires minimum 8 Mbps connection</li>
                <li>Recommended for high-speed broadband</li>
              </ul>
              
              <h3>720p (HD)</h3>
              <ul>
                <li>Good quality with lower bandwidth</li>
                <li>Requires minimum 5 Mbps connection</li>
                <li>Recommended for standard broadband</li>
              </ul>
              
              <h3>480p (SD)</h3>
              <ul>
                <li>Standard definition quality</li>
                <li>Requires minimum 2.5 Mbps connection</li>
                <li>Recommended for slower connections or mobile data</li>
              </ul>
              
              <h2>How to Change Quality</h2>
              <ol>
                <li>Click on the video player while watching a stream</li>
                <li>Look for the settings/gear icon in the player controls</li>
                <li>Click on "Quality" option</li>
                <li>Select your preferred quality level</li>
              </ol>
              
              <h2>Recommended Settings</h2>
              <table>
                <thead>
                  <tr>
                    <th>Connection Type</th>
                    <th>Recommended Quality</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Fiber/High-speed Broadband</td>
                    <td>Auto or 1080p</td>
                  </tr>
                  <tr>
                    <td>Standard Broadband</td>
                    <td>720p</td>
                  </tr>
                  <tr>
                    <td>Mobile Data/Slower Connections</td>
                    <td>480p</td>
                  </tr>
                </tbody>
              </table>
              
              <h2>Troubleshooting Buffering</h2>
              <p>If you experience buffering issues, try lowering the quality setting or see our <Link to="/help/playback-issues" className="text-primary hover:underline">Troubleshooting Playback Issues</Link> guide.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VideoQuality;
