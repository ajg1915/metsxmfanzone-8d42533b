import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface StreamAlert {
  id: string;
  stream_id: string;
  message: string;
  is_active: boolean;
  created_at: string;
}

interface StreamAlertBannerProps {
  streamId: string;
}

export function StreamAlertBanner({ streamId }: StreamAlertBannerProps) {
  const [alert, setAlert] = useState<StreamAlert | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!streamId) return;

    // Fetch active alert for this stream
    const fetchAlert = async () => {
      const { data, error } = await supabase
        .from('stream_alerts')
        .select('*')
        .eq('stream_id', streamId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setAlert(data);
        setDismissed(false);
      } else {
        setAlert(null);
      }
    };

    fetchAlert();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`stream-alerts-${streamId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stream_alerts',
          filter: `stream_id=eq.${streamId}`
        },
        (payload) => {
          console.log('Stream alert update:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newAlert = payload.new as StreamAlert;
            if (newAlert.is_active) {
              setAlert(newAlert);
              setDismissed(false);
            } else {
              setAlert(null);
            }
          } else if (payload.eventType === 'DELETE') {
            setAlert(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId]);

  if (!alert || dismissed) return null;

  return (
    <Alert variant="destructive" className="mb-4 animate-pulse">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span className="flex-1">{alert.message}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 ml-2"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}