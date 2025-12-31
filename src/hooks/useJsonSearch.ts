import { useState, useCallback, useMemo } from 'react';

export interface SearchResult {
  path: string;
  key: string;
  value: unknown;
  type: 'key' | 'value' | 'both';
}

export const useJsonSearch = (data: unknown) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'keys' | 'values'>('all');

  const searchJson = useCallback(
    (obj: unknown, path: string = '$'): SearchResult[] => {
      const results: SearchResult[] = [];
      
      if (!searchQuery.trim()) return results;

      const matchesQuery = (text: string): boolean => {
        try {
          if (useRegex) {
            const regex = new RegExp(searchQuery, 'i');
            return regex.test(text);
          }
          return text.toLowerCase().includes(searchQuery.toLowerCase());
        } catch {
          return false;
        }
      };

      const traverse = (current: unknown, currentPath: string) => {
        if (Array.isArray(current)) {
          current.forEach((item, index) => {
            traverse(item, `${currentPath}[${index}]`);
          });
        } else if (current !== null && typeof current === 'object') {
          Object.entries(current as Record<string, unknown>).forEach(([key, value]) => {
            const newPath = `${currentPath}.${key}`;
            const keyMatches = matchesQuery(key) && (searchType === 'all' || searchType === 'keys');
            const valueMatches = 
              (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') &&
              matchesQuery(String(value)) &&
              (searchType === 'all' || searchType === 'values');

            if (keyMatches || valueMatches) {
              results.push({
                path: newPath,
                key,
                value,
                type: keyMatches && valueMatches ? 'both' : keyMatches ? 'key' : 'value',
              });
            }

            traverse(value, newPath);
          });
        }
      };

      traverse(obj, path);
      return results;
    },
    [searchQuery, useRegex, searchType]
  );

  const results = useMemo(() => {
    if (!data || !searchQuery.trim()) return [];
    return searchJson(data);
  }, [data, searchJson, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    useRegex,
    setUseRegex,
    searchType,
    setSearchType,
    results,
  };
};
