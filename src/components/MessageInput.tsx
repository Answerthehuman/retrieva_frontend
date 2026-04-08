import { useState, KeyboardEvent } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { chatApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const MessageInput = () => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { addMessageToCurrentChat, setIsLoading, isLoading, getCurrentChat, createNewChat } = useChatStore();
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    let chat = getCurrentChat();
    if (!chat) {
      createNewChat();
      chat = useChatStore.getState().getCurrentChat();
    }
    if (!chat) return;

    const userMessage = {
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    addMessageToCurrentChat(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const data = await chatApi.sendMessage(userMessage.content, chat.threadId);

      const textContent = [data.response, data.metadata?.['inv-response']]
        .filter(Boolean)
        .join('\n\n');

      const assistantMessage = {
        role: 'assistant' as const,
        content: textContent,
        timestamp: new Date().toISOString(),
        products: data.metadata?.products || [],
      };

      setTimeout(() => {
        addMessageToCurrentChat(assistantMessage);
        setIsLoading(false);
      }, 400);
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

  const handleMicClick = () => {
    // STT stub — toggle listening state
    if (isListening) {
      setIsListening(false);
      toast({ title: 'Microphone off', description: 'Speech-to-text stopped.' });
    } else {
      setIsListening(true);
      toast({ title: 'Listening...', description: 'Speech-to-text started. (Stub — implement your STT here)' });
      // TODO: Integrate your STT provider here.
      // When transcription is ready, call: setInput(prev => prev + transcribedText)
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
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            disabled={isLoading}
            className="min-h-[56px] max-h-[200px] resize-none"
            rows={1}
          />
          <Button
            onClick={handleMicClick}
            variant={isListening ? 'destructive' : 'outline'}
            size="icon"
            className="h-14 w-14 shrink-0"
            title={isListening ? 'Stop listening' : 'Start speech-to-text'}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
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
