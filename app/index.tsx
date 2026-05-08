import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { LANGUAGES, Language, getUIText } from '@/constants/languages';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';

export default function WelcomeScreen() {
  const setLanguage = useAppStore((s) => s.setLanguage);
  const ui = getUIText('en');

  function handleSelectLanguage(lang: Language) {
    setLanguage(lang.code);
    router.push('/grade');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🎓</Text>
            </View>
            <Text style={styles.appName}>{ui.appName}</Text>
            <Text style={styles.tagline}>AI-Powered Learning for Nigerian Students</Text>
            <Text style={styles.subtitle}>Primary 1 – 6 · Yorùbá · Igbo · Hausa · English</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{ui.chooseLanguage}</Text>
            <View style={styles.langGrid}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={styles.langCard}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, alignItems: 'center', paddingBottom: SPACING.xxl },
  content: { width: '100%', maxWidth: 900, paddingHorizontal: SPACING.xl },
  hero: { alignItems: 'center', paddingTop: 40, paddingBottom: SPACING.xl },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  logoEmoji: { fontSize: 44 },
  appName: { fontSize: 42, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -1 },
  tagline: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
  subtitle: { fontSize: FONT_SIZES.sm, color: COLORS.primaryDark, marginTop: 4, textAlign: 'center' },
  section: { width: '100%', marginTop: SPACING.md },
  sectionTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.md, fontWeight: '700', textAlign: 'center', marginBottom: SPACING.lg },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, justifyContent: 'center' },
  langCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '47%',
    minWidth: 155,
  },
  langFlag: { fontSize: 36, marginBottom: SPACING.sm },
  langLabel: { fontSize: FONT_SIZES.lg, fontWeight: '700' },
  langGreeting: { fontSize: FONT_SIZES.sm, color: COLORS.textPrimary, marginTop: 4 },
  langRegion: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2, textAlign: 'center' },
  featuresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'center', marginTop: SPACING.xl },
  pill: { backgroundColor: COLORS.card, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderWidth: 1, borderColor: COLORS.border },
  pillText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.xs },
});