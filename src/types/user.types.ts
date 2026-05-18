/**
 * User and authentication types for Learnova.
 * Parents are the paying customers; children are the learners.
 */

/** Supported UI and lesson delivery languages. */
export type LanguagePreference = 'english' | 'yoruba' | 'igbo' | 'hausa' | 'pidgin';

/**
 * A learner profile linked to a parent account.
 */
export interface Child {
  /** Unique identifier for the child record. */
  id: string;
  /** ID of the parent who owns this child profile. */
  parentId: string;
  /** Display name shown in the app and reports. */
  name: string;
  /** Child's age in years; used for age-appropriate content hints. */
  age: number;
  /** Nigerian primary school grade level (1–6). */
  grade: 1 | 2 | 3 | 4 | 5 | 6;
  /** Preferred language for lessons and AI tutor responses. */
  languagePreference: LanguagePreference;
  /** Avatar image key or URL for the child's profile. */
  avatar: string;
  /** ISO 8601 timestamp when the profile was created. */
  createdAt: string;
}

/**
 * Parent account — the paying customer who manages child profiles.
 */
export interface Parent {
  /** Unique identifier for the parent account. */
  id: string;
  /** Parent's full name for billing and support. */
  name: string;
  /** Nigerian phone number used for login or OTP. */
  phone: string;
  /** Email address for receipts and account recovery. */
  email: string;
  /** Learner profiles managed under this parent. */
  children: Child[];
  /** Current subscription state for premium features. */
  subscriptionStatus: 'free' | 'active' | 'expired' | 'cancelled';
  /** ISO 8601 timestamp when the account was created. */
  createdAt: string;
}
