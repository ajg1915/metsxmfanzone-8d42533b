import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Eye, EyeOff, Image as ImageIcon, Video, Sparkles, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Story {
  id: string;
  title: string;
  media_url: string;
  media_type: 'image' | 'video';
  thumbnail_url: string | null;
  duration: number | null;
  display_order: number;
  published: boolean;
  created_at: string;
  link_url: string | null;
}

const StoriesManagement = () => {
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    display_order: 0,
    published: false,
    link_url: "",
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoFrames, setVideoFrames] = useState<string[]>([]);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number>(0);

  // AI Video Generation states
  const [aiImageFile, setAiImageFile] = useState<File | null>(null);
  const [aiImagePreview, setAiImagePreview] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>("");

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStories((data || []).map(story => ({
        ...story,
        media_type: story.media_type as 'image' | 'video'
      })));
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast({
        title: "Error",
        description: "Failed to fetch stories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mediaFile && !editingStory) {
      toast({
        title: "Error",
        description: "Please select a media file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      let mediaUrl = editingStory?.media_url || "";
      let thumbnailUrl = editingStory?.thumbnail_url || null;
      let mediaType = editingStory?.media_type || "image";

      if (mediaFile) {
        mediaType = mediaFile.type.startsWith("video/") ? "video" : "image";
        const fileExt = mediaFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("stories")
          .upload(fileName, mediaFile);

        if (uploadError) throw uploadError;
        mediaUrl = fileName;
      }

      if (thumbnailFile) {
        const thumbExt = thumbnailFile.name.split(".").pop();
        const thumbName = `thumb_${Date.now()}.${thumbExt}`;

        const { error: thumbError } = await supabase.storage
          .from("stories")
          .upload(thumbName, thumbnailFile);

        if (thumbError) throw thumbError;
        thumbnailUrl = thumbName;
      }

      const storyData = {
        title: formData.title,
        media_url: mediaUrl,
        media_type: mediaType,
        thumbnail_url: thumbnailUrl,
        display_order: formData.display_order,
        published: formData.published,
        link_url: formData.link_url || null,
      };

      if (editingStory) {
        const { error } = await supabase
          .from("stories")
          .update(storyData)
          .eq("id", editingStory.id);

        if (error) throw error;
        toast({ title: "Success", description: "Story updated successfully" });
      } else {
        const { error } = await supabase.from("stories").insert(storyData);

        if (error) throw error;
        toast({ title: "Success", description: "Story created successfully" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchStories();
    } catch (error: any) {
      console.error("Error saving story:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, mediaUrl: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;

    try {
      const fileName = mediaUrl.split('/stories/')[1] || mediaUrl;
      await supabase.storage.from("stories").remove([fileName]);

      const { error } = await supabase.from("stories").delete().eq("id", id);

      if (error) throw error;

      toast({ title: "Success", description: "Story deleted successfully" });
      fetchStories();
    } catch (error: any) {
      console.error("Error deleting story:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const togglePublished = async (story: Story) => {
    try {
      const { error } = await supabase
        .from("stories")
        .update({ published: !story.published })
        .eq("id", story.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Story ${!story.published ? "published" : "unpublished"}`,
      });
      fetchStories();
    } catch (error: any) {
      console.error("Error updating story:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (story: Story) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      display_order: story.display_order,
      published: story.published,
      link_url: story.link_url || "",
    });
    setIsDialogOpen(true);
  };

  const generateVideoFrames = (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const frames: string[] = [];
      
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        const duration = video.duration;
        const frameTimes = [
          duration * 0.1,
          duration * 0.3,
          duration * 0.5,
          duration * 0.7,
          duration * 0.9
        ];
        
        let currentFrameIndex = 0;
        
        const captureFrame = () => {
          if (currentFrameIndex >= frameTimes.length) {
            URL.revokeObjectURL(video.src);
            resolve(frames);
            return;
          }
          
          video.currentTime = frameTimes[currentFrameIndex];
        };
        
        video.onseeked = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              frames.push(URL.createObjectURL(blob));
              currentFrameIndex++;
              captureFrame();
            }
          }, 'image/jpeg', 0.8);
        };
        
        captureFrame();
      };
      
      video.onerror = () => {
        reject(new Error('Failed to load video'));
        URL.revokeObjectURL(video.src);
      };
    });
  };

  const handleMediaFileChange = async (file: File | null) => {
    setMediaFile(file);
    
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
      setMediaPreview(null);
    }
    
    videoFrames.forEach(frame => URL.revokeObjectURL(frame));
    setVideoFrames([]);
    setSelectedFrameIndex(0);
    
    if (file) {
      if (file.type.startsWith('image/')) {
        setMediaPreview(URL.createObjectURL(file));
      } else if (file.type.startsWith('video/')) {
        try {
          const frames = await generateVideoFrames(file);
          setVideoFrames(frames);
          setMediaPreview(frames[0]);
        } catch (error) {
          console.error('Error generating video frames:', error);
        }
      }
    }
  };

  const handleFrameSelect = async (index: number) => {
    setSelectedFrameIndex(index);
    setMediaPreview(videoFrames[index]);
    
    // Convert selected frame to blob/file for upload
    const response = await fetch(videoFrames[index]);
    const blob = await response.blob();
    const file = new File([blob], `thumbnail_${Date.now()}.jpg`, { type: 'image/jpeg' });
    setThumbnailFile(file);
    setThumbnailPreview(videoFrames[index]);
  };

  const handleThumbnailFileChange = (file: File | null) => {
    setThumbnailFile(file);
    
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview(null);
    }
    
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({ title: "", display_order: 0, published: false, link_url: "" });
    setMediaFile(null);
    setThumbnailFile(null);
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    videoFrames.forEach(frame => URL.revokeObjectURL(frame));
    setMediaPreview(null);
    setThumbnailPreview(null);
    setVideoFrames([]);
    setSelectedFrameIndex(0);
    setEditingStory(null);
  };

  const handleAiImageChange = (file: File | null) => {
    setAiImageFile(file);
    if (aiImagePreview) {
      URL.revokeObjectURL(aiImagePreview);
    }
    if (file) {
      setAiImagePreview(URL.createObjectURL(file));
    } else {
      setAiImagePreview(null);
    }
  };

  const handleGenerateVideo = async () => {
    if (!aiImageFile) {
      toast({
        title: "Error",
        description: "Please select an image first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingVideo(true);
    setGenerationProgress("Uploading image...");

    try {
      // Upload image to Supabase storage first
      const fileExt = aiImageFile.name.split(".").pop();
      const fileName = `ai_input_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("stories")
        .upload(fileName, aiImageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("stories")
        .getPublicUrl(fileName);

      setGenerationProgress("Starting AI video generation...");

      // Call edge function to start video generation
      const { data: startData, error: startError } = await supabase.functions.invoke(
        "generate-video",
        {
          body: { imageUrl: publicUrl },
        }
      );

      if (startError) throw startError;

      const predictionId = startData.id;
      setGenerationProgress("Processing video... This may take 1-2 minutes");

      // Poll for completion
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        
        const { data: statusData, error: statusError } = await supabase.functions.invoke(
          "generate-video",
          {
            body: { predictionId },
          }
        );

        if (statusError) throw statusError;

        if (statusData.status === "succeeded") {
          setGenerationProgress("Downloading video...");
          
          // Download the generated video
          const videoUrl = statusData.output[0];
          const videoResponse = await fetch(videoUrl);
          const videoBlob = await videoResponse.blob();
          
          // Upload to Supabase storage
          const videoFileName = `ai_generated_${Date.now()}.mp4`;
          const { error: videoUploadError } = await supabase.storage
            .from("stories")
            .upload(videoFileName, videoBlob);

          if (videoUploadError) throw videoUploadError;

          toast({
            title: "Success!",
            description: "AI video generated successfully! You can now add it as a story.",
          });

          // Clean up
          setAiImageFile(null);
          if (aiImagePreview) URL.revokeObjectURL(aiImagePreview);
          setAiImagePreview(null);
          setGenerationProgress("");
          
          // Refresh stories to show the new option
          await fetchStories();
          break;
        } else if (statusData.status === "failed") {
          throw new Error("Video generation failed");
        }
        
        attempts++;
        setGenerationProgress(`Processing video... ${Math.min(Math.round((attempts / maxAttempts) * 100), 95)}%`);
      }

      if (attempts >= maxAttempts) {
        throw new Error("Video generation timed out");
      }

    } catch (error) {
      console.error("Error generating video:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate video",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingVideo(false);
      setGenerationProgress("");
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Stories Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Story
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingStory ? "Edit Story" : "Add New Story"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="media">Media File (Image or Video)</Label>
                <Input
                  id="media"
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => handleMediaFileChange(e.target.files?.[0] || null)}
                  required={!editingStory}
                />
                {mediaPreview && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-border">
                    <img 
                      src={mediaPreview} 
                      alt="Media preview" 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                
                {videoFrames.length > 0 && (
                  <div className="mt-3">
                    <Label className="text-sm">Select Thumbnail Frame</Label>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {videoFrames.map((frame, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleFrameSelect(index)}
                          className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                            selectedFrameIndex === index 
                              ? 'border-primary ring-2 ring-primary/20' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <img 
                            src={frame} 
                            alt={`Frame ${index + 1}`}
                            className="w-full h-16 object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="link">Article Link (Optional)</Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://example.com/article"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                />
                <Label htmlFor="published">Published</Label>
              </div>

              <Button type="submit" disabled={uploading} className="w-full">
                {uploading ? "Uploading..." : editingStory ? "Update Story" : "Create Story"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* AI Video Generator Section */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Video Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Transform your images into animated videos using AI. Upload an image and let AI bring it to life!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-3">
              <Label htmlFor="ai-image">Upload Image</Label>
              <div className="flex gap-2">
                <Input
                  id="ai-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAiImageChange(e.target.files?.[0] || null)}
                  disabled={isGeneratingVideo}
                  className="flex-1"
                />
                <Button
                  onClick={handleGenerateVideo}
                  disabled={!aiImageFile || isGeneratingVideo}
                  className="min-w-[140px]"
                >
                  {isGeneratingVideo ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Video
                    </>
                  )}
                </Button>
              </div>
              {generationProgress && (
                <p className="text-sm text-primary animate-pulse">
                  {generationProgress}
                </p>
              )}
            </div>
            
            {aiImagePreview && (
              <div className="w-full sm:w-48">
                <Label>Preview</Label>
                <div className="mt-2 rounded-lg overflow-hidden border-2 border-border">
                  <img
                    src={aiImagePreview}
                    alt="AI input preview"
                    className="w-full h-32 object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">Loading stories...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story) => (
            <Card key={story.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{story.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {story.media_type === 'video' ? (
                        <Video className="w-4 h-4 text-primary" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-primary" />
                      )}
                      <span className="text-sm text-muted-foreground capitalize">
                        {story.media_type}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(story.created_at).toLocaleDateString()}
                    </div>
                    {story.link_url && (
                      <a 
                        href={story.link_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-1 block truncate"
                      >
                        View Article →
                      </a>
                    )}
                  </div>
                  <Button
                    variant={story.published ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePublished(story)}
                  >
                    {story.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(story)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(story.id, story.media_url)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && stories.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No stories yet. Create your first story!
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StoriesManagement;