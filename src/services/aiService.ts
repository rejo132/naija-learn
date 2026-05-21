/**
 * AI tutor: system prompts and Supabase Edge Function proxy for Anthropic Claude.
 *
 * @remarks
 * **Responsible for:** Building the Learnova teacher system prompt and sending chat
 * history to the `ai-tutor` Edge Function (API key stays server-side).
 *
 * **Talks to:**
 * - Imports: `@/constants/languages` (`LanguageCode`, `LANGUAGE_PROMPTS`),
 *   `@/store/appStore` (`ChatMessage` type only).
 * - Exports: `buildSystemPrompt`, `sendAIMessage`, `AIServiceError`, `isAIServiceError`.
 * - Called by: `app/lesson.tsx` only.
 *
 * **Notes for new developers:**
 * - Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env`.
 * - Deploy `supabase/functions/ai-tutor` and set `ANTHROPIC_API_KEY` in Supabase secrets / `supabase/.env`.
 * - On failure, throws structured `AIServiceError` for child-safe UI copy in lesson.tsx.
 */
import { LanguageCode, LANGUAGE_PROMPTS } from '@/constants/languages';
import { DEFAULT_PERSONALITY_ID, getPersonality } from '@/constants/personalities';
import { captureError } from '@/lib/sentry';
import { ChatMessage } from '@/store/appStore';

export type AIServiceErrorType = 'quota_exceeded' | 'no_internet' | 'api_error' | 'unknown';

export interface AIServiceError {
  type: AIServiceErrorType;
  message: string;
}

export function isAIServiceError(error: unknown): error is AIServiceError {
  if (typeof error !== 'object' || error === null) return false;
  const e = error as AIServiceError;
  return (
    typeof e.message === 'string' &&
    (e.type === 'quota_exceeded' ||
      e.type === 'no_internet' ||
      e.type === 'api_error' ||
      e.type === 'unknown')
  );
}

function throwStructuredError(type: AIServiceErrorType, message: string): never {
  const err: AIServiceError = { type, message };
  throw err;
}

interface AIRequestParams {
  messages: ChatMessage[];
  systemPrompt: string;
  grade: number;
  subject: string;
  language: string;
}

type EdgeTutorRequestBody = {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  systemPrompt: string;
  grade: number;
  subject: string;
  language: string;
};

type EdgeTutorSuccess = { reply: string };
type EdgeTutorError = { error: string };

const PREVOCATIONAL_CONTEXT = `This is Pre-vocational Studies. Introduce age-appropriate practical skills from Nigeria's six official trade areas: Solar PV Installation & Maintenance, Fashion Design & Garment Making, Livestock Farming, Beauty & Cosmetology, Computer Hardware & GSM Repairs, and Horticulture & Crop Production. Use safe, simple activities pupils can understand.`;

function getReadingLevelInstruction(grade: number): string {
  if (grade <= 2) {
    return `
      READING LEVEL: Primary ${grade} (age ${grade + 5}).
      Use VERY simple words. Short sentences only 
      (maximum 8 words per sentence). 
      Use lots of emojis to help explain things 🌟.
      Never use words a 6-7 year old would not know.
      Always explain new words immediately.
      Use Nigerian examples the child knows: 
      jollof rice, mango, danfo bus, Lagos, Abuja.
      Sound warm and playful like a fun older sibling.
    `;
  }
  if (grade <= 4) {
    return `
      READING LEVEL: Primary ${grade} (age ${grade + 5}).
      Use simple, clear sentences (max 12 words).
      Introduce new vocabulary with immediate 
      explanations.
      Use emojis occasionally to keep it fun.
      Use Nigerian examples where possible.
      Sound encouraging and friendly.
    `;
  }
  return `
      READING LEVEL: Primary ${grade} (age ${grade + 5}).
      You can use proper sentences and paragraphs.
      Introduce subject-specific vocabulary with 
      clear explanations.
      Use Nigerian examples and context where relevant.
      Be encouraging but also intellectually 
      stimulating — this child can handle a challenge.
    `;
}

export function buildSystemPrompt(
  languageCode: LanguageCode,
  subjectLabel: string,
  grade: number,
  isQuizMode: boolean = false,
  subjectId?: string,
  personalityId?: string,
  childName?: string
): string {
  const personality = getPersonality(personalityId ?? DEFAULT_PERSONALITY_ID);
  const subjectContext = subjectId === 'prevocational' ? `\n${PREVOCATIONAL_CONTEXT}` : '';
  const trimmedName = childName?.trim();
  const nameInstruction = trimmedName
    ? `The child's name is ${trimmedName}. Use their name naturally in your responses — when encouraging them, celebrating correct answers, or helping them through a mistake. Examples: "Well done, ${trimmedName}!", "That is a great question, ${trimmedName}!", "You are almost there, ${trimmedName}!". Do not use their name in every single sentence — only when it feels natural and warm.`
    : '';
  const readingLevel = getReadingLevelInstruction(grade);
  return `${personality.systemPrompt}

You are teaching through the Learnova app for Nigerian primary school students.
${LANGUAGE_PROMPTS[languageCode]}
Student is in Primary ${grade}. Subject: ${subjectLabel}.${subjectContext}
${readingLevel}
${nameInstruction}
Rules:
1. Keep responses SHORT — maximum 4 sentences.
2. Always use Nigerian examples, names, and culture.
3. Use simple vocabulary for Primary ${grade}.
4. Be warm and encouraging.
5. Follow Nigeria's revised national curriculum (FG/NERDC 2025/26) for Primary ${grade}, including English Studies, Mathematics, Nigerian History, Social & Citizenship Studies, Basic Science, Physical & Health Education, Cultural & Creative Arts, and other official subjects for this grade band.
6. Never mix languages in one response.
${isQuizMode ? `QUIZ MODE RULES — follow exactly:
1. Ask ONE question at a time.
2. Always format options EXACTLY like this with no variation:
   A) option text
   B) option text  
   C) option text
   D) option text
3. Wait for the student to answer before giving feedback.
4. After they answer, say if correct and explain briefly.
5. Then ask the next question in the same A) B) C) D) format.` : ''}`;
}

function getEdgeFunctionUrl(): string {
  const base = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  if (!base) {
    throwStructuredError('api_error', 'Supabase URL is not configured');
  }
  return `${base}/functions/v1/ai-tutor`;
}

async function callAiTutorEdge(params: AIRequestParams): Promise<string> {
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey) {
    throwStructuredError('api_error', 'Supabase anon key is not configured');
  }

  const requestBody: EdgeTutorRequestBody = {
    messages: params.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    systemPrompt: params.systemPrompt,
    grade: params.grade,
    subject: params.subject,
    language: params.language,
  };

  let response: Response;
  try {
    response = await fetch(getEdgeFunctionUrl(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
  } catch {
    throwStructuredError('no_internet', 'Network request failed');
  }

  let data: EdgeTutorSuccess | EdgeTutorError = { error: 'api_error' };
  try {
    data = await response.json();
  } catch {
    throwStructuredError('api_error', 'Invalid response from AI service');
  }

  if (response.ok && 'reply' in data && typeof data.reply === 'string') {
    return data.reply;
  }

  const code = 'error' in data ? data.error : '';

  if (response.status === 429 || code === 'quota_exceeded') {
    throwStructuredError('quota_exceeded', 'Quota exceeded');
  }
  if (response.status === 503 || code === 'service_unavailable') {
    throwStructuredError('no_internet', 'Service unavailable');
  }
  throwStructuredError('api_error', 'API error');
}

export async function sendAIMessage(params: AIRequestParams): Promise<string> {
  try {
    return await callAiTutorEdge(params);
  } catch (error: unknown) {
    captureError(error, {
      context: 'sendAIMessage',
      grade: String(params.grade),
      subject: params.subject,
    });
    if (isAIServiceError(error)) throw error;
    throwStructuredError('unknown', 'Unknown error');
  }
}

/**
 * Builds a "explain simpler" request message.
 * Sent as a user message to make AI re-explain more simply.
 */
export function getSimplifyPrompt(grade: number): string {
  if (grade <= 2) {
    return "Please explain that again using very simple words, like I am 5 years old. Use a fun story or example.";
  }
  if (grade <= 4) {
    return "Can you explain that more simply? Use everyday Nigerian examples I can relate to.";
  }
  return "Please simplify that explanation. Break it into smaller steps with Nigerian examples.";
}

/**
 * Builds a "explain harder/deeper" request message.
 */
export function getChallengePrompt(grade: number): string {
  if (grade <= 2) {
    return "I understood! Can you tell me something more interesting about this?";
  }
  if (grade <= 4) {
    return "I got it! Can you explain it deeper and give me a harder example?";
  }
  return "I understand this. Can you go deeper and show me how this connects to real life in Nigeria?";
}
