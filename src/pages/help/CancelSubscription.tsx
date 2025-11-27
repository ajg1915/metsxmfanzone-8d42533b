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
              <CardTitle className="text-2xl sm:text-3xl text-primary">Cancel or Change Subscription</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg prose-slate dark:prose-invert max-w-none space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-primary border-b pb-3">Canceling Your Subscription</h2>
                <p className="text-muted-foreground leading-relaxed">You can cancel your Premium or Annual subscription at any time.</p>
              </div>
              
              <div className="grid gap-6">
                <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                  <h3 className="text-xl font-semibold text-primary mb-3">For PayPal Subscriptions</h3>
                  <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                    <li>Log in to your PayPal account</li>
                    <li>Go to Settings → Payments</li>
                    <li>Click "Manage automatic payments"</li>
                    <li>Find "MetsXMFanZone" and select "Cancel"</li>
                  </ol>
                </div>
                
                <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                  <h3 className="text-xl font-semibold text-primary mb-3">For Helcim Subscriptions</h3>
                  <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                    <li>Log in to your MetsXMFanZone account</li>
                    <li>Go to your <Link to="/dashboard" className="text-primary hover:underline font-medium">Dashboard</Link></li>
                    <li>Navigate to Subscription settings</li>
                    <li>Click "Cancel Subscription"</li>
                  </ol>
                </div>
              </div>
              
              <div className="space-y-4 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-l-4 border-blue-500 mt-6">
                <h2 className="text-xl font-bold text-blue-900 dark:text-blue-200">Refund Policy</h2>
                <p className="text-blue-800 dark:text-blue-300 leading-relaxed"><strong>Important:</strong> We do not offer refunds for partial subscription periods. When you cancel, your subscription remains active until the end of your current billing cycle.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CancelSubscription;