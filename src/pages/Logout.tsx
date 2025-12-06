import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, Home } from "lucide-react";
import logo from "@/assets/metsxmfanzone-logo.png";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to home after 10 seconds
    const timer = setTimeout(() => {
      navigate("/");
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <img src={logo} alt="MetsXMFanZone" className="h-20 w-auto" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <LogOut className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">You've Been Logged Out</h1>
            <p className="text-muted-foreground">
              Thank you for visiting MetsXMFanZone. We hope to see you again soon!
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate("/auth")} 
              className="w-full"
              size="lg"
            >
              Sign Back In
            </Button>
            <Button 
              onClick={() => navigate("/")} 
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            You'll be redirected to the home page in 10 seconds...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Logout;
