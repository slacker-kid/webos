'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFileSystem } from '../../context/FileSystemContext';
import { format } from 'date-fns';

interface TerminalLine {
  type: 'command' | 'output' | 'error';
  content: string;
}

const Terminal: React.FC = () => {
  const { listDir, readFile, createDir, createFile, deleteItem } = useFileSystem();
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'output', content: 'WebOS Terminal v1.0.0' },
    { type: 'output', content: 'Type "help" for available commands.' }
  ]);
  const [input, setInput] = useState('');
  const [currentPath, setCurrentPath] = useState('/');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Command history state
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const savedInputRef = useRef('');

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
    return currentPath === '/' ? `/${path}` : `${currentPath}/${path}`;
  };

  const splitParentAndName = (path: string): [string, string] => {
    const resolved = resolvePath(path);
    const parts = resolved.split('/').filter(p => p);
    const name = parts.pop()!;
    const parent = parts.length === 0 ? '/' : '/' + parts.join('/');
    return [parent, name];
  };

  const handleCommand = (cmd: string) => {
    const args = cmd.trim().split(/\s+/);
    const command = args[0];
    const arg1 = args[1];
    const arg2 = args[2];

    const newHistory: TerminalLine[] = [...history, { type: 'command', content: `${currentPath} $ ${cmd}` }];

    switch (command) {
      case 'help':
        newHistory.push({ type: 'output', content: 'Available commands:' });
        newHistory.push({ type: 'output', content: '  help              Show this help message' });
        newHistory.push({ type: 'output', content: '  ls, dir           List directory contents' });
        newHistory.push({ type: 'output', content: '  cd <path>         Change directory' });
        newHistory.push({ type: 'output', content: '  pwd               Print working directory' });
        newHistory.push({ type: 'output', content: '  cat <file>        Display file contents' });
        newHistory.push({ type: 'output', content: '  echo <text>       Print text' });
        newHistory.push({ type: 'output', content: '  mkdir <path>      Create a directory' });
        newHistory.push({ type: 'output', content: '  touch <path>      Create an empty file' });
        newHistory.push({ type: 'output', content: '  rm <path>         Remove a file or directory' });
        newHistory.push({ type: 'output', content: '  mv <src> <dest>   Move/rename a file' });
        newHistory.push({ type: 'output', content: '  cp <src> <dest>   Copy a file' });
        newHistory.push({ type: 'output', content: '  date              Show current date and time' });
        newHistory.push({ type: 'output', content: '  clear             Clear terminal' });
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'ls':
      case 'dir': {
        const target = arg1 ? resolvePath(arg1) : currentPath;
        const files = listDir(target);
        if (files.length === 0) {
          newHistory.push({ type: 'output', content: '(empty)' });
        } else {
          const fileList = files.map(f => f.type === 'dir' ? `${f.name}/` : f.name).join('  ');
          newHistory.push({ type: 'output', content: fileList });
        }
        break;
      }
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
      case 'echo': {
        const text = args.slice(1).join(' ');
        newHistory.push({ type: 'output', content: text });
        break;
      }
      case 'date':
        newHistory.push({ type: 'output', content: format(new Date(), 'PPpp') });
        break;
      case 'mkdir':
        if (!arg1) {
          newHistory.push({ type: 'error', content: 'usage: mkdir <path>' });
        } else {
          try {
            const [parent, name] = splitParentAndName(arg1);
            createDir(parent, name);
          } catch {
            newHistory.push({ type: 'error', content: `mkdir: cannot create directory '${arg1}'` });
          }
        }
        break;
      case 'touch':
        if (!arg1) {
          newHistory.push({ type: 'error', content: 'usage: touch <path>' });
        } else {
          try {
            const [parent, name] = splitParentAndName(arg1);
            createFile(parent, name, '');
          } catch {
            newHistory.push({ type: 'error', content: `touch: cannot create file '${arg1}'` });
          }
        }
        break;
      case 'rm':
        if (!arg1) {
          newHistory.push({ type: 'error', content: 'usage: rm <path>' });
        } else {
          try {
            deleteItem(resolvePath(arg1));
          } catch {
            newHistory.push({ type: 'error', content: `rm: cannot remove '${arg1}': No such file or directory` });
          }
        }
        break;
      case 'mv':
        if (!arg1 || !arg2) {
          newHistory.push({ type: 'error', content: 'usage: mv <source> <dest>' });
        } else {
          try {
            const srcPath = resolvePath(arg1);
            const content = readFile(srcPath);
            if (content === null) {
              newHistory.push({ type: 'error', content: `mv: '${arg1}': No such file` });
            } else {
              const [destParent, destName] = splitParentAndName(arg2);
              createFile(destParent, destName, content);
              deleteItem(srcPath);
            }
          } catch {
            newHistory.push({ type: 'error', content: `mv: cannot move '${arg1}' to '${arg2}'` });
          }
        }
        break;
      case 'cp':
        if (!arg1 || !arg2) {
          newHistory.push({ type: 'error', content: 'usage: cp <source> <dest>' });
        } else {
          try {
            const srcPath = resolvePath(arg1);
            const content = readFile(srcPath);
            if (content === null) {
              newHistory.push({ type: 'error', content: `cp: '${arg1}': No such file` });
            } else {
              const [destParent, destName] = splitParentAndName(arg2);
              createFile(destParent, destName, content);
            }
          } catch {
            newHistory.push({ type: 'error', content: `cp: cannot copy '${arg1}' to '${arg2}'` });
          }
        }
        break;
      case '':
        break;
      default:
        newHistory.push({ type: 'error', content: `command not found: ${command}` });
    }

    setHistory(newHistory);
  };

  const handleTabCompletion = () => {
    const trimmed = input.trimEnd();
    // Find the last space-separated token as the partial path
    const lastSpaceIdx = trimmed.lastIndexOf(' ');
    const prefix = lastSpaceIdx === -1 ? '' : trimmed.slice(0, lastSpaceIdx + 1);
    const partial = lastSpaceIdx === -1 ? trimmed : trimmed.slice(lastSpaceIdx + 1);

    if (!partial) return;

    // Split partial into directory part and name prefix
    const lastSlashIdx = partial.lastIndexOf('/');
    let dirPath: string;
    let namePrefix: string;

    if (lastSlashIdx === -1) {
      dirPath = currentPath;
      namePrefix = partial;
    } else {
      const dirPart = partial.slice(0, lastSlashIdx) || '/';
      dirPath = resolvePath(dirPart);
      namePrefix = partial.slice(lastSlashIdx + 1);
    }

    try {
      const entries = listDir(dirPath);
      const matches = entries.filter(e =>
        e.name.toLowerCase().startsWith(namePrefix.toLowerCase())
      );

      if (matches.length === 1) {
        const match = matches[0];
        const suffix = match.type === 'dir' ? '/' : '';
        const dirPrefix = lastSlashIdx === -1 ? '' : partial.slice(0, lastSlashIdx + 1);
        setInput(prefix + dirPrefix + match.name + suffix);
      } else if (matches.length > 1) {
        const display = matches.map(m => m.type === 'dir' ? `${m.name}/` : m.name).join('  ');
        setHistory(prev => [
          ...prev,
          { type: 'command', content: `${currentPath} $ ${input}` },
          { type: 'output', content: display }
        ]);
      }
    } catch {
      // Directory doesn't exist, no completion possible
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const cmd = input;
      // Add non-empty commands to history
      if (cmd.trim()) {
        setCommandHistory(prev => [...prev, cmd.trim()]);
      }
      setHistoryIndex(-1);
      savedInputRef.current = '';
      handleCommand(cmd);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const newIndex = historyIndex + 1;
      if (newIndex >= commandHistory.length) return;
      if (historyIndex === -1) {
        savedInputRef.current = input;
      }
      setHistoryIndex(newIndex);
      setInput(commandHistory[commandHistory.length - 1 - newIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex <= -1) return;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      if (newIndex === -1) {
        setInput(savedInputRef.current);
      } else {
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleTabCompletion();
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
