'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { useFileSystem } from '../../context/FileSystemContext';
import { Terminal, Folder, FileText, Settings, Gamepad2, Globe, Table2, Presentation, Calculator, FolderPlus, RefreshCw } from 'lucide-react';

interface IconProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const Icon: React.FC<IconProps> = ({ label, icon, onClick }) => (
  <div
    className="flex flex-col items-center justify-center w-24 h-24 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors group select-none"
    onDoubleClick={onClick}
    onClick={(e) => e.stopPropagation()}
  >
    <div className="text-white drop-shadow-lg mb-2 transform group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <span className="text-white text-xs font-medium text-center drop-shadow-md truncate w-full px-1 bg-black/20 rounded py-0.5">
      {label}
    </span>
  </div>
);

const Desktop: React.FC = () => {
  const { wallpaper, openWindow } = useOS();
  const { createDir } = useFileSystem();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // Clamp to viewport edges
    const menuWidth = 200;
    const menuHeight = 180;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 48); // 48 for taskbar
    setContextMenu({ x, y, visible: true });
  };

  const closeContextMenu = () => {
    if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false });
  };

  // Close context menu on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };
    if (contextMenu.visible) {
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [contextMenu.visible]);

  const handleNewFolder = () => {
    const name = prompt('Folder name:');
    if (name && name.trim()) {
      createDir('/desktop', name.trim());
    }
    closeContextMenu();
  };

  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden bg-cover bg-center bg-no-repeat z-0"
      style={{
        backgroundImage: wallpaper.startsWith('http') || wallpaper.startsWith('data:') ? `url(${wallpaper})` : wallpaper,
        background: !wallpaper.startsWith('http') && !wallpaper.startsWith('data:') ? wallpaper : undefined
      }}
      onContextMenu={handleContextMenu}
      onClick={closeContextMenu}
    >
      {/* Icons Grid */}
      <div className="grid grid-flow-col grid-rows-[repeat(auto-fill,6rem)] gap-4 p-4 content-start items-start w-fit h-full">
        <Icon
          label="Terminal"
          icon={<Terminal size={32} className="text-gray-300" />}
          onClick={() => openWindow('terminal', 'Terminal')}
        />
        <Icon
          label="My Files"
          icon={<Folder size={32} className="text-yellow-400" />}
          onClick={() => openWindow('files', 'File Manager')}
        />
        <Icon
          label="Text Editor"
          icon={<FileText size={32} className="text-blue-300" />}
          onClick={() => openWindow('editor', 'Untitled.txt')}
        />
        <Icon
          label="Sheets"
          icon={<Table2 size={32} className="text-green-400" />}
          onClick={() => openWindow('sheets', 'Sheets')}
        />
        <Icon
          label="Deck"
          icon={<Presentation size={32} className="text-orange-400" />}
          onClick={() => openWindow('deck', 'Deck')}
        />
        <Icon
          label="Calculator"
          icon={<Calculator size={32} className="text-purple-400" />}
          onClick={() => openWindow('calculator', 'Calculator')}
        />
        <Icon
          label="Snake Game"
          icon={<Gamepad2 size={32} className="text-green-400" />}
          onClick={() => openWindow('snake', 'Snake')}
        />
        <Icon
          label="Internet"
          icon={<Globe size={32} className="text-blue-400" />}
          onClick={() => openWindow('browser', 'Internet Explorer')}
        />
        <Icon
          label="Settings"
          icon={<Settings size={32} className="text-gray-400" />}
          onClick={() => openWindow('settings', 'Settings')}
        />
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          ref={menuRef}
          className="absolute bg-gray-800/95 backdrop-blur-sm border border-gray-600 shadow-xl rounded-lg py-1 z-50 min-w-[180px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2"
            onClick={handleNewFolder}
          >
            <FolderPlus size={14} />
            New Folder
          </button>
          <div className="border-t border-gray-700 my-1" />
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2"
            onClick={() => {
              openWindow('settings', 'Settings');
              closeContextMenu();
            }}
          >
            <Settings size={14} />
            Change Wallpaper
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2"
            onClick={() => {
              window.location.reload();
            }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <div className="border-t border-gray-700 my-1" />
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2"
            onClick={() => {
              openWindow('settings', 'Settings');
              closeContextMenu();
            }}
          >
            <Settings size={14} />
            Settings
          </button>
        </div>
      )}
    </div>
  );
};

export default Desktop;
