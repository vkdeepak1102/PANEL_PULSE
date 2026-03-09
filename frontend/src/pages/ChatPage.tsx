import { useState, useRef, useEffect, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { chatApi } from '@/lib/api/chat.api';
import type { ChatMessage, ChatHistoryEntry, ChatSource } from '@/lib/api/chat.api';
import { Send, Bot, User, Sparkles, ChevronDown, ChevronUp, Zap } from 'lucide-react';

// ─── Starter questions ───────────────────────────────────────────────────────

const STARTER_QUESTIONS = [
  'Which panel member is most suited for Python-based interviews?',
  'Show me panels with the highest Mandatory Skill Coverage score.',
  'Which candidates were rejected with weak L2 probing?',
  'Who are the top 5 panels ranked by overall score?',
  'Which panels scored poorly on Technical Depth?',
  'Show evaluations where the interview structure was strong.',
];

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 mb-5 justify-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-indigo-400" />
      </div>
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Source chips ─────────────────────────────────────────────────────────────

function SourcesAccordion({ sources }: { sources: ChatSource[] }) {
  const [open, setOpen] = useState(false);
  const filtered = sources.filter(
    (s) => s.job_interview_id || s.candidate_name || s.panel_member_name
  );
  if (!filtered.length) return null;

  return (
    <div className="mt-2 text-xs">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-400 transition-colors"
      >
        <Zap className="w-3 h-3" />
        {filtered.length} source{filtered.length !== 1 ? 's' : ''} retrieved
        {open ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>

      {open && (
        <div className="mt-2 flex flex-wrap gap-2">
          {filtered.map((src, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-slate-700/50 border border-slate-600/40 text-slate-400 rounded-lg px-2 py-1"
            >
              {src.panel_member_name || src.candidate_name || src.job_interview_id}
              {src.field_type && (
                <span className="text-slate-500">· {src.field_type}</span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';

  return (
    <div
      className={`flex items-end gap-3 mb-5 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* AI avatar — left */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mb-auto mt-1">
          <Bot className="w-4 h-4 text-indigo-400" />
        </div>
      )}

      {/* Bubble */}
      <div className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-gradient-to-br from-orange-500/25 to-orange-600/15 border border-orange-500/30 text-white rounded-br-sm'
              : 'bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-bl-sm'
          }`}
        >
          {msg.content}
        </div>

        {/* Sources (AI only) */}
        {!isUser && msg.sources && msg.sources.length > 0 && (
          <SourcesAccordion sources={msg.sources} />
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-slate-600 mt-1 px-1">
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* User avatar — right */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/30 to-orange-600/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0 mb-auto mt-1">
          <User className="w-4 h-4 text-orange-400" />
        </div>
      )}
    </div>
  );
}

// ─── ChatPage ─────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const buildHistory = useCallback((): ChatHistoryEntry[] => {
    return messages
      .filter((m) => !m.isLoading)
      .map((m) => ({ role: m.role, content: m.content }));
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      // Append user message
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsLoading(true);

      try {
        const history = buildHistory();
        // Include the new user message in history for context
        const fullHistory: ChatHistoryEntry[] = [
          ...history,
          { role: 'user', content: trimmed },
        ];

        const response = await chatApi.sendMessage(trimmed, fullHistory.slice(0, -1));

        const aiMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.reply,
          timestamp: new Date(),
          sources: response.sources,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (err: any) {
        const errMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content:
            '⚠️ Sorry, I encountered an error retrieving data. Please try again in a moment.',
          timestamp: new Date(),
          sources: [],
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsLoading(false);
        setTimeout(() => textareaRef.current?.focus(), 50);
      }
    },
    [isLoading, buildHistory]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <AppShell>
      <main className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* ── Header ── */}
        <div className="bg-slate-800/40 border-b border-slate-700/50 backdrop-blur-sm flex-shrink-0">
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/30 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Ask the AI</h1>
              <p className="text-xs text-slate-400">
                Query your panel evaluation data using natural language
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Hybrid Search Active
            </div>
          </div>
        </div>

        {/* ── Message Area ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6">

            {/* Empty state / starter chips */}
            {isEmpty && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/10 border border-indigo-500/20 flex items-center justify-center mb-5">
                  <Bot className="w-8 h-8 text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  PanelPulse AI Assistant
                </h2>
                <p className="text-slate-400 text-sm mb-8 max-w-sm">
                  Ask anything about your panel evaluations, candidate results, or
                  interviewer performance. Powered by hybrid semantic search.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl">
                  {STARTER_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-left text-sm text-slate-300 bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/40 hover:bg-slate-800/80 hover:text-white rounded-xl px-4 py-3 transition-all duration-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {!isEmpty && (
              <>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
                {isLoading && <TypingIndicator />}
              </>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ── Input bar ── */}
        <div className="flex-shrink-0 border-t border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="relative flex items-end gap-3 bg-slate-800/60 border border-slate-700/60 hover:border-slate-600/80 focus-within:border-indigo-500/50 rounded-2xl px-4 py-3 transition-all duration-200">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about panels, scores, candidates… (Enter to send)"
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 resize-none outline-none leading-relaxed disabled:opacity-50 min-h-[24px] max-h-[160px]"
                aria-label="Chat message input"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 self-end"
                aria-label="Send message"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-[10px] text-slate-600 text-center mt-2">
              Enter to send · Shift+Enter for new line · Responses use live panel evaluation data
            </p>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
