import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { LANGUAGES, Language, getUIText } from '@/constants/languages';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { Atmosphere } from '@/components/Atmosphere';
import { GlassCard } from '@/components/GlassCard';
import { PressableScale } from '@/components/PressableScale';

function LanguageCard({
  lang,
  onPress,
}: {
  lang: Language;
  onPress: (language: Language) => void;
}) {
  const scale = useSharedValue(1);
  const animatedCard = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedCard}>
      <TouchableOpacity
        style={styles.langCard}
        onPress={() => onPress(lang)}
        activeOpacity={0.92}
        onPressIn={() => {
          scale.value = withTiming(0.98, { duration: 140 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 180 });
        }}
      >
        <View style={styles.langFlagWrap}>
          <Text style={styles.langFlag}>🇳🇬</Text>
        </View>
        <View style={styles.langBody}>
          <Text style={[styles.langLabel, { color: lang.color }]}>{lang.nativeLabel}</Text>
          <Text style={styles.langGreeting}>{lang.greeting}</Text>
          <Text style={styles.langRegion}>{lang.region}</Text>
        </View>
        <View style={[styles.langArrow, { backgroundColor: `${lang.color}20` }]}>
          <Text style={[styles.langArrowText, { color: lang.color }]}>→</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function WelcomeScreen() {
  const setLanguage = useAppStore((s) => s.setLanguage);
  const ui = getUIText('en');
  const { width } = useWindowDimensions();
  const isCompact = width < 760;
  const isWide = width > 1200;

  function handleSelectLanguage(lang: Language) {
    setLanguage(lang.code);
    router.push('/grade');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Atmosphere variant="home" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.content, isWide && styles.contentWide]}>
          <View style={styles.topBar}>
            <Text style={styles.brandText}>🎓 {ui.appName}</Text>
            <GlassCard style={styles.topBadge}>
              <Text style={styles.topBadgeText}>⭐ AI-Powered Learning</Text>
            </GlassCard>
          </View>

          <Animated.View entering={FadeInDown.delay(40).duration(280)} style={styles.hero}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🎓</Text>
            </View>
            <Text style={styles.appName}>{ui.appName}</Text>
            <Text style={styles.tagline}>AI-Powered Learning for Nigerian Students</Text>
            <Text style={styles.subtitle}>Primary 1 – 6 · Yorùbá · Igbo · Hausa · English</Text>
            <Text style={styles.welcomeLine}>👋 Hello! Let's start your learning journey.</Text>
            <View style={styles.separator} />
            <Text style={styles.choosePrompt}>{ui.chooseLanguage}</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <GlassCard style={styles.cardArea}>
            <View style={styles.langGrid}>
              {LANGUAGES.map((lang) => (
                <View key={lang.code} style={[styles.langCardWrap, isCompact && styles.langCardWrapCompact]}>
                  <LanguageCard lang={lang} onPress={handleSelectLanguage} />
                </View>
              ))}
            </View>
          </GlassCard>
          </Animated.View>

          <View style={styles.featuresRow}>
            {['🤖 AI-Powered', '📚 Nigerian Curriculum', '🛡️ Safe & Secure', '🌍 4 Languages'].map((f) => (
              <PressableScale key={f} style={styles.pillWrap} scaleTo={0.99}>
                <GlassCard style={styles.pill}>
                  <Text style={styles.pillText}>{f}</Text>
                </GlassCard>
              </PressableScale>
            ))}
          </View>

          <View style={styles.quoteCard}>
            <Text style={styles.quoteMark}>“</Text>
            <Text style={styles.quoteText}>Education is the most powerful weapon which you can use to change the world.</Text>
            <Text style={styles.quoteAuthor}>– Nelson Mandela</Text>
          </View>

          <View style={styles.bottomStats}>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>🛡️</Text>
              <Text style={styles.statText}>Trusted by schools across Nigeria</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>✨</Text>
              <Text style={styles.statText}>Loved by students and teachers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>📈</Text>
              <Text style={styles.statText}>Making learning fun and effective</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, alignItems: 'center', paddingBottom: SPACING.xxl },
  content: { width: '100%', maxWidth: 980, paddingHorizontal: SPACING.xl, zIndex: 2 },
  contentWide: { maxWidth: 1140 },
  topBar: { marginTop: SPACING.md, marginBottom: SPACING.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandText: { color: COLORS.primaryDark, fontSize: FONT_SIZES.lg, fontWeight: '900' },
  topBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,248,232,0.8)',
    borderColor: '#f3e0b1',
  },
  topBadgeText: { color: '#8a6b2f', fontSize: FONT_SIZES.xs, fontWeight: '700' },
  hero: { alignItems: 'center', paddingTop: 20, paddingBottom: SPACING.lg },
  logoCircle: {
    width: 98,
    height: 98,
    borderRadius: 49,
    backgroundColor: 'rgba(234,248,238,0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#d7e9dc',
  },
  logoEmoji: { fontSize: 44 },
  appName: {
    fontSize: 64,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -1.6,
    lineHeight: 62,
  },
  tagline: { fontSize: FONT_SIZES.xl, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center', lineHeight: 28 },
  subtitle: { fontSize: FONT_SIZES.lg, color: COLORS.primaryDark, marginTop: 6, textAlign: 'center', fontWeight: '700' },
  welcomeLine: { marginTop: SPACING.md, color: COLORS.textSecondary, fontSize: FONT_SIZES.lg, fontWeight: '600', textAlign: 'center' },
  separator: {
    width: 84,
    height: 4,
    borderRadius: 99,
    marginTop: SPACING.md,
    backgroundColor: '#dceecf',
  },
  choosePrompt: { marginTop: SPACING.sm, color: COLORS.textPrimary, fontSize: FONT_SIZES.md, fontWeight: '700' },
  cardArea: {
    width: '100%',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 2,
  },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, width: '100%' },
  langCardWrap: { width: '48%' },
  langCardWrapCompact: { width: '100%' },
  langCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2,
  },
  langFlagWrap: { width: 50, height: 50, borderRadius: RADIUS.full, backgroundColor: 'rgba(237,247,240,0.9)', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  langBody: { flex: 1 },
  langFlag: { fontSize: 28 },
  langLabel: { fontSize: FONT_SIZES.xl, fontWeight: '700' },
  langGreeting: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, marginTop: 2 },
  langRegion: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  langArrow: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  langArrowText: { fontWeight: '800' },
  featuresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'center', marginTop: SPACING.lg, rowGap: SPACING.sm },
  pillWrap: { borderRadius: RADIUS.full },
  pill: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs },
  pillText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.xs, fontWeight: '600' },
  quoteCard: { marginTop: SPACING.xl, backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xl, alignItems: 'center' },
  quoteMark: { color: '#bff0ce', fontSize: 30, fontWeight: '900' },
  quoteText: { color: COLORS.white, textAlign: 'center', fontSize: FONT_SIZES.lg, lineHeight: 28, fontWeight: '600', marginTop: SPACING.xs },
  quoteAuthor: { color: '#dcfce7', marginTop: SPACING.md, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  bottomStats: { marginTop: SPACING.lg, marginBottom: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md, flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, justifyContent: 'space-between' },
  statItem: { width: '32%', minWidth: 200, flexDirection: 'row', gap: 6, alignItems: 'center' },
  statEmoji: { fontSize: FONT_SIZES.md },
  statText: { flex: 1, color: COLORS.textSecondary, fontSize: FONT_SIZES.xs, fontWeight: '600' },
});
