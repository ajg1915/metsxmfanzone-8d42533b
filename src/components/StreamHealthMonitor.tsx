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

    const handleWaiting = () => {
      bufferStartTime.current = Date.now();
    };

    const handlePlaying = () => {
      if (bufferStartTime.current) {
        const bufferDuration = Date.now() - bufferStartTime.current;
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

    const handleError = () => {
      const now = Date.now();
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
          case 1:
            issueType = 'connection';
            description = 'Stream playback was aborted';
            break;
          case 2:
            issueType = 'connection';
            description = 'Network error while loading stream';
            break;
          case 3:
            issueType = 'video';
            description = 'Error decoding video stream';
            break;
          case 4:
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
      reportIssue('lag', 'medium', 'Stream stalled - possible network issues');
    };

    player.on('waiting', handleWaiting);
    player.on('playing', handlePlaying);
    player.on('error', handleError);
    player.on('stalled', handleStalled);

    // NOTE: Removed Web Audio API (createMediaElementSource) audio monitoring.
    // It hijacks the video element's audio output and routes it through AudioContext.
    // On mobile, AudioContext starts suspended, which causes NO AUDIO to play at all.
    // Buffering/stall/error monitoring is sufficient for health checks.

    return () => {
      player.off('waiting', handleWaiting);
      player.off('playing', handlePlaying);
      player.off('error', handleError);
      player.off('stalled', handleStalled);
    };
  }, [player, streamId, reportIssue]);

  return { sessionId: sessionId.current };
}
