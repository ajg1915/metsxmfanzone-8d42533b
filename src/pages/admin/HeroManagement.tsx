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
import { Plus, Trash2, Save, Image, FileText, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

interface SortableSlideProps {
  slide: HeroSlide;
  index: number;
  slidesCount: number;
  blogPosts: BlogPost[];
  saving: boolean;
  onUpdate: (id: string, field: keyof HeroSlide, value: string | boolean | number | null) => void;
  onLinkBlog: (slideId: string, blogId: string | null) => void;
  onSave: (slide: HeroSlide) => void;
  onDelete: (id: string) => void;
}

const SortableSlide = ({
  slide,
  index,
  blogPosts,
  saving,
  onUpdate,
  onLinkBlog,
  onSave,
  onDelete,
}: SortableSlideProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className={`border-border ${isDragging ? 'shadow-lg ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-2 hover:bg-muted rounded-md transition-colors"
            >
              <GripVertical className="w-5 h-5 text-muted-foreground" />
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
                <span className={`text-xs px-2 py-0.5 rounded-full ${slide.is_for_members ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                  {slide.is_for_members ? 'Members' : 'Public'}
                </span>
              </CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Switch
                checked={slide.is_for_members}
                onCheckedChange={(checked) => onUpdate(slide.id, "is_for_members", checked)}
              />
              <Label className="text-sm">{slide.is_for_members ? "Members Only" : "Public"}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={slide.show_watch_live}
                onCheckedChange={(checked) => onUpdate(slide.id, "show_watch_live", checked)}
              />
              <Label className="text-sm">Watch Live Button</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={slide.published}
                onCheckedChange={(checked) => onUpdate(slide.id, "published", checked)}
              />
              <Label className="text-sm">{slide.published ? "Published" : "Draft"}</Label>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(slide.id)}
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
            onValueChange={(value) => onLinkBlog(slide.id, value === "none" ? null : value)}
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
              onChange={(e) => onUpdate(slide.id, "title", e.target.value)}
              placeholder="Slide title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`image-${slide.id}`}>Image URL (optional)</Label>
            <div className="flex gap-2">
              <Input
                id={`image-${slide.id}`}
                value={slide.image_url || ""}
                onChange={(e) => onUpdate(slide.id, "image_url", e.target.value)}
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
            onChange={(e) => onUpdate(slide.id, "description", e.target.value)}
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
              onChange={(e) => onUpdate(slide.id, "link_url", e.target.value)}
              placeholder="/blog/my-post or https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`linktext-${slide.id}`}>Link Button Text</Label>
            <Input
              id={`linktext-${slide.id}`}
              value={slide.link_text || ""}
              onChange={(e) => onUpdate(slide.id, "link_text", e.target.value)}
              placeholder="Read More"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onSave(slide)} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const HeroManagement = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex((s) => s.id === active.id);
      const newIndex = slides.findIndex((s) => s.id === over.id);

      const newSlides = arrayMove(slides, oldIndex, newIndex).map((slide, index) => ({
        ...slide,
        display_order: index + 1,
      }));

      setSlides(newSlides);

      // Update all display orders in database
      try {
        await Promise.all(
          newSlides.map((slide) =>
            supabase
              .from("hero_slides")
              .update({ display_order: slide.display_order })
              .eq("id", slide.id)
          )
        );
        toast.success("Slide order updated");
      } catch (error) {
        console.error("Error updating order:", error);
        toast.error("Failed to update order");
        fetchData(); // Revert on error
      }
    }
  };

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
          <p className="text-muted-foreground">Manage hero carousel slides for both public visitors and logged-in members. Drag and drop to reorder slides.</p>
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={slides.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {slides.map((slide, index) => (
                <SortableSlide
                  key={slide.id}
                  slide={slide}
                  index={index}
                  slidesCount={slides.length}
                  blogPosts={blogPosts}
                  saving={saving}
                  onUpdate={updateSlide}
                  onLinkBlog={linkBlogPost}
                  onSave={saveSlide}
                  onDelete={deleteSlide}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default HeroManagement;
