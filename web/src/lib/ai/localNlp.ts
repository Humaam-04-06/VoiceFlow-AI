import { RepurposeFormat } from '@/types';

/**
 * 100% Free Client-Side NLP Engine
 * Performs intelligent grammar cleaning, filler word elimination,
 * bullet-point summarization, action item detection, and Mindmap graph creation
 * directly in browser memory without sending data to any server.
 */

// Common spoken filler words and verbal tics
const FILLER_PATTERNS = [
  /\b(um+h?|uh+h?|er+h?|ah+h?)\b/gi,
  /\b(you know what I mean|you know|you see)\b/gi,
  /\b(like,\s*like|like)\b(?=\s+[a-z])/gi,
  /\b(basically|literally|honestly|obviously|actually)\b(?=,?\s+)/gi,
  /\b(so yeah|yeah so|sort of|kind of)\b/gi,
  /\b(\w+)\s+\1\b/gi, // Repeated words (e.g. "the the", "I I")
];

export function cleanSpokenGrammarLocally(rawText: string): string {
  if (!rawText || !rawText.trim()) return '';

  let cleaned = rawText.trim();

  // 1. Remove filler words
  FILLER_PATTERNS.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // 2. Clean multiple spaces and dangling commas
  cleaned = cleaned
    .replace(/\s+/g, ' ')
    .replace(/\s+,/g, ',')
    .replace(/,\s*,/g, ',')
    .replace(/\s+\./g, '.')
    .replace(/\.\s*\./g, '.')
    .trim();

  // 3. Sentence capitalization & punctuation
  const sentences = cleaned.split(/(?<=[.?!])\s+/);
  const fixedSentences = sentences.map(sentence => {
    const s = sentence.trim();
    if (!s) return '';
    // Capitalize first letter
    const capitalized = s.charAt(0).toUpperCase() + s.slice(1);
    // Ensure terminal punctuation
    if (!/[.?!]$/.test(capitalized)) {
      return capitalized + '.';
    }
    return capitalized;
  }).filter(Boolean);

  // Group into readable paragraphs of 3-4 sentences
  const paragraphs: string[] = [];
  for (let i = 0; i < fixedSentences.length; i += 3) {
    paragraphs.push(fixedSentences.slice(i, i + 3).join(' '));
  }

  return paragraphs.join('\n\n');
}

export function generateSmartSummaryLocally(text: string): { summary: string; actionItems: string[]; keyPoints: string[] } {
  if (!text || !text.trim()) {
    return { summary: '', actionItems: [], keyPoints: [] };
  }

  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);

  if (sentences.length === 0) {
    return { summary: text, actionItems: [], keyPoints: [] };
  }

  // Detect Action items using modal verbs & keywords
  const actionKeywords = /\b(need to|must|will|should|have to|going to|action|todo|task|deadline|assign|follow up|schedule|deliver|send|prepare)\b/i;
  const actionItems: string[] = [];
  const keyPoints: string[] = [];

  sentences.forEach((sentence) => {
    if (actionKeywords.test(sentence)) {
      actionItems.push(sentence.replace(/^[,\s-]+/, ''));
    } else if (sentence.length > 25 && keyPoints.length < 5) {
      keyPoints.push(sentence.replace(/^[,\s-]+/, ''));
    }
  });

  // If no explicit action items found, generate from first/last sentences
  const firstSentence = sentences[0] || '';
  const middleSentence = sentences[Math.floor(sentences.length / 2)] || '';
  const lastSentence = sentences[sentences.length - 1] || '';

  const executiveSummary = sentences.length <= 2 
    ? sentences.join(' ')
    : `${firstSentence} In summary, ${middleSentence.toLowerCase().replace(/^[a-z]/, c => c.toUpperCase())} ${lastSentence !== middleSentence ? lastSentence : ''}`;

  return {
    summary: executiveSummary.trim(),
    actionItems: actionItems.slice(0, 6),
    keyPoints: (keyPoints.length > 0 ? keyPoints : sentences.slice(0, 4)),
  };
}

export function generateMindmapMermaidLocally(text: string): string {
  if (!text || !text.trim()) return 'mindmap\n  root((Voice Note))\n    (No speech recorded)';

  const sentences = text.split(/(?<=[.?!])\s+/).filter(Boolean);
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  
  // Find top recurring keywords (excluding generic words)
  const stopWords = new Set(['this', 'that', 'with', 'from', 'have', 'were', 'what', 'when', 'your', 'about', 'there', 'their', 'which', 'would', 'could', 'should']);
  const freqMap: Record<string, number> = {};
  words.forEach(w => {
    if (!stopWords.has(w)) {
      freqMap[w] = (freqMap[w] || 0) + 1;
    }
  });

  const topKeywords = Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

  const rootTitle = topKeywords[0] ? `${topKeywords[0]} Session` : 'Voice Mindmap';

  let mermaidCode = `mindmap\n  root(("${rootTitle}"))\n`;

  // Branch 1: Key Ideas
  mermaidCode += `    Key Concepts\n`;
  topKeywords.slice(1).forEach(kw => {
    mermaidCode += `      ${kw}\n`;
  });

  // Branch 2: Action Items & Observations
  const actions = generateSmartSummaryLocally(text).actionItems;
  if (actions.length > 0) {
    mermaidCode += `    Action Items\n`;
    actions.slice(0, 3).forEach(act => {
      const shortAct = act.slice(0, 28).replace(/[()"[\]]/g, '');
      mermaidCode += `      ["${shortAct}..."]\n`;
    });
  } else {
    mermaidCode += `    Highlights\n`;
    sentences.slice(0, 2).forEach(s => {
      const shortS = s.slice(0, 28).replace(/[()"[\]]/g, '');
      mermaidCode += `      ["${shortS}..."]\n`;
    });
  }

  // Branch 3: Details
  mermaidCode += `    Details\n`;
  mermaidCode += `      Word Count: ${words.length}\n`;
  mermaidCode += `      Timestamp: ${new Date().toLocaleDateString()}\n`;

  return mermaidCode;
}

export function repurposeContentLocally(text: string, format: RepurposeFormat): string {
  const { summary, actionItems, keyPoints } = generateSmartSummaryLocally(text);

  switch (format) {
    case 'email':
      return `Subject: Summary & Action Items — Speech Discussion\n\nHi Team,\n\nI wanted to share a quick summary of our recent discussion:\n\n${summary}\n\nKey Highlights:\n${keyPoints.map(p => `• ${p}`).join('\n')}\n\nNext Steps / Action Items:\n${actionItems.length > 0 ? actionItems.map(a => `[ ] ${a}`).join('\n') : '• Review and follow up as needed.'}\n\nPlease let me know if you have any questions.\n\nBest regards,`;

    case 'meeting-minutes':
      return `# 📋 Meeting Minutes\n**Date:** ${new Date().toLocaleDateString()}\n\n## 🎯 Executive Summary\n${summary}\n\n## 💡 Key Discussion Points\n${keyPoints.map(p => `- ${p}`).join('\n')}\n\n## ✅ Action Items & Owners\n${actionItems.length > 0 ? actionItems.map(a => `- [ ] **Task:** ${a}`).join('\n') : '- [ ] No open action items pending.'}\n\n## 📝 Full Transcript\n${text}`;

    case 'twitter-thread':
      return `🧵 Key Takeaways from Today's Voice Memo:\n\n1/3 ${summary.slice(0, 240)}\n\n2/3 Key Insights:\n${keyPoints.slice(0, 2).map(p => `👉 ${p.slice(0, 100)}`).join('\n')}\n\n3/3 Action Plan:\n${actionItems.slice(0, 2).map(a => `✅ ${a.slice(0, 100)}`).join('\n') || '🚀 Keep building and moving forward!'}\n\n#VoiceNotes #Productivity #AI`;

    case 'linkedin-post':
      return `💡 Quick reflection on our latest project discussion:\n\n${summary}\n\nHere are the top 3 insights:\n${keyPoints.slice(0, 3).map((p, i) => `${i + 1}. ${p}`).join('\n\n')}\n\nWhat are your thoughts on this approach? Let's connect in the comments below! 👇\n\n#Leadership #Innovation #Productivity #AI`;

    case 'study-flashcards':
      return `# 🎓 Study Flashcards & Key Concepts\n\n${keyPoints.map((p, idx) => `### Card ${idx + 1}\n**Q: What is the core takeaway regarding topic #${idx + 1}?**\n**A:** ${p}\n`).join('\n')}\n### Summary Review\n${summary}`;

    case 'blog-outline':
      return `# 📰 Blog Post Outline\n\n## Introduction\n- Hook: Understanding ${keyPoints[0] || 'the core concept'}\n- Brief overview: ${summary}\n\n## Main Pillars\n${keyPoints.map((p, idx) => `### Section ${idx + 1}: ${p.slice(0, 40)}...\n- Detailed exploration\n- Practical examples`).join('\n\n')}\n\n## Actionable Takeaways\n${actionItems.map(a => `- ${a}`).join('\n') || '- Conclusion & summary'}\n\n## Conclusion\n- Final thoughts and next steps.`;

    default:
      return summary;
  }
}
