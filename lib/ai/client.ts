import { GoogleGenAI } from "@google/genai";
import { z, type ZodType } from "zod";

interface StructuredPromptOptions<T> {
  name: string;
  prompt: string;
  jsonSchema: Record<string, unknown>;
  outputSchema: ZodType<T>;
  fallback: () => Promise<T> | T;
}

let cachedClient: GoogleGenAI | null = null;

const DEFAULT_MODEL = "gemini-1.5-flash";

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey });
  }
  return cachedClient;
}

/**
 * Strip markdown code fence around JSON if present (e.g. ```json ... ```).
 */
function extractJson(text: string): string {
  const trimmed = text.trim();
  const fence = trimmed.startsWith("```");
  if (fence) {
    const end = trimmed.indexOf("```", 3);
    const body = end === -1 ? trimmed.slice(3) : trimmed.slice(3, end);
    return body.trim();
  }
  return trimmed;
}

const GEMINI_TIMEOUT_MS = 20_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    )
  ]);
}

export async function runStructuredPrompt<T>({
  name,
  prompt,
  jsonSchema,
  outputSchema,
  fallback
}: StructuredPromptOptions<T>): Promise<T> {
  const client = getGeminiClient();
  if (!client) {
    return fallback();
  }

  const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;

  try {
    const response = await withTimeout(
      client.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: jsonSchema
        }
      }),
      GEMINI_TIMEOUT_MS,
      `Gemini ${name}`
    );

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    const raw = extractJson(text);
    const parsed = JSON.parse(raw) as unknown;
    return outputSchema.parse(parsed);
  } catch (error) {
    console.warn(`Structured AI fallback triggered for ${name}`, error);
    return fallback();
  }
}

export const jsonSchemaBuilders = {
  stringArray(name: string) {
    return {
      type: "object",
      additionalProperties: false,
      required: [name],
      properties: {
        [name]: {
          type: "array",
          items: {
            type: "string"
          }
        }
      }
    };
  }
};

export { z };
