import { useState, KeyboardEvent, useRef } from 'react';
import { Send, Mic, MicOff, Loader2, Paperclip, X, File, FileText, FileSpreadsheet, Presentation } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { chatApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { SarvamAIClient } from 'sarvamai';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  isLanding?: boolean;
  onDocumentsSelected?: (files: File[]) => void;
}

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md', '.csv', '.xlsx', '.pptx'];

export const MessageInput = ({ isLanding, onDocumentsSelected }: MessageInputProps) => {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    addMessageToCurrentChat, 
    setIsLoading, 
    setStatusText,
    updateLastMessageInCurrentChat,
    isLoading, 
    getCurrentChat, 
    createNewChat 
  } = useChatStore();
  const { toast } = useToast();
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();

  const isAcceptedType = (file: File) => {
    const name = file.name.toLowerCase();
    return ACCEPTED_EXTENSIONS.some(ext => name.endsWith(ext));
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return <File className="h-4 w-4 text-red-500" />;
      case 'xlsx':
      case 'xls':
      case 'csv': return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      case 'docx':
      case 'doc': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'pptx':
      case 'ppt': return <Presentation className="h-4 w-4 text-orange-500" />;
      case 'md':
      case 'txt': return <FileText className="h-4 w-4 text-slate-500" />;
      default: return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter(isAcceptedType);
      
      if (validFiles.length > 0) {
        const nextFiles = [...files, ...validFiles];
        setFiles(nextFiles);
        if (onDocumentsSelected) {
          onDocumentsSelected(validFiles);
        }
      } else {
        toast({
          title: "Invalid file type",
          description: "Accepted formats: PDF, DOCX, TXT, MD, CSV, XLSX, PPTX.",
          variant: "destructive"
        });
      }
    }
  };

  const handleFileSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      const validFiles = selected.filter(isAcceptedType);
      
      if (validFiles.length > 0) {
        const nextFiles = [...files, ...validFiles];
        setFiles(nextFiles);
        if (onDocumentsSelected) {
          onDocumentsSelected(validFiles);
        }
      } else {
        toast({
          title: "Invalid file type",
          description: "Accepted formats: PDF, DOCX, TXT, MD, CSV, XLSX, PPTX.",
          variant: "destructive"
        });
      }
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
  };

  const handleSend = async () => {
    if ((!input.trim() && files.length === 0) || isLoading) return;

    let chat = getCurrentChat();
    if (!chat) {
      createNewChat();
      chat = useChatStore.getState().getCurrentChat();
    }
    if (!chat) return;

    const userMessage = {
      role: 'user' as const,
      content: input.trim() || `Uploaded ${files.length} document(s).`,
      timestamp: new Date().toISOString(),
    };

    // Prepare mock sources if files are selected, or general fallback mock sources
    const mockSources = files.length > 0 
      ? files.map((f, idx) => ({
          id: `src-${idx}-${crypto.randomUUID().slice(0, 4)}`,
          title: f.name,
          fileType: (f.name.split('.').pop()?.toLowerCase() as any) || 'pdf',
          pageNumber: Math.floor(Math.random() * 8) + 1,
          relevanceScore: Math.floor(Math.random() * 15) + 82
        }))
      : [
          { id: 'src-1', title: 'Marketing Strategy 2026.pdf', fileType: 'pdf' as const, pageNumber: 3, relevanceScore: 92 },
          { id: 'src-2', title: 'Sales Handbook.docx', fileType: 'docx' as const, pageNumber: 8, relevanceScore: 88 }
        ];

    addMessageToCurrentChat(userMessage);
    setInput('');
    const currentFiles = [...files];
    setFiles([]); // Clear chips in UI immediately

    setIsLoading(true);
    setStatusText("Assistant is thinking...");

    try {
      let sessionId = chat.sessionId;
      
      // If no session exists yet, create one
      if (!sessionId) {
        const sessionData = await chatApi.createSession(undefined, userMessage.content);
        sessionId = sessionData.session_id;
        useChatStore.getState().updateChatSession(chat.id, sessionId);
      }

      // Add an empty assistant message that we'll stream into
      const initialAssistantMessage = {
        role: 'assistant' as const,
        content: '',
        timestamp: new Date().toISOString(),
        products: [],
        sources: [],
      };
      addMessageToCurrentChat(initialAssistantMessage);

      const productsMap = new Map<string, any>();
      let accumulatedText = "";

      const mapStatusToStage = (status: string): string => {
        const lower = status.toLowerCase();
        if (lower.includes("checking trends") || lower.includes("checking latest fashion")) {
          return "Checking trends";
        }
        if (lower.includes("retrieving inventory") || lower.includes("retrieving from inventory") || lower.includes("retrieving matching products")) {
          return "Retrieving from inventory";
        }
        if (lower.includes("reranking") || lower.includes("rerank")) {
          return "Reranking chunks";
        }
        return status;
      };

      const updateStatusIfAllowed = (rawStatus: string) => {
        const mappedStatus = mapStatusToStage(rawStatus);
        const STATUS_WEIGHTS: Record<string, number> = {
          "": 0,
          "Assistant is thinking...": 0,
          "Checking trends": 1,
          "Retrieving from inventory": 2,
          "Reranking chunks": 3
        };
        const currentStatus = useChatStore.getState().statusText;
        const currentWeight = STATUS_WEIGHTS[currentStatus] || 0;
        const newWeight = STATUS_WEIGHTS[mappedStatus] || 0;
        if (newWeight >= currentWeight) {
          setStatusText(mappedStatus);
        }
      };

      await chatApi.sendMessageStream(userMessage.content, sessionId, (type, data) => {
        if (type === 'retrieval_start') {
          updateStatusIfAllowed("Checking trends");
        } else if (type === 'status') {
          updateStatusIfAllowed(data.content || "Processing...");
        } else if (type === 'generation_start') {
          updateStatusIfAllowed("Checking trends");
        } else if (type === 'text' || type === 'token' || type === 'markdown') {
          const token = data.content || '';
          accumulatedText += token;
          updateLastMessageInCurrentChat((msg) => ({
            ...msg,
            content: accumulatedText,
          }));
        } else if (type === 'retrieval_complete') {
          updateStatusIfAllowed("Retrieving from inventory");
        } else if (type === 'item') {
          const productUrl = data.link || "";
          const newProduct = {
            index_number: data.metadata?.index_number || (productsMap.size + 1),
            product_url: productUrl,
            product_image_url: data.metadata?.image_url || "",
            brand: data.content || "",
            product_category: "",
            product_colour: "",
            occasions: "",
            stream: data.metadata?.stream || ""
          };

          if (productUrl) {
            if (productsMap.has(productUrl)) {
              const existing = productsMap.get(productUrl);
              if (existing.stream && newProduct.stream && existing.stream !== newProduct.stream) {
                existing.stream = 'both';
              }
            } else {
              productsMap.set(productUrl, newProduct);
            }

            const mergedProducts = Array.from(productsMap.values());
            mergedProducts.forEach((p, idx) => {
              p.index_number = idx + 1;
            });

            updateLastMessageInCurrentChat((msg) => ({
              ...msg,
              products: mergedProducts,
            }));
          }
        } else if (type === 'generation_complete') {
          if (data.content) {
            accumulatedText = data.content;
          }
          // Attach mock sources on generation complete
          updateLastMessageInCurrentChat((msg) => ({
            ...msg,
            content: accumulatedText,
            sources: mockSources
          }));
        }
      });

      setIsLoading(false);
      setStatusText('');
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
      try {
        const audioBlob = await stopRecording();
        setIsTranscribing(true);

        const sarvam = new SarvamAIClient({
          apiSubscriptionKey: import.meta.env.VITE_SARVAM_API_KEY || ''
        });

        const mimeType = audioBlob.type.split(';')[0];
        const extension = mimeType.split('/')[1] || 'webm';
        const file = new File([audioBlob], `audio.${extension}`, { type: mimeType });

        const response = await sarvam.speechToText.transcribe({
          file: file,
          model: 'saaras:v3',
          language_code: 'unknown'
        });

        if (response.transcript) {
          setInput(prev => prev + (prev ? ' ' : '') + response.transcript);
        } else {
          toast({ 
            title: 'No transcript', 
            description: 'Could not find any speech in the audio.',
            variant: 'destructive'
          });
        }

      } catch (error: any) {
        console.error('Transcription failed details:', error);
        
        let errorDesc = 'Could not convert speech to text. Please check your API key and internet connection.';
        if (error.message) errorDesc = error.message;
        if (error.body) {
          try {
            const body = typeof error.body === 'string' ? JSON.parse(error.body) : error.body;
            if (body.message) errorDesc = body.message;
          } catch (e) {}
        }

        toast({
          title: 'Transcription failed',
          description: errorDesc,
          variant: 'destructive'
        });
      } finally {
        setIsTranscribing(false);
      }
    } else {
      try {
        await startRecording();
      } catch (error) {
        console.error('Microphone access failed:', error);
        toast({
          title: 'Microphone error',
          description: 'Could not access microphone. Please grant permission.',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <div className={cn(
      "w-full transition-all duration-500",
      isLanding ? "bg-transparent" : "border-t border-border bg-background"
    )}>
      <div className={cn(
        "max-w-3xl mx-auto px-4 py-4",
        isLanding ? "max-w-2xl px-0" : ""
      )}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept=".pdf,.docx,.txt,.md,.csv,.xlsx,.pptx"
          className="hidden"
        />

        <div 
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col gap-2 p-2.5 transition-all duration-300",
            "bg-background border rounded-[24px] shadow-sm ring-1 ring-border focus-within:ring-primary/20 focus-within:border-primary/30",
            isDragging && "border-primary ring-2 ring-primary/25 bg-primary/5 scale-[1.01]",
            isLanding && "shadow-2xl shadow-primary/5"
          )}
        >
          {/* File chips row */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 px-2 pt-1 border-b border-border/50 pb-2">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1 bg-accent text-accent-foreground text-xs rounded-full border border-border shadow-2xs hover:bg-accent/80 transition-all animate-in zoom-in-95 duration-150"
                >
                  {getFileIcon(file.name)}
                  <span className="max-w-[150px] truncate font-medium">{file.name}</span>
                  <button
                    onClick={() => removeFile(idx)}
                    type="button"
                    className="ml-1 text-muted-foreground hover:text-foreground hover:bg-muted p-0.5 rounded-full transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input elements row */}
          <div className="flex items-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleFileSelectClick}
              disabled={isLoading || isTranscribing}
              className="h-11 w-11 shrink-0 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Add documents"
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLanding ? "How can I help you today?" : "Type your message..."}
              disabled={isLoading || isTranscribing}
              className={cn(
                "min-h-[56px] max-h-[200px] resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent py-4 text-lg ml-0 flex-1",
                !isLanding && "text-base py-3 h-14"
              )}
              rows={1}
            />

            <div className="flex items-center gap-2 pb-1.5 pr-1.5">
              <Button
                onClick={handleMicClick}
                variant={isRecording ? 'destructive' : 'ghost'}
                size="icon"
                disabled={isTranscribing || isLoading}
                className={cn(
                  "h-11 w-11 shrink-0 rounded-full transition-all",
                  isRecording ? "animate-pulse" : "hover:bg-muted"
                )}
                title={isRecording ? 'Stop listening' : 'Start speech-to-text'}
              >
                {isTranscribing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
              <Button
                onClick={handleSend}
                disabled={(!input.trim() && files.length === 0) || isLoading || isTranscribing}
                size="icon"
                className={cn(
                  "h-11 w-11 shrink-0 rounded-full transition-all",
                  ((!input.trim() && files.length === 0) || isLoading) ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground shadow-sm hover:scale-105 active:scale-95"
                )}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
