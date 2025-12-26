import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StreamHealthMonitorProps {
  player: any;
  streamId: string;
}

export function useStreamHealthMonitor({ player, streamId }: StreamHealthMonitorProps) {
  const bufferStartTime = useRef<number | null>(null);
  const reportedIssues = useRef<Set<string>>(new Set());
  const sessionId = useRef(crypto.randomUUID());
  const errorCount = useRef(0);
  const lastErrorTime = useRef<number>(0);
  const lastAudioLevel = useRef<number>(0);
  const silentDuration = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const reportIssue = useCallback(async (issueType: string, severity: string, description: string) => {
    // Prevent duplicate reports within 30 seconds
    const issueKey = `${issueType}-${Math.floor(Date.now() / 30000)}`;
    if (reportedIssues.current.has(issueKey)) return;
    reportedIssues.current.add(issueKey);

    console.log('Reporting stream issue:', { issueType, severity, description });

    try {
      await supabase.functions.invoke('stream-health-report', {
        body: {
          stream_id: streamId,
          issue_type: issueType,
          severity,
          description,
          session_id: sessionId.current
        }
      });
    } catch (error) {
      console.error('Error reporting stream issue:', error);
    }
  }, [streamId]);

  useEffect(() => {
    if (!player || !streamId) return;

    console.log('StreamHealthMonitor: Initializing for stream', streamId);

    // Monitor buffering/waiting events
    const handleWaiting = () => {
      bufferStartTime.current = Date.now();
      console.log('Stream buffering started');
    };

    const handlePlaying = () => {
      if (bufferStartTime.current) {
        const bufferDuration = Date.now() - bufferStartTime.current;
        // Report if buffering lasted more than 5 seconds
        if (bufferDuration > 5000) {
          reportIssue(
            'buffering',
            bufferDuration > 15000 ? 'high' : 'medium',
            `Buffering lasted ${Math.round(bufferDuration / 1000)} seconds`
          );
        }
        bufferStartTime.current = null;
      }
    };

    const handleError = (e: any) => {
      const now = Date.now();
      // Track error frequency
      if (now - lastErrorTime.current < 60000) {
        errorCount.current++;
      } else {
        errorCount.current = 1;
      }
      lastErrorTime.current = now;

      const error = player.error();
      let issueType = 'connection';
      let description = 'Unknown error occurred';

      if (error) {
        switch (error.code) {
          case 1: // MEDIA_ERR_ABORTED
            issueType = 'connection';
            description = 'Stream playback was aborted';
            break;
          case 2: // MEDIA_ERR_NETWORK
            issueType = 'connection';
            description = 'Network error while loading stream';
            break;
          case 3: // MEDIA_ERR_DECODE
            issueType = 'video';
            description = 'Error decoding video stream';
            break;
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            issueType = 'connection';
            description = 'Stream format not supported';
            break;
          default:
            description = error.message || 'Playback error occurred';
        }
      }

      reportIssue(
        issueType,
        errorCount.current > 3 ? 'high' : 'medium',
        description
      );
    };

    const handleStalled = () => {
      reportIssue(
        'lag',
        'medium',
        'Stream stalled - possible network issues'
      );
    };

    // Video.js events
    player.on('waiting', handleWaiting);
    player.on('playing', handlePlaying);
    player.on('error', handleError);
    player.on('stalled', handleStalled);

    // Enhanced audio monitoring using Web Audio API
    const setupAudioMonitoring = () => {
      try {
        const videoElement = player.el()?.querySelector('video');
        if (!videoElement) {
          console.log('StreamHealthMonitor: Video element not found');
          return;
        }

        // Create audio context if not exists
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        // Only create source once
        if (!sourceRef.current && audioContextRef.current.state !== 'closed') {
          sourceRef.current = audioContextRef.current.createMediaElementSource(videoElement);
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          
          sourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
          
          console.log('StreamHealthMonitor: Audio monitoring initialized');
        }
      } catch (e) {
        console.log('StreamHealthMonitor: Could not setup Web Audio API', e);
      }
    };

    // Check audio levels using Web Audio API
    const checkAudioLevels = () => {
      // Don't check if player is muted (user choice, not an issue)
      if (player.muted()) return;
      
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average audio level
        const average = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
        
        // If audio level is very low for extended period, report issue
        if (average < 5) {
          silentDuration.current += 5; // 5 second check interval
          
          // Report after 15 seconds of silence
          if (silentDuration.current >= 15) {
            console.log('StreamHealthMonitor: Low/no audio detected for', silentDuration.current, 'seconds');
            reportIssue(
              'audio',
              silentDuration.current > 30 ? 'high' : 'medium',
              `No audio detected for ${silentDuration.current} seconds - possible audio stream issue`
            );
            silentDuration.current = 0; // Reset after reporting
          }
        } else {
          silentDuration.current = 0; // Reset on audio detected
        }
        
        lastAudioLevel.current = average;
      } else {
        // Fallback: Check audio tracks if Web Audio API not available
        try {
          const audioTracks = player.audioTracks?.();
          if (audioTracks && audioTracks.length > 0) {
            const activeTrack = Array.from(audioTracks as any[]).find((t: any) => t.enabled);
            if (!activeTrack) {
              reportIssue('audio', 'medium', 'No active audio track detected');
            }
          }
        } catch (e) {
          // Audio track API not available
        }
      }
    };

    // Setup audio monitoring after player is ready
    const handleCanPlay = () => {
      console.log('StreamHealthMonitor: Player can play, setting up audio monitoring');
      setTimeout(setupAudioMonitoring, 1000);
    };

    player.on('canplay', handleCanPlay);

    // If already playing, setup immediately
    if (!player.paused()) {
      setupAudioMonitoring();
    }

    const audioCheckInterval = setInterval(checkAudioLevels, 5000);

    return () => {
      player.off('waiting', handleWaiting);
      player.off('playing', handlePlaying);
      player.off('error', handleError);
      player.off('stalled', handleStalled);
      player.off('canplay', handleCanPlay);
      clearInterval(audioCheckInterval);
      
      // Cleanup audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      audioContextRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
    };
  }, [player, streamId, reportIssue]);

  return { sessionId: sessionId.current };
}