import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, Smartphone, Loader2, Check, Save } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const NotificationPreferencesCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { permission, isSubscribed, requestPermission, unsubscribe } = useNotifications();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [gameNotifications, setGameNotifications] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('email_notifications_enabled, sms_notifications_enabled, game_notifications_enabled, phone_number')
          .eq('id', user.id)
          .single();
        
        if (!error && data) {
          setEmailNotifications(data.email_notifications_enabled ?? false);
          setSmsNotifications(data.sms_notifications_enabled ?? false);
          setGameNotifications(data.game_notifications_enabled ?? false);
          setPhoneNumber(data.phone_number ?? "");
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user]);

  const handleSavePreferences = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          email_notifications_enabled: emailNotifications,
          sms_notifications_enabled: smsNotifications,
          game_notifications_enabled: gameNotifications,
          phone_number: smsNotifications ? phoneNumber : null
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated.",
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, value: boolean) => {
    setter(value);
    setHasChanges(true);
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  if (loading) {
    return (
      <Card className="border-2 border-primary mb-6">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose how you want to receive updates about Mets games, news, and live streams
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Push Notifications */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Push Notifications</p>
              <p className="text-sm text-muted-foreground">
                {permission === "granted" 
                  ? "Receive alerts on this device" 
                  : permission === "denied"
                  ? "Blocked - enable in browser settings"
                  : "Enable to receive instant alerts"}
              </p>
            </div>
          </div>
          {permission === "granted" ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={unsubscribe}
              disabled={!isSubscribed}
            >
              {isSubscribed ? "Enabled" : "Enable"}
            </Button>
          ) : permission === "default" ? (
            <Button size="sm" onClick={requestPermission}>
              Enable
            </Button>
          ) : (
            <Button size="sm" variant="secondary" disabled>
              Blocked
            </Button>
          )}
        </div>

        {/* Email Notifications */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Get updates about games, news, and new content via email
              </p>
            </div>
          </div>
          <Switch 
            checked={emailNotifications} 
            onCheckedChange={(checked) => handleToggle(setEmailNotifications, checked)}
          />
        </div>

        {/* SMS Notifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">SMS Text Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Receive text messages for live game alerts
                </p>
              </div>
            </div>
            <Switch 
              checked={smsNotifications} 
              onCheckedChange={(checked) => handleToggle(setSmsNotifications, checked)}
            />
          </div>
          
          {smsNotifications && (
            <div className="ml-13 pl-4 space-y-2">
              <Label htmlFor="phone" className="text-sm text-muted-foreground">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 555-5555"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(formatPhoneNumber(e.target.value));
                  setHasChanges(true);
                }}
                className="max-w-xs"
              />
              <p className="text-xs text-muted-foreground">US numbers only. Standard message rates apply.</p>
            </div>
          )}
        </div>

        {/* Game Notifications */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">⚾</span>
            </div>
            <div>
              <p className="font-medium text-foreground">Game Day Alerts</p>
              <p className="text-sm text-muted-foreground">
                Get notified about game lineups, scores, and highlights
              </p>
            </div>
          </div>
          <Switch 
            checked={gameNotifications} 
            onCheckedChange={(checked) => handleToggle(setGameNotifications, checked)}
          />
        </div>

        {/* Save Button */}
        {hasChanges && (
          <Button 
            onClick={handleSavePreferences} 
            disabled={saving}
            className="w-full gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Preferences
              </>
            )}
          </Button>
        )}

        {/* Current Status */}
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm font-medium text-foreground mb-2">Your Active Notifications:</p>
          <div className="flex flex-wrap gap-2">
            {isSubscribed && (
              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                <Check className="w-3 h-3" /> Push
              </span>
            )}
            {emailNotifications && (
              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                <Check className="w-3 h-3" /> Email
              </span>
            )}
            {smsNotifications && phoneNumber && (
              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                <Check className="w-3 h-3" /> SMS
              </span>
            )}
            {gameNotifications && (
              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                <Check className="w-3 h-3" /> Game Alerts
              </span>
            )}
            {!isSubscribed && !emailNotifications && !smsNotifications && !gameNotifications && (
              <span className="text-xs text-muted-foreground">No notifications enabled</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferencesCard;