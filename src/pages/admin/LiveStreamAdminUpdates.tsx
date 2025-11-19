import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LiveStream {
  id: string;
  title: string;
  status: string;
}

interface AdminUpdate {
  id: string;
  live_stream_id: string;
  welcome_message: string;
  topics: string[];
  created_at: string;
  live_streams: {
    title: string;
  };
}

export default function LiveStreamAdminUpdates() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [updates, setUpdates] = useState<AdminUpdate[]>([]);
  const [selectedStreamId, setSelectedStreamId] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [topics, setTopics] = useState<string[]>([""]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
      return;
    }

    if (user) {
      checkAdminRole();
    }
  }, [user, authLoading, navigate]);

  const checkAdminRole = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user?.id)
      .eq("role", "admin")
      .single();

    if (error || !data) {
      navigate("/");
      return;
    }

    fetchLiveStreams();
    fetchUpdates();
  };

  const fetchLiveStreams = async () => {
    const { data, error } = await supabase
      .from("live_streams")
      .select("id, title, status")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLiveStreams(data);
    }
  };

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from("live_stream_admin_updates")
        .select(`
          *,
          live_streams (
            title
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUpdates(data as any || []);
    } catch (error) {
      console.error("Error fetching updates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = () => {
    setTopics([...topics, ""]);
  };

  const handleRemoveTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const handleTopicChange = (index: number, value: string) => {
    const newTopics = [...topics];
    newTopics[index] = value;
    setTopics(newTopics);
  };

  const handleSubmit = async () => {
    if (!selectedStreamId || !welcomeMessage.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a live stream and enter a welcome message",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const filteredTopics = topics.filter((t) => t.trim() !== "");

      const { error } = await supabase
        .from("live_stream_admin_updates")
        .insert({
          live_stream_id: selectedStreamId,
          admin_id: user!.id,
          welcome_message: welcomeMessage.trim(),
          topics: filteredTopics,
        });

      if (error) throw error;

      toast({
        title: "Update Created",
        description: "Admin live stream update has been created successfully",
      });

      setSelectedStreamId("");
      setWelcomeMessage("");
      setTopics([""]);
      fetchUpdates();
    } catch (error) {
      console.error("Error creating update:", error);
      toast({
        title: "Error",
        description: "Failed to create admin update",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("live_stream_admin_updates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Update Deleted",
        description: "Admin update has been removed",
      });

      fetchUpdates();
    } catch (error) {
      console.error("Error deleting update:", error);
      toast({
        title: "Error",
        description: "Failed to delete admin update",
        variant: "destructive",
      });
    }
  };

  if (loading || authLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            Live Stream Admin Updates
          </h1>
          <p className="text-muted-foreground">
            Create welcome messages and topics for live streams
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Update</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stream">Live Stream</Label>
              <Select value={selectedStreamId} onValueChange={setSelectedStreamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a live stream" />
                </SelectTrigger>
                <SelectContent>
                  {liveStreams.map((stream) => (
                    <SelectItem key={stream.id} value={stream.id}>
                      {stream.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Welcome Message</Label>
              <Textarea
                id="message"
                placeholder="Enter a welcome message for viewers..."
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Today's Topics</Label>
              {topics.map((topic, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Enter a topic..."
                    value={topic}
                    onChange={(e) => handleTopicChange(index, e.target.value)}
                  />
                  {topics.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveTopic(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={handleAddTopic} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Topic
              </Button>
            </div>

            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Creating..." : "Create Update"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Updates</CardTitle>
          </CardHeader>
          <CardContent>
            {updates.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No admin updates yet
              </p>
            ) : (
              <div className="space-y-4">
                {updates.map((update) => (
                  <Card key={update.id}>
                    <CardContent className="py-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {update.live_streams?.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(update.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(update.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                      <p className="text-foreground mb-3">{update.welcome_message}</p>
                      {update.topics && update.topics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {update.topics.map((topic, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-primary/10 text-primary text-sm rounded"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
