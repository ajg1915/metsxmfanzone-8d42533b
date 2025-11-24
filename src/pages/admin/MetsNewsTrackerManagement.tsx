import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, Save, X, FileText, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";

interface NewsItem {
  id: string;
  type: "signing" | "rumor" | "traded";
  title: string;
  player: string;
  details: string;
  time_ago: string;
  image_url: string;
  published: boolean;
  created_at: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url?: string;
  category: string;
  tags: string[];
  published: boolean;
  published_at?: string;
  created_at: string;
}

export default function MetsNewsTrackerManagement() {
  const { user } = useAuth();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    type: "signing" as "signing" | "rumor" | "traded",
    title: "",
    player: "",
    details: "",
    time_ago: "1 hour ago",
    image_url: "",
    published: false,
  });

  const [blogFormData, setBlogFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    featured_image_url: "",
    category: "General",
    tags: "",
    published: false,
  });

  useEffect(() => {
    fetchNewsItems();
    fetchBlogPosts();
  }, []);

  const fetchNewsItems = async () => {
    try {
      const { data, error } = await supabase
        .from("mets_news_tracker")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNewsItems((data || []) as NewsItem[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from("mets_news_tracker")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;
        toast({ title: "News item updated successfully" });
      } else {
        const { error } = await supabase
          .from("mets_news_tracker")
          .insert([formData]);

        if (error) throw error;
        toast({ title: "News item created successfully" });
      }

      resetForm();
      fetchNewsItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: NewsItem) => {
    setFormData({
      type: item.type,
      title: item.title,
      player: item.player,
      details: item.details,
      time_ago: item.time_ago,
      image_url: item.image_url,
      published: item.published,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news item?")) return;

    try {
      const { error } = await supabase
        .from("mets_news_tracker")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "News item deleted successfully" });
      fetchNewsItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBlogPosts((data || []) as BlogPost[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      const slug = blogFormData.slug || generateSlug(blogFormData.title);
      const tagsArray = blogFormData.tags.split(",").map(t => t.trim()).filter(t => t);
      
      const postData = {
        ...blogFormData,
        slug,
        tags: tagsArray,
        user_id: user.id,
        published_at: blogFormData.published ? new Date().toISOString() : null,
      };

      if (editingBlogId) {
        const { error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", editingBlogId);

        if (error) throw error;
        toast({ title: "Blog post updated successfully" });
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .insert([postData]);

        if (error) throw error;
        toast({ title: "Blog post created successfully" });
      }

      resetBlogForm();
      fetchBlogPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditBlog = (post: BlogPost) => {
    setBlogFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      featured_image_url: post.featured_image_url || "",
      category: post.category,
      tags: post.tags.join(", "),
      published: post.published,
    });
    setEditingBlogId(post.id);
    setShowBlogForm(true);
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Blog post deleted successfully" });
      fetchBlogPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGenerateImage = async () => {
    if (!blogFormData.title) {
      toast({
        title: "Error",
        description: "Please enter a blog title first",
        variant: "destructive",
      });
      return;
    }

    setGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-image', {
        body: { prompt: blogFormData.title }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setBlogFormData({ ...blogFormData, featured_image_url: data.imageUrl });
        toast({
          title: "Success",
          description: "AI image generated successfully!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!blogFormData.title) {
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
          title: blogFormData.title,
          category: blogFormData.category,
          excerpt: blogFormData.excerpt
        }
      });

      if (error) throw error;

      if (data?.content) {
        setBlogFormData({ ...blogFormData, content: data.content });
        toast({
          title: "Success",
          description: "Article content generated successfully!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setGeneratingContent(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "signing",
      title: "",
      player: "",
      details: "",
      time_ago: "1 hour ago",
      image_url: "",
      published: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const resetBlogForm = () => {
    setBlogFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      featured_image_url: "",
      category: "General",
      tags: "",
      published: false,
    });
    setEditingBlogId(null);
    setShowBlogForm(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
      <h1 className="text-3xl font-bold">Content Management</h1>
      
      <Tabs defaultValue="news" className="space-y-6">
        <TabsList>
          <TabsTrigger value="news">News Tracker</TabsTrigger>
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Mets News Tracker</h2>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {showForm ? "Cancel" : "Add News Item"}
            </Button>
          </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit News Item" : "Create News Item"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "signing" | "rumor" | "traded") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="signing">New Signing</SelectItem>
                    <SelectItem value="rumor">Trade Rumor</SelectItem>
                    <SelectItem value="traded">Traded Player</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="player">Player Name</Label>
                <Input
                  id="player"
                  value={formData.player}
                  onChange={(e) => setFormData({ ...formData, player: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Details</Label>
                <Textarea
                  id="details"
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time_ago">Time Ago</Label>
                <Input
                  id="time_ago"
                  value={formData.time_ago}
                  onChange={(e) => setFormData({ ...formData, time_ago: e.target.value })}
                  placeholder="e.g., 2 hours ago"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, published: checked })
                  }
                />
                <Label htmlFor="published">Published</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? "Update" : "Create"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {newsItems.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-center gap-4 p-6">
              <img
                src={item.image_url}
                alt={item.player}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      item.type === "signing"
                        ? "bg-green-500 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {item.type === "signing" ? "NEW SIGNING" : "TRADE RUMOR"}
                  </span>
                  {!item.published && (
                    <span className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
                      Unpublished
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="text-primary font-semibold">{item.player}</p>
                <p className="text-sm text-muted-foreground">{item.details}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.time_ago}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
        </TabsContent>

        <TabsContent value="blog" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Blog Posts</h2>
            <Button onClick={() => setShowBlogForm(!showBlogForm)}>
              {showBlogForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {showBlogForm ? "Cancel" : "Add Blog Post"}
            </Button>
          </div>

          {showBlogForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingBlogId ? "Edit Blog Post" : "Create Blog Post"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBlogSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="blog-title">Title</Label>
                    <Input
                      id="blog-title"
                      value={blogFormData.title}
                      onChange={(e) => setBlogFormData({ ...blogFormData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input
                      id="slug"
                      value={blogFormData.slug}
                      onChange={(e) => setBlogFormData({ ...blogFormData, slug: e.target.value })}
                      placeholder="Leave empty to auto-generate"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={blogFormData.category}
                      onChange={(e) => setBlogFormData({ ...blogFormData, category: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={blogFormData.tags}
                      onChange={(e) => setBlogFormData({ ...blogFormData, tags: e.target.value })}
                      placeholder="sports, baseball, news"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={blogFormData.excerpt}
                      onChange={(e) => setBlogFormData({ ...blogFormData, excerpt: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="featured_image">Featured Image URL</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateImage}
                        disabled={generatingImage || !blogFormData.title}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {generatingImage ? "Generating..." : "Generate with AI"}
                      </Button>
                    </div>
                    <Input
                      id="featured_image"
                      value={blogFormData.featured_image_url}
                      onChange={(e) => setBlogFormData({ ...blogFormData, featured_image_url: e.target.value })}
                      placeholder="https://... or generate with AI"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="content">Content</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateContent}
                        disabled={generatingContent || !blogFormData.title}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {generatingContent ? "Generating..." : "Generate with AI"}
                      </Button>
                    </div>
                    <Textarea
                      id="content"
                      value={blogFormData.content}
                      onChange={(e) => setBlogFormData({ ...blogFormData, content: e.target.value })}
                      rows={10}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="blog-published"
                      checked={blogFormData.published}
                      onCheckedChange={(checked) =>
                        setBlogFormData({ ...blogFormData, published: checked })
                      }
                    />
                    <Label htmlFor="blog-published">Published</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      {editingBlogId ? "Update" : "Create"}
                    </Button>
                    {editingBlogId && (
                      <Button type="button" variant="outline" onClick={resetBlogForm}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {blogPosts.map((post) => (
              <Card key={post.id}>
                <CardContent className="flex items-start gap-4 p-6">
                  {post.featured_image_url && (
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-24 h-24 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4" />
                      <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary">
                        {post.category}
                      </span>
                      {post.published ? (
                        <span className="px-2 py-1 text-xs rounded bg-green-500 text-white">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
                          Unpublished
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt || post.content.substring(0, 150)}...
                    </p>
                    {post.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {post.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-muted px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditBlog(post)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteBlog(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
