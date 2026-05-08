import { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { LANGUAGES, getGreeting, getUIText } from '@/constants/languages';
import { getNigerianGrade, getQuickPrompts } from '@/constants/subjects';
import { buildSystemPrompt, sendAIMessage } from '@/services/aiService';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';

export default function LessonScreen() {
  const { selectedLanguage, selectedGrade, selectedSubject, messages, isAILoading, addMessage, clearMessages, setAILoading } = useAppStore();
  const [inputText, setInputText] = useState('');
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const lang = LANGUAGES.find((l) => l.code === selectedLanguage)!;
  const ui = getUIText(selectedLanguage);

  useFocusEffect(
    useCallback(() => {
      if (!selectedSubject || !selectedGrade) return;
      clearMessages();
      setIsQuizMode(false);
      setQuizScore(null);
      const greeting = getGreeting(selectedLanguage, selectedSubject.label, selectedGrade);
      addMessage({ role: 'assistant', content: greeting });
    }, [selectedSubject?.id, selectedGrade, selectedLanguage])
  );

  async function handleSend(overrideText?: string) {
    const text = (overrideText ?? inputText).trim();
    if (!text || isAILoading || !selectedSubject || !selectedGrade) return;
    setInputText('');
    addMessage({ role: 'user', content: text });
    setAILoading(true);
    const currentMessages = useAppStore.getState().messages;
    const systemPrompt = buildSystemPrompt(selectedLanguage, selectedSubject.label, selectedGrade, isQuizMode);
    const reply = await sendAIMessage({ messages: currentMessages, systemPrompt });
    addMessage({ role: 'assistant', content: reply });
    setAILoading(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }

  function handleStartQuiz() {
    setIsQuizMode(true);
    handleSend(getQuickPrompts(selectedSubject?.label ?? '', selectedGrade ?? 1, selectedLanguage)[2]);
  }

  const gradeInfo = quizScore !== null ? getNigerianGrade(quizScore) : null;
  const showQuickPrompts = messages.length <= 1;
  const quickActions = selectedSubject && selectedGrade
    ? [
        { icon: '📘', label: ui.learn, prompt: getQuickPrompts(selectedSubject.label, selectedGrade, selectedLanguage)[0] },
        { icon: '✍️', label: ui.practice, prompt: getQuickPrompts(selectedSubject.label, selectedGrade, selectedLanguage)[1] },
        { icon: '🧠', label: ui.quizAction, prompt: getQuickPrompts(selectedSubject.label, selectedGrade, selectedLanguage)[2] },
        { icon: '📖', label: ui.story, prompt: getQuickPrompts(selectedSubject.label, selectedGrade, selectedLanguage)[3] },
      ]
    : [];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <View style={[styles.subjectIcon, { backgroundColor: selectedSubject?.bgColor ?? COLORS.primaryLight }]}>
              <Text style={styles.subjectEmoji}>{selectedSubject?.icon ?? '📚'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>{selectedSubject?.label ?? ui.learn}</Text>
              <Text style={styles.headerSub}>{ui.primary} {selectedGrade} · {lang.nativeLabel}{isQuizMode ? ` · ${ui.quizMode}` : ''}</Text>
            </View>
            <TouchableOpacity style={styles.quizBtn} onPress={handleStartQuiz}>
              <Text style={styles.quizBtnText}>🧠 {ui.quiz}</Text>
            </TouchableOpacity>
          </View>

          {gradeInfo && (
            <View style={[styles.gradeBanner, { backgroundColor: gradeInfo.bgColor }]}>
              <Text style={[styles.gradeLetter, { color: gradeInfo.color }]}>{gradeInfo.grade}</Text>
              <Text style={[styles.gradeDetail, { color: gradeInfo.color }]}>{quizScore}% · {gradeInfo.remark}</Text>
            </View>
          )}

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => (
              <View style={[styles.bubbleWrap, item.role === 'user' ? styles.bubbleWrapUser : styles.bubbleWrapAI]}>
                {item.role === 'assistant' && (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarEmoji}>👩🏽‍🏫</Text>
                  </View>
                )}
                <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
                  <Text style={[styles.bubbleText, item.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAI]}>
                    {item.content}
                  </Text>
                </View>
              </View>
            )}
            ListFooterComponent={
              isAILoading ? (
                <View style={styles.typingWrap}>
                  <View style={styles.avatar}><Text style={styles.avatarEmoji}>👩🏽‍🏫</Text></View>
                  <View style={styles.typingBubble}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.typingText}>{ui.thinking}</Text>
                  </View>
                </View>
              ) : null
            }
          />

          {showQuickPrompts && !isAILoading && selectedSubject && selectedGrade && (
            <View style={styles.quickCardsRow}>
              {quickActions.map((action) => (
                <TouchableOpacity key={action.label} style={styles.quickCard} onPress={() => handleSend(action.prompt)}>
                  <Text style={styles.quickCardIcon}>{action.icon}</Text>
                  <Text style={styles.quickCardText}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.inputWrap}>
            <View style={styles.inputBar}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder={ui.askPlaceholder}
                placeholderTextColor={COLORS.textMuted}
                multiline
                maxLength={500}
                editable={!isAILoading}
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!inputText.trim() || isAILoading) && styles.sendBtnDisabled]}
                onPress={() => handleSend()}
                disabled={!inputText.trim() || isAILoading}
              >
                <Text style={styles.sendBtnText}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, width: '100%', maxWidth: 920, alignSelf: 'center' },
  header: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backBtn: { padding: SPACING.xs },
  backArrow: { fontSize: FONT_SIZES.xl, color: COLORS.primaryDark },
  subjectIcon: { width: 40, height: 40, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
  subjectEmoji: { fontSize: 20 },
  headerTitle: { fontWeight: '800', fontSize: FONT_SIZES.lg, color: COLORS.textPrimary },
  headerSub: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  quizBtn: { backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 6 },
  quizBtnText: { color: COLORS.primaryDark, fontSize: FONT_SIZES.sm, fontWeight: '700' },
  gradeBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  gradeLetter: { fontWeight: '800', fontSize: FONT_SIZES.xxl },
  gradeDetail: { fontWeight: '700', fontSize: FONT_SIZES.sm },
  chatContainer: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md, gap: SPACING.md },
  bubbleWrap: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-end' },
  bubbleWrapUser: { justifyContent: 'flex-end' },
  bubbleWrapAI: { justifyContent: 'flex-start' },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarEmoji: { fontSize: 18 },
  bubble: { maxWidth: '78%', borderRadius: RADIUS.lg, padding: SPACING.md },
  bubbleUser: { backgroundColor: COLORS.primary },
  bubbleAI: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  bubbleText: { fontSize: FONT_SIZES.md, lineHeight: 22 },
  bubbleTextUser: { color: COLORS.white },
  bubbleTextAI: { color: COLORS.textPrimary },
  typingWrap: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md },
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  typingText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
  quickCardsRow: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, flexDirection: 'row', gap: SPACING.sm, justifyContent: 'space-between' },
  quickCard: { flex: 1, minHeight: 56, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  quickCardIcon: { fontSize: FONT_SIZES.md },
  quickCardText: { color: COLORS.textPrimary, fontWeight: '700', fontSize: FONT_SIZES.sm },
  inputWrap: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: 'transparent' },
  inputBar: {
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
  input: { flex: 1, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: FONT_SIZES.md, color: COLORS.textPrimary, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: COLORS.white, fontSize: FONT_SIZES.lg },
});