import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, apiKey, systemPrompt, userMessage, targetLanguage, action } = body;

    if (!apiKey?.trim()) {
      return NextResponse.json({ success: false, error: 'API key is required' }, { status: 400 });
    }

    let resultText = '';

    // 1. Google Gemini Provider
    if (provider === 'gemini') {
      resultText = await callGeminiServer(apiKey, systemPrompt, userMessage);
    }
    // 2. OpenAI Provider
    else if (provider === 'openai') {
      resultText = await callOpenAIServer(apiKey, systemPrompt, userMessage);
    }
    // 3. Anthropic Claude Provider
    else if (provider === 'claude') {
      resultText = await callClaudeServer(apiKey, systemPrompt, userMessage);
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported provider' }, { status: 400 });
    }

    return NextResponse.json({ success: true, result: resultText.trim(), provider });
  } catch (error: any) {
    console.error('[API /api/ai] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'AI generation failed' },
      { status: 500 }
    );
  }
}

async function callGeminiServer(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  // Try latest Gemini models in order of performance and availability
  const geminiModels = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite-preview-02-05',
    'gemini-2.0-flash-thinking-exp-01-21',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'gemini-pro',
  ];

  let lastError = '';

  for (const model of geminiModels) {
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
        if (text && text.trim()) return text.trim();
      } else {
        const err = await response.json().catch(() => ({}));
        lastError = err?.error?.message || `Status ${response.status} on ${model}`;
      }
    } catch (e: any) {
      lastError = e?.message || 'Connection error';
    }
  }

  // Also try v1 endpoint if v1beta fails
  try {
    const v1Url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(v1Url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userMessage}` }],
          },
        ],
      }),
    });
    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim()) return text.trim();
    }
  } catch {}

  throw new Error(lastError || 'Google Gemini API request failed. Please verify your API key in Google AI Studio.');
}

async function callOpenAIServer(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const models = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'];
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
        if (text && text.trim()) return text.trim();
      } else {
        const err = await response.json().catch(() => ({}));
        lastError = err?.error?.message || `OpenAI status ${response.status}`;
      }
    } catch (e: any) {
      lastError = e?.message || 'OpenAI network error';
    }
  }

  throw new Error(lastError || 'OpenAI API request failed.');
}

async function callClaudeServer(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const models = ['claude-3-7-sonnet-20250219', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'];
  let lastError = '';

  for (const model of models) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
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
        if (text && text.trim()) return text.trim();
      } else {
        const err = await response.json().catch(() => ({}));
        lastError = err?.error?.message || `Claude status ${response.status}`;
      }
    } catch (e: any) {
      lastError = e?.message || 'Claude network error';
    }
  }

  throw new Error(lastError || 'Anthropic Claude API request failed.');
}
