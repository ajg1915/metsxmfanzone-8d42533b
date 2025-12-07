import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Home } from "lucide-react";

const Logout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <LogOut className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">You've Been Logged Out</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Thank you for visiting MetsXMFanZone. We hope to see you again soon!
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate("/")} 
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/auth")}
              className="w-full"
            >
              Sign In Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Logout;
