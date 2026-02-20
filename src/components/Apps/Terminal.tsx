'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFileSystem } from '../../context/FileSystemContext';
import { format } from 'date-fns';

interface TerminalLine {
  type: 'command' | 'output' | 'error';
  content: string;
}

const Terminal: React.FC = () => {
  const { listDir, readFile } = useFileSystem();
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'output', content: 'WebOS Terminal v1.0.0' },
    { type: 'output', content: 'Type "help" for available commands.' }
  ]);
  const [input, setInput] = useState('');
  const [currentPath, setCurrentPath] = useState('/');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const resolvePath = (path: string) => {
    if (path.startsWith('/')) return path;
    if (path === '..') {
      if (currentPath === '/') return '/';
      const parts = currentPath.split('/').filter(p => p);
      parts.pop();
      return '/' + parts.join('/');
    }
    if (path === '.') return currentPath;
    
    // Simple relative path (no multiple levels supported for now in this simple logic)
    // Actually let's support it properly if we can, but simplest is:
    return currentPath === '/' ? `/${path}` : `${currentPath}/${path}`;
  };

  const handleCommand = (cmd: string) => {
    const args = cmd.trim().split(' ');
    const command = args[0];
    const arg1 = args[1]; // simplified argument handling

    const newHistory: TerminalLine[] = [...history, { type: 'command', content: `${currentPath} $ ${cmd}` }];

    switch (command) {
      case 'help':
        newHistory.push({ type: 'output', content: 'Available commands: help, ls, dir, cd, cat, echo, clear, date, pwd' });
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'ls':
      case 'dir':
        const files = listDir(currentPath);
        if (files.length === 0) {
           newHistory.push({ type: 'output', content: '(empty)' });
        } else {
           const fileList = files.map(f => f.type === 'dir' ? `${f.name}/` : f.name).join('  ');
           newHistory.push({ type: 'output', content: fileList });
        }
        break;
      case 'pwd':
        newHistory.push({ type: 'output', content: currentPath });
        break;
      case 'cd':
        if (!arg1) {
             setCurrentPath('/');
        } else if (arg1 === '..') {
             const parts = currentPath.split('/').filter(p => p);
             parts.pop();
             const target = parts.length === 0 ? '/' : '/' + parts.join('/');
             setCurrentPath(target);
        } else if (arg1.startsWith('/')) {
             setCurrentPath(arg1);
        } else {
             const children = listDir(currentPath);
             const exists = children.find(c => c.name === arg1 && c.type === 'dir');
             if (exists) {
                 setCurrentPath(currentPath === '/' ? `/${arg1}` : `${currentPath}/${arg1}`);
             } else {
                 newHistory.push({ type: 'error', content: `cd: ${arg1}: No such directory` });
             }
        }
        break;
      case 'cat':
        if (!arg1) {
            newHistory.push({ type: 'error', content: 'usage: cat <filename>' });
        } else {
            const target = resolvePath(arg1);
            const content = readFile(target);
            if (content !== null) {
                newHistory.push({ type: 'output', content });
            } else {
                newHistory.push({ type: 'error', content: `cat: ${arg1}: No such file` });
            }
        }
        break;
      case 'echo':
        const text = args.slice(1).join(' ');
        newHistory.push({ type: 'output', content: text });
        break;
      case 'date':
        newHistory.push({ type: 'output', content: format(new Date(), 'PPpp') });
        break;
      case '':
        break;
      default:
        newHistory.push({ type: 'error', content: `command not found: ${command}` });
    }

    setHistory(newHistory);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
  };

  return (
    <div 
      className="h-full bg-black text-green-400 font-mono p-2 overflow-auto text-sm"
      onClick={() => inputRef.current?.focus()}
    >
      {history.map((line, i) => (
        <div key={i} className={`mb-1 ${line.type === 'error' ? 'text-red-400' : line.type === 'command' ? 'text-white' : 'text-green-400'}`}>
          {line.content}
        </div>
      ))}
      <div className="flex">
        <span className="text-blue-400 mr-2">{currentPath} $</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-white"
          autoFocus
        />
      </div>
      <div ref={bottomRef} />
    </div>
  );
};

export default Terminal;
