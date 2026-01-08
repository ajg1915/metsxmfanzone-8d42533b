import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Home, UserPlus, Heart, Star, Users } from "lucide-react";

const thankYouMessages = [
  "Thank you for being part of the MetsXM family! Your passion makes our community stronger. 💙🧡",
  "We appreciate every moment you spend with us! You're what makes this fan zone special. ⚾",
  "Thanks for visiting! Your support means everything to our Mets community. See you soon! 🎉",
  "You're an amazing fan! We can't wait to see you back. Let's Go Mets! 💪",
  "Thank you for your loyalty! The MetsXMFanZone wouldn't be the same without you. 🏆",
];

const Logout = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [thankYouMessage] = useState(() => 
    thankYouMessages[Math.floor(Math.random() * thankYouMessages.length)]
  );

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4 safe-area-bottom">
      <Card className="w-full max-w-sm sm:max-w-md text-center animate-scale-in border-2 border-primary/30 bg-gradient-to-br from-card to-muted/20">
        <CardHeader className="space-y-4 pb-4">
          {/* Animated icons row */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center animate-bounce">
              <Heart className="w-5 h-5 text-blue-500" />
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.1s' }}>
              <LogOut className="w-6 h-6 text-primary" />
            </div>
            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.2s' }}>
              <Star className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-blue-500 via-primary to-orange-500 bg-clip-text text-transparent">
            Thank You for Visiting!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-0">
          {/* Thank you message */}
          <div className="bg-muted/50 rounded-lg p-4 border border-primary/20">
            <p className="text-sm text-foreground/90 leading-relaxed">
              {thankYouMessage}
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>You've been safely logged out</span>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Redirecting in <span className="text-primary font-bold text-base">{countdown}</span> seconds...
          </p>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate("/")} 
              className="w-full h-11 touch-target bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
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
