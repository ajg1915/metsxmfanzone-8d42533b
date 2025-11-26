import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PremiumContent = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Accessing Premium Content - MetsXMFanZone Help</title>
        <meta name="description" content="Learn what's included in premium plans and how to access exclusive MetsXMFanZone content." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/help/premium-content" />
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
              <CardTitle className="text-2xl sm:text-3xl">Accessing Premium Content</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <h2>What's Included in Premium</h2>
              <p>Premium and Annual plan members get access to exclusive content:</p>
              
              <h3>Live Streams</h3>
              <ul>
                <li>Watch all Mets games live</li>
                <li>Pre-game and post-game analysis</li>
                <li>Special live events and Q&A sessions</li>
                <li>Live podcast shows</li>
              </ul>
              
              <h3>Spring Training Content</h3>
              <ul>
                <li>Exclusive spring training game coverage</li>
                <li>Behind-the-scenes content</li>
                <li>Player interviews and insights</li>
              </ul>
              
              <h3>Premium Features</h3>
              <ul>
                <li>HD/Full HD streaming quality</li>
                <li>Access to stream archives and replays</li>
                <li>Ad-free experience</li>
                <li>Priority customer support</li>
              </ul>
              
              <h2>How to Upgrade</h2>
              <p>If you're on the Free plan and want to access premium content:</p>
              <ol>
                <li>Navigate to the <Link to="/plans" className="text-primary hover:underline">Plans</Link> page</li>
                <li>Select either Premium ($9.99/month) or Annual ($99.99/year)</li>
                <li>Complete the checkout process</li>
                <li>Start enjoying premium content immediately</li>
              </ol>
              
              <h2>Free vs Premium</h2>
              <table>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Free</th>
                    <th>Premium/Annual</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Blog Articles</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td>Community Access</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td>Gallery</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td>Live Streams</td>
                    <td>✗</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td>Spring Training</td>
                    <td>✗</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td>HD Quality</td>
                    <td>✗</td>
                    <td>✓</td>
                  </tr>
                </tbody>
              </table>
              
              <h2>Questions</h2>
              <p>For more details about subscription plans, visit our <Link to="/help/subscription-plans" className="text-primary hover:underline">Subscription Plans Explained</Link> guide.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PremiumContent;
