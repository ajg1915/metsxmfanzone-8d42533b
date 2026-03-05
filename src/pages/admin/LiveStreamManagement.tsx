import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Edit, Radio, Upload, X, Loader2, RotateCcw, GripVertical, Image } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LiveStream {
  id: string;
  title: string;
  description: string;
  stream_url: string;
  thumbnail_url: string;
  status: 'live' | 'scheduled' | 'ended';
  scheduled_start: string;
  scheduled_end: string;
  assigned_pages: string[];
  viewers_count: number;
  published: boolean;
  created_at: string;
  display_order: number;
}

function SortableStreamCard({ stream, onEdit, onDelete, getStatusBadge }: {
  stream: LiveStream;
  onEdit: (s: LiveStream) => void;
  onDelete: (id: string) => void;
  getStatusBadge: (status: string) => string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stream.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const pageLabels: Record<string, string> = { guide: 'Guide Page', live: 'Live Page', metsxmfanzone: 'MetsXMFanZone TV', 'mlb-network': 'MLB Network', 'espn-network': 'ESPN Network', 'pix11-network': 'PIX11 Network', 'spring-training-live': 'Spring Training Live', 'spring-training-games': 'Spring Training Games', 'replay-games': 'Replay Games' };

  return (
    <Card ref={setNodeRef} style={style} className="relative">
      <div {...attributes} {...listeners} className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing p-1 rounded bg-background/80 backdrop-blur-sm">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <CardHeader className="pb-3 pl-10">
        {stream.thumbnail_url && (
          <div className="aspect-video overflow-hidden rounded-md mb-2 bg-muted">
            <img src={stream.thumbnail_url} alt={stream.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex items-center gap-1.5 mb-2">
          <Badge className={getStatusBadge(stream.status)}>
            {stream.status === 'live' && <Radio className="w-3 h-3 mr-1" />}
            {stream.status.toUpperCase()}
          </Badge>
          {!stream.published && <Badge variant="outline">Draft</Badge>}
        </div>
        <CardTitle className="line-clamp-2 text-base">{stream.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
          <p>Assigned to: {stream.assigned_pages?.length > 0 ? stream.assigned_pages.map(p => pageLabels[p] || p).join(', ') : 'None'}</p>
          {stream.scheduled_start && <p>Starts: {new Date(stream.scheduled_start).toLocaleString()}</p>}
          <p>Viewers: {stream.viewers_count}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(stream)} className="flex-1 h-7 text-xs">
            <Edit className="w-3 h-3 mr-1" /> Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(stream.id)} className="h-7 text-xs">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LiveStreamManagement() {
  const { toast } = useToast();
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<LiveStream | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<{ id: string; file_url: string; file_name: string; file_type: string | null }[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    stream_url: "",
    thumbnail_url: "",
    status: "scheduled" as 'live' | 'scheduled' | 'ended',
    scheduled_start: "",
    scheduled_end: "",
    assigned_pages: [] as string[],
    published: false,
  });

  const fetchMediaLibrary = async () => {
    setMediaLoading(true);
    try {
      const { data, error } = await supabase
        .from("media_library")
        .select("id, file_url, file_name, file_type")
        .or("file_type.ilike.image%,file_type.is.null")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      setMediaItems(data || []);
    } catch (err) {
      console.error("Failed to load media library:", err);
    } finally {
      setMediaLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const { data, error } = await supabase
        .from("live_streams")
        .select("*")
        .order("display_order", { ascending: true })
        .order("scheduled_start", { ascending: false });

      if (error) throw error;
      setStreams(data as LiveStream[] || []);
    } catch (error) {
      console.error("Error fetching streams:", error);
      toast({
        title: "Error",
        description: "Failed to load live streams",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendLiveNotification = async (title: string, streamId: string) => {
    try {
      await supabase.functions.invoke("send-push-notification", {
        body: {
          title: "🔴 LIVE NOW on MetsXMFanZone!",
          body: title,
          url: "/metsxmfanzone",
          icon: "/logo-192.png",
          tag: `live-stream-${streamId}`,
        },
      });
    } catch (err) {
      console.error("Push notification failed:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const streamData = {
        ...formData,
        scheduled_start: formData.scheduled_start || null,
        scheduled_end: formData.scheduled_end || null,
        actual_start: formData.status === 'live' ? new Date().toISOString() : null,
      };

      if (editingStream) {
        const wasLive = editingStream.status === 'live';
        const nowLive = formData.status === 'live';

        const { error } = await supabase
          .from("live_streams")
          .update(streamData)
          .eq("id", editingStream.id);

        if (error) throw error;

        // Fire push if stream just went live
        if (!wasLive && nowLive) {
          await sendLiveNotification(formData.title, editingStream.id);
        }

        toast({
          title: "Success",
          description: `Live stream updated successfully${!wasLive && nowLive ? " — Push notification sent to all subscribers!" : ""}`,
        });
      } else {
        const { data: inserted, error } = await supabase
          .from("live_streams")
          .insert([streamData])
          .select()
          .single();

        if (error) throw error;

        // Fire push if created as live immediately
        if (formData.status === 'live' && inserted) {
          await sendLiveNotification(formData.title, inserted.id);
        }

        toast({
          title: "Success",
          description: `Live stream created successfully${formData.status === 'live' ? " — Push notification sent to all subscribers!" : ""}`,
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchStreams();
    } catch (error) {
      console.error("Error saving stream:", error);
      toast({
        title: "Error",
        description: "Failed to save live stream",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this live stream?")) return;

    try {
      const { error } = await supabase
        .from("live_streams")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Live stream deleted successfully",
      });
      fetchStreams();
    } catch (error) {
      console.error("Error deleting stream:", error);
      toast({
        title: "Error",
        description: "Failed to delete live stream",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (stream: LiveStream) => {
    setEditingStream(stream);
    setFormData({
      title: stream.title,
      description: stream.description || "",
      stream_url: stream.stream_url,
      thumbnail_url: stream.thumbnail_url || "",
      status: stream.status,
      scheduled_start: stream.scheduled_start ? new Date(stream.scheduled_start).toISOString().slice(0, 16) : "",
      scheduled_end: stream.scheduled_end ? new Date(stream.scheduled_end).toISOString().slice(0, 16) : "",
      assigned_pages: stream.assigned_pages || [],
      published: stream.published,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingStream(null);
    setFormData({
      title: "",
      description: "",
      stream_url: "",
      thumbnail_url: "",
      status: "scheduled",
      scheduled_start: "",
      scheduled_end: "",
      assigned_pages: [],
      published: false,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `stream-${Date.now()}.${fileExt}`;
      const filePath = `live-streams/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('content_uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('content_uploads')
        .getPublicUrl(filePath);

      setFormData({ ...formData, thumbnail_url: publicUrl });
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearThumbnail = () => {
    setFormData({ ...formData, thumbnail_url: "" });
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = streams.findIndex(s => s.id === active.id);
    const newIndex = streams.findIndex(s => s.id === over.id);
    const reordered = arrayMove(streams, oldIndex, newIndex);
    setStreams(reordered);

    // Persist new order
    const updates = reordered.map((s, i) => ({ id: s.id, display_order: i }));
    for (const u of updates) {
      await supabase.from("live_streams").update({ display_order: u.display_order }).eq("id", u.id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      live: "bg-red-600 text-white",
      scheduled: "bg-blue-600 text-white",
      ended: "bg-gray-600 text-white",
    };
    return variants[status as keyof typeof variants] || "bg-gray-600 text-white";
  };

  return (
    <div className="max-w-7xl mx-auto px-2 py-3">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <h1 className="text-lg font-bold">Live Stream Management</h1>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={async () => {
              toast({ title: "Scraping...", description: "Fetching replay games from mlblive.net. This may take a minute." });
              try {
                const { data, error } = await supabase.functions.invoke('scrape-replay-games', {
                  body: { maxPages: 3 }
                });
                if (error) throw error;
                toast({
                  title: "Scrape Complete",
                  description: `Found ${data.total_with_embeds} games, ${data.newly_inserted} newly added.`,
                });
              } catch (err: any) {
                toast({ title: "Scrape Failed", description: err.message || "Error scraping replays", variant: "destructive" });
              }
            }}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Scrape Replays
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Live Stream
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStream ? "Edit Live Stream" : "Add New Live Stream"}</DialogTitle>
              <DialogDescription>
                {editingStream ? "Update stream details" : "Schedule a new live stream"}
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
                <Label htmlFor="stream_url">Stream URL (M3U8) *</Label>
                <Input
                  id="stream_url"
                  type="url"
                  value={formData.stream_url}
                  onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })}
                  placeholder="https://example.com/stream/playlist.m3u8"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the HLS stream URL ending in .m3u8
                </p>
              </div>

              <div>
                <Label>Thumbnail</Label>
                <div className="space-y-3 mt-2">
                  {formData.thumbnail_url && (
                    <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted">
                      <img
                        src={formData.thumbnail_url}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={clearThumbnail}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex-1"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        fetchMediaLibrary();
                        setMediaPickerOpen(true);
                      }}
                      className="flex-1"
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Media Library
                    </Button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">or URL:</span>
                    <Input
                      type="url"
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                      placeholder="https://..."
                      className="pl-14"
                    />
                  </div>

                  {/* Media Library Picker Dialog */}
                  <Dialog open={mediaPickerOpen} onOpenChange={setMediaPickerOpen}>
                    <DialogContent className="max-w-3xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Select from Media Library</DialogTitle>
                        <DialogDescription>Choose an image to use as the thumbnail</DialogDescription>
                      </DialogHeader>
                      {mediaLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : mediaItems.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No images found in the media library.</p>
                      ) : (
                        <ScrollArea className="h-[50vh]">
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-1">
                            {mediaItems.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, thumbnail_url: item.file_url });
                                  setMediaPickerOpen(false);
                                  toast({ title: "Image selected", description: item.file_name });
                                }}
                                className="aspect-video rounded-md overflow-hidden border-2 border-transparent hover:border-primary transition-colors bg-muted"
                              >
                                <img
                                  src={item.file_url}
                                  alt={item.file_name}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'live' | 'scheduled' | 'ended') =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="live">Live Now</SelectItem>
                      <SelectItem value="ended">Ended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="assigned_pages">Assign to Pages *</Label>
                  <div className="space-y-2 mt-2">
                    {['guide', 'live', 'metsxmfanzone', 'mlb-network', 'espn-network', 'pix11-network', 'spring-training-live', 'spring-training-games', 'replay-games'].map((page) => (
                      <div key={page} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={page}
                          checked={formData.assigned_pages.includes(page)}
                          onChange={(e) => {
                            const newPages = e.target.checked
                              ? [...formData.assigned_pages, page]
                              : formData.assigned_pages.filter(p => p !== page);
                            setFormData({ ...formData, assigned_pages: newPages });
                          }}
                          className="rounded border-border"
                        />
                        <Label htmlFor={page} className="cursor-pointer font-normal">
                          {page === 'guide' ? 'Guide Page' : page === 'live' ? 'Live Page' : page === 'metsxmfanzone' ? 'MetsXMFanZone TV' : page === 'mlb-network' ? 'MLB Network' : page === 'espn-network' ? 'ESPN Network' : page === 'pix11-network' ? 'PIX11 Network' : page === 'spring-training-live' ? 'Spring Training Live' : page === 'spring-training-games' ? 'Spring Training Games' : 'Replay Games'}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduled_start">Start Time</Label>
                  <Input
                    id="scheduled_start"
                    type="datetime-local"
                    value={formData.scheduled_start}
                    onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="scheduled_end">End Time</Label>
                  <Input
                    id="scheduled_end"
                    type="datetime-local"
                    value={formData.scheduled_end}
                    onChange={(e) => setFormData({ ...formData, scheduled_end: e.target.value })}
                  />
                </div>
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
                <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingStream ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading streams...</div>
      ) : streams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No live streams yet. Click "Add Live Stream" to schedule your first stream.
          </CardContent>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={streams.map(s => s.id)} strategy={rectSortingStrategy}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {streams.map((stream) => (
                <SortableStreamCard
                  key={stream.id}
                  stream={stream}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
