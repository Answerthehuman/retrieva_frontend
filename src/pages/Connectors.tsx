import { useChatStore } from '@/store/chatStore';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ModeToggle } from '@/components/ModeToggle';
import { Button } from '@/components/ui/button';
import { Plug, Check, Clock, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/**
 * Connectors — apps that feed documents into Retrieva.
 *
 * Presentation only for now: the backend integrations are being built one app
 * at a time. Nothing here claims to be connected, and the connect buttons say
 * plainly that the integration isn't live yet rather than faking a flow.
 */

type ConnectorStatus = 'available' | 'coming-soon';

interface Connector {
  id: string;
  name: string;
  description: string;
  /** Real logo from public/connectors/. */
  logo: string;
  status: ConnectorStatus;
  category: 'Storage' | 'Communication' | 'Productivity' | 'Development';
}

const CONNECTORS: Connector[] = [
  {
    id: 'drive',
    name: 'Google Drive',
    description: 'Index documents, spreadsheets, and slides from your Drive.',
    logo: '/connectors/drive.png',
    status: 'available',
    category: 'Storage',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Search across threads, attachments, and correspondence.',
    logo: '/connectors/gmail.png',
    status: 'available',
    category: 'Communication',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Pull in channel history and shared files as context.',
    logo: '/connectors/slack.png',
    status: 'available',
    category: 'Communication',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync pages, databases, and team wikis.',
    logo: '/connectors/notion.png',
    status: 'available',
    category: 'Productivity',
  },
  {
    id: 'sheets',
    name: 'Google Sheets',
    description: 'Query structured data and tables directly.',
    logo: '/connectors/sheets.png',
    status: 'coming-soon',
    category: 'Productivity',
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    description: 'Bring meetings, agendas, and invites into context.',
    logo: '/connectors/calendar.png',
    status: 'coming-soon',
    category: 'Productivity',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Index repositories, issues, pull requests, and docs.',
    logo: '/connectors/github.png',
    status: 'coming-soon',
    category: 'Development',
  },
];

const CATEGORY_ORDER: Connector['category'][] = [
  'Storage',
  'Communication',
  'Productivity',
  'Development',
];

const StatusPill = ({ status }: { status: ConnectorStatus }) => {
  if (status === 'coming-soon') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        <Clock className="h-3 w-3" />
        Coming soon
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/[0.08] px-2 py-0.5 text-[11px] font-medium text-primary">
      <Check className="h-3 w-3" />
      Available
    </span>
  );
};

const Connectors = () => {
  const { isSidebarOpen } = useChatStore();
  const { toast } = useToast();

  const handleConnect = (connector: Connector) => {
    // No OAuth flow exists yet. Say so rather than opening a dead-end dialog.
    toast({
      title: `${connector.name} isn't wired up yet`,
      description:
        'Connectors are being built one app at a time. This page previews what is planned — no data is being synced.',
    });
  };

  const connectedCount = 0;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <ChatSidebar />

      <div
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? '14rem' : '0' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="space-y-1">
            <h1 className="flex items-center gap-2 text-lg font-semibold">
              <Plug className="h-[18px] w-[18px] text-primary" strokeWidth={1.9} />
              Connectors
            </h1>
            <p className="text-xs text-muted-foreground">
              Connect the apps Retrieva should search alongside your uploaded documents.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="mx-auto w-full max-w-4xl space-y-5">
            {/* Be explicit that this is a preview, so an empty state doesn't
                read as "your connectors broke". */}
            <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/40 p-3.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="space-y-0.5">
                <p className="text-[13px] font-medium text-foreground">
                  Preview — no connectors are live yet
                </p>
                <p className="text-[12px] leading-relaxed text-muted-foreground">
                  The backend integrations are being built one app at a time. Until then,
                  add documents through the Knowledge Base.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{connectedCount}</span> of{' '}
                {CONNECTORS.length} connected
              </p>
            </div>

            {CATEGORY_ORDER.map((category) => {
              const items = CONNECTORS.filter((c) => c.category === category);
              if (items.length === 0) return null;

              return (
                <section key={category} className="space-y-2.5">
                  <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {items.map((connector) => (
                      <div
                        key={connector.id}
                        className={cn(
                          'flex items-start gap-3 rounded-xl border border-border bg-card p-3.5',
                          'shadow-2xs transition-all duration-200',
                          'hover:border-primary/40 hover:shadow-[0_2px_4px_rgba(37,99,235,0.06),0_10px_24px_-8px_rgba(37,99,235,0.15)]',
                        )}
                      >
                        <img
                          src={connector.logo}
                          alt=""
                          aria-hidden="true"
                          className="h-9 w-9 shrink-0 rounded-lg object-contain"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-medium text-foreground">
                              {connector.name}
                            </h3>
                            <StatusPill status={connector.status} />
                          </div>
                          <p className="text-[12px] leading-relaxed text-muted-foreground">
                            {connector.description}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={connector.status === 'coming-soon'}
                            onClick={() => handleConnect(connector)}
                            className="h-7 text-xs"
                          >
                            {connector.status === 'coming-soon' ? 'Not yet available' : 'Connect'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connectors;
