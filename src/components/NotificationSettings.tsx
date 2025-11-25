import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const NotificationSettings = () => {
  const { permission, isSubscribed, requestPermission, unsubscribe } = useNotifications();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Manage your notification preferences for news and updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              {permission === "granted" ? "Notifications Enabled" : 
               permission === "denied" ? "Notifications Blocked" : 
               "Notifications Not Set"}
            </p>
            <p className="text-sm text-muted-foreground">
              {permission === "granted" 
                ? "You'll receive notifications about Mets news and updates" 
                : permission === "denied"
                ? "You've blocked notifications. Enable them in your browser settings."
                : "Enable notifications to stay updated with the latest news"}
            </p>
          </div>
          {permission === "granted" ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={unsubscribe}
              disabled={!isSubscribed}
            >
              <BellOff className="mr-2 h-4 w-4" />
              Disable
            </Button>
          ) : permission === "default" ? (
            <Button 
              size="sm"
              onClick={requestPermission}
            >
              <Bell className="mr-2 h-4 w-4" />
              Enable
            </Button>
          ) : null}
        </div>
        
        {permission === "denied" && (
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium mb-1">How to enable notifications:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Click the lock icon in your browser's address bar</li>
              <li>Find "Notifications" in the permissions list</li>
              <li>Change the setting to "Allow"</li>
              <li>Refresh this page and click "Enable" above</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
