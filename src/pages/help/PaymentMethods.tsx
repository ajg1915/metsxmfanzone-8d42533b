import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
const PaymentMethods = () => {
  return <div className="min-h-screen bg-background">
      <Helmet>
        <title>Payment Methods - MetsXMFanZone Help</title>
        <meta name="description" content="Learn about accepted payment methods on MetsXMFanZone including PayPal and Helcim credit card processing." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/help/payment-methods" />
      </Helmet>
      <Navigation />
      <main className="pt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl text-secondary">
          <Link to="/help-center" className="inline-flex items-center text-primary hover:underline mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help Center
          </Link>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl text-primary">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg prose-slate dark:prose-invert max-w-none space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-primary border-b pb-3">Accepted Payment Methods</h2>
                <p className="text-muted-foreground leading-relaxed">MetsXMFanZone offers two secure payment processors for your convenience:</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 text-primary bg-secondary">
                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500 text-primary">
                  <h3 className="text-xl font-semibold text-primary mb-4">PayPal</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-blue-600">✓</span><span>Pay with PayPal balance</span></li>
                    <li className="flex items-start gap-2"><span className="text-blue-600">✓</span><span>Use credit/debit cards</span></li>
                    <li className="flex items-start gap-2"><span className="text-blue-600">✓</span><span>Secure transactions</span></li>
                  </ul>
                </div>
                
                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                  <h3 className="text-xl font-semibold mb-4 text-primary">Helcim</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-green-600">✓</span><span>Visa</span></li>
                    <li className="flex items-start gap-2"><span className="text-green-600">✓</span><span>Mastercard</span></li>
                    <li className="flex items-start gap-2"><span className="text-green-600">✓</span><span>American Express</span></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>;
};
export default PaymentMethods;