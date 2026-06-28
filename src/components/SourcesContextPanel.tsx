import { useState } from 'react';
import { X, Check, File, FileText, FileSpreadsheet, Presentation, ChevronDown, ChevronRight, Sliders, Info, Server, LayoutList } from 'lucide-react';
import { useChatStore, Source } from '@/store/chatStore';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { Progress } from './ui/progress';

interface ChunkItem {
  chunkId: string;
  documentId: string;
  similarity: number;
  chunkText: string;
  fullText: string;
}

export const SourcesContextPanel = () => {
  const {
    isRightSidebarOpen,
    setRightSidebarOpen,
    rightSidebarTab,
    setRightSidebarTab,
    activeSourceId,
    getCurrentChat
  } = useChatStore();

  const chat = getCurrentChat();
  const messages = chat?.messages || [];
  
  // Find the last assistant message containing sources
  const assistantMessagesWithSources = [...messages]
    .reverse()
    .filter(msg => msg.role === 'assistant' && msg.sources && msg.sources.length > 0);
  
  const activeSources: Source[] = assistantMessagesWithSources[0]?.sources || [
    { id: 'src-1', title: 'Marketing Strategy 2026.pdf', fileType: 'pdf', pageNumber: 3, relevanceScore: 92 },
    { id: 'src-2', title: 'Sales Handbook.docx', fileType: 'docx', pageNumber: 8, relevanceScore: 88 },
    { id: 'src-3', title: 'Leadership Update Q2.pdf', fileType: 'pdf', pageNumber: 2, relevanceScore: 85 }
  ];

  // Frontend checkbox state for sources
  const [checkedSourceIds, setCheckedSourceIds] = useState<Record<string, boolean>>({
    'src-1': true,
    'src-2': true,
    'src-3': true
  });

  // State to track which chunks are expanded
  const [expandedChunkIds, setExpandedChunkIds] = useState<Record<string, boolean>>({});

  const toggleSourceCheckbox = (id: string) => {
    setCheckedSourceIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleChunkExpand = (id: string) => {
    setExpandedChunkIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf': return <File className="h-4 w-4 text-red-500 shrink-0" />;
      case 'xlsx':
      case 'xls':
      case 'csv': return <FileSpreadsheet className="h-4 w-4 text-green-500 shrink-0" />;
      case 'docx':
      case 'doc': return <FileText className="h-4 w-4 text-blue-500 shrink-0" />;
      case 'pptx':
      case 'ppt': return <Presentation className="h-4 w-4 text-orange-500 shrink-0" />;
      case 'md':
      case 'txt': return <FileText className="h-4 w-4 text-slate-500 shrink-0" />;
      default: return <File className="h-4 w-4 text-muted-foreground shrink-0" />;
    }
  };

  const mockChunks: Record<string, ChunkItem[]> = {
    'Marketing Strategy 2026.pdf': [
      {
        chunkId: 'Chunk 14',
        documentId: 'doc-1',
        similarity: 0.92,
        chunkText: 'In Q3 2026, Retrieva aims to scale digital acquisition channels by 45% using structured custom landing flows and segmented email outreach.',
        fullText: 'In Q3 2026, Retrieva aims to scale digital acquisition channels by 45% using structured custom landing flows and segmented email outreach. Our strategic initiatives place extreme emphasis on targeting fashion buyers who request inventory details via conversational bots. This involves integrating vector catalog lookups in real-time.'
      },
      {
        chunkId: 'Chunk 22',
        documentId: 'doc-1',
        similarity: 0.86,
        chunkText: 'Core marketing budgets have shifted from standard print media to semantic search placements and automated conversational agents.',
        fullText: 'Core marketing budgets have shifted from standard print media to semantic search placements and automated conversational agents. Analysis proves customer retention rises by 30% when retail recommendations are driven by a generic RAG indexing pipeline rather than rule-based algorithms.'
      }
    ],
    'Sales Handbook.docx': [
      {
        chunkId: 'Chunk 5',
        documentId: 'doc-2',
        similarity: 0.88,
        chunkText: 'Sales executives must configure initial workspace filters based on clothing brands, sizes, colors, and specific customer occasions.',
        fullText: 'Sales executives must configure initial workspace filters based on clothing brands, sizes, colors, and specific customer occasions. If the search constraints are too narrow, the hybrid search model defaults to search vector space embeddings for broad brand trends.'
      }
    ],
    'Leadership Update Q2.pdf': [
      {
        chunkId: 'Chunk 2',
        documentId: 'doc-3',
        similarity: 0.85,
        chunkText: 'Our Q2 engineering goals highlight the deployment of the Retrieva engine to index multi-lingual documents dynamically.',
        fullText: 'Our Q2 engineering goals highlight the deployment of the Retrieva engine to index multi-lingual documents dynamically. This enables staff across regional branches to perform semantic cross-queries in Hindi, Tamil, and English with sub-second retrieval times.'
      }
    ]
  };

  return (
    <>
      {/* Sliding Drawer Overlay */}
      {isRightSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/30 backdrop-blur-2xs z-40 transition-opacity duration-300"
          onClick={() => setRightSidebarOpen(false)}
        />
      )}

      {/* Sliding Side Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-screen w-[360px] bg-card border-l border-border shadow-2xl z-50 flex flex-col transition-all duration-300 ease-in-out",
          isRightSidebarOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Panel Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <LayoutList className="h-4 w-4 text-primary" />
            Sources & Context
          </h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setRightSidebarOpen(false)}
            className="h-8 w-8 hover:bg-muted rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-border text-xs font-semibold select-none bg-muted/30">
          {(['sources', 'chunks', 'details'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setRightSidebarTab(tab)}
              className={cn(
                "flex-1 py-3 text-center transition-all capitalize border-b-2 border-transparent text-muted-foreground",
                rightSidebarTab === tab && "border-primary text-primary font-bold bg-background/50"
              )}
            >
              {tab === 'sources' ? 'Sources' : tab === 'chunks' ? 'Relevant Chunks' : 'Details'}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <ScrollArea className="flex-1 p-4">
          {rightSidebarTab === 'sources' && (
            <div className="space-y-6">
              {/* Document List Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Retrieved Documents
                </h4>
                <div className="space-y-1.5">
                  {activeSources.map((source) => (
                    <div 
                      key={source.id}
                      onClick={() => toggleSourceCheckbox(source.id)}
                      className={cn(
                        "flex items-center gap-3 p-2.5 rounded-lg border border-border bg-muted/10 cursor-pointer transition-all",
                        checkedSourceIds[source.id] ? "border-primary/20 bg-primary/5" : "hover:bg-muted/30",
                        activeSourceId === source.id && "ring-1 ring-primary border-primary/50"
                      )}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded border border-input flex items-center justify-center transition-colors",
                        checkedSourceIds[source.id] && "bg-primary border-primary text-primary-foreground"
                      )}>
                        {checkedSourceIds[source.id] && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      
                      {getFileIcon(source.fileType)}

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{source.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Page {source.pageNumber}</p>
                      </div>

                      {source.relevanceScore && (
                        <div className="text-[10px] font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                          {source.relevanceScore}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Confidence Meter */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-muted-foreground uppercase tracking-wider">Confidence</span>
                  <span className="font-semibold text-green-500">High (90%)</span>
                </div>
                <div className="space-y-1">
                  <Progress value={90} className="h-2 bg-muted [&>div]:bg-green-500" />
                  <div className="flex justify-between text-[9px] text-muted-foreground">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>
              </div>

              {/* Context Summary collections */}
              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Context Summary
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Active collections searched during retrieval process:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Marketing', 'Engineering', 'HR'].map((col) => (
                    <span 
                      key={col}
                      className="px-2 py-0.5 bg-accent border border-border rounded-full text-[10px] font-medium text-foreground"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {rightSidebarTab === 'chunks' && (
            <div className="space-y-4">
              {Object.entries(mockChunks).map(([docTitle, chunks]) => (
                <div key={docTitle} className="space-y-2">
                  <div className="flex items-center gap-1.5 px-1 py-0.5 bg-muted/40 rounded border border-border/30">
                    <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span className="text-xs font-bold text-foreground truncate">{docTitle}</span>
                  </div>

                  <div className="space-y-2 pl-2">
                    {chunks.map((chunk) => {
                      const isExpanded = !!expandedChunkIds[chunk.chunkId];
                      return (
                        <div 
                          key={chunk.chunkId}
                          className="border border-border/70 rounded-lg p-2.5 bg-muted/15 space-y-1.5 transition-all"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-semibold text-primary">{chunk.chunkId}</span>
                            <span className="font-medium text-muted-foreground">Score: {chunk.similarity}</span>
                          </div>

                          <p className="text-xs text-foreground/80 leading-relaxed">
                            {chunk.chunkText}
                          </p>

                          <button
                            onClick={() => toggleChunkExpand(chunk.chunkId)}
                            className="flex items-center gap-1 text-[10px] text-primary font-semibold hover:underline mt-1 pt-1 border-t border-border/30 w-full"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronDown className="h-3 w-3" />
                                <span>Collapse Full Text</span>
                              </>
                            ) : (
                              <>
                                <ChevronRight className="h-3 w-3" />
                                <span>Expand Full Text</span>
                              </>
                            )}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 p-2 bg-card border border-border rounded text-[11px] font-mono text-muted-foreground leading-normal whitespace-pre-wrap max-h-40 overflow-y-auto">
                              {chunk.fullText}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {rightSidebarTab === 'details' && (
            <div className="space-y-5 text-xs">
              {/* Query Metadata */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" /> Query Metadata
                </h4>
                <div className="border border-border rounded-lg overflow-hidden bg-muted/10">
                  <div className="grid grid-cols-3 border-b border-border p-2">
                    <span className="text-muted-foreground font-medium">Original Query</span>
                    <span className="col-span-2 text-foreground truncate font-mono">
                      {chat?.title || "Ask trends inventory"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border p-2">
                    <span className="text-muted-foreground font-medium">Timestamp</span>
                    <span className="col-span-2 text-foreground font-mono">
                      {new Date().toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border p-2">
                    <span className="text-muted-foreground font-medium">Response Time</span>
                    <span className="col-span-2 text-foreground font-mono">1.24s</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border p-2">
                    <span className="text-muted-foreground font-medium">Embedding Model</span>
                    <span className="col-span-2 text-foreground font-mono">text-embedding-3-small</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border p-2">
                    <span className="text-muted-foreground font-medium">LLM used</span>
                    <span className="col-span-2 text-foreground font-mono">Gemini 1.5 Pro</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border p-2">
                    <span className="text-muted-foreground font-medium">Retrieved Docs</span>
                    <span className="col-span-2 text-foreground font-mono">3 documents</span>
                  </div>
                  <div className="grid grid-cols-3 p-2">
                    <span className="text-muted-foreground font-medium">Retrieved Chunks</span>
                    <span className="col-span-2 text-foreground font-mono">4 chunks</span>
                  </div>
                </div>
              </div>

              {/* Retrieval Configuration */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5" /> Retrieval Config
                </h4>
                <div className="border border-border rounded-lg overflow-hidden bg-muted/10">
                  <div className="grid grid-cols-3 border-b border-border p-2">
                    <span className="text-muted-foreground font-medium">Top K</span>
                    <span className="col-span-2 text-foreground font-mono">5 chunks</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border p-2">
                    <span className="text-muted-foreground font-medium">Chunk Size</span>
                    <span className="col-span-2 text-foreground font-mono">500 tokens</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border p-2">
                    <span className="text-muted-foreground font-medium">Chunk Overlap</span>
                    <span className="col-span-2 text-foreground font-mono">50 tokens</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border p-2">
                    <span className="text-muted-foreground font-medium">Hybrid Search</span>
                    <span className="col-span-2 text-foreground font-mono">Enabled (alpha = 0.5)</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border p-2">
                    <span className="text-muted-foreground font-medium">Reranking</span>
                    <span className="col-span-2 text-foreground font-mono">Cohere Rerank v3 (Top 3)</span>
                  </div>
                  <div className="grid grid-cols-3 p-2">
                    <span className="text-muted-foreground font-medium">Vector Database</span>
                    <span className="col-span-2 text-foreground flex items-center gap-1 font-mono">
                      <Server className="h-3 w-3 text-primary shrink-0" />
                      Qdrant Cloud
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </>
  );
};
