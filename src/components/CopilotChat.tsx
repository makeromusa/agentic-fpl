'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, User, Loader2, Zap } from 'lucide-react';
import { EnrichedPlayer } from '@/lib/types';

interface ChatProps {
  squad: EnrichedPlayer[];
  manager: any;
}

function renderMarkdown(text: string) {
  // Simple markdown: **bold**, newlines
  const parts = text.split(/(\*\*[^*]+\*\*|\n)/);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part === '\n') return <br key={i} />;
    return <span key={i}>{part}</span>;
  });
}

export default function CopilotChat({ squad, manager }: ChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const managerName = manager?.player_first_name || manager?.name || 'Manager';

  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string; powered_by?: string }[]>([
    {
      role: 'assistant',
      text: `Hello ${managerName}! I'm your FPL AI Copilot — ask me anything about your squad, transfers, captaincy, chips, differentials, or any FPL strategy question. I'm here to help you climb the ranks.`,
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (manager?.player_first_name || manager?.name) {
      setMessages([
        {
          role: 'assistant',
          text: `Welcome back, ${manager.player_first_name || manager.name}! Your squad is loaded. I can see all 15 players. Ask me anything — captaincy, transfers, chip timing, or any FPL question.`,
        },
      ]);
    }
  }, [manager?.id, manager?.name]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickPrompts = [
    'Who should I captain this week?',
    'Suggest my best transfer for next GW',
    'Should I play my Wildcard now or hold?',
    'Find budget differentials under £6.5m',
    "What's my biggest injury risk?",
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user' as const, text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, manager, squad }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages([...newMessages, { role: 'assistant', text: data.response, powered_by: data.powered_by }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', text: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', text: 'Network error. Check your connection and try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl flex flex-col overflow-hidden shadow-xl" style={{ height: '620px' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#37003c] to-[#1a001e] border border-[#00ff87]/30 flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5 text-[#00ff87]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            AI Copilot
            <span className="inline-flex items-center gap-1 text-[10px] bg-[#00ff87]/10 text-[#00ff87] border border-[#00ff87]/20 px-2 py-0.5 rounded-full font-medium">
              <span className="w-1.5 h-1.5 bg-[#00ff87] rounded-full animate-pulse"></span>
              ONLINE
            </span>
          </h3>
          <p className="text-[11px] text-[var(--text-muted)] truncate">Context-aware · Powered by live FPL data</p>
        </div>
        <div title="Add GEMINI_API_KEY to unlock full AI" className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 cursor-help">
          <Zap className="w-3 h-3" /> Gemini
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#37003c] to-[#200024] border border-[#00ff87]/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-[#00ff87]" />
              </div>
            )}
            <div className={`text-[13px] leading-relaxed max-w-[85%] rounded-2xl px-4 py-3 ${
              m.role === 'user'
                ? 'bg-[#00ff87] text-black font-medium rounded-br-sm'
                : 'bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-bl-sm'
            }`}>
              {m.role === 'assistant' ? renderMarkdown(m.text) : m.text}
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#37003c] to-[#200024] border border-[#00ff87]/20 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-[#00ff87]" />
            </div>
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00ff87]" />
              <span className="text-[12px] text-[var(--text-muted)]">Analyzing...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 pb-2 flex flex-wrap gap-1.5">
        {quickPrompts.map((q, i) => (
          <button
            key={i}
            onClick={() => setInput(q)}
            className="text-[11px] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2.5 py-1 rounded-full border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all flex items-center gap-1"
          >
            <Sparkles className="w-2.5 h-2.5 text-[#00d4ff]" /> {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-[var(--border-subtle)]">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about FPL..."
            className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--border-focus)] rounded-xl px-3.5 py-2.5 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none resize-none transition-colors"
            style={{ minHeight: '40px', maxHeight: '100px' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="bg-[#00ff87] hover:bg-[#00e077] disabled:opacity-40 disabled:cursor-not-allowed text-black w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
