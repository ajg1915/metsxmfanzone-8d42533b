import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Send, Loader2, ImagePlus } from "lucide-react";

const CATEGORIES = [
  "News",
  "Analysis", 
  "Opinion",
  "Game Recap",
  "Player Spotlight",
  "Trade Rumors",
  "Prospects",
  "History",
];

export default function WriterArticleEditor() {
  const { id } = useParams();
  const isEditing = !!id;
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isWriter, setIsWriter] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    const checkWriterAccess = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate("/auth?mode=login");
        return;
      }

      // Check if user is a writer
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const hasWriterRole = roles?.some(r => r.role === "writer" || r.role === "admin");
      
      if (!hasWriterRole) {
        toast({
          title: "Access Denied",
          description: "You don't have writer permissions.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsWriter(true);

      // If editing, fetch the article
      if (isEditing) {
        const { data: article, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (error || !article) {
          toast({
            title: "Article not found",
            description: "You can only edit your own articles.",
            variant: "destructive",
          });
          navigate("/writer");
          return;
        }

        setTitle(article.title);
        setSlug(article.slug);
        setExcerpt(article.excerpt || "");
        setContent(article.content);
        setCategory(article.category);
        setTags(article.tags?.join(", ") || "");
        setFeaturedImageUrl(article.featured_image_url || "");
      }

      setLoading(false);
    };

    checkWriterAccess();
  }, [user, authLoading, navigate, toast, id, isEditing]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 100);
      setSlug(generatedSlug);
    }
  }, [title, isEditing]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB.",
        variant: "destructive",
      });
      return;
    }

    setImageUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("content_uploads")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("content_uploads")
        .getPublicUrl(filePath);

      setFeaturedImageUrl(urlData.publicUrl);
      toast({
        title: "Image uploaded",
        description: "Featured image has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async (submitForReview = false) => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your article.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please write some content for your article.",
        variant: "destructive",
      });
      return;
    }

    if (!category) {
      toast({
        title: "Category required",
        description: "Please select a category for your article.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const articleData = {
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/\s+/g, "-"),
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        category,
        tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        featured_image_url: featuredImageUrl || null,
        user_id: user!.id,
        approval_status: submitForReview ? "pending" : (isEditing ? undefined : "pending"),
        published: false, // Writers cannot publish directly
      };

      if (isEditing) {
        const { error } = await supabase
          .from("blog_posts")
          .update(articleData)
          .eq("id", id);

        if (error) throw error;

        toast({
          title: submitForReview ? "Submitted for review" : "Article saved",
          description: submitForReview 
            ? "Your article has been submitted for admin review."
            : "Your changes have been saved.",
        });
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .insert([articleData]);

        if (error) throw error;

        toast({
          title: "Article created",
          description: "Your article has been submitted for admin review.",
        });
        navigate("/writer");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!isWriter) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link to="/writer">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Draft
            </Button>
            <Button 
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Submit for Review
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Article" : "New Article"}</CardTitle>
            <CardDescription>
              {isEditing 
                ? "Update your article. Changes will be reviewed by an admin before publishing."
                : "Write your article. It will be reviewed by an admin before publishing."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter article title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                placeholder="article-url-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This will be used in the article URL
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                placeholder="Brief summary of your article (shown in previews)"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
              />
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
              <Label>Featured Image</Label>
              <div className="flex items-center gap-4">
                {featuredImageUrl && (
                  <img 
                    src={featuredImageUrl} 
                    alt="Featured" 
                    className="w-32 h-20 object-cover rounded-lg"
                  />
                )}
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg hover:bg-accent/50 transition-colors">
                    {imageUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ImagePlus className="w-4 h-4" />
                    )}
                    <span className="text-sm">
                      {featuredImageUrl ? "Change Image" : "Upload Image"}
                    </span>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={imageUploading}
                  />
                </label>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Write your article content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                You can use Markdown formatting for headings, bold, italic, links, etc.
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="tag1, tag2, tag3"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
