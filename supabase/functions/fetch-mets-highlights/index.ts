import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MLBHighlight {
  id: string;
  type: string;
  headline: string;
  blurb: string;
  description: string;
  duration: string;
  image: {
    cuts: Array<{
      aspectRatio: string;
      width: number;
      height: number;
      src: string;
    }>;
  };
  playbacks: Array<{
    name: string;
    url: string;
  }>;
}

interface MLBGame {
  gamePk: number;
  gameDate: string;
  teams: {
    away: { team: { id: number; name: string } };
    home: { team: { id: number; name: string } };
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for optional parameters
    let year = 2025; // Default to previous season for off-season
    let lookbackDays = 30;
    
    try {
      const body = await req.json();
      year = body.year || year;
      lookbackDays = body.lookbackDays || lookbackDays;
    } catch {
      // Use defaults if no body
    }

    const METS_TEAM_ID = 121;
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Determine date range based on whether we're in-season or off-season
    let startDate: string;
    let endDate: string;
    
    // If current month is Jan-Feb or Nov-Dec, we're in off-season
    const currentMonth = today.getMonth() + 1;
    const isOffSeason = currentMonth <= 2 || currentMonth >= 11;
    
    if (isOffSeason && year === currentYear) {
      // Use previous season's dates
      startDate = `${currentYear - 1}-09-01`;
      endDate = `${currentYear - 1}-11-15`;
      console.log('Off-season detected, fetching from previous season');
    } else if (year !== currentYear) {
      // Fetch from specified year's season
      startDate = `${year}-03-01`;
      endDate = `${year}-11-15`;
    } else {
      // In-season: look back specified days
      const start = new Date(today);
      start.setDate(today.getDate() - lookbackDays);
      startDate = start.toISOString().split('T')[0];
      endDate = today.toISOString().split('T')[0];
    }

    // Step 1: Get Mets games from the date range
    const scheduleUrl = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${METS_TEAM_ID}&startDate=${startDate}&endDate=${endDate}`;
    console.log('Fetching Mets schedule:', scheduleUrl);
    
    const scheduleResponse = await fetch(scheduleUrl);
    if (!scheduleResponse.ok) {
      throw new Error(`Failed to fetch schedule: ${scheduleResponse.status}`);
    }
    
    const scheduleData = await scheduleResponse.json();
    const games: MLBGame[] = [];
    
    if (scheduleData.dates) {
      for (const dateEntry of scheduleData.dates) {
        for (const game of dateEntry.games) {
          if (game.status?.abstractGameState === 'Final') {
            games.push(game);
          }
        }
      }
    }

    console.log(`Found ${games.length} completed Mets games`);

    if (games.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No recent completed games found', highlights: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Fetch highlights for each game
    const allHighlights: any[] = [];
    
    for (const game of games.slice(0, 5)) { // Limit to 5 most recent games
      const gamePk = game.gamePk;
      const contentUrl = `https://statsapi.mlb.com/api/v1.1/game/${gamePk}/content`;
      console.log(`Fetching highlights for game ${gamePk}:`, contentUrl);
      
      try {
        const contentResponse = await fetch(contentUrl);
        if (!contentResponse.ok) {
          console.error(`Failed to fetch content for game ${gamePk}: ${contentResponse.status}`);
          continue;
        }
        
        const contentData = await contentResponse.json();
        const highlights = contentData?.highlights?.highlights?.items || [];
        
        for (const highlight of highlights) {
          // Find the best video playback (prefer mp4)
          const mp4Playback = highlight.playbacks?.find((p: any) => 
            p.name === 'mp4Avc' || p.name === 'FLASH_2500K_1280X720' || p.name?.includes('mp4')
          ) || highlight.playbacks?.[0];
          
          // Find the best thumbnail
          const thumbnail = highlight.image?.cuts?.find((c: any) => c.aspectRatio === '16:9' && c.width >= 640);
          
          if (mp4Playback?.url) {
            // Parse duration string (e.g., "00:00:32") to seconds
            let durationSeconds = null;
            if (highlight.duration) {
              const parts = highlight.duration.split(':').map(Number);
              if (parts.length === 3) {
                durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
              } else if (parts.length === 2) {
                durationSeconds = parts[0] * 60 + parts[1];
              }
            }
            
            // Determine opponent
            const isHome = game.teams.home.team.id === METS_TEAM_ID;
            const opponent = isHome ? game.teams.away.team.name : game.teams.home.team.name;
            
            allHighlights.push({
              mlb_id: highlight.id || `${gamePk}-${allHighlights.length}`,
              title: highlight.headline || highlight.title || 'Mets Highlight',
              description: highlight.blurb || highlight.description || '',
              video_url: mp4Playback.url,
              thumbnail_url: thumbnail?.src || highlight.image?.cuts?.[0]?.src || null,
              duration: durationSeconds,
              game_pk: gamePk,
              game_date: game.gameDate,
              opponent: opponent,
              category: 'mlb_highlight'
            });
          }
        }
      } catch (err) {
        console.error(`Error processing game ${gamePk}:`, err);
      }
    }

    console.log(`Total highlights found: ${allHighlights.length}`);

    // Step 3: Store highlights in database (upsert to avoid duplicates)
    const storedHighlights: any[] = [];
    
    for (const highlight of allHighlights.slice(0, 20)) { // Limit to 20 highlights
      // Check if this MLB highlight already exists
      const { data: existing } = await supabase
        .from('videos')
        .select('id')
        .eq('video_url', highlight.video_url)
        .single();
      
      if (existing) {
        console.log(`Highlight already exists: ${highlight.title}`);
        storedHighlights.push({ ...highlight, id: existing.id, status: 'existing' });
        continue;
      }
      
      // Insert new highlight
      const { data: inserted, error } = await supabase
        .from('videos')
        .insert({
          title: highlight.title,
          description: highlight.description,
          video_url: highlight.video_url,
          thumbnail_url: highlight.thumbnail_url,
          duration: highlight.duration,
          video_type: 'highlight',
          category: 'MLB Highlights',
          published: true,
          published_at: highlight.game_date,
          views: 0
        })
        .select()
        .single();
      
      if (error) {
        console.error(`Error inserting highlight: ${error.message}`);
      } else {
        console.log(`Inserted highlight: ${highlight.title}`);
        storedHighlights.push({ ...inserted, status: 'new' });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${allHighlights.length} highlights, stored ${storedHighlights.filter(h => h.status === 'new').length} new`,
        highlights: storedHighlights,
        gamesProcessed: games.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching Mets highlights:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
