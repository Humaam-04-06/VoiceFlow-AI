import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get('text');
  const lang = searchParams.get('lang') || 'en';

  if (!text || !text.trim()) {
    return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
  }

  // Extract primary language code
  let langCode = lang.split('-')[0].toLowerCase();
  if (lang.toLowerCase().includes('pk') || lang.toLowerCase() === 'ur') {
    langCode = 'ur';
  } else if (lang.toLowerCase().includes('in') || lang.toLowerCase() === 'hi') {
    langCode = 'hi';
  }

  const cleanText = text.replace(/\[Translated.*?\]:\s*/gi, '').slice(0, 500);

  // Try Google Chrome Extension TTS endpoint (Supports Urdu 'ur', Hindi 'hi', Arabic 'ar', etc.)
  try {
    const googleTTSUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${langCode}&total=1&idx=0&textlen=${cleanText.length}&client=dict-chrome-ex`;
    
    const response = await fetch(googleTTSUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
    });

    if (response.ok) {
      const audioBuffer = await response.arrayBuffer();
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
  } catch (e) {
    console.warn('[API /api/tts] Primary Google TTS failed:', e);
  }

  // Fallback: tw-ob client endpoint
  try {
    const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
    const response = await fetch(fallbackUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    if (response.ok) {
      const audioBuffer = await response.arrayBuffer();
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
  } catch (e) {
    console.warn('[API /api/tts] Fallback TTS failed:', e);
  }

  return NextResponse.json({ error: 'TTS generation failed' }, { status: 500 });
}
