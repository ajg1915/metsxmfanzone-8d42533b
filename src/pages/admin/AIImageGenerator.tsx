import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Download, Image, Loader2, Sparkles, Copy, Check, Trash2, Upload, Wand2, History, RefreshCw, Newspaper, Youtube, Calendar, TrendingUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: Date;
  isEdited?: boolean;
}

interface DBImage {
  id: string;
  image_url: string;
  prompt: string;
  is_edited: boolean;
  created_at: string;
  created_by: string | null;
}

 interface PodcastShow {
   id: string;
   title: string;
   show_date: string;
   thumbnail_url: string | null;
 }

 interface DailyFanArtResult {
   imageUrl: string;
   prompt: string;
   trendingTopics: string[];
   updatedPodcastId: string | null;
 }

export default function AIImageGenerator() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [historyImages, setHistoryImages] = useState<DBImage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"session" | "history">("session");
  const fileInputRef = useRef<HTMLInputElement>(null);

   // Daily fan art state
   const [isGeneratingFanArt, setIsGeneratingFanArt] = useState(false);
   const [todaysPodcasts, setTodaysPodcasts] = useState<PodcastShow[]>([]);
   const [selectedPodcastId, setSelectedPodcastId] = useState<string>("auto");
   const [lastFanArt, setLastFanArt] = useState<DailyFanArtResult | null>(null);
   const [trendingNews, setTrendingNews] = useState<string[]>([]);
   const [isLoadingNews, setIsLoadingNews] = useState(false);

  // Load history on mount
  useEffect(() => {
    loadHistory();
     loadTodaysPodcasts();
     fetchTrendingNews();
  }, []);

   const loadTodaysPodcasts = async () => {
     try {
       const today = new Date().toISOString().split('T')[0];
       const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
       
       const { data, error } = await supabase
         .from('podcast_shows')
         .select('id, title, show_date, thumbnail_url')
         .gte('show_date', today)
         .lte('show_date', nextWeek)
         .order('show_date', { ascending: true })
         .limit(10);

       if (error) throw error;
       setTodaysPodcasts((data as PodcastShow[]) || []);
     } catch (error) {
       console.error("Error loading podcasts:", error);
     }
   };

   const fetchTrendingNews = async () => {
     setIsLoadingNews(true);
     try {
       const { data, error } = await supabase.functions.invoke('fetch-mets-news');
       if (error) throw error;
       
       const metsNews = (data.news || [])
         .filter((item: any) => item.is_mets_related)
         .slice(0, 5)
         .map((item: any) => item.title || item.details);
       
       setTrendingNews(metsNews);
     } catch (error) {
       console.error("Error fetching trending news:", error);
     } finally {
       setIsLoadingNews(false);
     }
   };

   const handleGenerateDailyFanArt = async () => {
     setIsGeneratingFanArt(true);
     try {
       const { data, error } = await supabase.functions.invoke('generate-daily-fanart', {
         body: selectedPodcastId !== "auto" && selectedPodcastId !== "none" 
           ? { podcast_id: selectedPodcastId } 
           : {}
       });

       if (error) throw error;

       if (data?.imageUrl) {
         setLastFanArt({
           imageUrl: data.imageUrl,
           prompt: data.prompt,
           trendingTopics: data.trendingTopics || [],
           updatedPodcastId: data.updatedPodcastId
         });

         // Add to session images
         const newImage: GeneratedImage = {
           id: crypto.randomUUID(),
           imageUrl: data.imageUrl,
           prompt: `[Daily Fan Art] ${data.prompt}`,
           createdAt: new Date(),
         };
         setGeneratedImages(prev => [newImage, ...prev]);
         
         // Reload history and podcasts
         loadHistory();
         loadTodaysPodcasts();

         toast({
           title: "Daily Fan Art Generated! 🎨",
           description: data.updatedPodcastId 
             ? "Image created and attached to podcast thumbnail"
             : "Image created and saved to history",
         });
       } else {
         throw new Error("No image generated");
       }
     } catch (error: any) {
       console.error("Error generating daily fan art:", error);
       
       if (error.message?.includes("429") || error.message?.includes("rate limit")) {
         toast({
           title: "Rate Limited",
           description: "Too many requests. Please wait a moment and try again.",
           variant: "destructive",
         });
       } else if (error.message?.includes("402")) {
         toast({
           title: "Credits Depleted",
           description: "AI credits are low. Please add more credits to continue.",
           variant: "destructive",
         });
       } else {
         toast({
           title: "Error",
           description: error.message || "Failed to generate daily fan art",
           variant: "destructive",
         });
       }
     } finally {
       setIsGeneratingFanArt(false);
     }
   };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('ai_image_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistoryImages((data as DBImage[]) || []);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const saveToHistory = async (imageUrl: string, promptText: string, isEdited: boolean = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('ai_image_history')
        .insert({
          image_url: imageUrl,
          prompt: promptText,
          is_edited: isEdited,
          created_by: user?.id || null
        });

      if (error) throw error;
      
      // Reload history
      loadHistory();
    } catch (error) {
      console.error("Error saving to history:", error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to generate an image",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-image', {
        body: { prompt: prompt.trim() }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        const newImage: GeneratedImage = {
          id: crypto.randomUUID(),
          imageUrl: data.imageUrl,
          prompt: prompt.trim(),
          createdAt: new Date(),
        };
        setGeneratedImages(prev => [newImage, ...prev]);
        
        // Save to database history
        await saveToHistory(data.imageUrl, prompt.trim(), false);
        
        setPrompt("");
        toast({
          title: "Success",
          description: "Image generated and saved to history!",
        });
      } else {
        throw new Error("No image URL returned");
      }
    } catch (error: any) {
      console.error("Error generating image:", error);
      
      if (error.message?.includes("429") || error.message?.includes("rate limit")) {
        toast({
          title: "Rate Limited",
          description: "Too many requests. Please wait a moment and try again.",
          variant: "destructive",
        });
      } else if (error.message?.includes("402")) {
        toast({
          title: "Credits Depleted",
          description: "AI credits are low. Please add more credits to continue.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to generate image",
          variant: "destructive",
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File",
        description: "Please upload a JPG, PNG, WebP, or GIF image",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      setUploadedFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleEditImage = async () => {
    if (!uploadedImage) {
      toast({
        title: "Error",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    if (!editPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe how you want to edit the image",
        variant: "destructive",
      });
      return;
    }

    setIsEditing(true);
    try {
      const { data, error } = await supabase.functions.invoke('edit-ai-image', {
        body: { 
          imageUrl: uploadedImage,
          prompt: editPrompt.trim()
        }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        const fullPrompt = `Edit: ${editPrompt.trim()}`;
        const newImage: GeneratedImage = {
          id: crypto.randomUUID(),
          imageUrl: data.imageUrl,
          prompt: fullPrompt,
          createdAt: new Date(),
          isEdited: true,
        };
        setGeneratedImages(prev => [newImage, ...prev]);
        
        // Save to database history
        await saveToHistory(data.imageUrl, fullPrompt, true);
        
        setEditPrompt("");
        setUploadedImage(null);
        setUploadedFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        toast({
          title: "Success",
          description: "Image edited and saved to history!",
        });
      } else {
        throw new Error("No edited image returned");
      }
    } catch (error: any) {
      console.error("Error editing image:", error);
      
      if (error.message?.includes("429") || error.message?.includes("rate limit")) {
        toast({
          title: "Rate Limited",
          description: "Too many requests. Please wait a moment and try again.",
          variant: "destructive",
        });
      } else if (error.message?.includes("402")) {
        toast({
          title: "Credits Depleted",
          description: "AI credits are low. Please add more credits to continue.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to edit image",
          variant: "destructive",
        });
      }
    } finally {
      setIsEditing(false);
    }
  };

  const clearUploadedImage = () => {
    setUploadedImage(null);
    setUploadedFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = async (imageUrl: string, imagePrompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Downloaded",
        description: "Image saved to your device",
      });
    } catch (error) {
      console.error("Error downloading image:", error);
      toast({
        title: "Error",
        description: "Failed to download image",
        variant: "destructive",
      });
    }
  };

  const handleCopyUrl = async (id: string, imageUrl: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: "Copied",
        description: "Image URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSession = (id: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== id));
    toast({
      title: "Deleted",
      description: "Image removed from session",
    });
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_image_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHistoryImages(prev => prev.filter(img => img.id !== id));
      toast({
        title: "Deleted",
        description: "Image removed from history",
      });
    } catch (error) {
      console.error("Error deleting from history:", error);
      toast({
        title: "Error",
        description: "Failed to delete image from history",
        variant: "destructive",
      });
    }
  };

  const promptSuggestions = [
    "New York Mets celebrating a home run at Citi Field, vibrant and energetic",
    "Mets player making an incredible diving catch, action shot",
    "Citi Field stadium at sunset with orange and blue sky",
    "Mets championship celebration with confetti and fans cheering",
    "Baseball glove with Mets logo on the field, close-up shot",
    "Mr. Met mascot giving high-fives to fans, fun atmosphere",
  ];

  const editSuggestions = [
    "Add dramatic lighting and shadows",
    "Make it look like a vintage baseball card",
    "Add Mets blue and orange color tones",
    "Make it look like a comic book illustration",
    "Add confetti and celebration effects",
    "Convert to a dramatic night game atmosphere",
  ];

  return (
    <>
      <Helmet>
        <title>AI Image Generator | Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            AI Image Generator
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Generate or edit images using AI for blog posts, stories, and social media
          </p>
        </div>

         {/* Daily YouTube Fan Art Section */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
           <CardHeader className="pb-3">
             <div className="flex items-center justify-between">
               <div>
                 <CardTitle className="flex items-center gap-2 text-lg">
                    <Youtube className="h-5 w-5 text-destructive" />
                   Daily YouTube Fan Art
                 </CardTitle>
                 <CardDescription className="text-xs sm:text-sm">
                   Auto-generate trending Mets-themed podcast thumbnails
                 </CardDescription>
               </div>
               <Badge variant="outline" className="text-xs">
                 <TrendingUp className="h-3 w-3 mr-1" />
                 News-Powered
               </Badge>
             </div>
           </CardHeader>
           <CardContent className="space-y-4">
             {/* Trending News Preview */}
             <div className="space-y-2">
               <Label className="text-xs text-muted-foreground flex items-center gap-1">
                 <Newspaper className="h-3 w-3" />
                 Trending Mets Topics (used for art generation)
               </Label>
               <div className="flex flex-wrap gap-1.5">
                 {isLoadingNews ? (
                   <span className="text-xs text-muted-foreground">Loading news...</span>
                 ) : trendingNews.length > 0 ? (
                   trendingNews.slice(0, 3).map((topic, i) => (
                     <Badge key={i} variant="secondary" className="text-[10px] font-normal">
                       {topic.length > 40 ? topic.substring(0, 37) + "..." : topic}
                     </Badge>
                   ))
                 ) : (
                   <span className="text-xs text-muted-foreground">No trending news - will use default themes</span>
                 )}
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={fetchTrendingNews}
                   disabled={isLoadingNews}
                   className="h-5 w-5 p-0"
                 >
                   <RefreshCw className={`h-3 w-3 ${isLoadingNews ? 'animate-spin' : ''}`} />
                 </Button>
               </div>
             </div>

             {/* Podcast Selection */}
             <div className="flex flex-col sm:flex-row gap-3">
               <div className="flex-1 space-y-1.5">
                 <Label className="text-xs text-muted-foreground flex items-center gap-1">
                   <Calendar className="h-3 w-3" />
                   Attach to Podcast
                 </Label>
                 <Select value={selectedPodcastId} onValueChange={setSelectedPodcastId}>
                   <SelectTrigger className="h-9 text-xs">
                     <SelectValue placeholder="Select podcast" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="auto">Auto (first without thumbnail)</SelectItem>
                     <SelectItem value="none">Don't attach to podcast</SelectItem>
                     {todaysPodcasts.map((show) => (
                       <SelectItem key={show.id} value={show.id}>
                         <span className="flex items-center gap-2">
                          {show.thumbnail_url && <Check className="h-3 w-3 text-primary" />}
                           {format(new Date(show.show_date), "MMM d")} - {show.title.substring(0, 30)}...
                         </span>
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

               <Button
                 onClick={handleGenerateDailyFanArt}
                 disabled={isGeneratingFanArt}
                  className="sm:self-end"
               >
                 {isGeneratingFanArt ? (
                   <>
                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     Generating...
                   </>
                 ) : (
                   <>
                     <Youtube className="h-4 w-4 mr-2" />
                     Generate Daily Fan Art
                   </>
                 )}
               </Button>
             </div>

             {/* Last Generated Preview */}
             {lastFanArt && (
               <div className="border rounded-lg p-3 bg-background/50 space-y-2">
                 <div className="flex gap-3">
                   <img 
                     src={lastFanArt.imageUrl} 
                     alt="Latest fan art" 
                     className="w-24 h-16 object-cover rounded"
                   />
                   <div className="flex-1 min-w-0">
                     <p className="text-xs font-medium truncate">Latest Fan Art</p>
                     <p className="text-[10px] text-muted-foreground line-clamp-2">
                       {lastFanArt.prompt}
                     </p>
                     {lastFanArt.updatedPodcastId && (
                       <Badge variant="outline" className="text-[10px] mt-1">
                         <Check className="h-2 w-2 mr-1" />
                         Attached to podcast
                       </Badge>
                     )}
                   </div>
                 </div>
                 <div className="flex gap-1.5">
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => handleDownload(lastFanArt.imageUrl, lastFanArt.prompt)}
                     className="flex-1 h-7 text-xs"
                   >
                     <Download className="h-3 w-3 mr-1" />
                     Download
                   </Button>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => handleCopyUrl("fanart", lastFanArt.imageUrl)}
                     className="flex-1 h-7 text-xs"
                   >
                     <Copy className="h-3 w-3 mr-1" />
                     Copy URL
                   </Button>
                 </div>
               </div>
             )}
           </CardContent>
         </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generator Panel */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Image className="h-5 w-5" />
                Create Image
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Generate new images or upload and edit existing ones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="generate" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="generate" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                    Generate
                  </TabsTrigger>
                  <TabsTrigger value="edit" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                    Upload & Edit
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="generate" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prompt" className="text-sm">Image Description</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Describe the image you want to generate..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      className="resize-none text-sm"
                    />
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full"
                    size="sm"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Image
                      </>
                    )}
                  </Button>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Quick Prompts</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {promptSuggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setPrompt(suggestion)}
                          className="text-[10px] sm:text-xs h-auto py-1 px-2"
                        >
                          {suggestion.slice(0, 25)}...
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="edit" className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Upload Image</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    {!uploadedImage ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs sm:text-sm font-medium">Click to upload an image</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                          JPG, PNG, WebP, or GIF (max 5MB)
                        </p>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={uploadedImage}
                          alt="Uploaded"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-7 w-7 p-0"
                          onClick={clearUploadedImage}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2 truncate">
                          {uploadedFileName}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editPrompt" className="text-sm">Edit Instructions</Label>
                    <Textarea
                      id="editPrompt"
                      placeholder="Describe how you want to modify this image..."
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      rows={3}
                      className="resize-none text-sm"
                      disabled={!uploadedImage}
                    />
                  </div>

                  <Button
                    onClick={handleEditImage}
                    disabled={isEditing || !uploadedImage || !editPrompt.trim()}
                    className="w-full"
                    size="sm"
                  >
                    {isEditing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Editing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Edit Image
                      </>
                    )}
                  </Button>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Edit Suggestions</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {editSuggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setEditPrompt(suggestion)}
                          className="text-[10px] sm:text-xs h-auto py-1 px-2"
                          disabled={!uploadedImage}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Generated Images Gallery with History */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Image Gallery</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {activeTab === "session" 
                      ? `${generatedImages.length} image${generatedImages.length !== 1 ? 's' : ''} this session`
                      : `${historyImages.length} image${historyImages.length !== 1 ? 's' : ''} in history`
                    }
                  </CardDescription>
                </div>
                {activeTab === "history" && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadHistory}
                    disabled={isLoadingHistory}
                    className="h-8"
                  >
                    <RefreshCw className={`h-3 w-3 mr-1 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                )}
              </div>
              
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "session" | "history")} className="mt-3">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="session" className="flex items-center gap-1 text-xs sm:text-sm">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                    Session
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-1 text-xs sm:text-sm">
                    <History className="h-3 w-3 sm:h-4 sm:w-4" />
                    History
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {activeTab === "session" ? (
                generatedImages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Image className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No images generated yet</p>
                    <p className="text-xs">Generate or edit images to see them here</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-3">
                      {generatedImages.map((image) => (
                        <div key={image.id} className="border rounded-lg overflow-hidden">
                          <div className="relative">
                            <img
                              src={image.imageUrl}
                              alt={image.prompt}
                              className="w-full h-40 object-cover"
                            />
                            {image.isEdited && (
                              <Badge className="absolute top-2 left-2 text-[10px]">
                                <Wand2 className="h-3 w-3 mr-1" />
                                Edited
                              </Badge>
                            )}
                          </div>
                          <div className="p-3 space-y-2">
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {image.prompt}
                            </p>
                            <p className="text-[10px] text-muted-foreground/70">
                              {format(image.createdAt, "MMM d, yyyy h:mm a")}
                            </p>
                            <div className="flex gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(image.imageUrl, image.prompt)}
                                className="flex-1 h-7 text-xs"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyUrl(image.id, image.imageUrl)}
                                className="flex-1 h-7 text-xs"
                              >
                                {copiedId === image.id ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteSession(image.id)}
                                className="h-7 w-7 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )
              ) : (
                isLoadingHistory ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading history...</p>
                  </div>
                ) : historyImages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No images in history</p>
                    <p className="text-xs">Generated images will be saved here</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-3">
                      {historyImages.map((image) => (
                        <div key={image.id} className="border rounded-lg overflow-hidden">
                          <div className="relative">
                            <img
                              src={image.image_url}
                              alt={image.prompt}
                              className="w-full h-40 object-cover"
                            />
                            {image.is_edited && (
                              <Badge className="absolute top-2 left-2 text-[10px]">
                                <Wand2 className="h-3 w-3 mr-1" />
                                Edited
                              </Badge>
                            )}
                          </div>
                          <div className="p-3 space-y-2">
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {image.prompt}
                            </p>
                            <p className="text-[10px] text-muted-foreground/70">
                              {format(new Date(image.created_at), "MMM d, yyyy h:mm a")}
                            </p>
                            <div className="flex gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(image.image_url, image.prompt)}
                                className="flex-1 h-7 text-xs"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyUrl(image.id, image.image_url)}
                                className="flex-1 h-7 text-xs"
                              >
                                {copiedId === image.id ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteHistory(image.id)}
                                className="h-7 w-7 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
