import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, Save, Image } from "lucide-react";

interface HeroSlide {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  display_order: number;
  is_for_members: boolean;
  published: boolean;
}

const HeroManagement = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error("Error fetching slides:", error);
      toast.error("Failed to load slides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const addSlide = async () => {
    try {
      const newOrder = slides.length > 0 ? Math.max(...slides.map(s => s.display_order)) + 1 : 1;
      
      const { data, error } = await supabase
        .from("hero_slides")
        .insert({
          title: "New Slide",
          description: "Enter slide description here",
          display_order: newOrder,
          is_for_members: true,
          published: false
        })
        .select()
        .single();

      if (error) throw error;
      
      setSlides([...slides, data]);
      toast.success("New slide added");
    } catch (error) {
      console.error("Error adding slide:", error);
      toast.error("Failed to add slide");
    }
  };

  const updateSlide = (id: string, field: keyof HeroSlide, value: string | boolean | number) => {
    setSlides(slides.map(slide => 
      slide.id === id ? { ...slide, [field]: value } : slide
    ));
  };

  const saveSlide = async (slide: HeroSlide) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("hero_slides")
        .update({
          title: slide.title,
          description: slide.description,
          image_url: slide.image_url,
          display_order: slide.display_order,
          is_for_members: slide.is_for_members,
          published: slide.published
        })
        .eq("id", slide.id);

      if (error) throw error;
      toast.success("Slide saved");
    } catch (error) {
      console.error("Error saving slide:", error);
      toast.error("Failed to save slide");
    } finally {
      setSaving(false);
    }
  };

  const deleteSlide = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;
    
    try {
      const { error } = await supabase
        .from("hero_slides")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setSlides(slides.filter(s => s.id !== id));
      toast.success("Slide deleted");
    } catch (error) {
      console.error("Error deleting slide:", error);
      toast.error("Failed to delete slide");
    }
  };

  const moveSlide = async (id: string, direction: "up" | "down") => {
    const index = slides.findIndex(s => s.id === id);
    if ((direction === "up" && index === 0) || (direction === "down" && index === slides.length - 1)) return;

    const newSlides = [...slides];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    
    const tempOrder = newSlides[index].display_order;
    newSlides[index].display_order = newSlides[swapIndex].display_order;
    newSlides[swapIndex].display_order = tempOrder;
    
    [newSlides[index], newSlides[swapIndex]] = [newSlides[swapIndex], newSlides[index]];
    
    setSlides(newSlides);

    // Save order changes
    try {
      await Promise.all([
        supabase.from("hero_slides").update({ display_order: newSlides[index].display_order }).eq("id", newSlides[index].id),
        supabase.from("hero_slides").update({ display_order: newSlides[swapIndex].display_order }).eq("id", newSlides[swapIndex].id)
      ]);
    } catch (error) {
      console.error("Error reordering:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hero Slides Management</h1>
          <p className="text-muted-foreground">Manage the hero carousel slides for logged-in members</p>
        </div>
        <Button onClick={addSlide} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Slide
        </Button>
      </div>

      <div className="space-y-4">
        {slides.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No slides yet. Click "Add Slide" to create one.</p>
            </CardContent>
          </Card>
        ) : (
          slides.map((slide, index) => (
            <Card key={slide.id} className="border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveSlide(slide.id, "up")}
                        disabled={index === 0}
                        className="h-6 w-6 p-0"
                      >
                        ▲
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveSlide(slide.id, "down")}
                        disabled={index === slides.length - 1}
                        className="h-6 w-6 p-0"
                      >
                        ▼
                      </Button>
                    </div>
                    <CardTitle className="text-lg">Slide {index + 1}</CardTitle>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={slide.published}
                        onCheckedChange={(checked) => updateSlide(slide.id, "published", checked)}
                      />
                      <Label className="text-sm">{slide.published ? "Published" : "Draft"}</Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSlide(slide.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`title-${slide.id}`}>Title</Label>
                    <Input
                      id={`title-${slide.id}`}
                      value={slide.title}
                      onChange={(e) => updateSlide(slide.id, "title", e.target.value)}
                      placeholder="Slide title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`image-${slide.id}`}>Image URL (optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`image-${slide.id}`}
                        value={slide.image_url || ""}
                        onChange={(e) => updateSlide(slide.id, "image_url", e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                      <Button variant="outline" size="icon" title="Preview image">
                        <Image className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`desc-${slide.id}`}>Description</Label>
                  <Textarea
                    id={`desc-${slide.id}`}
                    value={slide.description}
                    onChange={(e) => updateSlide(slide.id, "description", e.target.value)}
                    placeholder="Slide description"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => saveSlide(slide)} disabled={saving} className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default HeroManagement;