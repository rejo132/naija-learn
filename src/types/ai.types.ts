/**
 * AI conversation types.
 * Defines the shape of messages sent to and from the ai-tutor edge function.
 */

/** Who sent the message in the tutor chat. */
export type AIRole = 'user' | 'assistant';

/** Categorized failure modes when the AI tutor cannot respond. */
export type AIErrorType =
  | 'quota_exceeded'
  | 'no_internet'
  | 'api_error'
  | 'unknown';

/**
 * One turn in the tutor conversation.
 */
export interface AIMessage {
  /** Whether the message is from the learner or the tutor. */
  role: AIRole;
  /** Plain-text message body. */
  content: string;
}

/**
 * Full context for an ongoing AI tutoring session.
 */
export interface AIConversation {
  /** Learner profile ID for personalization and logging. */
  childId: string;
  /** Current subject being taught. */
  subject: string;
  /** Grade level used to scope explanations and difficulty. */
  grade: number;
  /** Ordered chat history for the session. */
  messages: AIMessage[];
  /** BCP-47 or app language code for responses. */
  language: string;
  /** When true, the tutor should ask quiz-style questions. */
  isQuizMode: boolean;
}

/**
 * Payload sent to the ai-tutor Supabase edge function.
 */
export interface AITutorRequest {
  /** Conversation history including the latest user message. */
  messages: AIMessage[];
  /** System instructions (persona, safety, curriculum alignment). */
  systemPrompt: string;
  /** Learner's grade for age-appropriate content. */
  grade: number;
  /** Subject context for the tutor. */
  subject: string;
  /** Response language for the model. */
  language: string;
}

/**
 * Successful response from the ai-tutor edge function.
 */
export interface AITutorResponse {
  /** Assistant reply text to show in the chat UI. */
  reply: string;
}
