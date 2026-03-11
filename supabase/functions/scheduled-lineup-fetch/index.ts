import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const METS_TEAM_ID = 121;

/**
 * Scheduled Lineup Fetch
 * Checks today's Mets game time and determines if it's the right time to fetch the lineup.
 * 
 * Rules:
 * - For 1:00 PM ET games → fetch at 11:00 AM ET
 * - For 7:10 PM ET games → fetch at 5:00 PM ET
 * - General rule: fetch 2 hours before game time
 * - Also fetches if lineup hasn't been fetched yet and we're within 3 hours of game time
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current time in ET
    const now = new Date();
    const etFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false,
    });
    const etParts = etFormatter.formatToParts(now);
    const etHour = parseInt(etParts.find(p => p.type === "hour")?.value || "0");
    const etMinute = parseInt(etParts.find(p => p.type === "minute")?.value || "0");
    const currentETMinutes = etHour * 60 + etMinute;

    const dateStr = now.toISOString().split("T")[0];

    console.log(`Scheduled lineup check at ${etHour}:${etMinute} ET on ${dateStr}`);

    // Fetch today's Mets game
    const scheduleUrl = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${METS_TEAM_ID}&date=${dateStr}&hydrate=team`;
    const scheduleRes = await fetch(scheduleUrl);
    const scheduleData = await scheduleRes.json();

    if (!scheduleData.dates?.[0]?.games?.[0]) {
      console.log("No Mets game today, skipping");
      return new Response(
        JSON.stringify({ success: true, message: "No game today", action: "skipped" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const game = scheduleData.dates[0].games[0];
    const gameDateTime = new Date(game.gameDate);
    
    // Convert game time to ET minutes
    const gameETFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit", minute: "2-digit", hour12: false,
    });
    const gameETParts = gameETFormatter.formatToParts(gameDateTime);
    const gameETHour = parseInt(gameETParts.find(p => p.type === "hour")?.value || "0");
    const gameETMinute = parseInt(gameETParts.find(p => p.type === "minute")?.value || "0");
    const gameETMinutes = gameETHour * 60 + gameETMinute;

    const gameTimeStr = gameDateTime.toLocaleTimeString("en-US", {
      hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/New_York",
    });

    console.log(`Game time: ${gameTimeStr} ET (${gameETHour}:${gameETMinute})`);

    // Calculate fetch window: 2 hours before game time
    const fetchTimeMinutes = gameETMinutes - 120; // 2 hours before
    const fetchWindowStart = fetchTimeMinutes - 15; // 15 min buffer before
    const fetchWindowEnd = fetchTimeMinutes + 15; // 15 min buffer after

    // Also allow fetching within 3 hours of game time if lineup not yet available
    const withinGameWindow = currentETMinutes >= (gameETMinutes - 180) && currentETMinutes <= gameETMinutes;
    const inPrimaryFetchWindow = currentETMinutes >= fetchWindowStart && currentETMinutes <= fetchWindowEnd;

    // Check if we already have a lineup with players for today
    const { data: existingCard } = await supabase
      .from("lineup_cards")
      .select("id, lineup_data, published")
      .eq("game_date", dateStr)
      .maybeSingle();

    const hasLineup = existingCard?.published && 
      Array.isArray(existingCard.lineup_data) && 
      (existingCard.lineup_data as any[]).length > 0;

    let shouldFetch = false;
    let reason = "";

    if (inPrimaryFetchWindow) {
      shouldFetch = true;
      reason = `In primary fetch window (2h before ${gameTimeStr})`;
    } else if (withinGameWindow && !hasLineup) {
      shouldFetch = true;
      reason = `Within 3h of game time and no lineup yet`;
    } else if (!hasLineup && currentETMinutes >= fetchWindowStart) {
      shouldFetch = true;
      reason = `Past fetch window and still no lineup`;
    }

    if (!shouldFetch) {
      console.log(`Not time to fetch yet. Current: ${etHour}:${etMinute} ET, Game: ${gameTimeStr}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Not yet time to fetch lineup", 
          action: "waiting",
          gameTime: gameTimeStr,
          nextFetchWindow: `~${Math.floor(fetchTimeMinutes / 60)}:${String(fetchTimeMinutes % 60).padStart(2, "0")} ET`,
          hasLineup,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching lineup: ${reason}`);

    // Call the existing fetch-mets-lineup function
    const lineupUrl = `${supabaseUrl}/functions/v1/fetch-mets-lineup`;
    const lineupRes = await fetch(lineupUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({}),
    });

    const lineupResult = await lineupRes.json();
    console.log("Lineup fetch result:", lineupResult);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Lineup fetched: ${reason}`,
        action: "fetched",
        gameTime: gameTimeStr,
        lineupResult,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Scheduled lineup fetch error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
