import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ESPNArticle {
  headline: string;
  description?: string;
  published: string;
  images?: Array<{ url: string; caption?: string }>;
  links?: { web?: { href: string } };
  type?: string;
  categories?: Array<{ description?: string; type?: string }>;
}

interface ESPNResponse {
  articles?: ESPNArticle[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fetching Mets news from ESPN API...");
    
    // Fetch Mets team news from ESPN API
    const newsUrl = "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/nym/news";
    const newsResponse = await fetch(newsUrl);
    
    if (!newsResponse.ok) {
      console.error("ESPN API error:", newsResponse.status, newsResponse.statusText);
      throw new Error(`ESPN API error: ${newsResponse.status}`);
    }

    const newsData: ESPNResponse = await newsResponse.json();
    console.log("ESPN API response received, articles count:", newsData.articles?.length || 0);

    // Also fetch transactions from ESPN
    const transactionsUrl = "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/news";
    const transactionsResponse = await fetch(transactionsUrl);
    let transactionsData: ESPNResponse = { articles: [] };
    
    if (transactionsResponse.ok) {
      transactionsData = await transactionsResponse.json();
      console.log("MLB general news fetched, articles count:", transactionsData.articles?.length || 0);
    }

    // Filter for Mets-related articles from general MLB news
    const metsKeywords = ['mets', 'new york mets', 'nym', 'citi field'];
    const metsTransactions = transactionsData.articles?.filter(article => {
      const headline = article.headline?.toLowerCase() || '';
      const description = article.description?.toLowerCase() || '';
      return metsKeywords.some(keyword => 
        headline.includes(keyword) || description.includes(keyword)
      );
    }) || [];

    // Combine and deduplicate articles
    const allArticles = [...(newsData.articles || []), ...metsTransactions];
    const uniqueArticles = allArticles.reduce((acc: ESPNArticle[], article) => {
      if (!acc.find(a => a.headline === article.headline)) {
        acc.push(article);
      }
      return acc;
    }, []);

    // Transform ESPN data to our format
    const transformedNews = uniqueArticles.slice(0, 10).map((article, index) => {
      // Determine type based on article content
      const headline = article.headline?.toLowerCase() || '';
      const description = article.description?.toLowerCase() || '';
      
      let type: "signing" | "traded" | "news" | "injury" = "news";
      if (headline.includes('sign') || headline.includes('agree') || headline.includes('contract')) {
        type = "signing";
      } else if (headline.includes('trade') || headline.includes('acquire') || headline.includes('dealt')) {
        type = "traded";
      } else if (headline.includes('injur') || headline.includes('il') || headline.includes('hurt')) {
        type = "injury";
      }

      // Calculate time ago
      const publishedDate = new Date(article.published);
      const now = new Date();
      const diffMs = now.getTime() - publishedDate.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      
      let timeAgo = "Just now";
      if (diffDays > 0) {
        timeAgo = diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
      } else if (diffHours > 0) {
        timeAgo = diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
      }

      // Get image URL
      const imageUrl = article.images?.[0]?.url || 
        "https://a.espncdn.com/i/teamlogos/mlb/500/nym.png";

      // Extract player name from headline if possible
      let player = "New York Mets";
      const playerMatch = headline.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/);
      if (playerMatch) {
        player = playerMatch[1];
      }

      return {
        id: `espn-${index}-${publishedDate.getTime()}`,
        type,
        title: article.headline || "Mets News Update",
        player,
        details: article.description || "",
        time_ago: timeAgo,
        image_url: imageUrl,
        link: article.links?.web?.href || null,
        published_at: article.published,
      };
    });

    console.log("Transformed news items:", transformedNews.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        news: transformedNews,
        fetched_at: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching Mets news:", errorMessage);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        news: []
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
