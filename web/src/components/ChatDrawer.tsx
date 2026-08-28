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

  if (!isChatDrawerOpen) return null;

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

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

  const presetQuestions = [
    'What are the main takeaways?',
    'List all action items mentioned',
    'Summarize this for an executive',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-900 border-l border-white/10 w-full max-w-md h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FontAwesomeIcon icon={faRobot} className="text-sm" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Chat with Transcript</h2>
              <p className="text-[10px] text-neutral-400">Ask questions about your recorded speech</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {chatMessages.length > 0 && (
              <button
                onClick={clearChat}
                className="w-8 h-8 rounded-xl text-neutral-400 hover:text-rose-400 transition-colors flex items-center justify-center"
                title="Clear Chat"
              >
                <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
              </button>
            )}
            <button
              onClick={() => setModalOpen('chat', false)}
              className="w-8 h-8 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faXmark} className="text-base" />
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-neutral-400 px-4">
              <FontAwesomeIcon icon={faComments} className="text-4xl text-neutral-600 mb-3" />
              <p className="text-xs font-semibold text-neutral-200">Ask anything about your transcript</p>
              <p className="text-[11px] text-neutral-400 mt-1 max-w-xs">
                The AI will answer questions, extract specific data points, or draft follow-up notes from what was spoken.
              </p>

              {/* Preset question pills */}
              <div className="flex flex-col gap-2 mt-4 w-full">
                {presetQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputMessage(q);
                    }}
                    className="text-left text-xs p-2.5 rounded-xl bg-neutral-950/80 border border-white/5 hover:border-emerald-500/30 text-neutral-300 hover:text-white transition-all flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faQuestionCircle} className="text-emerald-400 text-xs" />
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-emerald-600/30 text-emerald-300 flex items-center justify-center flex-shrink-0 text-xs border border-emerald-500/20">
                    <FontAwesomeIcon icon={faRobot} className="text-xs" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-violet-600 text-white rounded-br-none shadow-md shadow-violet-600/20'
                      : 'bg-neutral-950 border border-white/10 text-neutral-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-violet-600/30 text-violet-300 flex items-center justify-center flex-shrink-0 text-xs border border-violet-500/20">
                    <FontAwesomeIcon icon={faUser} className="text-xs" />
                  </div>
                )}
              </div>
            ))
          )}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-neutral-400 animate-pulse">
              <FontAwesomeIcon icon={faRobot} className="text-emerald-400 text-xs" />
              <span>AI is analyzing transcript...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-neutral-950/60 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask a question about the speech..."
            className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-all shadow-md active:scale-95 flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
          </button>
        </form>
      </div>
    </div>
  );
};
