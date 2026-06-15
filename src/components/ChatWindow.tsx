import { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { Loader2, Settings, LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { ModeToggle } from './ModeToggle';

export const ChatWindow = () => {
  const { getCurrentChat, isLoading, logout, statusText } = useChatStore();
  const chat = getCurrentChat();
  const messages = chat?.messages || [];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLanding = messages.length === 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-background relative">
      {/* User profile section in top-right */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-50">
        <span className="hidden md:inline-block text-sm font-semibold text-foreground/70 mr-1">John Doe</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-border shadow-sm hover:scale-110 transition-transform">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" alt="John Doe" />
                <AvatarFallback className="bg-primary/5 text-primary font-bold">JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">John Doe</p>
                <p className="text-xs leading-none text-muted-foreground pt-1">john.doe@abfrl.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer group">
              <Settings className="mr-2 h-4 w-4 transition-transform group-hover:rotate-45" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5 font-medium"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ModeToggle />
      </div>


      {/* Branding in top-left corner */}
      {isLanding && (
        <div className="absolute top-6 left-6 animate-in fade-in duration-700">
          <h2 className="text-lg font-bold tracking-tight text-foreground/80">
            ABFRL Product recommendation Chatbot
          </h2>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {isLanding ? (
          <div className="flex flex-col items-center justify-center min-h-full px-4 text-center">
            <div className="max-w-3xl w-full space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="space-y-4">
                <p className="text-xl md:text-2xl font-medium text-foreground max-w-xl mx-auto">
                  Ask me about trends, Pantaloons&apos; inventory, anything!
                </p>
              </div>
              <div className="max-w-2xl mx-auto w-full pt-4">
                <MessageInput isLanding />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            <div className="text-center py-8 opacity-50">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                ABFRL Product Recommendation
              </h2>
            </div>
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{statusText || "Assistant is thinking..."}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      {!isLanding && <MessageInput />}
    </div>
  );
};


