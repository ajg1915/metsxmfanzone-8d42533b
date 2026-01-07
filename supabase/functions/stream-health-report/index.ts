import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stream_id, issue_type, severity, description, session_id } = await req.json();
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    console.log('Received stream health report:', { stream_id, issue_type, severity, description });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert the health report
    const { data: report, error: reportError } = await supabase
      .from('stream_health_reports')
      .insert({
        stream_id,
        issue_type,
        severity,
        description,
        user_agent: userAgent,
        session_id
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error inserting report:', reportError);
      throw reportError;
    }

    console.log('Health report created:', report.id);

    // Auto-send alert based on severity and issue frequency
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('stream_health_reports')
      .select('*', { count: 'exact', head: true })
      .eq('stream_id', stream_id)
      .eq('issue_type', issue_type)
      .gte('created_at', fiveMinutesAgo);

    console.log(`Similar issues in last 5 minutes: ${count}, Severity: ${severity}`);

    // Auto-send alert: immediately for high severity, or 2+ reports for medium/low
    const shouldSendAlert = severity === 'high' || (count && count >= 2);

    if (shouldSendAlert) {
      // Check if there's already an active alert for this stream and issue type
      const { data: existingAlert } = await supabase
        .from('stream_alerts')
        .select('*')
        .eq('stream_id', stream_id)
        .eq('is_active', true)
        .single();

      if (!existingAlert) {
        const alertMessage = getAlertMessage(issue_type, severity);
        
        console.log(`Auto-sending alert for stream ${stream_id}: ${alertMessage}`);

        const { error: alertError } = await supabase
          .from('stream_alerts')
          .insert({
            stream_id,
            message: alertMessage,
            is_active: true
          });

        if (alertError) {
          console.error('Error creating auto-alert:', alertError);
        } else {
          console.log('Auto-alert sent to viewers for stream:', stream_id);
        }
      } else {
        console.log('Active alert already exists for stream:', stream_id);
      }
    }

    // Auto-resolve alert when stream stabilizes (no issues for 3 minutes)
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();
    const { count: recentIssueCount } = await supabase
      .from('stream_health_reports')
      .select('*', { count: 'exact', head: true })
      .eq('stream_id', stream_id)
      .gte('created_at', threeMinutesAgo);

    if (recentIssueCount === 0) {
      // Deactivate any active alerts for this stream
      await supabase
        .from('stream_alerts')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('stream_id', stream_id)
        .eq('is_active', true);
      
      console.log('Stream stabilized, auto-deactivated alerts for:', stream_id);
    }

    return new Response(
      JSON.stringify({ success: true, report_id: report.id, alert_sent: shouldSendAlert }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in stream-health-report function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getAlertMessage(issueType: string, severity: string): string {
  const severityPrefix = severity === 'high' ? '⚠️ ' : '';
  
  switch (issueType) {
    case 'buffering':
      return `${severityPrefix}We're aware of buffering issues and are actively working to resolve them. Thank you for your patience.`;
    case 'audio':
      return `${severityPrefix}We're experiencing audio issues and our team is working on a fix. We apologize for the inconvenience.`;
    case 'video':
      return `${severityPrefix}We're aware of video quality issues and are actively working to restore normal service.`;
    case 'connection':
      return `${severityPrefix}Some viewers are experiencing connection issues. Our team is investigating and working on a fix.`;
    case 'lag':
      return `${severityPrefix}We're aware of lag issues affecting the stream. We're working to improve performance.`;
    default:
      return `${severityPrefix}We're experiencing technical difficulties. Our team is aware and working on a fix. We apologize for any inconvenience.`;
  }
}