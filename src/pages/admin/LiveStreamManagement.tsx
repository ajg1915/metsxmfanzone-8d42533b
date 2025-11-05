import { useState, useEffect } from "react";
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
import { Trash2, Plus, Edit, Radio } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
}

export default function LiveStreamManagement() {
  const { toast } = useToast();
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<LiveStream | null>(null);
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

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const { data, error } = await supabase
        .from("live_streams")
        .select("*")
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
        const { error } = await supabase
          .from("live_streams")
          .update(streamData)
          .eq("id", editingStream.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Live stream updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("live_streams")
          .insert([streamData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Live stream created successfully",
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

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Live Stream Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
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
                <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                <Input
                  id="thumbnail_url"
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                />
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
                    {['live', 'metsxmfanzone', 'mlb-network'].map((page) => (
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
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={page} className="cursor-pointer font-normal">
                          {page === 'live' ? 'Live Page' : page === 'metsxmfanzone' ? 'MetsXMFanZone TV' : 'MLB Network'}
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

      {loading ? (
        <div className="text-center py-8">Loading streams...</div>
      ) : streams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No live streams yet. Click "Add Live Stream" to schedule your first stream.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {streams.map((stream) => (
            <Card key={stream.id}>
              <CardHeader>
                {stream.thumbnail_url && (
                  <div className="aspect-video overflow-hidden rounded-lg mb-2 bg-muted">
                    <img
                      src={stream.thumbnail_url}
                      alt={stream.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getStatusBadge(stream.status)}>
                    {stream.status === 'live' && <Radio className="w-3 h-3 mr-1" />}
                    {stream.status.toUpperCase()}
                  </Badge>
                  {!stream.published && (
                    <Badge variant="outline">Draft</Badge>
                  )}
                </div>
                <CardTitle className="line-clamp-2">{stream.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <p>Assigned to: {stream.assigned_pages?.length > 0 ? stream.assigned_pages.map(p => {
                    if (p === 'live') return 'Live Page';
                    if (p === 'metsxmfanzone') return 'MetsXMFanZone TV';
                    if (p === 'mlb-network') return 'MLB Network';
                    return p;
                  }).join(', ') : 'None'}</p>
                  {stream.scheduled_start && (
                    <p>Starts: {new Date(stream.scheduled_start).toLocaleString()}</p>
                  )}
                  <p>Viewers: {stream.viewers_count}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(stream)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(stream.id)}
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
