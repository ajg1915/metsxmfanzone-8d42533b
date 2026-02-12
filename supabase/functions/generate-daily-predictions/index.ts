import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const METS_TEAM_ID = 121;

function getPlayerImageUrl(playerId: number): string {
  return `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${playerId}/headshot/67/current`;
}

async function fetchMetsRoster(): Promise<Array<{ name: string; id: number; position: string }>> {
  try {
    const response = await fetch(
      `https://statsapi.mlb.com/api/v1/teams/${METS_TEAM_ID}/roster?rosterType=40Man`
    );
    if (!response.ok) throw new Error("Failed to fetch roster data");
    const data = await response.json();
    return data.roster.map((player: any) => ({
      name: player.person.fullName,
      id: player.person.id,
      position: player.position?.abbreviation || "UTIL",
    }));
  } catch (error) {
    console.error("Error fetching Mets roster:", error);
    return [
      { name: "Francisco Lindor", id: 596019, position: "SS" },
      { name: "Juan Soto", id: 665742, position: "RF" },
      { name: "Brandon Nimmo", id: 607043, position: "CF" },
      { name: "Jesse Winker", id: 608385, position: "LF" },
      { name: "Mark Vientos", id: 668901, position: "3B" },
      { name: "Francisco Alvarez", id: 682626, position: "C" },
      { name: "Jose Iglesias", id: 578428, position: "2B" },
      { name: "Luisangel Acuña", id: 694389, position: "SS" },
      { name: "Kodai Senga", id: 673085, position: "SP" },
      { name: "Frankie Montas", id: 593423, position: "SP" },
      { name: "Clay Holmes", id: 605280, position: "RP" },
      { name: "Sean Manaea", id: 640455, position: "SP" },
      { name: "David Peterson", id: 656849, position: "SP" },
      { name: "Jose Quintana", id: 500779, position: "SP" },
      { name: "Edwin Diaz", id: 621242, position: "RP" },
    ];
  }
}

function isPitcherPosition(position: string): boolean {
  return ["P", "SP", "RP", "CL"].includes(position);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    let forceStarPlayers: number[] = [];
    let forceRegenerate = false;
    let triggerType = "manual";

    try {
      const body = await req.json();
      if (body.forceStarPlayers && Array.isArray(body.forceStarPlayers)) forceStarPlayers = body.forceStarPlayers;
      if (body.forceRegenerate === true) forceRegenerate = true;
      if (body.triggerType) triggerType = body.triggerType;
    } catch { /* defaults */ }

    const today = new Date().toISOString().split('T')[0];

    const { data: existingPredictions } = await supabase
      .from("daily_player_predictions")
      .select("*")
      .eq("prediction_date", today);

    const shouldSkip = existingPredictions && existingPredictions.length > 0 && !forceRegenerate && forceStarPlayers.length === 0;

    if (shouldSkip) {
      return new Response(
        JSON.stringify({ message: "Predictions already exist for today", predictions: existingPredictions }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (forceRegenerate && existingPredictions && existingPredictions.length > 0) {
      await supabase.from("daily_player_predictions").delete().eq("prediction_date", today);
    }

    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const metsPlayers = await fetchMetsRoster();
    console.log(`Fetched ${metsPlayers.length} players from Mets roster`);

    let selectedPlayers: Array<{ name: string; id: number; position: string }> = [];

    if (forceStarPlayers.length > 0) {
      selectedPlayers = metsPlayers.filter(p => forceStarPlayers.includes(p.id));
    }

    const remainingSlots = 6 - selectedPlayers.length;
    if (remainingSlots > 0) {
      const available = metsPlayers.filter(p => !selectedPlayers.some(sp => sp.id === p.id));
      const shuffled = [...available].sort(() => 0.5 - Math.random());
      selectedPlayers = [...selectedPlayers, ...shuffled.slice(0, remainingSlots)];
    }

    let contextNote = "";
    if (triggerType === "morning") contextNote = "It's early morning. Give your daily parlay picks before games start.";
    else if (triggerType === "pregame") contextNote = "Pre-game time! Give your hottest parlay predictions for tonight.";

    const prompt = `You are Anthony, a passionate Mets baseball analyst and parlay betting expert. ${contextNote}

For each player below, predict their SPECIFIC stat line for today's game. Be realistic based on player tendencies and matchups.

Players and their positions:
${selectedPlayers.map(p => `- ${p.name} (${p.position})`).join("\n")}

For HITTERS (non-pitchers), predict: home runs, walks, RBIs, runs scored, stolen bases for today.
For STARTING PITCHERS (SP), predict: strikeouts, innings pitched (as a decimal like 6.0 or 5.2), walks allowed, home runs allowed, and whether they get a Win or Loss (W or L).
For RELIEF/BULLPEN PITCHERS (RP, CL), predict: strikeouts, innings pitched (as a decimal like 1.0 or 2.1), walks allowed, home runs allowed, and saves (SV).

Also give a confidence level (1-100) and a short parlay tip.

Respond with ONLY a valid JSON array (no markdown):
[
  {
    "name": "Player Name",
    "is_pitcher": false,
    "position": "SS",
    "status": "hot" or "cold",
    "predicted_hr": 1,
    "predicted_walks": 0,
    "predicted_rbis": 2,
    "predicted_runs": 1,
    "predicted_sb": 0,
    "predicted_strikeouts": 0,
    "predicted_innings_pitched": 0,
    "predicted_walks_allowed": 0,
    "predicted_hr_allowed": 0,
    "predicted_saves": 0,
    "predicted_win_loss": null,
    "confidence": 75,
    "description": "Brief parlay tip about this player"
  }
]

For hitters: set predicted_strikeouts, predicted_innings_pitched, predicted_hr_allowed, predicted_walks_allowed, predicted_saves to 0, predicted_win_loss to null.
For starting pitchers: set predicted_hr, predicted_walks, predicted_sb, predicted_rbis, predicted_runs, predicted_saves to 0. Set predicted_win_loss to "W" or "L".
For relief/bullpen pitchers: set predicted_hr, predicted_walks, predicted_sb, predicted_rbis, predicted_runs to 0. Set predicted_win_loss to null. Set predicted_saves to 0 or 1.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are Anthony, a Mets baseball parlay expert. Respond only with valid JSON." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) throw new Error("Rate limit exceeded. Please try again later.");
      if (aiResponse.status === 402) throw new Error("AI credits depleted. Please add credits.");
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    if (!aiContent) throw new Error("No content in AI response");

    let predictions;
    try {
      let cleanContent = aiContent.trim();
      if (cleanContent.startsWith("```json")) cleanContent = cleanContent.slice(7);
      else if (cleanContent.startsWith("```")) cleanContent = cleanContent.slice(3);
      if (cleanContent.endsWith("```")) cleanContent = cleanContent.slice(0, -3);
      predictions = JSON.parse(cleanContent.trim());
    } catch {
      console.error("Failed to parse AI response:", aiContent);
      throw new Error("Failed to parse AI predictions");
    }

    // Cleanup old predictions (keep 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    await supabase.from("daily_player_predictions").delete().lt("prediction_date", weekAgo.toISOString().split('T')[0]);

    const predictionsToInsert = predictions.map((pred: any) => {
      const player = selectedPlayers.find(p => p.name.toLowerCase() === pred.name.toLowerCase());
      return {
        player_name: pred.name,
        player_id: player?.id,
        player_image_url: player ? getPlayerImageUrl(player.id) : null,
        status: pred.status.toLowerCase(),
        description: pred.description,
        prediction_date: today,
        is_pitcher: pred.is_pitcher || false,
        predicted_hr: pred.predicted_hr || 0,
        predicted_walks: pred.predicted_walks || 0,
        predicted_sb: pred.predicted_sb || 0,
        predicted_rbis: pred.predicted_rbis || 0,
        predicted_runs: pred.predicted_runs || 0,
        predicted_strikeouts: pred.predicted_strikeouts || 0,
        predicted_innings_pitched: pred.predicted_innings_pitched || 0,
        predicted_hr_allowed: pred.predicted_hr_allowed || 0,
        predicted_walks_allowed: pred.predicted_walks_allowed || 0,
        predicted_saves: pred.predicted_saves || 0,
        predicted_win_loss: pred.predicted_win_loss || null,
        confidence: pred.confidence || 50,
      };
    });

    const { data: insertedPredictions, error: insertError } = await supabase
      .from("daily_player_predictions")
      .insert(predictionsToInsert)
      .select();

    if (insertError) throw insertError;

    console.log(`Successfully generated ${insertedPredictions?.length} parlay predictions (trigger: ${triggerType})`);

    return new Response(
      JSON.stringify({ message: "Predictions generated successfully", triggerType, predictions: insertedPredictions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating predictions:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
