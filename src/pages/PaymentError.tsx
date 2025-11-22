import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentError = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Payment Failed | MetsXMFanZone</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center px-4 pt-20">
        <Card className="w-full max-w-lg border-2 border-destructive">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-destructive">
              Payment Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8 space-y-6">
            <XCircle className="w-20 h-20 mx-auto text-destructive" />
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold">
                Oops! Something went wrong
              </h2>
              <p className="text-muted-foreground">
                Your payment could not be processed at this time.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm text-left">
              <p className="font-semibold">Common reasons for payment failures:</p>
              <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                <li>Insufficient funds in your account</li>
                <li>Incorrect card details</li>
                <li>Card expired or blocked</li>
                <li>Payment gateway timeout</li>
                <li>Bank declined the transaction</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button 
                size="lg" 
                onClick={() => navigate('/plans')}
                className="w-full gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Back to Home
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/help-center')}
                  className="flex-1"
                >
                  Get Help
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground">
                Need assistance? Contact our support team at{" "}
                <a href="/help-center" className="text-primary hover:underline">
                  Help Center
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentError;
