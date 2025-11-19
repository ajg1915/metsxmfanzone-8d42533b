import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Users, AlertTriangle, Heart } from "lucide-react";

export default function CommunityGuidelines() {
  const guidelines = [
    {
      icon: Heart,
      title: "Be Respectful",
      description: "Treat all members with kindness and respect. No harassment, hate speech, or discriminatory language will be tolerated."
    },
    {
      icon: Users,
      title: "Stay On Topic",
      description: "Keep discussions related to the Mets, baseball, and community events. Off-topic spam will be removed."
    },
    {
      icon: Shield,
      title: "No Self-Promotion",
      description: "Do not use the community for excessive self-promotion or advertising without admin approval."
    },
    {
      icon: AlertTriangle,
      title: "Report Issues",
      description: "If you see inappropriate content or behavior, report it to moderators immediately."
    }
  ];

  return (
    <Card className="border-2 border-primary mb-8">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Community Guidelines & Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription className="text-foreground">
            Welcome to the MetsXMFanZone community! To ensure a positive experience for all members, 
            please follow these guidelines. Violations may result in content removal, account 
            suspension, or permanent ban.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2">
          {guidelines.map((guideline, index) => (
            <Card key={index} className="border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <guideline.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {guideline.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {guideline.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Zero Tolerance Policy:</strong> Harassment, threats, doxxing, 
            or sharing illegal content will result in immediate permanent ban and 
            may be reported to authorities.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
