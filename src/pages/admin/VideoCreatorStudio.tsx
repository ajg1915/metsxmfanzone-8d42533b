import { useState, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Wand2, 
  Image, 
  Video, 
  Upload, 
  Play, 
  Download, 
  Trash2, 
  Plus,
  Loader2,
  GripVertical,
  Clock,
  Sparkles,
  Edit3,
  Film,
  Zap
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";

interface ImageItem {
  id: string;
  url: string;
  duration: number; // seconds per image
}

interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
}

export default function VideoCreatorStudio() {
  const { toast } = useToast();
  
  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  
  // Image Editing State
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditingImage, setIsEditingImage] = useState(false);
  
  // Video Creation State
  const [videoImages, setVideoImages] = useState<ImageItem[]>([]);
  const [transitionType, setTransitionType] = useState<"fade" | "slide" | "none">("fade");
  const [transitionDuration, setTransitionDuration] = useState(0.5);
  const [isCreatingVideo, setIsCreatingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  
  // AI Video Generation State
  const [aiVideoImageUrl, setAiVideoImageUrl] = useState("");
  const [aiVideoPrompt, setAiVideoPrompt] = useState("");
  const [isGeneratingAiVideo, setIsGeneratingAiVideo] = useState(false);
  const [generatedAiVideoUrl, setGeneratedAiVideoUrl] = useState<string | null>(null);
  const [aiVideoDuration, setAiVideoDuration] = useState<5 | 10>(5);
  const aiVideoFileInputRef = useRef<HTMLInputElement>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate image from text using Lovable AI
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast({ title: "Enter a prompt", description: "Please describe the image you want to generate", variant: "destructive" });
      return;
    }

    setIsGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-image', {
        body: { prompt: imagePrompt }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        const newImage: GeneratedImage = {
          id: crypto.randomUUID(),
          prompt: imagePrompt,
          url: data.imageUrl
        };
        setGeneratedImages(prev => [newImage, ...prev]);
        toast({ title: "Image generated!", description: "Your AI image is ready" });
        setImagePrompt("");
      }
    } catch (error: any) {
      console.error("Image generation error:", error);
      toast({ 
        title: "Generation failed", 
        description: error.message || "Failed to generate image", 
        variant: "destructive" 
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Edit existing image using AI
  const handleEditImage = async () => {
    if (!editImageUrl.trim() || !editPrompt.trim()) {
      toast({ title: "Missing inputs", description: "Provide both an image URL and edit instructions", variant: "destructive" });
      return;
    }

    setIsEditingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('edit-ai-image', {
        body: { imageUrl: editImageUrl, prompt: editPrompt }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        const newImage: GeneratedImage = {
          id: crypto.randomUUID(),
          prompt: `Edited: ${editPrompt}`,
          url: data.imageUrl
        };
        setGeneratedImages(prev => [newImage, ...prev]);
        toast({ title: "Image edited!", description: "Your edited image is ready" });
        setEditPrompt("");
      }
    } catch (error: any) {
      console.error("Image edit error:", error);
      toast({ 
        title: "Edit failed", 
        description: error.message || "Failed to edit image", 
        variant: "destructive" 
      });
    } finally {
      setIsEditingImage(false);
    }
  };

  // Handle AI video image upload
  const handleAiVideoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAiVideoImageUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Generate AI video from image using Lovable's free API
  const handleGenerateAiVideo = async () => {
    if (!aiVideoImageUrl.trim()) {
      toast({ title: "Upload an image", description: "Please upload or provide an image URL to animate", variant: "destructive" });
      return;
    }

    if (!aiVideoPrompt.trim()) {
      toast({ title: "Enter a prompt", description: "Describe how you want the image to be animated", variant: "destructive" });
      return;
    }

    setIsGeneratingAiVideo(true);
    setGeneratedAiVideoUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-video', {
        body: { 
          imageUrl: aiVideoImageUrl,
          prompt: aiVideoPrompt,
          duration: aiVideoDuration
        }
      });

      if (error) throw error;

      if (data?.videoUrl) {
        setGeneratedAiVideoUrl(data.videoUrl);
        toast({ title: "AI Video generated!", description: "Your animated video is ready" });
      }
    } catch (error: any) {
      console.error("AI video generation error:", error);
      toast({ 
        title: "Video generation failed", 
        description: error.message || "Failed to generate AI video", 
        variant: "destructive" 
      });
    } finally {
      setIsGeneratingAiVideo(false);
    }
  };

  // Use generated image for AI video
  const useImageForAiVideo = (url: string) => {
    setAiVideoImageUrl(url);
    toast({ title: "Image selected", description: "Switch to AI Video tab to animate it" });
  };

  // Add image to video timeline
  const addToTimeline = (url: string) => {
    const newItem: ImageItem = {
      id: crypto.randomUUID(),
      url,
      duration: 3
    };
    setVideoImages(prev => [...prev, newItem]);
    toast({ title: "Added to timeline", description: "Image added to your video" });
  };

  // Upload image from file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        addToTimeline(url);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image from timeline
  const removeFromTimeline = (id: string) => {
    setVideoImages(prev => prev.filter(img => img.id !== id));
  };

  // Update image duration
  const updateDuration = (id: string, duration: number) => {
    setVideoImages(prev => prev.map(img => 
      img.id === id ? { ...img, duration } : img
    ));
  };

  // Create video from images using Canvas + MediaRecorder
  const createVideo = useCallback(async () => {
    if (videoImages.length < 2) {
      toast({ title: "Need more images", description: "Add at least 2 images to create a video", variant: "destructive" });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsCreatingVideo(true);
    setVideoProgress(0);
    setVideoUrl(null);

    try {
      const ctx = canvas.getContext('2d')!;
      canvas.width = 1920;
      canvas.height = 1080;

      // Load all images first
      const loadedImages = await Promise.all(
        videoImages.map(item => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new window.Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = item.url;
          });
        })
      );

      // Setup MediaRecorder
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000
      });
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setIsCreatingVideo(false);
        setVideoProgress(100);
        toast({ title: "Video created!", description: "Your slideshow video is ready to download" });
      };

      mediaRecorder.start();

      // Calculate total frames
      const fps = 30;
      const totalDuration = videoImages.reduce((sum, img) => sum + img.duration, 0);
      const transitionFrames = Math.floor(transitionDuration * fps);
      let currentFrame = 0;
      const totalFrames = Math.floor(totalDuration * fps);

      // Draw each image with transitions
      for (let i = 0; i < videoImages.length; i++) {
        const img = loadedImages[i];
        const duration = videoImages[i].duration;
        const frames = Math.floor(duration * fps);

        for (let frame = 0; frame < frames; frame++) {
          currentFrame++;
          setVideoProgress(Math.floor((currentFrame / totalFrames) * 100));

          // Clear canvas
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Calculate transition opacity
          let opacity = 1;
          if (transitionType === 'fade') {
            if (frame < transitionFrames) {
              opacity = frame / transitionFrames;
            } else if (frame > frames - transitionFrames) {
              opacity = (frames - frame) / transitionFrames;
            }
          }

          // Draw image with cover fit
          ctx.globalAlpha = opacity;
          const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
          const x = (canvas.width - img.width * scale) / 2;
          const y = (canvas.height - img.height * scale) / 2;
          
          if (transitionType === 'slide' && frame < transitionFrames) {
            const slideX = x - canvas.width + (frame / transitionFrames) * canvas.width;
            ctx.drawImage(img, slideX, y, img.width * scale, img.height * scale);
          } else {
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          }
          
          ctx.globalAlpha = 1;

          // Wait for next frame
          await new Promise(resolve => setTimeout(resolve, 1000 / fps));
        }
      }

      mediaRecorder.stop();
    } catch (error: any) {
      console.error("Video creation error:", error);
      toast({ title: "Video creation failed", description: error.message, variant: "destructive" });
      setIsCreatingVideo(false);
    }
  }, [videoImages, transitionType, transitionDuration, toast]);

  return (
    <>
      <Helmet>
        <title>Video Creator Studio | Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Video className="w-8 h-8 text-primary" />
            Video Creator Studio
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate AI images and create slideshow videos
          </p>
        </div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline">Generate</span> Images
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span> Images
            </TabsTrigger>
            <TabsTrigger value="ai-video" className="flex items-center gap-2">
              <Film className="w-4 h-4" />
              AI Video
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Slideshow
            </TabsTrigger>
          </TabsList>

          {/* AI Image Generation Tab */}
          <TabsContent value="generate" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Image Generator
                </CardTitle>
                <CardDescription>
                  Generate images from text descriptions using AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Describe your image</Label>
                  <Textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="A vibrant Mets baseball game at Citi Field during sunset, fans cheering, detailed illustration style..."
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleGenerateImage} 
                  disabled={isGeneratingImage}
                  className="w-full"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Images Gallery */}
            {generatedImages.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Generated Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <AnimatePresence>
                      {generatedImages.map((img) => (
                        <motion.div
                          key={img.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="relative group aspect-video rounded-lg overflow-hidden border"
                        >
                          <img 
                            src={img.url} 
                            alt={img.prompt}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                            <p className="text-xs text-white text-center line-clamp-2">{img.prompt}</p>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                onClick={() => addToTimeline(img.url)}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Slideshow
                              </Button>
                              <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={() => useImageForAiVideo(img.url)}
                              >
                                <Film className="w-3 h-3 mr-1" />
                                AI Video
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI Image Editing Tab */}
          <TabsContent value="edit" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-primary" />
                  AI Image Editor
                </CardTitle>
                <CardDescription>
                  Edit and enhance images using AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg or paste a data URL"
                  />
                </div>
                {editImageUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
                    <img 
                      src={editImageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Edit Instructions</Label>
                  <Textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="Add a dramatic sunset sky, make it look more vibrant, add confetti..."
                    rows={2}
                  />
                </div>
                <Button 
                  onClick={handleEditImage} 
                  disabled={isEditingImage}
                  className="w-full"
                >
                  {isEditingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Editing...
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Image
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Video Generation Tab - FREE */}
          <TabsContent value="ai-video" className="space-y-6">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-primary" />
                  AI Video Generator
                  <span className="ml-2 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    FREE
                  </span>
                </CardTitle>
                <CardDescription>
                  Upload an image and AI will animate it into a video - no API keys required!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Starting Image</Label>
                  <div className="flex gap-2">
                    <Input
                      value={aiVideoImageUrl}
                      onChange={(e) => setAiVideoImageUrl(e.target.value)}
                      placeholder="Paste image URL or upload below"
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => aiVideoFileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Upload
                    </Button>
                    <input
                      ref={aiVideoFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAiVideoImageUpload}
                    />
                  </div>
                </div>

                {/* Image Preview */}
                {aiVideoImageUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
                    <img 
                      src={aiVideoImageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Animation Prompt */}
                <div className="space-y-2">
                  <Label>Animation Description</Label>
                  <Textarea
                    value={aiVideoPrompt}
                    onChange={(e) => setAiVideoPrompt(e.target.value)}
                    placeholder="Describe the motion: gentle ocean waves, slow camera pan, crowd cheering, player swinging bat..."
                    rows={2}
                  />
                </div>

                {/* Duration Selection */}
                <div className="space-y-2">
                  <Label>Video Duration</Label>
                  <Select 
                    value={String(aiVideoDuration)} 
                    onValueChange={(v) => setAiVideoDuration(Number(v) as 5 | 10)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 seconds (faster)</SelectItem>
                      <SelectItem value="10">10 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Generate Button */}
                <Button 
                  onClick={handleGenerateAiVideo} 
                  disabled={isGeneratingAiVideo || !aiVideoImageUrl || !aiVideoPrompt}
                  className="w-full"
                  size="lg"
                >
                  {isGeneratingAiVideo ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating AI Video... (this may take 1-2 min)
                    </>
                  ) : (
                    <>
                      <Film className="w-4 h-4 mr-2" />
                      Generate AI Video
                    </>
                  )}
                </Button>

                {/* Generated Video */}
                {generatedAiVideoUrl && (
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Generated Video
                    </h4>
                    <video 
                      src={generatedAiVideoUrl} 
                      controls 
                      autoPlay
                      loop
                      className="w-full rounded-lg"
                    />
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = generatedAiVideoUrl;
                        a.download = `ai-video-${Date.now()}.mp4`;
                        a.click();
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Video
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm">Tips for Best Results</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Use high-quality images (1080p or higher)</p>
                <p>• Describe specific motion: "slow pan left", "zoom in", "waves crashing"</p>
                <p>• Mention camera movement for cinematic effects</p>
                <p>• The AI works best with photos and illustrations</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Creation Tab */}
          <TabsContent value="video" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Timeline */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Image className="w-5 h-5" />
                      Video Timeline
                    </span>
                    <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-1" />
                      Upload
                    </Button>
                  </CardTitle>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </CardHeader>
                <CardContent>
                  {videoImages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No images in timeline</p>
                      <p className="text-sm">Generate or upload images to get started</p>
                    </div>
                  ) : (
                    <Reorder.Group 
                      axis="y" 
                      values={videoImages} 
                      onReorder={setVideoImages}
                      className="space-y-2"
                    >
                      {videoImages.map((item) => (
                        <Reorder.Item key={item.id} value={item}>
                          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 border cursor-move">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                            <div className="w-20 h-12 rounded overflow-hidden">
                              <img src={item.url} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <Input
                                type="number"
                                min={1}
                                max={30}
                                value={item.duration}
                                onChange={(e) => updateDuration(item.id, Number(e.target.value))}
                                className="w-16 h-8"
                              />
                              <span className="text-sm text-muted-foreground">sec</span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => removeFromTimeline(item.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  )}
                </CardContent>
              </Card>

              {/* Video Settings & Preview */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Video Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Transition Effect</Label>
                    <Select value={transitionType} onValueChange={(v: any) => setTransitionType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fade">Fade</SelectItem>
                        <SelectItem value="slide">Slide</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Transition Duration: {transitionDuration}s</Label>
                    <Slider
                      value={[transitionDuration]}
                      onValueChange={([v]) => setTransitionDuration(v)}
                      min={0.2}
                      max={2}
                      step={0.1}
                    />
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Total Duration: {videoImages.reduce((sum, img) => sum + img.duration, 0)} seconds
                  </div>

                  {isCreatingVideo && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Creating video...</span>
                        <span>{videoProgress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${videoProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={createVideo}
                    disabled={isCreatingVideo || videoImages.length < 2}
                    className="w-full"
                  >
                    {isCreatingVideo ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Video...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Create Video
                      </>
                    )}
                  </Button>

                  {videoUrl && (
                    <div className="space-y-3">
                      <video 
                        src={videoUrl} 
                        controls 
                        className="w-full rounded-lg"
                      />
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = videoUrl;
                          a.download = 'slideshow-video.webm';
                          a.click();
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Video
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Hidden canvas for video generation */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </>
  );
}
