import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SHOW_TITLES = [
  "🔥 Hot Stove Report Live",
  "⚾ Mets Daily Rundown",
  "🎙️ The FanZone Hour",
  "📊 Stats & Analysis Live",
  "🏟️ Citi Field Insider",
  "⭐ Mets Star Watch",
  "📢 Fan Mailbag Show",
  "🎯 Predictions & Picks",
];

const SHOW_DESCRIPTIONS = [
  "Join us for live Mets analysis, hot takes, and fan interaction!",
  "Breaking down all the latest Mets news and roster updates.",
  "Your daily dose of Mets content with special guest appearances.",
  "Pre-game predictions, lineup analysis, and betting insights.",
  "Exclusive insider reports from Citi Field and the Mets clubhouse.",
  "Spotlight on the top Mets players and their recent performances.",
  "We answer YOUR questions and read fan mail live on air!",
  "Bold predictions and game picks for the upcoming matchups.",
];

const GRADIENTS = [
  "from-[#002D72] via-[#003087] to-[#FF5910]",
  "from-[#FF5910] via-[#FF8C00] to-[#FFD700]",
  "from-[#002D72] via-[#0047AB] to-[#6495ED]",
  "from-[#6366f1] via-[#8b5cf6] to-[#a855f7]",
  "from-[#10b981] via-[#059669] to-[#047857]",
  "from-[#f59e0b] via-[#d97706] to-[#b45309]",
  "from-[#ef4444] via-[#dc2626] to-[#b91c1c]",
  "from-[#3b82f6] via-[#2563eb] to-[#1d4ed8]",
];

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

    // Get the start of next week (or current week if early in the week)
    const now = new Date();
    const currentDay = now.getDay();
    
    // Schedule days: Monday (1), Tuesday (2), Friday (5), Saturday (6), Sunday (0)
    const scheduleDays = [1, 2, 5, 6, 0];
    const showsToCreate = [];

    // Generate shows for the next 7 days
    for (let i = 0; i < 14; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();

      if (scheduleDays.includes(dayOfWeek)) {
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        // Set time: Weekends at 2:00 PM, Weekdays at 5:30 PM
        date.setHours(isWeekend ? 14 : 17, isWeekend ? 0 : 30, 0, 0);

        // Only add shows in the future
        if (date > now) {
          const showIndex: number = showsToCreate.length;
          showsToCreate.push({
            title: SHOW_TITLES[showIndex % SHOW_TITLES.length],
            description: SHOW_DESCRIPTIONS[showIndex % SHOW_DESCRIPTIONS.length],
            show_date: date.toISOString(),
            show_type: isWeekend ? "weekend" : "regular",
            thumbnail_gradient: GRADIENTS[showIndex % GRADIENTS.length],
            thumbnail_url: null,
            is_featured: showIndex === 0,
            is_live: false,
            published: true,
          });
        }
      }
    }

    console.log(`Generated ${showsToCreate.length} shows for the next 2 weeks`);

    // Check for existing shows in the date range to avoid duplicates
    const startDate = now.toISOString();
    const endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const { data: existingShows } = await supabase
      .from("podcast_shows")
      .select("show_date")
      .gte("show_date", startDate)
      .lte("show_date", endDate);

    // Filter out shows that already exist (within 1 hour of each other)
    const existingDates = new Set(
      (existingShows || []).map((s) => new Date(s.show_date).toDateString())
    );

    const newShows = showsToCreate.filter(
      (show) => !existingDates.has(new Date(show.show_date).toDateString())
    );

    if (newShows.length === 0) {
      console.log("No new shows to create - all dates already have shows");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No new shows needed - schedule is up to date",
          existingShows: existingShows?.length || 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert new shows
    const { data: insertedShows, error: insertError } = await supabase
      .from("podcast_shows")
      .insert(newShows)
      .select();

    if (insertError) {
      console.error("Error inserting shows:", insertError);
      throw insertError;
    }

    console.log(`Successfully created ${insertedShows?.length || 0} new shows`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${insertedShows?.length || 0} new podcast shows`,
        shows: insertedShows,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating weekly podcast shows:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
