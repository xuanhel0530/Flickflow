export enum TranslationMode {
  Standard = 'Standard',
  Slang = 'Slang'
}

export interface TranslationResponse {
  standardTranslation: string;
  definition: string; // New field
  slangTranslation: string;
  culturalContext: string;
  slangExplanation: string;
  exampleSentenceOriginal: string;
  exampleSentenceTranslated: string;
  visualPrompt: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  sourceText: string;
  sourceLang: string;
  targetLang: string;
  data: TranslationResponse;
  image: string | null;
  isFavorite: boolean;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'zh', name: 'Chinese (Mandarin)', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese (BR)', flag: '🇧🇷' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
];