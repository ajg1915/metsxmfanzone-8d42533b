import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Authentic fan feedback templates with varied tones
const feedbackTemplates = [
  // Enthusiastic fans
  { rating: 5, templates: [
    "Love this app! Finally a place where real Mets fans can connect. LGM! 🔶🔷",
    "Best Mets fan community I've found. The live streams are amazing!",
    "This is exactly what I've been looking for. Great content and even better community!",
    "5 stars all day! The podcast coverage is top notch. Keep it up!",
    "Amazing platform for us diehard Mets fans. Been using it daily!",
    "The highlights and news updates are so fast. Love staying connected with other fans!",
    "Finally found my people! This community gets what being a Mets fan is all about.",
    "Incredible work on this app. The streams are crystal clear and the vibes are immaculate!",
  ]},
  // Positive but specific
  { rating: 4, templates: [
    "Really enjoying the community posts. Great to see other fans' takes on the games.",
    "The lineup card feature is super useful on game days. Nice touch!",
    "Good content overall. Would love to see more prospect coverage but otherwise solid!",
    "Podcast episodes are always entertaining. Love the hot takes!",
    "Been a fan since '86 and this makes me feel connected to the younger generation of fans.",
    "The news tracker keeps me updated better than ESPN. Really appreciate it!",
    "Spring training coverage was excellent. Looking forward to the regular season!",
  ]},
  // Balanced feedback
  { rating: 4, templates: [
    "Great app for Mets fans. The community is what makes it special.",
    "Solid platform with good features. The streams are reliable.",
    "Nice to have a dedicated space for Mets discussion. Keep improving!",
    "Enjoying the content so far. The design is clean and easy to navigate.",
    "Good experience overall. Would recommend to other Mets fans for sure.",
  ]},
  // Appreciative newcomers
  { rating: 5, templates: [
    "Just discovered this and I'm hooked! Where has this been all my life?",
    "New here but already loving it. The fan energy is incredible!",
    "Signed up last week and haven't missed a day. Great community!",
    "My friend recommended this and it did not disappoint. LGM forever!",
    "First time posting but been lurking for weeks. You all are awesome!",
  ]},
];

// Fan names that feel authentic (diverse, realistic)
const displayNames = [
  "Mike from Queens", "Sarah M.", "CitiFieldRegular", "MetsFan1986", "BluOrangeTilIDie",
  "Flushing_Faithful", "JerseyMets", "Bobby S.", "LGM_Linda", "Shea_Memories",
  "Tom K.", "MetsMom22", "DiehardFromDay1", "AmazinArmy", "Queens_Native",
  "Lisa from LI", "ChrisNYC", "MetsForever86", "Frank_Flushing", "MrMetFanClub",
  "Jen M.", "StrawberryFieldsFan", "DavidWrightFan", "Doc_Era_Fan", "Piazza_Generation",
  "Maria_Mets", "CooperFam", "BrooklynMets", "Upstate_Orange", "DeGrom_Believer",
  "Pete_Alonso_Stan", "Lindor_Lover", "Nimmo_Nation", "Big_Apple_Baseball",
];

// Locations for authenticity
const locations = [
  "Queens, NY", "Brooklyn, NY", "Long Island", "Manhattan", "Bronx, NY",
  "Jersey City, NJ", "Hoboken, NJ", "Westchester, NY", "Staten Island",
  "Connecticut", "Flushing", "Astoria", "Bay Ridge", "Park Slope",
  null, null, null, // Some entries without location
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check how many feedbacks were generated today
    const today = new Date().toISOString().split("T")[0];
    const { count: todayCount } = await supabase
      .from("feedbacks")
      .select("*", { count: "exact", head: true })
      .gte("created_at", `${today}T00:00:00Z`)
      .like("display_name", "%"); // Only count ones with display names (auto-generated)

    // Generate 1-3 feedbacks per call (random)
    const feedbacksToGenerate = Math.floor(Math.random() * 3) + 1;
    const generatedFeedbacks = [];

    for (let i = 0; i < feedbacksToGenerate; i++) {
      // Select a random rating category (weighted toward positive)
      const ratingCategory = feedbackTemplates[Math.floor(Math.random() * feedbackTemplates.length)];
      const rating = ratingCategory.rating;
      
      // Select random template from that category
      const template = ratingCategory.templates[Math.floor(Math.random() * ratingCategory.templates.length)];
      
      // Select random display name and location
      const displayName = displayNames[Math.floor(Math.random() * displayNames.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];

      // Create a valid UUID for auto-generated feedback
      const autoUserId = crypto.randomUUID();

      // Insert feedback
      const { data, error } = await supabase
        .from("feedbacks")
        .insert({
          user_id: autoUserId,
          content: template,
          rating,
          display_name: displayName,
          location,
        })
        .select()
        .single();

      if (error) {
        console.error("Error inserting feedback:", error);
        continue;
      }

      generatedFeedbacks.push(data);
      console.log(`Generated feedback: "${template.substring(0, 50)}..." by ${displayName}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        generated: generatedFeedbacks.length,
        feedbacks: generatedFeedbacks,
        todayTotal: (todayCount || 0) + generatedFeedbacks.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating fan feedback:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
