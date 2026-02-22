'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Copy, Trash2, ChevronUp, ChevronDown, Play, X } from 'lucide-react';

const STORAGE_KEY = 'webos_deck_data';

interface Slide {
  id: string;
  title: string;
  body: string;
  bg: string;
}

const BG_PRESETS = [
  { name: 'Dark', value: '#1e1e2e' },
  { name: 'Blue', value: '#1e3a5f' },
  { name: 'Green', value: '#1a3a2a' },
  { name: 'Purple', value: '#2d1b4e' },
  { name: 'Red', value: '#3b1a1a' },
  { name: 'Amber', value: '#3b2e1a' },
];

function makeSlide(partial?: Partial<Slide>): Slide {
  return {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    title: 'Untitled Slide',
    body: 'Click to edit content',
    bg: BG_PRESETS[0].value,
    ...partial,
  };
}

const Deck: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([makeSlide({ title: 'My Presentation', body: 'Double-click to edit' })]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editingField, setEditingField] = useState<'title' | 'body' | null>(null);
  const [presenting, setPresenting] = useState(false);
  const [presIndex, setPresIndex] = useState(0);

  // Load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // eslint-disable-next-line react-compiler/react-compiler
        if (Array.isArray(parsed) && parsed.length > 0) setSlides(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  // Save
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slides));
  }, [slides]);

  const active = slides[activeIndex] || slides[0];

  const updateSlide = useCallback((id: string, updates: Partial<Slide>) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const addSlide = () => {
    const newSlide = makeSlide();
    setSlides(prev => [...prev, newSlide]);
    setActiveIndex(slides.length);
  };

  const duplicateSlide = () => {
    const dup = makeSlide({ title: active.title, body: active.body, bg: active.bg });
    const newSlides = [...slides];
    newSlides.splice(activeIndex + 1, 0, dup);
    setSlides(newSlides);
    setActiveIndex(activeIndex + 1);
  };

  const deleteSlide = () => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== activeIndex);
    setSlides(newSlides);
    setActiveIndex(Math.min(activeIndex, newSlides.length - 1));
  };

  const moveSlide = (dir: -1 | 1) => {
    const newIndex = activeIndex + dir;
    if (newIndex < 0 || newIndex >= slides.length) return;
    const newSlides = [...slides];
    [newSlides[activeIndex], newSlides[newIndex]] = [newSlides[newIndex], newSlides[activeIndex]];
    setSlides(newSlides);
    setActiveIndex(newIndex);
  };

  const startPresentation = () => {
    setPresIndex(activeIndex);
    setPresenting(true);
  };

  // Presentation keyboard controls
  useEffect(() => {
    if (!presenting) return;
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          setPresIndex(prev => Math.min(prev + 1, slides.length - 1));
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          setPresIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Escape':
          setPresenting(false);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [presenting, slides.length]);

  // Presentation mode overlay
  if (presenting) {
    const slide = slides[presIndex];
    return (
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        style={{ backgroundColor: slide.bg }}
        onClick={(e) => {
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          if (e.clientX > rect.width / 2) {
            setPresIndex(prev => Math.min(prev + 1, slides.length - 1));
          } else {
            setPresIndex(prev => Math.max(prev - 1, 0));
          }
        }}
      >
        <button
          className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors z-10"
          onClick={(e) => { e.stopPropagation(); setPresenting(false); }}
        >
          <X size={20} />
        </button>
        <div className="max-w-4xl w-full px-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-8 drop-shadow-lg">{slide.title}</h1>
          <p className="text-2xl text-gray-200 whitespace-pre-wrap leading-relaxed">{slide.body}</p>
        </div>
        <div className="absolute bottom-6 text-gray-400 text-sm">
          {presIndex + 1} / {slides.length}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-48 bg-gray-800 border-r border-gray-700 flex flex-col shrink-0">
        <div className="p-2 border-b border-gray-700 flex items-center gap-1 flex-wrap">
          <button onClick={addSlide} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors" title="Add Slide">
            <Plus size={16} />
          </button>
          <button onClick={duplicateSlide} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors" title="Duplicate">
            <Copy size={16} />
          </button>
          <button onClick={deleteSlide} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400 transition-colors" title="Delete" disabled={slides.length <= 1}>
            <Trash2 size={16} />
          </button>
          <button onClick={() => moveSlide(-1)} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors" title="Move Up">
            <ChevronUp size={16} />
          </button>
          <button onClick={() => moveSlide(1)} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors" title="Move Down">
            <ChevronDown size={16} />
          </button>
          <button onClick={startPresentation} className="p-1 hover:bg-gray-700 rounded text-green-400 hover:text-green-300 transition-colors" title="Present">
            <Play size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`rounded-md cursor-pointer border-2 transition-all p-2 ${
                i === activeIndex ? 'border-blue-500' : 'border-transparent hover:border-gray-600'
              }`}
              style={{ backgroundColor: slide.bg }}
              onClick={() => { setActiveIndex(i); setEditingField(null); }}
            >
              <div className="text-[10px] text-gray-400 mb-0.5">{i + 1}</div>
              <div className="text-xs font-semibold truncate text-white/90">{slide.title}</div>
              <div className="text-[10px] text-gray-400 truncate mt-0.5">{slide.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Background color selector */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700 shrink-0">
          <span className="text-xs text-gray-400">Background:</span>
          {BG_PRESETS.map(bg => (
            <button
              key={bg.value}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                active.bg === bg.value ? 'border-white scale-110' : 'border-gray-600 hover:border-gray-400'
              }`}
              style={{ backgroundColor: bg.value }}
              onClick={() => updateSlide(active.id, { bg: bg.value })}
              title={bg.name}
            />
          ))}
        </div>

        {/* Slide Preview */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-900/50">
          <div
            className="w-full max-w-2xl aspect-video rounded-lg shadow-2xl flex flex-col items-center justify-center p-12 relative"
            style={{ backgroundColor: active.bg }}
          >
            {/* Title */}
            {editingField === 'title' ? (
              <input
                className="text-3xl font-bold text-white bg-transparent border-b-2 border-blue-500 text-center outline-none w-full mb-6"
                value={active.title}
                onChange={e => updateSlide(active.id, { title: e.target.value })}
                onBlur={() => setEditingField(null)}
                onKeyDown={e => { if (e.key === 'Enter') setEditingField(null); }}
                autoFocus
              />
            ) : (
              <h2
                className="text-3xl font-bold text-white text-center mb-6 cursor-text hover:ring-2 hover:ring-blue-500/50 rounded px-4 py-1 transition-all w-full"
                onDoubleClick={() => setEditingField('title')}
              >
                {active.title}
              </h2>
            )}

            {/* Body */}
            {editingField === 'body' ? (
              <textarea
                className="text-lg text-gray-200 bg-transparent border-2 border-blue-500 rounded text-center outline-none w-full flex-1 resize-none"
                value={active.body}
                onChange={e => updateSlide(active.id, { body: e.target.value })}
                onBlur={() => setEditingField(null)}
                autoFocus
              />
            ) : (
              <p
                className="text-lg text-gray-200 text-center whitespace-pre-wrap cursor-text hover:ring-2 hover:ring-blue-500/50 rounded px-4 py-2 transition-all w-full flex-1"
                onDoubleClick={() => setEditingField('body')}
              >
                {active.body}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deck;
