import { AIProvider, APIKeysConfig, RepurposeFormat } from '@/types';
import { cleanSpokenGrammarLocally, generateSmartSummaryLocally, generateMindmapMermaidLocally, repurposeContentLocally } from './localNlp';

export interface AIRequestOptions {
  action: 'grammar' | 'summarize' | 'translate' | 'repurpose' | 'mindmap' | 'chat';
  text: string;
  provider: AIProvider;
  apiKeys: APIKeysConfig;
  targetLanguage?: string;
  repurposeFormat?: RepurposeFormat;
  userPrompt?: string; // For Chat with transcript
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

  // 2. Call Cloud AI API (Gemini, Groq, OpenAI, Claude, Grok, Kimi, DeepSeek, OpenRouter)
  try {
    const prompt = buildSystemPrompt(action, targetLanguage, repurposeFormat, userPrompt);
    const userMessage = action === 'chat' 
      ? `Transcript:\n"${text}"\n\nUser Question: ${userPrompt}`
      : `Please process the following transcript:\n\n"""\n${text}\n"""`;

    let responseText = '';

    if (provider === 'gemini') {
      responseText = await callGeminiAPI(apiKeys.geminiKey!, prompt, userMessage);
    } else if (provider === 'groq') {
      responseText = await callGroqAPI(apiKeys.groqKey!, prompt, userMessage);
    } else if (provider === 'openai') {
      responseText = await callOpenAIAPI(apiKeys.openaiKey!, prompt, userMessage);
    } else if (provider === 'claude') {
      responseText = await callClaudeAPI(apiKeys.claudeKey!, prompt, userMessage);
    } else if (provider === 'grok') {
      responseText = await callGrokAPI(apiKeys.grokKey!, prompt, userMessage);
    } else if (provider === 'kimi') {
      responseText = await callKimiAPI(apiKeys.kimiKey!, prompt, userMessage);
    } else if (provider === 'deepseek') {
      responseText = await callDeepSeekAPI(apiKeys.deepseekKey!, prompt, userMessage);
    } else if (provider === 'openrouter') {
      responseText = await callOpenRouterAPI(apiKeys.openrouterKey!, prompt, userMessage);
    }

    return {
      success: true,
      result: responseText,
      providerUsed: provider,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.warn(`[AI Dispatcher] Cloud provider ${provider} failed, falling back to Local Engine:`, errorMessage);
    // Graceful fallback to Local NLP
    const localRes = executeLocalAction(action, text, targetLanguage, repurposeFormat, userPrompt);
    return {
      ...localRes,
      error: `Cloud API note: ${errorMessage}. (Handled smoothly via Free Local Engine)`,
    };
  }
}

function isKeyMissing(provider: AIProvider, keys: APIKeysConfig): boolean {
  switch (provider) {
    case 'gemini': return !keys.geminiKey?.trim();
    case 'groq': return !keys.groqKey?.trim();
    case 'openai': return !keys.openaiKey?.trim();
    case 'claude': return !keys.claudeKey?.trim();
    case 'grok': return !keys.grokKey?.trim();
    case 'kimi': return !keys.kimiKey?.trim();
    case 'deepseek': return !keys.deepseekKey?.trim();
    case 'openrouter': return !keys.openrouterKey?.trim();
    default: return false;
  }
}

function executeLocalAction(
  action: AIRequestOptions['action'], 
  text: string, 
  targetLang?: string, 
  format?: RepurposeFormat,
  userPrompt?: string
): AIResponse {
  switch (action) {
    case 'grammar': {
      const polished = cleanSpokenGrammarLocally(text);
      return { success: true, result: polished, providerUsed: 'Free Local NLP Engine' };
    }
    case 'summarize': {
      const { summary, actionItems, keyPoints } = generateSmartSummaryLocally(text);
      const formatted = `## 🎯 Executive Summary\n${summary}\n\n## 💡 Key Highlights\n${keyPoints.map(p => `• ${p}`).join('\n')}\n\n## ✅ Action Items\n${actionItems.length > 0 ? actionItems.map(a => `- [ ] ${a}`).join('\n') : '- [ ] No open action items.'}`;
      return { success: true, result: formatted, summary, actionItems, providerUsed: 'Free Local NLP Engine' };
    }
    case 'mindmap': {
      const mindmapCode = generateMindmapMermaidLocally(text);
      return { success: true, result: mindmapCode, providerUsed: 'Free Local NLP Engine' };
    }
    case 'repurpose': {
      const repurposed = repurposeContentLocally(text, format || 'email');
      return { success: true, result: repurposed, providerUsed: 'Free Local NLP Engine' };
    }
    case 'translate': {
      // Local translation placeholder / hint
      return { 
        success: true, 
        result: `[Target: ${targetLang || 'Selected Language'}]\n\n${text}\n\n*(Note: For instant neural translation, connect your free Google Gemini or Groq key in Settings!)*`, 
        providerUsed: 'Free Local NLP Engine' 
      };
    }
    case 'chat': {
      return {
        success: true,
        result: `Based on your transcript: "${text.slice(0, 100)}...", ${userPrompt ? `regarding "${userPrompt}": You mentioned several key details above.` : 'I have analyzed your speech notes.'}`,
        providerUsed: 'Free Local NLP Engine'
      };
    }
    default:
      return { success: true, result: text, providerUsed: 'Free Local NLP Engine' };
  }
}

function buildSystemPrompt(action: string, targetLanguage?: string, format?: RepurposeFormat, userPrompt?: string): string {
  switch (action) {
    case 'grammar':
      return 'You are an expert editor. Fix all speech grammar, remove spoken filler words (um, uh, like), add proper punctuation and paragraphs while keeping the speaker\'s exact meaning and voice. Return ONLY the polished text.';
    case 'summarize':
      return 'You are an executive assistant. Generate a structured summary with: 1. Executive Summary, 2. Key Discussion Points (bulleted), 3. Action Items with checkboxes [- ]. Format cleanly in Markdown.';
    case 'translate':
      return `You are a professional multilingual translator. Accurately translate the transcript into ${targetLanguage || 'English'}. Preserve nuance, tone, and formatting. Return ONLY the translation.`;
    case 'mindmap':
      return 'Generate a valid Mermaid.js mindmap diagram representing the core themes and action items of this speech transcript. Output ONLY valid mermaid code starting with "mindmap". Do not wrap in backticks or markdown fences.';
    case 'repurpose':
      return `You are a content strategist. Repurpose the speech into a high-impact ${format || 'email'}. Format with proper headings and layout.`;
    case 'chat':
      return 'You are an AI assistant answering questions about the user\'s recorded speech transcript. Be concise, direct, and refer specifically to what was spoken.';
    default:
      return 'You are an AI assistant helping with voice transcription.';
  }
}

/* ==========================================================================
   Provider API Callers (Client-side Direct Fetch / Edge)
   ========================================================================== */

async function callGeminiAPI(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${userMessage}` }]
        }
      ]
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
}

async function callGroqAPI(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.3,
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response generated.';
}

async function callOpenAIAPI(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.3,
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response generated.';
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
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error (${response.status}): ${errorText}`);
  }
  const data = await response.json();
  return data.content?.[0]?.text || 'No response generated.';
}

async function callGrokAPI(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'grok-2-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    })
  });
  if (!response.ok) throw new Error(`xAI Grok error (${response.status})`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callKimiAPI(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'moonshot-v1-8k',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    })
  });
  if (!response.ok) throw new Error(`Moonshot KIMI error (${response.status})`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callDeepSeekAPI(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    })
  });
  if (!response.ok) throw new Error(`DeepSeek error (${response.status})`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callOpenRouterAPI(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    })
  });
  if (!response.ok) throw new Error(`OpenRouter error (${response.status})`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
