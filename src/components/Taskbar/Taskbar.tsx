'use client';

import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { format } from 'date-fns';
import { Monitor, Terminal, FileText, Settings, AppWindow, Gamepad2, Globe, Table2, Presentation, Calculator } from 'lucide-react';

const Taskbar: React.FC = () => {
  const { windows, activeWindowId, focusWindow, minimizeWindow } = useOS();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleWindowClick = (id: string, isMinimized: boolean, isActive: boolean) => {
    if (isActive && !isMinimized) {
      minimizeWindow(id);
    } else {
      focusWindow(id);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full h-12 bg-gray-900/90 backdrop-blur-md border-t border-gray-700 flex items-center justify-between px-2 z-50 text-white select-none">
      {/* Start Button */}
      <div className="flex items-center">
        <button className="p-2 hover:bg-white/10 rounded-md transition-colors mr-2">
          <Monitor className="w-6 h-6 text-blue-400" />
        </button>
        
        {/* Window List */}
        <div className="flex items-center space-x-1 overflow-x-auto max-w-[calc(100vw-200px)]">
          {windows.map((window) => (
            <button
              key={window.id}
              onClick={() => handleWindowClick(window.id, window.isMinimized, window.id === activeWindowId)}
              className={`
                flex items-center space-x-2 px-3 py-1.5 rounded-md transition-all text-sm max-w-[160px] truncate
                ${window.id === activeWindowId && !window.isMinimized 
                  ? 'bg-white/20 shadow-inner' 
                  : 'hover:bg-white/10 text-gray-300'}
                ${window.isMinimized ? 'opacity-60' : 'opacity-100'}
              `}
            >
              {window.appType === 'terminal' && <Terminal size={14} />}
              {window.appType === 'files' && <AppWindow size={14} />}
              {window.appType === 'editor' && <FileText size={14} />}
              {window.appType === 'settings' && <Settings size={14} />}
              {window.appType === 'snake' && <Gamepad2 size={14} />}
              {window.appType === 'browser' && <Globe size={14} />}
              {window.appType === 'sheets' && <Table2 size={14} />}
              {window.appType === 'deck' && <Presentation size={14} />}
              {window.appType === 'calculator' && <Calculator size={14} />}
              <span className="truncate">{window.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* System Tray */}
      <div className="flex items-center px-3 py-1 bg-black/20 rounded-md border border-white/5">
        <span className="text-xs font-mono text-gray-300">
          {format(currentTime, 'MMM d, HH:mm')}
        </span>
      </div>
    </div>
  );
};

export default Taskbar;
