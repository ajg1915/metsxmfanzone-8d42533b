import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Play, Pause, Download, Save } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function PodcastAIVoiceGenerator() {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<string>("alloy");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const openAIVoices = [
    { id: "alloy", name: "Alloy", description: "Neutral and balanced" },
    { id: "echo", name: "Echo", description: "Clear and authoritative" },
    { id: "fable", name: "Fable", description: "Warm and engaging" },
    { id: "onyx", name: "Onyx", description: "Deep and resonant" },
    { id: "nova", name: "Nova", description: "Bright and energetic" },
    { id: "shimmer", name: "Shimmer", description: "Soft and calming" },
  ];

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handlePreview = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    } else {
      toast({
        title: "No audio to preview",
        description: "Generate audio first",
        variant: "destructive",
      });
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to generate speech",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-podcast-audio', {
        body: { text, voice: selectedVoice }
      });

      if (error) throw error;

      // Convert base64 to blob
      const base64Audio = data.audioContent;
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "audio/mpeg" });
      
      setAudioBlob(blob);
      
      // Create URL for preview
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      toast({
        title: "Success",
        description: "High-quality audio generated! You can preview and save it.",
      });

    } catch (error) {
      console.error("Error generating audio:", error);
      toast({
        title: "Error",
        description: "Failed to generate audio. Make sure OpenAI API key is configured.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!audioBlob) {
      toast({
        title: "Error",
        description: "No audio to download. Generate audio first.",
        variant: "destructive",
      });
      return;
    }

    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "podcast"}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Audio downloaded successfully",
    });
  };

  const handleSavePodcast = async () => {
    if (!audioBlob) {
      toast({
        title: "Error",
        description: "Generate audio first before saving",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the podcast",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Upload audio to storage
      const fileName = `podcast-${Date.now()}.mp3`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("podcasts")
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("podcasts")
        .getPublicUrl(fileName);

      // Create podcast entry
      const { error: insertError } = await supabase
        .from("podcasts")
        .insert({
          title: title.trim(),
          description: description.trim(),
          audio_url: publicUrl,
          published: true,
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Podcast saved successfully",
      });

      // Reset form
      setText("");
      setTitle("");
      setDescription("");
      setAudioBlob(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioUrl(null);

    } catch (error) {
      console.error("Error saving podcast:", error);
      toast({
        title: "Error",
        description: "Failed to save podcast",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">AI Voice Generator</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Podcast Details</CardTitle>
            <CardDescription>
              Enter the details for your AI-generated podcast
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Podcast Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter podcast title..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter podcast description..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="text">Script</Label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the text to convert to speech..."
                rows={8}
              />
              <p className="text-sm text-muted-foreground">
                {text.length} characters
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voice Settings</CardTitle>
            <CardDescription>
              High-quality AI voices powered by OpenAI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="voice">Voice</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger id="voice">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {openAIVoices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name} - {voice.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generate & Save</CardTitle>
            <CardDescription>
              Preview, generate, and save your AI podcast
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Generate Audio
                  </>
                )}
              </Button>

              {audioBlob && (
                <>
                  <Button onClick={handlePreview} variant="outline">
                    <Play className="w-4 h-4 mr-2" />
                    Preview
                  </Button>

                  <Button onClick={handleDownload} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>

                  <Button onClick={handleSavePodcast} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Podcast
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>

            {audioUrl && (
              <div className="p-4 bg-muted rounded-lg">
                <audio controls src={audioUrl} className="w-full" />
              </div>
            )}

            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm">
                <strong>Professional AI Voices:</strong> Using OpenAI's TTS-1 model for realistic, high-quality speech synthesis.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
