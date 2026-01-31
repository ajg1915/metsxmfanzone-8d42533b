import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Loader2, Wand2, Calendar, Clock, Sparkles, Radio, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface PodcastShow {
  id: string;
  title: string;
  description: string | null;
  show_date: string;
  show_type: string;
  thumbnail_gradient: string | null;
  thumbnail_colors: unknown;
  is_featured: boolean;
  is_live: boolean;
  published: boolean;
  created_at: string;
}

// AI-generated creative titles
const TITLE_TEMPLATES = [
  "🔥 {topic} Hot Takes Live",
  "⚾ Mets {topic} Breakdown",
  "🎙️ The FanZone {topic} Hour",
  "📊 {topic} Deep Dive",
  "💪 Amazin' {topic} Update",
  "🏟️ Citi Field {topic} Report",
  "🎯 {topic} Spotlight",
  "⭐ All-Star {topic} Talk",
  "🚀 {topic} Countdown",
  "📺 MetsXMFanZone {topic} Tonight",
  "🔵 Blue & Orange {topic}",
  "⚡ Quick {topic} Takes",
];

const TOPICS = [
  "Roster", "Trade", "Lineup", "Pitching", "Batting", "Defense",
  "Spring Training", "Game Day", "Postgame", "Pregame", "Analysis",
  "Hot Stove", "Prospect", "Bullpen", "Starting Rotation", "Injury Update"
];

const DESCRIPTIONS = [
  "Join us for live Mets analysis, hot takes, and fan interaction!",
  "Breaking down all the latest Mets news and roster updates.",
  "Your daily dose of Mets content with special guest appearances.",
  "Pre-game predictions, lineup analysis, and betting insights.",
  "Fan call-ins, Q&A, and community discussions.",
  "Deep dive into stats, projections, and player performance.",
  "Exclusive insider info and behind-the-scenes stories.",
  "Comprehensive coverage of today's most talked-about Mets topics.",
];

// Color palettes for AI-generated thumbnails
const COLOR_PALETTES = [
  { name: "Mets Classic", colors: ["#002D72", "#FF5910", "#FFFFFF"], gradient: "from-[#002D72] via-[#003087] to-[#FF5910]" },
  { name: "Sunset Orange", colors: ["#FF5910", "#FF8C00", "#FFD700"], gradient: "from-[#FF5910] via-[#FF8C00] to-[#FFD700]" },
  { name: "Royal Blue", colors: ["#002D72", "#0047AB", "#6495ED"], gradient: "from-[#002D72] via-[#0047AB] to-[#6495ED]" },
  { name: "Night Game", colors: ["#1a1a2e", "#16213e", "#0f3460"], gradient: "from-[#1a1a2e] via-[#16213e] to-[#0f3460]" },
  { name: "Electric", colors: ["#6366f1", "#8b5cf6", "#a855f7"], gradient: "from-[#6366f1] via-[#8b5cf6] to-[#a855f7]" },
  { name: "Fire", colors: ["#dc2626", "#f97316", "#fbbf24"], gradient: "from-[#dc2626] via-[#f97316] to-[#fbbf24]" },
  { name: "Ocean", colors: ["#0ea5e9", "#06b6d4", "#14b8a6"], gradient: "from-[#0ea5e9] via-[#06b6d4] to-[#14b8a6]" },
  { name: "Neon", colors: ["#f43f5e", "#ec4899", "#d946ef"], gradient: "from-[#f43f5e] via-[#ec4899] to-[#d946ef]" },
];

export default function PodcastScheduleManagement() {
  const [shows, setShows] = useState<PodcastShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    show_date: "",
    show_time: "17:30",
    show_type: "regular",
    thumbnail_gradient: COLOR_PALETTES[0].gradient,
    thumbnail_colors: COLOR_PALETTES[0].colors,
    is_featured: false,
    published: true,
  });

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("podcast_shows")
      .select("*")
      .order("show_date", { ascending: true });

    if (error) {
      toast({ title: "Error fetching shows", description: error.message, variant: "destructive" });
    } else {
      setShows(data || []);
    }
    setLoading(false);
  };

  const generateAITitle = () => {
    const template = TITLE_TEMPLATES[Math.floor(Math.random() * TITLE_TEMPLATES.length)];
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const title = template.replace("{topic}", topic);
    const description = DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)];
    
    setFormData(prev => ({ ...prev, title, description }));
    toast({ title: "AI Generated!", description: "Title and description created" });
  };

  const generateAIColors = () => {
    const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
    setFormData(prev => ({
      ...prev,
      thumbnail_gradient: palette.gradient,
      thumbnail_colors: palette.colors,
    }));
    toast({ title: "AI Generated!", description: `Using "${palette.name}" color palette` });
  };

  const generateFullShow = async () => {
    setGenerating(true);
    
    // Generate everything
    const template = TITLE_TEMPLATES[Math.floor(Math.random() * TITLE_TEMPLATES.length)];
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const title = template.replace("{topic}", topic);
    const description = DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)];
    const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
    
    // Set next available show date based on schedule
    const now = new Date();
    let nextShowDate = new Date(now);
    
    // Find next Monday, Tuesday, Friday, or Weekend
    const dayOfWeek = now.getDay();
    const daysUntilNext: Record<number, number> = {
      0: 1, // Sunday -> Monday
      1: 0, // Monday -> Today
      2: 0, // Tuesday -> Today
      3: 2, // Wednesday -> Friday
      4: 1, // Thursday -> Friday
      5: 0, // Friday -> Today
      6: 0, // Saturday -> Today
    };
    
    nextShowDate.setDate(now.getDate() + daysUntilNext[dayOfWeek]);
    
    // Set time based on day
    const isWeekend = nextShowDate.getDay() === 0 || nextShowDate.getDay() === 6;
    const showTime = isWeekend ? "14:00" : "17:30";
    
    setFormData({
      title,
      description,
      show_date: format(nextShowDate, "yyyy-MM-dd"),
      show_time: showTime,
      show_type: isWeekend ? "weekend" : "regular",
      thumbnail_gradient: palette.gradient,
      thumbnail_colors: palette.colors,
      is_featured: false,
      published: true,
    });

    setGenerating(false);
    toast({ title: "Full Show Generated!", description: `"${title}" with ${palette.name} theme` });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const showDateTime = new Date(`${formData.show_date}T${formData.show_time}`);
    
    const { error } = await supabase.from("podcast_shows").insert({
      title: formData.title,
      description: formData.description,
      show_date: showDateTime.toISOString(),
      show_type: formData.show_type,
      thumbnail_gradient: formData.thumbnail_gradient,
      thumbnail_colors: formData.thumbnail_colors,
      is_featured: formData.is_featured,
      published: formData.published,
    });

    if (error) {
      toast({ title: "Error creating show", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Show created successfully!" });
      setFormData({
        title: "",
        description: "",
        show_date: "",
        show_time: "17:30",
        show_type: "regular",
        thumbnail_gradient: COLOR_PALETTES[0].gradient,
        thumbnail_colors: COLOR_PALETTES[0].colors,
        is_featured: false,
        published: true,
      });
      fetchShows();
    }
  };

  const togglePublished = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("podcast_shows")
      .update({ published: !current })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      fetchShows();
    }
  };

  const toggleLive = async (id: string, current: boolean) => {
    // First, set all shows to not live
    if (!current) {
      await supabase.from("podcast_shows").update({ is_live: false }).neq("id", "none");
    }
    
    const { error } = await supabase
      .from("podcast_shows")
      .update({ is_live: !current })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: !current ? "Show is now LIVE!" : "Show ended" });
      fetchShows();
    }
  };

  const deleteShow = async (id: string) => {
    if (!confirm("Delete this show?")) return;

    const { error } = await supabase.from("podcast_shows").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Show deleted" });
      fetchShows();
    }
  };

  const formatShowDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "EEE, MMM d 'at' h:mm a");
  };

  return (
    <div className="max-w-full px-2 py-3 space-y-4 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold">Podcast Schedule</h1>
          <p className="text-xs text-muted-foreground">AI-powered show management</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchShows}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Create Show Form */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Create New Show</CardTitle>
            <Button 
              onClick={generateFullShow} 
              disabled={generating}
              size="sm"
              className="bg-gradient-to-r from-primary to-orange-500"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
              AI Generate All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title with AI */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="title">Show Title</Label>
                <Button type="button" variant="ghost" size="sm" onClick={generateAITitle} className="h-7 text-xs">
                  <Wand2 className="w-3 h-3 mr-1" />
                  AI Title
                </Button>
              </div>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="🔥 Hot Stove Report Live"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Join us for live Mets analysis..."
                rows={2}
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.show_date}
                  onChange={(e) => setFormData({ ...formData, show_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Select value={formData.show_time} onValueChange={(v) => setFormData({ ...formData, show_time: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12:00">12:00 PM (Pregame)</SelectItem>
                    <SelectItem value="14:00">2:00 PM (Weekend)</SelectItem>
                    <SelectItem value="17:30">5:30 PM (Regular)</SelectItem>
                    <SelectItem value="18:00">6:00 PM</SelectItem>
                    <SelectItem value="19:00">7:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Show Type */}
            <div>
              <Label htmlFor="type">Show Type</Label>
              <Select value={formData.show_type} onValueChange={(v) => setFormData({ ...formData, show_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular Show (Mon/Tue/Fri)</SelectItem>
                  <SelectItem value="weekend">Weekend Show</SelectItem>
                  <SelectItem value="pregame">Pregame Show</SelectItem>
                  <SelectItem value="special">Special Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Thumbnail Colors */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Thumbnail Colors (AI Fan Art)</Label>
                <Button type="button" variant="ghost" size="sm" onClick={generateAIColors} className="h-7 text-xs">
                  <Wand2 className="w-3 h-3 mr-1" />
                  AI Colors
                </Button>
              </div>
              
              {/* Preview */}
              <div className={`h-20 rounded-lg bg-gradient-to-br ${formData.thumbnail_gradient} flex items-center justify-center`}>
                <span className="text-white font-bold text-sm drop-shadow-lg">Preview</span>
              </div>
              
              {/* Color Palette Selection */}
              <div className="grid grid-cols-4 gap-2">
                {COLOR_PALETTES.map((palette) => (
                  <button
                    key={palette.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, thumbnail_gradient: palette.gradient, thumbnail_colors: palette.colors })}
                    className={`h-8 rounded bg-gradient-to-r ${palette.gradient} border-2 transition-all ${
                      formData.thumbnail_gradient === palette.gradient ? "border-white ring-2 ring-primary" : "border-transparent"
                    }`}
                    title={palette.name}
                  />
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(c) => setFormData({ ...formData, is_featured: c })}
                />
                <Label className="text-sm">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.published}
                  onCheckedChange={(c) => setFormData({ ...formData, published: c })}
                />
                <Label className="text-sm">Published</Label>
              </div>
            </div>

            <Button type="submit" className="w-full">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Show
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Scheduled Shows */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Scheduled Shows ({shows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : shows.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No shows scheduled yet</p>
          ) : (
            <div className="space-y-3">
              {shows.map((show) => (
                <div
                  key={show.id}
                  className="flex gap-3 p-3 border rounded-lg bg-card"
                >
                  {/* Thumbnail Preview */}
                  <div className={`w-20 h-16 rounded-lg bg-gradient-to-br ${show.thumbnail_gradient || 'from-primary to-orange-500'} flex items-center justify-center flex-shrink-0`}>
                    {show.is_live && (
                      <Badge className="bg-red-500 text-white text-[10px] animate-pulse">LIVE</Badge>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate">{show.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <Clock className="w-3 h-3" />
                          {formatShowDate(show.show_date)}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="outline" className="text-[10px] h-5">
                            {show.show_type}
                          </Badge>
                          {show.is_featured && (
                            <Badge className="bg-orange-500 text-[10px] h-5">Featured</Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant={show.is_live ? "destructive" : "outline"}
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => toggleLive(show.id, show.is_live)}
                        >
                          <Radio className="w-3 h-3 mr-1" />
                          {show.is_live ? "End" : "Go Live"}
                        </Button>
                        <Switch
                          checked={show.published}
                          onCheckedChange={() => togglePublished(show.id, show.published)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive"
                          onClick={() => deleteShow(show.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
