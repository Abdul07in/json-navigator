import React from 'react';
import { Search, Regex, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SearchResult } from '@/hooks/useJsonSearch';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  useRegex: boolean;
  onToggleRegex: () => void;
  searchType: 'all' | 'keys' | 'values';
  onSearchTypeChange: (type: 'all' | 'keys' | 'values') => void;
  results: SearchResult[];
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  useRegex,
  onToggleRegex,
  searchType,
  onSearchTypeChange,
  results,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search keys or values..."
            className="pl-9 pr-8 bg-secondary/50 border-border focus:bg-card"
          />
          {value && (
            <button
              onClick={() => onChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          variant={useRegex ? 'default' : 'outline'}
          size="icon"
          onClick={onToggleRegex}
          className="flex-shrink-0"
          title="Toggle regex mode"
        >
          <Regex className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        {(['all', 'keys', 'values'] as const).map((type) => (
          <Button
            key={type}
            variant={searchType === type ? 'secondary' : 'ghost'}
            size="xs"
            onClick={() => onSearchTypeChange(type)}
            className="capitalize"
          >
            {type}
          </Button>
        ))}
        {value && results.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
};
