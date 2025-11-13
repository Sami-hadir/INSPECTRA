
import { GoogleGenAI, Type } from "@google/genai";
import type { Product } from '../types';

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export const analyzeImageForProducts = async (base64Image: string, mimeType: string): Promise<Product[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API key not found. Please set the API_KEY environment variable.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = fileToGenerativePart(base64Image, mimeType);
  const prompt = `
אתה מומחה בזיהוי מוצרים מתמונות. התבונן בתמונה שסופקה וזהה את כל המוצרים הנראים לעין.
עבור כל מוצר, ספק את הפרטים הבאים:
1. 'name': שם המוצר.
2. 'description': תיאור קצר של המוצר.
3. 'hasWarning': ערך בוליאני (true/false) המציין אם יש על המוצר אזהרה כלשהי (כגון אזהרת בריאות, סימן אדום, אזהרת אלרגיה, וכו').
4. 'warningDetails': אם 'hasWarning' הוא true, ציין כאן את פרטי האזהרה. אם אין אזהרה, השאר את השדה הזה ריק ("").

החזר את התוצאות במבנה JSON בלבד, כרשימה של אובייקטים.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              hasWarning: { type: Type.BOOLEAN },
              warningDetails: { type: Type.STRING },
            },
            required: ["name", "description", "hasWarning", "warningDetails"],
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const products: Product[] = JSON.parse(jsonText);
    return products;
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw new Error("לא הצלחנו לנתח את התמונה. אנא נסה שוב.");
  }
};
