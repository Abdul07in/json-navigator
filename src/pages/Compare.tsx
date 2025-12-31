import React, { useState, useCallback, useMemo } from 'react';
import { Header } from '@/components/Header';
import { JsonEditor } from '@/components/JsonEditor';
import { JsonDiffViewer } from '@/components/JsonDiffViewer';
import { DiffSummary } from '@/components/DiffSummary';
import { useJsonParser } from '@/hooks/useJsonParser';
import { useJsonDiff } from '@/hooks/useJsonDiff';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Upload, FileJson, ArrowLeftRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const sampleLeft = `{
  "name": "My App",
  "version": "1.0.0",
  "features": ["auth", "dashboard"],
  "config": {
    "theme": "light",
    "debug": true
  }
}`;

const sampleRight = `{
  "name": "My App",
  "version": "2.0.0",
  "features": ["auth", "dashboard", "analytics"],
  "config": {
    "theme": "dark",
    "debug": false,
    "newSetting": true
  },
  "author": "Developer"
}`;

const Compare: React.FC = () => {
  const left = useJsonParser();
  const right = useJsonParser();

  const diffResult = useJsonDiff(
    left.parsedResult?.data ?? null,
    right.parsedResult?.data ?? null
  );

  const handleLoadSamples = useCallback(() => {
    left.setRawJson(sampleLeft);
    left.handleJsonChange(sampleLeft);
    right.setRawJson(sampleRight);
    right.handleJsonChange(sampleRight);
    toast.success('Sample JSON loaded');
  }, [left, right]);

  const handleSwap = useCallback(() => {
    const tempLeft = left.rawJson;
    const tempRight = right.rawJson;
    left.setRawJson(tempRight);
    left.handleJsonChange(tempRight);
    right.setRawJson(tempLeft);
    right.handleJsonChange(tempLeft);
    toast.success('JSONs swapped');
  }, [left, right]);

  const handleClearAll = useCallback(() => {
    left.setRawJson('');
    left.handleJsonChange('');
    right.setRawJson('');
    right.handleJsonChange('');
    toast.success('Cleared');
  }, [left, right]);

  const handleFileUpload = (side: 'left' | 'right') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (side === 'left') {
          left.setRawJson(content);
          left.handleJsonChange(content);
        } else {
          right.setRawJson(content);
          right.handleJsonChange(content);
        }
        toast.success(`Loaded ${file.name}`);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const bothValid = left.parsedResult?.isValid && right.parsedResult?.isValid;

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/30">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleLoadSamples}>
            <FileJson className="w-4 h-4 mr-1.5" />
            Load Samples
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSwap}>
            <ArrowLeftRight className="w-4 h-4 mr-1.5" />
            Swap
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            <Trash2 className="w-4 h-4 mr-1.5" />
            Clear All
          </Button>
        </div>

        {diffResult && (
          <DiffSummary summary={diffResult.summary} />
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Editor */}
        <div className="flex-1 flex flex-col border-r border-border">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
            <span className="text-sm font-medium text-muted-foreground">Original (Left)</span>
            <Button variant="ghost" size="xs" onClick={() => handleFileUpload('left')}>
              <Upload className="w-3 h-3 mr-1" />
              Upload
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            <JsonEditor
              value={left.rawJson}
              onChange={left.handleJsonChange}
              error={left.parsedResult?.error}
              className="h-full"
            />
          </div>
          {left.parsedResult?.error && (
            <div className="px-4 py-2 border-t border-border bg-destructive/10 text-destructive text-xs">
              {left.parsedResult.error.message}
            </div>
          )}
        </div>

        {/* Right Editor */}
        <div className="flex-1 flex flex-col border-r border-border">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
            <span className="text-sm font-medium text-muted-foreground">Modified (Right)</span>
            <Button variant="ghost" size="xs" onClick={() => handleFileUpload('right')}>
              <Upload className="w-3 h-3 mr-1" />
              Upload
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            <JsonEditor
              value={right.rawJson}
              onChange={right.handleJsonChange}
              error={right.parsedResult?.error}
              className="h-full"
            />
          </div>
          {right.parsedResult?.error && (
            <div className="px-4 py-2 border-t border-border bg-destructive/10 text-destructive text-xs">
              {right.parsedResult.error.message}
            </div>
          )}
        </div>

        {/* Diff Viewer */}
        <div className="flex-1 flex flex-col bg-card/20">
          <div className="px-4 py-2 border-b border-border bg-card/50">
            <span className="text-sm font-medium text-muted-foreground">Differences</span>
          </div>
          {bothValid && diffResult ? (
            <JsonDiffViewer diffTree={diffResult.tree} className="flex-1" />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">
                  {!left.rawJson && !right.rawJson
                    ? 'Enter JSON in both editors to compare'
                    : !bothValid
                    ? 'Fix JSON errors to see differences'
                    : 'Comparing...'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-border bg-card/30 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className={cn(
            'flex items-center gap-1.5',
            left.parsedResult?.isValid ? 'text-success' : left.rawJson ? 'text-destructive' : ''
          )}>
            <span className={cn(
              'w-2 h-2 rounded-full',
              left.parsedResult?.isValid ? 'bg-success' : left.rawJson ? 'bg-destructive' : 'bg-muted-foreground/50'
            )} />
            Left: {left.parsedResult?.isValid ? 'Valid' : left.rawJson ? 'Invalid' : 'Empty'}
          </span>
          <span className={cn(
            'flex items-center gap-1.5',
            right.parsedResult?.isValid ? 'text-success' : right.rawJson ? 'text-destructive' : ''
          )}>
            <span className={cn(
              'w-2 h-2 rounded-full',
              right.parsedResult?.isValid ? 'bg-success' : right.rawJson ? 'bg-destructive' : 'bg-muted-foreground/50'
            )} />
            Right: {right.parsedResult?.isValid ? 'Valid' : right.rawJson ? 'Invalid' : 'Empty'}
          </span>
        </div>
        <span>JSON Compare Mode</span>
      </div>
    </div>
  );
};

export default Compare;
