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
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { useBackendHealth } from '@/hooks/use-backend-health';
import { cn } from '@/lib/utils';

const StatusRow = ({ label, ok, value }: { label: string; ok?: boolean; value: string }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-muted-foreground">{label}</span>
    <span
      className={cn(
        'font-semibold flex items-center gap-1 text-right',
        ok ? 'text-emerald-600 dark:text-emerald-500' : 'text-amber-600 dark:text-amber-500'
      )}
    >
      {ok ? (
        <CheckCircle className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      )}
      <span className="font-mono font-normal">{value}</span>
    </span>
  </div>
);

export default function SettingsPage() {
  const {
    isSidebarOpen,
    logout
  } = useChatStore();

  const { status, health, error, refresh } = useBackendHealth();
  const loading = status === 'checking';

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

          {/* Model + retrieval configuration, read live from the backend.
              These are server-side settings (env-driven); there is no write
              endpoint, so they are presented read-only rather than as inputs
              that silently discard changes. */}
          <div className="bg-card border border-border p-4 rounded-xl shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
              <Cpu className="h-4.5 w-4.5 text-primary" /> Model Settings
              <span className="ml-auto text-[10px] font-medium text-muted-foreground">
                live from backend
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-muted-foreground">LLM Generation Model</label>
                <Input
                  value={health?.checks.llm.model ?? (loading ? 'Loading…' : 'Unavailable')}
                  readOnly
                  className="bg-muted/30 border-border text-foreground font-mono"
                />
                <p className="text-[10px] text-muted-foreground">
                  Provider: {health?.checks.llm.provider ?? '—'}
                  {health?.checks.llm.status === 'unconfigured' && ' • no API key set'}
                </p>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-muted-foreground">Embedding Model</label>
                <Input
                  value={health?.config.embedding_model ?? (loading ? 'Loading…' : 'Unavailable')}
                  readOnly
                  className="bg-muted/30 border-border text-foreground font-mono"
                />
                <p className="text-[10px] text-muted-foreground">Used during chunking &amp; vector search.</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
              <Database className="h-4.5 w-4.5 text-primary" /> Retrieval Configuration
              <span className="ml-auto text-[10px] font-medium text-muted-foreground">read-only</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {[
                { label: 'Retrieval Top-K', value: health?.config.retrieval_top_k, hint: 'Candidates pulled from Milvus.' },
                { label: 'Rerank Top-K', value: health?.config.rerank_top_k, hint: health?.config.rerank_enabled ? 'Reranking enabled.' : 'Reranking disabled.' },
                { label: 'Chunk Size', value: health?.config.chunk_size, hint: 'Characters per chunk.' },
                { label: 'Chunk Overlap', value: health?.config.chunk_overlap, hint: 'Characters shared between chunks.' },
              ].map(({ label, value, hint }) => (
                <div key={label} className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">{label}</label>
                  <Input
                    value={value ?? (loading ? '…' : '—')}
                    readOnly
                    className="bg-muted/30 border-border text-foreground font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">{hint}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] font-medium px-2 py-1 rounded-full border border-border bg-muted/20">
                Hybrid search: {health ? (health.config.hybrid_search ? 'on' : 'off') : '—'}
              </span>
              <span className="text-[11px] font-medium px-2 py-1 rounded-full border border-border bg-muted/20">
                Reranking: {health ? (health.config.rerank_enabled ? 'on' : 'off') : '—'}
              </span>
              <span className="text-[11px] font-medium px-2 py-1 rounded-full border border-border bg-muted/20">
                Default collection: {health?.config.collection ?? '—'}
              </span>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-card border border-border p-4 rounded-xl shadow-2xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
              <Lock className="h-4.5 w-4.5 text-primary" /> System Status
              <button
                onClick={refresh}
                className="ml-auto text-[11px] font-semibold text-primary hover:underline"
              >
                Refresh
              </button>
            </h3>

            <div className="flex flex-col gap-2 border border-border p-3 rounded-lg bg-muted/10">
              <StatusRow
                label="API Connection"
                ok={status === 'ok' || status === 'degraded'}
                value={
                  status === 'checking'
                    ? 'Checking…'
                    : status === 'unreachable'
                    ? error || 'Unreachable'
                    : `Connected (${health?.status})`
                }
              />
              <StatusRow
                label="Database"
                ok={health?.checks.database.status === 'ok'}
                value={
                  health
                    ? `${health.checks.database.engine ?? 'unknown'} — ${health.checks.database.status}`
                    : '—'
                }
              />
              <StatusRow
                label="Vector Store"
                ok={health?.checks.milvus.status === 'ok'}
                value={
                  health
                    ? `${health.checks.milvus.uri ?? 'milvus'} — ${health.checks.milvus.status}`
                    : '—'
                }
              />
              <StatusRow
                label="LLM Provider"
                ok={health?.checks.llm.status === 'ok'}
                value={
                  health
                    ? `${health.checks.llm.provider ?? '—'} — ${health.checks.llm.status}`
                    : '—'
                }
              />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Backend Version</span>
                <span className="font-mono text-muted-foreground">{health?.version ?? '—'}</span>
              </div>
            </div>

            {health?.checks.llm.status === 'unconfigured' && (
              <p className="text-[11px] text-amber-600 dark:text-amber-500">
                No LLM API key is configured on the backend — chat will fail until one is set
                ({health.checks.llm.provider === 'openai' ? 'OPENAI_API_KEY' : 'GOOGLE_API_KEY'}).
              </p>
            )}
          </div>

          <div className="pb-6" />
        </div>
      </main>
    </div>
  );
}
