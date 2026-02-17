import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin');
      if (!roles || roles.length === 0) {
        return new Response(JSON.stringify({ error: 'Admin access required' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    const { maxPages = 3 } = await req.json().catch(() => ({}));
    const allGames: any[] = [];

    // Scrape listing pages
    for (let page = 1; page <= maxPages; page++) {
      const url = page === 1
        ? 'https://mlblive.net/new-york-mets-full-game-replay'
        : `https://mlblive.net/new-york-mets-full-game-replay?page${page}`;
      
      console.log(`Fetching listing page ${page}: ${url}`);
      const res = await fetch(url);
      const html = await res.text();

      // Extract game entries from listing page
      // Pattern: <a href="URL"><img src="THUMB"></a> ... <h1 or h3>TITLE</h1/3>
      const gamePattern = /href="(https:\/\/mlblive\.net\/[^"]*full-game-replay[^"]*)"[^>]*>\s*<img\s+src="([^"]+)"/g;
      let match;
      const seenUrls = new Set<string>();
      
      while ((match = gamePattern.exec(html)) !== null) {
        const gameUrl = match[1];
        const thumbnail = match[2];
        if (seenUrls.has(gameUrl)) continue;
        seenUrls.add(gameUrl);
        allGames.push({ sourceUrl: gameUrl, thumbnail });
      }
    }

    console.log(`Found ${allGames.length} games from listing pages`);

    // For each game, fetch the page and extract the ok.ru embed URL
    const results: any[] = [];
    for (const game of allGames) {
      try {
        console.log(`Fetching game page: ${game.sourceUrl}`);
        const res = await fetch(game.sourceUrl);
        const html = await res.text();

        // Extract title from h1
        const titleMatch = html.match(/<h1[^>]*class="h_title"[^>]*>([^<]+)<\/h1>/);
        const title = titleMatch ? titleMatch[1].trim() : 'Unknown Game';

        // Extract ok.ru embed URL
        const embedMatch = html.match(/src="(https:\/\/ok\.ru\/videoembed\/[^"]+)"/);
        if (!embedMatch) {
          console.log(`No ok.ru embed found for: ${title}`);
          continue;
        }
        const embedUrl = embedMatch[1];

        // Extract date from title (e.g., "September 28, 2025")
        const dateMatch = title.match(/(\w+ \d{1,2},?\s*\d{4})/);
        let gameDate = null;
        if (dateMatch) {
          const parsed = new Date(dateMatch[1]);
          if (!isNaN(parsed.getTime())) {
            gameDate = parsed.toISOString().split('T')[0];
          }
        }

        // Extract description
        const descMatch = html.match(/(\d{4}\s+MLB\s+\w+\s+Season)/i);
        const description = descMatch ? descMatch[0] : null;

        results.push({
          title: title.replace(/\s+/g, ' ').trim(),
          thumbnail_url: game.thumbnail,
          embed_url: embedUrl,
          game_date: gameDate,
          source_url: game.sourceUrl,
          description,
        });
      } catch (err) {
        console.error(`Error fetching game page ${game.sourceUrl}:`, err);
      }
    }

    console.log(`Successfully extracted ${results.length} games with embeds`);

    // Upsert into database (avoid duplicates by source_url)
    let inserted = 0;
    for (const game of results) {
      // Check if already exists
      const { data: existing } = await supabase
        .from('replay_games')
        .select('id')
        .eq('source_url', game.source_url)
        .maybeSingle();
      
      if (existing) {
        // Update
        await supabase.from('replay_games').update(game).eq('id', existing.id);
      } else {
        // Insert
        const { error } = await supabase.from('replay_games').insert(game);
        if (!error) inserted++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      total_found: allGames.length,
      total_with_embeds: results.length,
      newly_inserted: inserted,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Scrape error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
