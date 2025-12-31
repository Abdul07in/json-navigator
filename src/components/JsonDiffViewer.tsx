import React, { useState, useCallback, useMemo } from 'react';
import { ChevronRight, ChevronDown, Plus, Minus, Edit2, Equal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DiffNode, DiffType } from '@/hooks/useJsonDiff';

interface JsonDiffViewerProps {
  diffTree: DiffNode[];
  className?: string;
}

interface DiffNodeProps {
  node: DiffNode;
  depth: number;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
}

const getValuePreview = (value: unknown): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (typeof value === 'object') return `Object(${Object.keys(value).length})`;
  return String(value);
};

const DiffIcon: React.FC<{ type: DiffType }> = ({ type }) => {
  switch (type) {
    case 'added':
      return <Plus className="w-3 h-3 text-diff-added" />;
    case 'removed':
      return <Minus className="w-3 h-3 text-diff-removed" />;
    case 'modified':
      return <Edit2 className="w-3 h-3 text-diff-modified" />;
    default:
      return <Equal className="w-3 h-3 text-muted-foreground/50" />;
  }
};

const getDiffBgClass = (type: DiffType): string => {
  switch (type) {
    case 'added':
      return 'bg-diff-added/10 border-l-2 border-diff-added';
    case 'removed':
      return 'bg-diff-removed/10 border-l-2 border-diff-removed';
    case 'modified':
      return 'bg-diff-modified/10 border-l-2 border-diff-modified';
    default:
      return '';
  }
};

const DiffNodeComponent: React.FC<DiffNodeProps> = ({
  node,
  depth,
  expandedPaths,
  onToggle,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedPaths.has(node.path);
  const paddingLeft = depth * 16 + 8;

  const handleToggle = () => {
    if (hasChildren) {
      onToggle(node.path);
    }
  };

  const renderValue = () => {
    if (node.type === 'added') {
      return (
        <span className="text-diff-added font-mono text-xs">
          {getValuePreview(node.rightValue)}
        </span>
      );
    }
    
    if (node.type === 'removed') {
      return (
        <span className="text-diff-removed font-mono text-xs line-through">
          {getValuePreview(node.leftValue)}
        </span>
      );
    }
    
    if (node.type === 'modified' && !hasChildren) {
      return (
        <span className="font-mono text-xs">
          <span className="text-diff-removed line-through mr-2">
            {getValuePreview(node.leftValue)}
          </span>
          <span className="text-muted-foreground mx-1">→</span>
          <span className="text-diff-added ml-2">
            {getValuePreview(node.rightValue)}
          </span>
        </span>
      );
    }

    if (hasChildren) {
      const leftType = node.leftType || 'object';
      const rightType = node.rightType || 'object';
      return (
        <span className="text-muted-foreground font-mono text-xs">
          {leftType === 'array' ? `Array(${(node.leftValue as unknown[])?.length || 0})` : `Object(${Object.keys(node.leftValue as object || {}).length})`}
        </span>
      );
    }

    return (
      <span className="text-muted-foreground font-mono text-xs">
        {getValuePreview(node.leftValue)}
      </span>
    );
  };

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-2 py-1 px-2 hover:bg-secondary/30 cursor-pointer group transition-colors',
          getDiffBgClass(node.type)
        )}
        style={{ paddingLeft }}
        onClick={handleToggle}
      >
        {/* Expand/Collapse Icon */}
        <div className="w-4 h-4 flex items-center justify-center">
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )
          ) : null}
        </div>

        {/* Diff Icon */}
        <DiffIcon type={node.type} />

        {/* Key */}
        <span className={cn(
          'font-mono text-sm',
          node.type === 'added' && 'text-diff-added',
          node.type === 'removed' && 'text-diff-removed',
          node.type === 'modified' && 'text-diff-modified',
          node.type === 'unchanged' && 'text-syntax-key'
        )}>
          {node.key}
        </span>

        <span className="text-muted-foreground">:</span>

        {/* Value */}
        {renderValue()}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child, index) => (
            <DiffNodeComponent
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </>
  );
};

export const JsonDiffViewer: React.FC<JsonDiffViewerProps> = ({
  diffTree,
  className,
}) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
    // Auto-expand first two levels
    const paths = new Set<string>(['$']);
    const expandLevel = (nodes: DiffNode[], level: number) => {
      if (level > 1) return;
      for (const node of nodes) {
        paths.add(node.path);
        if (node.children) {
          expandLevel(node.children, level + 1);
        }
      }
    };
    expandLevel(diffTree, 0);
    return paths;
  });

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
    const allPaths = new Set<string>();
    const collectPaths = (nodes: DiffNode[]) => {
      for (const node of nodes) {
        allPaths.add(node.path);
        if (node.children) {
          collectPaths(node.children);
        }
      }
    };
    collectPaths(diffTree);
    setExpandedPaths(allPaths);
  }, [diffTree]);

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set(['$']));
  }, []);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2 px-4 py-2 border-b border-border bg-card/50">
        <button
          onClick={expandAll}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Expand All
        </button>
        <span className="text-muted-foreground">|</span>
        <button
          onClick={collapseAll}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Collapse All
        </button>
      </div>

      {/* Diff Tree */}
      <div className="flex-1 overflow-auto py-2">
        {diffTree.map((node, index) => (
          <DiffNodeComponent
            key={node.path}
            node={node}
            depth={0}
            expandedPaths={expandedPaths}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
};
