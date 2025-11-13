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
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [rate, setRate] = useState([1]);
  const [pitch, setPitch] = useState([1]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [selectedVoice]);

  const handlePreview = () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to generate speech",
        variant: "destructive",
      });
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === selectedVoice);
    
    if (voice) {
      utterance.voice = voice;
    }
    utterance.rate = rate[0];
    utterance.pitch = pitch[0];

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsPlaying(false);
      toast({
        title: "Error",
        description: "Failed to generate speech",
        variant: "destructive",
      });
    };

    window.speechSynthesis.speak(utterance);
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

    try {
      // For browser-based TTS, we need to record the audio
      // This is a limitation - we'll need to use MediaRecorder API
      toast({
        title: "Generating Audio",
        description: "Recording speech synthesis...",
      });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        
        toast({
          title: "Success",
          description: "Audio generated successfully. You can now save it as a podcast.",
        });
      };

      mediaRecorder.start();

      // Generate speech
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = voices.find(v => v.name === selectedVoice);
      
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = rate[0];
      utterance.pitch = pitch[0];

      utterance.onend = () => {
        setTimeout(() => {
          mediaRecorder.stop();
        }, 500);
      };

      window.speechSynthesis.speak(utterance);

    } catch (error) {
      console.error("Error generating audio:", error);
      toast({
        title: "Error",
        description: "Failed to generate audio. Make sure microphone access is granted.",
        variant: "destructive",
      });
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
    a.download = `${title || "podcast"}.webm`;
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
      const fileName = `podcast-${Date.now()}.webm`;
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
              Customize the voice characteristics (using browser TTS - free!)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="voice">Voice</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger id="voice">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Speed: {rate[0].toFixed(1)}x</Label>
              <Slider
                value={rate}
                onValueChange={setRate}
                min={0.5}
                max={2}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <Label>Pitch: {pitch[0].toFixed(1)}</Label>
              <Slider
                value={pitch}
                onValueChange={setPitch}
                min={0.5}
                max={2}
                step={0.1}
              />
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
              <Button onClick={handlePreview} variant="outline">
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Stop Preview
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Preview Voice
                  </>
                )}
              </Button>

              <Button onClick={handleGenerate} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Generate Audio
              </Button>

              {audioBlob && (
                <>
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

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> This uses your browser's built-in text-to-speech (completely free!). 
                For higher quality voices, you can integrate with ElevenLabs or OpenAI TTS (requires API key).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
