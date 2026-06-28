import { useKnowledgeStore } from '@/store/knowledgeStore';
import { 
  Database, 
  FileCheck, 
  AlertTriangle, 
  XCircle, 
  FolderOpen, 
  Layers, 
  HardDrive 
} from 'lucide-react';

export const KnowledgeStats = () => {
  const { documents, collections } = useKnowledgeStore();

  const totalDocs = documents.length;
  const indexedCount = documents.filter(d => d.status === 'Indexed').length;
  const needsReindexCount = documents.filter(d => d.status === 'Needs Re-index').length;
  const failedCount = documents.filter(d => d.status === 'Failed').length;
  const totalCollections = collections.length;
  const totalChunks = documents.reduce((sum, d) => sum + d.chunksCount, 0);
  const totalSize = documents.reduce((sum, d) => sum + d.sizeBytes, 0);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const statItems = [
    {
      label: 'Total Documents',
      value: `${totalDocs} Documents`,
      icon: <Database className="h-4 w-4 text-primary shrink-0" />,
      borderColor: 'hover:border-primary/20'
    },
    {
      label: 'Indexed',
      value: `${indexedCount} Indexed`,
      icon: <FileCheck className="h-4 w-4 text-green-500 shrink-0" />,
      borderColor: 'hover:border-green-500/20'
    },
    {
      label: 'Needs Re-index',
      value: `${needsReindexCount} Needs Re-index`,
      icon: <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />,
      borderColor: 'hover:border-orange-500/20'
    },
    {
      label: 'Failed',
      value: `${failedCount} Failed`,
      icon: <XCircle className="h-4 w-4 text-red-500 shrink-0" />,
      borderColor: 'hover:border-red-500/20'
    },
    {
      label: 'Collections',
      value: `${totalCollections} Collections`,
      icon: <FolderOpen className="h-4 w-4 text-indigo-500 shrink-0" />,
      borderColor: 'hover:border-indigo-500/20'
    },
    {
      label: 'Chunks',
      value: totalChunks.toLocaleString(),
      icon: <Layers className="h-4 w-4 text-cyan-500 shrink-0" />,
      borderColor: 'hover:border-cyan-500/20'
    },
    {
      label: 'Storage Used',
      value: formatSize(totalSize),
      icon: <HardDrive className="h-4 w-4 text-amber-500 shrink-0" />,
      borderColor: 'hover:border-amber-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-7 gap-3.5 w-full">
      {statItems.map((item, idx) => (
        <div
          key={idx}
          className={`bg-card border border-border/80 p-3 rounded-xl shadow-2xs space-y-2 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xs hover:bg-card/85 cursor-default ${item.borderColor}`}
        >
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5 min-w-0 truncate">
            {item.icon}
            <span className="truncate">{item.label}</span>
          </span>
          <p className="text-sm font-bold tracking-tight text-foreground font-mono truncate pt-1">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default KnowledgeStats;
