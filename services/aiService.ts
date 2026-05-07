import { LanguageCode, LANGUAGE_PROMPTS } from '@/constants/languages';
import { ChatMessage } from '@/store/appStore';

interface AIRequestParams {
  messages: ChatMessage[];
  systemPrompt: string;
}

export function buildSystemPrompt(
  languageCode: LanguageCode,
  subjectLabel: string,
  grade: number,
  isQuizMode: boolean = false
): string {
  return `You are NaijaLearn, a friendly AI teacher for Nigerian primary school students.
${LANGUAGE_PROMPTS[languageCode]}
Student is in Primary ${grade}. Subject: ${subjectLabel}.
Rules:
1. Keep responses SHORT — maximum 4 sentences.
2. Always use Nigerian examples, names, and culture.
3. Use simple vocabulary for Primary ${grade}.
4. Be warm and encouraging.
5. Follow the Nigerian primary school curriculum (NERDC/UBE).
${isQuizMode ? 'QUIZ MODE: Give ONE multiple-choice question with options A, B, C, D. After the student answers, tell them if correct and explain briefly.' : ''}`;
}

async function callGemini(params: AIRequestParams): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return 'Please add your Gemini API key to the .env file. Get it free at https://aistudio.google.com';
  }
  const geminiMessages = params.messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const body = {
    system_instruction: { parts: [{ text: params.systemPrompt }] },
    contents: geminiMessages,
    generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
  };
  const preferredModel = process.env.EXPO_PUBLIC_GEMINI_MODEL;
  const candidateModels = [
    preferredModel,
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
  ].filter(Boolean) as string[];

  let lastError = 'Gemini API error';
  for (const model of candidateModels) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );

    if (response.ok) {
      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sorry, please try again!';
    }

    const err = await response.json().catch(() => null);
    const message = err?.error?.message ?? 'Gemini API error';
    lastError = message;

    // Try the next model only for model-availability errors.
    if (!/not found|not supported/i.test(message)) {
      throw new Error(message);
    }
  }

  throw new Error(lastError);
}

async function callAnthropic(params: AIRequestParams): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) return 'Please add your Anthropic API key to the .env file.';
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 400,
      system: params.systemPrompt,
      messages: params.messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!response.ok) throw new Error('Anthropic API error');
  const data = await response.json();
  return data?.content?.[0]?.text ?? 'Sorry, please try again!';
}

export async function sendAIMessage(params: AIRequestParams): Promise<string> {
  const provider = process.env.EXPO_PUBLIC_AI_PROVIDER ?? 'gemini';
  try {
    return provider === 'anthropic' ? await callAnthropic(params) : await callGemini(params);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Please check your internet and try again.';
    return `Connection error: ${msg}`;
  }
}