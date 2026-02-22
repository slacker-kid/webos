'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { OSProvider, useOS } from '../context/OSContext';
import { FileSystemProvider } from '../context/FileSystemContext';
import Desktop from './Desktop/Desktop';
import Taskbar from './Taskbar/Taskbar';
import Window from './Window/Window';
import Terminal from './Apps/Terminal';
import FileManager from './Apps/FileManager';
import TextEditor from './Apps/TextEditor';
import Snake from './Apps/Snake';
import Settings from './Apps/Settings';
import InternetExplorer from './Apps/InternetExplorer';
import Sheets from './Apps/Sheets';
import Deck from './Apps/Deck';
import Calculator from './Apps/Calculator';

const BOOT_LINES = [
  { text: 'BIOS POST... OK', delay: 0 },
  { text: 'Detecting hardware...', delay: 300 },
  { text: '  CPU: WebCore vCPU @ 3.2GHz', delay: 600 },
  { text: '  RAM: 8192 MB detected', delay: 800 },
  { text: '  GPU: VirtualGL Renderer', delay: 950 },
  { text: 'Initializing kernel...', delay: 1200 },
  { text: 'Mounting virtual file system...', delay: 1600 },
  { text: 'Loading system modules...', delay: 2000 },
  { text: '  [ok] window-manager', delay: 2200 },
  { text: '  [ok] desktop-compositor', delay: 2400 },
  { text: '  [ok] taskbar-service', delay: 2550 },
  { text: '  [ok] network-stack', delay: 2700 },
  { text: 'Starting desktop environment...', delay: 3000 },
];

const BOOT_DURATION = 3800;

const BootScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Schedule each boot line
    BOOT_LINES.forEach((line, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), line.delay));
    });

    // Progress bar updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, BOOT_DURATION / 50);

    // Fade out and complete
    timers.push(setTimeout(() => {
      setFadingOut(true);
    }, BOOT_DURATION));

    timers.push(setTimeout(() => {
      onComplete();
    }, BOOT_DURATION + 600));

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
      style={{
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.5s ease-out',
      }}
    >
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1
          className="text-6xl font-bold tracking-widest"
          style={{
            color: '#e879f9',
            textShadow: '0 0 20px rgba(232, 121, 249, 0.6), 0 0 60px rgba(168, 85, 247, 0.3)',
          }}
        >
          WebOS
        </h1>
        <p className="text-sm text-gray-500 mt-2 tracking-[0.3em] uppercase">
          v1.0.0
        </p>
      </div>

      {/* Boot log */}
      <div
        className="w-[520px] max-w-[90vw] h-52 overflow-hidden font-mono text-xs px-4 py-3 rounded border border-gray-800 bg-gray-950 mb-6"
      >
        {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className={
              line.text.startsWith('  [ok]')
                ? 'text-emerald-400'
                : line.text.startsWith('  ')
                  ? 'text-gray-400'
                  : 'text-gray-300'
            }
          >
            {line.text.startsWith('  [ok]') ? (
              <>
                <span className="text-emerald-500">  [ok] </span>
                <span className="text-gray-400">{line.text.slice(7)}</span>
              </>
            ) : (
              line.text
            )}
          </div>
        ))}
        {visibleLines > 0 && visibleLines < BOOT_LINES.length && (
          <span className="inline-block w-2 h-3.5 bg-gray-400 animate-pulse" />
        )}
      </div>

      {/* Progress bar */}
      <div className="w-[520px] max-w-[90vw]">
        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #a855f7, #e879f9)',
              boxShadow: '0 0 12px rgba(168, 85, 247, 0.5)',
              transition: 'width 0.08s linear',
            }}
          />
        </div>
      </div>
    </div>
  );
};

const AppContainer: React.FC<{ appType: string; data?: unknown; windowId: string }> = ({ appType, data, windowId }) => {
  switch (appType) {
    case 'terminal': return <Terminal />;
    case 'files': return <FileManager />;
    case 'editor': return <TextEditor initialPath={data ? (data as any).path : undefined} />;
    case 'snake': return <Snake />;
    case 'settings': return <Settings />;
    case 'browser': return <InternetExplorer />;
    case 'sheets': return <Sheets />;
    case 'deck': return <Deck />;
    case 'calculator': return <Calculator />;
    default: return <div className="p-4 text-red-500">App not found: {appType}</div>;
  }
};

const WindowManager: React.FC = () => {
  const { windows, activeWindowId } = useOS();

  return (
    <>
      {windows.map((win) => (
        <Window
          key={win.id}
          id={win.id}
          title={win.title}
          isActive={win.id === activeWindowId}
          isMinimized={win.isMinimized}
          isMaximized={win.isMaximized}
          zIndex={win.zIndex}
          initialPosition={win.position}
          initialSize={win.size}
        >
          <AppContainer appType={win.appType} data={win.data} windowId={win.id} />
        </Window>
      ))}
    </>
  );
};

const DesktopEnvironment: React.FC = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white selection:bg-blue-500 selection:text-white">
      <Desktop />
      <WindowManager />
      <Taskbar />
    </div>
  );
};

const OS: React.FC = () => {
  const [booted, setBooted] = useState(false);
  const handleBootComplete = useCallback(() => setBooted(true), []);

  return (
    <FileSystemProvider>
      <OSProvider>
        {booted ? <DesktopEnvironment /> : <BootScreen onComplete={handleBootComplete} />}
      </OSProvider>
    </FileSystemProvider>
  );
};

export default OS;
