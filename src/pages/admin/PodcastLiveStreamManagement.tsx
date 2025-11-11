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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Podcast Live Stream Management</h1>
        <p className="text-muted-foreground">
          Configure your VDO.Ninja live stream for the Live page
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5" />
            VDO.Ninja Stream Configuration
          </CardTitle>
          <CardDescription>
            Set up your live podcast stream using VDO.Ninja. The stream will appear on the Live page when enabled.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Stream Title</Label>
            <Input
              id="title"
              value={stream.title}
              onChange={(e) => setStream({ ...stream, title: e.target.value })}
              placeholder="Enter stream title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={stream.description || ""}
              onChange={(e) => setStream({ ...stream, description: e.target.value })}
              placeholder="Enter stream description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vdo_ninja_url">VDO.Ninja Stream URL</Label>
            <Input
              id="vdo_ninja_url"
              value={stream.vdo_ninja_url || ""}
              onChange={(e) => setStream({ ...stream, vdo_ninja_url: e.target.value })}
              placeholder="https://vdo.ninja/?view=XXXXX or ?push=XXXXX&room=XXXXX"
            />
            <p className="text-sm text-muted-foreground">
              Enter your VDO.Ninja viewer URL (e.g., https://vdo.ninja/?view=XXXXX)
            </p>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="is_live">Live Status</Label>
              <p className="text-sm text-muted-foreground">
                Enable this to show the stream on the Live page
              </p>
            </div>
            <Switch
              id="is_live"
              checked={stream.is_live}
              onCheckedChange={(checked) => setStream({ ...stream, is_live: checked })}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={fetchStream} disabled={saving}>
              Reset
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How to Use VDO.Ninja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Broadcasting Steps:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Go to <a href="https://vdo.ninja" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">vdo.ninja</a></li>
              <li>Create a room or use an existing room ID</li>
              <li>Share your camera/screen using the push link</li>
              <li>Copy the viewer URL (e.g., https://vdo.ninja/?view=XXXXX)</li>
              <li>Paste the viewer URL in the field above</li>
              <li>Enable "Live Status" to show the stream</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Viewer Experience:</h4>
            <p className="text-sm text-muted-foreground">
              When live, viewers will see the embedded VDO.Ninja stream on the Live page with low latency via WebRTC.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PodcastLiveStreamManagement;
