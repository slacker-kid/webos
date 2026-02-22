'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { useFileSystem } from '../../context/FileSystemContext';
import { Upload, X, Palette, Monitor, Info } from 'lucide-react';

const PRESETS = [
  { name: 'Blue Gradient', value: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Dark Gradient', value: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)' },
  { name: 'Sunset', value: 'linear-gradient(to right, #f83600 0%, #f9d423 100%)' },
  { name: 'Midnight', value: '#0f172a' },
  { name: 'Retro Grid', value: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px) 0 0 / 20px 20px, #1a1a1a' },
  { name: 'Cyberpunk', value: 'repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(255,0,255,0.18) 59px, rgba(255,0,255,0.18) 60px), repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(255,0,255,0.18) 59px, rgba(255,0,255,0.18) 60px), linear-gradient(to bottom, #0a0014 0%, #1a0030 50%, #2d004d 75%, #0a0a2e 100%)' },
];

const ACCENT_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'White', value: '#ffffff' },
];

type Tab = 'appearance' | 'system' | 'about';

const Settings: React.FC = () => {
  const { wallpaper, setWallpaper } = useOS();
  const { resetFileSystem } = useFileSystem();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>('appearance');
  const [accentColor, setAccentColor] = useState('#3b82f6');
  const [storageUsage, setStorageUsage] = useState('');
  const [confirmAction, setConfirmAction] = useState<'reset-fs' | 'clear-all' | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('webos_accent_color');
    // eslint-disable-next-line react-compiler/react-compiler
    if (saved) setAccentColor(saved);
  }, []);

  useEffect(() => {
    // Calculate localStorage usage
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        total += key.length + (localStorage.getItem(key)?.length || 0);
      }
    }
    const kb = (total * 2 / 1024).toFixed(1); // UTF-16, 2 bytes per char
    const mb = (total * 2 / (1024 * 1024)).toFixed(2);
    setStorageUsage(total * 2 > 1024 * 1024 ? `${mb} MB` : `${kb} KB`);
  }, [tab]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setWallpaper(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAccentChange = (color: string) => {
    setAccentColor(color);
    localStorage.setItem('webos_accent_color', color);
  };

  const handleResetFS = () => {
    resetFileSystem();
    setConfirmAction(null);
  };

  const handleClearAll = () => {
    localStorage.clear();
    window.location.reload();
  };

  const tabClass = (t: Tab) =>
    `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
      tab === t ? 'bg-gray-800 text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
    }`;

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Tabs */}
      <div className="flex border-b border-gray-700 px-4 pt-2 bg-gray-900 shrink-0">
        <button className={tabClass('appearance')} onClick={() => setTab('appearance')}>
          <Palette size={14} /> Appearance
        </button>
        <button className={tabClass('system')} onClick={() => setTab('system')}>
          <Monitor size={14} /> System
        </button>
        <button className={tabClass('about')} onClick={() => setTab('about')}>
          <Info size={14} /> About
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {tab === 'appearance' && (
          <div className="space-y-8">
            {/* Wallpaper */}
            <section>
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Desktop Wallpaper</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setWallpaper(preset.value)}
                    className={`group relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                      wallpaper === preset.value ? 'border-blue-500 scale-105' : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="w-full h-full" style={{ background: preset.value }} />
                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-0.5 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 text-sm transition-colors"
                >
                  <Upload size={14} /> Upload Image
                </button>
                <button
                  onClick={() => setWallpaper(PRESETS[0].value)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-red-800 text-red-400 rounded-md hover:bg-red-900/30 text-sm transition-colors"
                >
                  <X size={14} /> Reset
                </button>
              </div>
            </section>

            {/* Accent Color */}
            <section>
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Accent Color</h3>
              <div className="flex gap-3">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => handleAccentChange(c.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      accentColor === c.value ? 'border-white scale-110' : 'border-gray-600 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === 'system' && (
          <div className="space-y-6">
            {/* Storage */}
            <section>
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Storage</h3>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">localStorage Usage</span>
                  <span className="text-sm font-mono text-blue-400">{storageUsage}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(parseFloat(storageUsage) / 50 * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Browser limit is approximately 5 MB</p>
              </div>
            </section>

            {/* Danger Zone */}
            <section>
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Data Management</h3>
              <div className="space-y-3">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-200">Reset File System</p>
                    <p className="text-xs text-gray-500">Restore default files and folders</p>
                  </div>
                  {confirmAction === 'reset-fs' ? (
                    <div className="flex gap-2">
                      <button onClick={handleResetFS} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded transition-colors">Confirm</button>
                      <button onClick={() => setConfirmAction(null)} className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded transition-colors">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmAction('reset-fs')} className="px-3 py-1.5 bg-gray-700 border border-red-800 text-red-400 text-sm rounded hover:bg-red-900/30 transition-colors">
                      Reset
                    </button>
                  )}
                </div>

                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-200">Clear All Data</p>
                    <p className="text-xs text-gray-500">Remove all saved data and reload</p>
                  </div>
                  {confirmAction === 'clear-all' ? (
                    <div className="flex gap-2">
                      <button onClick={handleClearAll} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded transition-colors">Confirm</button>
                      <button onClick={() => setConfirmAction(null)} className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded transition-colors">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmAction('clear-all')} className="px-3 py-1.5 bg-gray-700 border border-red-800 text-red-400 text-sm rounded hover:bg-red-900/30 transition-colors">
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* System Info */}
            <section>
              <h3 className="text-lg font-semibold mb-4 text-gray-200">System Info</h3>
              <div className="bg-gray-800 rounded-lg border border-gray-700 divide-y divide-gray-700">
                <div className="flex justify-between items-center p-3">
                  <span className="text-sm text-gray-300">Resolution</span>
                  <span className="text-sm font-mono text-gray-400">{typeof window !== 'undefined' ? `${window.innerWidth} x ${window.innerHeight}` : 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center p-3">
                  <span className="text-sm text-gray-300">Theme</span>
                  <span className="text-sm text-gray-400">Dark</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {tab === 'about' && (
          <div className="space-y-6">
            <section className="text-center py-6">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">WebOS</h2>
              <p className="text-gray-400 text-sm">Version 1.0.0</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-200">Features</h3>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>Draggable & resizable windows with z-index management</li>
                  <li>Virtual file system with localStorage persistence</li>
                  <li>Built-in apps: Terminal, File Manager, Text Editor, Snake, Browser</li>
                  <li>Productivity apps: Sheets, Deck, Calculator</li>
                  <li>Customizable wallpapers and accent colors</li>
                  <li>Boot screen animation</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-200">Tech Stack</h3>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Framework:</span>
                    <span className="text-gray-200 ml-2">Next.js 16</span>
                  </div>
                  <div>
                    <span className="text-gray-400">UI:</span>
                    <span className="text-gray-200 ml-2">React 19</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Language:</span>
                    <span className="text-gray-200 ml-2">TypeScript</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Styling:</span>
                    <span className="text-gray-200 ml-2">Tailwind CSS v4</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Animation:</span>
                    <span className="text-gray-200 ml-2">Framer Motion</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Icons:</span>
                    <span className="text-gray-200 ml-2">Lucide React</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
