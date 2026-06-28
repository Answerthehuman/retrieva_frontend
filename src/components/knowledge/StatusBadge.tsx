import { cn } from '@/lib/utils';
import { DocStatus } from '@/store/knowledgeStore';

interface StatusBadgeProps {
  status: DocStatus;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border shadow-2xs transition-all duration-300",
        status === 'Indexed' && "bg-green-500/10 text-green-500 border-green-500/20 dark:bg-green-500/20 dark:border-green-500/30",
        status === 'Processing' && "bg-blue-500/10 text-blue-500 border-blue-500/20 dark:bg-blue-500/20 dark:border-blue-500/30 animate-pulse",
        status === 'Needs Re-index' && "bg-orange-500/10 text-orange-500 border-orange-500/20 dark:bg-orange-500/20 dark:border-orange-500/30",
        status === 'Failed' && "bg-red-500/10 text-red-500 border-red-500/20 dark:bg-red-500/20 dark:border-red-500/30",
        className
      )}
    >
      {status === 'Processing' && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping mr-1.5" />
      )}
      {status}
    </span>
  );
};
export default StatusBadge;
