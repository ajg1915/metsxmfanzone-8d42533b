import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const METS_TEAM_ID = 121;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { triggerType = "morning" } = await req.json().catch(() => ({}));

    // Get today's date in ET
    const now = new Date();
    const etFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric', month: '2-digit', day: '2-digit',
    });
    const parts = etFormatter.formatToParts(now);
    const year = parts.find(p => p.type === 'year')!.value;
    const month = parts.find(p => p.type === 'month')!.value;
    const day = parts.find(p => p.type === 'day')!.value;
    const todayET = `${year}-${month}-${day}`;

    console.log(`Auto Game Alert: Checking for Mets games on ${todayET} (trigger: ${triggerType})`);

    const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${METS_TEAM_ID}&date=${todayET}&hydrate=team,venue`;
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error("MLB API error:", response.status, text);
      return new Response(JSON.stringify({ success: false, error: "MLB API error" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
      });
    }

    const data = await response.json();

    if (!data.dates || data.dates.length === 0) {
      console.log("No Mets games today.");
      return new Response(JSON.stringify({ success: true, message: "No games today" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const games = data.dates[0].games;
    let alertsCreated = 0;

    for (const game of games) {
      const isHome = game.teams.home.team.id === METS_TEAM_ID;
      const opponent = isHome ? game.teams.away.team.name : game.teams.home.team.name;
      const venue = game.venue?.name || (isHome ? "Citi Field" : "Away");
      const gameType = game.gameType;
      const typeLabel = gameType === 'S' ? 'Spring Training' : gameType === 'R' ? 'Regular Season' : 'Postseason';
      const homeAway = isHome ? "vs" : "@";

      const gameDate = new Date(game.gameDate);
      const timeStr = gameDate.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', hour12: true,
      });

      // Build alert content
      let title: string;
      let message: string;

      if (triggerType === "morning") {
        title = `⚾ Game Day! Mets ${homeAway} ${opponent}`;
        message = `${typeLabel}: Mets ${homeAway} ${opponent} today at ${timeStr} ET at ${venue}. Let's go Mets! 🟠🔵`;
      } else {
        title = `🔔 Almost Game Time! Mets ${homeAway} ${opponent}`;
        message = `First pitch in ~2 hours! Mets ${homeAway} ${opponent} at ${timeStr} ET at ${venue}. Get ready! ⚾`;
      }

      // Dedup: check if same title already created today
      const { data: existing } = await supabase
        .from("game_alerts")
        .select("id")
        .eq("title", title)
        .gte("created_at", `${todayET}T00:00:00Z`)
        .limit(1);

      if (existing && existing.length > 0) {
        console.log(`Alert already exists for game ${game.gamePk} (${triggerType}), skipping.`);
        continue;
      }

      const linkUrl = gameType === 'S' ? '/spring-training-live' : '/metsxmfanzone-tv';
      const alertTypeDb = gameType === 'S' ? 'spring_training' : 'game_day';

      const { error: insertError } = await supabase
        .from("game_alerts")
        .insert({
          title,
          message,
          alert_type: alertTypeDb,
          severity: triggerType === "pregame" ? "warning" : "info",
          link_url: linkUrl,
          is_active: true,
          push_sent: false,
          email_sent: false,
        });

      if (insertError) {
        console.error("Failed to insert alert:", insertError);
        continue;
      }

      console.log(`Created ${triggerType} alert: ${title}`);
      alertsCreated++;
    }

    // Deactivate old auto-alerts from previous days
    await supabase
      .from("game_alerts")
      .update({ is_active: false })
      .in("alert_type", ["game_day", "spring_training"])
      .lt("created_at", `${todayET}T00:00:00Z`);

    return new Response(
      JSON.stringify({ success: true, alertsCreated, date: todayET }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Auto game alerts error:", error);
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
