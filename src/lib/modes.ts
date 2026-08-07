import { FileText, Sparkles, BarChart3, GraduationCap, type LucideIcon } from 'lucide-react';

/**
 * Action modes.
 *
 * A mode is NOT a prompt prefix. Selecting one sends `mode: <id>` on the chat
 * request; the backend swaps in a different system prompt that changes how the
 * agent searches and structures its answer (see backend/agents/prompts.py).
 *
 * The user's typed message is never modified, so the mode:
 *   - stays out of the visible transcript
 *   - isn't replayed as user text in later turns' chat history
 *   - can't be accidentally edited or deleted by the user
 *
 * `id` values must stay in sync with MODE_PROMPTS in backend/agents/prompts.py.
 */
export interface ChatMode {
  id: 'summarise' | 'insights' | 'analyse' | 'explain';
  label: string;
  /** Shown on the homepage cards and in the dropdown. */
  description: string;
  /** Replaces the composer placeholder so the mode is obvious while typing. */
  placeholder: string;
  icon: LucideIcon;
}

export const MODES: ChatMode[] = [
  {
    id: 'summarise',
    label: 'Summarise',
    description: 'Condense long documents into key takeaways.',
    placeholder: 'What should I summarise?',
    icon: FileText,
  },
  {
    id: 'insights',
    label: 'Find Insights',
    description: 'Surface patterns and themes across your knowledge.',
    placeholder: 'What should I look for patterns in?',
    icon: Sparkles,
  },
  {
    id: 'analyse',
    label: 'Analyse Data',
    description: 'Interpret figures, tables, and metrics.',
    placeholder: 'What data should I analyse?',
    icon: BarChart3,
  },
  {
    id: 'explain',
    label: 'Explain',
    description: 'Get a plain-language explanation with citations.',
    placeholder: 'What concept should I explain?',
    icon: GraduationCap,
  },
];

export type ChatModeId = ChatMode['id'];

export const getMode = (id: ChatModeId | null): ChatMode | undefined =>
  id ? MODES.find((m) => m.id === id) : undefined;
