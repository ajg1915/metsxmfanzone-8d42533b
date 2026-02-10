import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Film, Loader2, Plus } from "lucide-react";

interface LiveStream {
  id: string;
  title: string;
  stream_url: string;
  thumbnail_url: string | null;
  status: string;
}

export default function StreamReplayEditor() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [selectedStream, setSelectedStream] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const { data, error } = await supabase
        .from("live_streams")
        .select("id, title, stream_url, thumbnail_url, status")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStreams(data || []);
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

  const handleCreateReplay = async () => {
    if (!selectedStream || !storyTitle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a stream and enter a title",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const stream = streams.find(s => s.id === selectedStream);
      if (!stream) throw new Error("Stream not found");

      const { error } = await supabase.from("stories").insert({
        title: storyTitle,
        media_url: stream.stream_url,
        media_type: "video",
        thumbnail_url: stream.thumbnail_url,
        display_order: parseInt(displayOrder),
        published: false,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Stream replay added to stories",
      });

      // Reset form
      setSelectedStream("");
      setStoryTitle("");
      setDisplayOrder("0");
    } catch (error: any) {
      console.error("Error creating replay:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create replay",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-full px-1 sm:px-2 py-2 sm:py-3 overflow-x-hidden">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-full px-1 sm:px-2 py-2 sm:py-3 overflow-x-hidden">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-1">Stream Replay Editor</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Convert live streams into story replays
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Film className="w-4 h-4" />
            Create Replay
          </CardTitle>
          <CardDescription className="text-xs">
            Select a live stream and add it to stories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stream" className="text-sm">Select Live Stream *</Label>
            <Select value={selectedStream} onValueChange={setSelectedStream}>
              <SelectTrigger id="stream" className="text-sm">
                <SelectValue placeholder="Choose a stream..." />
              </SelectTrigger>
              <SelectContent>
                {streams.length === 0 ? (
                  <SelectItem value="none" disabled>No streams available</SelectItem>
                ) : (
                  streams.map((stream) => (
                    <SelectItem key={stream.id} value={stream.id} className="text-sm">
                      {stream.title} ({stream.status})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm">Story Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Game Highlights - May 15"
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order" className="text-sm">Display Order</Label>
            <Input
              id="order"
              type="number"
              placeholder="0"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first
            </p>
          </div>

          <Button
            onClick={handleCreateReplay}
            disabled={creating || !selectedStream || !storyTitle.trim()}
            className="w-full"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Replay Story
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            Note: The replay will be created as unpublished. Go to Stories Management to publish it.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}