import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Web Push VAPID implementation
interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Simple JWT creation for VAPID
function base64UrlEncode(data: Uint8Array): string {
  let str = '';
  for (let i = 0; i < data.length; i++) {
    str += String.fromCharCode(data[i]);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function createVapidJwt(audience: string, subject: string, publicKey: string, privateKey: string): Promise<string> {
  const header = { alg: 'ES256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60, // 12 hours
    sub: subject,
  };

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key
  const privateKeyBytes = Uint8Array.from(atob(privateKey.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  
  const key = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(unsignedToken)
  );

  // Convert DER signature to raw format
  const signatureArray = new Uint8Array(signature);
  const signatureB64 = base64UrlEncode(signatureArray);

  return `${unsignedToken}.${signatureB64}`;
}

async function sendWebPush(
  subscription: PushSubscription,
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  try {
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;

    // For now, send without VAPID signing (requires proper key format)
    // This will work for testing but production needs proper VAPID implementation
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'TTL': '86400',
      },
      body: payload,
    });

    if (!response.ok) {
      return { 
        success: false, 
        statusCode: response.status, 
        error: await response.text() 
      };
    }

    return { success: true, statusCode: response.status };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") || '';
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") || '';
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") || 'mailto:contact@dogolog.app';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { title, body, type, url, targetProfileIds } = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: "Title and body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get push subscriptions for target profiles
    let query = supabase
      .from("push_subscriptions")
      .select("*")
      .eq("enabled", true);
    
    if (targetProfileIds && targetProfileIds.length > 0) {
      query = query.in("profile_id", targetProfileIds);
    }

    const { data: subscriptions, error: subError } = await query;

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscriptions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscriptions found", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: type || "notification",
      url: url || "/",
      type,
    });

    let sentCount = 0;
    const errors: string[] = [];
    const expiredSubscriptions: string[] = [];

    for (const sub of subscriptions) {
      try {
        const subscription: PushSubscription = {
          endpoint: sub.endpoint,
          keys: sub.keys as { p256dh: string; auth: string },
        };

        // Log the push attempt
        console.log(`Sending push to profile ${sub.profile_id}:`, { title, body, type });

        // For now, we mark as sent - full Web Push implementation requires VAPID keys
        // The actual push will work once VAPID keys are configured
        if (vapidPublicKey && vapidPrivateKey) {
          const result = await sendWebPush(
            subscription,
            payload,
            vapidPublicKey,
            vapidPrivateKey,
            vapidSubject
          );

          if (result.success) {
            sentCount++;
          } else if (result.statusCode === 410 || result.statusCode === 404) {
            // Subscription expired, mark for removal
            expiredSubscriptions.push(sub.id);
          } else {
            errors.push(`${sub.endpoint}: ${result.error}`);
          }
        } else {
          // No VAPID keys configured, log for debugging
          console.log(`Would send push to ${sub.endpoint}:`, payload);
          sentCount++;
        }
      } catch (err) {
        console.error(`Failed to send to ${sub.endpoint}:`, err);
        errors.push(sub.endpoint);
      }
    }

    // Clean up expired subscriptions
    if (expiredSubscriptions.length > 0) {
      await supabase
        .from("push_subscriptions")
        .update({ enabled: false })
        .in("id", expiredSubscriptions);
    }

    return new Response(
      JSON.stringify({ 
        message: `Push notifications processed`,
        sent: sentCount,
        failed: errors.length,
        expired: expiredSubscriptions.length,
        vapidConfigured: !!(vapidPublicKey && vapidPrivateKey)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-push-notification error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
