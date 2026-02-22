'use client';

import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { Terminal, Folder, FileText, Settings, Gamepad2, Globe } from 'lucide-react';

interface IconProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const Icon: React.FC<IconProps> = ({ label, icon, onClick }) => (
  <div 
    className="flex flex-col items-center justify-center w-24 h-24 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors group select-none"
    onDoubleClick={onClick}
    onClick={(e) => e.stopPropagation()} // Prevent desktop click
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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, visible: true });
  };

  const closeContextMenu = () => {
    if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false });
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
          className="absolute bg-gray-800 border border-gray-600 shadow-xl rounded-md py-1 z-50 min-w-[160px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
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
            className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-blue-600 hover:text-white transition-colors"
            onClick={() => {
                window.location.reload();
            }}
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default Desktop;
