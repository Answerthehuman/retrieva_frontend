import { Plus, Check, X } from 'lucide-react';
import { MODES, getMode, type ChatModeId } from '@/lib/modes';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ModePickerProps {
  activeMode: ChatModeId | null;
  onSelect: (mode: ChatModeId | null) => void;
  disabled?: boolean;
}

/**
 * Mode selector inside the composer, modelled on ChatGPT's tool/mode menu.
 *
 * With no mode active this is a compact icon button. Once a mode is chosen it
 * becomes a labelled chip with a dismiss affordance, so the active mode stays
 * visible for the whole conversation rather than vanishing after one send.
 */
export const ModePicker = ({ activeMode, onSelect, disabled }: ModePickerProps) => {
  const active = getMode(activeMode);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={active ? 'sm' : 'icon'}
          disabled={disabled}
          aria-label={active ? `Mode: ${active.label}. Change or remove mode` : 'Choose a mode'}
          title={active ? `Mode: ${active.label}` : 'Choose a mode'}
          className={cn(
            'shrink-0 rounded-full transition-colors duration-200',
            active
              ? 'h-9 gap-1.5 border border-primary/30 bg-primary/[0.08] px-3 text-primary hover:bg-primary/[0.13] hover:text-primary'
              : 'h-11 w-11 text-muted-foreground hover:bg-primary/[0.07] hover:text-primary',
          )}
        >
          {active ? (
            <>
              <active.icon className="h-4 w-4" strokeWidth={2} />
              <span className="text-[13px] font-medium">{active.label}</span>
              {/* Nested inside the trigger, so stop the click from also opening
                  the menu when the user only wants to clear the mode. */}
              <span
                role="button"
                tabIndex={0}
                aria-label={`Turn off ${active.label} mode`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelect(null);
                  }
                }}
                className="ml-0.5 rounded-full p-0.5 text-primary/70 transition-colors hover:bg-primary/15 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            </>
          ) : (
            <Plus className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" side="top" className="w-64">
        {MODES.map((mode) => {
          const isActive = mode.id === activeMode;
          return (
            <DropdownMenuItem
              key={mode.id}
              // Selecting the active mode again turns it off.
              onSelect={() => onSelect(isActive ? null : mode.id)}
              className="flex cursor-pointer items-start gap-2.5 py-2"
            >
              <mode.icon
                className={cn('mt-0.5 h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')}
                strokeWidth={1.9}
              />
              <span className="flex-1 space-y-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="text-[13px] font-medium leading-none text-foreground">
                    {mode.label}
                  </span>
                  {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
                </span>
                <span className="block text-[12px] leading-snug text-muted-foreground">
                  {mode.description}
                </span>
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
