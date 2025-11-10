import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Eye, EyeOff, Image as ImageIcon, Video } from "lucide-react";
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
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoFrames, setVideoFrames] = useState<string[]>([]);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(null);

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

  const generateVideoFrames = (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      
      const frames: string[] = [];
      const timestamps = [0.5, 1.5, 3, 5, 7]; // Capture frames at these seconds
      let currentIndex = 0;
      
      video.onloadedmetadata = () => {
        const maxTime = video.duration;
        // Adjust timestamps based on actual video duration
        const adjustedTimestamps = timestamps
          .filter(t => t < maxTime)
          .concat(maxTime > 10 ? [maxTime * 0.3, maxTime * 0.5, maxTime * 0.7] : []);
        
        const captureFrame = (time: number) => {
          return new Promise<string>((res, rej) => {
            video.currentTime = time;
            video.onseeked = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
              canvas.toBlob((blob) => {
                if (blob) {
                  res(URL.createObjectURL(blob));
                } else {
                  rej(new Error('Failed to generate frame'));
                }
              }, 'image/jpeg', 0.8);
            };
          });
        };
        
        Promise.all(adjustedTimestamps.slice(0, 6).map(captureFrame))
          .then(frameUrls => {
            URL.revokeObjectURL(video.src);
            resolve(frameUrls);
          })
          .catch(err => {
            URL.revokeObjectURL(video.src);
            reject(err);
          });
      };
      
      video.onerror = () => {
        reject(new Error('Failed to load video'));
        URL.revokeObjectURL(video.src);
      };
    });
  };

  const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        video.currentTime = 1; // Capture frame at 1 second
      };
      
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Failed to generate thumbnail'));
          }
          URL.revokeObjectURL(video.src);
        }, 'image/jpeg', 0.8);
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

    // Clear previous video frames
    videoFrames.forEach(frame => URL.revokeObjectURL(frame));
    setVideoFrames([]);
    setSelectedFrameIndex(null);
    
    if (file) {
      if (file.type.startsWith('image/')) {
        setMediaPreview(URL.createObjectURL(file));
      } else if (file.type.startsWith('video/')) {
        try {
          const frames = await generateVideoFrames(file);
          setVideoFrames(frames);
          setSelectedFrameIndex(0); // Select first frame by default
          setMediaPreview(frames[0]);
        } catch (error) {
          console.error('Error generating video frames:', error);
        }
      }
    }
  };

  const handleFrameSelect = (index: number) => {
    setSelectedFrameIndex(index);
    setMediaPreview(videoFrames[index]);
    // Also set this as the thumbnail preview
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
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

  const convertBlobUrlToFile = async (blobUrl: string, filename: string): Promise<File> => {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new File([blob], filename, { type: 'image/jpeg' });
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

        // If it's a video and a frame was selected, use that as thumbnail
        if (mediaType === "video" && selectedFrameIndex !== null && videoFrames[selectedFrameIndex]) {
          const thumbnailBlob = await convertBlobUrlToFile(
            videoFrames[selectedFrameIndex],
            `thumb_${Date.now()}.jpg`
          );
          const thumbName = `thumb_${Date.now()}.jpg`;
          
          const { error: thumbError } = await supabase.storage
            .from("stories")
            .upload(thumbName, thumbnailBlob);

          if (!thumbError) {
            thumbnailUrl = thumbName;
          }
        }
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

  const resetForm = () => {
    setFormData({ title: "", display_order: 0, published: false });
    setMediaFile(null);
    setThumbnailFile(null);
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    videoFrames.forEach(frame => URL.revokeObjectURL(frame));
    setMediaPreview(null);
    setThumbnailPreview(null);
    setVideoFrames([]);
    setSelectedFrameIndex(null);
    setEditingStory(null);
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
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
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
                  <div className="mt-3 space-y-2">
                    <Label className="text-sm">Select Thumbnail Frame:</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {videoFrames.map((frame, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleFrameSelect(index)}
                          className={`relative rounded-md overflow-hidden border-2 transition-all ${
                            selectedFrameIndex === index 
                              ? 'border-primary ring-2 ring-primary' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <img 
                            src={frame} 
                            alt={`Frame ${index + 1}`} 
                            className="w-full h-20 object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="thumbnail">Custom Thumbnail (Optional)</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleThumbnailFileChange(e.target.files?.[0] || null)}
                />
                {thumbnailPreview && !videoFrames.length && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-border">
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail preview" 
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
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