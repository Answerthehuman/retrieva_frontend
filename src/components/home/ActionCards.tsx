import { useChatStore } from '@/store/chatStore';
import { MODES } from '@/lib/modes';
import { cn } from '@/lib/utils';

/**
 * Homepage mode launchers.
 *
 * These activate a real mode rather than pre-filling the composer with prompt
 * text: clicking one sets `activeMode`, which is sent to the backend as a
 * `mode` parameter and swaps the agent's system prompt. The user then types
 * their actual question normally, with the mode shown as an active chip in the
 * composer. Nothing appears in the input box that the user has to edit around.
 */
export const ActionCards = () => {
  const activeMode = useChatStore((s) => s.activeMode);
  const setActiveMode = useChatStore((s) => s.setActiveMode);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {MODES.map(({ id, label, description, icon: Icon }) => {
        const isActive = id === activeMode;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={isActive}
            // Clicking the active card turns the mode back off.
            onClick={() => setActiveMode(isActive ? null : id)}
            className={cn(
              'group flex flex-col items-start gap-2 rounded-[18px] border bg-card p-3.5 text-left',
              'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_-4px_rgba(15,23,42,0.06)]',
              'transition-all duration-200 ease-out',
              'hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(37,99,235,0.06),0_10px_24px_-8px_rgba(37,99,235,0.18)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              isActive
                ? 'border-primary/55 bg-primary/[0.04] shadow-[0_2px_4px_rgba(37,99,235,0.08),0_10px_24px_-8px_rgba(37,99,235,0.22)]'
                : 'border-border hover:border-primary/45',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl border transition-colors duration-200',
                isActive
                  ? 'border-primary/45 bg-primary/15 text-primary'
                  : 'border-primary/20 bg-primary/[0.06] text-primary group-hover:bg-primary/10 group-hover:border-primary/35',
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </span>
            <span className="space-y-0.5">
              <span className="block text-[15px] font-medium leading-snug text-foreground">
                {label}
              </span>
              <span className="block text-[13px] leading-snug text-muted-foreground">
                {isActive ? 'Active — ask your question below' : description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
};
