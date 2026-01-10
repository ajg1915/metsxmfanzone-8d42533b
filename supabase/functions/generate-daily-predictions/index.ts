import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mets roster with player IDs for MLB API images
const metsPlayers = [
  { name: "Francisco Lindor", id: 596019 },
  { name: "Pete Alonso", id: 624413 },
  { name: "Brandon Nimmo", id: 607043 },
  { name: "Jeff McNeil", id: 643446 },
  { name: "Mark Vientos", id: 668901 },
  { name: "Francisco Alvarez", id: 682626 },
  { name: "Starling Marte", id: 516782 },
  { name: "Jose Soto", id: 665742 },
  { name: "Tyrone Taylor", id: 621438 },
  { name: "Kodai Senga", id: 673085 },
  { name: "Sean Manaea", id: 640455 },
  { name: "David Peterson", id: 656849 },
  { name: "Jose Quintana", id: 500779 },
  { name: "Edwin Diaz", id: 621242 },
  { name: "Reed Garrett", id: 657585 },
  { name: "Jose Butto", id: 666149 },
  { name: "Luisangel Acuna", id: 682519 },
];

function getPlayerImageUrl(playerId: number): string {
  return `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${playerId}/headshot/67/current`;
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

    // Check if we already have predictions for today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingPredictions } = await supabase
      .from("daily_player_predictions")
      .select("*")
      .eq("prediction_date", today);

    if (existingPredictions && existingPredictions.length > 0) {
      return new Response(
        JSON.stringify({ 
          message: "Predictions already exist for today", 
          predictions: existingPredictions 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Select 4 random players for today's predictions
    const shuffled = [...metsPlayers].sort(() => 0.5 - Math.random());
    const selectedPlayers = shuffled.slice(0, 4);

    // Generate AI predictions for each player
    const prompt = `You are a Mets baseball analyst. For each of these Mets players, determine if they are currently "hot" or "cold" based on typical spring training performance patterns and provide a brief betting tip or prediction. Be realistic and vary between hot and cold.

Players: ${selectedPlayers.map(p => p.name).join(", ")}

Respond with ONLY a valid JSON array (no markdown, no extra text) in this exact format:
[
  {
    "name": "Player Name",
    "status": "hot" or "cold",
    "description": "Brief 1-2 sentence betting tip or prediction about this player's performance"
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
          { role: "system", content: "You are a knowledgeable Mets baseball analyst. Respond only with valid JSON." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (aiResponse.status === 402) {
        throw new Error("AI credits depleted. Please add credits.");
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("No content in AI response");
    }

    // Parse AI response - handle potential markdown formatting
    let predictions;
    try {
      // Remove markdown code blocks if present
      let cleanContent = aiContent.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      predictions = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      throw new Error("Failed to parse AI predictions");
    }

    // Delete old predictions (keep only last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    await supabase
      .from("daily_player_predictions")
      .delete()
      .lt("prediction_date", weekAgo.toISOString().split('T')[0]);

    // Insert new predictions with player images
    const predictionsToInsert = predictions.map((pred: any) => {
      const player = selectedPlayers.find(p => p.name.toLowerCase() === pred.name.toLowerCase());
      return {
        player_name: pred.name,
        player_id: player?.id,
        player_image_url: player ? getPlayerImageUrl(player.id) : null,
        status: pred.status.toLowerCase(),
        description: pred.description,
        prediction_date: today,
      };
    });

    const { data: insertedPredictions, error: insertError } = await supabase
      .from("daily_player_predictions")
      .insert(predictionsToInsert)
      .select();

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        message: "Predictions generated successfully", 
        predictions: insertedPredictions 
      }),
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
