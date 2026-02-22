'use client';

import React from 'react';
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

const AppContainer: React.FC<{ appType: string; data?: unknown; windowId: string }> = ({ appType, data, windowId }) => {
  switch (appType) {
    case 'terminal': return <Terminal />;
    case 'files': return <FileManager />;
    case 'editor': return <TextEditor initialPath={data ? (data as any).path : undefined} />;
    case 'snake': return <Snake />;
    case 'settings': return <Settings />;
    case 'browser': return <InternetExplorer />;
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
  return (
    <FileSystemProvider>
      <OSProvider>
        <DesktopEnvironment />
      </OSProvider>
    </FileSystemProvider>
  );
};

export default OS;
