import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ArrowLeft, Maximize, Minimize } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreamData {
  id: string;
  title: string;
  description: string | null;
  stream_url: string;
  status: string;
}

export default function TVPlayer() {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout>();

  const [stream, setStream] = useState<StreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (streamId) {
      fetchStream();
    }
  }, [streamId]);

  const fetchStream = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('live_streams')
      .select('id, title, description, stream_url, status')
      .eq('id', streamId)
      .single();
    
    setStream(data);
    setLoading(false);
  };

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 5000);
  }, [isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetControlsTimer();
      
      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekForward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          volumeUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          volumeDown();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
        case 'Backspace':
          e.preventDefault();
          navigate('/tv');
          break;
      }
    };

    const handleMouseMove = () => resetControlsTimer();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, [isPlaying, navigate, resetControlsTimer]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const seekBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  };

  const seekForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
    }
  };

  const volumeUp = () => {
    if (videoRef.current) {
      videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.1);
    }
  };

  const volumeDown = () => {
    if (videoRef.current) {
      videoRef.current.volume = Math.max(0, videoRef.current.volume - 0.1);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-3xl text-foreground mb-6">Stream not found</p>
        <button 
          onClick={() => navigate('/tv')}
          className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl text-xl"
        >
          <ArrowLeft className="w-6 h-6" />
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen bg-black"
      onClick={resetControlsTimer}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={stream.stream_url}
        className="absolute inset-0 w-full h-full object-contain"
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        onDurationChange={() => setDuration(videoRef.current?.duration || 0)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        autoPlay
      />

      {/* Controls Overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between">
          <button 
            onClick={() => navigate('/tv')}
            className="flex items-center gap-3 text-2xl text-white/90 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-8 h-8" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-white">{stream.title}</h1>
          <button 
            onClick={toggleFullscreen}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            {isFullscreen ? (
              <Minimize className="w-8 h-8 text-white" />
            ) : (
              <Maximize className="w-8 h-8 text-white" />
            )}
          </button>
        </div>

        {/* Center Play/Pause */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-28 h-28 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center transition-all hover:scale-105"
          >
            {isPlaying ? (
              <Pause className="w-14 h-14 text-primary-foreground" />
            ) : (
              <Play className="w-14 h-14 text-primary-foreground ml-1" fill="currentColor" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          {/* Progress Bar */}
          <div className="relative h-2 bg-white/30 rounded-full mb-6 cursor-pointer">
            <div 
              className="absolute inset-y-0 left-0 bg-primary rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                onClick={seekBackward}
                className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <SkipBack className="w-10 h-10 text-white" />
              </button>
              <button
                onClick={togglePlay}
                className="p-5 rounded-full bg-primary hover:bg-primary/90 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10 text-primary-foreground" />
                ) : (
                  <Play className="w-10 h-10 text-primary-foreground ml-0.5" fill="currentColor" />
                )}
              </button>
              <button 
                onClick={seekForward}
                className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <SkipForward className="w-10 h-10 text-white" />
              </button>
            </div>

            {/* Time Display */}
            <div className="text-2xl text-white font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Volume */}
            <button 
              onClick={toggleMute}
              className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-10 h-10 text-white" />
              ) : (
                <Volume2 className="w-10 h-10 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
