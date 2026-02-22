'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppType = 'snake' | 'terminal' | 'files' | 'editor' | 'settings';

export interface WindowState {
  id: string;
  appType: AppType;
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  data?: unknown;
}

interface OSContextType {
  windows: WindowState[];
  activeWindowId: string | null;
  wallpaper: string;
  openWindow: (appType: AppType, title?: string, data?: unknown) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  setWallpaper: (wallpaper: string) => void;
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
}

const OSContext = createContext<OSContextType | undefined>(undefined);

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [wallpaper, setWallpaper] = useState<string>('repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(255,0,255,0.18) 59px, rgba(255,0,255,0.18) 60px), repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(255,0,255,0.18) 59px, rgba(255,0,255,0.18) 60px), linear-gradient(to bottom, #0a0014 0%, #1a0030 50%, #2d004d 75%, #0a0a2e 100%)');
  const [zIndexCounter, setZIndexCounter] = useState(10);

  useEffect(() => {
    const savedWallpaper = localStorage.getItem('webos_wallpaper');
    // eslint-disable-next-line react-compiler/react-compiler
    if (savedWallpaper) setWallpaper(savedWallpaper);
  }, []);

  const openWindow = (appType: AppType, title: string = 'App', data?: unknown) => {
    // Check if window already open for this file? (Optional feature, skip for now)
    const newWindow: WindowState = {
      id: Date.now().toString(),
      appType,
      title,
      isMinimized: false,
      isMaximized: false,
      zIndex: zIndexCounter + 1,
      position: { x: 50 + (windows.length * 20), y: 50 + (windows.length * 20) },
      size: { width: 600, height: 400 },
      data
    };
    setZIndexCounter(prev => prev + 1);
    setWindows([...windows, newWindow]);
    setActiveWindowId(newWindow.id);
  };

  const closeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const focusWindow = (id: string) => {
    setActiveWindowId(id);
    setZIndexCounter(prev => prev + 1);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: zIndexCounter + 1, isMinimized: false } : w));
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const maximizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    focusWindow(id);
  };

  const updateWindowPosition = (id: string, position: { x: number; y: number }) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, position } : w));
  };
  
  const updateWindowSize = (id: string, size: { width: number; height: number }) => {
      setWindows(prev => prev.map(w => w.id === id ? { ...w, size } : w));
  };

  const handleSetWallpaper = (wp: string) => {
    setWallpaper(wp);
    localStorage.setItem('webos_wallpaper', wp);
  };

  return (
    <OSContext.Provider value={{
      windows,
      activeWindowId,
      wallpaper,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      focusWindow,
      setWallpaper: handleSetWallpaper,
      updateWindowPosition,
      updateWindowSize
    }}>
      {children}
    </OSContext.Provider>
  );
};

export const useOS = () => {
  const context = useContext(OSContext);
  if (!context) throw new Error('useOS must be used within an OSProvider');
  return context;
};
