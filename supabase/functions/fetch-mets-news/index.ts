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

interface TransactionItem {
  id: string;
  type: "signing" | "traded" | "news" | "injury";
  title: string;
  player: string;
  details: string;
  time_ago: string;
  image_url: string;
  link: string | null;
  published_at: string;
  is_mets_related: boolean;
}

// Fetch Mets transactions from ESPN
async function fetchMetsTransactions(): Promise<TransactionItem[]> {
  const transactions: TransactionItem[] = [];
  
  try {
    console.log("Fetching Mets transactions from ESPN...");
    
    // ESPN Mets transactions endpoint
    const response = await fetch("https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/21/roster/transactions");
    
    if (response.ok) {
      const data = await response.json();
      console.log("Transactions data received:", JSON.stringify(data).substring(0, 500));
      
      const items = data.items || data.transactions || [];
      
      for (let i = 0; i < Math.min(items.length, 6); i++) {
        const item = items[i];
        const description = item.description || item.text || item.longDescription || "";
        const date = item.date || new Date().toISOString();
        
        // Determine transaction type
        let type: "signing" | "traded" | "news" | "injury" = "news";
        const descLower = description.toLowerCase();
        if (descLower.includes('sign') || descLower.includes('contract') || descLower.includes('extension')) {
          type = "signing";
        } else if (descLower.includes('trade') || descLower.includes('acquire') || descLower.includes('designat')) {
          type = "traded";
        } else if (descLower.includes('injur') || descLower.includes('il ') || descLower.includes('disabled')) {
          type = "injury";
        }

        // Calculate time ago
        const publishedDate = new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - publishedDate.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        let timeAgo = "Recently";
        if (diffDays > 0) {
          timeAgo = diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
        } else if (diffHours > 0) {
          timeAgo = diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
        }

        transactions.push({
          id: `transaction-${i}-${publishedDate.getTime()}`,
          type,
          title: description.length > 80 ? description.substring(0, 77) + "..." : description,
          player: "New York Mets",
          details: description,
          time_ago: timeAgo,
          image_url: "https://a.espncdn.com/i/teamlogos/mlb/500/nym.png",
          link: "https://www.mlb.com/mets/roster/transactions",
          published_at: date,
          is_mets_related: true,
        });
      }
    }
  } catch (e) {
    console.log("Error fetching Mets transactions:", e);
  }
  
  return transactions;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fetching Mets news from ESPN API...");
    
    const allArticles: ESPNArticle[] = [];
    
    // Try Mets-specific endpoints first
    const metsEndpoints = [
      "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/21/news",
      "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/nym/news"
    ];
    
    for (const url of metsEndpoints) {
      try {
        console.log(`Fetching from: ${url}`);
        const response = await fetch(url);
        
        if (response.ok) {
          const data: ESPNResponse = await response.json();
          const articles = data.articles || [];
          console.log(`Received ${articles.length} articles from ${url}`);
          allArticles.push(...articles);
        }
      } catch (e) {
        console.log(`Error fetching from ${url}:`, e);
      }
    }

    // Also fetch MLB general news - multiple endpoints for more coverage
    console.log("Fetching MLB general news...");
    const mlbEndpoints = [
      "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/news",
      "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/news?limit=25"
    ];
    
    for (const url of mlbEndpoints) {
      try {
        console.log(`Fetching from: ${url}`);
        const mlbResponse = await fetch(url);
        if (mlbResponse.ok) {
          const mlbData: ESPNResponse = await mlbResponse.json();
          const mlbArticles = mlbData.articles || [];
          console.log(`Received ${mlbArticles.length} articles from ${url}`);
          
          // Add MLB articles that aren't duplicates
          for (const article of mlbArticles) {
            if (!allArticles.find(a => a.headline === article.headline)) {
              allArticles.push(article);
            }
          }
        }
      } catch (e) {
        console.log(`Error fetching from ${url}:`, e);
      }
    }

    console.log(`Total articles collected: ${allArticles.length}`);

    // Deduplicate by headline
    const uniqueArticles = allArticles.reduce((acc: ESPNArticle[], article) => {
      if (!acc.find(a => a.headline === article.headline)) {
        acc.push(article);
      }
      return acc;
    }, []);

    console.log(`Unique articles: ${uniqueArticles.length}`);

    // Mets-related keywords for filtering
    const metsKeywords = ['mets', 'new york mets', 'nym', 'citi field', 'lindor', 'alonso', 'nimmo', 'mcneil', 'senga', 'diaz', 'baty', 'alvarez', 'mendez', 'grimace', 'manaea', 'megill', 'vientos', 'winker', 'francisco', 'pete alonso', 'jeff mcneil', 'mark vientos'];

    // Transform ESPN data to our format
    const transformedNews = uniqueArticles.slice(0, 20).map((article, index) => {
      // Determine type based on article content
      const headline = article.headline?.toLowerCase() || '';
      const description = article.description?.toLowerCase() || '';
      
      // Check if article is Mets-related
      const isMetsRelated = metsKeywords.some(keyword => 
        headline.includes(keyword) || description.includes(keyword)
      );
      
      let type: "signing" | "traded" | "news" | "injury" = "news";
      if (headline.includes('sign') || headline.includes('agree') || headline.includes('contract') || headline.includes('extension') || headline.includes('deal')) {
        type = "signing";
      } else if (headline.includes('trade') || headline.includes('acquire') || headline.includes('dealt') || headline.includes('swap')) {
        type = "traded";
      } else if (headline.includes('injur') || headline.includes(' il ') || headline.includes('hurt') || headline.includes('surgery') || headline.includes('rehab')) {
        type = "injury";
      }

      // Calculate time ago
      const publishedDate = new Date(article.published);
      const now = new Date();
      const diffMs = now.getTime() - publishedDate.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      
      let timeAgo = "Just now";
      if (diffDays > 0) {
        timeAgo = diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
      } else if (diffHours > 0) {
        timeAgo = diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
      } else if (diffMins > 0) {
        timeAgo = diffMins === 1 ? "1 minute ago" : `${diffMins} minutes ago`;
      }

      // Get image URL - prefer ESPN image, fallback to Mets logo
      const imageUrl = article.images?.[0]?.url || 
        (isMetsRelated 
          ? "https://a.espncdn.com/i/teamlogos/mlb/500/nym.png"
          : "https://a.espncdn.com/i/teamlogos/mlb/500/mlb.png");

      // Extract player name from headline if possible
      let player = isMetsRelated ? "New York Mets" : "MLB News";
      
      // Try to match common name patterns at the start of headlines
      const namePatterns = [
        /^([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)(?:'s|\s|,)/,
        /Mets[''']?\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/,
      ];
      
      for (const pattern of namePatterns) {
        const match = article.headline?.match(pattern);
        if (match && match[1]) {
          player = match[1];
          break;
        }
      }

      return {
        id: `espn-${index}-${publishedDate.getTime()}`,
        type,
        title: article.headline || "MLB News Update",
        player,
        details: article.description || "",
        time_ago: timeAgo,
        image_url: imageUrl,
        link: article.links?.web?.href || null,
        published_at: article.published,
        is_mets_related: isMetsRelated,
      };
    });

    console.log("Transformed news items:", transformedNews.length);

    // Check if there are any Mets-related news items
    const metsNewsCount = transformedNews.filter(item => item.is_mets_related).length;
    console.log("Mets-related news count:", metsNewsCount);

    // If no Mets-specific news, fetch transactions as fallback
    let finalNews = transformedNews;
    if (metsNewsCount === 0) {
      console.log("No Mets news found, fetching transactions...");
      const transactions = await fetchMetsTransactions();
      if (transactions.length > 0) {
        console.log(`Added ${transactions.length} Mets transactions`);
        // Add transactions at the beginning
        finalNews = [...transactions, ...transformedNews];
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        news: finalNews,
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
