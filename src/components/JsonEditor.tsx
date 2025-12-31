import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { JsonError } from '@/hooks/useJsonParser';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: JsonError | null;
  className?: string;
  placeholder?: string;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  error,
  className,
  placeholder = 'Paste your JSON here...',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    const lines = value.split('\n').length;
    setLineCount(Math.max(lines, 1));
  }, [value]);

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className={cn('editor-container flex h-full', className)}>
      {/* Line numbers */}
      <div
        ref={lineNumbersRef}
        className="flex-shrink-0 w-12 bg-secondary/50 border-r border-border overflow-hidden select-none"
      >
        <div className="py-3 px-2 font-mono text-xs text-muted-foreground text-right">
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i + 1}
              className={cn(
                'h-5 leading-5',
                error?.line === i + 1 && 'text-destructive font-semibold'
              )}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          spellCheck={false}
          className={cn(
            'w-full h-full resize-none bg-transparent font-mono text-sm text-foreground',
            'py-3 px-4 leading-5 outline-none',
            'placeholder:text-muted-foreground/50',
            error && 'border-l-2 border-l-destructive'
          )}
        />

        {/* Error indicator */}
        {error && (
          <div 
            className="absolute left-0 w-full pointer-events-none"
            style={{ 
              top: `${(error.line - 1) * 20 + 12}px`,
            }}
          >
            <div className="h-5 bg-destructive/10 border-l-2 border-destructive" />
          </div>
        )}
      </div>
    </div>
  );
};
