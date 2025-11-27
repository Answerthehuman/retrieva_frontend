import { Search } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { Input } from './ui/input';

export const ChatSearchBar = () => {
  const { searchQuery, setSearchQuery } = useChatStore();

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search chats..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9"
      />
    </div>
  );
};
