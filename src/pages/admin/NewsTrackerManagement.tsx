import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, TrendingUp, Users, AlertCircle, Newspaper, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface NewsItem {
  id: string;
  type: string;
  title: string;
  player: string;
  details: string;
  time_ago: string;
  image_url: string;
  published: boolean;
  created_at: string;
}

const NewsTrackerManagement = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState({
    type: "news",
    title: "",
    player: "",
    details: "",
    time_ago: "Just now",
    image_url: "",
    published: true,
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
      setNewsItems(data || []);
    } catch (error) {
      console.error("Error fetching news items:", error);
      toast.error("Failed to load news items");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        const { error } = await supabase
          .from("mets_news_tracker")
          .update(formData)
          .eq("id", editingItem.id);

        if (error) throw error;
        toast.success("News item updated successfully");
      } else {
        const { error } = await supabase
          .from("mets_news_tracker")
          .insert([formData]);

        if (error) throw error;
        toast.success("News item created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchNewsItems();
    } catch (error) {
      console.error("Error saving news item:", error);
      toast.error("Failed to save news item");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news item?")) return;

    try {
      const { error } = await supabase
        .from("mets_news_tracker")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("News item deleted");
      fetchNewsItems();
    } catch (error) {
      console.error("Error deleting news item:", error);
      toast.error("Failed to delete news item");
    }
  };

  const togglePublished = async (id: string, published: boolean) => {
    try {
      const { error } = await supabase
        .from("mets_news_tracker")
        .update({ published: !published })
        .eq("id", id);

      if (error) throw error;
      toast.success(published ? "News item hidden" : "News item published");
      fetchNewsItems();
    } catch (error) {
      console.error("Error toggling published:", error);
      toast.error("Failed to update status");
    }
  };

  const resetForm = () => {
    setFormData({
      type: "news",
      title: "",
      player: "",
      details: "",
      time_ago: "Just now",
      image_url: "",
      published: true,
    });
    setEditingItem(null);
  };

  const openEditDialog = (item: NewsItem) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      title: item.title,
      player: item.player,
      details: item.details,
      time_ago: item.time_ago,
      image_url: item.image_url,
      published: item.published,
    });
    setIsDialogOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "signing": return <TrendingUp className="w-4 h-4" />;
      case "traded": return <Users className="w-4 h-4" />;
      case "injury": return <AlertCircle className="w-4 h-4" />;
      default: return <Newspaper className="w-4 h-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "signing": return "bg-green-500";
      case "traded": return "bg-blue-500";
      case "injury": return "bg-red-500";
      default: return "bg-primary";
    }
  };

  return (
    <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">News Tracker</h1>
            <p className="text-sm text-muted-foreground">Manage MLB Live Tracker news items</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add News
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit News Item" : "Add News Item"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="news">MLB News</SelectItem>
                      <SelectItem value="signing">New Signing</SelectItem>
                      <SelectItem value="traded">Trade News</SelectItem>
                      <SelectItem value="injury">Injury Update</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="News headline..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Player/Subject</Label>
                  <Input
                    value={formData.player}
                    onChange={(e) => setFormData({ ...formData, player: e.target.value })}
                    placeholder="Player name or subject..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Details</Label>
                  <Textarea
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder="News details..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Time Display</Label>
                  <Input
                    value={formData.time_ago}
                    onChange={(e) => setFormData({ ...formData, time_ago: e.target.value })}
                    placeholder="e.g., Just now, 2 hours ago..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Use MLB headshot URLs or team logos
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.published}
                    onCheckedChange={(v) => setFormData({ ...formData, published: v })}
                  />
                  <Label>Published</Label>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingItem ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : newsItems.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <Newspaper className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-2">No manual news items yet</p>
              <p className="text-xs text-muted-foreground">Add news when the automated feed has no Mets content</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {newsItems.map((item) => (
              <Card key={item.id} className={`${!item.published ? "opacity-60" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.player}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://a.espncdn.com/i/teamlogos/mlb/500/nym.png";
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge className={`${getTypeBadgeColor(item.type)} text-white text-xs gap-1`}>
                          {getTypeIcon(item.type)}
                          {item.type.toUpperCase()}
                        </Badge>
                        {!item.published && (
                          <Badge variant="secondary" className="text-xs">Hidden</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm line-clamp-1">{item.title}</h3>
                      <p className="text-xs text-primary font-medium">{item.player}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{item.details}</p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => togglePublished(item.id, item.published)}
                      >
                        {item.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(item)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
};

export default NewsTrackerManagement;