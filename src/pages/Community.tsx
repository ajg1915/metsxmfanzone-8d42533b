import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { 
  Image as ImageIcon, 
  Send, 
  Trash2, 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Video,
  Smile,
  X,
  Globe,
  Loader2,
  Users,
  Calendar,
  Radio,
  ShoppingBag,
  Newspaper
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StoriesSection from "@/components/StoriesSection";
import { CommunityAIChat } from "@/components/CommunityAIChat";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
  likes?: number;
  comments?: number;
  isLiked?: boolean;
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchPosts();
      fetchUserProfile();
    }
  }, [user, loading, navigate]);

  const fetchUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    setUserProfile(data);
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles (
          full_name,
          email,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      const postsWithSignedUrls = await Promise.all(
        (data || []).map(async (post) => {
          if (post.image_url) {
            const fileName = post.image_url.split('/community_images/')[1] || post.image_url;
            if (fileName) {
              const { data: signedUrlData } = await supabase.storage
                .from('community_images')
                .createSignedUrl(fileName, 3600);
              
              return {
                ...post,
                image_url: signedUrlData?.signedUrl || post.image_url,
                likes: Math.floor(Math.random() * 50) + 1,
                comments: Math.floor(Math.random() * 20),
                isLiked: false,
              };
            }
          }
          return {
            ...post,
            likes: Math.floor(Math.random() * 50) + 1,
            comments: Math.floor(Math.random() * 20),
            isLiked: false,
          };
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
        setImagePreview(URL.createObjectURL(file));
      } catch (error: any) {
        toast({
          title: "Invalid Image",
          description: error.message,
          variant: "destructive",
        });
        e.target.value = '';
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmitPost = async () => {
    if (!user) {
      navigate("/auth?mode=login");
      return;
    }

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
      setImagePreview(null);
      fetchPosts();

      toast({
        title: "Posted!",
        description: "Your post has been shared with the community",
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
    if (!user) return;
    
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Post removed successfully",
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

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? (post.likes || 1) - 1 : (post.likes || 0) + 1,
        };
      }
      return post;
    }));
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleShare = async (post: Post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "MetsXMFanZone Post",
          text: post.content.substring(0, 100),
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Post link copied to clipboard",
      });
    }
  };

  const getUserInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sidebarLinks = [
    { icon: Newspaper, label: "Mets News", href: "/blog" },
    { icon: Calendar, label: "Events", href: "/events" },
    { icon: Radio, label: "Podcast", href: "/podcast" },
    { icon: Video, label: "Live Streams", href: "/live" },
    { icon: ShoppingBag, label: "Merch", href: "/merch" },
  ];

  const onlineFans = [
    { name: "John D.", initials: "JD" },
    { name: "Mike K.", initials: "MK" },
    { name: "Sarah P.", initials: "SP" },
    { name: "Luis G.", initials: "LG" },
    { name: "Tony R.", initials: "TR" },
  ];

  const chatRooms = [
    { name: "Game Day Chat", emoji: "⚾", online: 42 },
    { name: "Trade Rumors", emoji: "📰", online: 18 },
    { name: "Prospect Watch", emoji: "🌟", online: 12 },
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-900">
      <Helmet>
        <title>Community | MetsXMFanZone - Connect with Mets Fans</title>
        <meta name="description" content="Join the passionate New York Mets fan community. Share posts, photos, and connect with thousands of Mets fans." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/community" />
      </Helmet>
      
      <Navigation />

      <main className="pt-16 sm:pt-20 pb-8 min-h-screen">
        <div className="max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6">
          {/* Stories Section */}
          <div className="py-3 sm:py-4">
            <StoriesSection />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Left Sidebar - Hidden on mobile/tablet */}
            <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
              <Card className="sticky top-24 bg-white dark:bg-gray-800 border-0 shadow-sm rounded-xl">
                <CardContent className="p-3">
                  {user && userProfile && (
                    <div 
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => navigate("/dashboard")}
                    >
                      <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                        <AvatarImage src={userProfile?.avatar_url} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {getUserInitials(userProfile?.full_name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {userProfile?.full_name || 'Your Profile'}
                      </span>
                    </div>
                  )}
                  
                  <Separator className="my-2" />
                  
                  <nav className="space-y-0.5">
                    {sidebarLinks.map((item) => (
                      <div 
                        key={item.label} 
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => navigate(item.href)}
                      >
                        <item.icon className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                      </div>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </aside>

            {/* Main Feed */}
            <div className="col-span-1 lg:col-span-6 xl:col-span-7 space-y-3 sm:space-y-4">
              {/* Create Post Card */}
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-xl overflow-hidden">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex gap-2 sm:gap-3">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 ring-2 ring-primary/10">
                      <AvatarImage src={userProfile?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getUserInitials(userProfile?.full_name, user?.email || null)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Textarea
                        placeholder="What's on your mind about the Mets?"
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="min-h-[50px] sm:min-h-[70px] resize-none border-0 bg-gray-100 dark:bg-gray-700 rounded-2xl text-sm sm:text-base focus-visible:ring-1 focus-visible:ring-primary placeholder:text-gray-500 p-3"
                      />
                      
                      {imagePreview && (
                        <div className="relative mt-3 rounded-xl overflow-hidden">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full max-h-[250px] sm:max-h-[300px] object-cover rounded-xl"
                          />
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 hover:bg-black/80"
                            onClick={removeImage}
                          >
                            <X className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                          <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Photo</span>
                        </div>
                      </label>
                      <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                        <Video className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                        <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hidden sm:inline">Video</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                        <Smile className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                        <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hidden sm:inline">Feeling</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleSubmitPost}
                      disabled={(!newPost.trim() && !selectedImage) || uploading}
                      className="bg-primary hover:bg-primary/90 text-white rounded-lg px-4 sm:px-6 py-2 text-sm font-semibold shadow-sm"
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-1.5 sm:mr-2" />
                          Post
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Posts Feed */}
              {posts.length === 0 ? (
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-xl">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <div className="text-5xl sm:text-6xl mb-4">🏟️</div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">No posts yet</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Be the first to share something with the community!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {posts.map((post) => (
                    <Card key={post.id} className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-xl overflow-hidden">
                      <CardContent className="p-0">
                        {/* Post Header */}
                        <div className="p-3 sm:p-4 flex items-start justify-between">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Avatar className="h-9 w-9 sm:h-10 sm:w-10 ring-2 ring-primary/10">
                              <AvatarImage src={post.profiles?.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                                {getUserInitials(post.profiles?.full_name || null, post.profiles?.email || null)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                                {post.profiles?.full_name || "Mets Fan"}
                              </h4>
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <span className="truncate">
                                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                </span>
                                <span>·</span>
                                <Globe className="h-3 w-3 shrink-0" />
                              </div>
                            </div>
                          </div>
                          
                          {post.user_id === user?.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 shrink-0"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              <Trash2 className="h-4 w-4 text-gray-500" />
                            </Button>
                          )}
                        </div>

                        {/* Post Content */}
                        {post.content && (
                          <div className="px-3 sm:px-4 pb-3">
                            <p className="text-sm sm:text-base text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed break-words">
                              {post.content}
                            </p>
                          </div>
                        )}

                        {/* Post Image */}
                        {post.image_url && (
                          <div className="w-full bg-gray-100 dark:bg-gray-900">
                            <img 
                              src={post.image_url} 
                              alt="Post" 
                              className="w-full max-h-[400px] sm:max-h-[500px] object-contain"
                            />
                          </div>
                        )}

                        {/* Engagement Stats */}
                        <div className="px-3 sm:px-4 py-2 flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <div className="flex -space-x-1">
                              <span className="inline-flex items-center justify-center h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-blue-500 text-white text-[8px] sm:text-[10px]">👍</span>
                              <span className="inline-flex items-center justify-center h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-red-500 text-white text-[8px] sm:text-[10px]">❤️</span>
                            </div>
                            <span className="ml-1">{post.likes || 0}</span>
                          </div>
                          <button 
                            className="hover:underline"
                            onClick={() => toggleComments(post.id)}
                          >
                            {post.comments || 0} comments
                          </button>
                        </div>

                        <Separator />

                        {/* Action Buttons */}
                        <div className="px-1 sm:px-2 py-1 flex items-center">
                          <Button
                            variant="ghost"
                            className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 rounded-lg transition-colors ${
                              post.isLiked 
                                ? 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950' 
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => handleLike(post.id)}
                          >
                            <ThumbsUp className={`h-4 w-4 sm:h-5 sm:w-5 ${post.isLiked ? 'fill-current' : ''}`} />
                            <span className="text-xs sm:text-sm font-medium">Like</span>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => toggleComments(post.id)}
                          >
                            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-xs sm:text-sm font-medium">Comment</span>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleShare(post)}
                          >
                            <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-xs sm:text-sm font-medium">Share</span>
                          </Button>
                        </div>

                        {/* Comments Section */}
                        {expandedComments.includes(post.id) && (
                          <div className="px-3 sm:px-4 pb-3 pt-2 bg-gray-50 dark:bg-gray-900/50">
                            <div className="flex items-start gap-2">
                              <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                                <AvatarImage src={userProfile?.avatar_url} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                  {getUserInitials(userProfile?.full_name, user?.email || null)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 relative min-w-0">
                                <input
                                  type="text"
                                  placeholder="Write a comment..."
                                  value={commentText[post.id] || ''}
                                  onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                                  className="w-full px-3 sm:px-4 py-2 pr-9 sm:pr-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="absolute right-0.5 sm:right-1 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-7 sm:w-7 rounded-full"
                                >
                                  <Send className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Right Sidebar - Hidden on mobile/tablet */}
            <aside className="hidden lg:block lg:col-span-3 xl:col-span-3">
              <div className="sticky top-24 space-y-4">
                {/* Online Fans */}
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Fans Online
                      </h3>
                      <span className="text-xs text-primary cursor-pointer hover:underline">See all</span>
                    </div>
                    <div className="space-y-2">
                      {onlineFans.map((fan, i) => (
                        <div key={i} className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-orange-500 text-white text-xs">
                                {fan.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800" />
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{fan.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Chat Rooms */}
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-xl">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      Chat Rooms
                    </h3>
                    <div className="space-y-1">
                      {chatRooms.map((room) => (
                        <div key={room.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{room.emoji}</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{room.name}</span>
                          </div>
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">{room.online} online</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-xl">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Links</h3>
                    <div className="space-y-2 text-sm">
                      <button 
                        onClick={() => navigate("/business-partner")}
                        className="w-full text-left p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                      >
                        📢 Promote Your Business
                      </button>
                      <button 
                        onClick={() => navigate("/community-podcast")}
                        className="w-full text-left p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                      >
                        🎙️ Community Podcast
                      </button>
                      <button 
                        onClick={() => navigate("/events")}
                        className="w-full text-left p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                      >
                        📅 Upcoming Events
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
      <CommunityAIChat />
    </div>
  );
};

export default Community;
