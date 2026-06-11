Learnova — Project Handover

AI-powered primary school tutoring app for Nigerian children (Primary 1–6).
This document is everything a new developer or buyer needs to deploy, run,
publish, and maintain Learnova from a clean machine.


Table of Contents

Project Overview
Repository Structure
Environment Variables
Supabase Setup
Google OAuth Setup
Local Development Setup
Building for Production
Deploying to Vercel
Publishing to App Stores
App Features Reference
Known Limitations & Future Work
Maintenance Guide
Default Credentials & PIN
Contact & Credits


1. Project Overview
Learnova is an AI-powered tutoring app that brings a personal, culturally-grounded tutor to every Nigerian primary school child. It speaks four Nigerian languages, follows the official FG/NERDC primary curriculum, and gamifies learning with XP, streaks, achievements, and a quiz mode.
What the app does

For the child: chat one-on-one with an AI tutor that knows their grade, their subject, and their language. Lessons are short (≤4 sentences per reply), warm, and use Nigerian examples. There is also an offline activity bank, a quiz mode, voice playback (TTS), and a 3-step learning flow (Hook → Practice → Reward).
For the parent: create profiles for each child, switch between them on the dashboard, see weekly progress per child, set daily study limits, and protect parent-only settings behind a PIN.

Tech stack
LayerTechnologyApp runtimeExpo SDK 54, React Native 0.81, React 19LanguageTypeScript 5.9RoutingExpo Router 6 (file-based, typed routes)StateZustand 5 + @react-native-async-storage/async-storage (persistence)BackendSupabase (Postgres + Auth + Edge Functions)AIAnthropic Claude (claude-sonnet-4-6), called via a Supabase Edge Function so the API key never ships in the app bundleAuthSupabase email/password + Google OAuthVoiceexpo-speech (device TTS, BCP 47 locales en-NG, ha-NG, yo-NG, ig-NG)Error tracking@sentry/react-native (optional, opt-in via DSN)BuildEAS Build (cloud), EAS Submit
Platforms
✅ iOS · ✅ Android · ✅ Web (Expo Web → Vercel)
Target users
Nigerian parents and their primary school children (Primary 1–6, ages ~5–12).

2. Repository Structure
naija-learn/
├── app/                                # Expo Router screens (file = route)
│   ├── _layout.tsx                     # Root stack, auth gating, splash, fonts, SEO
│   ├── index.tsx                       # Welcome / language picker → routes to auth or dashboard
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
│   │   ├── dbService.ts                # All Supabase reads/writes (profiles, children,
│   │   │                               #   progress, RPC). Errors via Sentry.
│   │   ├── aiService.ts                # Builds system prompt + calls ai-tutor edge function
│   │   └── oauthService.ts             # Google OAuth via Supabase
│   ├── store/
│   │   ├── appStore.ts                 # Persisted learning state (xp, streak,
│   │   │                               #   active child, parent PIN, settings)
│   │   └── authStore.ts                # Supabase session, user, role
│   ├── lib/
│   │   ├── supabase.ts                 # Supabase client (detectSessionInUrl: true)
│   │   ├── env.ts                      # Reads EXPO_PUBLIC_* env vars
│   │   └── sentry.ts                   # initialiseSentry() + captureError helper
│   ├── types/                          # TypeScript interfaces
│   └── utils/                          # Misc helpers (navigation, formatting)
├── supabase/
│   ├── schema.sql                      # ⚠️ Run this FIRST in a fresh project
│   └── functions/
│       └── ai-tutor/                   # Deno edge function — proxies Claude
│           ├── index.ts                # ANTHROPIC_API_KEY read from secrets here
│           └── deno.json
├── assets/
│   ├── fonts/                          # Poppins (Regular, SemiBold, Bold)
│   ├── images/                         # App images including logo
│   ├── sounds/                         # UI sounds (correct, xp, streak, etc.)
│   └── icon.png · adaptive-icon.png · splash-icon.png · favicon.png
├── public/                             # Static files served at web root
│   └── google21372c455f1e0d9d.html     # Google Search Console verification
├── app.json                            # Expo config (name, bundle IDs, plugins)
├── eas.json                            # EAS Build profiles (preview, production)
├── vercel.json                         # Web deployment config
├── .env.example                        # Copy to .env and fill in
├── BUILD.md                            # Quick build reference
├── HANDOVER.md                         # This file
└── package.json

3. Environment Variables
Only two variables are required to boot the client app.
Required (client .env)
VariableWhere to get itEXPO_PUBLIC_SUPABASE_URLSupabase Dashboard → Project Settings → API → Project URLEXPO_PUBLIC_SUPABASE_ANON_KEYSupabase Dashboard → Project Settings → API → anon / public key
Optional (client .env)
VariablePurposeEXPO_PUBLIC_SENTRY_DSNError tracking via Sentry. If unset, Sentry is silently disabled.
Server-side only — NEVER in the client .env
VariableWhere it livesHow to set itANTHROPIC_API_KEYSupabase Edge Function secrets onlysupabase secrets set ANTHROPIC_API_KEY=sk-ant-...
.env file template
Copy .env.example to .env and fill in:
bash# Required
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key...

# Optional
EXPO_PUBLIC_SENTRY_DSN=https://xxxxxxxx@oXXXXXX.ingest.sentry.io/XXXXXX
⚠️ Never add ANTHROPIC_API_KEY to .env. It belongs in Supabase secrets only.

4. Supabase Setup (Step by Step)
These steps take a fresh Supabase project from zero to a fully working backend.
Step 1 — Create a Supabase project

Sign up or log in at supabase.com
Click New project → name it learnova → choose a region close to Nigeria (e.g. eu-west-1 / Ireland) → set a strong database password and save it
Wait for the project to finish provisioning (~2 minutes)

Step 2 — Copy the API credentials

Go to Project Settings → API
Copy Project URL → paste into .env as EXPO_PUBLIC_SUPABASE_URL
Copy the anon public key → paste into .env as EXPO_PUBLIC_SUPABASE_ANON_KEY


⚠️ The service_role key is server-only. Never put it in .env or any client file — it bypasses Row Level Security.

Step 3 — Run the schema

Open SQL Editor in the Supabase dashboard
Click New query
Open supabase/schema.sql from the repo, copy the entire file, paste it into the editor
Click Run
Confirm there are no errors

What this creates:

✅ profiles table — user profile, XP, streak, grade, avatar, language, achievements
✅ children table — multiple child profiles per parent account
✅ progress table — per-subject lesson history
✅ subscriptions table — free/paid tier (paywall not yet enforced in UI)
✅ Row Level Security on all 4 tables — users can only access their own data
✅ handle_new_user() trigger — automatically creates a profiles row and a free subscriptions row on every new signup
✅ upsert_progress() RPC — secured with auth.uid() checks
✅ Index on profiles.username for fast sign-in lookups

Step 4 — Configure Auth settings
In the Supabase dashboard → Authentication → URL Configuration:

Site URL: set to your production web URL (e.g. https://learnova.app)
Redirect URLs — add all of these:

   https://yourdomain.com
   https://yourdomain.com/*
   https://yourdomain.com/auth/sign-in
   https://yourdomain.com/auth/sign-in?oauth=1
   http://localhost:8081
   http://localhost:19006
   learnova://
Step 5 — Enable Email Auth

Go to Authentication → Sign In / Providers
Find Email and make sure it is Enabled
Decide whether to require email confirmation (recommended: off for development, on for production)

Step 6 — Deploy the AI Edge Function
The edge function is what talks to Anthropic. The API key lives only here.
bash# Install the Supabase CLI (one time)
npm install -g supabase

# Log in
supabase login

# Link this repo to your Supabase project
supabase link --project-ref YOUR-PROJECT-REF
# (Project ref is the ID in the URL:
#  https://supabase.com/dashboard/project/YOUR-PROJECT-REF)

# Set the Anthropic API key as a server-side secret
supabase secrets set ANTHROPIC_API_KEY=sk-ant-XXXXXXXXXXXXXXXXXXXX

# Deploy the edge function
supabase functions deploy ai-tutor
Step 7 — Verify the function is live

Go to Supabase Dashboard → Edge Functions — you should see ai-tutor with status Deployed
Sign in to the app, pick a grade and subject, and start a lesson
The first AI reply confirms the entire pipeline is working

If the AI never replies, check Edge Functions → ai-tutor → Logs:

server_config_error → ANTHROPIC_API_KEY is not set as a Supabase secret
quota_exceeded → your Anthropic account is out of credit
service_unavailable → Anthropic is rate-limiting; the app will retry automatically

Getting your Anthropic API Key

Go to console.anthropic.com
Sign up or log in
Go to API Keys → Create Key
Copy the key (starts with sk-ant-...)
Set it via: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...


⚠️ Anthropic API usage is billed per token. Monitor your usage at console.anthropic.com/usage. The current model is claude-sonnet-4-6 — check docs.anthropic.com for the latest model names and pricing.


5. Google OAuth Setup
Google sign-in is already wired in the app. You need to create your own Google Cloud OAuth credentials and connect them to Supabase.
Step 1 — Create a Google Cloud project

Go to console.cloud.google.com
Click the project dropdown at the top → New Project
Name it Learnova → click Create

Step 2 — Configure the OAuth consent screen

In the left sidebar go to APIs & Services → OAuth consent screen
Select External → click Create
Fill in:

App name: Learnova
User support email: your email
Developer contact email: your email


Click Save and Continue through the remaining steps

Step 3 — Create OAuth credentials

Go to APIs & Services → Credentials
Click Create Credentials → OAuth Client ID
Application type: Web application
Name: Learnova Web
Under Authorised redirect URIs add:

   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
Replace YOUR-PROJECT-REF with your actual Supabase project reference.
6. Click Create
7. Copy the Client ID and Client Secret — you will need both in the next step
Step 4 — Add credentials to Supabase

Go to Supabase Dashboard → Authentication → Sign In / Providers
Find Google and click it
Toggle it ON
Paste your Client ID and Client Secret
Click Save

Step 5 — Test Google sign-in

Open the app and click Sign in with Google
Complete the Google auth flow
You should be redirected back to the app and land on the dashboard


⚠️ The first time you test, Google may show a warning screen ("This app isn't verified"). Click Advanced → Go to Learnova (unsafe) — this is normal during development. To remove the warning, submit your app for Google verification in the OAuth consent screen settings.


6. Local Development Setup
Prerequisites

Node.js 18+ and npm
Expo Go app on your phone (free, App Store / Play Store) or an Android emulator / iOS simulator

Clone and install
bashgit clone <your-repo-url> learnova
cd learnova
npm install
Environment
bashcp .env.example .env
# Fill in your Supabase URL and anon key
Run
bash# Interactive launcher
npx expo start

# Web only (fastest)
npx expo start --web

# Tunnel mode (phone on different network)
npx expo start --tunnel
Scan the QR code with Expo Go (Android) or the Camera app (iOS).
⚠️ First-run note
The first JS bundle takes ~60 seconds on a mid-range laptop. Do not close Expo Go during the first load — the progress bar may sit at 99% for ~10 seconds while assets finalise. Subsequent loads take 2–5 seconds.
Useful scripts
bashnpm run start          # expo start
npm run web            # expo start --web
npm run android        # expo start --android
npm run ios            # expo start --ios
npm run type-check     # tsc --noEmit

7. Building for Production
All production builds run on Expo's cloud servers (EAS Build).
First-time setup
bashnpm install -g @expo/eas-cli
eas login
Build commands
TargetCommandOutputAndroid APK (internal testing)eas build --platform android --profile preview.apk download linkAndroid App Bundle (Play Store)eas build --platform android --profile production.aab download linkiOS (App Store / TestFlight)eas build --platform ios --profile production.ipa download linkBoth platformseas build --platform all --profile productionBoth
Important notes

Android keystore: On your first Android build, EAS will offer to generate a keystore. Say yes and save the credentials. Losing them means you can never update the Play Store app under the same package name.
iOS: Requires an Apple Developer account ($99/year). EAS walks you through certificates and provisioning profiles.
Build time: 5–15 minutes per platform on EAS free tier.


8. Deploying to Vercel
The web version is already configured for Vercel via vercel.json.
Steps

Push the repo to GitHub
Go to vercel.com → New Project → import the repo
Add environment variables in Vercel project settings:

EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_SENTRY_DSN (optional)


Deploy

Vercel will auto-deploy on every push to main.
Manual deploy
bashnpx expo export --platform web
vercel deploy --prod
Custom domain
In Vercel project settings → Domains → add your domain. Update the Site URL in Supabase Auth settings to match.

9. Publishing to App Stores
Google Play Store

Create a developer account at play.google.com/console — one-time fee of $25
Create app → name: Learnova — AI Tutor for Kids → start with Internal testing
Upload the .aab from the production build
Fill in the store listing:

Short description (≤80 chars)
Full description (≤4000 chars)
At least 2 phone screenshots + a 1024×500 feature graphic
Privacy policy URL (required for apps targeting children)


Content rating → questionnaire → expect Everyone / Education
Target audience: Ages 5–8 and 9–12 (triggers Designed for Families policy — read it carefully)
Pricing: Free, distribute to Nigeria first then expand
Submit for review — typically 1–3 days for first submission

Apple App Store

Enroll at developer.apple.com — $99/year
Create app in App Store Connect using bundle ID com.learnova.app
Upload build:

bash   eas submit --platform ios --profile production

App information:

Name: Learnova — AI Tutor for Kids
Category: Education
Age rating: 4+


Required screenshot sizes: 6.7", 6.5", 5.5" iPhone + 12.9" iPad Pro
Privacy policy URL required
Submit for review — typically 1–7 days

App identifiers
App name:    Learnova
Bundle ID:   com.learnova.app
Scheme:      learnova://
EAS project: 53a5a55d-f949-4d25-b2e3-fb94397d6f2a

10. App Features Reference
For children

🇳🇬 AI tutor in 4 Nigerian languages — English, Hausa, Yorùbá, Igbo
🎭 5 AI tutor personalities — kids pick a tutor that suits their vibe
📚 Full NERDC curriculum — Primary 1–6, all official FG subjects
🎯 3-step learning flow — Hook → Practice → Reward
📝 Quiz mode — A/B/C/D questions with XP rewards
🏆 Achievements + streaks — 27 achievements, daily streak, level system
🔊 Voice / TTS — every AI reply can be read aloud in the chosen language
📴 Offline mode — local quiz/flashcard bank for when internet drops
🌙 Dark mode — system-aware, toggleable in Settings

For parents

👨‍👩‍👧‍👦 Multiple child profiles — each child has their own grade, language, XP, and progress
🔒 PIN-protected Parent Zone — gates settings, reports, and child management. Default PIN: 1234
📊 Per-child progress tracking — weekly summary on the parent dashboard
⏱️ Daily study limits — set a per-day cap per child
🔁 Child switcher — instant switching between children on the dashboard

Technical highlights

🤖 Anthropic Claude Sonnet 4 via Supabase Edge Function — API key never in the app bundle
☁️ Supabase backend — Auth + Postgres + RLS + Edge Functions
📱 One codebase, three platforms — iOS, Android, Web
🛟 Offline-capable — local content bank in src/constants/offlineContent.ts
🐛 Sentry error tracking — opt-in via EXPO_PUBLIC_SENTRY_DSN


11. Known Limitations & Future Work
1. 🚧 Subscription / paywall not enforced
The subscriptions table exists and every new user gets a free row automatically, but there is no free vs paid tier enforced in the UI. Every feature is available to every account.

Future: integrate Paystack (Nigeria) or Stripe (international) via an Edge Function that updates subscriptions.plan on a successful payment webhook.

2. 🚧 Offline content is English-only
The offline quiz/flashcard bank (src/constants/offlineContent.ts) is English only. Hausa, Yorùbá, and Igbo translations do not exist yet.

Future: extend offlineContent.ts with parallel language arrays keyed by LanguageCode.

3. 🚧 Settings toggles not persisted
Difficulty, data saver, notifications, and offline mode toggles in Settings are local React state — they reset when the screen closes.

Future: move each toggle into useAppStore (Zustand persisted) and add to partialize.

4. 🚧 Google OAuth on native mobile incomplete
The web OAuth flow works fully. The native mobile flow opens WebBrowser.openAuthSessionAsync but does not complete the session exchange after redirect, leaving users unauthenticated on mobile.

Future: finish native OAuth with expo-auth-session's useAuthRequest and exchangeCodeAsync.

5. 🚧 TTS on non-English languages depends on device
Locale codes are correct (ha-NG, yo-NG, ig-NG) but these voice packs are not installed by default on most devices. useSpeech falls back to en-NG automatically with no error shown.

Future: add a Settings option to point to a third-party TTS engine or pre-recorded audio via expo-av.

6. 🚧 Language coverage on secondary screens
Core screens (dashboard, lesson, auth) are fully translated. Some parent-facing screens (parent-dashboard, achievements, settings) remain English-only.

Future: extend useTranslation with missing keys and replace hardcoded English strings.

7. 🚧 ai-tutor edge function has no JWT verification
Currently any request with a valid anon key can invoke the AI edge function. This means if someone finds your Supabase URL and anon key (both are in the client bundle), they could call the AI without being a registered user.

Future: add JWT verification at the top of supabase/functions/ai-tutor/index.ts using supabase.auth.getUser(jwt) and reject unauthenticated callers.


12. Maintenance Guide
Updating the AI model
The model name lives in one place — the edge function:
typescript// supabase/functions/ai-tutor/index.ts
const ANTHROPIC_MODEL = 'claude-sonnet-4-6';
To upgrade:

Edit supabase/functions/ai-tutor/index.ts and change ANTHROPIC_MODEL
Check docs.anthropic.com/en/docs/about-claude/models for current model names
Redeploy: supabase functions deploy ai-tutor

No app rebuild required.
Adding a new subject

Open src/constants/subjects.ts
Add the subject to the relevant grade arrays
Add offline questions to src/constants/offlineContent.ts
If the subject needs bespoke teaching context, add a branch in aiService.ts → buildSystemPrompt

Adding a new language

Open src/constants/languages.ts → add a new entry with all UI_TEXT keys translated
Open src/hooks/useSpeech.ts → add the BCP 47 locale to SPEECH_LOCALES
Add a LANGUAGE_PROMPTS entry in aiService.ts so Claude responds in that language

Adding a new AI tutor personality

Open src/constants/personalities.ts
Add a new object with id, name, avatar, description, and systemPrompt
The personality appears automatically in app/personality.tsx — no other changes needed

Monitoring errors

Set EXPO_PUBLIC_SENTRY_DSN in .env and in Vercel environment settings
All dbService.ts and aiService.ts errors are already routed through captureError()
To add coverage to a new module:

typescript   import { captureError } from '@/lib/sentry';
   // in your catch block:
   captureError(err, { context: 'where it happened' });
Keeping the schema in sync
⚠️ Always update supabase/schema.sql to match any changes you make in the Supabase dashboard. This is the only versioned record of the schema.
Workflow:

Make changes in the Supabase SQL editor
Copy the CREATE TABLE / ALTER TABLE / CREATE POLICY statement
Add it idempotently to supabase/schema.sql (use IF NOT EXISTS)
Commit

Useful commands
bashnpm run type-check                           # Run before every commit
supabase functions logs ai-tutor --tail      # Live edge function logs
supabase functions serve ai-tutor            # Run edge function locally
eas update                                   # Push OTA JS update (no app store review)

13. Default Credentials & PIN

⚠️ Read this before handing the device to a child.

ItemDefaultAction requiredParent Portal PIN1234Change in Settings → Change Parent PIN on first launchTest accountNone hardcodedCreate a fresh account via Sign Up — no seed users in the database
Key handling
KeyWhere it livesMust NEVER be inSupabase anon key.env, app bundle, Vercel envNowhere unsafe — RLS protects data. Safe to expose.Supabase service_role keySupabase dashboard only❌ .env, app bundle, any client fileAnthropic API keySupabase secrets only❌ .env, app.json, any EXPO_PUBLIC_* variableSentry DSN.env as EXPO_PUBLIC_SENTRY_DSNSafe to expose — DSNs are public by designGoogle OAuth Client SecretSupabase Auth provider settings only❌ Client code, .env, or any file in the repo

14. Contact & Credits
Built by: Enoch Rejesho Luke
Contact: enochrejesho254@gmail.com
For questions about the codebase, architecture decisions, or feature handover, reach out via email.
Third-party services
ServiceURLPurposeSupabasesupabase.comDatabase, authentication, Edge FunctionsAnthropicanthropic.comClaude AI model powering the tutorExpoexpo.devReact Native runtime, EAS BuildSentrysentry.ioError tracking (optional)Vercelvercel.comWeb deploymentGoogle Cloudconsole.cloud.google.comGoogle OAuth credentialsGoogle Playplay.google.com/consoleAndroid distributionApple App Storedeveloper.apple.comiOS distribution
Open-source libraries
@supabase/supabase-js · zustand · expo-router · expo-speech · expo-auth-session · expo-web-browser · @sentry/react-native · react-native-reanimated · react-native-gesture-handler · @react-native-async-storage/async-storage · @react-native-community/netinfo · react-native-markdown-display
See package.json for the full list and exact versions.
License
See LICENSE at the repo root.

Last updated: 2026-05-24. Keep this file current — it is the single source of truth for new developers and buyers.