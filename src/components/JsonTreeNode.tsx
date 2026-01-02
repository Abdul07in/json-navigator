import React, { useState, useCallback, memo } from 'react';
import { ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface JsonTreeNodeProps {
  keyName: string | number;
  value: unknown;
  path: string;
  depth: number;
  isLast: boolean;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  searchHighlight?: string;
  focusedResultPath?: string | null;
}

const getValueType = (value: unknown): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
};

const getValuePreview = (value: unknown, type: string): string => {
  if (type === 'array') {
    const arr = value as unknown[];
    return `Array(${arr.length})`;
  }
  if (type === 'object') {
    const keys = Object.keys(value as object);
    return `{${keys.slice(0, 3).join(', ')}${keys.length > 3 ? ', ...' : ''}}`;
  }
  if (type === 'string') {
    const str = value as string;
    return str.length > 50 ? `"${str.substring(0, 50)}..."` : `"${str}"`;
  }
  return String(value);
};

export const JsonTreeNode: React.FC<JsonTreeNodeProps> = memo(({
  keyName,
  value,
  path,
  depth,
  isLast,
  expandedPaths,
  onToggle,
  searchHighlight,
  focusedResultPath,
}) => {
  const [copied, setCopied] = useState(false);
  const type = getValueType(value);
  const isExpandable = type === 'object' || type === 'array';
  const isExpanded = expandedPaths.has(path);

  const handleToggle = useCallback(() => {
    if (isExpandable) {
      onToggle(path);
    }
  }, [isExpandable, onToggle, path]);

  const handleCopyPath = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(path);
    setCopied(true);
    toast.success('Path copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }, [path]);

  const handleCopyValue = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const textValue = type === 'object' || type === 'array'
      ? JSON.stringify(value, null, 2)
      : String(value);
    navigator.clipboard.writeText(textValue);
    toast.success('Value copied to clipboard');
  }, [value, type]);

  const isValueHighlighted = searchHighlight &&
    !isExpandable &&
    String(value).toLowerCase().includes(searchHighlight.toLowerCase());

  const renderValue = () => {
    if (!isExpandable) {
      let valueClass = '';
      switch (type) {
        case 'string':
          valueClass = 'text-syntax-string';
          break;
        case 'number':
          valueClass = 'text-syntax-number';
          break;
        case 'boolean':
          valueClass = 'text-syntax-boolean';
          break;
        case 'null':
          valueClass = 'text-syntax-null';
          break;
      }
      return (
        <span className={cn('font-mono', valueClass, isValueHighlighted && 'bg-success/30 px-1 rounded')}>
          {getValuePreview(value, type)}
        </span>
      );
    }
    return (
      <span className="text-muted-foreground font-mono text-xs">
        {getValuePreview(value, type)}
      </span>
    );
  };

  const getChildren = (): [string | number, unknown][] => {
    if (type === 'array') {
      return (value as unknown[]).map((v, i) => [i, v]);
    }
    if (type === 'object') {
      return Object.entries(value as object);
    }
    return [];
  };

  const children = getChildren();
  const isKeyHighlighted = searchHighlight && String(keyName).toLowerCase().includes(searchHighlight.toLowerCase());
  const isFocused = focusedResultPath === path;

  return (
    <div className="animate-fade-in">
      <div
        data-path={path}
        className={cn(
          'json-line group flex items-center gap-1 cursor-pointer',
          'hover:bg-accent/50 rounded transition-colors',
          isKeyHighlighted && 'bg-warning/20',
          isFocused && 'bg-primary/10 ring-1 ring-primary/30'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleToggle}
      >
        {/* Expand/Collapse icon */}
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          {isExpandable ? (
            isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-primary" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            )
          ) : null}
        </div>

        {/* Key */}
        <span className={cn(
          'font-mono text-sm',
          typeof keyName === 'number' ? 'text-syntax-number' : 'text-syntax-key'
        )}>
          {typeof keyName === 'string' ? `"${keyName}"` : keyName}
        </span>
        <span className="text-muted-foreground">:</span>

        {/* Value or preview */}
        <span className="ml-1">{renderValue()}</span>

        {/* Copy buttons */}
        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="xs"
            onClick={handleCopyPath}
            className="h-5 px-1.5 text-xs"
          >
            {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
            <span className="ml-1">Path</span>
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={handleCopyValue}
            className="h-5 px-1.5 text-xs"
          >
            <Copy className="w-3 h-3" />
            <span className="ml-1">Value</span>
          </Button>
        </div>
      </div>

      {/* Children */}
      {isExpandable && isExpanded && (
        <div>
          {children.map(([childKey, childValue], index) => (
            <JsonTreeNode
              key={`${path}.${childKey}`}
              keyName={childKey}
              value={childValue}
              path={type === 'array' ? `${path}[${childKey}]` : `${path}.${childKey}`}
              depth={depth + 1}
              isLast={index === children.length - 1}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
              searchHighlight={searchHighlight}
              focusedResultPath={focusedResultPath}
            />
          ))}
        </div>
      )}
    </div>
  );
});

JsonTreeNode.displayName = 'JsonTreeNode';
