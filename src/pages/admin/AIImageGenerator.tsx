import { useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Image, Loader2, Sparkles, Copy, Check, Trash2, Upload, Wand2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: Date;
  isEdited?: boolean;
}

export default function AIImageGenerator() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File",
        description: "Please upload a JPG, PNG, WebP, or GIF image",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
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
        const newImage: GeneratedImage = {
          id: crypto.randomUUID(),
          imageUrl: data.imageUrl,
          prompt: `Edit: ${editPrompt.trim()}`,
          createdAt: new Date(),
          isEdited: true,
        };
        setGeneratedImages(prev => [newImage, ...prev]);
        setEditPrompt("");
        setUploadedImage(null);
        setUploadedFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        toast({
          title: "Success",
          description: "Image edited successfully!",
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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Image Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate or edit images using AI for blog posts, stories, and social media
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generator Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Create Image
              </CardTitle>
              <CardDescription>
                Generate new images or upload and edit existing ones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="generate" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="generate" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </TabsTrigger>
                  <TabsTrigger value="edit" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload & Edit
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="generate" className="space-y-4">
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
                </TabsContent>

                <TabsContent value="edit" className="space-y-4">
                  {/* Upload Section */}
                  <div className="space-y-2">
                    <Label>Upload Image</Label>
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
                        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm font-medium">Click to upload an image</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG, WebP, or GIF (max 5MB)
                        </p>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={uploadedImage}
                          alt="Uploaded"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={clearUploadedImage}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2 truncate">
                          {uploadedFileName}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Edit Prompt */}
                  <div className="space-y-2">
                    <Label htmlFor="editPrompt">Edit Instructions</Label>
                    <Textarea
                      id="editPrompt"
                      placeholder="Describe how you want to modify this image..."
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      rows={3}
                      className="resize-none"
                      disabled={!uploadedImage}
                    />
                  </div>

                  <Button
                    onClick={handleEditImage}
                    disabled={isEditing || !uploadedImage || !editPrompt.trim()}
                    className="w-full"
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
                    <Label className="text-sm text-muted-foreground">Edit Suggestions</Label>
                    <div className="flex flex-wrap gap-2">
                      {editSuggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setEditPrompt(suggestion)}
                          className="text-xs h-auto py-1 px-2"
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
                  <p className="text-sm">Generate or edit images to see them here</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {generatedImages.map((image) => (
                      <div key={image.id} className="border rounded-lg overflow-hidden">
                        <div className="relative">
                          <img
                            src={image.imageUrl}
                            alt={image.prompt}
                            className="w-full h-48 object-cover"
                          />
                          {image.isEdited && (
                            <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <Wand2 className="h-3 w-3" />
                              Edited
                            </span>
                          )}
                        </div>
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