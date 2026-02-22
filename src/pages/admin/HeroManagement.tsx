import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Save, GripVertical, ChevronDown, ChevronUp, Eye, EyeOff, Sparkles, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

interface SuggestedSlide {
  title: string;
  description: string;
  image_url: string | null;
  link_url: string | null;
  link_text: string | null;
  source: string;
}

// Compact sortable slide row
const SortableSlideRow = ({
  slide,
  index,
  blogPosts,
  saving,
  expanded,
  onToggle,
  onUpdate,
  onLinkBlog,
  onSave,
  onDelete,
}: {
  slide: HeroSlide;
  index: number;
  blogPosts: BlogPost[];
  saving: boolean;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (id: string, field: keyof HeroSlide, value: string | boolean | number | null) => void;
  onLinkBlog: (slideId: string, blogId: string | null) => void;
  onSave: (slide: HeroSlide) => void;
  onDelete: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <Card ref={setNodeRef} style={style} className={`border-border overflow-hidden ${isDragging ? 'ring-2 ring-primary' : ''}`}>
      {/* Compact header row */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 cursor-pointer" onClick={onToggle}>
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded" onClick={e => e.stopPropagation()}>
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        
        {/* Thumbnail */}
        {slide.image_url ? (
          <img src={slide.image_url} alt="" className="w-10 h-6 rounded object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-6 rounded bg-muted flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-3 h-3 text-muted-foreground" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{slide.title || "Untitled"}</p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Badge variant={slide.is_for_members ? "default" : "secondary"} className="text-[9px] px-1 py-0 h-4">
            {slide.is_for_members ? "Members" : "Public"}
          </Badge>
          <button
            onClick={e => { e.stopPropagation(); onUpdate(slide.id, "published", !slide.published); }}
            className="p-0.5"
            title={slide.published ? "Published" : "Draft"}
          >
            {slide.published ? <Eye className="w-3.5 h-3.5 text-green-500" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </div>

      {/* Expanded edit panel */}
      {expanded && (
        <CardContent className="px-2 pb-2 pt-0 space-y-2 border-t border-border/50">
          <div className="grid grid-cols-2 gap-1.5 pt-1.5">
            <div>
              <Label className="text-[10px]">Title</Label>
              <Input value={slide.title} onChange={e => onUpdate(slide.id, "title", e.target.value)} className="h-7 text-xs" />
            </div>
            <div>
              <Label className="text-[10px]">Image URL</Label>
              <Input value={slide.image_url || ""} onChange={e => onUpdate(slide.id, "image_url", e.target.value)} className="h-7 text-xs" placeholder="https://..." />
            </div>
          </div>

          <div>
            <Label className="text-[10px]">Description</Label>
            <Textarea value={slide.description} onChange={e => onUpdate(slide.id, "description", e.target.value)} rows={2} className="text-xs min-h-[48px]" />
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <Label className="text-[10px]">Button Text</Label>
              <Input value={slide.link_text || ""} onChange={e => onUpdate(slide.id, "link_text", e.target.value)} className="h-7 text-xs" placeholder="e.g. Watch Now" />
            </div>
            <div>
              <Label className="text-[10px]">Button URL</Label>
              <Input value={slide.link_url || ""} onChange={e => onUpdate(slide.id, "link_url", e.target.value || null)} className="h-7 text-xs" placeholder="/pricing" />
            </div>
          </div>

          <div>
            <Label className="text-[10px]">Link to Blog</Label>
            <Select value={slide.blog_post_id || "none"} onValueChange={v => onLinkBlog(slide.id, v === "none" ? null : v)}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {blogPosts.map(b => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1 text-[10px]">
                <Switch checked={slide.is_for_members} onCheckedChange={c => onUpdate(slide.id, "is_for_members", c)} className="scale-75" />
                Members
              </label>
              <label className="flex items-center gap-1 text-[10px]">
                <Switch checked={slide.show_watch_live} onCheckedChange={c => onUpdate(slide.id, "show_watch_live", c)} className="scale-75" />
                Watch Live
              </label>
              <label className="flex items-center gap-1 text-[10px]">
                <Switch checked={slide.published} onCheckedChange={c => onUpdate(slide.id, "published", c)} className="scale-75" />
                Published
              </label>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => onDelete(slide.id)} className="h-6 px-2 text-destructive text-[10px]">
                <Trash2 className="w-3 h-3 mr-1" /> Delete
              </Button>
              <Button size="sm" onClick={() => onSave(slide)} disabled={saving} className="h-6 px-2 text-[10px]">
                <Save className="w-3 h-3 mr-1" /> Save
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

const HeroManagement = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "members" | "public">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestedSlide[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchData = async () => {
    try {
      const [slidesRes, blogsRes] = await Promise.all([
        supabase.from("hero_slides").select("*").order("display_order", { ascending: true }),
        supabase.from("blog_posts").select("id, title, slug, featured_image_url, excerpt").eq("published", true).order("published_at", { ascending: false }).limit(50),
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

  const fetchSuggestions = async () => {
    const suggested: SuggestedSlide[] = [];

    // Recent blog posts
    const { data: blogs } = await supabase.from("blog_posts").select("title, slug, featured_image_url, excerpt").eq("published", true).order("published_at", { ascending: false }).limit(3);
    blogs?.forEach(b => {
      suggested.push({
        title: b.title,
        description: b.excerpt || "Read the latest from MetsXMFanZone",
        image_url: b.featured_image_url,
        link_url: `/blog/${b.slug}`,
        link_text: "Read Article",
        source: "Blog",
      });
    });

    // Live streams
    const { data: streams } = await supabase.from("live_streams").select("title, description, thumbnail_url").eq("status", "live").eq("published", true).limit(2);
    streams?.forEach(s => {
      suggested.push({
        title: s.title,
        description: s.description || "Watch live on MetsXMFanZone TV",
        image_url: s.thumbnail_url,
        link_url: "/metsxmfanzone-tv",
        link_text: "Watch Live",
        source: "Live Stream",
      });
    });

    // Podcast shows
    const { data: podcasts } = await supabase.from("podcast_shows").select("title, description, thumbnail_url, show_date").eq("published", true).order("show_date", { ascending: false }).limit(2);
    podcasts?.forEach(p => {
      suggested.push({
        title: p.title,
        description: p.description || "Listen to the latest MetsXMFanZone podcast",
        image_url: p.thumbnail_url,
        link_url: "/podcast",
        link_text: "Listen Now",
        source: "Podcast",
      });
    });

    // Spring training games
    const { data: games } = await supabase.from("spring_training_games").select("opponent, game_date, preview_image_url, location").eq("published", true).order("game_date", { ascending: true }).limit(2);
    games?.forEach(g => {
      suggested.push({
        title: `Mets vs ${g.opponent}`,
        description: `Spring Training ${g.location ? `at ${g.location}` : ""} - ${new Date(g.game_date).toLocaleDateString()}`,
        image_url: g.preview_image_url,
        link_url: "/spring-training-live",
        link_text: "View Game",
        source: "Spring Training",
      });
    });

    // Events
    const { data: events } = await supabase.from("events").select("title, description, image_url, event_date").eq("published", true).order("event_date", { ascending: true }).limit(2);
    events?.forEach(e => {
      suggested.push({
        title: e.title,
        description: e.description || `Event on ${new Date(e.event_date).toLocaleDateString()}`,
        image_url: e.image_url,
        link_url: "/events",
        link_text: "View Event",
        source: "Event",
      });
    });

    setSuggestions(suggested);
    setShowSuggestions(true);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex(s => s.id === active.id);
      const newIndex = slides.findIndex(s => s.id === over.id);
      const newSlides = arrayMove(slides, oldIndex, newIndex).map((slide, i) => ({ ...slide, display_order: i + 1 }));
      setSlides(newSlides);
      try {
        await Promise.all(newSlides.map(s => supabase.from("hero_slides").update({ display_order: s.display_order }).eq("id", s.id)));
        toast.success("Order updated");
      } catch { toast.error("Failed to update order"); fetchData(); }
    }
  };

  const addSlide = async (prefill?: Partial<HeroSlide>) => {
    try {
      const newOrder = slides.length > 0 ? Math.max(...slides.map(s => s.display_order)) + 1 : 1;
      const { data, error } = await supabase.from("hero_slides").insert({
        title: prefill?.title || "New Slide",
        description: prefill?.description || "Enter description",
        image_url: prefill?.image_url || null,
        link_url: prefill?.link_url || null,
        link_text: prefill?.link_text || null,
        display_order: newOrder,
        is_for_members: prefill?.is_for_members ?? true,
        published: false,
        show_watch_live: prefill?.show_watch_live ?? true,
      }).select().single();
      if (error) throw error;
      setSlides([...slides, data]);
      setExpandedId(data.id);
      toast.success("Slide added");
    } catch { toast.error("Failed to add slide"); }
  };

  const addFromSuggestion = (s: SuggestedSlide) => {
    addSlide({ title: s.title, description: s.description, image_url: s.image_url, link_url: s.link_url, link_text: s.link_text });
  };

  const updateSlide = (id: string, field: keyof HeroSlide, value: string | boolean | number | null) => {
    setSlides(slides.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const linkBlogPost = (slideId: string, blogId: string | null) => {
    const blog = blogPosts.find(b => b.id === blogId);
    setSlides(slides.map(s => {
      if (s.id !== slideId) return s;
      if (blog) return { ...s, blog_post_id: blogId, title: blog.title, description: blog.excerpt || s.description, image_url: blog.featured_image_url || s.image_url, link_url: `/blog/${blog.slug}`, link_text: "Read Article" };
      return { ...s, blog_post_id: null, link_url: null };
    }));
  };

  const saveSlide = async (slide: HeroSlide) => {
    setSaving(true);
    try {
      const { error } = await supabase.from("hero_slides").update({
        title: slide.title, description: slide.description, image_url: slide.image_url,
        display_order: slide.display_order, is_for_members: slide.is_for_members, published: slide.published,
        blog_post_id: slide.blog_post_id, link_url: slide.link_url, link_text: slide.link_text, show_watch_live: slide.show_watch_live,
      }).eq("id", slide.id);
      if (error) throw error;
      toast.success("Saved");
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const deleteSlide = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    try {
      const { error } = await supabase.from("hero_slides").delete().eq("id", id);
      if (error) throw error;
      setSlides(slides.filter(s => s.id !== id));
      if (expandedId === id) setExpandedId(null);
      toast.success("Deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const filteredSlides = slides.filter(s => filter === "all" || (filter === "members" ? s.is_for_members : !s.is_for_members));

  if (loading) return <div className="flex items-center justify-center min-h-[200px]"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-3 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold">Hero Slides</h2>
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline" onClick={fetchSuggestions} className="h-7 text-[10px] gap-1">
            <Sparkles className="w-3 h-3" /> Suggestions
          </Button>
          <Button size="sm" onClick={() => addSlide()} className="h-7 text-[10px] gap-1">
            <Plus className="w-3 h-3" /> Add
          </Button>
        </div>
      </div>

      {/* Suggestion slides panel */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-primary">Suggested slides from your site data</p>
              <Button size="sm" variant="ghost" onClick={() => setShowSuggestions(false)} className="h-5 text-[9px] px-1.5">Close</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {suggestions.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 p-1.5 rounded bg-background border border-border/50 hover:border-primary/40 transition-colors">
                  {s.image_url ? (
                    <img src={s.image_url} alt="" className="w-8 h-5 rounded object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-5 rounded bg-muted flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium truncate">{s.title}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{s.source}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => addFromSuggestion(s)} className="h-5 text-[9px] px-1.5 text-primary">
                    <Plus className="w-2.5 h-2.5 mr-0.5" /> Add
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1">
        {(["all", "public", "members"] as const).map(f => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="h-6 text-[10px] px-2 capitalize">
            {f} ({f === "all" ? slides.length : slides.filter(s => f === "members" ? s.is_for_members : !s.is_for_members).length})
          </Button>
        ))}
      </div>

      {/* Slides list */}
      {filteredSlides.length === 0 ? (
        <p className="text-center text-muted-foreground text-xs py-8">No slides. Click Add to create one.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredSlides.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5">
              {filteredSlides.map((slide, index) => (
                <SortableSlideRow
                  key={slide.id}
                  slide={slide}
                  index={index}
                  blogPosts={blogPosts}
                  saving={saving}
                  expanded={expandedId === slide.id}
                  onToggle={() => setExpandedId(expandedId === slide.id ? null : slide.id)}
                  onUpdate={updateSlide}
                  onLinkBlog={linkBlogPost}
                  onSave={saveSlide}
                  onDelete={deleteSlide}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default HeroManagement;
