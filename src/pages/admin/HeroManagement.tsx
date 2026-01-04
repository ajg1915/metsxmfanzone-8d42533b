import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Save, Image, FileText } from "lucide-react";

interface HeroSlide {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  display_order: number;
  is_for_members: boolean;
  published: boolean;
  blog_post_id: string | null;
  link_url: string | null;
  link_text: string | null;
  show_watch_live: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  featured_image_url: string | null;
  excerpt: string | null;
}

const HeroManagement = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [slidesRes, blogsRes] = await Promise.all([
        supabase
          .from("hero_slides")
          .select("*")
          .order("display_order", { ascending: true }),
        supabase
          .from("blog_posts")
          .select("id, title, slug, featured_image_url, excerpt")
          .eq("published", true)
          .order("published_at", { ascending: false })
          .limit(50)
      ]);

      if (slidesRes.error) throw slidesRes.error;
      if (blogsRes.error) throw blogsRes.error;
      
      setSlides(slidesRes.data || []);
      setBlogPosts(blogsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
          published: false,
          show_watch_live: true
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

  const updateSlide = (id: string, field: keyof HeroSlide, value: string | boolean | number | null) => {
    setSlides(slides.map(slide => 
      slide.id === id ? { ...slide, [field]: value } : slide
    ));
  };

  const linkBlogPost = (slideId: string, blogId: string | null) => {
    const blog = blogPosts.find(b => b.id === blogId);
    setSlides(slides.map(slide => {
      if (slide.id === slideId) {
        if (blog) {
          return {
            ...slide,
            blog_post_id: blogId,
            title: blog.title,
            description: blog.excerpt || slide.description,
            image_url: blog.featured_image_url || slide.image_url,
            link_url: `/blog/${blog.slug}`,
            link_text: "Read Article"
          };
        } else {
          return {
            ...slide,
            blog_post_id: null,
            link_url: null
          };
        }
      }
      return slide;
    }));
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
          published: slide.published,
          blog_post_id: slide.blog_post_id,
          link_url: slide.link_url,
          link_text: slide.link_text,
          show_watch_live: slide.show_watch_live
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
          <p className="text-muted-foreground">Manage hero carousel slides for both public visitors and logged-in members. Link to blog posts or add custom content.</p>
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
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        Slide {index + 1}
                        {slide.blog_post_id && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Blog
                          </span>
                        )}
                      </CardTitle>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={slide.is_for_members}
                        onCheckedChange={(checked) => updateSlide(slide.id, "is_for_members", checked)}
                      />
                      <Label className="text-sm">{slide.is_for_members ? "Members Only" : "Public"}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={slide.show_watch_live}
                        onCheckedChange={(checked) => updateSlide(slide.id, "show_watch_live", checked)}
                      />
                      <Label className="text-sm">Watch Live Button</Label>
                    </div>
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
                {/* Blog Post Selection */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Link to Blog Post (optional)
                  </Label>
                  <Select
                    value={slide.blog_post_id || "none"}
                    onValueChange={(value) => linkBlogPost(slide.id, value === "none" ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a blog post..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No blog link (custom content)</SelectItem>
                      {blogPosts.map((blog) => (
                        <SelectItem key={blog.id} value={blog.id}>
                          {blog.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Selecting a blog post will auto-fill the title, description, and image from the blog.
                  </p>
                </div>

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

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`link-${slide.id}`}>Link URL (optional)</Label>
                    <Input
                      id={`link-${slide.id}`}
                      value={slide.link_url || ""}
                      onChange={(e) => updateSlide(slide.id, "link_url", e.target.value)}
                      placeholder="/blog/my-post or https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`linktext-${slide.id}`}>Link Button Text</Label>
                    <Input
                      id={`linktext-${slide.id}`}
                      value={slide.link_text || ""}
                      onChange={(e) => updateSlide(slide.id, "link_text", e.target.value)}
                      placeholder="Read More"
                    />
                  </div>
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