import React from 'react';
import { Plus, Minus, Edit2, Equal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiffSummaryProps {
  summary: {
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
    total: number;
  };
  className?: string;
}

export const DiffSummary: React.FC<DiffSummaryProps> = ({ summary, className }) => {
  return (
    <div className={cn('flex items-center gap-4 text-sm', className)}>
      <div className="flex items-center gap-1.5">
        <Plus className="w-3.5 h-3.5 text-diff-added" />
        <span className="text-diff-added font-medium">{summary.added}</span>
        <span className="text-muted-foreground">added</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <Minus className="w-3.5 h-3.5 text-diff-removed" />
        <span className="text-diff-removed font-medium">{summary.removed}</span>
        <span className="text-muted-foreground">removed</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <Edit2 className="w-3.5 h-3.5 text-diff-modified" />
        <span className="text-diff-modified font-medium">{summary.modified}</span>
        <span className="text-muted-foreground">modified</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <Equal className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-muted-foreground font-medium">{summary.unchanged}</span>
        <span className="text-muted-foreground">unchanged</span>
      </div>
    </div>
  );
};
