import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const CreateAccount = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>How to Create an Account - MetsXMFanZone Help</title>
        <meta name="description" content="Step-by-step guide on creating your MetsXMFanZone account to access exclusive Mets content and live streams." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/help/create-account" />
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
              <CardTitle className="text-2xl sm:text-3xl">How to Create an Account</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <h2>Getting Started</h2>
              <p>Creating your MetsXMFanZone account is quick and easy. Follow these steps:</p>
              
              <h3>Step 1: Navigate to Sign Up</h3>
              <p>Click the "Sign Up" button in the top right corner of the website or navigate directly to the authentication page.</p>
              
              <h3>Step 2: Enter Your Information</h3>
              <ul>
                <li>Provide your email address</li>
                <li>Create a secure password</li>
                <li>Confirm your password</li>
              </ul>
              
              <h3>Step 3: Select Your Plan</h3>
              <p>After creating your account, you'll be prompted to choose a subscription plan:</p>
              <ul>
                <li><strong>Free Plan:</strong> Access to basic content and community features</li>
                <li><strong>Premium Plan ($9.99/month):</strong> Full access to live streams and exclusive content</li>
                <li><strong>Annual Plan ($99.99/year):</strong> All premium features with significant savings</li>
              </ul>
              
              <h3>Step 4: Complete Payment (for paid plans)</h3>
              <p>Choose your preferred payment method (PayPal or Helcim) and complete the checkout process.</p>
              
              <h3>Step 5: Start Enjoying Content</h3>
              <p>Once your account is set up, you can immediately start accessing content based on your plan tier.</p>
              
              <h2>Troubleshooting</h2>
              <p>If you encounter any issues during account creation, please visit our <Link to="/contact" className="text-primary hover:underline">Contact</Link> page for assistance.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateAccount;
