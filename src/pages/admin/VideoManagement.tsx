import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Edit, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Video {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  video_type: 'highlight' | 'replay' | 'live_stream';
  category: string;
  duration: number;
  published: boolean;
  published_at: string;
  created_at: string;
}

export default function VideoManagement() {
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [uploading, setUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatingThumbnail, setGeneratingThumbnail] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    thumbnail_url: "",
    video_type: "highlight" as 'highlight' | 'replay' | 'live_stream',
    category: "General",
    duration: 0,
    published: false,
  });

  const generateThumbnailFromVideo = async (videoFile: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        // Set canvas size to video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Seek to 2 seconds or 10% of video duration
        const seekTime = Math.min(2, video.duration * 0.1);
        video.currentTime = seekTime;
      };

      video.onseeked = () => {
        try {
          // Draw video frame to canvas
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Convert canvas to blob
          canvas.toBlob((blob) => {
            if (blob) {
              const thumbnailFile = new File(
                [blob],
                `thumbnail-${Date.now()}.jpg`,
                { type: 'image/jpeg' }
              );
              URL.revokeObjectURL(video.src);
              resolve(thumbnailFile);
            } else {
              reject(new Error('Failed to generate thumbnail'));
            }
          }, 'image/jpeg', 0.9);
        } catch (error) {
          URL.revokeObjectURL(video.src);
          reject(error);
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video'));
      };

      video.src = URL.createObjectURL(videoFile);
    });
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data as Video[] || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast({
        title: "Error",
        description: "Failed to load videos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let videoUrl = formData.video_url;
      let thumbnailUrl = formData.thumbnail_url;

      // Upload video file if provided
      if (videoFile) {
        setUploadProgress(10);
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        setUploadProgress(30);
        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(filePath, videoFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        setUploadProgress(50);
        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(filePath);

        videoUrl = publicUrl;

        // Auto-generate thumbnail if not provided
        if (!thumbnailFile) {
          try {
            setGeneratingThumbnail(true);
            setUploadProgress(60);
            const generatedThumbnail = await generateThumbnailFromVideo(videoFile);
            setUploadProgress(70);
            
            const thumbnailFileName = `thumbnail-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
            const { error: thumbUploadError } = await supabase.storage
              .from('videos')
              .upload(thumbnailFileName, generatedThumbnail);

            if (!thumbUploadError) {
              const { data: { publicUrl: thumbPublicUrl } } = supabase.storage
                .from('videos')
                .getPublicUrl(thumbnailFileName);
              thumbnailUrl = thumbPublicUrl;
            }
          } catch (error) {
            console.error('Error generating thumbnail:', error);
            toast({
              title: "Warning",
              description: "Video uploaded but thumbnail generation failed",
              variant: "default",
            });
          } finally {
            setGeneratingThumbnail(false);
          }
        }
        setUploadProgress(90);
      }

      // Upload thumbnail file if provided
      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split('.').pop();
        const fileName = `thumbnail-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(filePath, thumbnailFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(filePath);

        thumbnailUrl = publicUrl;
      }

      const videoData = {
        ...formData,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        published_at: formData.published ? new Date().toISOString() : null,
      };

      if (editingVideo) {
        const { error } = await supabase
          .from("videos")
          .update(videoData)
          .eq("id", editingVideo.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Video updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("videos")
          .insert([videoData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Video created successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchVideos();
    } catch (error) {
      console.error("Error saving video:", error);
      toast({
        title: "Error",
        description: "Failed to save video",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setGeneratingThumbnail(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
      fetchVideos();
    } catch (error) {
      console.error("Error deleting video:", error);
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || "",
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url || "",
      video_type: video.video_type,
      category: video.category,
      duration: video.duration || 0,
      published: video.published,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingVideo(null);
    setVideoFile(null);
    setThumbnailFile(null);
    setUploadProgress(0);
    setFormData({
      title: "",
      description: "",
      video_url: "",
      thumbnail_url: "",
      video_type: "highlight",
      category: "General",
      duration: 0,
      published: false,
    });
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Video Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingVideo ? "Edit Video" : "Add New Video"}</DialogTitle>
              <DialogDescription>
                {editingVideo ? "Update video details" : "Add a new video to your collection"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="video_file">Upload Video (MP4) *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="video_file"
                    type="file"
                    accept="video/mp4"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.type !== 'video/mp4') {
                          toast({
                            title: "Error",
                            description: "Please upload an MP4 file",
                            variant: "destructive",
                          });
                          e.target.value = '';
                          return;
                        }
                        setVideoFile(file);
                      }
                    }}
                    disabled={uploading}
                    required={!editingVideo && !formData.video_url}
                  />
                  <Upload className="w-4 h-4 text-muted-foreground" />
                </div>
                {videoFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                {editingVideo && formData.video_url && !videoFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Current video will be kept if no new file is uploaded
                  </p>
                )}
                {uploading && uploadProgress > 0 && (
                  <div className="mt-2">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {generatingThumbnail ? 'Generating thumbnail...' : `Uploading... ${uploadProgress}%`}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="thumbnail_file">Upload Custom Thumbnail (Optional)</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  If not provided, a thumbnail will be auto-generated from the video
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    id="thumbnail_file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                    disabled={uploading}
                  />
                  <Upload className="w-4 h-4 text-muted-foreground" />
                </div>
                {thumbnailFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Custom thumbnail selected: {thumbnailFile.name}
                  </p>
                )}
                {editingVideo && formData.thumbnail_url && !thumbnailFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Current thumbnail will be kept if no new file is uploaded
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="video_type">Video Type *</Label>
                  <Select
                    value={formData.video_type}
                    onValueChange={(value: 'highlight' | 'replay' | 'live_stream') =>
                      setFormData({ ...formData, video_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="highlight">Highlight</SelectItem>
                      <SelectItem value="replay">Replay</SelectItem>
                      <SelectItem value="live_stream">Live Stream</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                />
                <Label htmlFor="published">Published</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} disabled={uploading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading || (!videoFile && !editingVideo)}>
                  {uploading ? "Uploading..." : editingVideo ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading videos...</div>
      ) : videos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No videos yet. Click "Add Video" to create your first video.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Card key={video.id}>
              <CardHeader>
                <div className="aspect-video overflow-hidden rounded-lg mb-2 bg-muted">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No thumbnail
                    </div>
                  )}
                </div>
                <CardTitle className="line-clamp-2">{video.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <p>Type: {video.video_type}</p>
                  <p>Category: {video.category}</p>
                  <p>Status: {video.published ? "Published" : "Draft"}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(video)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(video.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
