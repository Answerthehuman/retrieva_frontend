import { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { SourcesContextPanel } from './SourcesContextPanel';
import { Loader2, Settings, LogOut, Plus, X, Check } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
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
import { ActionCards } from './home/ActionCards';
import { QuickAccess } from './home/QuickAccess';
import { useBackendHealth } from '@/hooks/use-backend-health';
import { BackendStatusBadge } from './BackendStatusBadge';

const USER_FIRST_NAME = 'John';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export const ChatWindow = () => {
  const {
    getCurrentChat,
    isLoading,
    logout,
    statusText,
    availableCollections,
    activeCollection,
    setActiveCollection,
  } = useChatStore();

  const { status: backendStatus, health } = useBackendHealth();

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
      <div className="absolute top-5 right-6 flex items-center gap-3 z-30">
        <span className="hidden md:inline-block text-sm font-medium text-muted-foreground">John Doe</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" aria-label="Open account menu" className="relative h-9 w-9 rounded-full p-0 overflow-hidden border border-border shadow-sm transition-transform duration-200 hover:scale-105">
              <Avatar className="h-9 w-9">
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

      {/* Active Context Selector (only shown when not landing screen) */}
      {!isLanding && (
        <div className="w-full border-b border-border bg-card px-4 py-2 flex items-center justify-center z-20 shadow-2xs mt-[60px] animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 max-w-3xl w-full text-xs">
            <span className="font-bold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">
              Using Context
            </span>

            <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full font-medium border border-primary/20 shadow-2xs text-[11px]">
                {activeCollection ?? health?.config?.collection ?? 'default collection'}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 rounded-full border-dashed gap-1 text-[11px] font-medium"
                    disabled={availableCollections.length === 0}
                  >
                    <Plus className="h-3 w-3" /> Change
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 mt-1">
                  <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase">
                    Milvus Collections
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => setActiveCollection(null)}
                    className="flex items-center justify-between cursor-pointer text-xs"
                  >
                    <span>Server default</span>
                    {activeCollection === null && <Check className="h-3.5 w-3.5 text-primary" />}
                  </DropdownMenuItem>
                  {availableCollections.map((col) => (
                    <DropdownMenuItem
                      key={col}
                      onClick={() => setActiveCollection(col)}
                      className="flex items-center justify-between cursor-pointer text-xs"
                    >
                      <span className="truncate">{col}</span>
                      {activeCollection === col && <Check className="h-3.5 w-3.5 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <BackendStatusBadge status={backendStatus} health={health} className="shrink-0" />
          </div>
        </div>
      )}

      {/* Main Messages scroll pane */}
      <div className="flex-1 overflow-y-auto">
        {isLanding ? (
          <div className="flex min-h-full flex-col justify-center px-6 py-10">
            <div className="mx-auto w-full max-w-3xl 2xl:max-w-4xl space-y-7 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* Greeting */}
              <header className="space-y-1.5">
                <h1 className="text-[2.5rem] xl:text-[2.75rem] font-bold leading-[1.1] tracking-tight text-foreground">
                  {getGreeting()}, {USER_FIRST_NAME}! <span aria-hidden="true">👋</span>
                </h1>
                <p className="text-[15px] font-medium text-muted-foreground">
                  Your AI knowledge companion for faster, smarter decisions.
                </p>
              </header>

              {/* Actionable shortcuts */}
              <ActionCards />

              {/* Primary focus: the composer */}
              <MessageInput isLanding />

              <QuickAccess />
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-5 space-y-5">
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
            {isLoading && (
              <div role="status" className="flex items-center gap-2 text-muted-foreground animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
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
