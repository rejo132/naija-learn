/**
 * Welcome / home screen — first route in the app (`/`).
 *
 * @remarks
 * **Responsible for:** Onboarding hero, feature pills, and language selection;
 * persisting the chosen language and navigating to grade selection.
 */
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import type { Session } from '@supabase/supabase-js';
import { useAuthStore } from '@/store/authStore';
import { LANGUAGES, type LanguageMeta, getUIText } from '@/constants/languages';
import { SPACING, RADIUS, FONT_SIZES, SHADOWS } from '@/constants/theme';
import { PressableScale } from '@/components/PressableScale';
import { useTheme } from '@/hooks/useTheme';

const SCREEN = {
  background: '#FAFFFE',
  card: '#FFFFFF',
  textPrimary: '#0D2B1A',
  textSecondary: '#3D6B52',
  textMuted: '#8BAD98',
  accent: '#008751',
  quoteBg: '#005C36',
  pillBg: '#E8F5EE',
  pillBorder: 'rgba(0, 135, 81, 0.2)',
};

const FEATURES = [
  '🤖 AI-Powered',
  '📚 Nigerian Curriculum',
  '🛡️ Safe & Secure',
  '📶 Works Offline',
  '🌍 4 Languages',
] as const;

const LANG_FLAGS: Record<string, string> = {
  en: '🇬🇧',
  ha: '🇳🇬',
  yo: '🇳🇬',
  ig: '🇳🇬',
};

const BOTTOM_STATS = [
  { icon: '🛡️', text: 'Trusted by schools across Nigeria' },
  { icon: '✨', text: 'Loved by students and teachers' },
  { icon: '📈', text: 'Making learning fun and effective' },
] as const;

function HeroIllustration() {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) {
    return (
      <View style={styles.heroImageWrap}>
        <Text style={styles.heroFallback}>🎓</Text>
      </View>
    );
  }

  return (
    <View style={styles.heroImageWrap}>
      <Image
        source={require('../assets/images/hero.png')}
        style={styles.heroImage}
        resizeMode="contain"
        onError={() => setImageFailed(true)}
      />
    </View>
  );
}

function LanguageCard({
  lang,
  onPress,
}: {
  lang: LanguageMeta;
  onPress: (language: LanguageMeta) => void;
}) {
  return (
    <PressableScale style={styles.langCard} onPress={() => onPress(lang)} scaleTo={0.98}>
      <View style={styles.langFlagWrap}>
        <Text style={styles.langFlag}>{LANG_FLAGS[lang.code] ?? '🇳🇬'}</Text>
      </View>
      <View style={styles.langBody}>
        <Text style={[styles.langLabel, { color: lang.color }]}>{lang.nativeLabel}</Text>
        <Text style={styles.langGreeting}>{lang.greeting}</Text>
        <Text style={styles.langRegion}>{lang.region}</Text>
      </View>
      <View style={[styles.langArrow, { backgroundColor: `${lang.color}18` }]}>
        <Text style={[styles.langArrowText, { color: lang.color }]}>→</Text>
      </View>
    </PressableScale>
  );
}

export default function WelcomeScreen() {
  const session = useAuthStore((s) => s.session);
  const params = useLocalSearchParams();
  const isChangingLanguage = params.change === '1';

  useEffect(() => {
    if (session && !isChangingLanguage) {
      router.replace('/dashboard');
    }
  }, [session, isChangingLanguage]);

  if (session && !isChangingLanguage) {
    return null;
  }

  return (
    <WelcomeScreenContent
      session={session}
      isChangingLanguage={isChangingLanguage}
    />
  );
}

function WelcomeScreenContent({
  session,
  isChangingLanguage,
}: {
  session: Session | null;
  isChangingLanguage: boolean;
}) {
  const setLanguage = useAppStore((s) => s.setLanguage);
  const [hydrated, setHydrated] = useState(() => useAppStore.persist.hasHydrated());
  const ui = getUIText('en');
  const { width } = useWindowDimensions();
  const isCompact = width < 760;
  const isWide = width > 1200;
  const { colors, isDarkMode } = useTheme();

  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    void Promise.resolve(useAppStore.persist.rehydrate()).then(() => setHydrated(true));
    return unsub;
  }, []);

  function handleSelectLanguage(lang: LanguageMeta) {
    if (session && isChangingLanguage) {
      setLanguage(lang.code);
      router.replace('/dashboard');
    } else {
      setLanguage(lang.code);
      router.push('/auth/sign-in');
    }
  }

  if (!hydrated) {
    return <SafeAreaView style={styles.safe} />;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, isWide && styles.contentWide]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.logoMark}>
                <Text style={styles.logoMarkEmoji}>🎓</Text>
              </View>
              <Text style={styles.brandName}>{ui.appName}</Text>
            </View>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>AI-Powered Learning</Text>
            </View>
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <HeroIllustration />
            <Text style={[styles.appName, isCompact && styles.appNameCompact]}>
              {ui.appName}
            </Text>
            <Text style={styles.tagline}>
              AI-Powered Learning for Nigerian Students
            </Text>
            <View style={styles.languagePillsRow}>
              <Text style={styles.languagePills}>
                Primary 1-6 · Yorùbá · Igbo · Hausa · English
              </Text>
            </View>
            <Text style={styles.welcomeLine}>
              👋 Hello! Let&apos;s start your learning journey.
            </Text>
            <Text style={styles.choosePrompt}>{ui.chooseLanguage}</Text>
          </View>

          {/* Language cards */}
          <View style={styles.langGrid}>
            {LANGUAGES.map((lang) => (
              <View
                key={lang.code}
                style={[styles.langCardWrap, isCompact && styles.langCardWrapCompact]}
              >
                <LanguageCard lang={lang} onPress={handleSelectLanguage} />
              </View>
            ))}
          </View>

          {/* Feature pills */}
          <View style={styles.featuresRow}>
            {FEATURES.map((label) => (
              <View
                key={label}
                style={[
                  styles.featurePill,
                  {
                    backgroundColor: isDarkMode ? colors.backgroundCard : SCREEN.pillBg,
                    borderColor: isDarkMode ? colors.border : SCREEN.pillBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.featurePillText,
                    { color: isDarkMode ? colors.textPrimary : SCREEN.accent },
                  ]}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>

          {/* Quote — curved top edge transitions from page background into deep green */}
          <View style={styles.quoteOuter}>
            <View style={styles.quoteCard}>
              <Text style={styles.quoteMark}>&ldquo;</Text>
              <Text style={styles.quoteText}>
                Education is the most powerful weapon which you can use to change the world.
              </Text>
              <Text style={styles.quoteAuthor}>– Nelson Mandela</Text>
            </View>
          </View>

          {/* Bottom stats */}
          <View style={styles.bottomStats}>
            {BOTTOM_STATS.map((stat) => (
              <View key={stat.text} style={styles.statItem}>
                <Text style={styles.statEmoji}>{stat.icon}</Text>
                <Text style={styles.statText}>{stat.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: SCREEN.background,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: SPACING.xxl,
    width: '100%',
  },
  content: {
    width: '100%',
    maxWidth: 980,
    paddingHorizontal: SPACING.xl,
  },
  contentWide: {
    maxWidth: 1140,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SCREEN.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkEmoji: {
    fontSize: 20,
  },
  brandName: {
    fontSize: FONT_SIZES.lg,
    fontFamily: 'Poppins-Bold',
    color: SCREEN.textPrimary,
    letterSpacing: -0.3,
  },
  headerBadge: {
    backgroundColor: SCREEN.pillBg,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: SCREEN.pillBorder,
  },
  headerBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-SemiBold',
    color: SCREEN.accent,
  },

  hero: {
    alignItems: 'center',
    paddingBottom: SPACING.lg,
  },
  heroImageWrap: {
    width: '100%',
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroImage: {
    width: '100%',
    height: 240,
  },
  heroFallback: {
    fontSize: 88,
    lineHeight: 100,
  },
  appName: {
    fontSize: 56,
    fontFamily: 'Poppins-Bold',
    color: SCREEN.textPrimary,
    letterSpacing: -1.2,
    lineHeight: 62,
    textAlign: 'center',
  },
  appNameCompact: {
    fontSize: 42,
    lineHeight: 48,
    letterSpacing: -0.8,
  },
  tagline: {
    fontSize: FONT_SIZES.lg,
    fontFamily: 'Poppins-Regular',
    color: SCREEN.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: SPACING.sm,
  },
  languagePillsRow: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  languagePills: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    color: SCREEN.accent,
    textAlign: 'center',
    lineHeight: 20,
  },
  welcomeLine: {
    marginTop: SPACING.lg,
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Regular',
    color: SCREEN.textSecondary,
    textAlign: 'center',
  },
  choosePrompt: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Bold',
    color: SCREEN.textPrimary,
    textAlign: 'center',
  },

  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    width: '100%',
  },
  langCardWrap: {
    width: '48%',
  },
  langCardWrapCompact: {
    width: '100%',
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SCREEN.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    ...SHADOWS.soft,
  },
  langFlagWrap: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: '#F0FAF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  langFlag: {
    fontSize: 26,
  },
  langBody: {
    flex: 1,
  },
  langLabel: {
    fontSize: FONT_SIZES.lg,
    fontFamily: 'Poppins-Bold',
  },
  langGreeting: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: SCREEN.textPrimary,
    marginTop: 2,
  },
  langRegion: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    color: SCREEN.textMuted,
    marginTop: 2,
  },
  langArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langArrowText: {
    fontSize: FONT_SIZES.lg,
    fontFamily: 'Poppins-Bold',
  },

  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
    marginTop: SPACING.xl,
    rowGap: SPACING.sm,
  },
  featurePill: {
    backgroundColor: SCREEN.card,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    ...SHADOWS.soft,
  },
  featurePillText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-SemiBold',
    color: SCREEN.textSecondary,
  },

  quoteOuter: {
    marginTop: SPACING.xl,
    width: '100%',
    overflow: 'hidden',
  },
  quoteCard: {
    backgroundColor: SCREEN.quoteBg,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  quoteMark: {
    fontSize: 48,
    lineHeight: 52,
    fontFamily: 'Poppins-Bold',
    color: 'rgba(255, 255, 255, 0.35)',
  },
  quoteText: {
    fontSize: FONT_SIZES.lg,
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  quoteAuthor: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: SPACING.md,
  },

  bottomStats: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 135, 81, 0.12)',
    paddingTop: SPACING.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  statItem: {
    width: '30%',
    minWidth: 160,
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  statEmoji: {
    fontSize: FONT_SIZES.lg,
  },
  statText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    color: SCREEN.textSecondary,
    lineHeight: 18,
  },
});
