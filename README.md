# Learnova

AI-powered primary school tutor for Nigerian pupils (Primary 1–6).
Children chat with an AI teacher (Claude by Anthropic) in English,
Yorùbá, Igbo, or Hausa, following Nigeria's official NERDC curriculum.

## What makes Learnova different

- **Built natively for Nigeria** — Nigerian names, Naira, and culturally familiar examples in every lesson
- **NERDC curriculum aligned** — Subjects and prompts scoped to Primary 1–6 and Nigeria's revised national curriculum (FG/NERDC)
- **AI key secured server-side** — The Anthropic API key never ships in the app; only a Supabase Edge Function holds it
- **Works on low-end Android devices** — React Native UI, no heavy WebView shell; animations use Reanimated efficiently
- **Offline detection with graceful degradation** — NetInfo banner on every screen; lesson chat disables send when offline

## Tech stack

| Technology | Why we use it |
|------------|----------------|
| **Expo (SDK 54)** | Fast cross-platform development for iOS, Android, and web from one codebase |
| **React Native** | Native-feeling UI on phones, including low-end Android common in Nigerian schools |
| **Expo Router** | File-based navigation (`app/` screens) with typed routes and deep linking |
| **Zustand + AsyncStorage persist** | Lightweight global state; language, grade, subject, and study time survive app restarts |
| **Supabase Edge Functions** | Serverless proxy for AI calls — keeps secrets off the client |
| **Anthropic Claude API (`claude-sonnet-4-6`)** | High-quality tutoring responses with strong instruction-following for children |
| **react-native-markdown-display** | Renders AI replies (bold, lists, headings) instead of raw `**` and `##` in chat bubbles |
| **@react-native-community/netinfo** | Detects connectivity for offline banners and disabling the lesson input |
| **@sentry/react-native** | Production error tracking (optional; skipped when `EXPO_PUBLIC_SENTRY_DSN` is unset) |
| **TypeScript (strict mode)** | Catches bugs at compile time; shared types in `src/types/` for future features |

**Also in use:** `react-native-reanimated` (animations), `react-native-gesture-handler` + `react-native-safe-area-context` (layout), `expo-splash-screen`, `babel-plugin-module-resolver` (`@/` imports).

## Project structure

```
naija-learn/
├── app/                          # Expo Router screens (file = route)
│   ├── _layout.tsx               # Root shell: splash, hydration gate, Sentry boundary, offline banner, stack
│   ├── index.tsx                 # Welcome — choose interface language
│   ├── grade.tsx                 # Primary 1–6 picker + NERDC grade reference
│   ├── dashboard.tsx             # Subject grid (core / languages / life skills)
│   └── lesson.tsx                # AI tutor chat, quick actions, quiz mode, markdown bubbles
│
├── src/
│   ├── components/               # Reusable UI
│   │   ├── Atmosphere.tsx        # Decorative full-screen background
│   │   ├── GlassCard.tsx         # Frosted card container
│   │   ├── PressableScale.tsx    # Touchable with press animation
│   │   ├── OfflineBanner.tsx     # Yellow banner when device is offline
│   │   └── MarkdownMessage.tsx   # Markdown renderer for assistant chat bubbles
│   ├── constants/
│   │   ├── languages.ts          # EN / YO / IG / HA UI strings and AI language prompts
│   │   ├── subjects.ts           # NERDC subjects, grades, quick actions, quiz prompts
│   │   └── theme.ts              # Colors, spacing, radii, font sizes
│   ├── services/
│   │   └── aiService.ts          # System prompt builder; POSTs to Supabase `ai-tutor` edge function
│   ├── store/
│   │   └── appStore.ts           # Zustand: selections, chat, hydration, session timing, persist
│   ├── hooks/
│   │   └── useNetworkStatus.ts   # `isConnected` / `isChecking` from NetInfo
│   ├── lib/
│   │   └── sentry.ts             # Sentry init, captureError, captureMessage
│   ├── types/                    # Shared TypeScript models (future auth, reports, etc.)
│   │   ├── user.types.ts
│   │   ├── curriculum.types.ts
│   │   ├── progress.types.ts
│   │   ├── ai.types.ts
│   │   └── index.ts
│   └── utils/                    # Reserved for shared helpers (empty for now)
│
├── supabase/
│   └── functions/
│       └── ai-tutor/             # Deno edge function — calls Anthropic Messages API
│           ├── index.ts
│           └── deno.json
│
├── assets/                       # App icon, splash, favicon
├── .env.example                  # Template for client env vars (copy to `.env`)
├── app.json                      # Expo config (name, plugins, web static export)
├── babel.config.js               # Reanimated plugin + `@/` → `src/` alias
├── tsconfig.json                 # Strict TypeScript + path mapping
├── vercel.json                   # Web deploy: `npm run build:web` → `dist/`
└── package.json
```

**Path alias:** `@/components/Foo` resolves to `src/components/Foo` (see `tsconfig.json` and `babel.config.js`).

## Setup

Follow these steps in order from a fresh clone.

### 1. Prerequisites

- [Node.js](https://nodejs.org/) **18+** (LTS recommended) and **npm**
- [Expo Go](https://expo.dev/go) on a phone, or Android/iOS emulator / web browser
- [Supabase CLI](https://supabase.com/docs/guides/cli) for deploying the AI edge function
- An [Anthropic](https://console.anthropic.com/) API key (server-side only)
- A [Supabase](https://supabase.com/) project (free tier is fine)

### 2. Clone and install

```bash
git clone <your-repo-url>
cd naija-learn
npm install
```

### 3. Client environment (`.env`)

```bash
cp .env.example .env
```

Edit `.env` and set:

- `EXPO_PUBLIC_SUPABASE_URL` — Supabase → **Project Settings → API → Project URL**
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — **Project Settings → API → anon public** key

Leave `EXPO_PUBLIC_SENTRY_DSN` empty for local development (Sentry will skip init).

Restart the dev server after any `.env` change.

### 4. Supabase project and edge function

1. Create a project at [supabase.com](https://supabase.com) if you do not have one.
2. Log in and link the CLI (from the project root):

   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   ```

   Find `<your-project-ref>` in the Supabase dashboard URL: `https://supabase.com/dashboard/project/<project-ref>`.

3. Set the Anthropic secret (never commit this value):

   ```bash
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-...
   ```

4. Deploy the tutor function:

   ```bash
   supabase functions deploy ai-tutor
   ```

5. **Optional — test the function locally**

   Create `supabase/.env` (gitignored) with:

   ```
   ANTHROPIC_API_KEY=sk-ant-api03-...
   ```

   Then:

   ```bash
   supabase functions serve ai-tutor --env-file supabase/.env
   ```

   Point `EXPO_PUBLIC_SUPABASE_URL` at your linked project; local serve uses the same project URL with the local function URL only when configured for local development.

### 5. Run the app locally

```bash
npm run start:online
```

Or with a clean Metro cache:

```bash
npx expo start --clear
```

| Command | Description |
|---------|-------------|
| `npm run start:online` | Expo dev server (network enabled) |
| `npm start` | Expo dev server in offline mode |
| `npm run android` | Open on Android emulator/device |
| `npm run ios` | Open on iOS simulator/device |
| `npm run web` | Run in the browser |
| `npm run build:web` | Static export to `dist/` (for Vercel) |

Scan the QR code with **Expo Go**, or press `w` (web), `a` (Android), or `i` (iOS).

### 6. First-run flow in the app

1. **Welcome** — Pick English, Yorùbá, Igbo, or Hausa  
2. **Grade** — Choose Primary 1–6  
3. **Dashboard** — Pick a subject  
4. **Lesson** — Chat with the AI tutor (requires network and a deployed `ai-tutor` function)

Persisted language and grade load after a short “Loading your classroom…” screen so the welcome screen does not flash on restart.

## Environment variables

| Variable | Where to get it | Required? | Used by |
|----------|-----------------|-----------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → **Project URL** | **Yes** | Expo app → `aiService.ts` calls `/functions/v1/ai-tutor` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → **anon public** | **Yes** | Expo app → `Authorization: Bearer` on edge function requests |
| `EXPO_PUBLIC_SENTRY_DSN` | [sentry.io](https://sentry.io) → Project → **Client DSN** | No | `src/lib/sentry.ts` (production only when set) |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com/) | **Yes** (for AI) | **Supabase only** — `supabase secrets set` or `supabase/.env` for local `functions serve` |

> **Never** put `ANTHROPIC_API_KEY` in the Expo `.env` or commit it. The mobile/web bundle must not contain it.

Copy `.env.example` to `.env` for client variables. See `.env.example` for comments.

## Deployment

### Mobile (Android / iOS)

Use [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android   # or ios
```

Set `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, and optionally `EXPO_PUBLIC_SENTRY_DSN` in [EAS secrets](https://docs.expo.dev/build-reference/variables/) for production builds.

Legacy `expo build` is deprecated; prefer EAS.

### Web (Vercel)

`vercel.json` is already configured:

- **Build command:** `npm run build:web`
- **Output directory:** `dist`

Connect the repo to Vercel and add the same `EXPO_PUBLIC_*` environment variables in the Vercel project settings. Deploy on push or run locally:

```bash
npm run build:web
```

### Edge function (Supabase)

After code changes to `supabase/functions/ai-tutor/`:

```bash
supabase functions deploy ai-tutor
```

Ensure `ANTHROPIC_API_KEY` is set in Supabase secrets for that project.

## Architecture decisions

**Why is the AI key in an Edge Function instead of the app?**

Anyone can unpack a mobile or web app and read strings baked into the bundle. If we put `ANTHROPIC_API_KEY` in `.env` with an `EXPO_PUBLIC_` prefix—or shipped it any other way in the client—anyone could copy that key and run up your bill or abuse the API.

Learnova’s phone and browser only know the **Supabase project URL** and the **anon key** (designed to be public). When a pupil sends a message, `aiService.ts` POSTs to `https://<project>.supabase.co/functions/v1/ai-tutor`. That Deno function runs on Supabase’s servers, reads `ANTHROPIC_API_KEY` from **secrets**, and calls Claude. The model never talks to the device directly; the device never sees the Anthropic key.

That is the same pattern most production apps use: **public client → your backend → paid API**. Here, “your backend” is one small edge function, which keeps the MVP simple without sacrificing security.

## Known limitations

- **No user auth yet** (coming next) — anyone with the app can use the tutor; there are no parent or child accounts
- **No payment integration yet** (coming next) — subscription status exists in types only, not in the live app
- **Markdown renders in chat but complex tables may not display perfectly** — `react-native-markdown-display` handles headings, lists, bold, blockquotes, and code; wide tables may clip on small screens

## License

See [LICENSE](LICENSE).
