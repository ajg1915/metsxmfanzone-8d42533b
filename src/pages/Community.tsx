import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Image as ImageIcon, Send, Trash2, Heart, Lock, Megaphone, FileText, Pencil, X, Check, Pin, PinOff } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import SocialShareButtons from "@/components/SocialShareButtons";
import StoriesSection from "@/components/StoriesSection";
import BusinessAdsSection from "@/components/BusinessAdsSection";
import Events from "./Events";
import { CommunityAIChat } from "@/components/CommunityAIChat";
import { z } from "zod";

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  is_pinned: boolean | null;
  pinned_at: string | null;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
  isAdmin?: boolean;
}

interface BlogPost {
  id: string;
  user_id: string;
  title: string;
  excerpt: string | null;
  content: string;
  slug: string;
  featured_image_url: string | null;
  category: string;
  published_at: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
  isAdmin?: boolean;
}

type FeedItem = 
  | (Post & { type: 'post' })
  | (BlogPost & { type: 'blog' });

const postSchema = z.object({
  content: z.string().min(1, "Post content is required").max(5000, "Post must be less than 5000 characters").trim(),
});

const validateImage = (file: File) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (file.size > maxSize) {
    throw new Error('Image must be less than 5MB');
  }
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    throw new Error('Only JPG, PNG, and WebP images are allowed');
  }
};

const Community = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [newPost, setNewPost] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .then(({ data }) => {
          setIsCurrentUserAdmin((data || []).length > 0);
        });
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchFeed();
    }
  }, [user, loading, navigate]);

  const fetchFeed = async () => {
    // Fetch admin user IDs first
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    
    const adminUserIds = new Set((adminRoles || []).map(r => r.user_id));

    // Fetch community posts
    const { data: postsData, error: postsError } = await supabase
      .from("posts")
      .select(`
        *,
        profiles (
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (postsError) {
      console.error("Error fetching posts:", postsError);
    }

    // Fetch published blog posts
    const { data: blogData, error: blogError } = await supabase
      .from("blog_posts")
      .select(`
        id,
        user_id,
        title,
        excerpt,
        content,
        slug,
        featured_image_url,
        category,
        published_at,
        created_at,
        profiles (
          full_name,
          email
        )
      `)
      .eq("published", true)
      .order("published_at", { ascending: false });

    if (blogError) {
      console.error("Error fetching blog posts:", blogError);
    }

    // Generate signed URLs for community post images and add admin flag
    const postsWithSignedUrls = await Promise.all(
      (postsData || []).map(async (post) => {
        let imageUrl = post.image_url;
        if (post.image_url) {
          const fileName = post.image_url.split('/community_images/')[1] || post.image_url;
          if (fileName) {
            const { data: signedUrlData } = await supabase.storage
              .from('community_images')
              .createSignedUrl(fileName, 3600);
            imageUrl = signedUrlData?.signedUrl || post.image_url;
          }
        }
        return {
          ...post,
          image_url: imageUrl,
          type: 'post' as const,
          isAdmin: adminUserIds.has(post.user_id)
        };
      })
    );

    // Mark blog posts with type and admin flag
    const blogPostsWithType = (blogData || []).map(blog => ({
      ...blog,
      type: 'blog' as const,
      isAdmin: adminUserIds.has(blog.user_id)
    }));

    // Combine and sort: pinned posts first, then by date
    const combinedFeed: FeedItem[] = [
      ...postsWithSignedUrls,
      ...blogPostsWithType
    ].sort((a, b) => {
      // Pinned posts first
      const aPinned = a.type === 'post' && a.is_pinned ? 1 : 0;
      const bPinned = b.type === 'post' && b.is_pinned ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;
      
      const dateA = a.type === 'blog' ? (a.published_at || a.created_at) : a.created_at;
      const dateB = b.type === 'blog' ? (b.published_at || b.created_at) : b.created_at;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    setFeedItems(combinedFeed);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        validateImage(file);
        setSelectedImage(file);
      } catch (error: any) {
        toast({
          title: "Invalid Image",
          description: error.message,
          variant: "destructive",
        });
        e.target.value = ''; // Reset file input
      }
    }
  };

  const handleSubmitPost = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to post in the community",
        variant: "destructive",
      });
      navigate("/auth?mode=login");
      return;
    }

    // Validate content if provided
    if (newPost.trim()) {
      try {
        postSchema.parse({ content: newPost });
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast({
            title: "Validation Error",
            description: error.errors[0].message,
            variant: "destructive",
          });
          return;
        }
      }
    } else if (!selectedImage) {
      toast({
        title: "Validation Error",
        description: "Please add some content or an image",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      let imageUrl = null;

      if (selectedImage) {
        const fileExt = selectedImage.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("community_images")
          .upload(fileName, selectedImage);

        if (uploadError) throw uploadError;

        // Store the file path, not the URL (we'll generate signed URLs on fetch)
        imageUrl = fileName;
      }

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        content: newPost,
        image_url: imageUrl,
      });

      if (error) throw error;

      setNewPost("");
      setSelectedImage(null);
      fetchFeed();

      toast({
        title: "Success",
        description: "Post created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to delete posts",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post deleted successfully",
      });

      fetchFeed();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditPost = (post: Post & { type: 'post' }) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditContent("");
  };

  const handleSaveEdit = async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to edit posts",
        variant: "destructive",
      });
      return;
    }

    if (!editContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Post content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      postSchema.parse({ content: editContent });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const { error } = await supabase
        .from("posts")
        .update({ content: editContent, updated_at: new Date().toISOString() })
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post updated successfully",
      });

      setEditingPostId(null);
      setEditContent("");
      fetchFeed();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTogglePin = async (postId: string, currentlyPinned: boolean) => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ 
          is_pinned: !currentlyPinned, 
          pinned_at: !currentlyPinned ? new Date().toISOString() : null 
        })
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: currentlyPinned ? "Post unpinned" : "Post pinned to top",
      });
      fetchFeed();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Mets Fan Community - Connect with Fellow Fans | MetsXMFanZone</title>
        <meta name="description" content="Join the passionate New York Mets fan community. Share posts, photos, and connect with thousands of Mets fans. Discuss games, players, and team news." />
        <meta name="keywords" content="Mets fan community, Mets fans, New York Mets forum, Mets discussion, baseball community, Mets social" />
        <link rel="canonical" href="https://www.metsxmfanzone.com/community" />
      </Helmet>
      <Navigation />
      
      <div className="pt-12">
        <StoriesSection />
      </div>
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto w-full">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-6 sm:mb-8">
            Community Feed
          </h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>What's on your mind?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!user ? (
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">
                    Join the conversation! Log in or sign up to post in the community.
                  </p>
                  <Button onClick={() => navigate("/auth?mode=login")}>
                    Log In to Post
                  </Button>
                </div>
              ) : (
                <>
                  <Textarea
                    placeholder="Share your thoughts with the Mets community..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="min-h-[100px]"
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        <Button variant="outline" size="sm" asChild>
                          <span className="cursor-pointer">
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Add Photo
                          </span>
                        </Button>
                      </label>
                      {selectedImage && (
                        <span className="text-sm text-muted-foreground">
                          {selectedImage.name}
                        </span>
                      )}
                    </div>
                    
                    <Button
                      onClick={handleSubmitPost}
                      disabled={(!newPost.trim() && !selectedImage) || uploading}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {uploading ? "Posting..." : "Post"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="py-6">
              <SocialShareButtons title="MetsXMFanZone Community" />
            </CardContent>
          </Card>

          <Card className="mb-6 bg-primary/5 border-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" />
                Community Podcast
              </CardTitle>
              <CardDescription className="text-xs">
                Join our fan-driven podcast with discussions, stories, and Mets coverage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/community-podcast")} 
                className="w-full"
              >
                Listen Now
              </Button>
            </CardContent>
          </Card>

          {/* Featured Business Ads Section */}
          <BusinessAdsSection />

          {user && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Business Advertisement</CardTitle>
                <CardDescription className="text-xs">
                  Promote your business to the Mets fan community (requires admin approval)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate("/business-partner")} 
                  variant="outline"
                  className="w-full"
                >
                  <Megaphone className="w-4 h-4 mr-2" />
                  Submit Business Ad
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {feedItems.map((item) => (
              <Card key={`${item.type}-${item.id}`} className={item.type === 'post' && item.is_pinned ? 'border-primary border-2 relative' : ''}>
                {item.type === 'post' && item.is_pinned && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-primary">
                    <Pin className="w-4 h-4 fill-primary" />
                    <span className="text-xs font-semibold">Pinned</span>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {item.isAdmin ? "A" : (item.profiles?.full_name?.[0] || item.profiles?.email?.[0] || "U")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            {item.isAdmin ? "Admin" : (item.profiles?.full_name?.split(' ')[0] || item.profiles?.email || "Anonymous")}
                          </p>
                          {item.type === 'blog' && (
                            <Badge variant="secondary" className="text-xs">
                              <FileText className="w-3 h-3 mr-1" />
                              Blog
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.type === 'blog' ? (item.published_at || item.created_at) : item.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Admin pin/unpin button */}
                      {item.type === 'post' && isCurrentUserAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePin(item.id, !!item.is_pinned)}
                          className={item.is_pinned ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-primary"}
                          title={item.is_pinned ? "Unpin post" : "Pin post"}
                        >
                          {item.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                        </Button>
                      )}
                      {/* Owner edit/delete buttons */}
                      {item.type === 'post' && item.user_id === user?.id && (
                        <>
                          {editingPostId !== item.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPost(item as Post & { type: 'post' })}
                              className="text-muted-foreground hover:text-primary"
                              title="Edit post"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePost(item.id)}
                            className="text-muted-foreground hover:text-destructive"
                            title="Delete post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {item.type === 'blog' ? (
                    <div className="space-y-3">
                      <Link to={`/blog/${item.slug}`} className="block group">
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                      </Link>
                      {item.featured_image_url && (
                        <Link to={`/blog/${item.slug}`}>
                          <img
                            src={item.featured_image_url}
                            alt={item.title}
                            className="rounded-lg w-full h-48 object-cover"
                          />
                        </Link>
                      )}
                      <p className="text-muted-foreground line-clamp-3">
                        {item.excerpt || item.content.substring(0, 200)}...
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/blog/${item.slug}`}>Read Full Article</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      {/* Thumbnail - same size as Latest News cards */}
                      {item.image_url && (
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                          <img
                            src={item.image_url}
                            alt="Post"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        {editingPostId === item.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="min-h-[60px] text-sm"
                            />
                            <div className="flex items-center gap-2">
                              <Button size="sm" onClick={() => handleSaveEdit(item.id)}>
                                <Check className="w-3 h-3 mr-1" />
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                <X className="w-3 h-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {item.content && (
                              <p className="text-sm text-foreground leading-snug whitespace-pre-wrap">{item.content}</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4 mr-2" />
                      Like
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {feedItems.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No posts yet. Be the first to share something!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Events Section */}
          <div className="mt-16">
            <Events />
          </div>
        </div>
      </main>

      <Footer />
      <CommunityAIChat />
    </div>
  );
};

export default Community;
