import { useState, useCallback, useMemo } from 'react';

export interface JsonError {
  message: string;
  line: number;
  column: number;
  position: number;
  suggestion?: string;
}

export interface JsonStats {
  nodeCount: number;
  maxDepth: number;
  keyFrequency: Record<string, number>;
  arrayCount: number;
  objectCount: number;
  stringCount: number;
  numberCount: number;
  booleanCount: number;
  nullCount: number;
  warnings: string[];
}

export interface ParsedJson {
  data: unknown;
  error: JsonError | null;
  stats: JsonStats;
  isValid: boolean;
}

const getLineAndColumn = (text: string, position: number): { line: number; column: number } => {
  const lines = text.substring(0, position).split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
};

const parseJsonError = (error: SyntaxError, text: string): JsonError => {
  const match = error.message.match(/at position (\d+)/);
  const position = match ? parseInt(match[1], 10) : 0;
  const { line, column } = getLineAndColumn(text, position);
  
  let suggestion: string | undefined;
  const errorMsg = error.message.toLowerCase();
  
  if (errorMsg.includes('unexpected token')) {
    const char = text[position];
    if (char === "'") {
      suggestion = 'Use double quotes instead of single quotes for strings';
    } else if (char === ',') {
      suggestion = 'Remove trailing comma or add missing value';
    }
  } else if (errorMsg.includes('unexpected end')) {
    suggestion = 'Check for missing closing brackets or braces';
  }
  
  return {
    message: error.message,
    line,
    column,
    position,
    suggestion,
  };
};

const analyzeJson = (data: unknown, stats: JsonStats, depth: number = 0): void => {
  stats.nodeCount++;
  stats.maxDepth = Math.max(stats.maxDepth, depth);
  
  if (depth > 20) {
    if (!stats.warnings.includes('Deep nesting detected (>20 levels)')) {
      stats.warnings.push('Deep nesting detected (>20 levels)');
    }
  }
  
  if (Array.isArray(data)) {
    stats.arrayCount++;
    if (data.length > 1000) {
      stats.warnings.push(`Large array detected (${data.length} items)`);
    }
    data.forEach(item => analyzeJson(item, stats, depth + 1));
  } else if (data !== null && typeof data === 'object') {
    stats.objectCount++;
    const keys = Object.keys(data);
    keys.forEach(key => {
      stats.keyFrequency[key] = (stats.keyFrequency[key] || 0) + 1;
      analyzeJson((data as Record<string, unknown>)[key], stats, depth + 1);
    });
  } else if (typeof data === 'string') {
    stats.stringCount++;
  } else if (typeof data === 'number') {
    stats.numberCount++;
  } else if (typeof data === 'boolean') {
    stats.booleanCount++;
  } else if (data === null) {
    stats.nullCount++;
  }
};

export const useJsonParser = () => {
  const [rawJson, setRawJson] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<ParsedJson | null>(null);

  const parseJson = useCallback((text: string): ParsedJson => {
    const stats: JsonStats = {
      nodeCount: 0,
      maxDepth: 0,
      keyFrequency: {},
      arrayCount: 0,
      objectCount: 0,
      stringCount: 0,
      numberCount: 0,
      booleanCount: 0,
      nullCount: 0,
      warnings: [],
    };

    if (!text.trim()) {
      return { data: null, error: null, stats, isValid: false };
    }

    try {
      const data = JSON.parse(text);
      analyzeJson(data, stats);
      return { data, error: null, stats, isValid: true };
    } catch (e) {
      const error = parseJsonError(e as SyntaxError, text);
      return { data: null, error, stats, isValid: false };
    }
  }, []);

  const handleJsonChange = useCallback((text: string) => {
    setRawJson(text);
    const result = parseJson(text);
    setParsedResult(result);
  }, [parseJson]);

  const formatJson = useCallback((indent: number = 2): string => {
    if (!parsedResult?.isValid || !parsedResult.data) return rawJson;
    return JSON.stringify(parsedResult.data, null, indent);
  }, [parsedResult, rawJson]);

  const minifyJson = useCallback((): string => {
    if (!parsedResult?.isValid || !parsedResult.data) return rawJson;
    return JSON.stringify(parsedResult.data);
  }, [parsedResult, rawJson]);

  return {
    rawJson,
    parsedResult,
    handleJsonChange,
    formatJson,
    minifyJson,
    setRawJson,
  };
};
