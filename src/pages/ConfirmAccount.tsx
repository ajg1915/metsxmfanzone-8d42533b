import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function ConfirmAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Confirm Your Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              We've sent a confirmation email to:
            </p>
            {email && (
              <p className="font-semibold text-lg">{email}</p>
            )}
            <p className="text-muted-foreground">
              Please check your inbox and click the confirmation link to activate your account.
            </p>
            <div className="pt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or contact support.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/auth?mode=login")}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
