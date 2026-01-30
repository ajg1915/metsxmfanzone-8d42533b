import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PlayerStats {
  playerInfo: any;
  careerStats: any;
  seasonStats: any[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { playerId } = await req.json();

    if (!playerId) {
      return new Response(
        JSON.stringify({ error: "Player ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching stats for player ID: ${playerId}`);

    // Fetch player info
    const playerResponse = await fetch(
      `https://statsapi.mlb.com/api/v1/people/${playerId}?hydrate=currentTeam,team`
    );
    
    if (!playerResponse.ok) {
      throw new Error("Failed to fetch player info");
    }

    const playerData = await playerResponse.json();
    const playerInfo = playerData.people?.[0];

    if (!playerInfo) {
      return new Response(
        JSON.stringify({ error: "Player not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine if player is a pitcher
    const isPitcher = playerInfo.primaryPosition?.type?.toLowerCase() === "pitcher";

    // Fetch career stats
    const statsGroup = isPitcher ? "pitching,fielding" : "hitting,fielding";
    const careerStatsResponse = await fetch(
      `https://statsapi.mlb.com/api/v1/people/${playerId}/stats?stats=career&group=${statsGroup}`
    );

    let careerStats: any = {};
    if (careerStatsResponse.ok) {
      const careerData = await careerStatsResponse.json();
      
      careerData.stats?.forEach((statGroup: any) => {
        const stats = statGroup.splits?.[0]?.stat;
        if (!stats) return;

        if (statGroup.group?.displayName === "hitting") {
          careerStats.hitting = {
            gamesPlayed: stats.gamesPlayed,
            atBats: stats.atBats,
            runs: stats.runs,
            hits: stats.hits,
            doubles: stats.doubles,
            triples: stats.triples,
            homeRuns: stats.homeRuns,
            rbi: stats.rbi,
            stolenBases: stats.stolenBases,
            avg: stats.avg,
            obp: stats.obp,
            slg: stats.slg,
            ops: stats.ops,
          };
        } else if (statGroup.group?.displayName === "pitching") {
          careerStats.pitching = {
            gamesPlayed: stats.gamesPlayed,
            gamesStarted: stats.gamesStarted,
            wins: stats.wins,
            losses: stats.losses,
            era: stats.era,
            inningsPitched: stats.inningsPitched,
            strikeOuts: stats.strikeOuts,
            walks: stats.baseOnBalls,
            hits: stats.hits,
            saves: stats.saves,
            whip: stats.whip,
          };
        } else if (statGroup.group?.displayName === "fielding") {
          careerStats.fielding = {
            gamesPlayed: stats.gamesPlayed,
            gamesStarted: stats.gamesStarted,
            assists: stats.assists,
            putOuts: stats.putOuts,
            errors: stats.errors,
            fielding: stats.fielding,
          };
        }
      });
    }

    // Fetch season-by-season stats
    const seasonStatsResponse = await fetch(
      `https://statsapi.mlb.com/api/v1/people/${playerId}/stats?stats=yearByYear&group=${isPitcher ? "pitching" : "hitting"}`
    );

    let seasonStats: any[] = [];
    if (seasonStatsResponse.ok) {
      const seasonData = await seasonStatsResponse.json();
      const splits = seasonData.stats?.[0]?.splits || [];
      
      seasonStats = splits
        .filter((split: any) => split.sport?.id === 1) // MLB only
        .map((split: any) => ({
          season: split.season,
          team: split.team?.name || "Unknown",
          stats: isPitcher
            ? {
                gamesPlayed: split.stat.gamesPlayed,
                gamesStarted: split.stat.gamesStarted,
                wins: split.stat.wins,
                losses: split.stat.losses,
                era: split.stat.era,
                inningsPitched: split.stat.inningsPitched,
                strikeOuts: split.stat.strikeOuts,
                walks: split.stat.baseOnBalls,
                whip: split.stat.whip,
                saves: split.stat.saves,
              }
            : {
                gamesPlayed: split.stat.gamesPlayed,
                atBats: split.stat.atBats,
                hits: split.stat.hits,
                homeRuns: split.stat.homeRuns,
                rbi: split.stat.rbi,
                runs: split.stat.runs,
                avg: split.stat.avg,
                obp: split.stat.obp,
                ops: split.stat.ops,
              },
        }))
        .sort((a: any, b: any) => parseInt(b.season) - parseInt(a.season)); // Most recent first
    }

    const response: PlayerStats = {
      playerInfo: {
        id: playerInfo.id,
        fullName: playerInfo.fullName,
        firstName: playerInfo.firstName,
        lastName: playerInfo.lastName,
        jerseyNumber: playerInfo.primaryNumber,
        primaryPosition: playerInfo.primaryPosition,
        batSide: playerInfo.batSide,
        pitchHand: playerInfo.pitchHand,
        birthDate: playerInfo.birthDate,
        birthCity: playerInfo.birthCity,
        birthStateProvince: playerInfo.birthStateProvince,
        birthCountry: playerInfo.birthCountry,
        height: playerInfo.height,
        weight: playerInfo.weight,
        currentAge: playerInfo.currentAge,
        mlbDebutDate: playerInfo.mlbDebutDate,
        active: playerInfo.active,
      },
      careerStats,
      seasonStats,
    };

    console.log(`Successfully fetched stats for ${playerInfo.fullName}`);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch player stats";
    console.error("Error fetching player stats:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
