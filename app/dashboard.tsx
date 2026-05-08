import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { LANGUAGES, getUIText } from '@/constants/languages';
import { CORE_SUBJECTS, LANGUAGE_SUBJECTS, SOFT_SKILLS, Subject, getLocalizedSubject } from '@/constants/subjects';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';

type Tab = 'subjects' | 'languages' | 'softskills';

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('subjects');
  const { selectedLanguage, selectedGrade, setSubject } = useAppStore();
  const lang = LANGUAGES.find((l) => l.code === selectedLanguage)!;
  const ui = getUIText(selectedLanguage);

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
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
              {tab.emoji} {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          {activeTab === 'softskills' && (
            <View style={styles.banner}>
              <Text style={styles.bannerTitle}>⭐ {ui.lifeSkillsTitle}</Text>
              <Text style={styles.bannerText}>
                {ui.lifeSkillsText}
              </Text>
            </View>
          )}
          <View style={styles.grid}>
            {tabContent[activeTab].map((subject) => {
              const localized = getLocalizedSubject(subject, selectedLanguage);
              return (
                <TouchableOpacity
                  key={subject.id}
                  style={[styles.card, { borderColor: subject.bgColor }]}
                  onPress={() => handleSubject(localized)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.cardIcon, { backgroundColor: subject.bgColor }]}>
                    <Text style={styles.cardEmoji}>{subject.icon}</Text>
                  </View>
                  <Text style={[styles.cardLabel, { color: subject.color }]}>{localized.label}</Text>
                  <Text style={styles.cardDesc}>{localized.description}</Text>
                </TouchableOpacity>
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
    backgroundColor: COLORS.card,
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
  gradeBadge: { backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4 },
  gradeBadgeText: { color: COLORS.primaryDark, fontWeight: '700', fontSize: FONT_SIZES.sm },
  tabBar: { flexDirection: 'row', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, gap: SPACING.sm, backgroundColor: COLORS.background },
  tabBtn: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  tabBtnActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  tabLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  tabLabelActive: { color: COLORS.primaryDark },
  scroll: { padding: SPACING.lg, alignItems: 'center' },
  content: { width: '100%', maxWidth: 900 },
  banner: { backgroundColor: '#fef3c7', borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg, borderWidth: 1, borderColor: '#fbbf24' },
  bannerTitle: { fontWeight: '700', color: '#92400e', marginBottom: 6, fontSize: FONT_SIZES.sm },
  bannerText: { color: '#78350f', fontSize: FONT_SIZES.sm, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    width: '48%',
    minWidth: 160,
  },
  cardIcon: { width: 44, height: 44, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  cardEmoji: { fontSize: 22 },
  cardLabel: { fontWeight: '700', fontSize: FONT_SIZES.sm, color: COLORS.textPrimary },
  cardDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 3 },
});