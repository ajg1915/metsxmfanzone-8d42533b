import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Trash2, Save, GripVertical, ChevronDown, ChevronUp, Eye, EyeOff, Sparkles, Image as ImageIcon, Upload, Loader2, RefreshCw } from "lucide-react";
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
  show_reminder: boolean;
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

// Image uploader component
const ImageUploader = ({ imageUrl, onImageChange, slideId }: { imageUrl: string | null; onImageChange: (url: string) => void; slideId: string }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `hero-slides/${slideId}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("content_uploads").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("content_uploads").getPublicUrl(path);
      onImageChange(urlData.publicUrl);
      toast.success("Image uploaded");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  return (
    <div className="space-y-1">
      <Label className="text-[10px]">Image</Label>
      {imageUrl ? (
        <div className="relative group">
          <img src={imageUrl} alt="" className="w-full h-20 rounded object-cover border border-border" />
          <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded text-[10px] text-white gap-1">
            <Upload className="w-3 h-3" /> Replace
          </button>
        </div>
      ) : (
        <button onClick={() => fileInputRef.current?.click()} className="w-full h-20 rounded border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : (
            <>
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Upload image</span>
            </>
          )}
        </button>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
    </div>
  );
};

// Compact sortable slide row
const SortableSlideRow = ({
  slide, index, blogPosts, saving, expanded, onToggle, onUpdate, onLinkBlog, onSave, onDelete,
}: {
  slide: HeroSlide; index: number; blogPosts: BlogPost[]; saving: boolean; expanded: boolean;
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
      <div className="flex items-center gap-1.5 px-2 py-1.5 cursor-pointer" onClick={onToggle}>
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded" onClick={e => e.stopPropagation()}>
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
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
          <button onClick={e => { e.stopPropagation(); onUpdate(slide.id, "published", !slide.published); }} className="p-0.5" title={slide.published ? "Published" : "Draft"}>
            {slide.published ? <Eye className="w-3.5 h-3.5 text-green-500" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <CardContent className="px-2 pb-2 pt-0 space-y-2 border-t border-border/50">
          <div className="grid grid-cols-2 gap-1.5 pt-1.5">
            <div>
              <Label className="text-[10px]">Title</Label>
              <Input value={slide.title} onChange={e => onUpdate(slide.id, "title", e.target.value)} className="h-7 text-xs" />
            </div>
            <ImageUploader imageUrl={slide.image_url} onImageChange={url => onUpdate(slide.id, "image_url", url)} slideId={slide.id} />
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

          <div className="flex items-center justify-between flex-wrap gap-1 pt-1">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <label className="flex items-center gap-1 text-[10px]">
                <Switch checked={slide.is_for_members} onCheckedChange={c => onUpdate(slide.id, "is_for_members", c)} className="scale-75" />
                Members
              </label>
              <label className="flex items-center gap-1 text-[10px]">
                <Switch checked={slide.show_watch_live} onCheckedChange={c => onUpdate(slide.id, "show_watch_live", c)} className="scale-75" />
                Watch Live
              </label>
              <label className="flex items-center gap-1 text-[10px]">
                <Switch checked={slide.show_reminder ?? false} onCheckedChange={c => onUpdate(slide.id, "show_reminder", c)} className="scale-75" />
                Reminder
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

interface AISlide {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  link_url: string | null;
  link_text: string | null;
  published: boolean;
  is_for_members: boolean;
  is_ai_generated: boolean;
  show_watch_live: boolean;
  display_order: number;
  created_at: string;
}

const AIHeroSlidesTab = () => {
  const [aiSlides, setAiSlides] = useState<AISlide[]>([]);
  const [aiLoading, setAiLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [slideCount, setSlideCount] = useState(3);

  const fetchAiSlides = async () => {
    const { data } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("is_ai_generated", true)
      .order("created_at", { ascending: false });
    setAiSlides((data as any) || []);
    setAiLoading(false);
  };

  useEffect(() => { fetchAiSlides(); }, []);

  const generateSlides = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-ai-hero-slides", {
        body: { count: slideCount },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
      } else {
        toast.success(`${data.slides_generated} AI hero slides created and published.`);
        fetchAiSlides();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate slides");
    }
    setGenerating(false);
  };

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from("hero_slides").update({ published: !current }).eq("id", id);
    setAiSlides(prev => prev.map(s => s.id === id ? { ...s, published: !current } : s));
  };

  const deleteAiSlide = async (id: string) => {
    await supabase.from("hero_slides").delete().eq("id", id);
    setAiSlides(prev => prev.filter(s => s.id !== id));
    toast.success("AI slide removed");
  };

  const deleteAllAI = async () => {
    if (!confirm("Delete all AI-generated slides?")) return;
    await supabase.from("hero_slides").delete().eq("is_ai_generated", true);
    setAiSlides([]);
    toast.success("All AI slides removed");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-muted-foreground">Auto-generate branded Mets hero slides from your content</p>
        <div className="flex items-center gap-1.5">
          <select
            value={slideCount}
            onChange={e => setSlideCount(Number(e.target.value))}
            className="h-7 rounded border border-border bg-muted/30 text-xs px-2"
          >
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} slide{n > 1 ? "s" : ""}</option>)}
          </select>
          <Button onClick={generateSlides} disabled={generating} size="sm" className="h-7 text-[10px] gap-1">
            {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {generating ? "Generating..." : "Generate"}
          </Button>
        </div>
      </div>

      {generating && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-3 flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <div>
              <p className="font-medium text-xs">Generating AI Hero Slides...</p>
              <p className="text-[10px] text-muted-foreground">Analyzing content & generating images. This may take 30-60 seconds.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {aiSlides.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-[10px] text-muted-foreground">{aiSlides.length} AI slide{aiSlides.length !== 1 ? "s" : ""}</p>
          <div className="flex gap-1.5">
            <Button variant="ghost" size="sm" onClick={fetchAiSlides} className="h-6 text-[10px] gap-1">
              <RefreshCw className="w-3 h-3" /> Refresh
            </Button>
            <Button variant="destructive" size="sm" onClick={deleteAllAI} className="h-6 text-[10px] gap-1">
              <Trash2 className="w-3 h-3" /> Clear All
            </Button>
          </div>
        </div>
      )}

      {aiLoading ? (
        <p className="text-muted-foreground text-center py-6 text-xs">Loading...</p>
      ) : aiSlides.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Sparkles className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs font-medium">No AI slides yet</p>
            <p className="text-[10px] text-muted-foreground mt-1">Click "Generate" to create branded hero slides from your Mets content</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {aiSlides.map(slide => (
            <Card key={slide.id} className="overflow-hidden">
              {slide.image_url && (
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                  <div className="absolute top-1 right-1 flex gap-1">
                    <Badge variant={slide.published ? "default" : "secondary"} className="text-[9px]">
                      {slide.published ? "Live" : "Draft"}
                    </Badge>
                    <Badge variant="outline" className="text-[9px] bg-background/80">
                      {slide.is_for_members ? "Members" : "Public"}
                    </Badge>
                  </div>
                </div>
              )}
              <CardHeader className="p-2">
                <CardTitle className="text-xs line-clamp-1">{slide.title}</CardTitle>
                <CardDescription className="text-[10px] line-clamp-2">{slide.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {slide.link_text && <Badge variant="outline" className="text-[9px]">{slide.link_text}</Badge>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => togglePublish(slide.id, slide.published)} className="h-6 w-6 p-0">
                    {slide.published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteAiSlide(slide.id)} className="h-6 w-6 p-0 text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
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

    const { data: blogs } = await supabase.from("blog_posts").select("title, slug, featured_image_url, excerpt").eq("published", true).order("published_at", { ascending: false }).limit(3);
    blogs?.forEach(b => {
      suggested.push({ title: b.title, description: b.excerpt || "Read the latest from MetsXMFanZone", image_url: b.featured_image_url, link_url: `/blog/${b.slug}`, link_text: "Read Article", source: "Blog" });
    });

    const { data: streams } = await supabase.from("live_streams").select("title, description, thumbnail_url").eq("status", "live").eq("published", true).limit(2);
    streams?.forEach(s => {
      suggested.push({ title: s.title, description: s.description || "Watch live on MetsXMFanZone TV", image_url: s.thumbnail_url, link_url: "/metsxmfanzone", link_text: "Watch Live", source: "Live Stream" });
    });

    const { data: podcasts } = await supabase.from("podcast_shows").select("title, description, thumbnail_url, show_date").eq("published", true).order("show_date", { ascending: false }).limit(2);
    podcasts?.forEach(p => {
      suggested.push({ title: p.title, description: p.description || "Listen to the latest MetsXMFanZone podcast", image_url: p.thumbnail_url, link_url: "/podcast", link_text: "Listen Now", source: "Podcast" });
    });

    const { data: games } = await supabase.from("spring_training_games").select("opponent, game_date, preview_image_url, location").eq("published", true).order("game_date", { ascending: true }).limit(2);
    games?.forEach(g => {
      suggested.push({ title: `Mets vs ${g.opponent}`, description: `Spring Training ${g.location ? `at ${g.location}` : ""} - ${new Date(g.game_date).toLocaleDateString()}`, image_url: g.preview_image_url, link_url: "/spring-training-live", link_text: "View Game", source: "Spring Training" });
    });

    const { data: events } = await supabase.from("events").select("title, description, image_url, event_date").eq("published", true).order("event_date", { ascending: true }).limit(2);
    events?.forEach(e => {
      suggested.push({ title: e.title, description: e.description || `Event on ${new Date(e.event_date).toLocaleDateString()}`, image_url: e.image_url, link_url: "/events", link_text: "View Event", source: "Event" });
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
        blog_post_id: slide.blog_post_id, link_url: slide.link_url, link_text: slide.link_text, show_watch_live: slide.show_watch_live, show_reminder: slide.show_reminder ?? false,
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
      <h2 className="text-sm font-bold">Hero Slides</h2>

      <Tabs defaultValue="slides" className="w-full">
        <TabsList className="h-8">
          <TabsTrigger value="slides" className="text-[10px] h-6 gap-1">
            <ImageIcon className="w-3 h-3" /> Slides & Suggestions
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-[10px] h-6 gap-1">
            <Sparkles className="w-3 h-3" /> AI Generated
          </TabsTrigger>
        </TabsList>

        <TabsContent value="slides" className="space-y-3 mt-3">
          {/* Header actions */}
          <div className="flex items-center justify-end gap-1.5">
            <Button size="sm" variant="outline" onClick={fetchSuggestions} className="h-7 text-[10px] gap-1">
              <Sparkles className="w-3 h-3" /> Suggestions
            </Button>
            <Button size="sm" onClick={() => addSlide()} className="h-7 text-[10px] gap-1">
              <Plus className="w-3 h-3" /> Add
            </Button>
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
        </TabsContent>

        <TabsContent value="ai" className="mt-3">
          <AIHeroSlidesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HeroManagement;
