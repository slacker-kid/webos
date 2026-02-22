'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Trash2 } from 'lucide-react';

const COLS = 26;
const ROWS = 50;
const STORAGE_KEY = 'webos_sheets_data';

type CellData = { [key: string]: string };

function colLabel(c: number): string {
  return String.fromCharCode(65 + c);
}

function cellRef(col: number, row: number): string {
  return `${colLabel(col)}${row + 1}`;
}

function parseCellRef(ref: string): { col: number; row: number } | null {
  const match = ref.match(/^([A-Z])(\d+)$/);
  if (!match) return null;
  return { col: match[1].charCodeAt(0) - 65, row: parseInt(match[2]) - 1 };
}

function parseRange(range: string): string[] {
  const parts = range.split(':');
  if (parts.length !== 2) return [];
  const start = parseCellRef(parts[0]);
  const end = parseCellRef(parts[1]);
  if (!start || !end) return [];
  const refs: string[] = [];
  for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
    for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
      refs.push(cellRef(c, r));
    }
  }
  return refs;
}

function evaluateFormula(formula: string, data: CellData, visited: Set<string> = new Set()): string {
  if (!formula.startsWith('=')) return formula;
  const expr = formula.slice(1).trim().toUpperCase();

  const fnMatch = expr.match(/^(SUM|AVG|AVERAGE|COUNT|MAX|MIN)\((.+)\)$/);
  if (fnMatch) {
    const fn = fnMatch[1];
    const arg = fnMatch[2].trim();
    const refs = arg.includes(':') ? parseRange(arg) : arg.split(',').map(s => s.trim());
    const values: number[] = [];
    for (const ref of refs) {
      if (visited.has(ref)) continue;
      visited.add(ref);
      const raw = data[ref] || '';
      const evaluated = evaluateFormula(raw, data, new Set(visited));
      const num = parseFloat(evaluated);
      if (!isNaN(num)) values.push(num);
    }
    if (values.length === 0) return '0';
    switch (fn) {
      case 'SUM': return values.reduce((a, b) => a + b, 0).toString();
      case 'AVG':
      case 'AVERAGE': return (values.reduce((a, b) => a + b, 0) / values.length).toString();
      case 'COUNT': return values.length.toString();
      case 'MAX': return Math.max(...values).toString();
      case 'MIN': return Math.min(...values).toString();
    }
  }

  // Simple cell reference
  const ref = parseCellRef(expr);
  if (ref) {
    const key = cellRef(ref.col, ref.row);
    if (visited.has(key)) return '#REF!';
    visited.add(key);
    const raw = data[key] || '';
    return evaluateFormula(raw, data, visited);
  }

  // Try basic arithmetic with cell references replaced
  try {
    const replaced = expr.replace(/[A-Z]\d+/g, (match) => {
      if (visited.has(match)) return '0';
      visited.add(match);
      const raw = data[match] || '0';
      const val = evaluateFormula(raw, data, new Set(visited));
      return isNaN(parseFloat(val)) ? '0' : val;
    });
    // Only allow safe characters for eval
    if (/^[\d+\-*/().  ]+$/.test(replaced)) {
      const result = new Function(`return (${replaced})`)();
      if (typeof result === 'number' && isFinite(result)) {
        return Number.isInteger(result) ? result.toString() : result.toFixed(4);
      }
    }
  } catch {
    // fall through
  }

  return '#ERR!';
}

const Sheets: React.FC = () => {
  const [data, setData] = useState<CellData>({});
  const [activeCell, setActiveCell] = useState<{ col: number; row: number }>({ col: 0, row: 0 });
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-compiler/react-compiler
      if (saved) setData(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // Save to localStorage
  const saveData = useCallback((d: CellData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  }, []);

  const activeCellRef = cellRef(activeCell.col, activeCell.row);
  const rawValue = data[activeCellRef] || '';

  const commitEdit = useCallback(() => {
    if (editing) {
      const ref = cellRef(activeCell.col, activeCell.row);
      const newData = { ...data, [ref]: editValue };
      if (!editValue) delete newData[ref];
      setData(newData);
      saveData(newData);
      setEditing(false);
    }
  }, [editing, editValue, activeCell, data, saveData]);

  const startEdit = useCallback((value?: string) => {
    setEditing(true);
    setEditValue(value ?? rawValue);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [rawValue]);

  const getCellDisplay = useCallback((col: number, row: number): string => {
    const ref = cellRef(col, row);
    const raw = data[ref];
    if (!raw) return '';
    if (raw.startsWith('=')) return evaluateFormula(raw, data);
    return raw;
  }, [data]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (editing) {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitEdit();
        setActiveCell(prev => ({ ...prev, row: Math.min(prev.row + 1, ROWS - 1) }));
      } else if (e.key === 'Tab') {
        e.preventDefault();
        commitEdit();
        setActiveCell(prev => ({ ...prev, col: Math.min(prev.col + 1, COLS - 1) }));
      } else if (e.key === 'Escape') {
        setEditing(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setActiveCell(prev => ({ ...prev, row: Math.max(prev.row - 1, 0) }));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActiveCell(prev => ({ ...prev, row: Math.min(prev.row + 1, ROWS - 1) }));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setActiveCell(prev => ({ ...prev, col: Math.max(prev.col - 1, 0) }));
        break;
      case 'ArrowRight':
      case 'Tab':
        e.preventDefault();
        setActiveCell(prev => ({ ...prev, col: Math.min(prev.col + 1, COLS - 1) }));
        break;
      case 'Enter':
        e.preventDefault();
        startEdit();
        break;
      case 'Delete':
      case 'Backspace': {
        const ref = cellRef(activeCell.col, activeCell.row);
        const newData = { ...data };
        delete newData[ref];
        setData(newData);
        saveData(newData);
        break;
      }
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          startEdit(e.key);
        }
    }
  }, [editing, commitEdit, startEdit, activeCell, data, saveData]);

  const clearAll = () => {
    setData({});
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border-b border-gray-700 shrink-0">
        <button
          onClick={() => saveData(data)}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
        >
          <Save size={12} /> Save
        </button>
        <button
          onClick={clearAll}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-red-600 rounded transition-colors"
        >
          <Trash2 size={12} /> Clear All
        </button>
      </div>

      {/* Formula Bar */}
      <div className="flex items-center gap-2 px-3 py-1 bg-gray-850 border-b border-gray-700 shrink-0 bg-gray-800/50">
        <span className="text-xs font-mono font-bold text-blue-400 w-10 text-center">{activeCellRef}</span>
        <div className="w-px h-5 bg-gray-600" />
        <input
          ref={inputRef}
          className="flex-1 bg-transparent text-sm font-mono outline-none text-gray-200 px-1"
          value={editing ? editValue : rawValue}
          onChange={e => setEditValue(e.target.value)}
          onFocus={() => { if (!editing) startEdit(); }}
          onBlur={commitEdit}
          placeholder="Enter value or formula (=SUM(A1:A5))"
        />
      </div>

      {/* Grid */}
      <div ref={gridRef} className="flex-1 overflow-auto relative">
        <table className="border-collapse text-xs font-mono">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="sticky left-0 z-20 w-12 min-w-[3rem] bg-gray-800 border border-gray-700 text-gray-500 text-center" />
              {Array.from({ length: COLS }, (_, c) => (
                <th
                  key={c}
                  className={`w-24 min-w-[6rem] bg-gray-800 border border-gray-700 text-center py-1 ${
                    c === activeCell.col ? 'text-blue-400 bg-gray-700' : 'text-gray-500'
                  }`}
                >
                  {colLabel(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }, (_, r) => (
              <tr key={r}>
                <td
                  className={`sticky left-0 z-10 bg-gray-800 border border-gray-700 text-center py-0.5 ${
                    r === activeCell.row ? 'text-blue-400 bg-gray-700' : 'text-gray-500'
                  }`}
                >
                  {r + 1}
                </td>
                {Array.from({ length: COLS }, (_, c) => {
                  const isActive = c === activeCell.col && r === activeCell.row;
                  return (
                    <td
                      key={c}
                      className={`border border-gray-700/50 py-0.5 px-1 cursor-cell ${
                        isActive
                          ? 'bg-blue-900/40 outline outline-2 outline-blue-500'
                          : 'hover:bg-gray-800/50'
                      }`}
                      onClick={() => {
                        commitEdit();
                        setActiveCell({ col: c, row: r });
                      }}
                      onDoubleClick={() => {
                        setActiveCell({ col: c, row: r });
                        startEdit();
                      }}
                    >
                      {isActive && editing ? (
                        <input
                          className="w-full bg-transparent outline-none text-white"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          autoFocus
                        />
                      ) : (
                        <span className="block truncate">{getCellDisplay(c, r)}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sheets;
