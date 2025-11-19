import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CommunityGuidelines from "@/components/CommunityGuidelines";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Image as ImageIcon, Send, Trash2, Heart, Lock, Megaphone } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import SocialShareButtons from "@/components/SocialShareButtons";
import StoriesSection from "@/components/StoriesSection";
import { z } from "zod";

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
}

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchPosts();
    }
  }, [user, loading, navigate]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles (
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      // Generate signed URLs for images
      const postsWithSignedUrls = await Promise.all(
        (data || []).map(async (post) => {
          if (post.image_url) {
            const fileName = post.image_url.split('/community_images/')[1];
            if (fileName) {
              const { data: signedUrlData } = await supabase.storage
                .from('community_images')
                .createSignedUrl(fileName, 3600); // 1 hour expiry
              
              return {
                ...post,
                image_url: signedUrlData?.signedUrl || post.image_url
              };
            }
          }
          return post;
        })
      );
      setPosts(postsWithSignedUrls as any || []);
    }
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
      fetchPosts();

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

      fetchPosts();
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
      
      <div className="pt-20 sm:pt-24">
        <StoriesSection />
      </div>
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto w-full">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-6 sm:mb-8">
            Community Feed
          </h1>

          <CommunityGuidelines />

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
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {post.profiles?.full_name?.[0] || post.profiles?.email?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {post.profiles?.full_name || post.profiles?.email || "Anonymous"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    {post.user_id === user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Post"
                      className="rounded-lg max-w-full h-auto"
                    />
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

            {posts.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No posts yet. Be the first to share something!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Community;
