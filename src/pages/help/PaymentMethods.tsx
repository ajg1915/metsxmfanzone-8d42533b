import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PaymentMethods = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Payment Methods - MetsXMFanZone Help</title>
        <meta name="description" content="Learn about accepted payment methods on MetsXMFanZone including PayPal and Helcim credit card processing." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/help/payment-methods" />
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
              <CardTitle className="text-2xl sm:text-3xl">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <h2>Accepted Payment Methods</h2>
              <p>MetsXMFanZone offers two secure payment processors for your convenience:</p>
              
              <h3>PayPal</h3>
              <p>Our primary payment option:</p>
              <ul>
                <li>Pay with your PayPal balance</li>
                <li>Use credit/debit cards through PayPal</li>
                <li>Link your bank account</li>
                <li>Secure, encrypted transactions</li>
                <li>Buyer protection included</li>
              </ul>
              
              <h3>Helcim (Credit/Debit Cards)</h3>
              <p>Alternative payment processor:</p>
              <ul>
                <li>Visa</li>
                <li>Mastercard</li>
                <li>American Express</li>
                <li>Discover</li>
                <li>Direct card processing</li>
                <li>PCI-compliant security</li>
              </ul>
              
              <h2>How to Choose Payment Method</h2>
              <p>During checkout:</p>
              <ol>
                <li>Select your desired subscription plan</li>
                <li>Choose either PayPal or Helcim payment option</li>
                <li>Follow the payment processor's instructions</li>
                <li>Complete your purchase</li>
              </ol>
              
              <h2>Payment Security</h2>
              <p>Your payment information is protected:</p>
              <ul>
                <li>SSL encryption for all transactions</li>
                <li>No card details stored on our servers</li>
                <li>PCI DSS compliant payment processing</li>
                <li>Secure payment gateways</li>
                <li>Industry-standard security protocols</li>
              </ul>
              
              <h2>Updating Payment Method</h2>
              
              <h3>For PayPal Subscriptions</h3>
              <ol>
                <li>Log in to your PayPal account</li>
                <li>Go to Settings → Payments → Manage automatic payments</li>
                <li>Find MetsXMFanZone subscription</li>
                <li>Update your payment method</li>
              </ol>
              
              <h3>For Helcim Subscriptions</h3>
              <ol>
                <li>Go to your <Link to="/dashboard" className="text-primary hover:underline">Dashboard</Link></li>
                <li>Navigate to Billing or Subscription settings</li>
                <li>Click "Update Payment Method"</li>
                <li>Enter new card information</li>
                <li>Save changes</li>
              </ol>
              
              <h2>Billing Information</h2>
              
              <h3>Billing Cycle</h3>
              <ul>
                <li><strong>Premium Plan:</strong> Billed monthly on your signup date</li>
                <li><strong>Annual Plan:</strong> Billed once per year on your signup date</li>
                <li>Automatic renewal unless cancelled</li>
              </ul>
              
              <h3>Billing Statements</h3>
              <p>Access your billing history:</p>
              <ol>
                <li>Log in to your account</li>
                <li>Go to Dashboard → Billing</li>
                <li>View past invoices and receipts</li>
                <li>Download statements as needed</li>
              </ol>
              
              <h2>Payment Issues</h2>
              
              <h3>Declined Payment</h3>
              <p>If your payment is declined:</p>
              <ul>
                <li>Check card expiration date and billing address</li>
                <li>Ensure sufficient funds are available</li>
                <li>Contact your bank to authorize the charge</li>
                <li>Try an alternative payment method</li>
              </ul>
              
              <h3>Failed Renewal</h3>
              <p>If your subscription renewal fails:</p>
              <ul>
                <li>You'll receive an email notification</li>
                <li>Update your payment method within 7 days</li>
                <li>Your account will remain active during grace period</li>
                <li>After 7 days, access may be restricted</li>
              </ul>
              
              <h2>Refund Policy</h2>
              <ul>
                <li>No refunds for partial subscription periods</li>
                <li>You can cancel anytime to prevent future charges</li>
                <li>Service remains active until end of billing period</li>
                <li>Contact support for exceptional circumstances</li>
              </ul>
              
              <h2>Currency</h2>
              <p>All prices are displayed and charged in USD (United States Dollars).</p>
              
              <h2>Need Help?</h2>
              <p>For payment-related questions or issues, <Link to="/contact" className="text-primary hover:underline">contact our support team</Link>.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentMethods;
