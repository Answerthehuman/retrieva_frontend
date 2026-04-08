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
  const { addMessageToCurrentChat, setIsLoading, isLoading, getCurrentChat, createNewChat } = useChatStore();
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

    try {
      const data = await chatApi.sendMessage(userMessage.content, chat.threadId);

      const textContent = [data.response, data.metadata?.['inv-response']]
        .filter(Boolean)
        .join('\n\n');

      const assistantMessage = {
        role: 'assistant' as const,
        content: textContent,
        timestamp: new Date().toISOString(),
        products: data.metadata?.products || [],
      };

      setTimeout(() => {
        addMessageToCurrentChat(assistantMessage);
        setIsLoading(false);
      }, 400);
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
        toast({ title: 'Transcribing...', description: 'Analyzing your speech.' });

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
          toast({ title: 'Success', description: 'Speech transcribed.' });
        } else {
          toast({ title: 'No transcript', description: 'Could not find any speech in the audio.' });
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


