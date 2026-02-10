import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, FileText, Sparkles, Upload, Music, Copy, CheckCircle, XCircle, Clock, ShieldAlert, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { z } from "zod";
import { validateFile, generateSafeFilename } from "@/utils/fileValidation";

const blogPostSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200, "Title must be less than 200 characters"),
  slug: z.string().trim().max(250, "Slug too long").regex(/^[a-z0-9-]*$/, "Slug must contain only lowercase letters, numbers, and hyphens").optional(),
  content: z.string().trim().min(10, "Content must be at least 10 characters").max(50000, "Content must be less than 50,000 characters"),
  excerpt: z.string().trim().max(500, "Excerpt must be less than 500 characters").optional(),
  featured_image_url: z.string().trim().max(2000, "Image URL too long").optional(),
  category: z.string().trim().min(1, "Category is required").max(100, "Category too long"),
  tags: z.string().trim().max(200, "Tags must be less than 200 characters").optional(),
  published: z.boolean(),
});

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url?: string;
  audio_url?: string;
  category: string;
  tags: string[];
  published: boolean;
  published_at?: string;
  created_at: string;
  approval_status?: string;
  user_id?: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

export default function BlogManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    featured_image_url: "",
    audio_url: "",
    category: "General",
    tags: "",
    published: false,
  });
  const [generatingContent, setGeneratingContent] = useState(false);
  const [generatingExcerpt, setGeneratingExcerpt] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [checkingAI, setCheckingAI] = useState<string | null>(null);
  const [aiCheckResult, setAiCheckResult] = useState<{
    postId: string;
    isAIGenerated: boolean;
    isPlagiarized: boolean;
    confidence: number;
    reasons: string[];
  } | null>(null);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load blog posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ 
          approval_status: "approved", 
          published: true,
          published_at: new Date().toISOString()
        })
        .eq("id", post.id);

      if (error) throw error;

      toast({
        title: "Approved & Published",
        description: "Article has been approved and is now live on the blog.",
      });
      fetchPosts();
    } catch (error) {
      console.error("Error approving:", error);
      toast({
        title: "Error",
        description: "Failed to approve article",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ approval_status: "rejected", published: false })
        .eq("id", post.id);

      if (error) throw error;

      toast({
        title: "Rejected",
        description: "Article has been rejected.",
      });
      fetchPosts();
    } catch (error) {
      console.error("Error rejecting:", error);
      toast({
        title: "Error",
        description: "Failed to reject article",
        variant: "destructive",
      });
    }
  };

  const handleCheckAI = async (post: BlogPost) => {
    if (!post.content || post.content.length < 50) {
      toast({
        title: "Error",
        description: "Article content is too short to analyze",
        variant: "destructive",
      });
      return;
    }

    setCheckingAI(post.id);
    try {
      const { data, error } = await supabase.functions.invoke('check-ai-content', {
        body: { content: post.content, title: post.title }
      });

      if (error) throw error;

      if (data.isAIGenerated || data.isPlagiarized) {
        setAiCheckResult({
          postId: post.id,
          isAIGenerated: data.isAIGenerated,
          isPlagiarized: data.isPlagiarized,
          confidence: data.confidence,
          reasons: data.reasons || []
        });
        setRevokeTarget(post);
        setShowRevokeDialog(true);
      } else {
        toast({
          title: "Content Verified ✓",
          description: `Article appears to be original content (${data.confidence}% confidence)`,
        });
      }
    } catch (error: any) {
      console.error("Error checking AI content:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to check article content",
        variant: "destructive",
      });
    } finally {
      setCheckingAI(null);
    }
  };

  const handleRevokeWriter = async () => {
    if (!revokeTarget || !aiCheckResult) return;

    try {
      // 1. Delete the article
      const { error: deleteError } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", revokeTarget.id);

      if (deleteError) throw deleteError;

      // 2. Remove writer role from user
      if (revokeTarget.user_id) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", revokeTarget.user_id)
          .eq("role", "writer");

        if (roleError) {
          console.error("Error removing writer role:", roleError);
        }
      }

      // 3. Send revocation email
      const writerName = revokeTarget.profiles?.full_name || revokeTarget.profiles?.email || "Writer";
      const writerEmail = revokeTarget.profiles?.email;

      if (writerEmail) {
        const reasons: string[] = [];
        if (aiCheckResult.isAIGenerated) {
          reasons.push("Content was detected as AI-generated (ChatGPT, Claude, or similar AI tools)");
        }
        if (aiCheckResult.isPlagiarized) {
          reasons.push("Content appears to be plagiarized or copied from other sources");
        }
        if (aiCheckResult.reasons.length > 0) {
          reasons.push(...aiCheckResult.reasons);
        }

        await supabase.functions.invoke('send-writer-revoked-email', {
          body: {
            email: writerEmail,
            name: writerName,
            articleTitle: revokeTarget.title,
            reasons
          }
        });
      }

      toast({
        title: "Writer Access Revoked",
        description: "Article deleted, writer role removed, and notification email sent.",
      });

      setShowRevokeDialog(false);
      setRevokeTarget(null);
      setAiCheckResult(null);
      fetchPosts();
    } catch (error: any) {
      console.error("Error revoking writer:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to revoke writer access",
        variant: "destructive",
      });
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      // Validate form data with Zod
      const validationResult = blogPostSchema.safeParse(formData);
      
      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
        return;
      }

      const slug = formData.slug || generateSlug(formData.title);
      
      // Validate individual tags
      const tagsArray = formData.tags.split(",").map(t => t.trim()).filter(t => t);
      if (tagsArray.some(tag => tag.length > 50)) {
        toast({
          title: "Validation Error",
          description: "Individual tags must be less than 50 characters",
          variant: "destructive",
        });
        return;
      }
      
      const postData = {
        ...formData,
        slug,
        tags: tagsArray,
        user_id: user.id,
        published_at: formData.published ? new Date().toISOString() : null,
      };

      if (editingPost) {
        const { error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", editingPost.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Blog post updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .insert([postData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Blog post created successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPosts();
    } catch (error: any) {
      console.error("Error saving post:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save blog post",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      featured_image_url: post.featured_image_url || "",
      audio_url: post.audio_url || "",
      category: post.category,
      tags: post.tags.join(", "),
      published: post.published,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
      
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    }
  };

  const handleGenerateContent = async () => {
    if (!formData.title) {
      toast({
        title: "Error",
        description: "Please enter a blog title first",
        variant: "destructive",
      });
      return;
    }

    setGeneratingContent(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-content', {
        body: { 
          title: formData.title,
          category: formData.category,
          excerpt: formData.excerpt
        }
      });

      if (error) throw error;

      if (data?.content) {
        setFormData({ ...formData, content: data.content });
        toast({
          title: "Success",
          description: "Article content generated successfully!",
        });
      }
    } catch (error: any) {
      console.error("Error generating content:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setGeneratingContent(false);
    }
  };

  const handleGenerateExcerpt = async () => {
    if (!formData.title && !formData.content) {
      toast({
        title: "Error",
        description: "Please enter a title or content first to generate an excerpt",
        variant: "destructive",
      });
      return;
    }

    setGeneratingExcerpt(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-excerpt', {
        body: { 
          title: formData.title,
          content: formData.content,
          category: formData.category
        }
      });

      if (error) throw error;

      if (data?.excerpt) {
        setFormData({ ...formData, excerpt: data.excerpt });
        toast({
          title: "Success",
          description: "Excerpt generated successfully!",
        });
      }
    } catch (error: any) {
      console.error("Error generating excerpt:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate excerpt",
        variant: "destructive",
      });
    } finally {
      setGeneratingExcerpt(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Comprehensive file validation
    const validation = await validateFile(file, 'image', 5);
    if (!validation.valid) {
      toast({
        title: "Error",
        description: validation.error || "Invalid file",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    try {
      const fileName = generateSafeFilename(file.name);
      const filePath = `blog-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('content_uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('content_uploads')
        .getPublicUrl(filePath);

      setFormData({ ...formData, featured_image_url: publicUrl });
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Comprehensive file validation
    const validation = await validateFile(file, 'audio', 50);
    if (!validation.valid) {
      toast({
        title: "Error",
        description: validation.error || "Invalid file",
        variant: "destructive",
      });
      return;
    }

    setUploadingAudio(true);
    try {
      const fileName = generateSafeFilename(file.name);
      const filePath = `blog-audio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('podcasts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('podcasts')
        .getPublicUrl(filePath);

      setFormData({ ...formData, audio_url: publicUrl });
      toast({
        title: "Success",
        description: "Audio uploaded successfully!",
      });
    } catch (error: any) {
      console.error("Error uploading audio:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload audio",
        variant: "destructive",
      });
    } finally {
      setUploadingAudio(false);
    }
  };

  const resetForm = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      featured_image_url: "",
      audio_url: "",
      category: "General",
      tags: "",
      published: false,
    });
  };

  const handleCopyForSharing = async (post: BlogPost) => {
    // Format content for sharing on other platforms
    const shareContent = `${post.title}

${post.excerpt || ""}

${post.content}

${post.tags.length > 0 ? `Tags: ${post.tags.join(", ")}` : ""}
`.trim();

    try {
      await navigator.clipboard.writeText(shareContent);
      toast({
        title: "Copied!",
        description: "Article copied to clipboard - ready to paste on other platforms",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-full px-1 sm:px-2 py-2 sm:py-3 overflow-x-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Blog Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto mx-3 sm:mx-0">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-base sm:text-lg">{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {editingPost ? "Update your blog post" : "Create a new blog post"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <Label htmlFor="title" className="text-sm">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug" className="text-sm">Slug (URL)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="Auto-generated"
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="tags" className="text-sm">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="sports, baseball, news"
                    className="text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="excerpt" className="text-sm">Excerpt</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerateExcerpt}
                      disabled={generatingExcerpt || (!formData.title && !formData.content)}
                      className="h-6 text-xs"
                    >
                      {generatingExcerpt ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 mr-1" />
                          Auto-Generate
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={2}
                    className="text-sm mt-1"
                    placeholder="Brief summary of the article..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="featured_image" className="text-sm">Featured Image URL</Label>
                  <Input
                    id="featured_image"
                    value={formData.featured_image_url}
                    onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                    placeholder="https://..."
                    className="mt-1 text-sm"
                  />
                  
                  <div className="mt-2">
                    <Label htmlFor="image_upload" className="text-xs text-muted-foreground">Or Upload</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        id="image_upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="cursor-pointer text-xs"
                      />
                      {uploadingImage && (
                        <Upload className="w-3 h-3 animate-pulse" />
                      )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="audio_url" className="text-sm">Article Audio (Listen Version)</Label>
                  <Input
                    id="audio_url"
                    value={formData.audio_url}
                    onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                    placeholder="https://... or upload below"
                    className="mt-1 text-sm"
                  />
                  
                  <div className="mt-2">
                    <Label htmlFor="audio_upload" className="text-xs text-muted-foreground">Or Upload Audio (MP3, WAV)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        id="audio_upload"
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioUpload}
                        disabled={uploadingAudio}
                        className="cursor-pointer text-xs"
                      />
                      {uploadingAudio && (
                        <Music className="w-3 h-3 animate-pulse" />
                      )}
                    </div>
                  </div>
                  
                  {formData.audio_url && (
                    <div className="mt-2">
                      <audio controls className="w-full h-8">
                        <source src={formData.audio_url} type="audio/mpeg" />
                      </audio>
                    </div>
                  )}
                </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="content" className="text-sm">Content</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateContent}
                      disabled={generatingContent || !formData.title}
                      className="h-7 text-xs"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {generatingContent ? "Generating..." : "Generate AI"}
                    </Button>
                  </div>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    required
                    className="text-sm font-mono"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center space-x-2 pt-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                  />
                  <Label htmlFor="published" className="text-sm">Published</Label>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  {editingPost ? "Update" : "Create"} Post
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              No blog posts yet. Create your first post!
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className={post.approval_status === "pending" ? "border-yellow-500/50" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 flex-wrap">
                      <FileText className="w-5 h-5" />
                      {post.title}
                      {post.approval_status === "pending" && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {post.approval_status === "approved" && post.published && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                          Published
                        </span>
                      )}
                      {post.approval_status === "approved" && !post.published && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                          Approved
                        </span>
                      )}
                      {post.approval_status === "rejected" && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                          Rejected
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {post.category} • {new Date(post.created_at).toLocaleDateString()}
                      {post.profiles && (
                        <span className="ml-2">• By: {post.profiles.full_name || post.profiles.email}</span>
                      )}
                    </CardDescription>
                    {post.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {post.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-muted px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {post.approval_status === "pending" && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-yellow-500 border-yellow-500/50" 
                          onClick={() => handleCheckAI(post)}
                          disabled={checkingAI === post.id}
                        >
                          {checkingAI === post.id ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <ShieldAlert className="w-4 h-4 mr-1" />
                          )}
                          AI Check
                        </Button>
                        <Button variant="outline" size="sm" className="text-green-500 border-green-500/50" onClick={() => handleApprove(post)}>
                          <CheckCircle className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 border-red-500/50" onClick={() => handleReject(post)}>
                          <XCircle className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleCopyForSharing(post)} title="Copy for sharing">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2">
                  {post.excerpt || post.content.substring(0, 150)}...
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* AI Detection Revocation Dialog */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              AI/Plagiarism Detected
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>This article has been flagged for the following issues:</p>
                
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-2">
                  {aiCheckResult?.isAIGenerated && (
                    <p className="text-red-400 font-medium">• AI-Generated Content Detected</p>
                  )}
                  {aiCheckResult?.isPlagiarized && (
                    <p className="text-red-400 font-medium">• Plagiarized Content Detected</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Confidence: {aiCheckResult?.confidence}%
                  </p>
                  {aiCheckResult?.reasons && aiCheckResult.reasons.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Reasons:</p>
                      <ul className="text-sm text-muted-foreground list-disc pl-4 mt-1">
                        {aiCheckResult.reasons.slice(0, 5).map((reason, i) => (
                          <li key={i}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-400">Taking action will:</p>
                  <ul className="text-sm text-muted-foreground list-disc pl-4 mt-1">
                    <li>Delete the article "{revokeTarget?.title}"</li>
                    <li>Remove writer access from the user</li>
                    <li>Send an email notification explaining the violation</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowRevokeDialog(false);
              setRevokeTarget(null);
              setAiCheckResult(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeWriter}
              className="bg-red-500 hover:bg-red-600"
            >
              Revoke Writer Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
