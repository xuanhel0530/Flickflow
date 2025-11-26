import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { Search, Heart, Clock, Trash2, ChevronRight } from 'lucide-react';

interface NotebookProps {
  history: HistoryItem[];
  favorites: HistoryItem[]; // Kept in props if needed for future, but UI is simplified to history
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (item: HistoryItem) => void;
}

export const Notebook: React.FC<NotebookProps> = ({ history, onSelect, onDelete, onToggleFavorite }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter logic
  const filteredData = history.filter(item => 
    item.sourceText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.data.standardTranslation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort by newest first
  const sortedData = [...filteredData].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="w-full h-full bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-indigo-500/5 border border-white/80 flex flex-col overflow-hidden animate-fadeIn">
      
      {/* Header & Search */}
      <div className="p-5 border-b border-gray-100/50 bg-white/40">
        <h2 className="text-xl font-extrabold text-gray-800 mb-4 px-1">My Words</h2>
        <div className="relative group">
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
           <input 
             type="text"
             placeholder="Search past searches..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-pink-100/50 focus:border-pink-200 transition-all shadow-sm"
           />
        </div>
      </div>

      {/* Simple List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
        {sortedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-300">
            <Clock size={48} className="mb-3 opacity-20" />
            <p className="font-semibold">No words yet</p>
          </div>
        ) : (
          sortedData.map((item) => (
            <div 
                key={item.id} 
                onClick={() => onSelect(item)}
                className="group relative bg-white hover:bg-pink-50/30 border border-gray-100 hover:border-pink-100 rounded-2xl p-4 transition-all duration-300 cursor-pointer flex items-center justify-between"
            >
               {/* Word Content */}
               <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-gray-800 font-bold text-lg truncate">{item.sourceText}</h3>
                  <p className="text-gray-500 font-medium text-sm truncate">{item.data.standardTranslation}</p>
               </div>

               {/* Jump Icon */}
               <div className="flex items-center gap-3 shrink-0">
                 {/* Favorite Indicator (Small) */}
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     onToggleFavorite(item);
                   }}
                   className={`p-2 rounded-full transition-colors ${item.isFavorite ? 'text-red-400 bg-red-50' : 'text-gray-200 hover:text-red-300 hover:bg-gray-50'}`}
                 >
                   <Heart size={18} fill={item.isFavorite ? "currentColor" : "none"} />
                 </button>

                 <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-pink-100 group-hover:text-pink-400 transition-colors">
                    <ChevronRight size={18} />
                 </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};