import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('file') as Blob | null;
    const language = (formData.get('language') as string) || 'en';
    const apiKey = (formData.get('apiKey') as string) || '';
    const provider = (formData.get('provider') as string) || 'groq';

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided.' }, { status: 400 });
    }

    const langCode = language.split('-')[0]; // e.g. "en-US" -> "en"

    // 1. If Groq API key is present or using Groq Whisper
    const groqKey = apiKey || process.env.GROQ_API_KEY;
    if (groqKey && (provider === 'groq' || !apiKey)) {
      const groqFormData = new FormData();
      groqFormData.append('file', audioFile, 'audio.webm');
      groqFormData.append('model', 'whisper-large-v3');
      groqFormData.append('language', langCode);
      groqFormData.append('response_format', 'verbose_json');

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
        },
        body: groqFormData,
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          text: data.text || '',
          segments: data.segments || [],
          provider: 'Groq Whisper Large-v3',
        });
      }
    }

    // 2. If OpenAI API key is provided
    if (apiKey && provider === 'openai') {
      const openAiFormData = new FormData();
      openAiFormData.append('file', audioFile, 'audio.webm');
      openAiFormData.append('model', 'whisper-1');
      openAiFormData.append('language', langCode);

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: openAiFormData,
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          text: data.text || '',
          provider: 'OpenAI Whisper-1',
        });
      }
    }

    return NextResponse.json({
      error: 'Speech recognition engine needs microphone stream or API key.',
    }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Transcription failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
