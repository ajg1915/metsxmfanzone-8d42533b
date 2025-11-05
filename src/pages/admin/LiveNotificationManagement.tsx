import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";

interface Notification {
  id: string;
  message: string;
  link_url: string;
  is_active: boolean;
}

const LiveNotificationManagement = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [linkUrl, setLinkUrl] = useState("/mlb-network");
  const [isActive, setIsActive] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("live_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Message is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("live_notifications")
        .insert({
          message,
          link_url: linkUrl,
          is_active: isActive,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification created successfully",
      });

      setMessage("");
      setLinkUrl("/mlb-network");
      setIsActive(false);
      fetchNotifications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("live_notifications")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification status updated",
      });

      fetchNotifications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;

    try {
      const { error } = await supabase
        .from("live_notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification deleted successfully",
      });

      fetchNotifications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Live Notification Management</h2>
        <p className="text-muted-foreground">
          Manage live notifications that appear at the top of the site
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Notification</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="message">Message</Label>
              <Input
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="🔴 LIVE NOW: Watch exclusive Mets coverage..."
                required
              />
            </div>

            <div>
              <Label htmlFor="link_url">Link URL</Label>
              <Input
                id="link_url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="/mlb-network"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="is_active">Active (show on site)</Label>
            </div>

            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Create Notification
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Existing Notifications</h3>
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No notifications yet. Create one above.
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <p className="font-medium">{notification.message}</p>
                    <p className="text-sm text-muted-foreground">
                      Link: {notification.link_url}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={notification.is_active}
                        onCheckedChange={() =>
                          toggleActive(notification.id, notification.is_active)
                        }
                      />
                      <Label className="text-sm">
                        {notification.is_active ? "Active" : "Inactive"}
                      </Label>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveNotificationManagement;
