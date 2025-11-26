import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const CancelSubscription = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Cancel or Change Subscription - MetsXMFanZone Help</title>
        <meta name="description" content="Learn how to cancel, downgrade, or upgrade your MetsXMFanZone subscription plan." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/help/cancel-subscription" />
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
              <CardTitle className="text-2xl sm:text-3xl">Cancel or Change Subscription</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <h2>Canceling Your Subscription</h2>
              <p>You can cancel your Premium or Annual subscription at any time.</p>
              
              <h3>For PayPal Subscriptions</h3>
              <ol>
                <li>Log in to your PayPal account</li>
                <li>Click on Settings (gear icon)</li>
                <li>Select "Payments"</li>
                <li>Click "Manage automatic payments"</li>
                <li>Find "MetsXMFanZone" in your list</li>
                <li>Click on it and select "Cancel"</li>
                <li>Confirm cancellation</li>
              </ol>
              
              <h3>For Helcim Subscriptions</h3>
              <ol>
                <li>Log in to your MetsXMFanZone account</li>
                <li>Go to your <Link to="/dashboard" className="text-primary hover:underline">Dashboard</Link></li>
                <li>Navigate to Subscription or Billing section</li>
                <li>Click "Manage Subscription"</li>
                <li>Select "Cancel Subscription"</li>
                <li>Follow the prompts to confirm</li>
              </ol>
              
              <h2>What Happens After Cancellation</h2>
              
              <h3>Immediate Effects</h3>
              <ul>
                <li>No future charges will be made</li>
                <li>Your subscription remains active until end of billing period</li>
                <li>You keep all premium benefits until expiration date</li>
              </ul>
              
              <h3>After Subscription Expires</h3>
              <ul>
                <li>Account automatically switches to Free plan</li>
                <li>Loss of access to live streams</li>
                <li>Loss of access to Spring Training content</li>
                <li>HD quality no longer available</li>
                <li>Community and blog access remains</li>
              </ul>
              
              <h2>Upgrading Your Plan</h2>
              
              <h3>From Free to Premium/Annual</h3>
              <ol>
                <li>Visit the <Link to="/plans" className="text-primary hover:underline">Plans</Link> page</li>
                <li>Select Premium or Annual plan</li>
                <li>Complete checkout process</li>
                <li>Access premium features immediately</li>
              </ol>
              
              <h3>From Premium to Annual</h3>
              <ol>
                <li>Cancel your current Premium subscription</li>
                <li>Wait for current period to end or contact support for proration</li>
                <li>Subscribe to Annual plan</li>
                <li>Enjoy annual benefits and savings</li>
              </ol>
              
              <h2>Downgrading Your Plan</h2>
              
              <h3>From Premium/Annual to Free</h3>
              <ol>
                <li>Cancel your paid subscription</li>
                <li>Let it expire at end of billing period</li>
                <li>Account automatically becomes Free plan</li>
              </ol>
              
              <h3>From Annual to Premium</h3>
              <ol>
                <li>Cancel Annual subscription</li>
                <li>Wait until Annual period ends</li>
                <li>Subscribe to Premium monthly plan</li>
              </ol>
              
              <h2>Pausing Your Subscription</h2>
              <p>Subscription pausing is not currently available. Your options are:</p>
              <ul>
                <li>Keep your subscription active</li>
                <li>Cancel and resubscribe when ready</li>
                <li>Downgrade to Free plan temporarily</li>
              </ul>
              
              <h2>Refund Policy</h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="font-semibold text-blue-800 dark:text-blue-200">Important:</p>
                <p className="text-blue-700 dark:text-blue-300">We do not offer refunds for partial subscription periods. When you cancel, your subscription remains active and accessible until the end of your current billing cycle.</p>
              </div>
              
              <h2>Reactivating a Canceled Subscription</h2>
              <p>To restart your subscription after cancellation:</p>
              <ol>
                <li>Visit the <Link to="/plans" className="text-primary hover:underline">Plans</Link> page</li>
                <li>Choose your preferred plan</li>
                <li>Complete the signup process</li>
                <li>Your previous settings and preferences are preserved</li>
              </ol>
              
              <h2>Before You Cancel</h2>
              <p>Consider these alternatives:</p>
              <ul>
                <li>Downgrade to a less expensive plan</li>
                <li>Wait until off-season to cancel</li>
                <li>Review <Link to="/help/subscription-plans" className="text-primary hover:underline">plan features</Link> you might be missing</li>
              </ul>
              
              <h2>Need Help?</h2>
              <p>Having trouble canceling or changing your subscription? <Link to="/contact" className="text-primary hover:underline">Contact support</Link> for assistance.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CancelSubscription;
