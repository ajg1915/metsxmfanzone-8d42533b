import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckAIContentRequest {
  content: string;
  title: string;
}

interface AICheckResult {
  isAIGenerated: boolean;
  isPlagiarized: boolean;
  confidence: number;
  reasons: string[];
  citations: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, title }: CheckAIContentRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!content || content.length < 50) {
      return new Response(
        JSON.stringify({ error: "Content too short to analyze" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Checking AI content for article: ${title}`);

    const systemPrompt = `You are an expert content authenticity analyzer. Your job is to detect:
1. AI-generated content (written by ChatGPT, Claude, Gemini, or other AI models)
2. Plagiarized content (copied from other sources without attribution)
3. Missing citations or unsourced quotes

Analyze the provided article content and determine:
- Whether it appears to be AI-generated based on writing patterns, structure, and style
- Whether it contains plagiarized or unoriginal content
- Whether any quotes or data need citations that are missing

You MUST respond with a JSON object using this exact format:
{
  "isAIGenerated": boolean,
  "isPlagiarized": boolean,
  "confidence": number (0-100),
  "reasons": ["reason1", "reason2"],
  "citations": ["any quotes or claims that need sourcing"]
}

Look for these AI indicators:
- Overly perfect grammar and structure
- Generic phrases like "In conclusion", "It's important to note"
- Lack of personal voice or unique perspective
- Repetitive sentence structures
- Over-explanation of simple concepts
- Hedging language like "may", "might", "could potentially"
- Lists that feel artificially constructed
- Lack of specific examples or personal experiences
- Generic sports analysis without unique insights`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Analyze this article titled "${title}":\n\n${content.substring(0, 8000)}` 
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service payment required." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    console.log("AI response:", aiResponse);

    // Parse the JSON response
    let result: AICheckResult;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Default to safe values if parsing fails
      result = {
        isAIGenerated: false,
        isPlagiarized: false,
        confidence: 0,
        reasons: ["Unable to analyze content"],
        citations: []
      };
    }

    console.log("AI check result:", result);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in check-ai-content:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to check content" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
