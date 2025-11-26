import React from 'react';
import { TranslationResponse } from '../types';
import { Volume2, Info, Sparkles, BookOpen, Heart } from 'lucide-react';

interface ResultCardProps {
  data: TranslationResponse | null;
  image: string | null;
  isLoading: boolean;
  isFavorite: boolean;
  onSpeak: (text: string) => void;
  onToggleFavorite: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ data, image, isLoading, isFavorite, onSpeak, onToggleFavorite }) => {
  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-white/60 backdrop-blur-2xl rounded-[32px] border border-white/60 shadow-xl p-8 space-y-6">
        <div className="relative w-16 h-16">
           <div className="absolute inset-0 border-4 border-pink-200 rounded-full"></div>
           <div className="absolute inset-0 border-4 border-pink-400 rounded-full border-t-transparent animate-spin"></div>
           <div className="absolute inset-0 flex items-center justify-center">
             <Sparkles size={24} className="text-pink-400 animate-bounce" />
           </div>
        </div>
        <div className="text-center space-y-1">
           <p className="text-gray-700 font-bold text-lg">Cooking up translation...</p>
           <p className="text-gray-400 text-sm">Mixing definitions & culture</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-white/50 backdrop-blur-xl rounded-[32px] border-2 border-dashed border-pink-200 p-8 text-center group hover:border-pink-300 transition-colors">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mb-4 text-pink-400 shadow-sm group-hover:scale-110 transition-transform duration-500">
            <Sparkles size={32} />
        </div>
        <h3 className="text-gray-800 font-extrabold text-xl mb-2">Ready to Pop!</h3>
        <p className="text-gray-500 font-medium text-sm max-w-xs leading-relaxed">
            Enter text or speak to reveal slang, memes, and definitions in a snap.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-pink-500/5 border border-white/80 overflow-hidden flex flex-col animate-fadeIn transition-all">
      
      {/* Header Actions */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
         <button 
            onClick={onToggleFavorite}
            className={`p-3 rounded-full backdrop-blur-md border transition-all shadow-sm hover:scale-110 active:scale-90 ${
                isFavorite 
                ? 'bg-red-50 border-red-100 text-red-400' 
                : 'bg-white/90 border-white/50 text-gray-300 hover:text-red-300'
            }`}
         >
            <Heart size={22} fill={isFavorite ? "currentColor" : "none"} />
         </button>
      </div>

      {/* Top: Image Context */}
      <div className="relative w-full h-36 bg-gray-50 overflow-hidden group border-b border-white/50">
        {image ? (
          <img 
            src={image} 
            alt="Visual Context" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-50/30">
            <Sparkles size={24} className="animate-pulse text-indigo-200" />
          </div>
        )}
      </div>

      {/* Content - Macaron Layout */}
      <div className="p-5 space-y-4">
        
        {/* 1. Standard & Definition (Macaron Blue) */}
        <div className="bg-[#E8F4F8] rounded-3xl p-5 border border-blue-100/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider bg-white/50 px-2 py-1 rounded-full">Definition</span>
                <button onClick={() => onSpeak(data.standardTranslation)} className="p-1.5 bg-white/60 rounded-full text-blue-400 hover:bg-white hover:text-blue-600 transition-colors">
                    <Volume2 size={18} />
                </button>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2 leading-tight">{data.standardTranslation}</h2>
            
            {/* Dictionary Definition */}
            <div className="flex gap-3 mt-2 pt-3 border-t border-blue-200/30">
                <BookOpen size={16} className="text-blue-300 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-600 font-semibold leading-relaxed">
                    {data.definition}
                </p>
            </div>
        </div>

        {/* 2. Slang / Vibe (Macaron Pink/Purple) */}
        <div className="bg-[#FFF0F5] rounded-3xl p-5 border border-pink-100/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-pink-400 uppercase tracking-wider bg-white/50 px-2 py-1 rounded-full">Local Vibe</span>
                </div>
                <button onClick={() => onSpeak(data.slangTranslation)} className="p-1.5 bg-white/60 rounded-full text-pink-400 hover:bg-white hover:text-pink-600 transition-colors">
                    <Volume2 size={18} />
                </button>
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 mb-2 leading-tight">{data.slangTranslation}</h3>
            <div className="flex gap-3 mt-2 pt-3 border-t border-pink-200/30">
                <Info size={16} className="text-pink-300 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-600 font-semibold leading-relaxed">{data.slangExplanation}</p>
            </div>
        </div>

        {/* 3. Context & Example (Macaron Yellow & Green) */}
        <div className="grid grid-cols-2 gap-3">
            {/* Context */}
            <div className="bg-[#FFF9C4]/60 rounded-3xl p-4 border border-yellow-100/50 hover:bg-[#FFF9C4]/80 transition-colors">
                <h4 className="text-xs font-extrabold text-yellow-600/70 uppercase tracking-wider mb-2">Culture</h4>
                <p className="text-xs text-gray-700 leading-relaxed font-bold">{data.culturalContext}</p>
            </div>
            
            {/* Usage */}
            <div className="bg-[#E2F0CB]/60 rounded-3xl p-4 border border-green-100/50 hover:bg-[#E2F0CB]/80 transition-colors">
                <h4 className="text-xs font-extrabold text-green-600/70 uppercase tracking-wider mb-2">Example</h4>
                <p className="text-sm font-bold text-gray-800 mb-1">"{data.exampleSentenceOriginal}"</p>
                <p className="text-[10px] text-gray-500 font-semibold">{data.exampleSentenceTranslated}</p>
            </div>
        </div>

      </div>
    </div>
  );
};