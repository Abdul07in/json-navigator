import React, { useState, useCallback, useMemo } from 'react';
import { ChevronRight, ChevronsUpDown, ChevronsDownUp } from 'lucide-react';
import { JsonTreeNode } from './JsonTreeNode';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface JsonTreeViewerProps {
  data: unknown;
  className?: string;
  searchHighlight?: string;
}

const getAllPaths = (obj: unknown, path: string = '$'): string[] => {
  const paths: string[] = [path];
  
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      if (typeof item === 'object' && item !== null) {
        paths.push(...getAllPaths(item, `${path}[${index}]`));
      }
    });
  } else if (obj !== null && typeof obj === 'object') {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        paths.push(...getAllPaths(value, `${path}.${key}`));
      }
    });
  }
  
  return paths;
};

export const JsonTreeViewer: React.FC<JsonTreeViewerProps> = ({
  data,
  className,
  searchHighlight,
}) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => new Set(['$']));

  const allPaths = useMemo(() => getAllPaths(data), [data]);

  const handleToggle = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedPaths(new Set(allPaths));
  }, [allPaths]);

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set(['$']));
  }, []);

  const breadcrumb = useMemo(() => {
    const expanded = Array.from(expandedPaths).sort((a, b) => b.length - a.length);
    return expanded[0] || '$';
  }, [expandedPaths]);

  if (!data) {
    return (
      <div className={cn('flex items-center justify-center h-full text-muted-foreground', className)}>
        <p>No JSON data to display</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono overflow-hidden">
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{breadcrumb}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="xs" onClick={expandAll} className="text-xs">
            <ChevronsUpDown className="w-3 h-3 mr-1" />
            Expand All
          </Button>
          <Button variant="ghost" size="xs" onClick={collapseAll} className="text-xs">
            <ChevronsDownUp className="w-3 h-3 mr-1" />
            Collapse
          </Button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-auto py-2">
        <JsonTreeNode
          keyName="root"
          value={data}
          path="$"
          depth={0}
          isLast={true}
          expandedPaths={expandedPaths}
          onToggle={handleToggle}
          searchHighlight={searchHighlight}
        />
      </div>
    </div>
  );
};
