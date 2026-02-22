'use client';

import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, Search } from 'lucide-react';

const BOOKMARKS = [
  { name: 'Wikipedia', url: 'https://en.wikipedia.org', description: 'The free encyclopedia', color: 'bg-gray-700' },
  { name: 'DuckDuckGo', url: 'https://duckduckgo.com', description: 'Private search engine', color: 'bg-orange-900/60' },
  { name: 'Internet Archive', url: 'https://archive.org', description: 'Digital library', color: 'bg-red-900/60' },
  { name: 'OpenStreetMap', url: 'https://www.openstreetmap.org', description: 'Free world map', color: 'bg-green-900/60' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com', description: 'Tech news & discussion', color: 'bg-orange-800/60' },
  { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', description: 'Web development docs', color: 'bg-blue-900/60' },
  { name: 'Reddit', url: 'https://old.reddit.com', description: 'Community forums', color: 'bg-orange-700/60' },
  { name: 'Lobsters', url: 'https://lobste.rs', description: 'Computing links', color: 'bg-red-800/60' },
];

const InternetExplorer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loadedUrl, setLoadedUrl] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigateTo = useCallback((targetUrl: string) => {
    let finalUrl = targetUrl.trim();
    if (!finalUrl) return;

    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    setUrl(finalUrl);
    setLoadedUrl(finalUrl);
    setShowHome(false);
    setIsLoading(true);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(finalUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const prevUrl = history[newIndex];
      setUrl(prevUrl);
      setLoadedUrl(prevUrl);
      setShowHome(false);
      setIsLoading(true);
    }
  }, [history, historyIndex]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextUrl = history[newIndex];
      setUrl(nextUrl);
      setLoadedUrl(nextUrl);
      setShowHome(false);
      setIsLoading(true);
    }
  }, [history, historyIndex]);

  const refresh = useCallback(() => {
    if (loadedUrl && iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = loadedUrl;
    }
  }, [loadedUrl]);

  const goHome = useCallback(() => {
    setShowHome(true);
    setUrl('');
    setLoadedUrl('');
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      navigateTo(url);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-800 border-b border-gray-700">
        <button
          onClick={goBack}
          disabled={historyIndex <= 0}
          className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Back"
        >
          <ArrowLeft size={16} />
        </button>
        <button
          onClick={goForward}
          disabled={historyIndex >= history.length - 1}
          className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Forward"
        >
          <ArrowRight size={16} />
        </button>
        <button
          onClick={refresh}
          disabled={showHome}
          className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Refresh"
        >
          <RotateCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
        <button
          onClick={goHome}
          className="p-1.5 rounded hover:bg-gray-700 transition-colors"
          title="Home"
        >
          <Home size={16} />
        </button>

        <div className="flex-1 flex items-center bg-gray-900 rounded border border-gray-600 focus-within:border-blue-500 transition-colors mx-1">
          <Search size={14} className="ml-2 text-gray-500 shrink-0" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a URL..."
            className="flex-1 bg-transparent px-2 py-1 text-sm text-white outline-none placeholder-gray-500"
          />
        </div>

        <button
          onClick={() => navigateTo(url)}
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded transition-colors"
        >
          Go
        </button>
      </div>

      {/* Loading bar */}
      {isLoading && !showHome && (
        <div className="h-0.5 bg-gray-800 overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse w-full" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {showHome ? (
          <div className="h-full overflow-auto p-6">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-2xl font-bold text-center mb-1 text-blue-400">Internet Explorer</h1>
              <p className="text-center text-gray-500 text-sm mb-6">Enter a URL above or visit a bookmark below</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {BOOKMARKS.map((bookmark) => (
                  <button
                    key={bookmark.url}
                    onClick={() => navigateTo(bookmark.url)}
                    className={`${bookmark.color} rounded-lg p-3 text-left hover:brightness-125 transition-all group border border-white/5`}
                  >
                    <div className="text-sm font-medium truncate group-hover:text-blue-300 transition-colors">
                      {bookmark.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 truncate">
                      {bookmark.description}
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-center text-gray-600 text-xs mt-6">
                Note: Some websites may block loading in iframes.
              </p>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={loadedUrl}
            className="w-full h-full border-none bg-white"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            onLoad={() => setIsLoading(false)}
            title="Browser content"
          />
        )}
      </div>
    </div>
  );
};

export default InternetExplorer;
