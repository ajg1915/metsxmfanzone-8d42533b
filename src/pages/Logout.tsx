import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Home, UserPlus } from "lucide-react";

const Logout = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 safe-area-bottom">
      <Card className="w-full max-w-sm sm:max-w-md text-center animate-scale-in border-2 border-primary/30">
        <CardHeader className="space-y-4 pb-4">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center animate-fade-in">
            <LogOut className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
          </div>
          <CardTitle className="text-xl sm:text-2xl">You've Been Logged Out</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-0">
          <p className="text-sm text-muted-foreground px-2">
            Thank you for visiting MetsXMFanZone. We hope to see you again soon!
          </p>
          
          <p className="text-xs text-muted-foreground">
            Redirecting in <span className="text-primary font-bold">{countdown}</span> seconds...
          </p>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate("/")} 
              className="w-full h-11 touch-target"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/auth")}
              className="w-full h-11 touch-target"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Sign In Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Logout;
