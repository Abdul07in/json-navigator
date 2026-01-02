import React, { useState, useCallback, useMemo } from 'react';
import { ChevronRight, ChevronsUpDown, ChevronsDownUp } from 'lucide-react';
import { JsonTreeNode } from './JsonTreeNode';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface JsonTreeViewerProps {
  data: unknown;
  className?: string;
  searchHighlight?: string;
  focusedResultPath?: string | null;
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
  focusedResultPath,
}) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => new Set(['$']));

  const allPaths = useMemo(() => getAllPaths(data), [data]);

  const getExpandedPathsForSearch = useCallback((data: unknown, query: string, path: string = '$'): Set<string> => {
    const paths = new Set<string>();
    const lowerQuery = query.toLowerCase();

    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        const currentPath = `${path}[${index}]`;
        let shouldExpand = false;

        // Check if value matches
        if (String(item).toLowerCase().includes(lowerQuery)) {
          shouldExpand = true;
        }

        // Recursive check for objects/arrays
        if (typeof item === 'object' && item !== null) {
          const childPaths = getExpandedPathsForSearch(item, query, currentPath);
          if (childPaths.size > 0) {
            shouldExpand = true;
            childPaths.forEach(p => paths.add(p));
          }
        }

        if (shouldExpand) {
          paths.add(path);
        }
      });
    } else if (typeof data === 'object' && data !== null) {
      Object.entries(data).forEach(([key, value]) => {
        const currentPath = `${path}.${key}`;
        let shouldExpand = false;

        // Check if key or value matches
        if (key.toLowerCase().includes(lowerQuery) || String(value).toLowerCase().includes(lowerQuery)) {
          shouldExpand = true;
        }

        if (typeof value === 'object' && value !== null) {
          const childPaths = getExpandedPathsForSearch(value, query, currentPath);
          if (childPaths.size > 0) {
            shouldExpand = true;
            childPaths.forEach(p => paths.add(p));
          }
        }

        if (shouldExpand) {
          paths.add(path);
        }
      });
    }

    return paths;
  }, []);

  React.useEffect(() => {
    if (searchHighlight && searchHighlight.length > 0) {
      const searchPaths = getExpandedPathsForSearch(data, searchHighlight);
      if (searchPaths.size > 0) {
        setExpandedPaths(prev => {
          const next = new Set(prev);
          searchPaths.forEach(path => next.add(path));
          return next;
        });
      }
    }
  }, [searchHighlight, data, getExpandedPathsForSearch]);

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
    if (expanded.length === 0) return '$';
    return expanded[0];
  }, [expandedPaths]);

  React.useEffect(() => {
    if (focusedResultPath) {
      // Small delay to ensure render is complete
      setTimeout(() => {
        // Escape single quotes for the attribute selector
        const safePath = focusedResultPath.replace(/'/g, "\\'");
        const element = document.querySelector(`[data-path='${safePath}']`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [focusedResultPath]);

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
          focusedResultPath={focusedResultPath}
        />
      </div>
    </div>
  );
};
