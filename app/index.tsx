import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { LANGUAGES, Language } from '@/constants/languages';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';

export default function WelcomeScreen() {
  const setLanguage = useAppStore((s) => s.setLanguage);

  function handleSelectLanguage(lang: Language) {
    setLanguage(lang.code);
    router.push('/grade');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🎓</Text>
          </View>
          <Text style={styles.appName}>NaijaLearn</Text>
          <Text style={styles.tagline}>AI-Powered Learning for Nigerian Students</Text>
          <Text style={styles.subtitle}>Primary 1 – 6 · Yorùbá · Igbo · Hausa · English</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose your language to begin:</Text>
          <View style={styles.langGrid}>
            {LANGUAGES.map((lang, idx) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langCard, idx === 0 ? styles.langCardWide : styles.langCardNarrow]}
                onPress={() => handleSelectLanguage(lang)}
                activeOpacity={0.8}
              >
                <Text style={styles.langFlag}>🇳🇬</Text>
                <Text style={[styles.langLabel, { color: lang.color }]}>{lang.nativeLabel}</Text>
                <Text style={styles.langGreeting}>{lang.greeting}</Text>
                <Text style={styles.langRegion}>{lang.region}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.featuresRow}>
          {['🤖 AI-Powered', '📚 Nigerian Curriculum', '🆓 Free to Use', '🌍 4 Languages'].map((f) => (
            <View key={f} style={styles.pill}>
              <Text style={styles.pillText}>{f}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#031b16' },
  orbTop: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(16,185,129,0.24)',
    top: -40,
    right: -40,
  },
  orbBottom: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(59,130,246,0.2)',
    bottom: 30,
    left: -40,
  },
  scroll: { flexGrow: 1, alignItems: 'center', paddingBottom: SPACING.xxl },
  hero: { alignItems: 'center', paddingTop: 48, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.xl },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(251,191,36,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  logoEmoji: { fontSize: 44 },
  appName: { fontSize: 42, fontWeight: '800', color: COLORS.white, letterSpacing: -1 },
  tagline: { fontSize: FONT_SIZES.md, color: '#a7f3d0', marginTop: 4, textAlign: 'center' },
  subtitle: { fontSize: FONT_SIZES.sm, color: '#93c5fd', marginTop: 4, textAlign: 'center' },
  section: { width: '100%', paddingHorizontal: SPACING.xl, marginTop: SPACING.lg },
  sectionTitle: { color: '#d1fae5', fontSize: FONT_SIZES.md, textAlign: 'center', marginBottom: SPACING.lg },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, justifyContent: 'center' },
  langCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
  },
  langCardWide: { width: '94%' },
  langCardNarrow: { width: '45%' },
  langFlag: { fontSize: 36, marginBottom: SPACING.sm },
  langLabel: { fontSize: FONT_SIZES.lg, fontWeight: '700' },
  langGreeting: { fontSize: FONT_SIZES.sm, color: '#d1fae5', marginTop: 4 },
  langRegion: { fontSize: FONT_SIZES.xs, color: '#cbd5e1', marginTop: 2, textAlign: 'center' },
  featuresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'center', marginTop: SPACING.xl, paddingHorizontal: SPACING.xl },
  pill: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  pillText: { color: '#bfdbfe', fontSize: FONT_SIZES.xs },
});