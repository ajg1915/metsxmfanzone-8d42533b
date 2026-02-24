import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!lovableKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { count = 3 } = await req.json().catch(() => ({ count: 3 }));

    // 1. Gather content from all sources
    const [blogRes, streamsRes, podcastRes, newsRes] = await Promise.all([
      supabase.from("blog_posts").select("id, title, excerpt, slug, featured_image_url, category").eq("published", true).order("published_at", { ascending: false }).limit(5),
      supabase.from("live_streams").select("id, title, description, status, thumbnail_url").eq("published", true).order("created_at", { ascending: false }).limit(5),
      supabase.from("podcast_shows").select("id, title, description, show_date, thumbnail_url").eq("published", true).order("show_date", { ascending: false }).limit(5),
      supabase.from("mets_news_tracker").select("id, title, details, player, type, image_url").eq("published", true).order("created_at", { ascending: false }).limit(5),
    ]);

    const contentSummary = {
      blogs: (blogRes.data || []).map(b => `"${b.title}" - ${b.excerpt || b.category}`).join("\n"),
      streams: (streamsRes.data || []).map(s => `"${s.title}" (${s.status}) - ${s.description || ""}`).join("\n"),
      podcasts: (podcastRes.data || []).map(p => `"${p.title}" - ${p.description || ""}`).join("\n"),
      news: (newsRes.data || []).map(n => `"${n.title}" about ${n.player} - ${n.details}`).join("\n"),
    };

    // 2. Generate slide content via Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are MetsXMFanZone.com's marketing AI. Generate hero slide content designed to convert visitors into members. The brand is a Mets fan community platform with live streaming, podcasts, news, and community features. Pricing: Free Spring Training access, then $12.99/mo for premium. Tone: passionate, energetic, authentic NY Mets fan voice. Always use action-oriented CTAs.`
          },
          {
            role: "user",
            content: `Based on this current MetsXMFanZone content, generate exactly ${count} hero slides as JSON array. Each slide needs: title (max 6 words, bold/uppercase style), description (max 25 words, compelling), link_url (relevant page on the site), link_text (CTA text, max 3 words), show_watch_live (boolean, true if streaming related), is_for_members (boolean, false for conversion slides targeting non-members), image_prompt (detailed prompt to generate a branded Mets-themed hero image for this slide, include "New York Mets" "blue and orange" "MetsXMFanZone" in the prompt, cinematic style, 16:9 aspect ratio).

Available content:
BLOG POSTS:
${contentSummary.blogs || "No recent blogs"}

LIVE STREAMS:
${contentSummary.streams || "No active streams"}

PODCASTS:
${contentSummary.podcasts || "No recent podcasts"}

NEWS:
${contentSummary.news || "No recent news"}

Valid link_url values: /auth (signup), /pricing (plans), /metsxmfanzone-tv (streams), /podcast (podcasts), /blog (blog), /community (community), /mets-roster (roster)

Return ONLY a valid JSON array, no markdown.`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_hero_slides",
            description: "Create hero slides for the website",
            parameters: {
              type: "object",
              properties: {
                slides: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      link_url: { type: "string" },
                      link_text: { type: "string" },
                      show_watch_live: { type: "boolean" },
                      is_for_members: { type: "boolean" },
                      image_prompt: { type: "string" },
                    },
                    required: ["title", "description", "link_url", "link_text", "show_watch_live", "is_for_members", "image_prompt"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["slides"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_hero_slides" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");
    
    const { slides } = JSON.parse(toolCall.function.arguments);
    if (!slides?.length) throw new Error("No slides generated");

    console.log(`Generated ${slides.length} slide concepts`);

    // 3. Generate AI images for each slide
    const generatedSlides = [];
    for (const slide of slides) {
      let imageUrl: string | null = null;

      try {
        const imgResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{
              role: "user",
              content: `${slide.image_prompt}. Ultra high resolution, 16:9 aspect ratio hero banner image. Cinematic lighting, professional sports broadcast quality. No text overlays.`,
            }],
            modalities: ["image", "text"],
          }),
        });

        if (imgResponse.ok) {
          const imgData = await imgResponse.json();
          const base64Image = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          
          if (base64Image) {
            // Upload to storage
            const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
            const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            const fileName = `ai-hero-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
            
            const { error: uploadError } = await supabase.storage
              .from("content_uploads")
              .upload(fileName, imageBytes, { contentType: "image/png", upsert: true });
            
            if (!uploadError) {
              const { data: urlData } = supabase.storage.from("content_uploads").getPublicUrl(fileName);
              imageUrl = urlData.publicUrl;
              console.log(`Image uploaded: ${fileName}`);
            } else {
              console.error("Upload error:", uploadError);
            }
          }
        } else {
          console.error("Image gen error:", imgResponse.status);
        }
      } catch (imgErr) {
        console.error("Image generation failed:", imgErr);
      }

      // 4. Get max display_order
      const { data: maxOrder } = await supabase
        .from("hero_slides")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1);
      const nextOrder = ((maxOrder?.[0]?.display_order) || 0) + 1;

      // 5. Insert into hero_slides
      const { data: inserted, error: insertError } = await supabase
        .from("hero_slides")
        .insert({
          title: slide.title,
          description: slide.description,
          image_url: imageUrl,
          link_url: slide.link_url,
          link_text: slide.link_text,
          show_watch_live: slide.show_watch_live,
          is_for_members: slide.is_for_members,
          published: true,
          display_order: nextOrder,
          is_ai_generated: true,
          ai_source_type: "auto",
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
      } else {
        generatedSlides.push(inserted);
        console.log(`Slide inserted: "${slide.title}"`);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      slides_generated: generatedSlides.length,
      slides: generatedSlides 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
