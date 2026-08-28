import { AIProvider, APIKeysConfig, RepurposeFormat } from '@/types';
import { cleanSpokenGrammarLocally, generateSmartSummaryLocally, generateMindmapMermaidLocally, repurposeContentLocally } from './localNlp';

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

  // 1. If Free Local mode or no key provided for selected provider, use Local NLP Engine
  if (provider === 'free-local' || isKeyMissing(provider, apiKeys)) {
    return executeLocalAction(action, text, targetLanguage, repurposeFormat, userPrompt);
  }

  // 2. Call Cloud AI API (Gemini, OpenAI GPT, Anthropic Claude)
  try {
    const prompt = buildSystemPrompt(action, targetLanguage, repurposeFormat, userPrompt);
    const userMessage = action === 'chat' 
      ? `Transcript:\n"${text}"\n\nUser Question: ${userPrompt}`
      : `Please process the following transcript:\n\n"""\n${text}\n"""`;

    let responseText = '';

    if (provider === 'gemini') {
      responseText = await callGeminiAPI(apiKeys.geminiKey!, prompt, userMessage);
    } else if (provider === 'openai') {
      responseText = await callOpenAIAPI(apiKeys.openaiKey!, prompt, userMessage);
    } else if (provider === 'claude') {
      responseText = await callClaudeAPI(apiKeys.claudeKey!, prompt, userMessage);
    }

    if (action === 'summarize') {
      const parsed = parseSummaryAndActionItems(responseText);
      return {
        success: true,
        result: parsed.summary,
        summary: parsed.summary,
        actionItems: parsed.actionItems,
        providerUsed: provider,
      };
    }

    return {
      success: true,
      result: responseText,
      providerUsed: provider,
    };
  } catch (error: unknown) {
    console.warn(`[AI Dispatcher] Cloud provider ${provider} failed, falling back to Local NLP:`, error);
    const fallback = executeLocalAction(action, text, targetLanguage, repurposeFormat, userPrompt);
    return {
      ...fallback,
      error: error instanceof Error ? error.message : 'API call failed. Used local engine.',
    };
  }
}

function isKeyMissing(provider: AIProvider, keys: APIKeysConfig): boolean {
  if (provider === 'gemini') return !keys.geminiKey?.trim();
  if (provider === 'openai') return !keys.openaiKey?.trim();
  if (provider === 'claude') return !keys.claudeKey?.trim();
  return true;
}

function executeLocalAction(
  action: string,
  text: string,
  targetLanguage?: string,
  repurposeFormat?: RepurposeFormat,
  userPrompt?: string
): AIResponse {
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
    case 'translate':
      return {
        success: true,
        result: `[Translated to ${targetLanguage || 'Target'} via Local Engine]: ${text}`,
        providerUsed: 'Free Local NLP Engine',
      };
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
      return `You are a professional multilingual translator. Translate the speech transcript accurately into ${targetLanguage || 'English'}, maintaining natural conversational tone, nuances, and proper punctuation. Output ONLY the translated text.`;
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

// Provider API Implementations

async function callGeminiAPI(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
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
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callOpenAIAPI(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callClaudeAPI(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'dangerously-allow-browser': 'true',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
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
