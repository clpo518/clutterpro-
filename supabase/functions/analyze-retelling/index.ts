import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { transcript, keyPoints, originalText } = await req.json();

    if (!transcript || !keyPoints || !originalText) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an SLP specializing in cluttering assessment.
You are analyzing the oral retelling of a patient who listened to a short story.

IMPORTANT: This is NOT a memory test. You are evaluating the QUALITY of the retelling:
- Did the patient mention the key points (even if rephrased)?
- Were they concise or did they digress?
- Are there parenthetical digressions within digressions (embedding)?
- Is the information presented in a logical order?

Your feedback must be ENCOURAGING and clinically relevant.
Respond ONLY with valid JSON, no markdown or backticks.`;

    const userPrompt = `Original story: "${originalText}"

Expected key points:
${keyPoints.map((kp: string, i: number) => `${i + 1}. ${kp}`).join("\n")}

Patient's transcription: "${transcript}"

Analyze this retelling and respond in JSON with this exact schema:
{
  "keyPointResults": [
    { "keyPoint": "key point text", "found": true/false, "comment": "brief comment" }
  ],
  "score": number of points found,
  "total": total number of key points,
  "concision": "concise" | "acceptable" | "digressive",
  "concisionComment": "comment on conciseness",
  "digressions": ["list of detected digressions, empty if none"],
  "organisation": "logical" | "partially logical" | "disorganized",
  "organisationComment": "comment on information order",
  "globalFeedback": "encouraging global feedback in 2-3 sentences"
}`;

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
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests, please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Insufficient credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Analysis error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "No response from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse JSON from response (handle potential markdown wrapping)
    let analysis;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysis = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Invalid AI response format", raw: content }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-retelling error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
