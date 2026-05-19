# Building Learnova

## Web (Vercel)

```bash
npx expo export --platform web
```

Deploy the `dist/` folder to Vercel. `vercel.json` is already configured.

## Android APK (for testing)

```bash
npm install -g @expo/eas-cli
eas login
eas build --platform android --profile preview
```

## Android AAB (for Play Store)

```bash
eas build --platform android --profile production
```

## iOS (for App Store)

```bash
eas build --platform ios --profile production
```

Requires Apple Developer account ($99/year).

## Running locally on Android

```bash
npx expo start --android
```

Requires Android Studio or a physical device with Expo Go.

## Running locally on iOS

```bash
npx expo start --ios
```

Requires Mac with Xcode, or Expo Go on iPhone.

## Environment Variables for Production

Set these in EAS dashboard or Vercel:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SENTRY_DSN` (optional)
