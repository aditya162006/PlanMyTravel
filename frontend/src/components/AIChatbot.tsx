import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, Sparkles, X, Send, Bot, User as UserIcon,
  ChevronDown, ExternalLink, HelpCircle, Compass, CreditCard, PieChart
} from 'lucide-react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

interface AIChatbotProps {
  embedded?: boolean;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ embedded = false }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(embedded);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialGreeting: ChatMessage = {
    id: 'msg_welcome',
    role: 'assistant',
    content: "Hello! 👋 I am your **PlanMyTravel AI Concierge**. Ask me anything about creating AI itineraries, booking curated stays, local guides, our Trip Wallet, or tracking your journey expenses!",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);

  const quickQuestions = [
    { label: '✈️ How do I plan a trip?', query: 'How do I plan a trip with AI Concierge?' },
    { label: '💳 How does Trip Wallet work?', query: 'How do I add money and pay with the Trip Wallet?' },
    { label: '📊 How do I track expenses?', query: 'How does the journey expense tracker work?' },
    { label: '🧭 How do I become a guide?', query: 'How can I register as a personal local guide?' },
    { label: '🏨 Stays, maps & weather?', query: 'Tell me about curated stays, hotel maps and weather forecasts.' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-4).map(m => ({ role: m.role, content: m.content }));
      const res = await api.chat({
        message: textToSend,
        history,
      });

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: res?.reply || "I'm here to help with all questions about PlanMyTravel! Try asking about planning, stays, guides, or your wallet.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: `assistant_err_${Date.now()}`,
        role: 'assistant',
        content: "Welcome to PlanMyTravel! You can use our AI Concierge for instant itineraries, explore boutique stays in 8 world regions, hire personal guides, and track your whole trip expenses with Trip Wallet.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Render markdown bold and bullet points cleanly
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Bold rendering
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-[#222222]">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs leading-relaxed text-[#484848] my-0.5">
            {renderedParts}
          </li>
        );
      }

      if (line.match(/^\d+\.\s/)) {
        return (
          <li key={idx} className="ml-4 list-decimal text-xs leading-relaxed text-[#484848] my-0.5">
            {renderedParts}
          </li>
        );
      }

      return (
        <p key={idx} className="text-xs leading-relaxed text-[#484848] mb-1.5 last:mb-0">
          {renderedParts}
        </p>
      );
    });
  };

  if (embedded) {
    return (
      <div className="w-full bg-white rounded-3xl border border-[#DDDDDD] shadow-soft-lg overflow-hidden flex flex-col h-[520px]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#FF385C] to-[#E00B41] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold">PlanMyTravel AI Assistant</h3>
              <p className="text-[11px] text-white/80">Live platform helper & itinerary concierge</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#008A05] animate-pulse"></span>
            Online
          </span>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-[#F7F7F7] border-b border-[#DDDDDD] flex items-center gap-2 overflow-x-auto no-scrollbar">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q.query)}
              className="px-3 py-1 rounded-full bg-white text-[#222222] hover:text-[#FF385C] hover:bg-[#F2F2F2] border border-[#DDDDDD] text-[11px] font-medium whitespace-nowrap transition-all shadow-soft-sm hover:scale-105 active:scale-95 cursor-pointer"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-white">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-[#FFF0F2] text-[#FF385C] flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#FFC5CC]">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-soft-sm ${
                  m.role === 'user'
                    ? 'bg-[#FF385C] text-white rounded-br-none'
                    : 'bg-[#F7F7F7] border border-[#DDDDDD] text-[#222222] rounded-bl-none'
                }`}
              >
                {renderFormattedText(m.content)}
                <span
                  className={`block text-[9px] mt-1.5 text-right ${
                    m.role === 'user' ? 'text-white/70' : 'text-[#717171]'
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-[#222222] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-7 h-7 rounded-full bg-[#FFF0F2] text-[#FF385C] flex items-center justify-center flex-shrink-0 border border-[#FFC5CC]">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-[#F7F7F7] border border-[#DDDDDD] flex items-center gap-1.5 text-xs text-[#717171]">
                <span className="w-2 h-2 rounded-full bg-[#FF385C] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-[#FF385C] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#FF385C] animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1 text-[11px]">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-[#DDDDDD] bg-[#F7F7F7] flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about PlanMyTravel, trips, wallet or stays..."
            className="flex-1 px-4 py-2.5 rounded-full border border-[#DDDDDD] focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C] outline-none text-xs text-[#222222] bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-full bg-[#FF385C] hover:bg-[#E00B41] disabled:opacity-50 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-coral cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  // Floating Pop-up Assistant Widget
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="px-5 py-3.5 rounded-full bg-[#FF385C] hover:bg-[#E00B41] text-white font-semibold text-xs shadow-coral flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          title="Open AI Travel Assistant"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
            <span className="w-2 h-2 rounded-full bg-[#008A05] absolute -top-0.5 -right-0.5 ring-2 ring-white"></span>
          </div>
          <span>Ask AI Concierge</span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="w-[380px] sm:w-[420px] h-[560px] bg-white rounded-3xl border border-[#DDDDDD] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-[#FF385C] to-[#E00B41] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold leading-tight">PlanMyTravel Assistant</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#008A05]"></span>
                  <span className="text-[10px] text-white/90">Instant AI Concierge</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Quick Questions Carousel */}
          <div className="px-3.5 py-2 bg-[#F7F7F7] border-b border-[#DDDDDD] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q.query)}
                className="px-2.5 py-1 rounded-full bg-white text-[#222222] hover:text-[#FF385C] hover:bg-[#F2F2F2] border border-[#DDDDDD] text-[10px] font-medium whitespace-nowrap transition-all shadow-soft-sm hover:scale-105 active:scale-95 cursor-pointer"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Message History */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-white">
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#FFF0F2] text-[#FF385C] flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#FFC5CC]">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-soft-sm ${
                    m.role === 'user'
                      ? 'bg-[#FF385C] text-white rounded-br-none'
                      : 'bg-[#F7F7F7] border border-[#DDDDDD] text-[#222222] rounded-bl-none'
                  }`}
                >
                  {renderFormattedText(m.content)}
                  <span
                    className={`block text-[8px] mt-1 text-right ${
                      m.role === 'user' ? 'text-white/70' : 'text-[#717171]'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
                {m.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-[#222222] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-6 h-6 rounded-full bg-[#FFF0F2] text-[#FF385C] flex items-center justify-center flex-shrink-0 border border-[#FFC5CC]">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="px-3.5 py-2 rounded-2xl bg-[#F7F7F7] border border-[#DDDDDD] flex items-center gap-1.5 text-xs text-[#717171]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF385C] animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF385C] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF385C] animate-bounce [animation-delay:0.4s]"></span>
                  <span className="ml-1 text-[10px]">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-[#DDDDDD] bg-[#F7F7F7] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about trips, wallet, guides, or stays..."
              className="flex-1 px-3.5 py-2 rounded-full border border-[#DDDDDD] focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C] outline-none text-xs text-[#222222] bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-full bg-[#FF385C] hover:bg-[#E00B41] disabled:opacity-50 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-coral cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

