import React from 'react';
import { Braces, Github, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
          <Braces className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
            JSON Viewer
            <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full font-medium">
              Pro
            </span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Visualize, validate & analyze JSON
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <FileJson className="w-4 h-4 mr-2" />
          Sample JSON
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </a>
        </Button>
      </div>
    </header>
  );
};
