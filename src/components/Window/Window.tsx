'use client';

import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { useOS } from '../../context/OSContext';

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isActive: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  initialPosition: { x: number; y: number };
  initialSize: { width: number; height: number };
}

const Window: React.FC<WindowProps> = ({
  id,
  title,
  children,
  isActive,
  isMinimized,
  isMaximized,
  zIndex,
  initialPosition,
  initialSize
}) => {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPosition } = useOS();
  const dragControls = useDragControls();

  // If minimized, we can just hide it or animate it out. 
  // For now, let's just use display none or visibility hidden to keep it in DOM but invisible.
  // Actually, animating opacity/scale is better.
  
  if (isMinimized) {
    return null; 
  }

  return (
    <motion.div
      drag
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      initial={{ x: initialPosition.x, y: initialPosition.y, width: initialSize.width, height: initialSize.height, opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        width: isMaximized ? '100vw' : initialSize.width,
        height: isMaximized ? 'calc(100vh - 40px)' : initialSize.height, // Subtract taskbar height
        x: isMaximized ? 0 : initialPosition.x,
        y: isMaximized ? 0 : initialPosition.y,
        borderRadius: isMaximized ? 0 : 8
      }}
      transition={{ duration: 0.2 }}
      onDragEnd={(_e, info) => {
        if (!isMaximized) {
            updateWindowPosition(id, { x: info.point.x, y: info.point.y });
        }
      }}
      style={{
        position: 'absolute',
        zIndex: zIndex,
        boxShadow: isActive ? '0 10px 30px rgba(0,0,0,0.3)' : '0 5px 15px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1e1e1e', // Dark theme base
        border: '1px solid #333',
      }}
      onPointerDown={() => focusWindow(id)}
      className="window-frame text-white"
    >
      {/* Title Bar */}
      <div
        onPointerDown={(e) => {
          dragControls.start(e);
          focusWindow(id);
        }}
        className={`flex items-center justify-between px-3 py-2 bg-gray-800 select-none cursor-default ${isActive ? 'bg-gray-700' : 'bg-gray-800'}`}
      >
        <span className="text-sm font-medium truncate flex-1">{title}</span>
        <div className="flex items-center space-x-2 ml-2">
          <button 
            onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }}
            className="p-1 hover:bg-gray-600 rounded"
          >
            <Minus size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); maximizeWindow(id); }}
            className="p-1 hover:bg-gray-600 rounded"
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
            className="p-1 hover:bg-red-600 rounded"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-900 relative">
        {children}
        
        {/* Resize Handle (Simplified) */}
        {!isMaximized && (
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-transparent z-50"
            onMouseDown={() => {
                // Implement manual resize logic here if needed, 
                // or just use a library. For now, let's stick to fixed size or use CSS resize.
            }}
          />
        )}
      </div>
    </motion.div>
  );
};

export default Window;
