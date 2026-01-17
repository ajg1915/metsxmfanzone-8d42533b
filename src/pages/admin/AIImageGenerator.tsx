import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Download, Image, Loader2, Sparkles, Copy, Check, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: Date;
}

export default function AIImageGenerator() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
        setPrompt("");
        toast({
          title: "Success",
          description: "Image generated successfully!",
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

  const handleDownload = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.imageUrl);
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

  const handleCopyUrl = async (image: GeneratedImage) => {
    try {
      await navigator.clipboard.writeText(image.imageUrl);
      setCopiedId(image.id);
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

  const handleDelete = (id: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== id));
    toast({
      title: "Deleted",
      description: "Image removed from gallery",
    });
  };

  const promptSuggestions = [
    "New York Mets celebrating a home run at Citi Field, vibrant and energetic",
    "Mets player making an incredible diving catch, action shot",
    "Citi Field stadium at sunset with orange and blue sky",
    "Mets championship celebration with confetti and fans cheering",
    "Baseball glove with Mets logo on the field, close-up shot",
    "Mr. Met mascot giving high-fives to fans, fun atmosphere",
  ];

  return (
    <>
      <Helmet>
        <title>AI Image Generator | Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Image Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate PNG images using AI for blog posts, stories, and social media
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generator Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Generate New Image
              </CardTitle>
              <CardDescription>
                Describe what you want to create and AI will generate it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Image Description</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe the image you want to generate..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full"
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
                <Label className="text-sm text-muted-foreground">Quick Prompts</Label>
                <div className="flex flex-wrap gap-2">
                  {promptSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setPrompt(suggestion)}
                      className="text-xs h-auto py-1 px-2"
                    >
                      {suggestion.slice(0, 30)}...
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Images Gallery */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Images</CardTitle>
              <CardDescription>
                {generatedImages.length} image{generatedImages.length !== 1 ? 's' : ''} generated this session
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedImages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No images generated yet</p>
                  <p className="text-sm">Enter a prompt and click generate to create images</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {generatedImages.map((image) => (
                      <div key={image.id} className="border rounded-lg overflow-hidden">
                        <img
                          src={image.imageUrl}
                          alt={image.prompt}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-3 space-y-2">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {image.prompt}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(image)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyUrl(image)}
                            >
                              {copiedId === image.id ? (
                                <Check className="h-4 w-4 mr-1" />
                              ) : (
                                <Copy className="h-4 w-4 mr-1" />
                              )}
                              Copy URL
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(image.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
