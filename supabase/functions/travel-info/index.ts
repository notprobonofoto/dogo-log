import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { country, language = "pl" } = await req.json();

    if (!country) {
      return new Response(
        JSON.stringify({ error: "Country is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = language === "pl" 
      ? `Jesteś ekspertem od podróżowania z psami. Podajesz aktualne, zwięzłe i praktyczne informacje o wymaganiach dotyczących podróży z psem do różnych krajów. Odpowiadaj w języku polskim. Używaj emoji dla lepszej czytelności. Formatuj odpowiedź w sekcjach.`
      : `You are an expert on traveling with dogs. You provide current, concise and practical information about requirements for traveling with dogs to different countries. Answer in English. Use emojis for better readability. Format your response in sections.`;

    const userPrompt = language === "pl"
      ? `Podaj aktualne wymagania dotyczące podróży z psem do kraju: ${country}.

Uwzględnij następujące sekcje:
📄 **Wymagane dokumenty**
💉 **Szczepienia**
🏷️ **Paszport i chip**
🏠 **Kwarantanna** (jeśli dotyczy)
⚠️ **Zakazy i ograniczenia**
💡 **Praktyczne porady**

Bądź zwięzły i praktyczny. Jeśli jakieś wymaganie nie dotyczy tego kraju, pomiń tę sekcję.`
      : `Provide current requirements for traveling with a dog to: ${country}.

Include the following sections:
📄 **Required documents**
💉 **Vaccinations**
🏷️ **Passport and microchip**
🏠 **Quarantine** (if applicable)
⚠️ **Restrictions and bans**
💡 **Practical tips**

Be concise and practical. If a requirement doesn't apply to this country, skip that section.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ info: content, country }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("travel-info error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
