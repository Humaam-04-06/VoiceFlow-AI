import { AIProvider, APIKeysConfig, RepurposeFormat } from '@/types';
import { cleanSpokenGrammarLocally, generateSmartSummaryLocally, generateMindmapMermaidLocally, repurposeContentLocally } from './localNlp';
import { SUPPORTED_LANGUAGES } from '../constants/languages';

export interface AIRequestOptions {
  action: 'grammar' | 'summarize' | 'translate' | 'repurpose' | 'mindmap' | 'chat';
  text: string;
  provider: AIProvider;
  apiKeys: APIKeysConfig;
  targetLanguage?: string;
  repurposeFormat?: RepurposeFormat;
  userPrompt?: string;
  conversationHistory?: Array<{ sender: 'user' | 'ai'; text: string }>;
}

export interface AIResponse {
  success: boolean;
  result: string;
  actionItems?: string[];
  summary?: string;
  providerUsed: string;
  error?: string;
}

export async function dispatchAITask(options: AIRequestOptions): Promise<AIResponse> {
  const { action, text, provider, apiKeys, targetLanguage, repurposeFormat, userPrompt, conversationHistory } = options;

  if (!text.trim() && action !== 'chat') {
    return { success: false, result: '', providerUsed: 'none', error: 'No transcript text provided.' };
  }

  // Determine effective provider: if a key is provided, prefer that cloud provider
  let effectiveProvider: AIProvider = provider;
  if (effectiveProvider === 'free-local') {
    if (apiKeys?.geminiKey?.trim()) effectiveProvider = 'gemini';
    else if (apiKeys?.openaiKey?.trim()) effectiveProvider = 'openai';
    else if (apiKeys?.claudeKey?.trim()) effectiveProvider = 'claude';
  }

  // 1. If Free Local mode or no key provided for selected provider, use Local NLP Engine
  if (effectiveProvider === 'free-local' || isKeyMissing(effectiveProvider, apiKeys)) {
    return await executeLocalAction(action, text, targetLanguage, repurposeFormat, userPrompt);
  }

  // 2. Call Cloud AI API (Gemini 2.5 / 2.0 Flash, OpenAI GPT-4o, Anthropic Claude 3.7 Sonnet)
  try {
    const prompt = buildSystemPrompt(action, targetLanguage, repurposeFormat, userPrompt);
    const userMessage = action === 'chat' 
      ? `Transcript:\n"${text}"\n\nUser Question: ${userPrompt}`
      : action === 'translate'
      ? `Translate the following text into ${targetLanguage}:\n\n"${text}"`
      : `Please process the following transcript:\n\n"""\n${text}\n"""`;

    let responseText = '';

    if (effectiveProvider === 'gemini') {
      responseText = await callGeminiAPI(apiKeys.geminiKey!, prompt, userMessage);
    } else if (effectiveProvider === 'openai') {
      responseText = await callOpenAIAPI(apiKeys.openaiKey!, prompt, userMessage);
    } else if (effectiveProvider === 'claude') {
      responseText = await callClaudeAPI(apiKeys.claudeKey!, prompt, userMessage);
    }

    if (action === 'summarize') {
      const parsed = parseSummaryAndActionItems(responseText);
      return {
        success: true,
        result: parsed.summary,
        summary: parsed.summary,
        actionItems: parsed.actionItems,
        providerUsed: effectiveProvider,
      };
    }

    return {
      success: true,
      result: responseText.trim(),
      providerUsed: effectiveProvider,
    };
  } catch (error: unknown) {
    console.warn(`[AI Dispatcher] Cloud provider ${effectiveProvider} failed, falling back to Local NLP:`, error);
    const fallback = await executeLocalAction(action, text, targetLanguage, repurposeFormat, userPrompt);
    return {
      ...fallback,
      error: error instanceof Error ? error.message : 'API call failed. Used local engine.',
    };
  }
}

function isKeyMissing(provider: AIProvider, keys: APIKeysConfig): boolean {
  if (provider === 'gemini') return !keys?.geminiKey?.trim();
  if (provider === 'openai') return !keys?.openaiKey?.trim();
  if (provider === 'claude') return !keys?.claudeKey?.trim();
  return true;
}

async function executeLocalAction(
  action: string,
  text: string,
  targetLanguage?: string,
  repurposeFormat?: RepurposeFormat,
  userPrompt?: string
): Promise<AIResponse> {
  switch (action) {
    case 'grammar':
      return {
        success: true,
        result: cleanSpokenGrammarLocally(text),
        providerUsed: 'Free Local NLP Engine',
      };
    case 'summarize': {
      const summaryResult = generateSmartSummaryLocally(text);
      return {
        success: true,
        result: summaryResult.summary,
        summary: summaryResult.summary,
        actionItems: summaryResult.actionItems,
        providerUsed: 'Free Local NLP Engine',
      };
    }
    case 'translate': {
      const translated = await translateOnlineFree(text, targetLanguage || 'Urdu');
      return {
        success: true,
        result: translated,
        providerUsed: 'Free Multilingual Translation Engine',
      };
    }
    case 'mindmap':
      return {
        success: true,
        result: generateMindmapMermaidLocally(text),
        providerUsed: 'Free Local NLP Engine',
      };
    case 'repurpose':
      return {
        success: true,
        result: repurposeContentLocally(text, repurposeFormat || 'email'),
        providerUsed: 'Free Local NLP Engine',
      };
    case 'chat':
      return {
        success: true,
        result: `Based on your voice transcript, here is the answer: The transcript discusses "${text.slice(0, 100)}...". Let me know if you need specific details extracted.`,
        providerUsed: 'Free Local NLP Engine',
      };
    default:
      return { success: false, result: text, providerUsed: 'none' };
  }
}

// 100% Free Multilingual Online Translation Service Fallback (Outputs real native Urdu, Arabic, Hindi, Spanish, etc.)
async function translateOnlineFree(text: string, targetLanguage: string): Promise<string> {
  try {
    const langObj = SUPPORTED_LANGUAGES.find(
      l => l.name.toLowerCase() === targetLanguage.toLowerCase() || 
           l.code.toLowerCase() === targetLanguage.toLowerCase() ||
           l.nativeName.toLowerCase() === targetLanguage.toLowerCase()
    );
    const langCode = langObj ? langObj.code.split('-')[0].toLowerCase() : 'ur';
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.[0])) {
        const translated = data[0].map((item: any) => item[0]).filter(Boolean).join('');
        if (translated && translated.trim()) return translated.trim();
      }
    }
  } catch (e) {
    console.warn('[Translate Free Fallback] Error:', e);
  }
  return text;
}

function buildSystemPrompt(
  action: string,
  targetLanguage?: string,
  repurposeFormat?: RepurposeFormat,
  userPrompt?: string
): string {
  switch (action) {
    case 'grammar':
      return 'You are an expert speech editor. Remove verbal tics (um, uh, like, basically), fix grammatical errors, format paragraphs properly with clean punctuation, but strictly preserve the author’s original voice, meaning, and intent. Output ONLY the polished text.';
    case 'summarize':
      return 'You are an executive assistant. Analyze the transcript and provide:\n1. A concise 3-5 bullet executive summary\n2. A bulleted list of clear action items / tasks\nFormat clearly with "## Executive Summary" and "## Action Items".';
    case 'translate':
      return `You are a professional multilingual translator. Translate the speech text accurately and fluently into ${targetLanguage || 'Urdu'}.
CRITICAL REQUIREMENTS:
- Output ONLY the translation in the native script of ${targetLanguage} (e.g. for Urdu use Urdu script اردو, for Arabic use العربية, for Hindi use हिंदी, for Spanish use español).
- Do NOT include notes, comments, pronunciation guides, or quotes. Output ONLY the pure translated sentence.`;
    case 'mindmap':
      return 'You are a visual thinker. Create a clean Mermaid.js mindmap diagram representing the core concepts, sub-themes, and ideas in the transcript. Output ONLY valid Mermaid mindmap code starting with "mindmap".';
    case 'repurpose':
      return `You are a world-class content strategist. Repurpose the speech transcript into a high-impact ${repurposeFormat || 'email'}. Format with proper markdown headings and engaging tone.`;
    case 'chat':
      return 'You are an intelligent AI assistant helping the user understand and explore their recorded voice transcript. Answer questions accurately based strictly on the provided transcript context.';
    default:
      return 'You are a helpful AI assistant.';
  }
}

// Latest Flagship Model Implementations with Multi-Tier Fallback

async function callGeminiAPI(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError = '';

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n${userMessage}` }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      } else {
        const err = await response.json().catch(() => ({}));
        lastError = err?.error?.message || `Gemini API status ${response.status}`;
      }
    } catch (e: any) {
      lastError = e?.message || 'Network error';
    }
  }

  throw new Error(lastError || 'Gemini API failed');
}

async function callOpenAIAPI(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const models = ['gpt-4o', 'gpt-4o-mini'];
  let lastError = '';

  for (const model of models) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.2,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text.trim();
      } else {
        const err = await response.json().catch(() => ({}));
        lastError = err?.error?.message || `OpenAI API status ${response.status}`;
      }
    } catch (e: any) {
      lastError = e?.message || 'Network error';
    }
  }

  throw new Error(lastError || 'OpenAI API failed');
}

async function callClaudeAPI(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const models = ['claude-3-7-sonnet-20250219', 'claude-3-5-sonnet-20241022'];
  let lastError = '';

  for (const model of models) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'dangerously-allow-browser': 'true',
        },
        body: JSON.stringify({
          model,
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.content?.[0]?.text;
        if (text) return text.trim();
      } else {
        const err = await response.json().catch(() => ({}));
        lastError = err?.error?.message || `Claude API status ${response.status}`;
      }
    } catch (e: any) {
      lastError = e?.message || 'Network error';
    }
  }

  throw new Error(lastError || 'Claude API failed');
}

function parseSummaryAndActionItems(text: string): { summary: string; actionItems: string[] } {
  const actionItems: string[] = [];
  const lines = text.split('\n');
  let isActionSection = false;

  lines.forEach(line => {
    if (line.toLowerCase().includes('action item') || line.toLowerCase().includes('tasks:')) {
      isActionSection = true;
    } else if (isActionSection && (line.trim().startsWith('-') || line.trim().startsWith('*') || /^\d+\./.test(line.trim()))) {
      actionItems.push(line.replace(/^[-*\d.]+\s*/, '').trim());
    }
  });

  return {
    summary: text,
    actionItems: actionItems.length > 0 ? actionItems : ['Review transcript points', 'Follow up on action items'],
  };
}
