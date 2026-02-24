import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Trash2, Eye, EyeOff, RefreshCw } from "lucide-react";

interface HeroSlide {
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

export default function AIHeroSlides() {
  const { toast } = useToast();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [slideCount, setSlideCount] = useState(3);

  const fetchSlides = async () => {
    const { data } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("is_ai_generated", true)
      .order("created_at", { ascending: false });
    setSlides((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchSlides(); }, []);

  const generateSlides = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-ai-hero-slides", {
        body: { count: slideCount },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: "Generation Failed", description: data.error, variant: "destructive" });
      } else {
        toast({ title: "Slides Generated!", description: `${data.slides_generated} AI hero slides created and published.` });
        fetchSlides();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to generate slides", variant: "destructive" });
    }
    setGenerating(false);
  };

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from("hero_slides").update({ published: !current }).eq("id", id);
    setSlides(prev => prev.map(s => s.id === id ? { ...s, published: !current } : s));
  };

  const deleteSlide = async (id: string) => {
    await supabase.from("hero_slides").delete().eq("id", id);
    setSlides(prev => prev.filter(s => s.id !== id));
    toast({ title: "Deleted", description: "AI slide removed" });
  };

  const deleteAllAI = async () => {
    await supabase.from("hero_slides").delete().eq("is_ai_generated", true);
    setSlides([]);
    toast({ title: "Cleared", description: "All AI slides removed" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> AI Hero Slides</h1>
          <p className="text-muted-foreground">Auto-generate branded Mets hero slides from your content</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={slideCount}
            onChange={e => setSlideCount(Number(e.target.value))}
            className="h-7 rounded border border-muted/40 bg-muted/30 text-xs px-2"
          >
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} slide{n > 1 ? "s" : ""}</option>)}
          </select>
          <Button onClick={generateSlides} disabled={generating} size="sm" className="gap-1.5">
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {generating ? "Generating..." : "Generate Slides"}
          </Button>
        </div>
      </div>

      {generating && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <div>
              <p className="font-medium text-sm">Generating AI Hero Slides...</p>
              <p className="text-xs text-muted-foreground">Analyzing your content, creating copy & generating images. This may take 30-60 seconds.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {slides.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">{slides.length} AI slide{slides.length !== 1 ? "s" : ""}</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={fetchSlides} className="gap-1">
              <RefreshCw className="w-3 h-3" /> Refresh
            </Button>
            <Button variant="destructive" size="sm" onClick={deleteAllAI} className="gap-1">
              <Trash2 className="w-3 h-3" /> Clear All AI
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading...</p>
      ) : slides.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Sparkles className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">No AI slides yet</p>
            <p className="text-xs text-muted-foreground mt-1">Click "Generate Slides" to create branded hero slides from your Mets content</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map(slide => (
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
                <CardTitle className="line-clamp-1">{slide.title}</CardTitle>
                <CardDescription className="line-clamp-2">{slide.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  {slide.link_text && <Badge variant="outline" className="text-[9px]">{slide.link_text} → {slide.link_url}</Badge>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => togglePublish(slide.id, slide.published)} className="h-6 w-6 p-0">
                    {slide.published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteSlide(slide.id)} className="h-6 w-6 p-0 text-destructive">
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
}
