import React, { useState, useCallback, useMemo } from 'react';
import { Header } from '@/components/Header';
import { JsonEditor } from '@/components/JsonEditor';
import { JsonTreeViewer } from '@/components/JsonTreeViewer';
import { JsonStats } from '@/components/JsonStats';
import { SearchBar } from '@/components/SearchBar';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { ActionBar } from '@/components/ActionBar';
import { StatusBar } from '@/components/StatusBar';
import { useJsonParser } from '@/hooks/useJsonParser';
import { useJsonSearch } from '@/hooks/useJsonSearch';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, TreePine, BarChart3 } from 'lucide-react';

const sampleJson = `{
  "name": "JSON Viewer Pro",
  "version": "1.0.0",
  "description": "A high-performance JSON viewer for developers",
  "features": [
    "Large file support",
    "Real-time validation",
    "Interactive tree viewer",
    "Smart search"
  ],
  "config": {
    "maxFileSize": "100MB",
    "theme": "dark",
    "performance": {
      "virtualizedRendering": true,
      "lazyLoading": true,
      "webWorkers": true
    }
  },
  "stats": {
    "users": 12500,
    "downloads": 85000,
    "rating": 4.9
  },
  "active": true,
  "deprecated": null
}`;

const Index: React.FC = () => {
  const { rawJson, parsedResult, handleJsonChange, formatJson, minifyJson, setRawJson } = useJsonParser();
  const [activeTab, setActiveTab] = useState<string>('tree');
  
  const {
    searchQuery,
    setSearchQuery,
    useRegex,
    setUseRegex,
    searchType,
    setSearchType,
    results,
  } = useJsonSearch(parsedResult?.data);

  const handleFormat = useCallback(() => {
    const formatted = formatJson(2);
    setRawJson(formatted);
    handleJsonChange(formatted);
    toast.success('JSON formatted');
  }, [formatJson, setRawJson, handleJsonChange]);

  const handleMinify = useCallback(() => {
    const minified = minifyJson();
    setRawJson(minified);
    handleJsonChange(minified);
    toast.success('JSON minified');
  }, [minifyJson, setRawJson, handleJsonChange]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(rawJson);
    toast.success('Copied to clipboard');
  }, [rawJson]);

  const handleClear = useCallback(() => {
    setRawJson('');
    handleJsonChange('');
    toast.success('Editor cleared');
  }, [setRawJson, handleJsonChange]);

  const handleLoadSample = useCallback(() => {
    setRawJson(sampleJson);
    handleJsonChange(sampleJson);
  }, [setRawJson, handleJsonChange]);

  const lineCount = useMemo(() => rawJson.split('\n').length, [rawJson]);
  const byteSize = useMemo(() => new Blob([rawJson]).size, [rawJson]);

  // Load sample on first render if empty
  React.useEffect(() => {
    if (!rawJson) {
      handleLoadSample();
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="w-1/2 flex flex-col border-r border-border">
          <div className="px-4 py-3 border-b border-border bg-card/30">
            <ActionBar
              onFormat={handleFormat}
              onMinify={handleMinify}
              onCopy={handleCopy}
              onClear={handleClear}
              onLoad={(content) => {
                setRawJson(content);
                handleJsonChange(content);
              }}
              rawJson={rawJson}
              isValid={parsedResult?.isValid ?? false}
            />
          </div>
          
          <div className="flex-1 overflow-hidden">
            <JsonEditor
              value={rawJson}
              onChange={handleJsonChange}
              error={parsedResult?.error}
              className="h-full"
            />
          </div>

          {parsedResult?.error && (
            <div className="p-4 border-t border-border">
              <ErrorDisplay error={parsedResult.error} />
            </div>
          )}
        </div>

        {/* Right Panel - Viewer/Stats */}
        <div className="w-1/2 flex flex-col bg-card/20">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/30">
              <TabsList className="bg-secondary/50">
                <TabsTrigger value="tree" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <TreePine className="w-4 h-4 mr-1.5" />
                  Tree
                </TabsTrigger>
                <TabsTrigger value="stats" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <BarChart3 className="w-4 h-4 mr-1.5" />
                  Stats
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Search Bar - only show for tree view */}
            {activeTab === 'tree' && parsedResult?.isValid && (
              <div className="px-4 py-3 border-b border-border">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  useRegex={useRegex}
                  onToggleRegex={() => setUseRegex(!useRegex)}
                  searchType={searchType}
                  onSearchTypeChange={setSearchType}
                  results={results}
                />
              </div>
            )}

            <TabsContent value="tree" className="flex-1 m-0 overflow-hidden">
              {parsedResult?.isValid && parsedResult.data ? (
                <JsonTreeViewer 
                  data={parsedResult.data} 
                  className="h-full"
                  searchHighlight={searchQuery}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Code className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Enter valid JSON to view the tree</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="stats" className="flex-1 m-0 overflow-auto p-4">
              {parsedResult?.isValid && parsedResult.stats ? (
                <JsonStats stats={parsedResult.stats} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Enter valid JSON to see statistics</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <StatusBar
        isValid={parsedResult?.isValid ?? false}
        hasContent={rawJson.length > 0}
        byteSize={byteSize}
        lineCount={lineCount}
      />
    </div>
  );
};

export default Index;
