/**
 * Quick action bar shown in the lesson screen.
 * Provides one-tap buttons for common learning actions.
 * Only shown after the AI has sent at least one message.
 */
import { Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';

interface QuickAction {
  id: string;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}

interface QuickActionBarProps {
  onAction: (actionId: string) => void;
  disabled?: boolean;
  grade: number;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'simpler',
    label: 'Simpler',
    emoji: '🐢',
    color: '#1B7340',
    bgColor: '#dcfce7',
  },
  {
    id: 'example',
    label: 'Example',
    emoji: '💡',
    color: '#B45309',
    bgColor: '#fef3c7',
  },
  {
    id: 'harder',
    label: 'Go Deeper',
    emoji: '🚀',
    color: '#1D4ED8',
    bgColor: '#dbeafe',
  },
  {
    id: 'repeat',
    label: 'Say Again',
    emoji: '🔄',
    color: '#7C3AED',
    bgColor: '#ede9fe',
  },
  {
    id: 'summary',
    label: 'Summarise',
    emoji: '📝',
    color: '#047857',
    bgColor: '#d1fae5',
  },
];

export function QuickActionBar({ onAction, disabled, grade }: QuickActionBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      {QUICK_ACTIONS.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={[
            styles.btn,
            { backgroundColor: action.bgColor, borderColor: action.color + '40' },
            disabled && styles.btnDisabled,
          ]}
          onPress={() => onAction(action.id)}
          disabled={disabled}
        >
          <Text style={styles.btnEmoji}>{action.emoji}</Text>
          <Text style={[styles.btnLabel, { color: action.color }]}>
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 56,
    flexGrow: 0,
  },
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  btnDisabled: { opacity: 0.4 },
  btnEmoji: { fontSize: 14 },
  btnLabel: {
    fontWeight: '700',
    fontSize: FONT_SIZES.sm,
  },
});
