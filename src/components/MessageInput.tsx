import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { chatApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const MessageInput = () => {
  const [input, setInput] = useState('');
  const { currentChatId, addMessage, setIsLoading, isLoading } = useChatStore();
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim() || !currentChatId || isLoading) return;

    const userMessage = {
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message immediately
    addMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(currentChatId, userMessage.content);
      
      // Simulate typing effect
      const assistantMessage = {
        role: 'assistant' as const,
        content: response.assistant_response,
        timestamp: new Date().toISOString(),
      };

      // Simple typing simulation
      setTimeout(() => {
        addMessage(assistantMessage);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-background">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex gap-3 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              currentChatId
                ? 'Type your message... (Enter to send, Shift+Enter for new line)'
                : 'Select or create a chat to start messaging'
            }
            disabled={!currentChatId || isLoading}
            className="min-h-[56px] max-h-[200px] resize-none"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || !currentChatId || isLoading}
            size="icon"
            className="h-14 w-14 shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
