import { useChatStore } from '@/store/chatStore';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ModeToggle } from '@/components/ModeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Settings as SettingsIcon,
  User,
  Cpu,
  Database,
  Sliders,
  LogOut,
  Lock,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const {
    isSidebarOpen,
    logout
  } = useChatStore();

  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Local configuration changes have been updated successfully.",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar Layout */}
      <ChatSidebar />

      {/* Main panel layout */}
      <main
        className="flex-1 transition-all duration-300 overflow-y-auto flex flex-col h-screen"
        style={{ marginLeft: isSidebarOpen ? '14rem' : '0' }}
      >
        {/* Top Header Bar */}
        <header className="px-5 py-3 border-b border-border flex items-center justify-between bg-card">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              Settings
            </h1>
            <p className="text-xs text-muted-foreground">
              Configure models, search thresholds, and account details for Retrieva.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </header>

        {/* Settings Content Grid */}
        <div className="flex-1 p-5 max-w-4xl w-full mx-auto space-y-5">

          {/* Account Profile Card */}
          <div className="bg-card border border-border p-4 rounded-xl shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
              <User className="h-4.5 w-4.5 text-primary" /> Profile & Account
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-1">
              <Avatar className="h-16 w-16 border border-border">
                <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">JD</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <h4 className="text-sm font-semibold text-foreground">John Doe</h4>
                <p className="text-xs text-muted-foreground">john.doe@retrieva.com • Administrator</p>
                <div className="flex gap-2 justify-center sm:justify-start">
                  <Button variant="outline" size="sm" className="h-8 text-[11px] font-semibold">Change Avatar</Button>
                  <Button variant="ghost" size="sm" className="h-8 text-[11px] text-destructive hover:bg-destructive/10" onClick={() => logout()}>
                    <LogOut className="mr-1.5 h-3.5 w-3.5" /> Log out
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* RAG Settings Card */}
          <div className="bg-card border border-border p-4 rounded-xl shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
              <Cpu className="h-4.5 w-4.5 text-primary" /> Model Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-muted-foreground">LLM Generation Model</label>
                <Input value="Gemini 1.5 Pro" disabled className="bg-muted/30 border-border text-foreground" />
                <p className="text-[10px] text-muted-foreground">Primary model for contextual retail answer synthesis.</p>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-muted-foreground">Embedding Representation Model</label>
                <Input value="text-embedding-3-small" disabled className="bg-muted/30 border-border text-foreground" />
                <p className="text-[10px] text-muted-foreground">Used during document chunking & vector search.</p>
              </div>
            </div>
          </div>

          {/* Retrieval Preferences Card */}
          <div className="bg-card border border-border p-4 rounded-xl shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
              <Database className="h-4.5 w-4.5 text-primary" /> Retrieval Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Top-K Chunks Retrieved</label>
                <Input type="number" defaultValue="5" className="border-border text-foreground" />
                <p className="text-[10px] text-muted-foreground">Number of chunks fed to LLM context window.</p>
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Hybrid Search Alpha</label>
                <Input type="number" step="0.1" defaultValue="0.5" className="border-border text-foreground" />
                <p className="text-[10px] text-muted-foreground">0 = keyword search, 1.0 = purely semantic search.</p>
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Similarity Threshold (%)</label>
                <Input type="number" defaultValue="75" className="border-border text-foreground" />
                <p className="text-[10px] text-muted-foreground">Minimum score for context citation inclusion.</p>
              </div>
            </div>
          </div>

          {/* System Info Security */}
          <div className="bg-card border border-border p-4 rounded-xl shadow-2xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
              <Lock className="h-4.5 w-4.5 text-primary" /> System Info & Security
            </h3>

            <div className="flex flex-col gap-2 border border-border p-3 rounded-lg bg-muted/10">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">API Connection</span>
                <span className="text-green-500 font-semibold flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 fill-green-500 text-background" /> Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Database Engine</span>
                <span className="font-mono text-muted-foreground">Qdrant Vector Server v1.9.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Client Version</span>
                <span className="font-mono text-muted-foreground">v0.1.0-enterprise</span>
              </div>
            </div>
          </div>

          {/* Bottom Save bar */}
          <div className="flex justify-end gap-2 pt-2 pb-6">
            <Button variant="ghost" className="text-xs h-9 font-semibold">Discard</Button>
            <Button onClick={handleSave} className="text-xs h-9 font-semibold gap-1">
              <CheckCircle className="h-3.5 w-3.5" /> Save Changes
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
