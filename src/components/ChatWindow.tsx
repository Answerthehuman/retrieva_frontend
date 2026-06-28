import { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { SourcesContextPanel } from './SourcesContextPanel';
import { Loader2, Settings, LogOut, Plus, X, Check } from 'lucide-react';
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
  const {
    getCurrentChat,
    isLoading,
    logout,
    statusText,
    activeContextCollections,
    toggleActiveContextCollection
  } = useChatStore();

  const chat = getCurrentChat();
  const messages = chat?.messages || [];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLanding = messages.length === 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden">
      {/* User profile section in top-right */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-30">
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
                <p className="text-xs leading-none text-muted-foreground pt-1">john.doe@retrieva.com</p>
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
        <div className="absolute top-6 left-6 animate-in fade-in duration-700 z-15">
          <h2 className="text-lg font-bold tracking-tight text-foreground/80">
            Retrieva RAG
          </h2>
        </div>
      )}

      {/* Active Context Selector (only shown when not landing screen) */}
      {!isLanding && (
        <div className="w-full border-b border-border bg-card px-4 py-3 flex items-center justify-center z-20 shadow-2xs mt-[88px] animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 max-w-3xl w-full text-xs">
            <span className="font-bold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">
              Using Context
            </span>

            <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
              {activeContextCollections.map((col) => (
                <span
                  key={col}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full font-medium border border-primary/20 shadow-2xs text-[11px] animate-in zoom-in-95 duration-150"
                >
                  {col}
                  <button
                    onClick={() => toggleActiveContextCollection(col)}
                    className="hover:bg-primary/20 p-0.5 rounded-full text-primary transition-all cursor-pointer"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 rounded-full border-dashed gap-1 text-[10px] font-medium"
                  >
                    <Plus className="h-3 w-3" /> Add / Change
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 mt-1">
                  <DropdownMenuLabel className="text-[9px] text-muted-foreground uppercase">
                    Toggle Active Collections
                  </DropdownMenuLabel>
                  {['Marketing', 'Engineering', 'HR', 'Finance', 'Product'].map((col) => {
                    const isChecked = activeContextCollections.includes(col);
                    return (
                      <DropdownMenuItem
                        key={col}
                        onClick={() => toggleActiveContextCollection(col)}
                        className="flex items-center justify-between cursor-pointer text-xs"
                      >
                        <span>{col}</span>
                        {isChecked && <Check className="h-3.5 w-3.5 text-primary" />}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}

      {/* Main Messages scroll pane */}
      <div className="flex-1 overflow-y-auto">
        {isLanding ? (
          <div className="flex flex-col items-center justify-center min-h-full px-4 text-center">
            <div className="max-w-3xl w-full space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="space-y-4">
                <p className="text-xl md:text-2xl font-medium text-foreground max-w-xl mx-auto">
                  What&apos;s on the agenda today?
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
              <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm">{statusText || "Assistant is thinking..."}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {!isLanding && <MessageInput />}

      {/* Sources & Context panel (slides in from the right) */}
      <SourcesContextPanel />
    </div>
  );
};
