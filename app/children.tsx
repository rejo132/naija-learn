/**
 * Child profiles screen.
 * Parents add and manage children's profiles here.
 * Each child has a name, grade, age, and language preference.
 */
import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Alert, Platform, type StyleProp, type TextStyle,
} from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getChildren, addChild, deleteChild, Child } from '@/services/dbService';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_FAMILY } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
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
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
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
      grade,
      language,
      avatar,
    });
    if (child) {
      setChildren((prev) => [...prev, child]);
      setShowForm(false);
      setName('');
      setGrade(1);
      setLanguage('en');
      setAvatar('🧒');
    }
    setIsAdding(false);
  }

  async function handleDeleteChild(childId: string, childName: string) {
    Alert.alert(
      t('childrenDeleteConfirmTitle'),
      t('childrenDeleteConfirmMsg'),
      [
        { text: t('childrenDeleteCancel'), style: 'cancel' },
        {
          text: t('childrenDeleteConfirm'),
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

  const inputStyle: StyleProp<TextStyle> = [
    styles.input,
    {
      backgroundColor: colors.backgroundCard,
      borderColor: colors.border,
      color: colors.textPrimary,
      fontSize: 16,
    },
    Platform.OS === 'web' && {
      outlineStyle: 'none' as any,
      outlineWidth: 0,
    } as any,
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDarkMode ? '#0F1512' : '#F9F6F0' }]}>
      <Atmosphere pointerEvents="none" />
      <View style={styles.content}>
        
        {/* Header */}
        <GlassCard style={[styles.header, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backArrow, { color: colors.primaryDark }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>👨‍👩‍👧 {t('childrenTitle')}</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.75}
            onPress={() => setShowForm(!showForm)}
          >
            <Text style={[styles.addBtnText, { color: colors.white }]}>{showForm ? '✕' : `+ ${t('childrenAdd')}`}</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Add Child Form */}
        {showForm && (
          <GlassCard style={[styles.form, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
            <Text style={[styles.formTitle, { color: colors.primaryDark }]}>Add a Child</Text>
            
            {/* Avatar picker */}
            <Text style={[styles.label, { color: colors.textPrimary }]}>Choose Avatar</Text>
            <View style={styles.avatarRow}>
              {AVATARS.map((a) => (
                <TouchableOpacity
                  key={a}
                  style={[
                    styles.avatarBtn,
                    { backgroundColor: colors.backgroundGlass, borderColor: 'transparent' },
                    avatar === a && { borderColor: colors.primary, backgroundColor: colors.primaryLight },
                  ]}
                  onPress={() => setAvatar(a)}
                >
                  <Text style={styles.avatarEmoji}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Name */}
            <Text style={[styles.label, { color: colors.textPrimary }]}>{t('childrenName')} *</Text>
            <TextInput
              style={inputStyle}
              value={name}
              onChangeText={setName}
              placeholder={t('childrenNamePlaceholder')}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
            />

            {/* Grade */}
            <Text style={[styles.label, { color: colors.textPrimary }]}>{t('childrenGrade')}</Text>
            <View style={styles.gradeRow}>
              {GRADES.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.gradeBtn,
                    { backgroundColor: colors.backgroundGlass, borderColor: colors.border },
                    grade === g && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setGrade(g)}
                >
                  <Text style={[
                    styles.gradeBtnText,
                    { color: colors.textPrimary },
                    grade === g && { color: colors.white },
                  ]}>
                    P{g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Language */}
            <Text style={[styles.label, { color: colors.textPrimary }]}>Language</Text>
            <View style={styles.langRow}>
              {LANGUAGES.map((l) => (
                <TouchableOpacity
                  key={l.code}
                  style={[
                    styles.langBtn,
                    { backgroundColor: colors.backgroundGlass, borderColor: colors.border },
                    language === l.code && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setLanguage(l.code)}
                >
                  <Text style={[
                    styles.langBtnText,
                    { color: colors.textPrimary },
                    language === l.code && { color: colors.white },
                  ]}>
                    {l.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: colors.primary },
                (!name.trim() || isAdding) && styles.saveBtnDisabled,
              ]}
              activeOpacity={0.75}
              onPress={handleAddChild}
              disabled={!name.trim() || isAdding}
            >
              {isAdding
                ? <ActivityIndicator color={colors.white} />
                : <Text style={[styles.saveBtnText, { color: colors.white }]}>{t('childrenSave')}</Text>
              }
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* Children List */}
        {isLoading ? (
          <ActivityIndicator 
            size="large" 
            color={colors.primary} 
            style={{ marginTop: SPACING.xl }} 
          />
        ) : children.length === 0 && !showForm ? (
          <GlassCard style={[styles.emptyCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
            <Text style={styles.emptyEmoji}>👶</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>{t('childrenEmpty')}</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {t('childrenEmptySubtitle')}
            </Text>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.75}
              onPress={() => setShowForm(true)}
            >
              <Text style={[styles.saveBtnText, { color: colors.white }]}>+ {t('childrenAdd')}</Text>
            </TouchableOpacity>
          </GlassCard>
        ) : (
          <FlatList
            data={children}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.list, { backgroundColor: colors.background }]}
            renderItem={({ item }) => (
              <GlassCard style={[styles.childCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
                <Text style={styles.childAvatar}>{item.avatar}</Text>
                <View style={styles.childInfo}>
                  <Text style={[styles.childName, { color: colors.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.childDetails, { color: colors.textSecondary }]}>
                    Primary {item.grade} · {
                      LANGUAGES.find((l) => l.code === item.language)?.label ?? 'English'
                    }
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteChild(item.id, item.name)}
                >
                  <Trash2 size={18} color={COLORS.error} />
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
  safe: { flex: 1 },
  content: { flex: 1, paddingHorizontal: SPACING.lg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    marginTop: SPACING.sm, marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  backBtn: { padding: SPACING.xs },
  backArrow: { fontSize: FONT_SIZES.xl },
  headerTitle: { flex: 1, fontSize: FONT_SIZES.lg, fontWeight: '800', fontFamily: 'Poppins-Bold' },
  addBtn: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: 6,
  },
  addBtnText: { fontWeight: '700', fontFamily: 'Poppins-Bold', fontSize: FONT_SIZES.sm },
  form: { padding: SPACING.lg, marginBottom: SPACING.md, gap: SPACING.xs },
  formTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', fontFamily: 'Poppins-Bold', marginBottom: SPACING.sm },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '700', fontFamily: 'Poppins-Bold', marginTop: SPACING.sm },
  input: {
    borderWidth: 1, borderRadius: RADIUS.md,
    padding: SPACING.md, fontSize: FONT_SIZES.md,
    fontFamily: FONT_FAMILY.regular,
    marginTop: SPACING.xs,
  },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.xs },
  avatarBtn: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 24 },
  gradeRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs, flexWrap: 'wrap' },
  gradeBtn: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md, borderWidth: 1,
  },
  gradeBtnText: { fontWeight: '700', fontFamily: 'Poppins-Bold', fontSize: FONT_SIZES.sm },
  langRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs, flexWrap: 'wrap' },
  langBtn: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md, borderWidth: 1,
  },
  langBtnText: { fontWeight: '700', fontFamily: 'Poppins-Bold', fontSize: FONT_SIZES.sm },
  saveBtn: {
    borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center', marginTop: SPACING.md,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontWeight: '800', fontFamily: 'Poppins-Bold', fontSize: FONT_SIZES.md },
  list: { gap: SPACING.md, paddingBottom: SPACING.xl },
  childCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.md, gap: SPACING.md,
  },
  childAvatar: { fontSize: 36 },
  childInfo: { flex: 1 },
  childName: { fontSize: FONT_SIZES.lg, fontWeight: '800', fontFamily: 'Poppins-Bold' },
  childDetails: { fontSize: FONT_SIZES.sm, marginTop: 2, fontFamily: FONT_FAMILY.regular },
  deleteBtn: { padding: SPACING.sm },
  emptyCard: { padding: SPACING.xl, alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xl },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', fontFamily: 'Poppins-Bold' },
  emptySubtitle: { fontSize: FONT_SIZES.md, textAlign: 'center', fontFamily: FONT_FAMILY.regular },
});
