import React from 'react';
import { 
  Braces, 
  List, 
  Type, 
  Hash, 
  ToggleLeft, 
  Circle,
  TreePine,
  AlertTriangle,
  Key
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { JsonStats as JsonStatsType } from '@/hooks/useJsonParser';

interface JsonStatsProps {
  stats: JsonStatsType;
  className?: string;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color?: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, color }) => (
  <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg">
    <div className={cn('flex items-center justify-center w-8 h-8 rounded-md bg-background/50', color)}>
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  </div>
);

export const JsonStats: React.FC<JsonStatsProps> = ({ stats, className }) => {
  const topKeys = Object.entries(stats.keyFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatItem 
          icon={<Hash className="w-4 h-4 text-primary" />}
          label="Total Nodes"
          value={stats.nodeCount.toLocaleString()}
        />
        <StatItem 
          icon={<TreePine className="w-4 h-4 text-success" />}
          label="Max Depth"
          value={stats.maxDepth}
        />
        <StatItem 
          icon={<Braces className="w-4 h-4 text-syntax-key" />}
          label="Objects"
          value={stats.objectCount.toLocaleString()}
        />
        <StatItem 
          icon={<List className="w-4 h-4 text-warning" />}
          label="Arrays"
          value={stats.arrayCount.toLocaleString()}
        />
        <StatItem 
          icon={<Type className="w-4 h-4 text-syntax-string" />}
          label="Strings"
          value={stats.stringCount.toLocaleString()}
        />
        <StatItem 
          icon={<Hash className="w-4 h-4 text-syntax-number" />}
          label="Numbers"
          value={stats.numberCount.toLocaleString()}
        />
        <StatItem 
          icon={<ToggleLeft className="w-4 h-4 text-syntax-boolean" />}
          label="Booleans"
          value={stats.booleanCount.toLocaleString()}
        />
        <StatItem 
          icon={<Circle className="w-4 h-4 text-syntax-null" />}
          label="Nulls"
          value={stats.nullCount.toLocaleString()}
        />
      </div>

      {/* Warnings */}
      {stats.warnings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Warnings</h4>
          <div className="space-y-1">
            {stats.warnings.map((warning, i) => (
              <div 
                key={i}
                className="flex items-center gap-2 px-3 py-2 bg-warning/10 border border-warning/20 rounded-lg"
              >
                <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                <span className="text-sm text-warning">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Keys */}
      {topKeys.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Most Common Keys
          </h4>
          <div className="space-y-1">
            {topKeys.map(([key, count]) => (
              <div 
                key={key}
                className="flex items-center justify-between px-3 py-1.5 bg-secondary/30 rounded"
              >
                <div className="flex items-center gap-2">
                  <Key className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm font-mono text-syntax-key">{key}</span>
                </div>
                <span className="text-xs text-muted-foreground">{count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
