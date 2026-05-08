import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { LANGUAGES, getUIText } from '@/constants/languages';
import { CORE_SUBJECTS, LANGUAGE_SUBJECTS, SOFT_SKILLS, Subject, getLocalizedSubject } from '@/constants/subjects';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { Atmosphere } from '@/components/Atmosphere';
import { GlassCard } from '@/components/GlassCard';
import { PressableScale } from '@/components/PressableScale';

type Tab = 'subjects' | 'languages' | 'softskills';

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('subjects');
  const { selectedLanguage, selectedGrade, setSubject } = useAppStore();
  const lang = LANGUAGES.find((l) => l.code === selectedLanguage)!;
  const ui = getUIText(selectedLanguage);
  const { width } = useWindowDimensions();
  const isCompact = width < 760;
  const isWide = width > 1200;
  const isMedium = width > 900 && width <= 1200;

  if (!selectedGrade) return <Redirect href="/grade" />;

  function handleSubject(subject: Subject) {
    setSubject(subject);
    router.push('/lesson');
  }

  const tabContent: Record<Tab, Subject[]> = {
    subjects: CORE_SUBJECTS,
    languages: LANGUAGE_SUBJECTS,
    softskills: SOFT_SKILLS,
  };

  const TABS = [
    { id: 'subjects' as Tab, label: ui.subjects, emoji: '📚' },
    { id: 'languages' as Tab, label: ui.languages, emoji: '🗣️' },
    { id: 'softskills' as Tab, label: ui.lifeSkills, emoji: '🌟' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <Atmosphere />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{ui.appName}</Text>
          <Text style={styles.headerSub}>{ui.primary} {selectedGrade} · {lang.nativeLabel}</Text>
        </View>
        <View style={styles.gradeBadge}>
          <Text style={styles.gradeBadgeText}>P{selectedGrade}</Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <PressableScale
            key={tab.id}
            style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.id)}
            scaleTo={0.97}
          >
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
              {tab.emoji} {tab.label}
            </Text>
          </PressableScale>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.content, isWide && styles.contentWide, isMedium && styles.contentMedium]}>
          <GlassCard style={styles.heroCard}>
            <Text style={styles.heroTitle}>📚 {ui.subjects}</Text>
            <Text style={styles.heroSub}>Choose what you want to learn next.</Text>
          </GlassCard>
          {activeTab === 'softskills' && (
            <GlassCard style={styles.banner}>
              <Text style={styles.bannerTitle}>⭐ {ui.lifeSkillsTitle}</Text>
              <Text style={styles.bannerText}>
                {ui.lifeSkillsText}
              </Text>
            </GlassCard>
          )}
          <View style={styles.grid}>
            {tabContent[activeTab].map((subject) => {
              const localized = getLocalizedSubject(subject, selectedLanguage);
              return (
                <Animated.View key={subject.id} entering={FadeInDown.delay(80).duration(220)} style={isCompact ? styles.cardWrapCompact : styles.cardWrap}>
                <PressableScale
                  key={subject.id}
                  style={[styles.card, { borderColor: subject.bgColor }, isCompact && styles.cardCompact]}
                  onPress={() => handleSubject(localized)}
                >
                  <View style={[styles.cardIcon, { backgroundColor: subject.bgColor }]}>
                    <Text style={styles.cardEmoji}>{subject.icon}</Text>
                  </View>
                  <Text style={[styles.cardLabel, { color: subject.color }]}>{localized.label}</Text>
                  <Text style={styles.cardDesc}>{localized.description}</Text>
                </PressableScale>
                </Animated.View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: { padding: SPACING.xs },
  backArrow: { fontSize: FONT_SIZES.xl, color: COLORS.primaryDark },
  headerTitle: { color: COLORS.textPrimary, fontWeight: '800', fontSize: FONT_SIZES.lg },
  headerSub: { color: COLORS.textSecondary, fontSize: FONT_SIZES.xs },
  gradeBadge: { backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4, borderWidth: 1, borderColor: '#bee7cd' },
  gradeBadgeText: { color: COLORS.primaryDark, fontWeight: '700', fontSize: FONT_SIZES.sm },
  tabBar: { flexDirection: 'row', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, gap: SPACING.sm, backgroundColor: 'transparent', zIndex: 2 },
  tabBtn: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: 'rgba(255,255,255,0.75)' },
  tabBtnActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  tabLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  tabLabelActive: { color: COLORS.primaryDark },
  scroll: { padding: SPACING.lg, alignItems: 'center', paddingBottom: SPACING.xxl },
  content: { width: '100%', maxWidth: 980, zIndex: 2 },
  contentWide: { maxWidth: 1180 },
  contentMedium: { maxWidth: 1060 },
  heroCard: { borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.xl, marginBottom: SPACING.md },
  heroTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.textPrimary },
  heroSub: { marginTop: 6, color: COLORS.textSecondary, fontSize: FONT_SIZES.md, lineHeight: 22 },
  banner: { backgroundColor: 'rgba(255,244,220,0.78)', borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg, borderWidth: 1, borderColor: '#f3d88d' },
  bannerTitle: { fontWeight: '700', color: '#92400e', marginBottom: 6, fontSize: FONT_SIZES.sm },
  bannerText: { color: '#78350f', fontSize: FONT_SIZES.sm, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  cardWrap: { width: '48.8%' },
  cardWrapCompact: { width: '100%' },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    width: '100%',
    minWidth: 160,
    paddingVertical: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 2,
  },
  cardCompact: {
    width: '100%',
    minWidth: 0,
  },
  cardIcon: { width: 44, height: 44, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  cardEmoji: { fontSize: 22 },
  cardLabel: { fontWeight: '700', fontSize: FONT_SIZES.md, color: COLORS.textPrimary },
  cardDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 4 },
});