import { GoogleGenAI, Modality, Part } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash-image';

const extractImageData = (response: any): { base64: string; mimeType: string } | null => {
    const part = response?.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData) {
        return {
            base64: part.inlineData.data,
            mimeType: part.inlineData.mimeType,
        };
    }
    return null;
}

export async function generateLogo(description: string): Promise<{ base64: string; mimeType: string }> {
    try {
        const prompt = `A professional, modern, vector logo for '${description}'. Simple, memorable, and on a clean white background. SVG style.`;
        
        const response = await ai.models.generateContent({
            model,
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const imageData = extractImageData(response);
        if (imageData) {
            return imageData;
        } else {
            throw new Error("Invalid response from Gemini API: No image data found.");
        }
    } catch (error) {
        console.error("Error calling Gemini API for logo generation:", error);
        throw new Error("Failed to generate logo from Gemini API.");
    }
}

export async function refineLogo(base64ImageData: string, mimeType: string, feedback: string): Promise<{ base64: string; mimeType: string }> {
    try {
        const imagePart: Part = {
            inlineData: {
                data: base64ImageData,
                mimeType: mimeType,
            },
        };
        const textPart: Part = {
            text: `Refine this logo with the following feedback: "${feedback}"`,
        };

        const response = await ai.models.generateContent({
            model,
            contents: {
                parts: [imagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const imageData = extractImageData(response);
        if (imageData) {
            return imageData;
        } else {
            throw new Error("Invalid response from Gemini API: No refined image data found.");
        }
    } catch (error) {
        console.error("Error calling Gemini API for logo refinement:", error);
        throw new Error("Failed to refine logo from Gemini API.");
    }
}