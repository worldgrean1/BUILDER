import { settingsStore } from '@/features/settings/settingsStore';
import type { CreatorNode } from '@/features/creator/types';

/* ── Types ─────────────────────────────────────── */

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

export type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

export interface GeminiCandidate {
  content: { parts: { text?: string }[] };
  finishReason: string;
}

export interface GeminiResponse {
  candidates?: GeminiCandidate[];
  error?: { message: string; code: number };
}

/** Simplified node shape the LLM is asked to generate */
export interface AINodePayload {
  type: CreatorNode['type'];
  name: string;
  layout: { x: number; y: number; width: number; height: number };
  style?: Partial<CreatorNode['style']>;
  content?: Partial<CreatorNode['content']>;
  children?: AINodePayload[];
}

/* ── System prompt ─────────────────────────────── */

const SYSTEM_PROMPT = `You are a UI generation assistant for a visual design engine called BOLD Creator.

When the user asks you to create or modify UI elements, respond with ONLY a JSON object (no markdown fences, no explanation). The JSON must follow this exact schema:

{
  "action": "insert" | "update",
  "nodes": [
    {
      "type": "frame" | "section" | "container" | "card" | "text" | "button" | "image" | "threeD" | "embed",
      "name": "string",
      "layout": { "x": number, "y": number, "width": number, "height": number },
      "style": { optional style overrides },
      "content": { "text": "string", "src": "url", "alt": "string" },
      "children": [ ...nested nodes ]
    }
  ],
  "targetNodeId": "string or null (for update action, the node to modify)",
  "description": "brief human readable description of what was generated"
}

Style properties available: fill, stroke, strokeWidth, rotation, radius, opacity, shadow, color, fontSize, fontWeight, letterSpacing, lineHeight, textAlign, paddingTop, paddingRight, paddingBottom, paddingLeft.

Design system tokens: use "hsl(var(--brand))" for brand color (red), "hsl(var(--surface-1))" for surfaces, "hsl(var(--text-primary))" for text.

For conversational replies (greetings, questions, clarifications), respond with:
{ "action": "reply", "message": "your response text" }

Always generate production-quality, visually appealing layouts. Use realistic content, not placeholder text.`;

/* ── API call ──────────────────────────────────── */

export async function callGemini(
  history: GeminiMessage[],
  userParts: GeminiPart[],
): Promise<{ text: string; error?: string }> {
  const { apiKey, aiModel } = settingsStore.getState();

  if (!apiKey) {
    return { text: '', error: 'No API key configured. Open Settings to add your Gemini key.' };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${apiKey}`;

  const contents: GeminiMessage[] = [
    ...history,
    { role: 'user', parts: userParts },
  ];

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({})) as GeminiResponse;
      return {
        text: '',
        error: errBody.error?.message ?? `API error ${response.status}`,
      };
    }

    const data = (await response.json()) as GeminiResponse;
    const candidate = data.candidates?.[0];
    if (!candidate) return { text: '', error: 'No response from model.' };

    const text = candidate.content.parts.map((p) => p.text ?? '').join('');
    return { text };
  } catch (err) {
    return { text: '', error: `Network error: ${(err as Error).message}` };
  }
}

/* ── Image helpers ─────────────────────────────── */

export function fileToBase64(file: File): Promise<{ mimeType: string; data: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve({ mimeType: file.type, data: base64 });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ── Parse AI response ─────────────────────────── */

export interface ParsedAIResponse {
  action: 'insert' | 'update' | 'reply';
  nodes?: AINodePayload[];
  targetNodeId?: string | null;
  message?: string;
  description?: string;
}

export function parseAIResponse(raw: string): ParsedAIResponse | null {
  try {
    // Strip markdown code fences if present
    let cleaned = raw.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
    }
    const parsed = JSON.parse(cleaned) as ParsedAIResponse;
    if (!parsed.action) return null;
    return parsed;
  } catch {
    // If it's not JSON, treat it as a conversational reply
    return { action: 'reply', message: raw };
  }
}
