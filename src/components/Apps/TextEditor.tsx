'use client';

import React, { useState, useEffect } from 'react';
import { useFileSystem } from '../../context/FileSystemContext';
import { Save } from 'lucide-react';

interface TextEditorProps {
  initialPath?: string;
}

const TextEditor: React.FC<TextEditorProps> = ({ initialPath }) => {
  const { readFile, writeFile, createFile } = useFileSystem();
  const [content, setContent] = useState('');
  const [currentPath, setCurrentPath] = useState(initialPath || '');
  const [isDirty, setIsDirty] = useState(false);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if (initialPath) {
      const fileContent = readFile(initialPath);
      if (fileContent !== null) {
        // eslint-disable-next-line react-compiler/react-compiler
        setContent(fileContent);
      } else {
        setStatus('File not found');
      }
    }
  }, [initialPath, readFile]);

  const handleSave = () => {
    if (!currentPath) {
      const name = prompt('Save as (e.g., /documents/note.txt):', '/documents/untitled.txt');
      if (name) {
        // Need to extract directory and filename?
        // My createFile takes (dirPath, name, content).
        // My writeFile takes (fullPath, content).
        // If file exists, writeFile works. If not, it fails in my current implementation (it only updates existing).
        // Wait, writeFile implementation:
        // Finds parent dir, then updates child. If child doesn't exist, it does nothing?
        // Let's check FileSystemContext.
        // It does: `if (current.children && fileName && current.children[fileName])`
        // So it only updates EXISTING files.
        // So for "Save As", I need to determine if it exists.
        // Or just use createFile for new files.
        
        // Simpler: assume user provides full path.
        // Split to dir and name.
        const parts = name.split('/');
        const fileName = parts.pop();
        const dirPath = parts.join('/') || '/'; // if '/note.txt', dirPath is empty string -> root? No, join returns empty. Root is '/'.
        // Actually split('/') on '/note.txt' -> ['', 'note.txt']. pop -> 'note.txt'. join -> ''.
        // So if dirPath is empty, use '/'.
        
        if (fileName) {
            createFile(dirPath || '/', fileName, content);
            setCurrentPath(dirPath === '/' ? `/${fileName}` : `${dirPath}/${fileName}`);
            setIsDirty(false);
            setStatus('Saved');
            setTimeout(() => setStatus(''), 2000);
        }
      }
    } else {
      writeFile(currentPath, content);
      setIsDirty(false);
      setStatus('Saved');
      setTimeout(() => setStatus(''), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-900">
      <div className="flex items-center justify-between p-2 bg-gray-100 border-b border-gray-300">
        <div className="flex items-center space-x-2">
            <button 
            onClick={handleSave} 
            className={`p-1 rounded flex items-center space-x-1 ${isDirty ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'text-gray-500 hover:bg-gray-200'}`}
            title="Save"
            >
            <Save size={16} />
            <span className="text-xs">Save</span>
            </button>
            <span className="text-xs text-gray-500 italic">{currentPath || 'Untitled'}</span>
        </div>
        <span className="text-xs text-gray-400">{status}</span>
      </div>
      <textarea
        className="flex-1 w-full p-4 outline-none resize-none font-mono text-sm"
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setIsDirty(true);
        }}
        placeholder="Start typing..."
      />
    </div>
  );
};

export default TextEditor;
