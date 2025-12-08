import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Radio } from "lucide-react";

interface PodcastLiveStream {
  id: string;
  title: string;
  description: string | null;
  vdo_ninja_url: string | null;
  is_live: boolean;
}

const PodcastLiveStreamManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stream, setStream] = useState<PodcastLiveStream | null>(null);

  useEffect(() => {
    fetchStream();
  }, []);

  const fetchStream = async () => {
    try {
      const { data, error } = await supabase
        .from("podcast_live_stream")
        .select("*")
        .single();

      if (error) throw error;
      setStream(data);
    } catch (error) {
      console.error("Error fetching stream:", error);
      toast({
        title: "Error",
        description: "Failed to load podcast stream settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!stream) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("podcast_live_stream")
        .update({
          title: stream.title,
          description: stream.description,
          vdo_ninja_url: stream.vdo_ninja_url,
          is_live: stream.is_live,
        })
        .eq("id", stream.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Podcast stream settings updated successfully",
      });
    } catch (error) {
      console.error("Error saving stream:", error);
      toast({
        title: "Error",
        description: "Failed to save podcast stream settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">No stream configuration found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-full px-2 py-3 space-y-4 overflow-x-hidden">
      <div>
        <h1 className="text-lg sm:text-xl font-bold">Podcast Stream</h1>
        <p className="text-xs text-muted-foreground">VDO.Ninja configuration</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" />
            Stream Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-3">
          <div className="space-y-1">
            <Label className="text-xs">Stream Title</Label>
            <Input
              value={stream.title}
              onChange={(e) => setStream({ ...stream, title: e.target.value })}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">VDO.Ninja URL</Label>
            <Input
              value={stream.vdo_ninja_url || ""}
              onChange={(e) => setStream({ ...stream, vdo_ninja_url: e.target.value })}
              placeholder="https://vdo.ninja/?view=XXXXX"
              className="h-8 text-xs"
            />
          </div>

          <div className="flex items-center justify-between p-2 border rounded-lg">
            <div>
              <Label className="text-xs">Live Status</Label>
              <p className="text-[10px] text-muted-foreground">Show on Live page</p>
            </div>
            <Switch
              checked={stream.is_live}
              onCheckedChange={(checked) => setStream({ ...stream, is_live: checked })}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchStream} disabled={saving} className="h-8 text-xs">
              Reset
            </Button>
            <Button onClick={handleSave} disabled={saving} size="sm" className="h-8 text-xs">
              {saving && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PodcastLiveStreamManagement;
