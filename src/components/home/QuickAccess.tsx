import { useNavigate } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { cn } from '@/lib/utils';

interface SourceTile {
  name: string;
  /** File in /public/connectors — omitted for the aggregate "All Sources" tile. */
  icon?: string;
  prompt?: string;
}

const SOURCE_TILES: SourceTile[] = [
  { name: 'Drive', icon: 'drive.png', prompt: 'Search my Google Drive for ' },
  { name: 'Slack', icon: 'slack.png', prompt: 'Search Slack conversations for ' },
  { name: 'Gmail', icon: 'gmail.png', prompt: 'Search my email for ' },
  { name: 'Notion', icon: 'notion.png', prompt: 'Search my Notion workspace for ' },
  { name: 'All Sources' },
];

export const QuickAccess = () => {
  const setDraftInput = useChatStore((s) => s.setDraftInput);
  const navigate = useNavigate();

  return (
    <section aria-labelledby="quick-access-heading" className="space-y-2.5">
      <h2
        id="quick-access-heading"
        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        Quick Access
      </h2>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
        {SOURCE_TILES.map(({ name, icon, prompt }) => (
          <button
            key={name}
            type="button"
            onClick={() => (prompt ? setDraftInput(prompt) : navigate('/knowledge-base'))}
            className={cn(
              'group flex h-[60px] items-center gap-2.5 rounded-2xl border border-border bg-card px-3',
              'shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 ease-out',
              'hover:border-primary/45 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-6px_rgba(37,99,235,0.2)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
          >
            {icon ? (
              <img
                src={`/connectors/${icon}`}
                alt=""
                aria-hidden="true"
                width={22}
                height={22}
                className="h-[22px] w-[22px] shrink-0 object-contain"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md bg-primary/[0.08] text-primary"
              >
                <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
            )}
            <span className="truncate text-[13px] font-medium text-foreground">{name}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
