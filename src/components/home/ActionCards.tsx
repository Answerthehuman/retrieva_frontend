import { FileText, Sparkles, BarChart3, GraduationCap } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { cn } from '@/lib/utils';

interface ActionCard {
  title: string;
  description: string;
  icon: typeof FileText;
  /** Seeded into the composer when the card is chosen. */
  prompt: string;
}

const ACTION_CARDS: ActionCard[] = [
  {
    title: 'Summarise a doc',
    description: 'Get key takeaways from long documents.',
    icon: FileText,
    prompt: 'Summarise this document and list the key takeaways: ',
  },
  {
    title: 'Find Insights',
    description: 'Discover patterns across your knowledge.',
    icon: Sparkles,
    prompt: 'What patterns and insights emerge across my knowledge base about ',
  },
  {
    title: 'Analyse Data',
    description: 'Visualize and interpret structured data.',
    icon: BarChart3,
    prompt: 'Analyse the data and explain what it shows: ',
  },
  {
    title: 'Explain a Concept',
    description: 'Get simple explanations with citations.',
    icon: GraduationCap,
    prompt: 'Explain this concept simply, with citations: ',
  },
];

export const ActionCards = () => {
  const setDraftInput = useChatStore((s) => s.setDraftInput);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {ACTION_CARDS.map(({ title, description, icon: Icon, prompt }) => (
        <button
          key={title}
          type="button"
          onClick={() => setDraftInput(prompt)}
          className={cn(
            'group flex flex-col items-start gap-2 rounded-[18px] border border-border bg-card p-3.5 text-left',
            'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_-4px_rgba(15,23,42,0.06)]',
            'transition-all duration-200 ease-out',
            'hover:border-primary/45 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(37,99,235,0.06),0_10px_24px_-8px_rgba(37,99,235,0.18)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.06] text-primary transition-colors duration-200 group-hover:bg-primary/10 group-hover:border-primary/35"
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </span>
          <span className="space-y-0.5">
            <span className="block text-[15px] font-medium leading-snug text-foreground">
              {title}
            </span>
            <span className="block text-[13px] leading-snug text-muted-foreground">
              {description}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
};
