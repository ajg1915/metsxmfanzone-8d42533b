import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Upload, Loader2, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  const [aiFormData, setAiFormData] = useState({
    title: "",
    description: "",
    script: "",
    voiceId: "9BWtsMINqrJLrRacOk9x", // Aria default
  });

  const [generatedAudio, setGeneratedAudio] = useState<Blob | null>(null);
  const [generating, setGenerating] = useState(false);

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

  const generateAudio = async () => {
    if (!aiFormData.script) {
      toast({
        title: "Script required",
        description: "Please enter a script for the podcast",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-podcast-audio', {
        body: {
          text: aiFormData.script,
          voiceId: aiFormData.voiceId,
        },
      });

      if (error) throw error;

      const audioBlob = new Blob([data], { type: 'audio/mpeg' });
      setGeneratedAudio(audioBlob);

      toast({
        title: "Audio generated successfully",
        description: "Preview the audio and save when ready",
      });
    } catch (error: any) {
      toast({
        title: "Error generating audio",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const saveGeneratedPodcast = async () => {
    if (!generatedAudio) {
      toast({
        title: "No audio generated",
        description: "Please generate audio first",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileName = `${Date.now()}.mp3`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("podcasts")
        .upload(fileName, generatedAudio);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("podcasts")
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase.from("podcasts").insert({
        title: aiFormData.title,
        description: aiFormData.description,
        audio_url: publicUrl,
        duration: 0,
      });

      if (insertError) throw insertError;

      toast({
        title: "AI Podcast saved successfully",
      });

      setAiFormData({ title: "", description: "", script: "", voiceId: "9BWtsMINqrJLrRacOk9x" });
      setGeneratedAudio(null);
      fetchPodcasts();
    } catch (error: any) {
      toast({
        title: "Error saving podcast",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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
          <CardTitle>Create New Podcast</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">
                <Upload className="w-4 h-4 mr-2" />
                Upload MP3
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with AI
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
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
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ai-title">Podcast Title</Label>
                  <Input
                    id="ai-title"
                    value={aiFormData.title}
                    onChange={(e) =>
                      setAiFormData({ ...aiFormData, title: e.target.value })
                    }
                    placeholder="Enter podcast title"
                  />
                </div>

                <div>
                  <Label htmlFor="ai-description">Description</Label>
                  <Textarea
                    id="ai-description"
                    value={aiFormData.description}
                    onChange={(e) =>
                      setAiFormData({ ...aiFormData, description: e.target.value })
                    }
                    rows={2}
                    placeholder="Brief description"
                  />
                </div>

                <div>
                  <Label htmlFor="voice">AI Voice</Label>
                  <Select
                    value={aiFormData.voiceId}
                    onValueChange={(value) =>
                      setAiFormData({ ...aiFormData, voiceId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9BWtsMINqrJLrRacOk9x">Aria (Female)</SelectItem>
                      <SelectItem value="CwhRBWXzGAHq8TQ4Fs17">Roger (Male)</SelectItem>
                      <SelectItem value="EXAVITQu4vr4xnSDxMaL">Sarah (Female)</SelectItem>
                      <SelectItem value="FGY2WhTYpPnrIDTdsKH5">Laura (Female)</SelectItem>
                      <SelectItem value="IKne3meq5aSn9XLyUdCD">Charlie (Male)</SelectItem>
                      <SelectItem value="JBFqnCBsd6RMkjVDRZzb">George (Male)</SelectItem>
                      <SelectItem value="N2lVS1w4EtoT3dr4eOWO">Callum (Male)</SelectItem>
                      <SelectItem value="TX3LPaxmHKxFdv7VOQHJ">Liam (Male)</SelectItem>
                      <SelectItem value="XB0fDUnXU5powFXDhCwa">Charlotte (Female)</SelectItem>
                      <SelectItem value="Xb7hH8MSUJpSbSDYk0k2">Alice (Female)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="script">Podcast Script</Label>
                  <Textarea
                    id="script"
                    value={aiFormData.script}
                    onChange={(e) =>
                      setAiFormData({ ...aiFormData, script: e.target.value })
                    }
                    rows={6}
                    placeholder="Write your podcast script here..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={generateAudio}
                    disabled={generating || !aiFormData.script}
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Audio
                      </>
                    )}
                  </Button>

                  {generatedAudio && (
                    <Button
                      type="button"
                      onClick={saveGeneratedPodcast}
                      disabled={uploading}
                      variant="default"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Save Podcast
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {generatedAudio && (
                  <div className="p-4 bg-muted rounded-lg">
                    <Label>Preview Generated Audio</Label>
                    <audio controls className="mt-2 w-full">
                      <source src={URL.createObjectURL(generatedAudio)} type="audio/mpeg" />
                    </audio>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
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
