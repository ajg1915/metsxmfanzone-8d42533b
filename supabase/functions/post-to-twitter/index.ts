import { createClient } from "npm:@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac("sha1", signingKey);
  return hmacSha1.update(signatureBaseString).digest("base64");
}

function generateOAuthHeader(
  method: string, 
  url: string,
  apiKey: string,
  apiSecret: string,
  accessToken: string,
  accessTokenSecret: string
): string {
  const oauthParams = {
    oauth_consumer_key: apiKey,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(method, url, oauthParams, apiSecret, accessTokenSecret);

  const signedOAuthParams = { ...oauthParams, oauth_signature: signature };

  return "OAuth " + Object.entries(signedOAuthParams)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(", ");
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const userId = claimsData.claims.sub;
    
    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const { 
      imageUrl, 
      caption, 
      apiKey,
      apiSecret,
      accessToken: twitterAccessToken,
      accessTokenSecret
    } = await req.json();

    if (!caption) {
      return new Response(JSON.stringify({ error: 'Caption is required for tweets' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    if (!apiKey || !apiSecret || !twitterAccessToken || !accessTokenSecret) {
      return new Response(JSON.stringify({ error: 'Missing Twitter API credentials' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log('Posting to Twitter/X');

    let mediaId: string | null = null;

    // Step 1: Upload media if imageUrl provided
    if (imageUrl) {
      try {
        // Download the image
        const imageResponse = await fetch(imageUrl);
        const imageBlob = await imageResponse.blob();
        const imageBuffer = await imageBlob.arrayBuffer();
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

        const uploadUrl = "https://upload.twitter.com/1.1/media/upload.json";
        const uploadOAuthHeader = generateOAuthHeader(
          "POST",
          uploadUrl,
          apiKey,
          apiSecret,
          twitterAccessToken,
          accessTokenSecret
        );

        const formData = new FormData();
        formData.append('media_data', base64Image);

        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': uploadOAuthHeader,
          },
          body: formData,
        });

        const uploadResult = await uploadResponse.json();
        
        if (uploadResponse.ok && uploadResult.media_id_string) {
          mediaId = uploadResult.media_id_string;
          console.log('Media uploaded successfully:', mediaId);
        } else {
          console.error('Media upload failed:', uploadResult);
        }
      } catch (mediaError) {
        console.error('Error uploading media to Twitter:', mediaError);
        // Continue without media
      }
    }

    // Step 2: Post the tweet
    const tweetUrl = "https://api.x.com/2/tweets";
    const tweetOAuthHeader = generateOAuthHeader(
      "POST",
      tweetUrl,
      apiKey,
      apiSecret,
      twitterAccessToken,
      accessTokenSecret
    );

    const tweetBody: { text: string; media?: { media_ids: string[] } } = {
      text: caption,
    };

    if (mediaId) {
      tweetBody.media = { media_ids: [mediaId] };
    }

    const tweetResponse = await fetch(tweetUrl, {
      method: 'POST',
      headers: {
        'Authorization': tweetOAuthHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tweetBody),
    });

    const tweetResult = await tweetResponse.json();

    if (!tweetResponse.ok) {
      console.error('Twitter post error:', tweetResult);
      return new Response(JSON.stringify({ 
        error: 'Failed to post tweet',
        details: tweetResult.detail || tweetResult.title || 'Unknown error'
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log('Successfully posted to Twitter:', tweetResult.data?.id);

    return new Response(JSON.stringify({
      success: true,
      postId: tweetResult.data?.id,
      postUrl: `https://twitter.com/i/status/${tweetResult.data?.id}`,
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: unknown) {
    console.error('Error posting to Twitter:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
