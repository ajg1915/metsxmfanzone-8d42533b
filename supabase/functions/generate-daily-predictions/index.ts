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

// Hardcoded 2026 Mets active roster - ensures predictions always use real players
const METS_2026_ROSTER: Array<{ name: string; id: number; position: string }> = [
  // Everyday Hitters
  { name: "Francisco Lindor", id: 596019, position: "SS" },
  { name: "Juan Soto", id: 665742, position: "OF" },
  { name: "Mark Vientos", id: 668901, position: "3B" },
  { name: "Francisco Alvarez", id: 682626, position: "C" },
  { name: "Brandon Nimmo", id: 607043, position: "OF" },
  { name: "Jesse Winker", id: 608385, position: "OF" },
  { name: "Marcus Semien", id: 543760, position: "2B" },
  { name: "Bo Bichette", id: 666182, position: "SS/2B" },
  { name: "Luis Robert Jr.", id: 673357, position: "OF" },
  { name: "MJ Melendez", id: 669004, position: "OF/C" },
  { name: "Brett Baty", id: 683146, position: "3B/1B" },
  { name: "Luisangel Acuña", id: 694389, position: "IF" },
  { name: "Jose Iglesias", id: 578428, position: "IF" },
  { name: "Jorge Polanco", id: 593871, position: "IF" },
  { name: "Ronny Mauricio", id: 677595, position: "IF" },
  { name: "Tyrone Taylor", id: 621438, position: "OF" },
  // Starting Pitchers
  { name: "Kodai Senga", id: 673540, position: "SP" },
  { name: "Sean Manaea", id: 640455, position: "SP" },
  { name: "Frankie Montas", id: 593423, position: "SP" },
  { name: "David Peterson", id: 656849, position: "SP" },
  { name: "Clay Holmes", id: 605280, position: "SP" },
  { name: "Freddy Peralta", id: 642547, position: "SP" },
  { name: "Christian Scott", id: 681035, position: "SP" },
  { name: "Tobias Myers", id: 668964, position: "SP" },
  // Closers / Relievers
  { name: "Devin Williams", id: 642207, position: "CL" },
  { name: "Luke Weaver", id: 596133, position: "RP" },
  { name: "A.J. Minter", id: 621345, position: "RP" },
  { name: "Dedniel Núñez", id: 673380, position: "RP" },
  { name: "Brooks Raley", id: 548384, position: "RP" },
  { name: "Huascar Brazobán", id: 623211, position: "RP" },
];

async function fetchMetsRoster(): Promise<Array<{ name: string; id: number; position: string }>> {
  // Use the hardcoded active roster to guarantee correct 2026 players
  return METS_2026_ROSTER;
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
      selectedPlayers = [...metsPlayers.filter(p => forceStarPlayers.includes(p.id))];
    }
    const remainingSlots = 6 - selectedPlayers.length;
    if (remainingSlots > 0) {
      const available = metsPlayers.filter(p => !selectedPlayers.some(sp => sp.id === p.id));
      // Prioritize everyday starters: pick at least 3 hitters and 2 pitchers
      const hitters = available.filter(p => !["SP","CL","RP"].includes(p.position));
      const pitchers = available.filter(p => ["SP","CL","RP"].includes(p.position));
      const shuffledHitters = [...hitters].sort(() => 0.5 - Math.random());
      const shuffledPitchers = [...pitchers].sort(() => 0.5 - Math.random());
      const hittersNeeded = Math.min(Math.max(remainingSlots - 2, 3), remainingSlots, shuffledHitters.length);
      const pitchersNeeded = Math.min(remainingSlots - hittersNeeded, shuffledPitchers.length);
      selectedPlayers = [
        ...selectedPlayers,
        ...shuffledHitters.slice(0, hittersNeeded),
        ...shuffledPitchers.slice(0, pitchersNeeded),
      ];
      // Fill any remaining slots
      const stillNeeded = 6 - selectedPlayers.length;
      if (stillNeeded > 0) {
        const remaining = available.filter(p => !selectedPlayers.some(sp => sp.id === p.id));
        selectedPlayers = [...selectedPlayers, ...remaining.sort(() => 0.5 - Math.random()).slice(0, stillNeeded)];
      }
    }

    let contextNote = "";
    if (triggerType === "morning") contextNote = "It's early morning. Focus on trending players.";
    else if (triggerType === "pregame") contextNote = "Pre-game time! Give your hottest takes.";

    const playerList = selectedPlayers.map(p => `${p.name} (${p.position})`).join(", ");

    const prompt = `You are Anthony, a passionate Mets baseball analyst and betting expert. ${contextNote}

These are CONFIRMED 2026 New York Mets players. For each player, use their position to determine their role and predict their stat line for today's game. Be realistic with numbers.

Players: ${playerList}

Respond with ONLY a valid JSON array (no markdown, no extra text):
[
  {
    "name": "Player Name",
    "status": "hot" or "cold",
    "is_pitcher": true/false,
    "description": "1-2 sentence betting tip about this player",
    "confidence": 50-95,
    "predicted_hr": 0-2 (hitters only, 0 for pitchers),
    "predicted_rbis": 0-5 (hitters only, 0 for pitchers),
    "predicted_runs": 0-3 (hitters only, 0 for pitchers),
    "predicted_sb": 0-2 (hitters only, 0 for pitchers),
    "predicted_strikeouts": 0-12 (pitchers: strikeouts thrown, hitters: 0),
    "predicted_innings_pitched": 0-9 (pitchers only, 0 for hitters),
    "predicted_saves": 0-1 (closers only, 0 for others),
    "predicted_win_loss": "W" or "L" or null (starters only, null for hitters/closers),
    "predicted_walks_allowed": 0-5 (pitchers only, 0 for hitters),
    "predicted_hr_allowed": 0-3 (pitchers only, 0 for hitters),
    "predicted_walks": 0-3 (hitters only, 0 for pitchers)
  }
]`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are Anthony, a Mets baseball analyst. Respond only with valid JSON. Be realistic with stat predictions." },
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

    // Cleanup old predictions
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
        is_pitcher: pred.is_pitcher ?? false,
        confidence: pred.confidence ?? 50,
        predicted_hr: pred.predicted_hr ?? 0,
        predicted_rbis: pred.predicted_rbis ?? 0,
        predicted_runs: pred.predicted_runs ?? 0,
        predicted_sb: pred.predicted_sb ?? 0,
        predicted_strikeouts: pred.predicted_strikeouts ?? 0,
        predicted_innings_pitched: pred.predicted_innings_pitched ?? 0,
        predicted_saves: pred.predicted_saves ?? 0,
        predicted_win_loss: pred.predicted_win_loss ?? null,
        predicted_walks: pred.predicted_walks ?? 0,
        predicted_walks_allowed: pred.predicted_walks_allowed ?? 0,
        predicted_hr_allowed: pred.predicted_hr_allowed ?? 0,
      };
    });

    const { data: insertedPredictions, error: insertError } = await supabase
      .from("daily_player_predictions")
      .insert(predictionsToInsert)
      .select();

    if (insertError) throw insertError;

    console.log(`Successfully generated ${insertedPredictions?.length} predictions (trigger: ${triggerType})`);

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
