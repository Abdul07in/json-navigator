import { useMemo } from 'react';

export type DiffType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface DiffNode {
  path: string;
  key: string;
  type: DiffType;
  leftValue?: unknown;
  rightValue?: unknown;
  leftType?: string;
  rightType?: string;
  children?: DiffNode[];
}

export interface DiffResult {
  tree: DiffNode[];
  summary: {
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
    total: number;
  };
}

const getType = (value: unknown): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

const isArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value);
};

const compareValues = (left: unknown, right: unknown): boolean => {
  if (left === right) return true;
  if (typeof left !== typeof right) return false;
  if (left === null || right === null) return left === right;
  
  if (isArray(left) && isArray(right)) {
    if (left.length !== right.length) return false;
    return left.every((item, i) => compareValues(item, right[i]));
  }
  
  if (isObject(left) && isObject(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    if (leftKeys.length !== rightKeys.length) return false;
    return leftKeys.every(key => compareValues(left[key], right[key]));
  }
  
  return false;
};

const buildDiffTree = (
  left: unknown,
  right: unknown,
  path: string = '$',
  key: string = 'root'
): DiffNode => {
  const leftType = getType(left);
  const rightType = getType(right);

  // Both undefined/missing
  if (left === undefined && right === undefined) {
    return { path, key, type: 'unchanged', leftValue: left, rightValue: right };
  }

  // Added (only in right)
  if (left === undefined) {
    return {
      path,
      key,
      type: 'added',
      rightValue: right,
      rightType,
    };
  }

  // Removed (only in left)
  if (right === undefined) {
    return {
      path,
      key,
      type: 'removed',
      leftValue: left,
      leftType,
    };
  }

  // Different types
  if (leftType !== rightType) {
    return {
      path,
      key,
      type: 'modified',
      leftValue: left,
      rightValue: right,
      leftType,
      rightType,
    };
  }

  // Both are objects
  if (isObject(left) && isObject(right)) {
    const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);
    const children: DiffNode[] = [];
    
    for (const k of allKeys) {
      const childPath = `${path}.${k}`;
      const childNode = buildDiffTree(left[k], right[k], childPath, k);
      children.push(childNode);
    }

    const hasChanges = children.some(c => c.type !== 'unchanged');
    
    return {
      path,
      key,
      type: hasChanges ? 'modified' : 'unchanged',
      leftValue: left,
      rightValue: right,
      leftType,
      rightType,
      children,
    };
  }

  // Both are arrays
  if (isArray(left) && isArray(right)) {
    const maxLength = Math.max(left.length, right.length);
    const children: DiffNode[] = [];
    
    for (let i = 0; i < maxLength; i++) {
      const childPath = `${path}[${i}]`;
      const childNode = buildDiffTree(left[i], right[i], childPath, `[${i}]`);
      children.push(childNode);
    }

    const hasChanges = children.some(c => c.type !== 'unchanged');
    
    return {
      path,
      key,
      type: hasChanges ? 'modified' : 'unchanged',
      leftValue: left,
      rightValue: right,
      leftType,
      rightType,
      children,
    };
  }

  // Primitive values
  if (compareValues(left, right)) {
    return {
      path,
      key,
      type: 'unchanged',
      leftValue: left,
      rightValue: right,
      leftType,
      rightType,
    };
  }

  return {
    path,
    key,
    type: 'modified',
    leftValue: left,
    rightValue: right,
    leftType,
    rightType,
  };
};

const countDiffs = (node: DiffNode): { added: number; removed: number; modified: number; unchanged: number } => {
  let counts = { added: 0, removed: 0, modified: 0, unchanged: 0 };

  if (node.children) {
    for (const child of node.children) {
      const childCounts = countDiffs(child);
      counts.added += childCounts.added;
      counts.removed += childCounts.removed;
      counts.modified += childCounts.modified;
      counts.unchanged += childCounts.unchanged;
    }
  } else {
    // Leaf node
    counts[node.type]++;
  }

  return counts;
};

export const useJsonDiff = (
  leftJson: unknown | null,
  rightJson: unknown | null
): DiffResult | null => {
  return useMemo(() => {
    if (leftJson === null || rightJson === null) {
      return null;
    }

    const tree = buildDiffTree(leftJson, rightJson);
    const counts = countDiffs(tree);

    return {
      tree: [tree],
      summary: {
        ...counts,
        total: counts.added + counts.removed + counts.modified + counts.unchanged,
      },
    };
  }, [leftJson, rightJson]);
};
