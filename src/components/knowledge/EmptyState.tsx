import { Database, Upload, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onUploadClick?: () => void;
  onConnectClick?: () => void;
}

export const EmptyState = ({ onUploadClick, onConnectClick }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-border/80 rounded-xl max-w-2xl mx-auto space-y-5 animate-in fade-in duration-300 shadow-2xs select-none">
      {/* Illustration */}
      <div className="p-5 bg-primary/5 rounded-full border border-primary/10 shadow-inner">
        <Database className="h-10 w-10 text-primary/70 stroke-[1.5]" />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h4 className="font-bold text-foreground text-sm">Your knowledge base is empty.</h4>
        <p className="text-xs text-muted-foreground leading-normal">
          Upload documents or connect an external source to start building your searchable knowledge base.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-1 select-none">
        <Button 
          onClick={onUploadClick}
          size="sm" 
          className="gap-1.5 h-9 font-semibold text-xs px-4"
        >
          <Upload className="h-3.5 w-3.5" /> Upload Documents
        </Button>
        <Button 
          onClick={onConnectClick}
          size="sm" 
          variant="outline" 
          className="gap-1.5 h-9 font-semibold text-xs px-4"
        >
          <Link className="h-3.5 w-3.5" /> Connect Source
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;
