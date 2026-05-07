import { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { LANGUAGES, getGreeting } from '@/constants/languages';
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
    handleSend(`Give me a quiz question about ${selectedSubject?.label} for Primary ${selectedGrade}.`);
  }

  const gradeInfo = quizScore !== null ? getNigerianGrade(quizScore) : null;
  const showQuickPrompts = messages.length <= 1;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={[styles.subjectIcon, { backgroundColor: selectedSubject?.bgColor ?? '#d1fae5' }]}>
            <Text style={styles.subjectEmoji}>{selectedSubject?.icon ?? '📚'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{selectedSubject?.label ?? 'Lesson'}</Text>
            <Text style={styles.headerSub}>Primary {selectedGrade} · {lang.nativeLabel}{isQuizMode ? ' · Quiz Mode' : ''}</Text>
          </View>
          <TouchableOpacity style={styles.quizBtn} onPress={handleStartQuiz}>
            <Text style={styles.quizBtnText}>📝 Quiz</Text>
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
                  <Text style={styles.avatarEmoji}>🤖</Text>
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
                <View style={styles.avatar}><Text style={styles.avatarEmoji}>🤖</Text></View>
                <View style={styles.typingBubble}>
                  <ActivityIndicator size="small" color="#065f46" />
                  <Text style={styles.typingText}>Thinking...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {showQuickPrompts && !isAILoading && selectedSubject && selectedGrade && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
            {getQuickPrompts(selectedSubject.label, selectedGrade).map((q) => (
              <TouchableOpacity key={q} style={styles.quickChip} onPress={() => handleSend(q)}>
                <Text style={styles.quickChipText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask your teacher anything..."
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

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#06131a' },
  header: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backBtn: { padding: SPACING.xs },
  backArrow: { fontSize: FONT_SIZES.xl, color: '#d1fae5' },
  subjectIcon: { width: 40, height: 40, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
  subjectEmoji: { fontSize: 20 },
  headerTitle: { fontWeight: '700', fontSize: FONT_SIZES.md, color: '#f8fafc' },
  headerSub: { fontSize: FONT_SIZES.xs, color: '#cbd5e1' },
  quizBtn: { backgroundColor: '#065f46', borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 6 },
  quizBtnText: { color: COLORS.white, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  gradeBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  gradeLetter: { fontWeight: '800', fontSize: FONT_SIZES.xxl },
  gradeDetail: { fontWeight: '700', fontSize: FONT_SIZES.sm },
  chatContainer: { padding: SPACING.md, gap: SPACING.md },
  bubbleWrap: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-end' },
  bubbleWrapUser: { justifyContent: 'flex-end' },
  bubbleWrapAI: { justifyContent: 'flex-start' },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#065f46', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarEmoji: { fontSize: 18 },
  bubble: { maxWidth: '78%', borderRadius: RADIUS.lg, padding: SPACING.md },
  bubbleUser: { backgroundColor: '#065f46' },
  bubbleAI: { backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)' },
  bubbleText: { fontSize: FONT_SIZES.md, lineHeight: 22 },
  bubbleTextUser: { color: COLORS.white },
  bubbleTextAI: { color: '#e2e8f0' },
  typingWrap: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md },
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)' },
  typingText: { color: '#cbd5e1', fontSize: FONT_SIZES.sm },
  quickRow: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm },
  quickChip: { backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)' },
  quickChipText: { color: '#d1fae5', fontSize: FONT_SIZES.sm },
  inputBar: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, fontSize: FONT_SIZES.md, color: '#f8fafc', maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#065f46', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: COLORS.white, fontSize: FONT_SIZES.lg },
});