import { useState, KeyboardEvent, useRef, useEffect } from 'react';
// `File` is aliased: the bare lucide export shadows the DOM File constructor,
// which the speech-to-text handler needs to build its upload.
import { Send, Mic, MicOff, Loader2, Paperclip, X, File as FileIcon, FileText, FileSpreadsheet, Presentation } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { chatApi, toSource, type RetrievedDocument } from '@/lib/api';
import type { Source } from '@/store/chatStore';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    addMessageToCurrentChat,
    setIsLoading,
    setStatusText,
    updateLastMessageInCurrentChat,
    isLoading,
    getCurrentChat,
    createNewChat,
    draftInput,
    setDraftInput,
    activeCollection,
  } = useChatStore();

  // Homepage action cards / quick-access tiles seed the composer through the
  // store. Consume the draft once so picking the same card twice still works.
  useEffect(() => {
    if (!draftInput) return;
    setInput(draftInput);
    setDraftInput('');
    const el = textareaRef.current;
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [draftInput, setDraftInput]);
  const { toast } = useToast();
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();

  const isAcceptedType = (file: File) => {
    const name = file.name.toLowerCase();
    return ACCEPTED_EXTENSIONS.some(ext => name.endsWith(ext));
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return <FileIcon className="h-4 w-4 text-red-500" />;
      case 'xlsx':
      case 'xls':
      case 'csv': return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      case 'docx':
      case 'doc': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'pptx':
      case 'ppt': return <Presentation className="h-4 w-4 text-orange-500" />;
      case 'md':
      case 'txt': return <FileText className="h-4 w-4 text-slate-500" />;
      default: return <FileIcon className="h-4 w-4 text-muted-foreground" />;
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

      let accumulatedText = "";
      // Documents the backend actually retrieved, accumulated across every
      // search the agent runs this turn. These are the real citations.
      const retrieved = new Map<string, Source>();
      let streamFailed: string | null = null;

      await chatApi.sendMessageStream(
        userMessage.content,
        sessionId,
        (type, data) => {
          if (type === 'retrieval_start') {
            setStatusText(
              data.query ? `Searching for "${data.query}"…` : 'Searching your knowledge base…'
            );
          } else if (type === 'retrieval_complete') {
            const docs: RetrievedDocument[] = data.documents || [];
            docs.forEach((doc, idx) => {
              const source = toSource(doc, retrieved.size + idx);
              // Keep the highest-scoring hit per document id.
              const existing = retrieved.get(source.id);
              if (!existing || source.relevanceScore > existing.relevanceScore) {
                retrieved.set(source.id, source);
              }
            });
            setStatusText(
              docs.length
                ? `Reading ${docs.length} passage${docs.length === 1 ? '' : 's'}…`
                : 'No matching passages found…'
            );
          } else if (type === 'generation_start') {
            setStatusText('Writing an answer…');
          } else if (type === 'text' || type === 'token' || type === 'markdown') {
            accumulatedText += data.content || '';
            updateLastMessageInCurrentChat((msg) => ({
              ...msg,
              content: accumulatedText,
            }));
          } else if (type === 'generation_complete') {
            updateLastMessageInCurrentChat((msg) => ({
              ...msg,
              content: accumulatedText,
              sources: Array.from(retrieved.values()).sort(
                (a, b) => b.relevanceScore - a.relevanceScore
              ),
            }));
          } else if (type === 'error') {
            streamFailed = data.message || 'The assistant hit an error.';
          }
        },
        { collectionName: activeCollection }
      );

      setIsLoading(false);
      setStatusText('');

      if (streamFailed) {
        updateLastMessageInCurrentChat((msg) => ({
          ...msg,
          content: msg.content || `⚠️ ${streamFailed}`,
        }));
        toast({
          title: 'Assistant error',
          description: streamFailed,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
      setStatusText('');
      const description =
        error?.message === 'Failed to fetch'
          ? 'Could not reach the Retrieva backend. Is it running?'
          : error?.message || 'Failed to send message. Please try again.';
      // Surface the failure in the transcript rather than leaving a blank bubble.
      updateLastMessageInCurrentChat((msg) => ({
        ...msg,
        content: msg.content || `⚠️ ${description}`,
      }));
      toast({
        title: 'Error',
        description,
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
        "mx-auto",
        // On the landing screen the parent owns width/rhythm so the composer
        // lines up with the action cards and quick-access grid.
        isLanding ? "w-full" : "max-w-3xl px-4 py-3"
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
            "flex flex-col gap-2 p-2.5 transition-all duration-200 ease-out",
            "rounded-[26px] border border-primary/15 bg-card/85 backdrop-blur-xl",
            "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-10px_rgba(37,99,235,0.18)]",
            "focus-within:border-primary/40 focus-within:shadow-[0_2px_4px_rgba(37,99,235,0.06),0_14px_34px_-12px_rgba(37,99,235,0.28)]",
            isDragging && "border-primary bg-primary/5 ring-2 ring-primary/25",
            isLanding && "p-3 shadow-[0_2px_6px_rgba(15,23,42,0.05),0_18px_44px_-14px_rgba(37,99,235,0.28)]"
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
                    aria-label={`Remove ${file.name}`}
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
              aria-label="Add documents"
              className="h-11 w-11 shrink-0 rounded-full hover:bg-primary/[0.07] text-muted-foreground hover:text-primary transition-colors duration-200"
              title="Add documents"
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="How can I help you today?"
              disabled={isLoading || isTranscribing}
              aria-label="Message"
              className={cn(
                "resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 ml-0 flex-1",
                "max-h-[200px] placeholder:text-muted-foreground",
                isLanding ? "min-h-[60px] py-4 text-base" : "min-h-[48px] py-3 text-[15px]"
              )}
              rows={1}
            />

            <div className="flex items-center gap-1.5 pb-1.5 pr-1.5">
              <Button
                onClick={handleMicClick}
                variant={isRecording ? 'destructive' : 'ghost'}
                size="icon"
                disabled={isTranscribing || isLoading}
                aria-label={isRecording ? 'Stop listening' : 'Start speech-to-text'}
                className={cn(
                  "h-11 w-11 shrink-0 rounded-full transition-colors duration-200",
                  isRecording ? "animate-pulse" : "text-muted-foreground hover:bg-primary/[0.07] hover:text-primary"
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
                aria-label="Send message"
                className={cn(
                  "h-11 w-11 shrink-0 rounded-full transition-all duration-200 ease-out",
                  ((!input.trim() && files.length === 0) || isLoading)
                    ? "bg-muted text-muted-foreground"
                    : "bg-gradient-to-br from-primary to-primary-secondary text-primary-foreground shadow-[0_4px_12px_-2px_rgba(37,99,235,0.45)] hover:scale-105 hover:shadow-[0_6px_16px_-2px_rgba(37,99,235,0.55)] active:scale-95"
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
