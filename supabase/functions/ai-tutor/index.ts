/**
 * Supabase Edge Function: ai-tutor
 *
 * Proxies lesson chat to Anthropic Claude. ANTHROPIC_API_KEY lives only in
 * Supabase secrets / supabase/.env — never in the Expo app bundle.
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const ANTHROPIC_MESSAGES_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-sonnet-4-6';

/**
 * CORS headers so the React Native / web app can call this function from the browser.
 * authorization + apikey are required for Supabase client fetch; x-api-key is allowed per spec.
 */
const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, x-api-key, authorization, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/** Shape of the JSON body sent by services/aiService.ts */
type TutorMessage = { role: 'user' | 'assistant'; content: string };

type TutorRequestBody = {
  messages: TutorMessage[];
  systemPrompt: string;
  grade: number;
  subject: string;
  language: string;
};

/** JSON helper — always includes CORS headers on success and error responses. */
function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** True when Anthropic is rate-limited or overloaded (429 / 529). */
function isQuotaStatus(status: number): boolean {
  return status === 429 || status === 529;
}

serve(async (req: Request): Promise<Response> => {
  // OPTIONS preflight: browser checks CORS before POST — return 200 with headers only.
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'api_error' }, 500);
  }

  // Read the API key from Deno env (Supabase secret). Never from the client body.
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return jsonResponse({ error: 'server_config_error' }, 500);
  }

  let body: TutorRequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'api_error' }, 500);
  }

  const { messages, systemPrompt } = body;
  if (!Array.isArray(messages) || typeof systemPrompt !== 'string') {
    return jsonResponse({ error: 'api_error' }, 500);
  }

  // Anthropic expects roles "user" | "assistant" and a separate system string.
  const anthropicMessages = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content }));

  const anthropicPayload = {
    model: ANTHROPIC_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: anthropicMessages,
  };

  let anthropicResponse: Response;
  try {
    anthropicResponse = await fetch(ANTHROPIC_MESSAGES_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(anthropicPayload),
    });
  } catch {
    // Could not reach Anthropic (DNS, timeout, offline).
    return jsonResponse({ error: 'service_unavailable' }, 503);
  }

  let anthropicData: {
    content?: Array<{ type?: string; text?: string }>;
    error?: { type?: string; message?: string };
  };

  try {
    anthropicData = await anthropicResponse.json();
  } catch {
    return jsonResponse({ error: 'api_error' }, 500);
  }

  if (!anthropicResponse.ok) {
    if (isQuotaStatus(anthropicResponse.status)) {
      return jsonResponse({ error: 'quota_exceeded' }, 429);
    }
    return jsonResponse({ error: 'api_error' }, 500);
  }

  const reply = anthropicData?.content?.[0]?.text ?? 'Sorry, please try again!';

  return jsonResponse({ reply }, 200);
});
