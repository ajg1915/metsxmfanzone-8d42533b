import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mets team ID
const METS_TEAM_ID = 121;

interface MLBGame {
  gamePk: number;
  gameDate: string;
  status: {
    detailedState: string;
  };
  teams: {
    away: {
      team: {
        id: number;
        name: string;
      };
    };
    home: {
      team: {
        id: number;
        name: string;
      };
    };
  };
  venue?: {
    name: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get current year for Spring Training
    const currentYear = new Date().getFullYear();
    
    // Spring Training typically runs Feb 20 - Mar 25
    const startDate = `${currentYear}-02-15`;
    const endDate = `${currentYear}-03-31`;

    console.log(`Fetching Spring Training schedule for ${currentYear}...`);

    // Fetch from MLB Stats API - Spring Training games (gameType=S)
    const mlbApiUrl = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${METS_TEAM_ID}&startDate=${startDate}&endDate=${endDate}&gameType=S&hydrate=team,venue`;
    
    console.log(`Calling MLB API: ${mlbApiUrl}`);
    
    const response = await fetch(mlbApiUrl);
    
    if (!response.ok) {
      throw new Error(`MLB API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    const games: MLBGame[] = [];
    
    // Extract games from dates array
    if (data.dates && Array.isArray(data.dates)) {
      for (const dateObj of data.dates) {
        if (dateObj.games && Array.isArray(dateObj.games)) {
          games.push(...dateObj.games);
        }
      }
    }

    console.log(`Found ${games.length} Spring Training games`);

    if (games.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No Spring Training games found for the current period",
          gamesProcessed: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const game of games) {
      const isHomeGame = game.teams.home.team.id === METS_TEAM_ID;
      const opponent = isHomeGame 
        ? game.teams.away.team.name 
        : game.teams.home.team.name;
      
      // Parse game date and time
      const gameDateTime = new Date(game.gameDate);
      const gameDate = gameDateTime.toISOString().split('T')[0];
      const gameTime = gameDateTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/New_York'
      });

      const gameData = {
        mlb_game_pk: game.gamePk,
        opponent: opponent.replace('New York ', '').replace('St. Louis ', 'STL '),
        game_date: gameDate,
        game_time: gameTime,
        location: game.venue?.name || (isHomeGame ? 'Clover Park' : 'Away'),
        home_team: game.teams.home.team.name,
        away_team: game.teams.away.team.name,
        is_home_game: isHomeGame,
        game_status: game.status.detailedState,
        is_auto_generated: true,
        last_synced_at: new Date().toISOString(),
        published: true,
        preview_image_url: '', // Will use default or admin can set
      };

      // Check if game already exists
      const { data: existing } = await supabase
        .from("spring_training_games")
        .select("id, is_auto_generated")
        .eq("mlb_game_pk", game.gamePk)
        .maybeSingle();

      if (existing) {
        // Only update auto-generated games (preserve manual edits)
        if (existing.is_auto_generated) {
          const { error: updateError } = await supabase
            .from("spring_training_games")
            .update({
              game_time: gameData.game_time,
              game_status: gameData.game_status,
              last_synced_at: gameData.last_synced_at,
            })
            .eq("id", existing.id);

          if (updateError) {
            console.error(`Error updating game ${game.gamePk}:`, updateError);
          } else {
            updatedCount++;
          }
        } else {
          skippedCount++;
          console.log(`Skipping manually edited game: ${opponent} on ${gameDate}`);
        }
      } else {
        // Insert new game
        const { error: insertError } = await supabase
          .from("spring_training_games")
          .insert(gameData);

        if (insertError) {
          // Handle unique constraint violation gracefully
          if (insertError.code === '23505') {
            console.log(`Game ${game.gamePk} already exists, skipping`);
            skippedCount++;
          } else {
            console.error(`Error inserting game ${game.gamePk}:`, insertError);
          }
        } else {
          insertedCount++;
        }
      }
    }

    console.log(`Sync complete: ${insertedCount} inserted, ${updatedCount} updated, ${skippedCount} skipped`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Spring Training schedule synced successfully`,
        gamesProcessed: games.length,
        inserted: insertedCount,
        updated: updatedCount,
        skipped: skippedCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching Spring Training schedule:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
