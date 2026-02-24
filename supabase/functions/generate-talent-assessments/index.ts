import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const METS_TEAM_ID = 121;

// Get the start of the current month (1st)
const getMonthStartDate = (date: Date = new Date()): string => {
  const d = new Date(date);
  d.setDate(1);
  return d.toISOString().split("T")[0];
};

const getPlayerImageUrl = (playerId: number): string => {
  return `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${playerId}/headshot/67/current`;
};

const fetchMetsRoster = async (): Promise<any[]> => {
  try {
    const response = await fetch(
      `https://statsapi.mlb.com/api/v1/teams/${METS_TEAM_ID}/roster/40Man`
    );
    if (!response.ok) throw new Error("Failed to fetch roster");
    const data = await response.json();
    return data.roster || [];
  } catch (error) {
    console.error("Error fetching roster:", error);
    // Fallback to current 2026 Mets roster
    return [
      { person: { id: 596019, fullName: "Francisco Lindor" }, position: { abbreviation: "SS" } },
      { person: { id: 665742, fullName: "Juan Soto" }, position: { abbreviation: "RF" } },
      { person: { id: 668901, fullName: "Mark Vientos" }, position: { abbreviation: "3B" } },
      { person: { id: 682626, fullName: "Francisco Alvarez" }, position: { abbreviation: "C" } },
      { person: { id: 543760, fullName: "Marcus Semien" }, position: { abbreviation: "2B" } },
      { person: { id: 666182, fullName: "Bo Bichette" }, position: { abbreviation: "SS" } },
      { person: { id: 673357, fullName: "Luis Robert Jr." }, position: { abbreviation: "OF" } },
      { person: { id: 669004, fullName: "MJ Melendez" }, position: { abbreviation: "OF" } },
      { person: { id: 683146, fullName: "Brett Baty" }, position: { abbreviation: "3B" } },
      { person: { id: 593871, fullName: "Jorge Polanco" }, position: { abbreviation: "IF" } },
      { person: { id: 677595, fullName: "Ronny Mauricio" }, position: { abbreviation: "IF" } },
      { person: { id: 621438, fullName: "Tyrone Taylor" }, position: { abbreviation: "OF" } },
      { person: { id: 660644, fullName: "Vidal Brujan" }, position: { abbreviation: "IF" } },
      { person: { id: 663584, fullName: "Hayden Senger" }, position: { abbreviation: "C" } },
      { person: { id: 620443, fullName: "Luis Torrens" }, position: { abbreviation: "C" } },
      { person: { id: 703492, fullName: "Nick Morabito" }, position: { abbreviation: "OF" } },
      { person: { id: 676724, fullName: "Jared Young" }, position: { abbreviation: "1B" } },
      { person: { id: 673540, fullName: "Kodai Senga" }, position: { abbreviation: "SP" } },
      { person: { id: 640455, fullName: "Sean Manaea" }, position: { abbreviation: "SP" } },
      { person: { id: 656849, fullName: "David Peterson" }, position: { abbreviation: "SP" } },
      { person: { id: 605280, fullName: "Clay Holmes" }, position: { abbreviation: "SP" } },
      { person: { id: 642547, fullName: "Freddy Peralta" }, position: { abbreviation: "SP" } },
      { person: { id: 681035, fullName: "Christian Scott" }, position: { abbreviation: "SP" } },
      { person: { id: 668964, fullName: "Tobias Myers" }, position: { abbreviation: "SP" } },
      { person: { id: 804636, fullName: "Jonah Tong" }, position: { abbreviation: "SP" } },
      { person: { id: 642207, fullName: "Devin Williams" }, position: { abbreviation: "CL" } },
      { person: { id: 596133, fullName: "Luke Weaver" }, position: { abbreviation: "RP" } },
      { person: { id: 621345, fullName: "A.J. Minter" }, position: { abbreviation: "RP" } },
      { person: { id: 673380, fullName: "Dedniel Núñez" }, position: { abbreviation: "RP" } },
      { person: { id: 548384, fullName: "Brooks Raley" }, position: { abbreviation: "RP" } },
      { person: { id: 623211, fullName: "Huascar Brazobán" }, position: { abbreviation: "RP" } },
      { person: { id: 690997, fullName: "Nolan McLean" }, position: { abbreviation: "RP" } },
      { person: { id: 692024, fullName: "Alex Carrillo" }, position: { abbreviation: "RP" } },
      { person: { id: 472610, fullName: "Luis Garcia" }, position: { abbreviation: "RP" } },
      { person: { id: 680702, fullName: "Joey Gerber" }, position: { abbreviation: "RP" } },
      { person: { id: 663795, fullName: "Justin Hagenman" }, position: { abbreviation: "RP" } },
      { person: { id: 663542, fullName: "Bryan Hudson" }, position: { abbreviation: "RP" } },
      { person: { id: 702752, fullName: "Jonathan Pintaro" }, position: { abbreviation: "RP" } },
      { person: { id: 697811, fullName: "Dylan Ross" }, position: { abbreviation: "RP" } },
      { person: { id: 681810, fullName: "Austin Warren" }, position: { abbreviation: "RP" } },
    ];
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { forceRegenerate } = await req.json().catch(() => ({}));
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY") ?? "";
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Use month start date instead of weekly
    const monthStart = getMonthStartDate();
    
    // Check if we already have assessments for this month
    const { data: existingAssessments } = await supabase
      .from("daily_talent_assessments")
      .select("id")
      .eq("assessment_date", monthStart)
      .limit(1);
    
    if (existingAssessments && existingAssessments.length > 0 && !forceRegenerate) {
      return new Response(
        JSON.stringify({ message: "Assessments already exist for this month", monthStart, skipped: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Delete existing assessments if regenerating
    if (forceRegenerate) {
      await supabase
        .from("daily_talent_assessments")
        .delete()
        .eq("assessment_date", monthStart);
    }
    
    // Fetch roster and select 6 random players
    const roster = await fetchMetsRoster();
    const shuffled = roster.sort(() => 0.5 - Math.random());
    const selectedPlayers = shuffled.slice(0, 6);
    
    const playerList = selectedPlayers.map(p => ({
      name: p.person?.fullName || "Unknown",
      id: p.person?.id,
      position: p.position?.abbreviation || "UTIL"
    }));
    
    const prompt = `You are Anthony, a passionate New York Mets fan and baseball analyst for MetsXMFanZone. Generate monthly talent assessments for the 2026 Mets season for these 6 players:

${playerList.map((p, i) => `${i + 1}. ${p.name} (${p.position})`).join("\n")}

For each player, provide:
1. An overall letter grade (A+, A, A-, B+, B, B-, C+, C, C-, D, F)
2. Tool grades for position players: hitting, fielding, power, speed
3. Tool grades for pitchers: pitching, arm (velocity/stuff)
4. A short, opinionated take (2-3 sentences) on their monthly outlook - be bold, passionate, and fan-focused

Use the tool to return the structured data. Be realistic but hopeful as a Mets fan would be. Mix in some hot takes!`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a passionate Mets fan analyst. Return structured player assessments." },
          { role: "user", content: prompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_talent_assessments",
              description: "Submit monthly talent assessments for 6 Mets players",
              parameters: {
                type: "object",
                properties: {
                  assessments: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        player_name: { type: "string" },
                        position: { type: "string" },
                        overall_grade: { type: "string", enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"] },
                        hitting_grade: { type: "string", enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F", null] },
                        fielding_grade: { type: "string", enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F", null] },
                        power_grade: { type: "string", enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F", null] },
                        speed_grade: { type: "string", enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F", null] },
                        arm_grade: { type: "string", enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F", null] },
                        pitching_grade: { type: "string", enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F", null] },
                        opinion: { type: "string" }
                      },
                      required: ["player_name", "position", "overall_grade", "opinion"]
                    }
                  }
                },
                required: ["assessments"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "submit_talent_assessments" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("No tool call response from AI");
    }

    const assessmentsData = JSON.parse(toolCall.function.arguments);
    const assessments = assessmentsData.assessments;

    // Map player IDs and images
    const assessmentsToInsert = assessments.map((assessment: any, index: number) => {
      const playerInfo = playerList[index];
      return {
        player_name: assessment.player_name || playerInfo.name,
        player_id: playerInfo.id,
        player_image_url: getPlayerImageUrl(playerInfo.id),
        position: assessment.position || playerInfo.position,
        overall_grade: assessment.overall_grade,
        hitting_grade: assessment.hitting_grade || null,
        fielding_grade: assessment.fielding_grade || null,
        power_grade: assessment.power_grade || null,
        speed_grade: assessment.speed_grade || null,
        arm_grade: assessment.arm_grade || null,
        pitching_grade: assessment.pitching_grade || null,
        opinion: assessment.opinion,
        assessment_date: monthStart, // Use month start date
      };
    });

    // Delete old assessments (older than 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    await supabase
      .from("daily_talent_assessments")
      .delete()
      .lt("assessment_date", fourWeeksAgo.toISOString().split("T")[0]);

    // Insert new assessments
    const { error: insertError } = await supabase
      .from("daily_talent_assessments")
      .insert(assessmentsToInsert);

    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Monthly talent assessments generated successfully",
        monthStart,
        count: assessmentsToInsert.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating talent assessments:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
