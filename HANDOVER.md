# Learnova — Project Handover

> AI-powered primary school tutoring app for Nigerian children (Primary 1–6).
> This document is everything a new developer or buyer needs to deploy, run,
> publish, and maintain Learnova from a clean machine.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Structure](#2-repository-structure)
3. [Environment Variables](#3-environment-variables)
4. [Supabase Setup](#4-supabase-setup-step-by-step)
5. [Local Development Setup](#5-local-development-setup)
6. [Building for Production](#6-building-for-production)
7. [Publishing to App Stores](#7-publishing-to-app-stores)
8. [App Features Reference](#8-app-features-reference)
9. [Known Limitations & Future Work](#9-known-limitations--future-work)
10. [Maintenance Guide](#10-maintenance-guide)
11. [Default Credentials & PIN](#11-default-credentials--pin)
12. [Contact & Credits](#12-contact--credits)

---

## 1. Project Overview

**Learnova** is an AI-powered tutoring app that brings a personal, culturally-grounded tutor to every Nigerian primary school child. It speaks four Nigerian languages, follows the official FG/NERDC primary curriculum, and gamifies learning with XP, streaks, achievements, and a quiz mode.

### What the app does

- **For the child:** chat one-on-one with an AI tutor that knows their grade, their subject, and their language. Lessons are short (≤4 sentences per reply), warm, and use Nigerian examples. There is also an offline activity bank, a quiz mode, voice playback (TTS), and a 3-step learning flow (Hook → Practice → Reward).
- **For the parent:** create profiles for each child, switch between them on the dashboard, see weekly progress per child, set daily study limits, and protect parent-only settings behind a PIN.

### Tech stack

| Layer | Technology |
| --- | --- |
| App runtime | Expo SDK 54, React Native 0.81, React 19 |
| Language | TypeScript 5.9 |
| Routing | Expo Router 6 (file-based, typed routes) |
| State | Zustand 5 + `@react-native-async-storage/async-storage` (persistence) |
| Backend | Supabase (Postgres + Auth + Edge Functions) |
| AI | Anthropic Claude (`claude-sonnet-4-6`), called via a Supabase Edge Function so the API key never ships in the app bundle |
| Auth | Supabase email/password + optional OAuth (Google, Microsoft/Azure) |
| Voice | `expo-speech` (device TTS, BCP 47 locales `en-NG`, `ha-NG`, `yo-NG`, `ig-NG`) |
| Error tracking | `@sentry/react-native` (optional, opt-in via DSN) |
| Build | EAS Build (cloud), EAS Submit |

### Platforms

✅ iOS · ✅ Android · ✅ Web (Expo Web → Vercel)

### Target users

Nigerian parents and their primary school children (Primary 1–6, ages ~5–12).

---

## 2. Repository Structure

```
naija-learn/
├── app/                                # Expo Router screens (file = route)
│   ├── _layout.tsx                     # Root stack, auth gating, splash, fonts
│   ├── index.tsx                       # Splash / landing → routes to auth or dashboard
│   ├── auth/                           # Sign in, sign up, forgot password
│   ├── child-select.tsx                # "Who is studying today?" picker
│   ├── children.tsx                    # Manage child profiles (parent-gated)
│   ├── dashboard.tsx                   # Main learning home (subjects, AI prompt, switcher)
│   ├── grade.tsx                       # Grade picker
│   ├── personality.tsx                 # Choose AI tutor personality
│   ├── lesson.tsx                      # Main chat UI for AI lessons + quiz mode
│   ├── achievements.tsx                # Locked / unlocked achievements
│   ├── progress.tsx                    # Subject progress detail
│   ├── parent-dashboard.tsx            # Per-child weekly reports
│   ├── settings.tsx                    # All app settings + sign-out + delete data
│   └── change-password.tsx             # Parent PIN change screen
├── src/
│   ├── components/                     # Reusable UI (GlassCard, ParentGate,
│   │                                   #   ChildSwitcher, SideDrawer, BottomTabBar,
│   │                                   #   Atmosphere, OfflineLearning, etc.)
│   ├── constants/
│   │   ├── theme.ts                    # COLORS, DARK_COLORS, SHADOWS, spacing
│   │   ├── languages.ts                # Language list + UI_TEXT translations
│   │   ├── subjects.ts                 # Curriculum subjects per grade
│   │   ├── personalities.ts            # 5 AI tutor personas + system prompts
│   │   ├── achievements.ts             # Achievement definitions + level table
│   │   └── offlineContent.ts           # Offline quiz / flashcard bank
│   ├── hooks/
│   │   ├── useTheme.ts                 # Light/dark colour switcher
│   │   ├── useSpeech.ts                # TTS wrapper with BCP 47 locales
│   │   ├── useNetworkStatus.ts         # Online/offline detection (NetInfo)
│   │   └── useTranslation.ts           # i18n helper
│   ├── services/
│   │   ├── dbService.ts                # All Supabase reads / writes (profiles,
│   │   │                               #   children, progress, RPC). All errors
│   │   │                               #   routed through captureError (Sentry).
│   │   ├── aiService.ts                # Builds system prompt + calls ai-tutor
│   │   │                               #   edge function. Anthropic key NOT here.
│   │   └── oauthService.ts             # Google + Microsoft OAuth via Supabase
│   ├── store/
│   │   ├── appStore.ts                 # Persisted learning state (xp, streak,
│   │   │                               #   active child, parent PIN, settings)
│   │   └── authStore.ts                # Supabase session, user, role
│   ├── lib/
│   │   ├── supabase.ts                 # Supabase client (uses ENV from env.ts)
│   │   ├── env.ts                      # Reads EXPO_PUBLIC_* env vars
│   │   └── sentry.ts                   # initialiseSentry() + captureError helper
│   ├── types/                          # TypeScript interfaces
│   └── utils/                          # Misc helpers
├── supabase/
│   ├── schema.sql                      # ⚠️ Run this FIRST in a fresh project.
│   │                                   # Creates 4 tables, RLS, trigger, RPC.
│   └── functions/
│       └── ai-tutor/                   # Deno edge function — proxies Claude
│           ├── index.ts                # ANTHROPIC_API_KEY read from secrets here
│           └── deno.json
├── assets/
│   ├── fonts/                          # Poppins (Regular, SemiBold, Bold)
│   ├── images/
│   ├── icon.png · adaptive-icon.png · splash-icon.png · favicon.png
├── app.json                            # Expo config (name, bundle IDs, plugins)
├── eas.json                            # EAS Build profiles (preview, production)
├── babel.config.js · metro.config.js · tsconfig.json
├── vercel.json                         # Web deployment config
├── .env.example                        # Copy to .env
├── BUILD.md                            # Quick build reference (see also Section 6)
├── HANDOVER.md                         # This file
├── README.md
└── package.json
```

---

## 3. Environment Variables

Only **two** variables are required to boot the client app. Everything else is optional or lives server-side.

### Required (client `.env`)

| Variable | Required? | Where it's used | How to get it |
| --- | --- | --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | ✅ Required | `src/lib/env.ts` → `src/lib/supabase.ts` (creates the Supabase client). Also reused in `aiService.ts` to build the edge-function URL. | Supabase Dashboard → Project Settings → API → **Project URL** |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | ✅ Required | `src/lib/env.ts` → `src/lib/supabase.ts`. Sent as the `Authorization: Bearer` header on every Supabase request, including the AI edge function. | Supabase Dashboard → Project Settings → API → **anon / public key**. Safe to embed in the app — RLS protects the data. |

### Optional (client `.env`)

| Variable | Required? | Where it's used | How to get it |
| --- | --- | --- | --- |
| `EXPO_PUBLIC_SENTRY_DSN` | Optional | `src/lib/sentry.ts` → `initialiseSentry()`. If unset, Sentry is silently disabled. All `captureError()` calls become no-ops. | Sentry → your project → Settings → Client Keys (DSN) |

### Server-side only (NEVER in the client `.env`)

| Variable | Required? | Where it's used | How to get it |
| --- | --- | --- | --- |
| `ANTHROPIC_API_KEY` | ✅ Required for AI chat | Supabase Edge Function `ai-tutor` (`supabase/functions/ai-tutor/index.ts`). Read at runtime via `Deno.env.get()`. | Anthropic Console → API Keys → Create Key (`sk-ant-…`). Set via `supabase secrets set ANTHROPIC_API_KEY=sk-ant-…`. **Never** put this in `app.json`, `.env`, or any client file. |

### OAuth configuration (no client env vars needed)

The brief mentioned `EXPO_PUBLIC_GOOGLE_CLIENT_ID` and `EXPO_PUBLIC_MICROSOFT_CLIENT_ID`. ⚠️ **The current codebase does not read these.** OAuth is delegated entirely to Supabase Auth — you configure Google and Microsoft credentials inside the Supabase dashboard, not as env vars in the app.

- Google: Supabase Dashboard → Authentication → Providers → **Google** → paste your Google OAuth Client ID + Secret from [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
- Microsoft: Supabase Dashboard → Authentication → Providers → **Azure** → paste your Azure App Registration Client ID + Secret from [Azure Portal](https://portal.azure.com/).
- Add the deep-link redirect URL `learnova://` and your web URL to both providers' allowed redirects, **and** to the Supabase Auth allowed redirect list.

### `.env` file template

Copy `.env.example` to `.env` at the project root and fill in:

```bash
# --- Required ---
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key...

# --- Optional ---
EXPO_PUBLIC_SENTRY_DSN=https://xxxxxxxx@oXXXXXX.ingest.sentry.io/XXXXXX
```

⚠️ Do **not** add `ANTHROPIC_API_KEY` here. It belongs in Supabase secrets only (see Section 4, step 5).

---

## 4. Supabase Setup (step by step)

These steps take a fresh Supabase project from zero to fully working backend, including the Claude edge function.

### 1. Create a Supabase project

1. Sign up / log in at [supabase.com](https://supabase.com).
2. **New project** → name it `learnova` (or any name) → choose a region close to Nigeria (e.g. `eu-west-1 / Ireland` for lowest latency to Lagos until an `af-` region is available) → pick a strong database password and save it.

### 2. Copy the API credentials

1. Project Settings → **API**.
2. Copy **Project URL** → paste into `.env` as `EXPO_PUBLIC_SUPABASE_URL`.
3. Copy the **anon public** key → paste into `.env` as `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

> ⚠️ The other key labelled `service_role` is **server-only**. Never put it in the app, in `.env`, or in any file that ships to the client.

### 3. Run the schema

1. Open **SQL Editor** in the Supabase dashboard.
2. Open `supabase/schema.sql` from this repo, copy the entire file, paste into the SQL editor.
3. Click **Run**. Confirm there are no errors.

What this creates:

- ✅ 4 tables: `profiles`, `children`, `progress`, `subscriptions`
- ✅ Row Level Security enabled on all 4 tables, plus `select / insert / update / delete` policies scoped to `auth.uid()` (every user can only read and modify their own rows and their children's rows)
- ✅ `handle_new_user()` trigger on `auth.users` → automatically creates a matching `profiles` row **and** a free `subscriptions` row on every signup
- ✅ `upsert_progress(p_user_id, p_child_id, p_subject, p_topic, p_score, p_grade, p_xp_earned, p_duration_seconds, p_flow_completed)` RPC, callable from the client via `supabase.rpc('upsert_progress', …)`, with `EXECUTE` granted to `authenticated`

### 4. Configure Auth

In the Supabase dashboard → **Authentication**:

1. **Providers → Email**: enable. Decide whether to require email confirmation.
2. **URL Configuration**:
   - **Site URL**: your production web URL (e.g. `https://learnova.app`) or `exp://localhost:8081` for local Expo Go testing.
   - **Redirect URLs** (add all that apply): `learnova://`, `http://localhost:8081`, `http://localhost:19006`, your production web URL, your Vercel preview URLs.
3. **Providers → Google** (optional): paste your Google Cloud OAuth client ID + secret.
4. **Providers → Azure** (optional, for Microsoft sign-in): paste your Azure App Registration client ID + secret.

### 5. Deploy the AI Edge Function

The edge function is what actually talks to Anthropic. The Anthropic API key lives **only** here, never in the app.

```bash
# Install the Supabase CLI (one time)
npm install -g supabase

# Log in
supabase login

# Link this repo to your project
supabase link --project-ref YOUR-PROJECT-REF
# (Project ref is in the URL: https://supabase.com/dashboard/project/YOUR-PROJECT-REF)

# Set the Anthropic key as a server-side secret
supabase secrets set ANTHROPIC_API_KEY=sk-ant-XXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Deploy the function
supabase functions deploy ai-tutor
```

### 6. Verify the function is live

1. Supabase Dashboard → **Edge Functions** — you should see `ai-tutor` with status **deployed**.
2. Run the app, sign up, pick a grade and subject, and start a lesson. The first AI reply confirms the entire pipeline works.
3. If the AI never replies, check **Edge Functions → ai-tutor → Logs**. The most common failures are:
   - `server_config_error` → `ANTHROPIC_API_KEY` is not set as a Supabase secret.
   - `quota_exceeded` → your Anthropic account is out of credit.
   - `service_unavailable` → Anthropic is rate-limiting or down. The app will retry.

---

## 5. Local Development Setup

### Prerequisites

- **Node.js 18+** and npm
- **Expo CLI**: bundled with Expo SDK — invoke via `npx expo`
- **EAS CLI**: `npm install -g @expo/eas-cli` (only needed for production builds, not local dev)
- **Expo Go** app on your phone (free, in App Store / Play Store) or an iOS simulator (Mac only) / Android emulator (Android Studio)

### Clone and install

```bash
git clone <your-repo-url> learnova
cd learnova
npm install
```

### Environment

```bash
cp .env.example .env
# Open .env and fill in your Supabase URL + anon key from Section 3.
```

### Run

```bash
# Interactive launcher — pick web / iOS / Android from the menu
npx expo start

# Web only (fastest, no phone needed)
npx expo start --web

# Tunnel mode (for Expo Go on a phone on a different network)
npx expo start --tunnel

# Same Wi-Fi as your phone
npx expo start --lan
```

Once it's running, scan the QR code with **Expo Go** (Android) or the **Camera app** (iOS).

### ⚠️ Known first-run quirk

The first JS bundle is large (~58s on a mid-range laptop). **Do not close Expo Go during the first load** — the progress bar may sit at 99% for ~10s while assets finalise. Subsequent loads are cached and take ~2–5 seconds.

### Useful scripts

```bash
npm run start          # expo start
npm run web            # expo start --web
npm run android        # expo start --android
npm run ios            # expo start --ios
npm run lint           # ESLint on .ts / .tsx
npm run type-check     # tsc --noEmit
```

---

## 6. Building for Production

All production builds run on Expo's cloud servers (EAS Build). First-time setup requires `eas login` and `eas build:configure` (the latter is already done — `eas.json` is committed).

### First-time setup

```bash
npm install -g @expo/eas-cli
eas login
# eas build:configure   # only needed if eas.json is missing — it isn't
```

### Build commands

| Target | Command | Output |
| --- | --- | --- |
| **Android APK** (sideload, internal testing) | `eas build --platform android --profile preview` | `.apk` download link |
| **Android App Bundle** (Play Store) | `eas build --platform android --profile production` | `.aab` download link |
| **iOS** (App Store / TestFlight) | `eas build --platform ios --profile production` | `.ipa` download link |
| **Both at once** | `eas build --platform all --profile production` | Both downloads |

> Shortcut scripts: `npm run build:android`, `npm run build:ios`, `npm run build:all`.

### What to expect

- **First Android build:** EAS will offer to generate an Android keystore. Say **yes**. Save the keystore credentials EAS gives you — losing them means you can never update the Play Store app under the same package name again.
- **First iOS build:** requires an [Apple Developer account](https://developer.apple.com/programs/) ($99/year). EAS will walk you through creating an App ID, distribution certificate, and provisioning profile.
- **Build time:** 5–15 minutes per platform on EAS's free tier.
- **Download link:** emailed when ready, also printed in your terminal.
- **Installing the APK on Android:** transfer the `.apk` to the phone, open it, and tap install. You may need to enable **Settings → Security → Install unknown apps** for your browser or file manager.

### Web build (Vercel)

```bash
npx expo export --platform web
# Outputs the static site to dist/
# vercel.json is already configured — push to GitHub and link to Vercel,
# or run `vercel deploy --prod` from the dist/ folder.
```

Set the same env vars (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, optional `EXPO_PUBLIC_SENTRY_DSN`) in the Vercel project settings.

---

## 7. Publishing to App Stores

### Google Play Store

1. **Create a developer account** at [play.google.com/console](https://play.google.com/console) — one-time fee of **$25**.
2. **Create app** → name it **Learnova — AI Tutor for Kids** → start with the **Internal testing** track.
3. Upload the `.aab` file from the production build (Section 6).
4. **Store listing** — fill in:
   - Short description (≤80 chars)
   - Full description (≤4000 chars)
   - At least 2 phone screenshots, plus a 1024×500 feature graphic
   - Privacy policy URL (required for apps targeting children)
   - App icon (already in `assets/icon.png`)
5. **Content rating** → questionnaire → expect **Everyone / Education** for this app.
6. **Pricing & distribution** → **Free**, choose countries (start with Nigeria, then expand).
7. **App content** → declare:
   - Target audience: **Ages 5–8 and 9–12** (this triggers the "Designed for Families" policy — read it carefully).
   - Data safety form.
8. **Submit for review.** Typical turnaround: 1–3 days for the first submission, hours for updates.

### Apple App Store

1. **Enroll** at [developer.apple.com](https://developer.apple.com/programs/) — **$99/year**.
2. **Create app** in [App Store Connect](https://appstoreconnect.apple.com/) using bundle ID `com.learnova.app` (already set in `app.json`).
3. **Upload build:**

    ```bash
    eas submit --platform ios --profile production
    # or: npm run submit:ios
    ```

4. **App information:**
   - Name: **Learnova — AI Tutor for Kids**
   - Subtitle (≤30 chars): e.g. "AI tutor for Primary 1–6"
   - Category: **Education** (primary), **Reference** (secondary)
   - Age rating: **4+** (set in the App Store Connect questionnaire)
5. **Screenshots** — required sizes:
   - 6.7" iPhone (iPhone 15 Pro Max) — required
   - 6.5" iPhone — required for older review
   - 5.5" iPhone — required for older review
   - 12.9" iPad Pro (if you ship an iPad build — `supportsTablet: true` is already set)
6. **Privacy policy URL** — required.
7. **Submit for review.** Typical turnaround: 1–7 days.

### Confirmed identifiers

```
App name:    Learnova
Bundle ID:   com.learnova.app   (iOS + Android, set in app.json)
Scheme:      learnova://         (for deep links + OAuth redirect)
EAS project: 53a5a55d-f949-4d25-b2e3-fb94397d6f2a
```

---

## 8. App Features Reference

### For children ✅

- 🇳🇬 **AI tutor chat in 4 Nigerian languages** — English, Hausa, Yoruba, Igbo. Switch any time.
- 🎭 **5 AI tutor personalities** — kids pick a tutor that suits their vibe.
- 📚 **Nigerian primary school curriculum** — Primary 1–6, all official FG/NERDC subjects including Pre-vocational Studies.
- 🎯 **3-step learning flow** — Hook → Practice → Reward, designed for short attention spans.
- 📝 **Quiz mode** — A/B/C/D questions with scoring and XP rewards.
- 🏆 **Achievements + streaks** — daily streak counter, level system, unlockable badges.
- 🔊 **Voice / TTS** — every AI reply can be read aloud in the chosen language (BCP 47 locales for `en-NG`, `ha-NG`, `yo-NG`, `ig-NG`).
- 📴 **Offline mode** — local quiz / flashcard bank for when the internet drops.
- 🌙 **Dark mode** — system-aware, toggleable in Settings.

### For parents ✅

- 👨‍👩‍👧‍👦 **Multiple child profiles** — each child has their own grade, language, XP, streak, and progress.
- 🔒 **PIN-protected Parent Zone** — gates settings like Subject Focus, Reports, Daily Limits, and child management. Default PIN `1234` — change immediately on first launch.
- 📊 **Per-child progress tracking** — weekly summary on the parent dashboard.
- ⏱️ **Daily study limits** — set a per-day cap.
- 🌐 **Per-child language and grade** — different children can study in different languages.
- 🔁 **Child switcher** — pill button on the dashboard opens a bottom sheet for instant switching with no page reload.

### Technical highlights

- 🤖 **Powered by Anthropic Claude Sonnet 4** (model `claude-sonnet-4-6`), accessed through a Supabase Edge Function so the API key never ships in the app.
- ☁️ **Supabase backend** — auth + Postgres + RLS + Edge Functions, all in one project.
- 📱 **One codebase, three platforms** — iOS, Android, and Web from the same source.
- 🛟 **Offline-capable** — local content bank in `src/constants/offlineContent.ts`.
- 🐛 **Error tracking via Sentry** — opt-in. All `dbService` and `aiService` errors are forwarded automatically.
- 🔁 **Expo managed workflow** — OTA updates supported via `eas update` (not enabled by default).

---

## 9. Known Limitations & Future Work

Be aware of the following before launch. Each item is shippable as-is but flagged for future iteration.

### 1. 🚧 Subscription / paywall not implemented

The `subscriptions` table is created and every new user gets a free row automatically, but there is **no free vs paid tier enforced** anywhere in the UI. Every feature is available to every account.

> **Future:** integrate a payment provider. **Paystack** is the obvious choice for Nigeria (cards + bank transfer + USSD). **Stripe** works for international users. Both can be wired through an additional Edge Function that updates the `subscriptions.plan` column on a successful webhook.

### 2. 🚧 Offline content is English-only

`src/constants/offlineContent.ts` ships a quiz / flashcard bank, but only in English. The Hausa / Yoruba / Igbo translations of that bank do not exist yet.

> **Future:** extend `offlineContent.ts` with parallel language arrays, and key by `LanguageCode` instead of a flat list.

### 3. 🚧 Settings toggles are not persisted

Difficulty, data saver, notifications, and offline mode toggles in the Settings screen are **local React state only** — they reset every time the screen closes.

> **Future:** move each toggle into `useAppStore` (Zustand persisted), and add the relevant field names to `partialize` so they survive cold launches.

### 4. 🚧 Google / Microsoft OAuth (native mobile only)

The OAuth UI exists and the **web** flow works (browser redirect → Supabase exchange → session). The **native mobile** flow opens `WebBrowser.openAuthSessionAsync(...)` but currently does not complete the `code` ↔ `session` exchange after redirect, so users land back in the app unauthenticated.

> **Future:** finish the native flow with `expo-auth-session`'s `useAuthRequest` and `exchangeCodeAsync` (or have Supabase's session listener catch the deep link), then call `supabase.auth.setSession(...)`.

### 5. 🚧 TTS on non-English languages depends on device

The locale codes are correct (`ha-NG`, `yo-NG`, `ig-NG`), but device TTS voice packs for Hausa / Yoruba / Igbo are not installed by default on most Android or iOS devices. Where unsupported, `useSpeech` falls back to `en-NG` automatically — the user hears English with no error.

> **Future:** add a Settings toggle that lets the parent install / point at a third-party TTS engine (e.g. an ElevenLabs proxy), or pre-record a small library of phrases in each language and ship them as `expo-av` audio.

### 6. 🚧 Language coverage on secondary screens

The four core languages have full translations for the main learning flow (`dashboard`, `lesson`, `auth`). Some secondary screens (`parent-dashboard`, `achievements`, `settings`) remain English-only because they are parent-facing.

> **Future:** extend `useTranslation` with the missing keys and replace remaining hardcoded strings on those screens. A grep for hardcoded English in `app/settings.tsx` is a good start.

---

## 10. Maintenance Guide

### Updating the AI model

The current model name lives in **one place**: the edge function, **not** the app bundle.

```11:11:supabase/functions/ai-tutor/index.ts
const ANTHROPIC_MODEL = 'claude-sonnet-4-6';
```

To upgrade to a newer Claude model:

1. Edit `supabase/functions/ai-tutor/index.ts`.
2. Change the `ANTHROPIC_MODEL` constant. See the [Anthropic models reference](https://docs.anthropic.com/en/docs/about-claude/models) for current names.
3. Redeploy: `supabase functions deploy ai-tutor`.

No app rebuild required — every existing install will use the new model on its next request.

### Adding a new subject

1. Open `src/constants/subjects.ts`.
2. Add the subject to the relevant grade arrays (each grade has its own list).
3. If the subject deserves bespoke teaching context (like Pre-vocational Studies does in `aiService.ts`), add an `if (subjectId === 'your-id')` branch in `buildSystemPrompt`.
4. Add offline questions to `src/constants/offlineContent.ts` so it still works offline.

### Adding a new language

1. Open `src/constants/languages.ts`. Add a new entry to `LANGUAGES` with all `UI_TEXT` keys translated.
2. Open `src/hooks/useSpeech.ts`. Add the BCP 47 locale to `SPEECH_LOCALES` (e.g. `pcm: 'pcm-NG'` for Nigerian Pidgin).
3. Add a system-prompt instruction in `LANGUAGE_PROMPTS` so Claude knows to respond in that language.

### Adding a new AI tutor personality

1. Open `src/constants/personalities.ts`.
2. Add a new object with `id`, `name`, `avatar` (emoji or asset), `description`, and a clear `systemPrompt` that defines voice / vocabulary / boundaries.
3. The personality automatically appears in `app/personality.tsx` — no other changes needed.

### Monitoring errors

1. Set `EXPO_PUBLIC_SENTRY_DSN` in `.env` (dev) and in the EAS / Vercel environment (prod).
2. All `dbService.ts` errors are already routed through `captureError(error, { context: '...' })`, and `aiService.ts` does the same for AI failures. They appear in your Sentry project automatically.
3. To add Sentry coverage to a new module: `import { captureError } from '@/lib/sentry';` then call `captureError(err, { context: 'where it happened' });` in your `catch` blocks.

### Supabase database changes

⚠️ Always update `supabase/schema.sql` to match anything you change in the Supabase dashboard. This is the only versioned record of the schema. If you forget, the next person setting up a fresh project will end up with a different (broken) database.

Workflow:

1. Make the change in the Supabase dashboard SQL editor.
2. Copy the `CREATE TABLE` / `ALTER TABLE` / `CREATE POLICY` statement.
3. Paste it (idempotently — use `IF NOT EXISTS` / `DROP POLICY IF EXISTS`) into `supabase/schema.sql`.
4. Commit.

### Useful one-off commands

```bash
npm run type-check                          # tsc --noEmit — run before committing
npm run lint                                # ESLint on .ts / .tsx
supabase functions logs ai-tutor --tail     # live edge function logs
supabase functions serve ai-tutor --env-file supabase/.env  # run locally
```

---

## 11. Default Credentials & PIN

> ⚠️ **IMPORTANT — read before handing the device to a child.**
>
> | Item | Default | What to do |
> | --- | --- | --- |
> | Parent Portal PIN | **`1234`** | Change this in **Settings → Change Parent PIN** on first launch. The Settings hint text will explicitly tell you to do this until you change it. |
> | Test account | None hardcoded | Create a fresh account via the **Sign Up** screen — the database has no seed users. |
>
> ### Key handling — read twice
>
> | Key | Where it lives | Where it must NEVER live |
> | --- | --- | --- |
> | Supabase **anon** key (`EXPO_PUBLIC_SUPABASE_ANON_KEY`) | `.env`, app bundle, EAS / Vercel env | Nowhere is unsafe — RLS protects the data. Safe to expose. |
> | Supabase **service_role** key | Supabase dashboard only | ❌ Never in `.env`, never in the app, never in an Edge Function unless you fully understand the implications. It bypasses RLS. |
> | **Anthropic** API key (`ANTHROPIC_API_KEY`) | Supabase **secrets** only (`supabase secrets set …`) | ❌ Never in `.env`, never in `app.json`, never in any `EXPO_PUBLIC_*` variable. It is read by the `ai-tutor` Edge Function at runtime via `Deno.env.get()`. |
> | **Sentry** DSN | `.env` as `EXPO_PUBLIC_SENTRY_DSN` | Safe to embed. DSNs are public by design. |

---

## 12. Contact & Credits

**Built by:** _[Developer name]_  
**Contact:** _[email]_  
**Built with:** Expo · React Native · TypeScript · Supabase · Anthropic Claude

### Third-party services

| Service | URL | Purpose |
| --- | --- | --- |
| Supabase | [supabase.com](https://supabase.com) | Postgres database, authentication, Edge Functions |
| Anthropic | [anthropic.com](https://anthropic.com) | Claude AI model that powers the tutor |
| Expo | [expo.dev](https://expo.dev) | React Native runtime, build (EAS), updates |
| Sentry | [sentry.io](https://sentry.io) | Error tracking (optional) |
| Vercel | [vercel.com](https://vercel.com) | Web deployment (optional) |
| Google Play | [play.google.com/console](https://play.google.com/console) | Android distribution |
| Apple App Store | [developer.apple.com](https://developer.apple.com) | iOS distribution |

### Open-source libraries

- `@supabase/supabase-js`, `@sentry/react-native`, `zustand`, `expo-router`, `expo-speech`, `expo-auth-session`, `expo-web-browser`, `react-native-markdown-display`, `react-native-reanimated`, `react-native-gesture-handler`, `@react-native-async-storage/async-storage`, `@react-native-community/netinfo`.
- See `package.json` for the full list and exact versions.

### License

See `LICENSE` at the repo root.

---

_Last updated: 2026-05-19. Keep this file current — it is the single source of truth for new developers and prospective buyers._
