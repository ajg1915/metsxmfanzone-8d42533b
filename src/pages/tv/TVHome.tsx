import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TVLayout } from "@/components/tv/TVLayout";
import { TVStreamCard } from "@/components/tv/TVStreamCard";
import { TVHighlightCard } from "@/components/tv/TVHighlightCard";
import { TVPodcastCard } from "@/components/tv/TVPodcastCard";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight } from "lucide-react";

interface LiveStream {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  status: string;
}

interface Video {
  id: string;
  title: string;
  thumbnail_url: string | null;
  duration: number | null;
  views: number | null;
}

interface Podcast {
  id: string;
  title: string;
  description: string | null;
  duration: number | null;
  published_at: string | null;
}

export default function TVHome() {
  const navigate = useNavigate();
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [highlights, setHighlights] = useState<Video[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    
    // Fetch live streams
    const { data: streams } = await supabase
      .from('live_streams')
      .select('id, title, description, thumbnail_url, status')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(5);
    
    // Fetch highlights/videos
    const { data: videos } = await supabase
      .from('videos')
      .select('id, title, thumbnail_url, duration, views')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(6);
    
    // Fetch podcasts
    const { data: podcastData } = await supabase
      .from('podcasts')
      .select('id, title, description, duration, published_at')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(5);

    setLiveStreams(streams || []);
    setHighlights(videos || []);
    setPodcasts(podcastData || []);
    setLoading(false);
  };

  const liveNowStreams = liveStreams.filter(s => s.status === 'live');
  const upcomingStreams = liveStreams.filter(s => s.status !== 'live');

  return (
    <TVLayout>
      {/* Hero - Live Now Section */}
      {liveNowStreams.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
            <h2 className="text-3xl font-bold text-foreground">Now Live</h2>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {liveNowStreams.map((stream, index) => (
              <TVStreamCard
                key={stream.id}
                id={`live-${stream.id}`}
                title={stream.title}
                description={stream.description || undefined}
                thumbnailUrl={stream.thumbnail_url || undefined}
                isLive={true}
                row={1}
                col={index}
                onClick={() => navigate(`/tv/watch/${stream.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Highlights Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-foreground">Highlights</h2>
          <button 
            className="flex items-center gap-2 text-xl text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate('/tv/highlights')}
          >
            View All <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="w-[320px] aspect-video rounded-2xl bg-muted animate-pulse" />
            ))
          ) : highlights.length > 0 ? (
            highlights.map((video, index) => (
              <TVHighlightCard
                key={video.id}
                id={`highlight-${video.id}`}
                title={video.title}
                thumbnailUrl={video.thumbnail_url || undefined}
                duration={video.duration || undefined}
                views={video.views || undefined}
                row={2}
                col={index}
                onClick={() => navigate(`/tv/video/${video.id}`)}
              />
            ))
          ) : (
            <p className="text-xl text-muted-foreground">No highlights available</p>
          )}
        </div>
      </section>

      {/* Podcasts Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-foreground">Latest Podcasts</h2>
          <button 
            className="flex items-center gap-2 text-xl text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate('/tv/podcasts')}
          >
            View All <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="w-[360px] h-40 rounded-2xl bg-muted animate-pulse" />
            ))
          ) : podcasts.length > 0 ? (
            podcasts.map((podcast, index) => (
              <TVPodcastCard
                key={podcast.id}
                id={`podcast-${podcast.id}`}
                title={podcast.title}
                description={podcast.description || undefined}
                duration={podcast.duration || undefined}
                publishedAt={podcast.published_at || undefined}
                row={3}
                col={index}
                onClick={() => navigate(`/tv/podcast/${podcast.id}`)}
              />
            ))
          ) : (
            <p className="text-xl text-muted-foreground">No podcasts available</p>
          )}
        </div>
      </section>

      {/* Upcoming Streams Section */}
      {upcomingStreams.length > 0 && (
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-6">Upcoming</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {upcomingStreams.map((stream, index) => (
              <TVStreamCard
                key={stream.id}
                id={`upcoming-${stream.id}`}
                title={stream.title}
                description={stream.description || undefined}
                thumbnailUrl={stream.thumbnail_url || undefined}
                isLive={false}
                row={4}
                col={index}
                onClick={() => navigate(`/tv/watch/${stream.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Quick Access */}
      <section>
        <h2 className="text-3xl font-bold text-foreground mb-6">Quick Access</h2>
        <div className="grid grid-cols-3 gap-6">
          <QuickAccessCard 
            id="quick-metsxm"
            title="MetsXM FanZone TV" 
            icon="📺" 
            row={5} 
            col={0}
            onClick={() => navigate('/metsxmfanzone')} 
          />
          <QuickAccessCard 
            id="quick-highlights"
            title="Highlights" 
            icon="🎬" 
            row={5} 
            col={1}
            onClick={() => navigate('/tv/highlights')} 
          />
          <QuickAccessCard 
            id="quick-podcasts"
            title="Podcasts" 
            icon="🎙️" 
            row={5} 
            col={2}
            onClick={() => navigate('/tv/podcasts')} 
          />
          <QuickAccessCard 
            id="quick-mlb"
            title="MLB Network" 
            icon="⚾" 
            row={6} 
            col={0}
            onClick={() => navigate('/mlb-network')} 
          />
          <QuickAccessCard 
            id="quick-schedule"
            title="2026 Schedule" 
            icon="📅" 
            row={6} 
            col={1}
            onClick={() => navigate('/mets-schedule-2026')} 
          />
          <QuickAccessCard 
            id="quick-roster"
            title="Team Roster" 
            icon="👥" 
            row={6} 
            col={2}
            onClick={() => navigate('/mets-roster')} 
          />
        </div>
      </section>
    </TVLayout>
  );
}

function QuickAccessCard({ 
  id, 
  title, 
  icon, 
  row, 
  col, 
  onClick 
}: { 
  id: string;
  title: string; 
  icon: string; 
  row: number;
  col: number;
  onClick: () => void;
}) {
  const { FocusableCard } = require('@/components/tv/FocusableCard');
  
  return (
    <FocusableCard
      id={id}
      row={row}
      col={col}
      onClick={onClick}
      className="p-8 rounded-2xl glass-card text-center"
    >
      <span className="text-6xl mb-4 block">{icon}</span>
      <h3 className="text-2xl font-semibold text-foreground">{title}</h3>
    </FocusableCard>
  );
}
