import { X, Cloud, Link, FileText, Database, Box, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ConnectSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectSourceModal = ({ isOpen, onClose }: ConnectSourceModalProps) => {
  const { toast } = useToast();

  if (!isOpen) return null;

  const sources = [
    {
      name: 'Google Drive',
      description: 'Sync spreadsheets and docs from Drive.',
      icon: <Cloud className="h-6 w-6 text-blue-500" />,
      tag: 'Cloud Drive'
    },
    {
      name: 'Notion',
      description: 'Index Notion workspaces and tables.',
      icon: <FileText className="h-6 w-6 text-foreground" />,
      tag: 'Knowledge'
    },
    {
      name: 'SharePoint',
      description: 'Connect internal Microsoft directories.',
      icon: <Cloud className="h-6 w-6 text-teal-600" />,
      tag: 'Enterprise'
    },
    {
      name: 'Confluence',
      description: 'Ingest company wiki pages.',
      icon: <Link className="h-6 w-6 text-blue-600" />,
      tag: 'Wiki'
    },
    {
      name: 'Dropbox',
      description: 'Retrieve PDF and word files dynamically.',
      icon: <Box className="h-6 w-6 text-blue-400" />,
      tag: 'Cloud Drive'
    },
    {
      name: 'Local Folder',
      description: 'Upload folders from your local machine.',
      icon: <Folder className="h-6 w-6 text-yellow-500" />,
      tag: 'File Directory'
    }
  ];

  const handleCardClick = (name: string) => {
    toast({
      title: `${name} Connector`,
      description: `The connection to ${name} is coming soon. Backend integration is pending.`,
    });
  };

  return (
    <div className="fixed inset-0 bg-background/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
            <Link className="h-4.5 w-4.5 text-primary" />
            Connect External Source
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-muted rounded-full">
            <X className="h-4.5 w-4.5" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <p className="text-xs text-muted-foreground leading-normal">
            Select an external knowledge platform to sync document indexes directly into Retrieva&apos;s vector database.
          </p>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {sources.map((src, idx) => (
              <div
                key={idx}
                onClick={() => handleCardClick(src.name)}
                className={cn(
                  "border border-border/80 rounded-xl p-4 cursor-pointer transition-all duration-300",
                  "flex items-start gap-3 bg-muted/10 hover:border-primary/30 hover:bg-muted/30 hover:-translate-y-0.5 shadow-2xs hover:shadow-sm"
                )}
              >
                <div className="p-2.5 bg-background rounded-lg border border-border/50 shadow-2xs">
                  {src.icon}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground truncate">{src.name}</h4>
                    <span className="text-[8px] font-bold text-primary/80 uppercase bg-primary/10 px-1.5 py-0.2 rounded font-mono">
                      {src.tag}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-snug">
                    {src.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border flex items-center justify-end bg-muted/10">
          <Button onClick={onClose} size="sm" className="h-9 text-xs font-semibold px-4">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConnectSourceModal;
