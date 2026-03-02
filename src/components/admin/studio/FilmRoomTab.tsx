import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Download, Save, Loader2, Film } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FilmRoomTabProps {
  episodeId: string | null;
  onBack: () => void;
}

interface EpisodeDetail {
  id: string;
  title: string;
  description: string | null;
  url: string;
  type: "podcast" | "video";
}

export default function FilmRoomTab({ episodeId, onBack }: FilmRoomTabProps) {
  const { toast } = useToast();
  const [episode, setEpisode] = useState<EpisodeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!episodeId) return;
    loadEpisode(episodeId);
  }, [episodeId]);

  const loadEpisode = async (id: string) => {
    setLoading(true);
    // Try podcast first, then video
    const { data: podcast } = await supabase.from("podcasts").select("*").eq("id", id).maybeSingle();
    if (podcast) {
      setEpisode({ id: podcast.id, title: podcast.title, description: podcast.description, url: podcast.audio_url, type: "podcast" });
      setTitle(podcast.title);
      setDescription(podcast.description || "");
      setLoading(false);
      return;
    }
    const { data: video } = await supabase.from("videos").select("*").eq("id", id).maybeSingle();
    if (video) {
      setEpisode({ id: video.id, title: video.title, description: video.description, url: video.video_url, type: "video" });
      setTitle(video.title);
      setDescription(video.description || "");
    }
    setLoading(false);
  };

  const saveChanges = async () => {
    if (!episode || !title.trim()) return;
    setSaving(true);
    const table = episode.type === "podcast" ? "podcasts" : "videos";
    const { error } = await supabase.from(table).update({ title: title.trim(), description: description.trim() || null }).eq("id", episode.id);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Changes saved!" });
    }
    setSaving(false);
  };

  const downloadFile = (type: "video" | "audio") => {
    if (!episode) return;
    const a = document.createElement("a");
    a.href = episode.url;
    a.download = `${title || "episode"}.${type === "video" ? "webm" : "mp3"}`;
    a.target = "_blank";
    a.click();
  };

  if (!episodeId) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Film className="w-12 h-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">Film Room</h3>
          <p className="text-sm text-muted-foreground mt-1">Select an episode from the Episodes tab to edit it here.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!episode) {
    return <p className="text-sm text-muted-foreground text-center py-8">Episode not found.</p>;
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
        <ArrowLeft className="w-4 h-4" /> Back to Episodes
      </Button>

      {/* Preview */}
      <Card className="bg-black/95 overflow-hidden">
        <div className="aspect-video flex items-center justify-center">
          {episode.type === "video" ? (
            <video src={episode.url} controls className="w-full h-full object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="p-4 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20">
                <Film className="w-10 h-10 text-orange-400" />
              </div>
              <audio src={episode.url} controls className="w-full max-w-md" />
            </div>
          )}
        </div>
      </Card>

      {/* Editor */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Edit Episode Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={saveChanges} disabled={saving || !title.trim()} className="gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>

            {episode.type === "video" && (
              <Button variant="outline" onClick={() => downloadFile("video")} className="gap-1.5">
                <Download className="w-4 h-4" /> Download Video
              </Button>
            )}
            <Button variant="outline" onClick={() => downloadFile("audio")} className="gap-1.5">
              <Download className="w-4 h-4" /> Download Audio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
