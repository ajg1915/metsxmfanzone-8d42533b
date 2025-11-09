import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Upload, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Podcast {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  duration: number;
  published: boolean;
  created_at: string;
}

export default function PodcastManagement() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    audioFile: null as File | null,
  });

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching podcasts",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setPodcasts(data || []);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "audio/mpeg") {
      setFormData({ ...formData, audioFile: file });
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload an MP3 file",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.audioFile) {
      toast({
        title: "No file selected",
        description: "Please select an MP3 file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload audio file
      const fileExt = "mp3";
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("podcasts")
        .upload(fileName, formData.audioFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("podcasts")
        .getPublicUrl(fileName);

      // Create podcast record
      const { error: insertError } = await supabase.from("podcasts").insert({
        title: formData.title,
        description: formData.description,
        audio_url: publicUrl,
        duration: 0,
      });

      if (insertError) throw insertError;

      toast({
        title: "Podcast uploaded successfully",
      });

      setFormData({ title: "", description: "", audioFile: null });
      fetchPodcasts();
    } catch (error: any) {
      toast({
        title: "Error uploading podcast",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("podcasts")
      .update({ 
        published: !currentStatus,
        published_at: !currentStatus ? new Date().toISOString() : null 
      })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error updating podcast",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: `Podcast ${!currentStatus ? "published" : "unpublished"}`,
      });
      fetchPodcasts();
    }
  };

  const deletePodcast = async (id: string, audioUrl: string) => {
    if (!confirm("Are you sure you want to delete this podcast?")) return;

    try {
      // Extract filename from URL
      const filename = audioUrl.split("/").pop();
      if (filename) {
        await supabase.storage.from("podcasts").remove([filename]);
      }

      const { error } = await supabase.from("podcasts").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Podcast deleted successfully",
      });
      fetchPodcasts();
    } catch (error: any) {
      toast({
        title: "Error deleting podcast",
        description: error.message,
        variant: "destructive",
      });
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Podcast Management</h1>
        <p className="text-muted-foreground mt-2">
          Upload and manage MetsXMFanZone podcast episodes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload New Podcast</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Podcast Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="audio">MP3 File</Label>
              <Input
                id="audio"
                type="file"
                accept="audio/mpeg"
                onChange={handleFileChange}
                required
              />
            </div>

            <Button type="submit" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Podcast
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Podcasts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {podcasts.map((podcast) => (
              <div
                key={podcast.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{podcast.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {podcast.description}
                  </p>
                  <audio controls className="mt-2 w-full max-w-md">
                    <source src={podcast.audio_url} type="audio/mpeg" />
                  </audio>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`published-${podcast.id}`}>Published</Label>
                    <Switch
                      id={`published-${podcast.id}`}
                      checked={podcast.published}
                      onCheckedChange={() =>
                        togglePublished(podcast.id, podcast.published)
                      }
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deletePodcast(podcast.id, podcast.audio_url)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
