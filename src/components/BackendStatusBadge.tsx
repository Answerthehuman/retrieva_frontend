import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { BackendStatus } from '@/hooks/use-backend-health';
import type { HealthResponse } from '@/lib/api';

interface BackendStatusBadgeProps {
  status: BackendStatus;
  health: HealthResponse | null;
  className?: string;
}

const LABELS: Record<BackendStatus, string> = {
  checking: 'Checking…',
  ok: 'Connected',
  degraded: 'Degraded',
  unreachable: 'Offline',
};

const DOT: Record<BackendStatus, string> = {
  checking: 'bg-muted-foreground/50',
  ok: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  unreachable: 'bg-destructive',
};

/** Live backend connection indicator, driven by GET /health. */
export const BackendStatusBadge = ({ status, health, className }: BackendStatusBadgeProps) => {
  const checks = health?.checks;

  const detail = checks
    ? (['database', 'milvus', 'llm'] as const).map((key) => ({
        key,
        status: checks[key]?.status,
        detail: checks[key]?.detail,
      }))
    : null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="status"
          aria-label={`Backend ${LABELS[status]}`}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1',
            'text-[11px] font-medium text-muted-foreground select-none cursor-default',
            className
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              DOT[status],
              status === 'checking' && 'animate-pulse'
            )}
          />
          {LABELS[status]}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="end" className="max-w-xs">
        {detail ? (
          <div className="space-y-1 text-xs">
            {detail.map(({ key, status: s, detail: d }) => (
              <div key={key} className="flex items-start justify-between gap-3">
                <span className="capitalize text-muted-foreground">{key}</span>
                <span className="text-right">
                  {s}
                  {d ? <span className="block opacity-70">{d}</span> : null}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-xs">Backend is not reachable.</span>
        )}
      </TooltipContent>
    </Tooltip>
  );
};
