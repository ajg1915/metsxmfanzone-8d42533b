import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    // Check if we need to create or update an alert
    // Count recent similar issues (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('stream_health_reports')
      .select('*', { count: 'exact', head: true })
      .eq('stream_id', stream_id)
      .eq('issue_type', issue_type)
      .gte('created_at', fiveMinutesAgo);

    console.log(`Similar issues in last 5 minutes: ${count}`);

    // If 3+ similar reports, create an alert for viewers
    if (count && count >= 3) {
      // Check if there's already an active alert for this stream
      const { data: existingAlert } = await supabase
        .from('stream_alerts')
        .select('*')
        .eq('stream_id', stream_id)
        .eq('is_active', true)
        .single();

      if (!existingAlert) {
        const alertMessage = getAlertMessage(issue_type);
        
        const { error: alertError } = await supabase
          .from('stream_alerts')
          .insert({
            stream_id,
            message: alertMessage,
            is_active: true
          });

        if (alertError) {
          console.error('Error creating alert:', alertError);
        } else {
          console.log('Created viewer alert for stream:', stream_id);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, report_id: report.id }),
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

function getAlertMessage(issueType: string): string {
  switch (issueType) {
    case 'buffering':
      return "We're aware of buffering issues and are working to resolve them. Thank you for your patience.";
    case 'audio':
      return "We're experiencing audio issues and our team is working on a fix. We apologize for the inconvenience.";
    case 'video':
      return "We're aware of video quality issues and are actively working to restore normal service.";
    case 'connection':
      return "Some viewers are experiencing connection issues. Our team is investigating.";
    case 'lag':
      return "We're aware of lag issues affecting the stream. We're working to improve performance.";
    default:
      return "We're experiencing technical difficulties. Our team is aware and working on a fix. We apologize for any inconvenience.";
  }
}