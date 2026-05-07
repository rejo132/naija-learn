import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { LANGUAGES } from '@/constants/languages';
import { CORE_SUBJECTS, LANGUAGE_SUBJECTS, SOFT_SKILLS, Subject } from '@/constants/subjects';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';

type Tab = 'subjects' | 'languages' | 'softskills';

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('subjects');
  const { selectedLanguage, selectedGrade, setSubject } = useAppStore();
  const lang = LANGUAGES.find((l) => l.code === selectedLanguage)!;

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
    { id: 'subjects' as Tab, label: 'Subjects', emoji: '📚' },
    { id: 'languages' as Tab, label: 'Languages', emoji: '🗣️' },
    { id: 'softskills' as Tab, label: 'Life Skills', emoji: '🌟' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.orbLeft} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>NaijaLearn</Text>
          <Text style={styles.headerSub}>Primary {selectedGrade} · {lang.nativeLabel}</Text>
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
        {activeTab === 'softskills' && (
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>⭐ Life Skills Programme</Text>
            <Text style={styles.bannerText}>
              These skills help you succeed in life beyond the classroom!
            </Text>
          </View>
        )}
        <View style={styles.grid}>
          {tabContent[activeTab].map((subject, idx) => (
            <TouchableOpacity
              key={subject.id}
              style={[
                styles.card,
                idx % 3 === 0 ? styles.cardWide : styles.cardSmall,
                { borderColor: subject.bgColor },
              ]}
              onPress={() => handleSubject(subject)}
              activeOpacity={0.8}
            >
              <View style={[styles.cardIcon, { backgroundColor: subject.bgColor }]}>
                <Text style={styles.cardEmoji}>{subject.icon}</Text>
              </View>
              <Text style={[styles.cardLabel, { color: subject.color }]}>{subject.label}</Text>
              <Text style={styles.cardDesc}>{subject.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#061a1f' },
  orbLeft: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(20,184,166,0.18)',
    left: -60,
    top: 120,
  },
  header: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: { padding: SPACING.xs },
  backArrow: { fontSize: FONT_SIZES.xl, color: '#d1fae5' },
  headerTitle: { color: COLORS.white, fontWeight: '800', fontSize: FONT_SIZES.lg },
  headerSub: { color: '#bfdbfe', fontSize: FONT_SIZES.xs },
  gradeBadge: { backgroundColor: '#fbbf24', borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4 },
  gradeBadgeText: { color: '#064e3b', fontWeight: '700', fontSize: FONT_SIZES.sm },
  tabBar: { flexDirection: 'row', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, gap: SPACING.sm },
  tabBtn: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', backgroundColor: 'rgba(255,255,255,0.06)' },
  tabBtnActive: { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.45)' },
  tabLabel: { color: '#cbd5e1', fontSize: FONT_SIZES.sm, fontWeight: '600' },
  tabLabelActive: { color: '#f8fafc' },
  scroll: { padding: SPACING.lg },
  banner: { backgroundColor: '#fef3c7', borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg, borderWidth: 1, borderColor: '#fbbf24' },
  bannerTitle: { fontWeight: '700', color: '#92400e', marginBottom: 6, fontSize: FONT_SIZES.sm },
  bannerText: { color: '#78350f', fontSize: FONT_SIZES.sm, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  card: {
    backgroundColor: 'rgba(255,255,255,0.11)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
  },
  cardWide: { width: '96%' },
  cardSmall: { width: '47%' },
  cardIcon: { width: 44, height: 44, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  cardEmoji: { fontSize: 22 },
  cardLabel: { fontWeight: '700', fontSize: FONT_SIZES.sm, color: '#ecfeff' },
  cardDesc: { fontSize: FONT_SIZES.xs, color: '#cbd5e1', marginTop: 3 },
});