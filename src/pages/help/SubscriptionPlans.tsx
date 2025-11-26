import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const SubscriptionPlans = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Subscription Plans Explained - MetsXMFanZone Help</title>
        <meta name="description" content="Compare MetsXMFanZone subscription plans including Free, Premium, and Annual options. Find the right plan for you." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/help/subscription-plans" />
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
              <CardTitle className="text-2xl sm:text-3xl">Subscription Plans Explained</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <h2>Available Plans</h2>
              <p>MetsXMFanZone offers three subscription tiers to fit your needs:</p>
              
              <h3>Free Plan</h3>
              <p><strong>Price:</strong> $0/month</p>
              <p><strong>What's Included:</strong></p>
              <ul>
                <li>Access to all blog articles</li>
                <li>Community posting and comments</li>
                <li>Gallery browsing</li>
                <li>Basic podcast access</li>
                <li>Standard quality streaming (where available)</li>
              </ul>
              <p><strong>Not Included:</strong></p>
              <ul>
                <li>Live game streams</li>
                <li>Spring Training exclusive content</li>
                <li>HD/Full HD quality</li>
                <li>Priority support</li>
              </ul>
              
              <h3>Premium Plan</h3>
              <p><strong>Price:</strong> $9.99/month</p>
              <p><strong>What's Included:</strong></p>
              <ul>
                <li>Everything in Free plan</li>
                <li>Access to all live game streams</li>
                <li>Spring Training exclusive content</li>
                <li>HD and Full HD streaming quality</li>
                <li>Stream replays and archives</li>
                <li>Ad-free experience</li>
                <li>Priority customer support</li>
                <li>Early access to new features</li>
              </ul>
              
              <h3>Annual Plan</h3>
              <p><strong>Price:</strong> $99.99/year (Save $20!)</p>
              <p><strong>What's Included:</strong></p>
              <ul>
                <li>Everything in Premium plan</li>
                <li>2 months free compared to monthly</li>
                <li>Locked-in pricing for one year</li>
                <li>Exclusive annual member perks</li>
                <li>Special badges and recognition</li>
              </ul>
              
              <h2>Plan Comparison</h2>
              <table>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Free</th>
                    <th>Premium</th>
                    <th>Annual</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Blog Access</td>
                    <td>✓</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td>Community</td>
                    <td>✓</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td>Gallery</td>
                    <td>✓</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td>Live Streams</td>
                    <td>✗</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td>Spring Training</td>
                    <td>✗</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td>HD Quality</td>
                    <td>✗</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td>Ad-Free</td>
                    <td>✗</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td>Price</td>
                    <td>Free</td>
                    <td>$9.99/mo</td>
                    <td>$99.99/yr</td>
                  </tr>
                </tbody>
              </table>
              
              <h2>Choosing the Right Plan</h2>
              
              <h3>Choose Free If:</h3>
              <ul>
                <li>You're new and want to explore the platform</li>
                <li>You mainly want to read articles and engage in the community</li>
                <li>You don't need live streaming access</li>
              </ul>
              
              <h3>Choose Premium If:</h3>
              <ul>
                <li>You want to watch live games and streams</li>
                <li>You prefer monthly billing flexibility</li>
                <li>You want to try premium features before committing annually</li>
              </ul>
              
              <h3>Choose Annual If:</h3>
              <ul>
                <li>You're a dedicated Mets fan committed for the season</li>
                <li>You want the best value (save $20/year)</li>
                <li>You prefer not to worry about monthly renewals</li>
              </ul>
              
              <h2>How to Subscribe</h2>
              <ol>
                <li>Visit the <Link to="/plans" className="text-primary hover:underline">Plans</Link> page</li>
                <li>Choose your preferred plan</li>
                <li>Click "Subscribe" or "Get Started"</li>
                <li>Select payment method (PayPal or Helcim)</li>
                <li>Complete checkout</li>
                <li>Start enjoying your benefits immediately</li>
              </ol>
              
              <h2>Billing and Renewals</h2>
              <ul>
                <li>Premium plans auto-renew monthly</li>
                <li>Annual plans auto-renew yearly</li>
                <li>You can cancel anytime (see <Link to="/help/cancel-subscription" className="text-primary hover:underline">Cancel or Change Subscription</Link>)</li>
                <li>No refunds for partial months/years</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SubscriptionPlans;
