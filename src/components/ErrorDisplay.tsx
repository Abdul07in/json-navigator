import React from 'react';
import { AlertCircle, Lightbulb, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { JsonError } from '@/hooks/useJsonParser';

interface ErrorDisplayProps {
  error: JsonError;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, className }) => {
  return (
    <div className={cn(
      'bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-3',
      className
    )}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-destructive">JSON Parse Error</h3>
          <p className="text-sm text-foreground mt-1 font-mono break-words">
            {error.message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          <span>
            Line <span className="text-foreground font-semibold">{error.line}</span>, 
            Column <span className="text-foreground font-semibold">{error.column}</span>
          </span>
        </div>
      </div>

      {error.suggestion && (
        <div className="flex items-start gap-2 bg-warning/10 border border-warning/20 rounded-md p-3">
          <Lightbulb className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-sm text-warning">{error.suggestion}</p>
        </div>
      )}
    </div>
  );
};
