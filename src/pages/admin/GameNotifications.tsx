import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, Radio, Users, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface NotificationLog {
  id: string;
  title: string;
  body: string;
  sent_at: string;
  successful: number;
  failed: number;
  total: number;
}

interface LiveStream {
  id: string;
  title: string;
  status: string;
  scheduled_start: string | null;
}

const GameNotifications = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  
  // Form state
  const [title, setTitle] = useState("🔴 Mets Game Going Live!");
  const [body, setBody] = useState("The Mets game is about to start! Tune in now to watch live.");
  const [selectedStream, setSelectedStream] = useState<string>("");
  const [customUrl, setCustomUrl] = useState("/metsxmfanzone-tv");

  useEffect(() => {
    fetchSubscriberCount();
    fetchLiveStreams();
    fetchNotificationLogs();
  }, []);

  const fetchSubscriberCount = async () => {
    try {
      const { count, error } = await supabase
        .from("notification_subscriptions")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      setSubscriberCount(count || 0);
    } catch (error) {
      console.error("Error fetching subscriber count:", error);
    }
  };

  const fetchLiveStreams = async () => {
    try {
      const { data, error } = await supabase
        .from("live_streams")
        .select("id, title, status, scheduled_start")
        .eq("published", true)
        .order("scheduled_start", { ascending: true })
        .limit(10);
      
      if (error) throw error;
      setLiveStreams(data || []);
    } catch (error) {
      console.error("Error fetching live streams:", error);
    }
  };

  const fetchNotificationLogs = async () => {
    // For now, we'll use local storage to track sent notifications
    const logs = localStorage.getItem("game_notification_logs");
    if (logs) {
      setNotificationLogs(JSON.parse(logs));
    }
  };

  const handleStreamSelect = (streamId: string) => {
    setSelectedStream(streamId);
    const stream = liveStreams.find(s => s.id === streamId);
    if (stream) {
      setTitle(`🔴 ${stream.title} - Going Live!`);
      setBody(`${stream.title} is about to start! Tune in now to watch live on MetsXM FanZone.`);
    }
  };

  const sendNotification = async () => {
    if (!title || !body) {
      toast({
        title: "Missing Fields",
        description: "Please enter a title and message for the notification.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in as an admin to send notifications.",
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke("send-push-notification", {
        body: {
          title,
          body,
          url: customUrl,
          icon: "/logo-192.png",
          tag: "game-live-notification",
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;

      // Log the notification
      const newLog: NotificationLog = {
        id: crypto.randomUUID(),
        title,
        body,
        sent_at: new Date().toISOString(),
        successful: result.successful || 0,
        failed: result.failed || 0,
        total: result.total || 0,
      };

      const updatedLogs = [newLog, ...notificationLogs].slice(0, 20);
      setNotificationLogs(updatedLogs);
      localStorage.setItem("game_notification_logs", JSON.stringify(updatedLogs));

      toast({
        title: "Notification Sent!",
        description: `Successfully sent to ${result.successful || 0} of ${result.total || 0} subscribers.`,
      });

      // Reset form
      setTitle("🔴 Mets Game Going Live!");
      setBody("The Mets game is about to start! Tune in now to watch live.");
      setSelectedStream("");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const quickTemplates = [
    {
      title: "🔴 Mets Game Starting Now!",
      body: "The Mets are taking the field! Watch live now on MetsXM FanZone.",
      url: "/metsxmfanzone-tv",
    },
    {
      title: "⚾ Spring Training Live",
      body: "Mets Spring Training is about to begin! Catch all the action live.",
      url: "/spring-training-live",
    },
    {
      title: "🎙️ Podcast Going Live",
      body: "Join us for a live discussion on today's Mets news and updates!",
      url: "/community-podcast",
    },
    {
      title: "📺 MLB Network Coverage",
      body: "Tune in for MLB Network's Mets coverage starting soon!",
      url: "/mlb-network",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Game Notifications
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Send push notifications to all subscribers when games go live
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
          <Users className="w-4 h-4" />
          {subscriberCount} subscribers
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Notification Composer */}
        <Card className="glass-card border-border/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Send className="w-5 h-5" />
              Compose Notification
            </CardTitle>
            <CardDescription>
              Create and send push notifications to all devices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Templates */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Templates</Label>
              <div className="grid grid-cols-2 gap-2">
                {quickTemplates.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-2 px-3 justify-start text-left"
                    onClick={() => {
                      setTitle(template.title);
                      setBody(template.body);
                      setCustomUrl(template.url);
                    }}
                  >
                    {template.title.slice(0, 25)}...
                  </Button>
                ))}
              </div>
            </div>

            {/* Select Live Stream */}
            <div className="space-y-2">
              <Label htmlFor="stream">Link to Live Stream (Optional)</Label>
              <Select value={selectedStream} onValueChange={handleStreamSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a live stream..." />
                </SelectTrigger>
                <SelectContent>
                  {liveStreams.map((stream) => (
                    <SelectItem key={stream.id} value={stream.id}>
                      <div className="flex items-center gap-2">
                        {stream.status === "live" && (
                          <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                        )}
                        <span>{stream.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Notification Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter notification title..."
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">{title.length}/60 characters</p>
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter notification message..."
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">{body.length}/200 characters</p>
            </div>

            {/* Custom URL */}
            <div className="space-y-2">
              <Label htmlFor="url">Click URL</Label>
              <Input
                id="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="/metsxmfanzone-tv"
              />
              <p className="text-xs text-muted-foreground">
                Where users go when they click the notification
              </p>
            </div>

            {/* Preview */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Preview</p>
              <div className="flex gap-3 items-start">
                <img src="/logo-192.png" alt="App Icon" className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{title || "Notification Title"}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {body || "Notification message will appear here..."}
                  </p>
                </div>
              </div>
            </div>

            {/* Send Button */}
            <Button
              onClick={sendNotification}
              disabled={loading || subscriberCount === 0}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Radio className="w-4 h-4 mr-2 animate-pulse" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send to {subscriberCount} Subscribers
                </>
              )}
            </Button>

            {subscriberCount === 0 && (
              <div className="flex items-center gap-2 text-sm text-amber-500">
                <AlertCircle className="w-4 h-4" />
                No subscribers yet. Users need to enable notifications.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card className="glass-card border-border/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Notifications
            </CardTitle>
            <CardDescription>
              History of sent game notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notificationLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No notifications sent yet</p>
                <p className="text-sm">Send your first notification above</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {notificationLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-border/50 p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{log.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{log.body}</p>
                      </div>
                      <Badge
                        variant={log.successful > 0 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {log.successful > 0 ? (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {log.successful}/{log.total}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.sent_at).toLocaleString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="text-lg">📋 Tips for Effective Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Use emojis in titles to grab attention (🔴 ⚾ 🎙️)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Keep titles under 50 characters for best display
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Send notifications 5-10 minutes before games start
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Include the stream URL so users can jump right in
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Don't overuse notifications - save them for important events
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Test notifications on your own device first
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameNotifications;