'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type FileType = 'file' | 'dir';

export interface FileNode {
  id: string;
  name: string;
  type: FileType;
  content?: string; // For files
  children?: { [key: string]: FileNode }; // For dirs
  parentId: string | null;
}

interface FileSystemContextType {
  fs: FileNode;
  readFile: (path: string) => string | null;
  writeFile: (path: string, content: string) => void;
  createFile: (path: string, name: string, content?: string) => void;
  createDir: (path: string, name: string) => void;
  deleteItem: (path: string) => void;
  listDir: (path: string) => FileNode[];
  resetFileSystem: () => void;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

const initialFS: FileNode = {
  id: 'root',
  name: 'root',
  type: 'dir',
  parentId: null,
  children: {
    'documents': {
      id: 'docs',
      name: 'documents',
      type: 'dir',
      parentId: 'root',
      children: {
        'welcome.txt': {
          id: 'welcome',
          name: 'welcome.txt',
          type: 'file',
          parentId: 'docs',
          content: 'Welcome to WebOS! This is a simple text file.'
        }
      }
    },
    'desktop': {
      id: 'desktop',
      name: 'desktop',
      type: 'dir',
      parentId: 'root',
      children: {}
    }
  }
};

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fs, setFs] = useState<FileNode>(initialFS);

  useEffect(() => {
    const stored = localStorage.getItem('webos_fs');
    if (stored) {
      try {
        // eslint-disable-next-line react-compiler/react-compiler
        setFs(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse FS from local storage', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('webos_fs', JSON.stringify(fs));
  }, [fs]);

  // Helper to find a node by path (e.g., "/documents/welcome.txt")
  const findNode = (path: string): FileNode | null => {
    if (path === '/' || path === '') return fs;
    const parts = path.split('/').filter(p => p);
    let current = fs;
    for (const part of parts) {
      if (current.children && current.children[part]) {
        current = current.children[part];
      } else {
        return null;
      }
    }
    return current;
  };

  const readFile = (path: string) => {
    const node = findNode(path);
    return node && node.type === 'file' ? node.content || '' : null;
  };

  const writeFile = (path: string, content: string) => {
    setFs(prev => {
      const newFS = JSON.parse(JSON.stringify(prev)); // Deep copy
      const parts = path.split('/').filter(p => p);
      const fileName = parts.pop();
      const dirPath = parts.join('/');
      
      // Find parent directory in the copy
      let current = newFS;
      if (dirPath) {
        const dirParts = dirPath.split('/').filter(p => p);
        for (const part of dirParts) {
           if (current.children && current.children[part]) {
             current = current.children[part];
           } else {
             return prev; // Dir not found
           }
        }
      }

      if (current.children && fileName && current.children[fileName]) {
        current.children[fileName].content = content;
      }
      return newFS;
    });
  };

  const createFile = (path: string, name: string, content: string = '') => {
    setFs(prev => {
      const newFS = JSON.parse(JSON.stringify(prev));
      const node = path === '/' ? newFS : findNodeInCopy(newFS, path);
      if (node && node.type === 'dir') {
        node.children = node.children || {};
        node.children[name] = {
          id: Date.now().toString(),
          name,
          type: 'file',
          parentId: node.id,
          content
        };
      }
      return newFS;
    });
  };
  
  const createDir = (path: string, name: string) => {
    setFs(prev => {
      const newFS = JSON.parse(JSON.stringify(prev));
      const node = path === '/' ? newFS : findNodeInCopy(newFS, path);
      if (node && node.type === 'dir') {
        node.children = node.children || {};
        node.children[name] = {
          id: Date.now().toString(),
          name,
          type: 'dir',
          parentId: node.id,
          children: {}
        };
      }
      return newFS;
    });
  };

  const deleteItem = (path: string) => {
    setFs(prev => {
      const newFS = JSON.parse(JSON.stringify(prev));
      const parts = path.split('/').filter(p => p);
      const nameToDelete = parts.pop();
      const parentPath = parts.join('/');
      
      const parent = parentPath === '' ? newFS : findNodeInCopy(newFS, parentPath);
      
      if (parent && parent.children && nameToDelete) {
        delete parent.children[nameToDelete];
      }
      return newFS;
    });
  };

  const listDir = (path: string) => {
    const node = findNode(path);
    if (!node || node.type !== 'dir' || !node.children) return [];
    return Object.values(node.children);
  };

  // Helper for deep copy traversal
  const findNodeInCopy = (root: FileNode, path: string): FileNode | null => {
    if (path === '/' || path === '') return root;
    const parts = path.split('/').filter(p => p);
    let current = root;
    for (const part of parts) {
      if (current.children && current.children[part]) {
        current = current.children[part];
      } else {
        return null;
      }
    }
    return current;
  };

  const resetFileSystem = () => {
    setFs(JSON.parse(JSON.stringify(initialFS)));
  };

  return (
    <FileSystemContext.Provider value={{ fs, readFile, writeFile, createFile, createDir, deleteItem, listDir, resetFileSystem }}>
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) throw new Error('useFileSystem must be used within a FileSystemProvider');
  return context;
};
