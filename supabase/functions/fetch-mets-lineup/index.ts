import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const METS_TEAM_ID = 121;

interface MLBPlayer {
  id: number;
  fullName: string;
  primaryPosition: {
    abbreviation: string;
  };
}

interface MLBBattingOrder {
  battingOrder: string;
  player: MLBPlayer;
}

interface MLBPitcher {
  fullName: string;
  pitchHand: {
    code: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Fetching Mets schedule for today...");

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    // Fetch today's Mets game from MLB API
    const scheduleUrl = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${METS_TEAM_ID}&date=${dateStr}&hydrate=lineups,probablePitcher,team,linescore`;
    console.log("Fetching schedule from:", scheduleUrl);

    const scheduleRes = await fetch(scheduleUrl);
    const scheduleData = await scheduleRes.json();

    if (!scheduleData.dates || scheduleData.dates.length === 0) {
      console.log("No Mets game scheduled for today");
      return new Response(
        JSON.stringify({ success: true, message: "No game today" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const game = scheduleData.dates[0].games[0];
    if (!game) {
      console.log("No game data found");
      return new Response(
        JSON.stringify({ success: true, message: "No game data" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Found game:", game.gamePk, game.teams.away.team.name, "vs", game.teams.home.team.name);

    // Determine if Mets are home or away
    const isHome = game.teams.home.team.id === METS_TEAM_ID;
    const metsTeam = isHome ? game.teams.home : game.teams.away;
    const opponent = isHome ? game.teams.away.team.name : game.teams.home.team.name;

    // Get detailed game data with lineups
    const gameUrl = `https://statsapi.mlb.com/api/v1.1/game/${game.gamePk}/feed/live`;
    console.log("Fetching game details from:", gameUrl);

    const gameRes = await fetch(gameUrl);
    const gameData = await gameRes.json();

    // Extract lineup data
    const boxscore = gameData.liveData?.boxscore;
    const lineupData: { position: number; name: string; fieldPosition: string; imageUrl?: string }[] = [];

    if (boxscore) {
      const teamBoxscore = isHome ? boxscore.teams?.home : boxscore.teams?.away;
      const batters = teamBoxscore?.batters || [];
      const players = teamBoxscore?.players || {};

      // Get batting order from battingOrder array
      const battingOrder: number[] = [];
      for (const playerId of batters) {
        const player = players[`ID${playerId}`];
        if (player && player.battingOrder) {
          const orderNum = parseInt(player.battingOrder);
          if (orderNum >= 100 && orderNum <= 900 && orderNum % 100 === 0) {
            battingOrder.push(playerId);
          }
        }
      }

      // Sort by batting order
      battingOrder.sort((a, b) => {
        const orderA = parseInt(players[`ID${a}`]?.battingOrder || "0");
        const orderB = parseInt(players[`ID${b}`]?.battingOrder || "0");
        return orderA - orderB;
      });

      // Build lineup array
      let positionNum = 1;
      for (const playerId of battingOrder.slice(0, 9)) {
        const player = players[`ID${playerId}`];
        if (player) {
          const headshotUrl = `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${playerId}/headshot/67/current`;
          
          lineupData.push({
            position: positionNum,
            name: player.person?.fullName || "Unknown",
            fieldPosition: player.position?.abbreviation || player.allPositions?.[0]?.abbreviation || "DH",
            imageUrl: headshotUrl
          });
          positionNum++;
        }
      }
    }

    console.log(`Found ${lineupData.length} players in lineup`);

    // Get starting pitcher
    let startingPitcher = null;
    const probablePitcher = metsTeam.probablePitcher;
    
    if (probablePitcher) {
      // Fetch pitcher stats
      const pitcherStatsUrl = `https://statsapi.mlb.com/api/v1/people/${probablePitcher.id}?hydrate=stats(group=[pitching],type=[season],season=2026)`;
      console.log("Fetching pitcher stats from:", pitcherStatsUrl);
      
      const pitcherRes = await fetch(pitcherStatsUrl);
      const pitcherData = await pitcherRes.json();
      
      const person = pitcherData.people?.[0];
      const stats = person?.stats?.[0]?.splits?.[0]?.stat || {};
      
      startingPitcher = {
        name: probablePitcher.fullName || person?.fullName || "TBA",
        hand: person?.pitchHand?.code === "R" ? "RHP" : person?.pitchHand?.code === "L" ? "LHP" : "TBA",
        era: stats.era || "-",
        strikeouts: stats.strikeOuts?.toString() || "-"
      };
      
      console.log("Starting pitcher:", startingPitcher);
    }

    // Parse game time
    const gameDateTime = new Date(game.gameDate);
    const gameTimeStr = gameDateTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/New_York"
    });

    // Location
    const location = game.venue?.name || (isHome ? "Citi Field" : "Away");

    // Check if lineup card already exists for today
    const { data: existingCard } = await supabase
      .from("lineup_cards")
      .select("id")
      .eq("game_date", dateStr)
      .single();

    const lineupCardData = {
      game_date: dateStr,
      game_time: gameTimeStr,
      opponent: opponent.replace("New York ", "").replace("Los Angeles ", "").replace("San Francisco ", "").replace("San Diego ", ""),
      location: location,
      lineup_data: lineupData.length > 0 ? lineupData : null,
      starting_pitcher: startingPitcher,
      published: lineupData.length > 0,
      notes: lineupData.length === 0 ? "Lineup will be updated when released (typically 1-2 hours before first pitch)" : null,
      updated_at: new Date().toISOString()
    };

    let result;
    if (existingCard) {
      // Update existing card
      console.log("Updating existing lineup card:", existingCard.id);
      result = await supabase
        .from("lineup_cards")
        .update(lineupCardData)
        .eq("id", existingCard.id);
    } else {
      // Insert new card
      console.log("Creating new lineup card");
      result = await supabase
        .from("lineup_cards")
        .insert(lineupCardData);
    }

    if (result.error) {
      console.error("Database error:", result.error);
      throw result.error;
    }

    console.log("Lineup card saved successfully");
    
    return new Response(
      JSON.stringify({
        success: true,
        message: lineupData.length > 0 ? "Lineup fetched and saved" : "Game found, lineup TBA",
        opponent: lineupCardData.opponent,
        gameTime: gameTimeStr,
        playersInLineup: lineupData.length,
        hasPitcher: !!startingPitcher
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error fetching lineup:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
