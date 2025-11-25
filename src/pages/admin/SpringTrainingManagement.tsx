import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SpringTrainingManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    opponent: "",
    game_date: "",
    preview_image_url: "",
    display_order: 0,
    published: true,
  });

  const { data: games, isLoading } = useQuery({
    queryKey: ["admin-spring-training-games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spring_training_games")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `spring-training/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("content_uploads")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("content_uploads")
        .getPublicUrl(filePath);

      setFormData({ ...formData, preview_image_url: publicUrl });
      toast({ title: "Image uploaded successfully" });
    } catch (error) {
      toast({ title: "Failed to upload image", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("spring_training_games").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-spring-training-games"] });
      toast({ title: "Game created successfully" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create game", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from("spring_training_games").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-spring-training-games"] });
      toast({ title: "Game updated successfully" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to update game", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("spring_training_games").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-spring-training-games"] });
      toast({ title: "Game deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete game", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      opponent: "",
      game_date: "",
      preview_image_url: "",
      display_order: 0,
      published: true,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (game: any) => {
    setFormData({
      opponent: game.opponent,
      game_date: game.game_date,
      preview_image_url: game.preview_image_url,
      display_order: game.display_order,
      published: game.published,
    });
    setEditingId(game.id);
    setIsAdding(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Spring Training Games</h2>
        <Button onClick={() => setIsAdding(!isAdding)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          {isAdding ? "Cancel" : "Add Game"}
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Game" : "Add New Game"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Opponent Team *</Label>
                  <Input
                    value={formData.opponent}
                    onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                    placeholder="e.g., Yankees, Red Sox"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Game Date *</Label>
                  <Input
                    type="date"
                    value={formData.game_date}
                    onChange={(e) => setFormData({ ...formData, game_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Preview Image</Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
                </div>
                {formData.preview_image_url && (
                  <img src={formData.preview_image_url} alt="Preview" className="w-32 h-32 object-cover mt-2 rounded" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                />
                <Label>Published</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={uploading}>
                  {editingId ? "Update" : "Create"} Game
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-center text-muted-foreground">Loading games...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {games?.map((game) => (
            <Card key={game.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{game.opponent}</CardTitle>
                    <CardDescription>{game.game_date}</CardDescription>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${game.published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {game.published ? "Published" : "Draft"}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {game.preview_image_url && (
                  <img src={game.preview_image_url} alt={game.opponent} className="w-full h-32 object-cover mb-4 rounded" />
                )}
                <div className="flex gap-2">
                  <Button onClick={() => handleEdit(game)} variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button
                    onClick={() => deleteMutation.mutate(game.id)}
                    variant="destructive"
                    size="sm"
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