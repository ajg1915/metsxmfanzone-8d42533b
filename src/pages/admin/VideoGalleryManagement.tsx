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
import { Trash2, Plus, Edit, Upload, Sparkles, Film, Download, RefreshCw, ImagePlus } from "lucide-react";
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
  thumbnail_gif_url?: string;
  video_type: string;
  category: string;
  duration: number;
  published: boolean;
  published_at: string;
  created_at: string;
}

export default function VideoGalleryManagement() {
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
  const [generatingGif, setGeneratingGif] = useState(false);
  const [fetchingMLBHighlights, setFetchingMLBHighlights] = useState(false);
  const [extractedFrames, setExtractedFrames] = useState<string[]>([]);
  const [extractingFrames, setExtractingFrames] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'youtube' | 'link'>('file');
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    thumbnail_url: "",
    thumbnail_gif_url: "",
    video_type: "highlight",
    category: "General",
    duration: 0,
    published: false,
  });

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
      setVideos(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching videos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateThumbnailFromVideo = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        video.currentTime = 1;
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            } else {
              reject(new Error('Failed to generate thumbnail'));
            }
          }, 'image/jpeg', 0.8);
        }
      };
      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(file);
    });
  };

  const generateGifPreview = async (videoUrl: string, videoId?: string): Promise<string | null> => {
    try {
      setGeneratingGif(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await supabase.functions.invoke("generate-video-gif", {
        body: { videoUrl, videoId },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate GIF preview");
      }

      return response.data?.gifUrl || null;
    } catch (error) {
      console.error("Error generating GIF preview:", error);
      return null;
    } finally {
      setGeneratingGif(false);
    }
  };

  const extractFramesFromVideo = async (file: File) => {
    setExtractingFrames(true);
    setExtractedFrames([]);
    try {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.src = URL.createObjectURL(file);

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('Failed to load video'));
      });

      const duration = video.duration;
      // Extract 6 frames at evenly spaced intervals
      const frameCount = 6;
      const times = Array.from({ length: frameCount }, (_, i) =>
        Math.min(duration * ((i + 1) / (frameCount + 1)), duration - 0.1)
      );

      const frames: string[] = [];
      for (const time of times) {
        video.currentTime = time;
        await new Promise<void>((resolve) => {
          video.onseeked = () => resolve();
        });
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames.push(canvas.toDataURL('image/jpeg', 0.85));
        }
      }

      URL.revokeObjectURL(video.src);
      setExtractedFrames(frames);
      toast({ title: `${frames.length} frames extracted`, description: "Select one as your thumbnail." });
    } catch (error: any) {
      console.error('Frame extraction error:', error);
      toast({ title: "Failed to extract frames", description: error.message, variant: "destructive" });
    } finally {
      setExtractingFrames(false);
    }
  };

  const fetchMLBHighlights = async () => {
    setFetchingMLBHighlights(true);
    try {
      const response = await supabase.functions.invoke("fetch-mets-highlights");
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to fetch MLB highlights");
      }

      const data = response.data;
      const newHighlights = data?.highlights?.filter((h: any) => h.status === 'new')?.length || 0;
      
      toast({
        title: "MLB Highlights Synced",
        description: newHighlights > 0 
          ? `Added ${newHighlights} new Mets highlights from recent games!`
          : "All highlights are up to date.",
      });
      
      fetchVideos();
    } catch (error: any) {
      toast({
        title: "Error fetching MLB highlights",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFetchingMLBHighlights(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let videoUrl = formData.video_url;
      let thumbnailUrl = formData.thumbnail_url;
      let thumbnailGifUrl = formData.thumbnail_gif_url;
      let duration = formData.duration;

      // Handle file upload method
      if (uploadMethod === 'file' && videoFile) {
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        const objectUrl = URL.createObjectURL(videoFile);

        // Build all promises to run in parallel
        const promises: Promise<any>[] = [];

        // 1. Upload video file
        promises.push(
          supabase.storage
            .from('videos')
            .upload(fileName, videoFile, { cacheControl: '3600', upsert: false })
        );

        // 2. Get duration from object URL (fast, no re-read)
        promises.push(
          new Promise<number>((resolve) => {
            const vid = document.createElement('video');
            vid.preload = 'metadata';
            vid.onloadedmetadata = () => { resolve(Math.round(vid.duration)); };
            vid.onerror = () => resolve(0);
            vid.src = objectUrl;
          })
        );

        // 3. Thumbnail: use provided file, already-set URL, or auto-generate from video
        const needsAutoThumb = !thumbnailUrl && !thumbnailFile;
        if (thumbnailFile) {
          const thumbName = `thumb_${Date.now()}.${thumbnailFile.name.split('.').pop()}`;
          promises.push(
            supabase.storage.from('videos').upload(thumbName, thumbnailFile)
              .then(({ error }) => {
                if (error) throw error;
                return supabase.storage.from('videos').getPublicUrl(thumbName).data.publicUrl;
              })
          );
        } else if (needsAutoThumb) {
          // Auto-generate thumbnail in parallel using the same object URL
          promises.push(
            new Promise<string>((resolve, reject) => {
              const vid2 = document.createElement('video');
              vid2.preload = 'auto';
              vid2.muted = true;
              vid2.onloadedmetadata = () => { vid2.currentTime = 1; };
              vid2.onseeked = () => {
                const c = document.createElement('canvas');
                c.width = vid2.videoWidth;
                c.height = vid2.videoHeight;
                c.getContext('2d')!.drawImage(vid2, 0, 0, c.width, c.height);
                c.toBlob(async (blob) => {
                  if (!blob) { resolve(''); return; }
                  const name = `thumb_auto_${Date.now()}.jpg`;
                  const { error } = await supabase.storage.from('videos').upload(name, blob);
                  resolve(error ? '' : supabase.storage.from('videos').getPublicUrl(name).data.publicUrl);
                }, 'image/jpeg', 0.8);
              };
              vid2.onerror = () => resolve('');
              vid2.src = objectUrl;
            })
          );
        } else {
          promises.push(Promise.resolve(null)); // placeholder
        }

        const [uploadResult, dur, thumbUrl] = await Promise.all(promises);
        URL.revokeObjectURL(objectUrl);

        if (uploadResult.error) throw uploadResult.error;

        videoUrl = supabase.storage.from('videos').getPublicUrl(fileName).data.publicUrl;
        duration = dur;
        if (thumbUrl) thumbnailUrl = thumbUrl;
      }

      if (editingVideo) {
        const { error } = await supabase
          .from("videos")
          .update({
            ...formData,
            video_url: videoUrl,
            thumbnail_url: thumbnailUrl,
            thumbnail_gif_url: thumbnailGifUrl || null,
            duration: duration,
            published_at: formData.published ? new Date().toISOString() : null,
          })
          .eq("id", editingVideo.id);

        if (error) throw error;

        toast({
          title: "Video updated",
          description: "Video has been updated successfully",
        });
      } else {
        const { error } = await supabase.from("videos").insert({
          ...formData,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          thumbnail_gif_url: thumbnailGifUrl || null,
          duration: duration,
          published_at: formData.published ? new Date().toISOString() : null,
        });

        if (error) throw error;

        toast({
          title: "Video created",
          description: "Video has been created successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchVideos();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      const { error } = await supabase.from("videos").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Video deleted",
        description: "Video has been deleted successfully",
      });

      fetchVideos();
    } catch (error: any) {
      toast({
        title: "Error deleting video",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url,
      thumbnail_gif_url: video.thumbnail_gif_url || "",
      video_type: video.video_type,
      category: video.category,
      duration: video.duration,
      published: video.published,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      video_url: "",
      thumbnail_url: "",
      thumbnail_gif_url: "",
      video_type: "highlight",
      category: "General",
      duration: 0,
      published: false,
    });
    setEditingVideo(null);
    setVideoFile(null);
    setThumbnailFile(null);
    setUploadMethod('file');
    setExtractedFrames([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading videos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-full px-2 py-3 space-y-4 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-lg sm:text-xl font-bold">Video Gallery</h1>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={fetchMLBHighlights}
            disabled={fetchingMLBHighlights}
          >
            {fetchingMLBHighlights ? (
              <>
                <RefreshCw className="mr-1 h-3.5 w-3.5 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <Download className="mr-1 h-3.5 w-3.5" />
                Fetch MLB Highlights
              </>
            )}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} size="sm" className="h-8 text-xs">
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add
              </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVideo ? "Edit Video" : "Add New Video"}
              </DialogTitle>
              <DialogDescription>
                {uploadMethod === 'file' && "Upload a video file with high-speed quality"}
                {uploadMethod === 'youtube' && "Add a YouTube video link"}
                {uploadMethod === 'link' && "Add a video link from any source"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Upload Method</Label>
                <Select
                  value={uploadMethod}
                  onValueChange={(value: 'file' | 'youtube' | 'link') => setUploadMethod(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="file">High-Speed File Upload</SelectItem>
                    <SelectItem value="youtube">YouTube Link</SelectItem>
                    <SelectItem value="link">Other Video Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {uploadMethod === 'file' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="video-file">Video File</Label>
                    <Input
                      id="video-file"
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      required={!editingVideo}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnail-file">Thumbnail (Optional)</Label>
                    <Input
                      id="thumbnail-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground">
                      If not provided, a thumbnail will be auto-generated from the video
                    </p>
                  </div>
                </>
              )}

              {(uploadMethod === 'youtube' || uploadMethod === 'link') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="video-url">Video URL</Label>
                    <Input
                      id="video-url"
                      value={formData.video_url}
                      onChange={(e) =>
                        setFormData({ ...formData, video_url: e.target.value })
                      }
                      placeholder={uploadMethod === 'youtube' ? "https://youtube.com/watch?v=..." : "https://..."}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnail-url">Thumbnail URL</Label>
                    <Input
                      id="thumbnail-url"
                      value={formData.thumbnail_url}
                      onChange={(e) =>
                        setFormData({ ...formData, thumbnail_url: e.target.value })
                      }
                      placeholder="https://..."
                      required
                    />
                  </div>
                </>
              )}

              {/* Video Frame Thumbnail Selector */}
              {(videoFile || extractedFrames.length > 0) && (
                <div className="space-y-2 border border-dashed border-primary/30 rounded-lg p-3 bg-primary/5">
                  <Label className="flex items-center gap-1.5 text-primary">
                    <ImagePlus className="w-4 h-4" />
                    Select Thumbnail from Video
                  </Label>
                  {videoFile && extractedFrames.length === 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={extractingFrames}
                      onClick={() => extractFramesFromVideo(videoFile)}
                    >
                      {extractingFrames ? (
                        <>
                          <Film className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Extracting Frames...
                        </>
                      ) : (
                        <>
                          <Film className="mr-1.5 h-3.5 w-3.5" />
                          Extract Frames from Video
                        </>
                      )}
                    </Button>
                  )}
                  {extractedFrames.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {extractedFrames.map((frame, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`relative rounded-md overflow-hidden border-2 transition-all hover:scale-105 ${
                            formData.thumbnail_url === frame
                              ? 'border-primary ring-2 ring-primary/40'
                              : 'border-transparent hover:border-primary/50'
                          }`}
                          onClick={async () => {
                            // Upload selected frame to storage
                            try {
                              const blob = await fetch(frame).then(r => r.blob());
                              const thumbName = `thumb_frame_${Date.now()}_${idx}.jpg`;
                              const { error } = await supabase.storage.from('videos').upload(thumbName, blob);
                              if (error) throw error;
                              const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(thumbName);
                              setFormData(prev => ({ ...prev, thumbnail_url: publicUrl }));
                              toast({ title: "Thumbnail selected!" });
                            } catch (err: any) {
                              toast({ title: "Upload failed", description: err.message, variant: "destructive" });
                            }
                          }}
                        >
                          <img src={frame} alt={`Frame ${idx + 1}`} className="w-full aspect-video object-cover" />
                          <span className="absolute bottom-1 right-1 bg-background/80 text-[10px] px-1 rounded">
                            Frame {idx + 1}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {formData.thumbnail_url && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Selected thumbnail:</p>
                      <img src={formData.thumbnail_url} alt="Selected thumbnail" className="w-full h-32 object-cover rounded-md" />
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="video-type">Type</Label>
                  <Select
                    value={formData.video_type}
                    onValueChange={(value: any) =>
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

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, published: checked })
                  }
                />
                <Label htmlFor="published">Published</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading || generatingThumbnail || generatingGif}>
                  {(uploading || generatingGif) && <Upload className="mr-2 h-4 w-4 animate-spin" />}
                  {uploading ? "Uploading..." : generatingThumbnail ? "Generating Thumbnail..." : generatingGif ? "Generating Preview..." : editingVideo ? "Update" : "Create"}
                </Button>
              </div>

              {uploadProgress > 0 && (
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card key={video.id}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {video.title}
                {video.video_type === 'highlight' && (
                  <span className="text-xs px-1.5 py-0.5 bg-primary/20 text-primary rounded">
                    Highlight
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {video.thumbnail_url && (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-48 object-cover rounded-md mb-2"
                  />
                )}
                {video.thumbnail_gif_url && (
                  <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    GIF
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {video.description}
              </p>
              <div className="flex justify-between items-center text-sm mb-3">
                <span className={`px-2 py-1 rounded-full ${video.published ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                  {video.published ? 'Published' : 'Draft'}
                </span>
                <span className="text-muted-foreground">{video.category}</span>
              </div>
              
              {/* Generate GIF button for highlights without GIF */}
              {video.video_type === 'highlight' && !video.thumbnail_gif_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mb-3 text-xs"
                  disabled={generatingGif}
                  onClick={async () => {
                    const gifUrl = await generateGifPreview(video.video_url, video.id);
                    if (gifUrl) {
                      toast({
                        title: "GIF Preview Generated",
                        description: "Animated preview has been added to this highlight",
                      });
                      fetchVideos();
                    } else {
                      toast({
                        title: "Generation Failed",
                        description: "Could not generate preview. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  {generatingGif ? (
                    <>
                      <Upload className="mr-1 h-3 w-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-1 h-3 w-3" />
                      Generate GIF Preview
                    </>
                  )}
                </Button>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(video)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(video.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No videos yet. Add your first video!</p>
        </div>
      )}
    </div>
  );
}
