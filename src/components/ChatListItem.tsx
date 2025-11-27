import { MessageSquare } from 'lucide-react';
import { Chat } from '@/store/chatStore';
import { cn } from '@/lib/utils';

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: () => void;
}

export const ChatListItem = ({ chat, isActive, onSelect }: ChatListItemProps) => {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
        'hover:bg-accent/50',
        isActive && 'bg-accent text-accent-foreground'
      )}
    >
      <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="flex-1 truncate text-sm">{chat.title}</span>
    </button>
  );
};
