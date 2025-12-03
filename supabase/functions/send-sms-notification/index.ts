import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SMSRequest {
  message: string;
  userId?: string; // Send to specific user
  sendToAll?: boolean; // Send to all opted-in users
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, sendToAll }: SMSRequest = await req.json();

    if (!message) {
      throw new Error("Message is required");
    }

    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error("Twilio credentials not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get users to send SMS to
    let query = supabase
      .from("profiles")
      .select("id, phone_number, full_name")
      .eq("sms_notifications_enabled", true)
      .not("phone_number", "is", null);

    if (userId && !sendToAll) {
      query = query.eq("id", userId);
    }

    const { data: profiles, error: profilesError } = await query;

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No users opted in for SMS notifications" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending SMS to ${profiles.length} users`);

    const results = [];

    for (const profile of profiles) {
      if (!profile.phone_number) continue;

      // Format phone number (ensure it has country code)
      let phoneNumber = profile.phone_number.replace(/\D/g, "");
      if (phoneNumber.length === 10) {
        phoneNumber = "1" + phoneNumber; // Add US country code
      }
      if (!phoneNumber.startsWith("+")) {
        phoneNumber = "+" + phoneNumber;
      }

      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        
        const formData = new URLSearchParams();
        formData.append("To", phoneNumber);
        formData.append("From", twilioPhoneNumber);
        formData.append("Body", message);

        const response = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Authorization": "Basic " + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error(`Failed to send SMS to ${profile.id}:`, result);
          results.push({ userId: profile.id, success: false, error: result.message });
        } else {
          console.log(`SMS sent to ${profile.id}:`, result.sid);
          results.push({ userId: profile.id, success: true, sid: result.sid });
        }
      } catch (smsError) {
        console.error(`Error sending SMS to ${profile.id}:`, smsError);
        results.push({ userId: profile.id, success: false, error: String(smsError) });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${successCount}/${results.length} SMS notifications`,
        results 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-sms-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
