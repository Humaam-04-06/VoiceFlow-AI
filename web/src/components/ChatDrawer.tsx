'use client';

import React, { useState } from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { dispatchAITask } from '@/lib/ai/aiDispatcher';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, 
  faPaperPlane, 
  faRobot, 
  faUser, 
  faComments, 
  faTrashCan,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import { ApiKeyRequiredModal } from './ApiKeyRequiredModal';

export const ChatDrawer: React.FC = () => {
  const {
    isChatDrawerOpen,
    setModalOpen,
    chatMessages,
    addChatMessage,
    clearChat,
    rawTranscript,
    selectedAIProvider,
    apiKeys,
  } = useVoiceStore();

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isKeyAlertOpen, setIsKeyAlertOpen] = useState(false);
  const [alertFeatureName, setAlertFeatureName] = useState('Ask AI Chat');

  if (!isChatDrawerOpen) return null;

  const checkApiKey = (): boolean => {
    if (selectedAIProvider === 'free-local') return true;
    
    if (selectedAIProvider === 'gemini' && !apiKeys.geminiKey?.trim()) {
      setAlertFeatureName('Ask AI (Google Gemini)');
      setIsKeyAlertOpen(true);
      return false;
    }
    if (selectedAIProvider === 'openai' && !apiKeys.openaiKey?.trim()) {
      setAlertFeatureName('Ask AI (OpenAI GPT-4o)');
      setIsKeyAlertOpen(true);
      return false;
    }
    if (selectedAIProvider === 'claude' && !apiKeys.claudeKey?.trim()) {
      setAlertFeatureName('Ask AI (Anthropic Claude)');
      setIsKeyAlertOpen(true);
      return false;
    }
    return true;
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    if (!checkApiKey()) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    addChatMessage({ sender: 'user', text: userText });
    setIsTyping(true);

    try {
      const response = await dispatchAITask({
        action: 'chat',
        text: rawTranscript,
        provider: selectedAIProvider,
        apiKeys,
        userPrompt: userText,
      });

      addChatMessage({
        sender: 'ai',
        text: response.result || 'I have reviewed your speech transcript.',
      });
    } catch {
      addChatMessage({
        sender: 'ai',
        text: 'Sorry, I encountered an issue analyzing the transcript.',
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-950 border-l border-white/10 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-neutral-900/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-sm border border-emerald-500/20">
                <FontAwesomeIcon icon={faComments} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Ask AI (Transcript Chat)</h2>
                <p className="text-[10px] text-neutral-400">Ask questions about your recorded speech</p>
              </div>
            </div>
            <button
              onClick={() => setModalOpen('chat', false)}
              className="w-8 h-8 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faXmark} className="text-base" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length > 0 ? (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      <FontAwesomeIcon icon={faRobot} />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-violet-600 text-white rounded-br-none shadow-md'
                        : 'bg-neutral-900 border border-white/10 text-neutral-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-violet-600/30 text-violet-300 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-20 text-neutral-500 gap-3">
                <FontAwesomeIcon icon={faQuestionCircle} className="text-3xl text-neutral-600" />
                <p className="text-xs font-medium">Ask anything about your voice note</p>
                <p className="text-[11px] text-neutral-600 max-w-xs">
                  E.g. "What were the main conclusions?", "List all numbers mentioned", or "Draft a follow-up email".
                </p>
              </div>
            )}

            {isTyping && (
              <div className="flex gap-2 items-center text-xs text-neutral-400 italic">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>AI is reading transcript and thinking...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-white/10 bg-neutral-900/60 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question about this speech..."
              className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500 transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center disabled:opacity-40 transition-all shadow-md active:scale-95"
            >
              <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
            </button>
            {chatMessages.length > 0 && (
              <button
                type="button"
                onClick={clearChat}
                className="w-9 h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-400 hover:text-rose-400 flex items-center justify-center transition-all"
                title="Clear Chat"
              >
                <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
              </button>
            )}
          </form>

          {/* Sweet Alert Key Required Modal */}
          <ApiKeyRequiredModal
            isOpen={isKeyAlertOpen}
            onClose={() => setIsKeyAlertOpen(false)}
            featureName={alertFeatureName}
          />
        </div>
      </div>
    </div>
  );
};
