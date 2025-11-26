import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { LanguageSelect } from './components/LanguageSelect';
import { Button } from './components/Button';
import { ResultCard } from './components/ResultCard';
import { Notebook } from './components/Notebook';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { translateText, generateContextImage, generateSpeech } from './services/geminiService';
import { TranslationResponse, LANGUAGES, HistoryItem } from './types';
import { Mic, ArrowRight, X, Loader2, Volume2 } from 'lucide-react';

// Helper to decode and play base64 audio
const playAudioData = async (base64String: string) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // 1. Decode Base64 string to binary bytes
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 2. Convert Raw PCM (Int16) to AudioBuffer (Float32)
    // Gemini TTS returns 24kHz, Mono (1 channel), 16-bit PCM
    const int16Data = new Int16Array(bytes.buffer);
    const sampleRate = 24000;
    const numChannels = 1;
    
    const audioBuffer = audioContext.createBuffer(numChannels, int16Data.length, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    
    for (let i = 0; i < int16Data.length; i++) {
      // Normalize 16-bit integer (-32768 to 32767) to Float32 (-1.0 to 1.0)
      channelData[i] = int16Data[i] / 32768.0;
    }

    // 3. Resume context if suspended (common in browsers requiring user gesture)
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
  } catch (e) {
    console.error("Audio playback error", e);
  }
};

const App: React.FC = () => {
  const [sourceLang, setSourceLang] = useState('en-US');
  const [targetLang, setTargetLang] = useState('fr');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TranslationResponse | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTalking, setIsTalking] = useState(false); // New state for TTS loading
  const [error, setError] = useState<string | null>(null);
  
  // View State
  const [showNotebook, setShowNotebook] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'default' | 'result'>('default');
  
  // Data Storage
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<HistoryItem[]>([]);

  // Speech Hook
  const { isListening, transcript, startListening, stopListening, supported, resetTranscript } = useSpeechRecognition(sourceLang);

  // Load data on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('lingopop_history');
    const savedFavorites = localStorage.getItem('lingopop_favorites');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  // Sync transcript to input text
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // Helper to check if current result is favorited
  const isCurrentFavorite = () => {
    if (!result) return false;
    return favorites.some(f => f.sourceText === inputText && f.data.standardTranslation === result.standardTranslation);
  };

  const handleTranslate = async (e?: React.MouseEvent) => {
    // Stop propagation so the container onClick doesn't immediately reset layout to default
    if (e) e.stopPropagation();

    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setGeneratedImage(null);
    setShowNotebook(false); 
    setLayoutMode('result'); // Expand the result view

    try {
      const sourceLangName = LANGUAGES.find(l => l.code === sourceLang)?.name || 'English';
      const targetLangName = LANGUAGES.find(l => l.code === targetLang)?.name || 'Target Language';
      
      const translationData = await translateText(inputText, sourceLangName, targetLangName);
      setResult(translationData);

      // Generate Image
      if (translationData.visualPrompt) {
        generateContextImage(translationData.visualPrompt).then(img => {
            setGeneratedImage(img);
            saveToHistory(inputText, sourceLang, targetLang, translationData, img);
        });
      } else {
        saveToHistory(inputText, sourceLang, targetLang, translationData, null);
      }

    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check your API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveToHistory = (text: string, sLang: string, tLang: string, data: TranslationResponse, img: string | null) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      sourceText: text,
      sourceLang: sLang,
      targetLang: tLang,
      data: data,
      image: img,
      isFavorite: false
    };
    
    const updatedHistory = [newItem, ...history.filter(h => h.sourceText !== text)].slice(0, 50); 
    setHistory(updatedHistory);
    localStorage.setItem('lingopop_history', JSON.stringify(updatedHistory));
  };

  const handleToggleFavorite = () => {
    if (!result) return;
    
    const existingIndex = favorites.findIndex(f => f.sourceText === inputText && f.data.standardTranslation === result.standardTranslation);
    let newFavorites;
    
    if (existingIndex >= 0) {
      newFavorites = favorites.filter((_, i) => i !== existingIndex);
    } else {
      const historyItem = history.find(h => h.sourceText === inputText) || {
         id: Date.now().toString(),
         timestamp: Date.now(),
         sourceText: inputText,
         sourceLang: sourceLang,
         targetLang: targetLang,
         data: result,
         image: generatedImage,
         isFavorite: true
      };
      newFavorites = [{ ...historyItem, isFavorite: true }, ...favorites];
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('lingopop_favorites', JSON.stringify(newFavorites));
    
    const updatedHistory = history.map(h => {
        if (h.sourceText === inputText) return { ...h, isFavorite: existingIndex < 0 };
        return h;
    });
    setHistory(updatedHistory);
    localStorage.setItem('lingopop_history', JSON.stringify(updatedHistory));
  };

  const handleNotebookToggleFavorite = (item: HistoryItem) => {
    const isFav = favorites.some(f => f.id === item.id);
    let newFavorites;
    
    if (isFav) {
       newFavorites = favorites.filter(f => f.id !== item.id);
    } else {
       newFavorites = [{ ...item, isFavorite: true }, ...favorites];
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('lingopop_favorites', JSON.stringify(newFavorites));

    const updatedHistory = history.map(h => h.id === item.id ? { ...h, isFavorite: !isFav } : h);
    setHistory(updatedHistory);
    localStorage.setItem('lingopop_history', JSON.stringify(updatedHistory));
  };

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('lingopop_history', JSON.stringify(updated));
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setInputText(item.sourceText);
    setResult(item.data);
    setGeneratedImage(item.image);
    setShowNotebook(false);
    setLayoutMode('result');
  };

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setResult(null);
    setGeneratedImage(null);
    setInputText('');
    resetTranscript();
    setLayoutMode('default');
  };

  const handleSpeak = async (text: string) => {
    if (isTalking) return;
    setIsTalking(true);
    try {
      const audioData = await generateSpeech(text);
      if (audioData) {
        await playAudioData(audioData);
      }
    } catch (e) {
      console.error("TTS failed", e);
    } finally {
      setIsTalking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-gray-900 pb-20 selection:bg-indigo-100 font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-400/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-400/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10">
        <Header onToggleNotebook={() => setShowNotebook(!showNotebook)} isNotebookOpen={showNotebook} />

        <main className="max-w-[90rem] mx-auto px-4 md:px-8 mt-4 md:mt-6">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 transition-all duration-700 ease-in-out">
            
            {/* Left Column: Input */}
            {/* Added onClick to handle layout resizing when user interacts with this side */}
            <div 
              onClick={() => setLayoutMode('default')}
              className={`
                flex-col gap-4 md:gap-6 space-y-4 md:space-y-6 transition-all duration-700 ease-in-out cursor-default
                ${layoutMode === 'result' && !showNotebook ? 'lg:w-[25%] opacity-90' : 'lg:w-1/2'}
                ${showNotebook ? 'hidden lg:flex lg:w-1/2' : 'flex w-full'}
              `}
            >
              
              {/* Language Controls */}
              {/* Dynamic flex-direction: Stacks vertically when in 'result' mode (shrunk) to avoid overlapping */}
              <div className={`relative z-30 flex items-center gap-2 md:gap-4 bg-white/70 p-2 rounded-3xl backdrop-blur-xl shadow-sm border border-white/60 transition-all
                  ${layoutMode === 'result' ? 'flex-col' : 'flex-col md:flex-row'}
              `}>
                <LanguageSelect selected={sourceLang} onChange={setSourceLang} />
                
                <button 
                  onClick={(e) => {
                      e.stopPropagation();
                      handleSwapLanguages();
                  }}
                  className={`p-2 md:p-3 rounded-full hover:bg-white text-gray-500 hover:text-blue-600 transition-all active:rotate-180 shadow-sm hover:shadow-md bg-white/50
                      ${layoutMode === 'result' ? 'rotate-90' : 'rotate-90 md:rotate-0'}
                  `}
                >
                  <ArrowRight size={18} className="md:w-5 md:h-5" />
                </button>
                
                <LanguageSelect selected={targetLang} onChange={setTargetLang} />
              </div>

              {/* Input Area */}
              <div 
                 className={`
                    bg-white/80 rounded-3xl p-4 md:p-6 shadow-2xl shadow-indigo-500/5 border border-white/60 flex flex-col relative transition-all duration-500 backdrop-blur-lg
                    ${layoutMode === 'result' ? 'min-h-[150px] md:min-h-[200px]' : 'min-h-[220px] md:min-h-[300px]'}
                    focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:bg-white
                 `}
              >
                <textarea
                  className="flex-1 w-full bg-transparent resize-none outline-none text-xl md:text-2xl font-medium text-gray-800 placeholder-gray-300 leading-relaxed"
                  placeholder="Type something..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onFocus={() => setLayoutMode('default')} // Reset layout on focus
                  onKeyDown={(e) => {
                      if(e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleTranslate(e as any);
                      }
                  }}
                />
                
                {inputText && (
                    <button 
                        onClick={(e) => { 
                            e.stopPropagation();
                            setInputText(''); 
                            resetTranscript(); 
                            setLayoutMode('default'); 
                        }}
                        className="absolute top-6 right-6 text-gray-300 hover:text-gray-500 transition-colors"
                    >
                        <X size={24} />
                    </button>
                )}

                <div className={`flex ${layoutMode === 'result' ? 'flex-col gap-4' : 'items-center justify-between'} mt-3 pt-3 md:mt-6 md:pt-4 border-t border-gray-100/50 transition-all`}>
                  <div className={`flex gap-2 ${layoutMode === 'result' ? 'w-full justify-center' : ''}`}>
                     {supported && (
                         <button
                           onClick={(e) => {
                               e.stopPropagation();
                               isListening ? stopListening() : startListening();
                           }}
                           className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 font-medium ${
                             isListening 
                               ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse scale-105' 
                               : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                           } ${layoutMode === 'result' ? 'flex-1' : ''}`}
                           title="Voice Input"
                         >
                           <Mic size={20} />
                           <span className={`text-sm ${layoutMode === 'result' ? 'hidden' : 'hidden md:inline'}`}>{isListening ? 'Listening...' : 'Voice'}</span>
                         </button>
                     )}
                     
                     {/* Listen Button for Input Text */}
                     {inputText && (
                        <button
                          onClick={(e) => {
                              e.stopPropagation();
                              handleSpeak(inputText);
                          }}
                          disabled={isTalking}
                          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${layoutMode === 'result' ? 'flex-1' : ''}`}
                          title="Listen"
                        >
                          {isTalking ? <Loader2 size={20} className="animate-spin" /> : <Volume2 size={20} />}
                          <span className={`text-sm ${layoutMode === 'result' ? 'hidden' : 'hidden md:inline'}`}>Listen</span>
                        </button>
                     )}
                  </div>
                  {/* Translate Button */}
                  <Button 
                    onClick={handleTranslate} 
                    isLoading={isLoading} 
                    disabled={!inputText.trim()}
                    className={layoutMode === 'result' ? 'w-full' : ''}
                  >
                    Translate
                  </Button>
                </div>
              </div>
              
              {error && (
                <div className="p-4 bg-red-50/80 backdrop-blur text-red-600 rounded-2xl text-sm text-center border border-red-100 shadow-sm">
                    {error}
                </div>
              )}

            </div>

            {/* Right Column: Result or Notebook */}
            {/* Added onClick to expand this side when interacted with */}
            <div 
              onClick={() => setLayoutMode('result')}
              className={`
                 relative z-10 min-h-[400px] transition-all duration-700 ease-in-out cursor-default
                 ${layoutMode === 'result' && !showNotebook ? 'lg:w-[75%]' : 'lg:w-1/2'}
                 ${showNotebook ? 'w-full lg:w-1/2' : 'w-full'}
              `}
            >
               {showNotebook ? (
                  <Notebook 
                     history={history} 
                     favorites={favorites}
                     onSelect={handleSelectHistoryItem}
                     onDelete={deleteHistoryItem}
                     onToggleFavorite={handleNotebookToggleFavorite}
                  />
               ) : (
                  <div className="h-full">
                    <ResultCard 
                        data={result} 
                        image={generatedImage} 
                        isLoading={isLoading} 
                        isFavorite={isCurrentFavorite()}
                        onSpeak={handleSpeak}
                        onToggleFavorite={handleToggleFavorite}
                    />
                    {isTalking && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium animate-fadeIn z-50">
                            <Loader2 size={16} className="animate-spin" />
                            Generating Voice...
                        </div>
                    )}
                  </div>
               )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default App;