import React from 'react';
import { Sparkles, Book } from 'lucide-react';

interface HeaderProps {
  onToggleNotebook: () => void;
  isNotebookOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleNotebook, isNotebookOpen }) => {
  return (
    <header className="flex items-center justify-between py-6 px-4 md:px-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white transform transition-transform hover:scale-105 duration-300">
          <Sparkles size={20} fill="currentColor" className="text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Flickflow</h1>
      </div>
      
      <button 
        onClick={onToggleNotebook}
        className={`p-2.5 rounded-full transition-all flex items-center gap-2 text-sm font-semibold border ${
          isNotebookOpen 
          ? 'bg-gray-900 text-white border-gray-900' 
          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <Book size={18} />
        <span className="hidden md:inline">Notebook</span>
      </button>
    </header>
  );
};