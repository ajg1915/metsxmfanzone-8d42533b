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
import { Bell, Send, Trash2, AlertTriangle, Info, Siren, Plus, ImagePlus, X, Loader2, Smartphone } from "lucide-react";
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
            imageUrl: data.image_url || undefined,
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
    <div className="space-y-2 w-full max-w-full overflow-hidden px-1">
      <div className="flex items-center gap-1.5">
        <Bell className="w-4 h-4 text-primary" />
        <h1 className="text-sm sm:text-base font-bold">Game Alerts</h1>
      </div>

      <div className="grid gap-2 lg:grid-cols-2">
        {/* Create Alert */}
        <Card className="border-border/30 overflow-hidden">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs flex items-center gap-1">
              <Plus className="w-3 h-3" /> Create Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 space-y-2">
            <div className="grid grid-cols-2 gap-1">
              {quickTemplates.map((t, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-[9px] h-6 px-1.5 justify-start truncate"
                  onClick={() => {
                    setTitle(t.title);
                    setMessage(t.message);
                    setAlertType(t.type);
                    setSeverity(t.sev);
                    setLinkUrl(t.url);
                  }}
                >
                  {t.title.slice(0, 15)}...
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div className="space-y-0.5">
                <Label className="text-[10px]">Type</Label>
                <Select value={alertType} onValueChange={setAlertType}>
                  <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
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
              <div className="space-y-0.5">
                <Label className="text-[10px]">Severity</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-0.5">
              <Label className="text-[10px]">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-7 text-[11px]" maxLength={80} />
            </div>
            <div className="space-y-0.5">
              <Label className="text-[10px]">Message</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} className="text-[11px] min-h-[50px]" maxLength={300} />
            </div>
            <div className="space-y-0.5">
              <Label className="text-[10px]">Link URL</Label>
              <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="h-7 text-[11px]" />
            </div>

            {/* Image Upload */}
            <div className="space-y-0.5">
              <Label className="text-[10px]">Image (optional)</Label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="h-12 rounded-md object-cover" />
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-1 border border-dashed border-border rounded-md p-1.5 cursor-pointer hover:bg-muted/50 transition-colors">
                  <ImagePlus className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Upload image</span>
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

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Switch checked={sendPush} onCheckedChange={setSendPush} className="scale-75" />
                <Smartphone className="w-3 h-3 text-muted-foreground" />
                <Label className="text-[10px]">Push to Phones</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <Switch checked={sendEmail} onCheckedChange={setSendEmail} className="scale-75" />
                <Label className="text-[10px]">Email</Label>
              </div>
            </div>

            <Button onClick={createAlert} disabled={sending} className="w-full h-7 text-[10px]">
              <Send className="w-3 h-3 mr-1" />
              {sending ? "Sending..." : "Create & Send Alert"}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card className="border-border/30 overflow-hidden">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs">Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            {loading ? (
              <p className="text-[10px] text-muted-foreground">Loading...</p>
            ) : alerts.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Bell className="w-6 h-6 mx-auto mb-1 opacity-50" />
                <p className="text-[10px]">No alerts yet</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
                {alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border border-border/50 rounded-md p-1.5 space-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center gap-1 min-w-0 flex-1">
                        {severityIcon(alert.severity)}
                        <span className="text-[10px] font-medium truncate">{alert.title}</span>
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <Badge variant={alert.is_active ? "default" : "secondary"} className="text-[8px] px-1 py-0 cursor-pointer" onClick={() => toggleActive(alert.id, alert.is_active)}>
                          {alert.is_active ? "Active" : "Off"}
                        </Badge>
                        <button onClick={() => deleteAlert(alert.id)} className="text-destructive hover:text-destructive/80">
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[9px] text-muted-foreground line-clamp-1">{alert.message}</p>
                    <div className="flex items-center gap-1">
                      {(alert as any).image_url && (
                        <img src={(alert as any).image_url} alt="" className="h-5 w-5 rounded object-cover" />
                      )}
                      {alert.push_sent && <Badge variant="outline" className="text-[8px] px-1 py-0">📱 Push ✓</Badge>}
                      {alert.email_sent && <Badge variant="outline" className="text-[8px] px-1 py-0">✉️ Email ✓</Badge>}
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
