import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Tag, ArrowLeft, Headphones, Volume2, Loader2, Pause, Play, Square, Settings } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SocialShareButtons from "@/components/SocialShareButtons";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface VoiceOption {
  voice: SpeechSynthesisVoice;
  label: string;
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // ElevenLabs AI Voice states
  const [isGeneratingAIVoice, setIsGeneratingAIVoice] = useState(false);
  const [aiAudioUrl, setAiAudioUrl] = useState<string | null>(null);
  const [isPlayingAI, setIsPlayingAI] = useState(false);
  const aiAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Free browser TTS states
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speechRate, setSpeechRate] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available browser voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      // Filter for English voices and prioritize high-quality ones
      const englishVoices = voices
        .filter(v => v.lang.startsWith('en'))
        .map(voice => ({
          voice,
          label: `${voice.name} (${voice.lang})${voice.localService ? '' : ' ☁️'}`
        }))
        .sort((a, b) => {
          // Prioritize non-local (cloud/premium) voices
          if (!a.voice.localService && b.voice.localService) return -1;
          if (a.voice.localService && !b.voice.localService) return 1;
          // Then sort by name
          return a.voice.name.localeCompare(b.voice.name);
        });
      
      setAvailableVoices(englishVoices);
      
      // Auto-select best voice (prefer Google or Microsoft voices)
      const preferredVoice = englishVoices.find(v => 
        v.voice.name.includes('Google') || 
        v.voice.name.includes('Microsoft') ||
        v.voice.name.includes('Samantha') ||
        v.voice.name.includes('Daniel')
      ) || englishVoices[0];
      
      if (preferredVoice && !selectedVoice) {
        setSelectedVoice(preferredVoice.voice);
      }
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  // Cleanup audio URLs and speech on unmount
  useEffect(() => {
    return () => {
      if (generatedAudioUrl) {
        URL.revokeObjectURL(generatedAudioUrl);
      }
      if (aiAudioUrl) {
        URL.revokeObjectURL(aiAudioUrl);
      }
      speechSynthesis.cancel();
    };
  }, [generatedAudioUrl, aiAudioUrl]);

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

  // Free browser TTS - no API key needed
  const handleBrowserTTS = () => {
    if (!post) return;

    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      toast({
        title: "Not Supported",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Cancel any pending speech first
    speechSynthesis.cancel();

    // Strip HTML tags and create clean text
    const textToSpeak = `${post.title}. ${post.content}`
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Limit text length for better performance (some browsers fail on very long text)
    const maxLength = 2000;
    const truncatedText = textToSpeak.length > maxLength
      ? textToSpeak.slice(0, maxLength) + "..."
      : textToSpeak;

    const utterance = new SpeechSynthesisUtterance(truncatedText);

    const voices = speechSynthesis.getVoices();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else if (voices.length > 0) {
      // Use first available voice if none selected
      const englishVoice = voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) utterance.voice = englishVoice;
    } else {
      toast({
        title: "Voices Loading",
        description: "Voices are still loading — try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    utterance.rate = speechRate;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    utterance.onerror = (e) => {
      console.error('Speech error:', e.error, e);
      setIsSpeaking(false);

      if (e.error === 'canceled') return;

      toast({
        title: "Speech Error",
        description: `TTS error: ${e.error || 'unknown'}. Try another voice or refresh.`,
        variant: "destructive",
      });
    };

    utteranceRef.current = utterance;

    try {
      try {
        // Some browsers pause speech synthesis; resume helps reliability.
        speechSynthesis.resume();
      } catch {
        // ignore
      }

      // IMPORTANT: call speak synchronously (no setTimeout) to preserve user-gesture requirements.
      speechSynthesis.speak(utterance);

      toast({
        title: "Playing Article",
        description: `Using ${utterance.voice?.name || 'default'} voice`,
      });
    } catch (err) {
      console.error('Failed to start speech:', err);
      setIsSpeaking(false);
      toast({
        title: "Audio Error",
        description: "Could not start text-to-speech. Try refreshing the page.",
        variant: "destructive",
      });
    }
  };

  const stopBrowserTTS = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // OpenAI TTS (realistic, natural sounding)
  const handleAIVoice = async () => {
    if (!post) return;

    // If already have audio, just play/pause
    if (aiAudioUrl && aiAudioRef.current) {
      if (isPlayingAI) {
        aiAudioRef.current.pause();
        setIsPlayingAI(false);
      } else {
        void aiAudioRef.current.play().then(() => setIsPlayingAI(true)).catch(console.error);
      }
      return;
    }

    setIsGeneratingAIVoice(true);

    try {
      // Strip HTML and prepare text
      const textToSpeak = `${post.title}. ${post.content}`
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 4000);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            text: textToSpeak,
            voice: "nova" // Natural female voice
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to generate audio";
        try {
          const parsed = JSON.parse(errorText);
          errorMessage = parsed.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (aiAudioUrl) {
        URL.revokeObjectURL(aiAudioUrl);
      }
      
      setAiAudioUrl(audioUrl);
      
      if (aiAudioRef.current) {
        aiAudioRef.current.src = audioUrl;
        void aiAudioRef.current
          .play()
          .then(() => setIsPlayingAI(true))
          .catch((err) => {
            console.error("AI Audio play() blocked:", err);
            setIsPlayingAI(false);
            toast({
              title: "Playback Blocked",
              description: "Tap Play to start audio.",
              variant: "destructive",
            });
          });
      }

      toast({
        title: "AI Voice Ready",
        description: "Playing with OpenAI voice",
      });
    } catch (error: unknown) {
      console.error("Error generating AI audio:", error);
      toast({
        title: "AI Voice Error",
        description: error instanceof Error ? error.message : "Failed to generate AI voice",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAIVoice(false);
    }
  };

  const stopAIAudio = () => {
    if (aiAudioRef.current) {
      aiAudioRef.current.pause();
      aiAudioRef.current.currentTime = 0;
    }
    setIsPlayingAI(false);
  };

  // OpenAI TTS (premium, requires API key)
  const handleGenerateAudio = async () => {
    if (!post) return;

    setIsGeneratingAudio(true);

    try {
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
      
      if (generatedAudioUrl) {
        URL.revokeObjectURL(generatedAudioUrl);
      }
      
      setGeneratedAudioUrl(audioUrl);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        void audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.error("Audio play() blocked:", err);
            setIsPlaying(false);
            toast({
              title: "Playback Blocked",
              description: "Tap Play to start audio (your browser blocked auto-play).",
              variant: "destructive",
            });
          });
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
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    void audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.error("Audio play() failed:", err);
        setIsPlaying(false);
        toast({
          title: "Playback Error",
          description: "Could not play audio. Try again or refresh the page.",
          variant: "destructive",
        });
      });
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
      
      {/* Hidden audio element for AI voice playback */}
      <audio
        ref={aiAudioRef}
        onEnded={() => setIsPlayingAI(false)}
        onPause={() => setIsPlayingAI(false)}
        onPlay={() => setIsPlayingAI(true)}
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
                
                {/* AI Voice Button - Realistic ElevenLabs */}
                {!post.audio_url && (
                  <div className="flex items-center gap-2">
                    {isPlayingAI ? (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={stopAIAudio}
                        className="gap-2"
                      >
                        <Square className="w-4 h-4" />
                        Stop AI Voice
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleAIVoice}
                        disabled={isGeneratingAIVoice}
                        className="gap-2"
                      >
                        {isGeneratingAIVoice ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : aiAudioUrl ? (
                          <>
                            <Play className="w-4 h-4" />
                            Play AI Voice
                          </>
                        ) : (
                          <>
                            <Headphones className="w-4 h-4" />
                            AI Voice
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
                
                {/* Free Browser TTS Controls */}
                {!post.audio_url && availableVoices.length > 0 && (
                  <div className="flex items-center gap-2">
                    {isSpeaking ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={stopBrowserTTS}
                        className="gap-2"
                      >
                        <Square className="w-4 h-4" />
                        Stop
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBrowserTTS}
                        className="gap-2"
                      >
                        <Volume2 className="w-4 h-4" />
                        Free Voice
                      </Button>
                    )}
                    
                    {/* Voice Settings Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-1 px-2">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto">
                        <DropdownMenuLabel>Free Voice Settings</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                          Select Voice ({availableVoices.length} available)
                        </DropdownMenuLabel>
                        {availableVoices.slice(0, 15).map(({ voice, label }) => (
                          <DropdownMenuItem
                            key={voice.name}
                            onClick={() => setSelectedVoice(voice)}
                            className={selectedVoice?.name === voice.name ? "bg-primary/10" : ""}
                          >
                            {selectedVoice?.name === voice.name && "✓ "}
                            {label}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                          Speed: {speechRate}x
                        </DropdownMenuLabel>
                        <div className="px-2 py-1 flex gap-1">
                          {[0.75, 1, 1.25, 1.5].map(rate => (
                            <Button
                              key={rate}
                              variant={speechRate === rate ? "default" : "outline"}
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={() => setSpeechRate(rate)}
                            >
                              {rate}x
                            </Button>
                          ))}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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

            {/* AI Voice playing indicator */}
            {isPlayingAI && (
              <Card className="mb-6 border-primary/20 bg-primary/5">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                      <span className="font-medium">AI Voice Playing</span>
                      <span className="text-sm text-muted-foreground">
                        ElevenLabs Realistic Voice
                      </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={stopAIAudio}>
                      <Square className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Browser TTS speaking indicator */}
            {isSpeaking && (
              <Card className="mb-6 border-muted/50 bg-muted/10">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-muted-foreground rounded-full animate-pulse" />
                      <span className="font-medium">Free Voice Playing</span>
                      <span className="text-sm text-muted-foreground">
                        {selectedVoice?.name || 'Default voice'}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={stopBrowserTTS}>
                      <Square className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  </div>
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
