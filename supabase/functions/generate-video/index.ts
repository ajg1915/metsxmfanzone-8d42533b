import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Replicate from "https://esm.sh/replicate@0.25.2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY')
    if (!REPLICATE_API_KEY) {
      console.error('REPLICATE_API_KEY is not set')
      throw new Error('REPLICATE_API_KEY is not set')
    }

    console.log('Initializing Replicate client...')
    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    })

    const body = await req.json()
    console.log('Request body:', JSON.stringify(body))

    // If it's a status check request
    if (body.predictionId) {
      console.log("Checking status for prediction:", body.predictionId)
      try {
        const prediction = await replicate.predictions.get(body.predictionId)
        console.log("Status check response:", JSON.stringify(prediction))
        return new Response(JSON.stringify(prediction), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      } catch (statusError) {
        console.error("Error checking prediction status:", statusError)
        throw statusError
      }
    }

    // If it's a generation request
    if (!body.imageUrl) {
      console.error('Missing imageUrl in request body')
      return new Response(
        JSON.stringify({ 
          error: "Missing required field: imageUrl is required" 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log("Generating video from image:", body.imageUrl)
    
    // Use the latest Stable Video Diffusion model
    // Using stability-ai/stable-video-diffusion which is actively maintained
    const prediction = await replicate.predictions.create({
      model: "stability-ai/stable-video-diffusion",
      input: {
        input_image: body.imageUrl,
        sizing_strategy: "maintain_aspect_ratio",
        frames_per_second: 6,
        motion_bucket_id: 127,
        cond_aug: 0.02,
        decoding_t: 7,
        seed: Math.floor(Math.random() * 1000000)
      }
    })

    console.log("Video generation started:", JSON.stringify(prediction))
    
    if (prediction.error) {
      console.error("Replicate returned error:", prediction.error)
      return new Response(JSON.stringify({ error: prediction.error }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Error in generate-video function:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetails = error instanceof Error ? error.stack : '';
    console.error("Error details:", errorDetails)
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: errorDetails 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
