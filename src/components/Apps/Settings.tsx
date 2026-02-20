'use client';

import React, { useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { Upload, X } from 'lucide-react';

const PRESETS = [
  { name: 'Blue Gradient', value: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Dark Gradient', value: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)' },
  { name: 'Sunset', value: 'linear-gradient(to right, #f83600 0%, #f9d423 100%)' },
  { name: 'Midnight', value: '#0f172a' },
  { name: 'Retro Grid', value: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px) 0 0 / 20px 20px, #1a1a1a' },
];

const Settings: React.FC = () => {
  const { wallpaper, setWallpaper } = useOS();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setWallpaper(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 text-gray-900 p-6 overflow-auto">
      <h2 className="text-2xl font-bold mb-6 border-b pb-2">Settings</h2>

      {/* Wallpaper Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Desktop Wallpaper</h3>
        
        {/* Presets Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setWallpaper(preset.value)}
              className={`
                group relative aspect-video rounded-lg overflow-hidden border-2 transition-all
                ${wallpaper === preset.value ? 'border-blue-500 shadow-md scale-105' : 'border-transparent hover:border-gray-300'}
              `}
            >
              <div 
                className="w-full h-full"
                style={{ background: preset.value }}
              />
              <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                {preset.name}
              </span>
            </button>
          ))}
        </div>

        {/* Custom Upload */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm"
          >
            <Upload size={16} className="mr-2 text-gray-500" />
            Upload Custom Image
          </button>

          {/* Reset Button */}
           <button
            onClick={() => setWallpaper(PRESETS[0].value)}
            className="flex items-center justify-center px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-md hover:bg-red-100 text-sm font-medium transition-colors"
          >
            <X size={16} className="mr-2" />
            Reset to Default
          </button>
        </div>

        <p className="mt-2 text-xs text-gray-500">
          Uploads are saved locally in your browser. Large images may affect performance.
        </p>
      </div>

      {/* Other Settings (Placeholder) */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-700">System</h3>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm font-medium">OS Version</span>
            <span className="text-sm text-gray-500">WebOS 1.0.0</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm font-medium">Resolution</span>
            <span className="text-sm text-gray-500">{typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Unknown'}</span>
          </div>
           <div className="flex justify-between items-center py-2">
            <span className="text-sm font-medium">Theme</span>
            <span className="text-sm text-gray-500">Dark (System Default)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
