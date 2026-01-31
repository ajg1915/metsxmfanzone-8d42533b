import { useState, useEffect, useRef } from "react";
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
import { Trash2, Loader2, Wand2, Calendar, Clock, Sparkles, Radio, RefreshCw, Upload, Image, Pencil, X } from "lucide-react";
import { format } from "date-fns";

interface PodcastShow {
  id: string;
  title: string;
  description: string | null;
  show_date: string;
  show_type: string;
  thumbnail_gradient: string | null;
  thumbnail_url: string | null;
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

// AI Image prompts for podcast thumbnails
const IMAGE_PROMPTS = [
  "New York Mets baseball podcast show artwork, orange and blue colors, microphone and baseball, professional sports media design, dynamic composition",
  "Mets fan podcast thumbnail, Citi Field stadium background, baseball and headphones, blue and orange theme, broadcast style",
  "Baseball talk show artwork, New York Mets colors, exciting sports podcast design, modern and energetic",
  "Mets baseball discussion show art, podcast microphone with baseball, orange and blue gradient, professional sports media",
  "Live sports podcast thumbnail, New York Mets theme, baseball diamond and microphone, dynamic sports broadcasting style",
];

export default function PodcastScheduleManagement() {
  const [shows, setShows] = useState<PodcastShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const initialFormData = {
    title: "",
    description: "",
    show_date: "",
    show_time: "17:30",
    show_type: "regular",
    thumbnail_url: "",
    is_featured: false,
    published: true,
  };

  const [formData, setFormData] = useState(initialFormData);

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

  const generateAIImage = async () => {
    setGeneratingImage(true);
    try {
      const prompt = IMAGE_PROMPTS[Math.floor(Math.random() * IMAGE_PROMPTS.length)];
      
      const { data, error } = await supabase.functions.invoke('generate-ai-image', {
        body: { prompt }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        // Upload the base64 image to storage
        const base64Data = data.imageUrl.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });

        const fileName = `podcast-thumbnail-${Date.now()}.png`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('content_uploads')
          .upload(`podcast-thumbnails/${fileName}`, blob);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('content_uploads')
          .getPublicUrl(`podcast-thumbnails/${fileName}`);

        setFormData(prev => ({ ...prev, thumbnail_url: urlData.publicUrl }));
        toast({ title: "AI Image Generated!", description: "Thumbnail created successfully" });
      }
    } catch (error) {
      console.error('Error generating AI image:', error);
      toast({ 
        title: "Error generating image", 
        description: error instanceof Error ? error.message : "Failed to generate image", 
        variant: "destructive" 
      });
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileName = `podcast-thumbnail-${Date.now()}.${file.name.split('.').pop()}`;
      const { data, error } = await supabase.storage
        .from('content_uploads')
        .upload(`podcast-thumbnails/${fileName}`, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('content_uploads')
        .getPublicUrl(`podcast-thumbnails/${fileName}`);

      setFormData(prev => ({ ...prev, thumbnail_url: urlData.publicUrl }));
      toast({ title: "Image uploaded!", description: "Thumbnail uploaded successfully" });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ 
        title: "Upload failed", 
        description: error instanceof Error ? error.message : "Failed to upload image", 
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const generateFullShow = async () => {
    setGenerating(true);
    
    // Generate title and description
    const template = TITLE_TEMPLATES[Math.floor(Math.random() * TITLE_TEMPLATES.length)];
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const title = template.replace("{topic}", topic);
    const description = DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)];
    
    // Set next available show date
    const now = new Date();
    let nextShowDate = new Date(now);
    const dayOfWeek = now.getDay();
    const daysUntilNext: Record<number, number> = {
      0: 1, 1: 0, 2: 0, 3: 2, 4: 1, 5: 0, 6: 0,
    };
    nextShowDate.setDate(now.getDate() + daysUntilNext[dayOfWeek]);
    
    const isWeekend = nextShowDate.getDay() === 0 || nextShowDate.getDay() === 6;
    const showTime = isWeekend ? "14:00" : "17:30";
    
    setFormData({
      title,
      description,
      show_date: format(nextShowDate, "yyyy-MM-dd"),
      show_time: showTime,
      show_type: isWeekend ? "weekend" : "regular",
      thumbnail_url: "",
      is_featured: false,
      published: true,
    });

    // Generate AI image
    try {
      const prompt = IMAGE_PROMPTS[Math.floor(Math.random() * IMAGE_PROMPTS.length)];
      const { data, error } = await supabase.functions.invoke('generate-ai-image', {
        body: { prompt }
      });

      if (!error && data?.imageUrl) {
        const base64Data = data.imageUrl.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });

        const fileName = `podcast-thumbnail-${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from('content_uploads')
          .upload(`podcast-thumbnails/${fileName}`, blob);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('content_uploads')
            .getPublicUrl(`podcast-thumbnails/${fileName}`);
          setFormData(prev => ({ ...prev, thumbnail_url: urlData.publicUrl }));
        }
      }
    } catch (error) {
      console.error('Error generating AI image:', error);
    }

    setGenerating(false);
    toast({ title: "Full Show Generated!", description: `"${title}" with AI thumbnail` });
  };

  const startEditing = (show: PodcastShow) => {
    const showDate = new Date(show.show_date);
    setEditingId(show.id);
    setFormData({
      title: show.title,
      description: show.description || "",
      show_date: format(showDate, "yyyy-MM-dd"),
      show_time: format(showDate, "HH:mm"),
      show_type: show.show_type,
      thumbnail_url: show.thumbnail_url || "",
      is_featured: show.is_featured,
      published: show.published,
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const showDateTime = new Date(`${formData.show_date}T${formData.show_time}`);
    
    const showData = {
      title: formData.title,
      description: formData.description,
      show_date: showDateTime.toISOString(),
      show_type: formData.show_type,
      thumbnail_url: formData.thumbnail_url || null,
      is_featured: formData.is_featured,
      published: formData.published,
    };

    if (editingId) {
      // Update existing show
      const { error } = await supabase
        .from("podcast_shows")
        .update(showData)
        .eq("id", editingId);

      if (error) {
        toast({ title: "Error updating show", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Show updated successfully!" });
        setEditingId(null);
        setFormData(initialFormData);
        fetchShows();
      }
    } else {
      // Create new show
      const { error } = await supabase.from("podcast_shows").insert(showData);

      if (error) {
        toast({ title: "Error creating show", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Show created successfully!" });
        setFormData(initialFormData);
        fetchShows();
      }
    }
    
    setSubmitting(false);
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

      {/* Create/Edit Show Form */}
      <Card className={editingId ? "ring-2 ring-primary" : ""}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {editingId ? "Edit Show" : "Create New Show"}
            </CardTitle>
            <div className="flex gap-2">
              {editingId && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={cancelEditing}
                  className="text-muted-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              )}
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

            {/* Thumbnail Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Show Thumbnail</Label>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={generateAIImage} 
                    disabled={generatingImage}
                    className="h-7 text-xs"
                  >
                    {generatingImage ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Wand2 className="w-3 h-3 mr-1" />}
                    AI Image
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="h-7 text-xs"
                  >
                    {uploading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Upload className="w-3 h-3 mr-1" />}
                    Upload
                  </Button>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {/* Thumbnail Preview */}
              <div className="h-32 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden bg-muted/20">
                {formData.thumbnail_url ? (
                  <img 
                    src={formData.thumbnail_url} 
                    alt="Thumbnail preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Generate or upload a thumbnail</p>
                  </div>
                )}
              </div>

              {formData.thumbnail_url && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: "" }))}
                  className="text-xs text-destructive"
                >
                  Remove Thumbnail
                </Button>
              )}
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

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Calendar className="w-4 h-4 mr-2" />
              )}
              {editingId ? "Update Show" : "Schedule Show"}
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
                  <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    {show.thumbnail_url ? (
                      <img 
                        src={show.thumbnail_url} 
                        alt={show.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${show.thumbnail_gradient || 'from-primary to-orange-500'} flex items-center justify-center`}>
                        {show.is_live && (
                          <Badge className="bg-red-500 text-white text-[10px] animate-pulse">LIVE</Badge>
                        )}
                      </div>
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
                          {show.is_live && (
                            <Badge className="bg-red-500 text-[10px] h-5 animate-pulse">LIVE</Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => startEditing(show)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
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
