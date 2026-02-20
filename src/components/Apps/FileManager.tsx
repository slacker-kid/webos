'use client';

import React, { useState } from 'react';
import { useFileSystem, FileNode } from '../../context/FileSystemContext';
import { useOS } from '../../context/OSContext';
import { Folder, FileText, ArrowLeft, Plus, Trash2 } from 'lucide-react';

const FileManager: React.FC = () => {
  const { listDir, createDir, createFile, deleteItem } = useFileSystem();
  const { openWindow } = useOS();
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const files = listDir(currentPath);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    setSelectedFile(null);
  };

  const handleUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(p => p);
    parts.pop();
    setCurrentPath(parts.length === 0 ? '/' : '/' + parts.join('/'));
  };

  const handleOpen = (file: FileNode) => {
    if (file.type === 'dir') {
      handleNavigate(currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`);
    } else {
      openWindow('editor', file.name, { path: currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}` });
    }
  };

  const handleCreateFolder = () => {
    const name = prompt('Folder name:');
    if (name) {
      createDir(currentPath, name);
    }
  };

  const handleCreateFile = () => {
    const name = prompt('File name (e.g., notes.txt):');
    if (name) {
      createFile(currentPath, name, '');
    }
  };

  const handleDelete = () => {
    if (selectedFile) {
        if(confirm(`Delete ${selectedFile}?`)) {
            const pathToDelete = currentPath === '/' ? `/${selectedFile}` : `${currentPath}/${selectedFile}`;
            deleteItem(pathToDelete);
            setSelectedFile(null);
        }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 text-gray-800">
      {/* Toolbar */}
      <div className="flex items-center space-x-2 p-2 bg-gray-200 border-b border-gray-300">
        <button 
          onClick={handleUp} 
          disabled={currentPath === '/'}
          className="p-1 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="flex-1 text-sm font-mono truncate px-2 border border-gray-300 bg-white rounded py-1">
          {currentPath}
        </span>
        <button onClick={handleCreateFolder} className="p-1 hover:bg-gray-300 rounded" title="New Folder">
          <Folder size={18} className="text-yellow-600" /> <span className="sr-only">New Folder</span>
        </button>
        <button onClick={handleCreateFile} className="p-1 hover:bg-gray-300 rounded" title="New File">
            <Plus size={18} /> <span className="sr-only">New File</span>
        </button>
        {selectedFile && (
             <button onClick={handleDelete} className="p-1 hover:bg-red-200 text-red-600 rounded" title="Delete">
                <Trash2 size={18} />
             </button>
        )}
      </div>

      {/* File Grid */}
      <div 
        className="flex-1 overflow-auto p-4 grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-4 content-start"
        onClick={() => setSelectedFile(null)}
      >
        {files.map(file => (
          <div
            key={file.id}
            className={`
              flex flex-col items-center p-2 rounded cursor-pointer select-none transition-colors
              ${selectedFile === file.name ? 'bg-blue-200 ring-1 ring-blue-400' : 'hover:bg-gray-200'}
            `}
            onClick={(e) => { e.stopPropagation(); setSelectedFile(file.name); }}
            onDoubleClick={() => handleOpen(file)}
          >
            {file.type === 'dir' ? (
              <Folder size={48} className="text-yellow-500 mb-1" />
            ) : (
              <FileText size={48} className="text-gray-500 mb-1" />
            )}
            <span className="text-xs text-center break-all line-clamp-2">{file.name}</span>
          </div>
        ))}
        {files.length === 0 && (
            <div className="col-span-full text-center text-gray-400 mt-10">Folder is empty</div>
        )}
      </div>
    </div>
  );
};

export default FileManager;
