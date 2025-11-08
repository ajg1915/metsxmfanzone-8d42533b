import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewsItem {
  id: string;
  type: "signing" | "rumor";
  title: string;
  player: string;
  details: string;
  time_ago: string;
  image_url: string;
  published: boolean;
  created_at: string;
}

export default function MetsNewsTrackerManagement() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    type: "signing" as "signing" | "rumor",
    title: "",
    player: "",
    details: "",
    time_ago: "1 hour ago",
    image_url: "",
    published: false,
  });

  useEffect(() => {
    fetchNewsItems();
  }, []);

  const fetchNewsItems = async () => {
    try {
      const { data, error } = await supabase
        .from("mets_news_tracker")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNewsItems((data || []) as NewsItem[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from("mets_news_tracker")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;
        toast({ title: "News item updated successfully" });
      } else {
        const { error } = await supabase
          .from("mets_news_tracker")
          .insert([formData]);

        if (error) throw error;
        toast({ title: "News item created successfully" });
      }

      resetForm();
      fetchNewsItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: NewsItem) => {
    setFormData({
      type: item.type,
      title: item.title,
      player: item.player,
      details: item.details,
      time_ago: item.time_ago,
      image_url: item.image_url,
      published: item.published,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news item?")) return;

    try {
      const { error } = await supabase
        .from("mets_news_tracker")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "News item deleted successfully" });
      fetchNewsItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      type: "signing",
      title: "",
      player: "",
      details: "",
      time_ago: "1 hour ago",
      image_url: "",
      published: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mets News Tracker</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? "Cancel" : "Add News Item"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit News Item" : "Create News Item"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "signing" | "rumor") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="signing">New Signing</SelectItem>
                    <SelectItem value="rumor">Trade Rumor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="player">Player Name</Label>
                <Input
                  id="player"
                  value={formData.player}
                  onChange={(e) => setFormData({ ...formData, player: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Details</Label>
                <Textarea
                  id="details"
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time_ago">Time Ago</Label>
                <Input
                  id="time_ago"
                  value={formData.time_ago}
                  onChange={(e) => setFormData({ ...formData, time_ago: e.target.value })}
                  placeholder="e.g., 2 hours ago"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  required
                />
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

              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? "Update" : "Create"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {newsItems.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-center gap-4 p-6">
              <img
                src={item.image_url}
                alt={item.player}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      item.type === "signing"
                        ? "bg-green-500 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {item.type === "signing" ? "NEW SIGNING" : "TRADE RUMOR"}
                  </span>
                  {!item.published && (
                    <span className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
                      Unpublished
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="text-primary font-semibold">{item.player}</p>
                <p className="text-sm text-muted-foreground">{item.details}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.time_ago}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
