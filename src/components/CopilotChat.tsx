"use client";

import React, { useState } from "react";
import { Bot, Send, Sparkles, User, Loader2 } from "lucide-react";
import { EnrichedPlayer } from "@/lib/types";

interface ChatProps {
  squad: EnrichedPlayer[];
  manager: any;
}

export default function CopilotChat({ squad, manager }: ChatProps) {
  const managerName = manager?.player_first_name || manager?.name || "Manager";

  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([
    {
      role: "assistant",
      text: `Hello ${manager?.player_first_name || manager?.name || "Manager"}! I am your Agentic FPL Manager. I have analyzed your 15-man squad, upcoming fixture difficulty, and mini-league rival stats. Ask me anything or try one of the prompt suggestions below!`,
    },
  ]);

  // Update greeting when a new manager syncs
  React.useEffect(() => {
    if (manager?.player_first_name || manager?.name) {
      setMessages([
        {
          role: "assistant",
          text: `Hello ${manager.player_first_name || manager.name}! I am your Agentic FPL Manager. I have loaded and analyzed your squad. Ask me anything or try one of the prompt suggestions below!`,
        },
      ]);
    }
  }, [manager?.id, manager?.name]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "Who should I captain this week?",
    "Suggest my best transfer for GW11",
    "Should I play my Wildcard or hold?",
    "Find top budget differentials under £6.5m",
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const newMessages = [...messages, { role: "user" as const, text: textToSend }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToSend, manager, squad }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages([...newMessages, { role: "assistant", text: data.response }]);
      } else {
        setMessages([
          ...newMessages,
          { role: "assistant", text: "Encountered an issue analyzing your squad. Please retry." },
        ]);
      }
    } catch (e) {
      setMessages([
        ...newMessages,
        { role: "assistant", text: "Network connection error reaching AI Copilot." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#170220] border border-[#330b3d] rounded-2xl p-5 shadow-xl flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-4 border-b border-[#330b3d]">
        <div className="w-8 h-8 rounded-lg bg-fpl-purple border border-fpl-green flex items-center justify-center text-fpl-green">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            AI Tactical Copilot <span className="bg-fpl-green/10 text-fpl-green text-[10px] font-bold px-1.5 py-0.5 rounded border border-fpl-green/30">ONLINE</span>
          </h3>
          <p className="text-[11px] text-gray-400">Context-aware FPL engine backed by live database tools</p>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 text-xs ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-fpl-purple flex items-center justify-center text-fpl-green shrink-0 mt-0.5 border border-[#441151]">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`rounded-2xl px-3.5 py-2.5 max-w-[85%] whitespace-pre-line leading-relaxed shadow ${
                m.role === "user"
                  ? "bg-fpl-green text-black font-medium"
                  : "bg-[#23022c] border border-[#3d0d4a] text-gray-200"
              }`}
            >
              {m.text}
            </div>
            {m.role === "user" && (
              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-gray-200 shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-gray-400 pl-8">
            <Loader2 className="w-4 h-4 animate-spin text-fpl-green" />
            <span>Analyzing tactical options...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="py-2 flex flex-wrap gap-1.5 border-t border-[#330b3d]">
        {quickPrompts.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="text-[10px] bg-[#22032b] hover:bg-[#2d0539] text-gray-300 hover:text-white px-2.5 py-1 rounded-full border border-[#441151] transition flex items-center gap-1"
          >
            <Sparkles className="w-2.5 h-2.5 text-fpl-cyan" /> {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="pt-2 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask tactical advice (e.g. 'Sell Greaves for Aït-Nouri?')..."
          className="flex-1 bg-[#24032d] border border-[#441151] rounded-xl px-3.5 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-fpl-green"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-fpl-green hover:bg-[#00e077] disabled:opacity-50 text-black px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
