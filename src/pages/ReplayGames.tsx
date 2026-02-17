import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { StreamPlayer } from "@/components/StreamPlayer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, Play, Users, Lock, Clock, Film, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import PremiumBadge from "@/components/PremiumBadge";
import logo from "@/assets/metsxmfanzone-logo.png";

interface ReplayStream {
  id: string;
  title: string;
  description: string;
  stream_url: string;
  thumbnail_url: string;
  status: string;
  scheduled_start: string;
  viewers_count: number;
  assigned_pages: string[];
}

const ReplayGames = () => {
  const { user, loading: authLoading } = useAuth();
  const { tier, isAdmin } = useSubscription();
  const navigate = useNavigate();
  const [streams, setStreams] = useState<ReplayStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStream, setSelectedStream] = useState<ReplayStream | null>(null);

  useEffect(() => {
    fetchReplayStreams();

    const channel = supabase.channel('replay-page-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'live_streams'
    }, () => {
      fetchReplayStreams();
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchReplayStreams = async () => {
    try {
      const { data, error } = await supabase
        .from("live_streams")
        .select("*")
        .eq("published", true)
        .contains("assigned_pages", ["replay-games"])
        .order("scheduled_start", { ascending: false });

      if (error) throw error;
      const results = (data || []) as ReplayStream[];
      setStreams(results);
      if (results.length > 0 && !selectedStream) {
        setSelectedStream(results[0]);
      }
    } catch (error) {
      console.error("Error fetching replay streams:", error);
    } finally {
      setLoading(false);
    }
  };

  const canWatch = isAdmin || tier === "premium" || tier === "annual";

  const handleStreamSelect = (stream: ReplayStream) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!canWatch) {
      navigate("/pricing");
      return;
    }
    setSelectedStream(stream);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Replay Games - Watch Past Mets Games | MetsXMFanZone"
        description="Relive the best Mets moments. Watch full game replays, classic matchups, and memorable performances on demand."
        canonical="https://www.metsxmfanzone.com/replay-games"
        keywords="Mets replay games, Mets game replays, watch Mets games, Mets highlights, past Mets games"
      />
      <Navigation />

      <main className="flex-1 pt-12">
        {/* Hero Banner */}
        <div className="relative overflow-hidden bg-background">
          <div className="container mx-auto px-4 py-8 sm:py-12">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl shadow-primary/20 p-2">
                  <img src={logo} alt="MetsXMFanZone" className="w-full h-full object-contain" />
                </div>
                <motion.div
                  className="absolute -top-2 -right-2 flex items-center gap-1 bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs font-bold shadow-lg"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <RotateCcw className="w-3 h-3" />
                  REPLAY
                </motion.div>
              </motion.div>

              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
                      <Film className="w-3 h-3 mr-1" />
                      On Demand
                    </Badge>
                    <PremiumBadge size="sm" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground mb-2">
                    Replay <span className="text-primary">Games</span>
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
                    Relive the best Mets moments. Watch full game replays and classic matchups on demand.
                  </p>
                </motion.div>

                <motion.div
                  className="flex flex-wrap gap-3 mt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50">
                    <Film className="w-4 h-4 text-primary" />
                    <span className="text-xs text-foreground">{streams.length} Replays Available</span>
                  </div>
                  <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-foreground">Watch Anytime</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Stream Player */}
        {selectedStream && canWatch && user && (
          <div className="container mx-auto px-4 py-6 sm:py-8">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <StreamPlayer
                  pageName="replay-games"
                  pageTitle={selectedStream.title}
                  pageDescription={selectedStream.description || "Replay game stream"}
                />
              </motion.div>
            </div>
          </div>
        )}

        {/* Replay Games Grid */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <RotateCcw className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">All Replay Games</h2>
            </div>

            {loading ? (
              <div className="text-center text-muted-foreground py-12">Loading replay games...</div>
            ) : streams.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="p-12 text-center">
                  <RotateCcw className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Replay Games Available</h3>
                  <p className="text-muted-foreground text-sm">Check back later for game replays.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {streams.map((stream, index) => (
                  <motion.div
                    key={stream.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card
                      className={`overflow-hidden cursor-pointer group border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 ${
                        selectedStream?.id === stream.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleStreamSelect(stream)}
                    >
                      <div className="aspect-video relative overflow-hidden">
                        {stream.thumbnail_url ? (
                          <img
                            src={stream.thumbnail_url}
                            alt={stream.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <RotateCcw className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />

                        {/* Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="w-12 h-12 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            {canWatch ? (
                              <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
                            ) : (
                              <Lock className="w-5 h-5 text-primary-foreground" />
                            )}
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                          {!canWatch && <PremiumBadge size="sm" />}
                          <Badge className="text-[10px] px-1.5 py-0.5 font-semibold backdrop-blur-sm bg-muted/80 text-muted-foreground">
                            <RotateCcw className="w-2.5 h-2.5 mr-1" />
                            REPLAY
                          </Badge>
                        </div>

                        {stream.viewers_count > 0 && (
                          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-background/90 backdrop-blur-sm text-[10px] font-medium text-foreground flex items-center gap-1">
                            <Users className="w-3 h-3 text-primary" />
                            {stream.viewers_count}
                          </div>
                        )}
                      </div>

                      <CardContent className="p-3">
                        <p className="text-sm font-semibold text-foreground line-clamp-2">{stream.title}</p>
                        {stream.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{stream.description}</p>
                        )}
                        {stream.scheduled_start && (
                          <p className="text-[10px] text-muted-foreground mt-2">
                            {new Date(stream.scheduled_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* CTA for non-premium users */}
            {!canWatch && streams.length > 0 && (
              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-primary/30 bg-primary/5 max-w-lg mx-auto">
                  <CardContent className="p-6">
                    <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-foreground mb-2">Unlock All Replays</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upgrade to Premium to watch full game replays on demand.
                    </p>
                    <Button onClick={() => navigate("/pricing")} className="gap-2">
                      View Plans <ChevronRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReplayGames;
