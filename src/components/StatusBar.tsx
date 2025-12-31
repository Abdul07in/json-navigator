import React from 'react';
import { CheckCircle, XCircle, FileJson } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBarProps {
  isValid: boolean;
  hasContent: boolean;
  byteSize: number;
  lineCount: number;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const StatusBar: React.FC<StatusBarProps> = ({
  isValid,
  hasContent,
  byteSize,
  lineCount,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card/50 text-xs">
      <div className="flex items-center gap-4">
        {hasContent ? (
          <div className="flex items-center gap-1.5">
            {isValid ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-success" />
                <span className="text-success font-medium">Valid JSON</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5 text-destructive" />
                <span className="text-destructive font-medium">Invalid JSON</span>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <FileJson className="w-3.5 h-3.5" />
            <span>Ready</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-muted-foreground">
        <span>{lineCount.toLocaleString()} lines</span>
        <span>{formatBytes(byteSize)}</span>
      </div>
    </div>
  );
};
