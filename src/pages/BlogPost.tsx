import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Tag, ArrowLeft, Headphones, Volume2, Loader2, Pause, Play } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SocialShareButtons from "@/components/SocialShareButtons";
import { useToast } from "@/hooks/use-toast";

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
  published_at: string;
}

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  
  // TTS states
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (generatedAudioUrl) {
        URL.revokeObjectURL(generatedAudioUrl);
      }
    };
  }, [generatedAudioUrl]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (error) throw error;
      
      if (data && data.featured_image_url) {
        if (!data.featured_image_url.startsWith('http') && !data.featured_image_url.startsWith('data:')) {
          data.featured_image_url = `${window.location.origin}${data.featured_image_url}`;
        }
        if (data.featured_image_url.includes('supabase.co') && !data.featured_image_url.startsWith('http')) {
          data.featured_image_url = `https://${data.featured_image_url}`;
        }
      }
      
      setPost(data);
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!post) return;

    setIsGeneratingAudio(true);

    try {
      // Combine title and content for TTS, limit to reasonable length
      const textToSpeak = `${post.title}. ${post.content}`.slice(0, 5000);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: textToSpeak }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const parsed = JSON.parse(errorText);
          throw new Error(parsed.error || "Failed to generate audio");
        } catch {
          throw new Error(errorText || "Failed to generate audio");
        }
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Clean up previous URL if exists
      if (generatedAudioUrl) {
        URL.revokeObjectURL(generatedAudioUrl);
      }
      
      setGeneratedAudioUrl(audioUrl);
      
      // Auto-play the generated audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
      }

      toast({
        title: "Audio Ready",
        description: "Article audio has been generated",
      });
    } catch (error: any) {
      console.error("Error generating audio:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate audio",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Post not found</p>
              <Button onClick={() => navigate("/blog")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const currentUrl = window.location.href;
  const siteUrl = window.location.origin;
  
  let socialImage = post.featured_image_url || `${siteUrl}/logo-512.png`;
  
  if (socialImage.startsWith('data:')) {
    console.warn('Blog post has base64 image which won\'t work for social sharing:', post.slug);
    socialImage = `${siteUrl}/logo-512.png`;
  }
  
  if (!socialImage.startsWith('http')) {
    socialImage = `${siteUrl}${socialImage}`;
  }
  
  const socialTitle = `${post.title} | MetsXMFanZone`;
  const socialDescription = post.excerpt && post.excerpt.length > 0
    ? (post.excerpt.length > 160 ? post.excerpt.substring(0, 157) + '...' : post.excerpt)
    : post.title;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
      <Helmet>
        <title>{socialTitle}</title>
        <meta name="description" content={socialDescription} />
        
        <meta property="fb:app_id" content="1151558476948104" />
        
        <meta property="og:type" content="article" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:site_name" content="MetsXMFanZone" />
        <meta property="og:title" content={socialTitle} />
        <meta property="og:description" content={socialDescription} />
        <meta property="og:image" content={socialImage} />
        <meta property="og:image:secure_url" content={socialImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={post.title} />
        <meta property="og:locale" content="en_US" />
        
        <meta property="article:published_time" content={post.published_at} />
        <meta property="article:modified_time" content={post.published_at} />
        <meta property="article:section" content={post.category} />
        <meta property="article:author" content="MetsXMFanZone" />
        {post.tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@metsxmfanzone" />
        <meta name="twitter:creator" content="@metsxmfanzone" />
        <meta name="twitter:url" content={currentUrl} />
        <meta name="twitter:title" content={socialTitle} />
        <meta name="twitter:description" content={socialDescription} />
        <meta name="twitter:image" content={socialImage} />
        <meta name="twitter:image:alt" content={post.title} />
        
        <meta property="ia:markup_url" content={currentUrl} />
        <meta property="ia:markup_url_dev" content={currentUrl} />
        <meta property="ia:rules_url" content={`${siteUrl}/rules.json`} />
        <meta property="ia:rules_url_dev" content={`${siteUrl}/rules.json`} />
        
        <meta name="author" content="MetsXMFanZone" />
        <link rel="canonical" href={currentUrl} />
      </Helmet>
      
      <Navigation />
      
      {/* Hidden audio element for TTS playback */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pt-12">
        <div className="max-w-4xl mx-auto w-full">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate("/blog")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>

          <article>
            {post.featured_image_url && (
              <div className="aspect-video overflow-hidden rounded-lg mb-6">
                <img 
                  src={post.featured_image_url} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <header className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
              
              <div className="flex flex-wrap items-center gap-3 text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.published_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  {post.category}
                </span>
                
                {/* Listen Button - Only show if no pre-uploaded audio */}
                {!post.audio_url && (
                  <>
                    {generatedAudioUrl ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={togglePlayPause}
                        className="gap-2"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-4 h-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Play
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateAudio}
                        disabled={isGeneratingAudio}
                        className="gap-2"
                      >
                        {isGeneratingAudio ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4" />
                            Listen
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>

              {post.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {post.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="text-sm bg-muted px-3 py-1 rounded-full flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* Pre-uploaded audio player */}
            {post.audio_url && (
              <Card className="mb-6">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Headphones className="w-5 h-5 text-primary" />
                    <span className="font-medium">Listen to this article</span>
                  </div>
                  <audio controls className="w-full">
                    <source src={post.audio_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </CardContent>
              </Card>
            )}

            {/* TTS Audio Player (when generated) */}
            {generatedAudioUrl && !post.audio_url && (
              <Card className="mb-6 border-primary/20">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Volume2 className="w-5 h-5 text-primary" />
                    <span className="font-medium">AI-Generated Audio</span>
                  </div>
                  <audio controls className="w-full" src={generatedAudioUrl}>
                    Your browser does not support the audio element.
                  </audio>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="prose prose-lg max-w-none dark:prose-invert py-8">
                <div className="whitespace-pre-wrap">{post.content}</div>
              </CardContent>
            </Card>

            <div className="mt-8">
              <Card>
                <CardContent className="py-6">
                  <SocialShareButtons title={post.title} url={window.location.href} />
                </CardContent>
              </Card>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
