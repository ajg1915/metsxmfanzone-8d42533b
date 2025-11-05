import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function AdminSettings() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Admin Settings
          </CardTitle>
          <CardDescription>
            Configure admin portal settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Settings configuration coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
