/**
 * Renders AI tutor chat bubble content as formatted markdown.
 * Used only for assistant messages — user messages are plain text.
 */
import Markdown from 'react-native-markdown-display';
import { COLORS, FONT_SIZES } from '@/constants/theme';

interface MarkdownMessageProps {
  content: string;
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <Markdown style={markdownStyles}>
      {content}
    </Markdown>
  );
}

const markdownStyles = {
  body: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
  },
  heading1: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800' as const,
    color: COLORS.primaryDark,
    marginBottom: 4,
    marginTop: 4,
  },
  heading2: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700' as const,
    color: COLORS.primaryDark,
    marginBottom: 2,
    marginTop: 4,
  },
  strong: {
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
  },
  bullet_list: {
    marginVertical: 4,
  },
  list_item: {
    marginVertical: 2,
  },
  blockquote: {
    backgroundColor: COLORS.primaryLight,
    borderLeftColor: COLORS.primary,
    borderLeftWidth: 3,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginVertical: 4,
  },
  code_inline: {
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primaryDark,
    borderRadius: 3,
    paddingHorizontal: 4,
    fontSize: FONT_SIZES.sm,
  },
  fence: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 6,
    padding: 8,
    fontSize: FONT_SIZES.sm,
  },
  hr: {
    backgroundColor: COLORS.border,
    height: 1,
    marginVertical: 6,
  },
};
