import { useState, KeyboardEvent } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
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
}

export const MessageInput = ({ isLanding }: MessageInputProps) => {
  const [input, setInput] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    let chat = getCurrentChat();
    if (!chat) {
      createNewChat();
      chat = useChatStore.getState().getCurrentChat();
    }
    if (!chat) return;

    const userMessage = {
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    addMessageToCurrentChat(userMessage);
    setInput('');
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

            // Sync with Zustand store
            const mergedProducts = Array.from(productsMap.values());
            // Re-index sequentially from 1 to N
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
            updateLastMessageInCurrentChat((msg) => ({
              ...msg,
              content: accumulatedText,
            }));
          }
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

        // Sanitize mime type: Sarvam API expects 'audio/webm', not 'audio/webm;codecs=opus'
        const mimeType = audioBlob.type.split(';')[0];
        const extension = mimeType.split('/')[1] || 'webm';
        const file = new File([audioBlob], `audio.${extension}`, { type: mimeType });

        console.log('Starting transcription with sanitized file:', file.name, 'size:', file.size, 'type:', file.type);

        const response = await sarvam.speechToText.transcribe({
          file: file,
          model: 'saaras:v3',
          language_code: 'unknown'
        });

        console.log('Transcription response:', response);

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
        
        // Try to extract more info from the error
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
        <div className={cn(
          "flex gap-3 items-end p-2 transition-all duration-300",
          "bg-background border rounded-[26px] shadow-sm ring-1 ring-border focus-within:ring-primary/20 focus-within:border-primary/30",
          isLanding && "shadow-2xl shadow-primary/5"
        )}>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLanding ? "How can I help you today?" : "Type your message..."}
            disabled={isLoading || isTranscribing}
            className={cn(
              "min-h-[56px] max-h-[200px] resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent py-4 text-lg ml-2",
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
              disabled={!input.trim() || isLoading || isTranscribing}
              size="icon"
              className={cn(
                "h-11 w-11 shrink-0 rounded-full transition-all",
                (!input.trim() || isLoading) ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground shadow-sm hover:scale-105 active:scale-95"
              )}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


