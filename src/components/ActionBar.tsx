import React from 'react';
import { Wand2, Minimize2, Copy, Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ActionBarProps {
  onFormat: () => void;
  onMinify: () => void;
  onCopy: () => void;
  onClear: () => void;
  onLoad: (content: string) => void;
  rawJson: string;
  isValid: boolean;
  className?: string;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  onFormat,
  onMinify,
  onCopy,
  onClear,
  onLoad,
  rawJson,
  isValid,
  className,
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 100MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onLoad(content);
      toast.success(`Loaded ${file.name}`);
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (!rawJson) return;
    const blob = new Blob([rawJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded JSON file');
  };

  return (
    <div className={cn('flex items-center gap-1 flex-wrap', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onFormat}
        disabled={!isValid}
        className="text-muted-foreground hover:text-foreground"
      >
        <Wand2 className="w-4 h-4 mr-1.5" />
        Format
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onMinify}
        disabled={!isValid}
        className="text-muted-foreground hover:text-foreground"
      >
        <Minimize2 className="w-4 h-4 mr-1.5" />
        Minify
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onCopy}
        disabled={!rawJson}
        className="text-muted-foreground hover:text-foreground"
      >
        <Copy className="w-4 h-4 mr-1.5" />
        Copy
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDownload}
        disabled={!rawJson}
        className="text-muted-foreground hover:text-foreground"
      >
        <Download className="w-4 h-4 mr-1.5" />
        Download
      </Button>
      
      <div className="relative">
        <input
          type="file"
          accept=".json,application/json"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground pointer-events-none"
        >
          <Upload className="w-4 h-4 mr-1.5" />
          Upload
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        disabled={!rawJson}
        className="text-muted-foreground hover:text-destructive ml-auto"
      >
        <Trash2 className="w-4 h-4 mr-1.5" />
        Clear
      </Button>
    </div>
  );
};
