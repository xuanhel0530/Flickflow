import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { TranslationResponse } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Define the schema for the translation output
const translationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    standardTranslation: { type: Type.STRING, description: "Formal translation." },
    definition: { type: Type.STRING, description: "Dictionary definition." },
    slangTranslation: { type: Type.STRING, description: "Native internet slang/vibe version." },
    culturalContext: { type: Type.STRING, description: "Brief cultural vibe context." },
    slangExplanation: { type: Type.STRING, description: "Explanation of the slang." },
    exampleSentenceOriginal: { type: Type.STRING, description: "Example sentence in target language." },
    exampleSentenceTranslated: { type: Type.STRING, description: "Example sentence translation." },
    visualPrompt: { type: Type.STRING, description: "Visual prompt for image generation." },
  },
  required: ["standardTranslation", "definition", "slangTranslation", "culturalContext", "slangExplanation", "exampleSentenceOriginal", "exampleSentenceTranslated", "visualPrompt"],
};

export const translateText = async (
  text: string, 
  sourceLang: string, 
  targetLang: string
): Promise<TranslationResponse> => {
  if (!apiKey) throw new Error("API Key missing");

  // Optimized prompt for speed
  const prompt = `Translate "${text}" from ${sourceLang} to ${targetLang}. Return JSON.
    1. Standard: Formal.
    2. Definition: Dictionary style.
    3. Slang: Local internet culture/Gen Z vibe.
    4. Context: Cultural nuance.
    5. Example: Using the slang.
    6. Visual: Minimalist image prompt.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: translationSchema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from Gemini");
    
    return JSON.parse(jsonText) as TranslationResponse;
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
};

export const generateContextImage = async (prompt: string): Promise<string | null> => {
  if (!apiKey) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Minimalist flat illustration, soft macaron colors, Apple design: ${prompt}`,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  if (!apiKey) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore has a nice natural tone
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS error:", error);
    return null;
  }
};