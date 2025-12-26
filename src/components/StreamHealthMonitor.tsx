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

    // Monitor audio issues
    const checkAudio = () => {
      try {
        const audioTracks = player.audioTracks?.();
        if (audioTracks && audioTracks.length > 0) {
          const activeTrack = Array.from(audioTracks as any[]).find((t: any) => t.enabled);
          if (!activeTrack && !player.muted()) {
            reportIssue('audio', 'medium', 'No active audio track detected');
          }
        }
      } catch (e) {
        // Audio track API not available
      }
    };

    const audioCheckInterval = setInterval(checkAudio, 30000);

    return () => {
      player.off('waiting', handleWaiting);
      player.off('playing', handlePlaying);
      player.off('error', handleError);
      player.off('stalled', handleStalled);
      clearInterval(audioCheckInterval);
    };
  }, [player, streamId, reportIssue]);

  return { sessionId: sessionId.current };
}