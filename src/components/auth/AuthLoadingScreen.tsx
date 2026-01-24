import { Loader2, Mail, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AuthBackground from "@/components/AuthBackground";
import authLogo from "@/assets/metsxmfanzone-logo-auth.png";

interface AuthLoadingScreenProps {
  title: string;
  description: string;
  type?: "otp" | "verification" | "loading";
}

const AuthLoadingScreen = ({ title, description, type = "loading" }: AuthLoadingScreenProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <AuthBackground />
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex flex-col items-center gap-3 mb-4">
            <img 
              src={authLogo} 
              alt="MetsXMFanZone" 
              className="h-20 w-auto object-contain"
            />
            <span className="text-lg font-bold text-[#FF5910]">MetsXMFanZone.com</span>
          </div>
          <CardTitle className="text-xl font-bold text-center">{title}</CardTitle>
          <CardDescription className="text-center">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="relative">
            {type === "otp" ? (
              <div className="relative">
                <div className="absolute inset-0 animate-ping">
                  <Mail className="h-12 w-12 text-primary/30" />
                </div>
                <Mail className="h-12 w-12 text-primary" />
              </div>
            ) : type === "verification" ? (
              <div className="relative">
                <div className="absolute inset-0 animate-ping">
                  <Shield className="h-12 w-12 text-primary/30" />
                </div>
                <Shield className="h-12 w-12 text-primary" />
              </div>
            ) : (
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Please wait...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthLoadingScreen;
