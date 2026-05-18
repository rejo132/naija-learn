/**
 * Child profiles screen.
 * Parents add and manage children's profiles here.
 * Each child has a name, grade, age, and language preference.
 */
import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { getChildren, addChild, deleteChild, Child } from '@/services/dbService';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { Atmosphere } from '@/components/Atmosphere';
import { GlassCard } from '@/components/GlassCard';

const AVATARS = ['🧒', '👦', '👧', '🧒🏽', '👦🏽', '👧🏽', '🧒🏿', '👦🏿', '👧🏿'];
const GRADES = [1, 2, 3, 4, 5, 6];
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'yo', label: 'Yorùbá' },
  { code: 'ig', label: 'Igbo' },
  { code: 'ha', label: 'Hausa' },
];

export default function ChildrenScreen() {
  const user = useAuthStore((s) => s.user);
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [grade, setGrade] = useState(1);
  const [language, setLanguage] = useState('en');
  const [avatar, setAvatar] = useState('🧒');

  useEffect(() => {
    loadChildren();
  }, []);

  async function loadChildren() {
    setIsLoading(true);
    const data = await getChildren();
    setChildren(data);
    setIsLoading(false);
  }

  async function handleAddChild() {
    if (!name.trim()) return;
    setIsAdding(true);
    const child = await addChild({
      name: name.trim(),
      age: age ? parseInt(age) : null,
      grade,
      language_preference: language,
      avatar,
    });
    if (child) {
      setChildren((prev) => [...prev, child]);
      setShowForm(false);
      setName('');
      setAge('');
      setGrade(1);
      setLanguage('en');
      setAvatar('🧒');
    }
    setIsAdding(false);
  }

  async function handleDeleteChild(childId: string, childName: string) {
    Alert.alert(
      'Remove Child',
      `Remove ${childName} from your account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteChild(childId);
            if (success) {
              setChildren((prev) => prev.filter((c) => c.id !== childId));
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Atmosphere pointerEvents="none" />
      <View style={styles.content}>
        
        {/* Header */}
        <GlassCard style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>👨‍👩‍👧 My Children</Text>
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => setShowForm(!showForm)}
          >
            <Text style={styles.addBtnText}>{showForm ? '✕' : '+ Add'}</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Add Child Form */}
        {showForm && (
          <GlassCard style={styles.form}>
            <Text style={styles.formTitle}>Add a Child</Text>
            
            {/* Avatar picker */}
            <Text style={styles.label}>Choose Avatar</Text>
            <View style={styles.avatarRow}>
              {AVATARS.map((a) => (
                <TouchableOpacity
                  key={a}
                  style={[styles.avatarBtn, avatar === a && styles.avatarBtnSelected]}
                  onPress={() => setAvatar(a)}
                >
                  <Text style={styles.avatarEmoji}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Name */}
            <Text style={styles.label}>Child's Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Emeka"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="words"
            />

            {/* Age */}
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="e.g. 8"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              maxLength={2}
            />

            {/* Grade */}
            <Text style={styles.label}>Class</Text>
            <View style={styles.gradeRow}>
              {GRADES.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.gradeBtn, grade === g && styles.gradeBtnSelected]}
                  onPress={() => setGrade(g)}
                >
                  <Text style={[styles.gradeBtnText, grade === g && styles.gradeBtnTextSelected]}>
                    P{g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Language */}
            <Text style={styles.label}>Language</Text>
            <View style={styles.langRow}>
              {LANGUAGES.map((l) => (
                <TouchableOpacity
                  key={l.code}
                  style={[styles.langBtn, language === l.code && styles.langBtnSelected]}
                  onPress={() => setLanguage(l.code)}
                >
                  <Text style={[styles.langBtnText, language === l.code && styles.langBtnTextSelected]}>
                    {l.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, (!name.trim() || isAdding) && styles.saveBtnDisabled]}
              onPress={handleAddChild}
              disabled={!name.trim() || isAdding}
            >
              {isAdding
                ? <ActivityIndicator color={COLORS.white} />
                : <Text style={styles.saveBtnText}>Save Child</Text>
              }
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* Children List */}
        {isLoading ? (
          <ActivityIndicator 
            size="large" 
            color={COLORS.primary} 
            style={{ marginTop: SPACING.xl }} 
          />
        ) : children.length === 0 && !showForm ? (
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>👶</Text>
            <Text style={styles.emptyTitle}>No children yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your child's profile to track their learning progress
            </Text>
            <TouchableOpacity 
              style={styles.saveBtn} 
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.saveBtnText}>+ Add First Child</Text>
            </TouchableOpacity>
          </GlassCard>
        ) : (
          <FlatList
            data={children}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <GlassCard style={styles.childCard}>
                <Text style={styles.childAvatar}>{item.avatar}</Text>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{item.name}</Text>
                  <Text style={styles.childDetails}>
                    Primary {item.grade} · Age {item.age ?? '?'} · {
                      LANGUAGES.find(l => l.code === item.language_preference)?.label ?? 'English'
                    }
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteChild(item.id, item.name)}
                >
                  <Text style={styles.deleteBtnText}>🗑</Text>
                </TouchableOpacity>
              </GlassCard>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, paddingHorizontal: SPACING.lg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    marginTop: SPACING.sm, marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  backBtn: { padding: SPACING.xs },
  backArrow: { fontSize: FONT_SIZES.xl, color: COLORS.primaryDark },
  headerTitle: { flex: 1, fontSize: FONT_SIZES.lg, fontWeight: '800', fontFamily: 'Poppins-Bold', color: COLORS.textPrimary },
  addBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: 6,
  },
  addBtnText: { color: COLORS.white, fontWeight: '700', fontFamily: 'Poppins-Bold', fontSize: FONT_SIZES.sm },
  form: { padding: SPACING.lg, marginBottom: SPACING.md, gap: SPACING.xs },
  formTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', fontFamily: 'Poppins-Bold', color: COLORS.primaryDark, marginBottom: SPACING.sm },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '700', fontFamily: 'Poppins-Bold', color: COLORS.textPrimary, marginTop: SPACING.sm },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
    padding: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.textPrimary,
    backgroundColor: 'rgba(255,255,255,0.8)', marginTop: 4,
  },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: 4 },
  avatarBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 2, borderColor: 'transparent',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarBtnSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  avatarEmoji: { fontSize: 24 },
  gradeRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: 4, flexWrap: 'wrap' },
  gradeBtn: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  gradeBtnSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  gradeBtnText: { fontWeight: '700', fontFamily: 'Poppins-Bold', color: COLORS.textPrimary, fontSize: FONT_SIZES.sm },
  gradeBtnTextSelected: { color: COLORS.white },
  langRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: 4, flexWrap: 'wrap' },
  langBtn: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  langBtnSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  langBtnText: { fontWeight: '700', fontFamily: 'Poppins-Bold', color: COLORS.textPrimary, fontSize: FONT_SIZES.sm },
  langBtnTextSelected: { color: COLORS.white },
  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center', marginTop: SPACING.md,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: COLORS.white, fontWeight: '800', fontFamily: 'Poppins-Bold', fontSize: FONT_SIZES.md },
  list: { gap: SPACING.md, paddingBottom: SPACING.xl },
  childCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.md, gap: SPACING.md,
  },
  childAvatar: { fontSize: 36 },
  childInfo: { flex: 1 },
  childName: { fontSize: FONT_SIZES.lg, fontWeight: '800', fontFamily: 'Poppins-Bold', color: COLORS.textPrimary },
  childDetails: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  deleteBtn: { padding: SPACING.sm },
  deleteBtnText: { fontSize: FONT_SIZES.lg },
  emptyCard: { padding: SPACING.xl, alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xl },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', fontFamily: 'Poppins-Bold', color: COLORS.textPrimary },
  emptySubtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center' },
});
