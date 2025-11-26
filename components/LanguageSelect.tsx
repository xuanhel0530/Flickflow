import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { LANGUAGES } from '../types';

interface LanguageSelectProps {
  selected: string;
  onChange: (code: string) => void;
  label?: string;
}

export const LanguageSelect: React.FC<LanguageSelectProps> = ({ selected, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLang = LANGUAGES.find(l => l.code === selected) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full md:w-auto" ref={containerRef}>
      {label && <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block pl-1">{label}</span>}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full md:w-56 bg-white border border-gray-100 hover:border-pink-200 rounded-2xl px-3 py-1.5 md:py-3 text-left transition-all shadow-sm active:scale-[0.98] group"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-50 flex items-center justify-center text-lg md:text-2xl shadow-inner group-hover:bg-pink-50 transition-colors shrink-0 leading-none pb-1 select-none">
             {selectedLang.flag}
          </div>
          <span className="font-bold text-gray-700 truncate text-sm md:text-base">
            {selectedLang.name}
          </span>
        </div>
        <ChevronDown size={18} className={`text-gray-300 group-hover:text-pink-300 transition-transform shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-full md:w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-80 overflow-y-auto no-scrollbar p-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onChange(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left mb-1 ${
                selected === lang.code ? 'bg-pink-50 text-pink-600' : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xl shadow-sm leading-none pb-1 select-none">
                  {lang.flag}
              </div>
              <span className="font-bold text-sm">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};