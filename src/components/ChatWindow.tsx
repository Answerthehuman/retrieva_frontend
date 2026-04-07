import { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { Loader2 } from 'lucide-react';

export const ChatWindow = () => {
  const { messages, isLoading } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">
                Welcome to RAG Chatbot
              </h2>
              <p className="text-muted-foreground">
                Ask me anything to get started
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Assistant is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <MessageInput />
    </div>
  );
};
