import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Bell, Send, Trash2, AlertTriangle, Info, Siren, Plus, ImagePlus, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { validateFile, generateSafeFilename } from "@/utils/fileValidation";

interface GameAlert {
  id: string;
  title: string;
  message: string;
  alert_type: string;
  severity: string;
  link_url: string | null;
  image_url: string | null;
  is_active: boolean;
  push_sent: boolean;
  email_sent: boolean;
  created_at: string;
  expires_at: string | null;
}

const GameAlertsManagement = () => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<GameAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("game_day");
  const [severity, setSeverity] = useState("info");
  const [linkUrl, setLinkUrl] = useState("/");
  const [sendPush, setSendPush] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from("game_alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (!error) setAlerts((data as GameAlert[]) || []);
    setLoading(false);
  };

  const createAlert = async () => {
    if (!title || !message) {
      toast({ title: "Missing fields", description: "Title and message required", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      let uploadedImageUrl: string | null = null;
      if (imageFile) {
        setUploadingImage(true);
        const safeName = generateSafeFilename(imageFile.name);
        const filePath = `game-alerts/${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("content_uploads")
          .upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("content_uploads").getPublicUrl(filePath);
        uploadedImageUrl = urlData.publicUrl;
        setUploadingImage(false);
      }

      const { data, error } = await supabase
        .from("game_alerts")
        .insert({
          title,
          message,
          alert_type: alertType,
          severity,
          link_url: linkUrl || "/",
          image_url: uploadedImageUrl,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Send push notification if enabled
      if (sendPush) {
        await supabase.functions.invoke("send-push-notification", {
          body: {
            title,
            body: message,
            url: linkUrl || "/",
            icon: "/logo-192.png",
            tag: `game-alert-${data.id}`,
          },
        });
        await supabase.from("game_alerts").update({ push_sent: true }).eq("id", data.id);
      }

      // Send email if enabled
      if (sendEmail) {
        await supabase.functions.invoke("send-game-notification-email", {
          body: {
            title,
            message,
            notificationType: alertType === "game_day" ? "game_alert" : "general",
            url: linkUrl,
          },
        });
        await supabase.from("game_alerts").update({ email_sent: true }).eq("id", data.id);
      }

      toast({ title: "Alert Created!", description: `${sendPush ? "Push sent. " : ""}${sendEmail ? "Emails sent." : ""}` });
      setTitle("");
      setMessage("");
      setImageFile(null);
      setImagePreview(null);
      fetchAlerts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("game_alerts").update({ is_active: !active }).eq("id", id);
    fetchAlerts();
  };

  const deleteAlert = async (id: string) => {
    await supabase.from("game_alerts").delete().eq("id", id);
    fetchAlerts();
  };

  const quickTemplates = [
    { title: "⚾ Game Day Alert", message: "Mets game starting soon! Tune in live!", type: "game_day", sev: "info", url: "/metsxmfanzone-tv" },
    { title: "🔴 LIVE NOW", message: "The Mets are LIVE! Watch now!", type: "live_stream", sev: "urgent", url: "/metsxmfanzone-tv" },
    { title: "📢 Breaking News", message: "Major Mets news just dropped!", type: "breaking_news", sev: "warning", url: "/blog" },
    { title: "🌴 Spring Training", message: "Spring Training game starting!", type: "spring_training", sev: "info", url: "/spring-training-live" },
  ];

  const severityIcon = (sev: string) => {
    if (sev === "urgent") return <Siren className="w-3 h-3 text-red-500" />;
    if (sev === "warning") return <AlertTriangle className="w-3 h-3 text-amber-500" />;
    return <Info className="w-3 h-3 text-primary" />;
  };

  return (
    <div className="space-y-3 max-w-full">
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5 text-primary" />
        <h1 className="text-base sm:text-lg font-bold">Game Alerts</h1>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {/* Create Alert */}
        <Card className="border-border/30">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Create Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-3">
            <div className="grid grid-cols-2 gap-1.5">
              {quickTemplates.map((t, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-[10px] h-7 px-2 justify-start truncate"
                  onClick={() => {
                    setTitle(t.title);
                    setMessage(t.message);
                    setAlertType(t.type);
                    setSeverity(t.sev);
                    setLinkUrl(t.url);
                  }}
                >
                  {t.title.slice(0, 18)}...
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <Select value={alertType} onValueChange={setAlertType}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="game_day">Game Day</SelectItem>
                    <SelectItem value="score_update">Score Update</SelectItem>
                    <SelectItem value="breaking_news">Breaking News</SelectItem>
                    <SelectItem value="live_stream">Live Stream</SelectItem>
                    <SelectItem value="spring_training">Spring Training</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Severity</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 text-xs" maxLength={80} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Message</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} className="text-xs min-h-[60px]" maxLength={300} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Link URL</Label>
              <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="h-8 text-xs" />
            </div>

            {/* Image Upload */}
            <div className="space-y-1">
              <Label className="text-xs">Image (optional)</Label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="h-16 rounded-md object-cover" />
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-1.5 border border-dashed border-border rounded-md p-2 cursor-pointer hover:bg-muted/50 transition-colors">
                  <ImagePlus className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Upload image</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const result = await validateFile(file, 'image', 5);
                      if (!result.valid) {
                        toast({ title: "Invalid file", description: result.error, variant: "destructive" });
                        return;
                      }
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }}
                  />
                </label>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={sendPush} onCheckedChange={setSendPush} />
                <Label className="text-xs">Push Notification</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
                <Label className="text-xs">Email</Label>
              </div>
            </div>

            <Button onClick={createAlert} disabled={sending} className="w-full h-8 text-xs">
              <Send className="w-3 h-3 mr-1.5" />
              {sending ? "Sending..." : "Create & Send Alert"}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card className="border-border/30">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm">Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {loading ? (
              <p className="text-xs text-muted-foreground">Loading...</p>
            ) : alerts.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No alerts yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border border-border/50 rounded-md p-2 space-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        {severityIcon(alert.severity)}
                        <span className="text-xs font-medium truncate">{alert.title}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Badge variant={alert.is_active ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 cursor-pointer" onClick={() => toggleActive(alert.id, alert.is_active)}>
                          {alert.is_active ? "Active" : "Off"}
                        </Badge>
                        <button onClick={() => deleteAlert(alert.id)} className="text-destructive hover:text-destructive/80">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{alert.message}</p>
                    <div className="flex items-center gap-1.5">
                      {(alert as any).image_url && (
                        <img src={(alert as any).image_url} alt="" className="h-6 w-6 rounded object-cover" />
                      )}
                      {alert.push_sent && <Badge variant="outline" className="text-[9px] px-1 py-0">Push ✓</Badge>}
                      {alert.email_sent && <Badge variant="outline" className="text-[9px] px-1 py-0">Email ✓</Badge>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameAlertsManagement;
