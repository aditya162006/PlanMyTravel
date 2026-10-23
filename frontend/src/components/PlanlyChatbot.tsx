import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, X, Send, Bot, User as UserIcon,
  ChevronDown, ExternalLink, HelpCircle, Compass, CreditCard, PieChart,
  MapPin, ShieldCheck
} from 'lucide-react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

interface PlanlyChatbotProps {
  embedded?: boolean;
}

export const PlanlyChatbot: React.FC<PlanlyChatbotProps> = ({ embedded = false }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(embedded);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialGreeting: ChatMessage = {
    id: 'msg_welcome',
    role: 'assistant',
    content: "Hello! 👋 I'm **Planly**, your personal PlanMyTravel AI Concierge. I can help you plan bespoke AI itineraries, explore curated stays with live weather & maps, discover personal local guides, track journey expenses, and use your zero-fee Trip Wallet!",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);

  const quickQuestions = [
    { label: '✈️ Plan an AI Itinerary', query: 'How do I plan a trip with the AI Concierge?' },
    { label: '💳 Trip Wallet & Payments', query: 'How does the Trip Wallet work and are there any minimum balance limits?' },
    { label: '📊 Expense Tracker & Alerts', query: 'How does the Journey Expense Tracker track spending and alert for overexpense?' },
    { label: '🧭 Personal Local Guides', query: 'How can I connect with or register as a certified personal local guide?' },
    { label: '🏨 Stays, Maps & Weather', query: 'Tell me about curated boutique stays, interactive maps, and live weather.' },
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
      id: `usr_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.chatAssistant(textToSend, history);
      let replyText = res?.reply || "I'm here to help! Could you please clarify your request?";

      // Clean up JSON strings if returned
      if (typeof replyText === 'string' && replyText.trim().startsWith('{') && replyText.includes('"response"')) {
        try {
          const parsed = JSON.parse(replyText);
          if (parsed.response) replyText = parsed.response;
        } catch {
          // keep as is
        }
      }

      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          role: 'assistant',
          content: "Planly is connecting to our luxury travel archives. You can also explore directly using the navigation menu!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedContent = (content: string) => {
    return (
      <div className="space-y-2 text-xs leading-relaxed">
        {content.split('\n\n').map((paragraph, pIdx) => {
          if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
            const items = paragraph.split('\n');
            return (
              <ul key={pIdx} className="list-disc pl-4 space-y-1">
                {items.map((item, iIdx) => (
                  <li key={iIdx} dangerouslySetInnerHTML={{ __html: formatInline(item.replace(/^[-*]\s+/, '')) }} />
                ))}
              </ul>
            );
          }
          if (paragraph.match(/^\d+\.\s+/)) {
            const items = paragraph.split('\n');
            return (
              <ol key={pIdx} className="list-decimal pl-4 space-y-1">
                {items.map((item, iIdx) => (
                  <li key={iIdx} dangerouslySetInnerHTML={{ __html: formatInline(item.replace(/^\d+\.\s+/, '')) }} />
                ))}
              </ol>
            );
          }
          return (
            <p key={pIdx} dangerouslySetInnerHTML={{ __html: formatInline(paragraph) }} />
          );
        })}
      </div>
    );
  };

  const formatInline = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-ivory-200 text-forest-900 font-mono text-[10px]">$1</code>');
  };

  // If embedded in a page
  if (embedded) {
    return (
      <div className="bg-white rounded-3xl border border-charcoal-100 shadow-soft overflow-hidden flex flex-col h-[520px]">
        {/* Header */}
        <div className="px-6 py-4 bg-forest-900 text-ivory-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-forest-800 border border-sage-400/40 flex items-center justify-center text-sage-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold leading-none">Planly</h3>
              <span className="text-[10px] text-sage-300 font-medium">PlanMyTravel AI Concierge</span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest-800/80 text-[10px] text-sage-300 font-medium border border-sage-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Online 24/7
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#FAF9F6]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-forest-900 text-sage-300 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-soft-sm">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs shadow-soft-sm ${
                  msg.role === 'user'
                    ? 'bg-forest-800 text-white rounded-tr-xs'
                    : 'bg-white text-charcoal-800 border border-charcoal-100/80 rounded-tl-xs'
                }`}
              >
                {renderFormattedContent(msg.content)}
                <span
                  className={`block text-[9px] mt-1.5 text-right ${
                    msg.role === 'user' ? 'text-sage-300' : 'text-charcoal-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-charcoal-800 text-ivory-100 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-soft-sm">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-charcoal-500 bg-white p-3 rounded-2xl w-fit border border-charcoal-100 shadow-soft-sm">
              <Sparkles className="w-3.5 h-3.5 text-forest-800 animate-spin" />
              <span>Planly is researching travel archives...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2 bg-ivory-100 border-t border-charcoal-100/70 overflow-x-auto flex gap-1.5 scrollbar-none">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q.query)}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white text-charcoal-700 hover:text-forest-900 hover:border-forest-700 border border-charcoal-200 shadow-soft-sm whitespace-nowrap transition-all"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-charcoal-100 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Planly anything about PlanMyTravel..."
            className="flex-1 px-4 py-2 text-xs rounded-full border border-charcoal-200 outline-none focus:border-forest-800 transition-all placeholder:text-charcoal-400"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-full bg-forest-800 hover:bg-forest-900 disabled:opacity-40 text-white flex items-center justify-center shadow-soft transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Floating Widget Mode
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Pill */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-forest-900 text-ivory-50 shadow-soft-lg hover:bg-forest-800 border border-sage-400/30 transition-all"
          title="Chat with Planly AI Concierge"
        >
          <div className="w-7 h-7 rounded-full bg-forest-800 flex items-center justify-center text-sage-300 group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-left pr-1">
            <span className="block text-xs font-semibold leading-tight">Ask Planly</span>
            <span className="block text-[9px] text-sage-300 font-light">AI Concierge</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      )}

      {/* Expanded Floating Chat Panel */}
      {isOpen && (
        <div className="w-88 sm:w-96 h-[540px] max-h-[85vh] bg-white rounded-3xl border border-charcoal-200 shadow-float overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">

          {/* Header */}
          <div className="px-5 py-4 bg-forest-900 text-ivory-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-forest-800 border border-sage-400/40 flex items-center justify-center text-sage-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif text-sm font-semibold leading-none">Planly</h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sage-800 text-sage-200">AI</span>
                </div>
                <span className="text-[10px] text-sage-300 font-medium">Your 24/7 Travel Architect</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-sage-300 hover:text-white hover:bg-forest-800 transition-colors"
                title="Minimize Planly"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-sage-300 hover:text-white hover:bg-forest-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Bar to key site features */}
          <div className="px-4 py-2 bg-forest-950 text-ivory-200 text-[10px] flex items-center justify-around border-b border-forest-800/80">
            <button
              onClick={() => { setIsOpen(false); navigate('/concierge'); }}
              className="hover:text-sage-300 transition-colors flex items-center gap-1"
            >
              <Compass className="w-3 h-3" /> Concierge
            </button>
            <span className="text-forest-700">•</span>
            <button
              onClick={() => { setIsOpen(false); navigate('/wallet'); }}
              className="hover:text-sage-300 transition-colors flex items-center gap-1"
            >
              <CreditCard className="w-3 h-3" /> Wallet
            </button>
            <span className="text-forest-700">•</span>
            <button
              onClick={() => { setIsOpen(false); navigate('/expenses'); }}
              className="hover:text-sage-300 transition-colors flex items-center gap-1"
            >
              <PieChart className="w-3 h-3" /> Expenses
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF9F6]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-forest-900 text-sage-300 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-soft-sm">
                    <Bot className="w-3 h-3" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs shadow-soft-sm ${
                    msg.role === 'user'
                      ? 'bg-forest-800 text-white rounded-tr-xs'
                      : 'bg-white text-charcoal-800 border border-charcoal-100/80 rounded-tl-xs'
                  }`}
                >
                  {renderFormattedContent(msg.content)}
                  <span
                    className={`block text-[8px] mt-1 text-right ${
                      msg.role === 'user' ? 'text-sage-300' : 'text-charcoal-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-charcoal-800 text-ivory-100 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-soft-sm">
                    <UserIcon className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-charcoal-500 bg-white p-2.5 rounded-2xl w-fit border border-charcoal-100 shadow-soft-sm">
                <Sparkles className="w-3.5 h-3.5 text-forest-800 animate-spin" />
                <span>Planly is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions carousel */}
          <div className="px-3 py-1.5 bg-ivory-100 border-t border-charcoal-100/70 overflow-x-auto flex gap-1.5 scrollbar-none">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q.query)}
                className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white text-charcoal-700 hover:text-forest-900 hover:border-forest-700 border border-charcoal-200 shadow-soft-sm whitespace-nowrap transition-all"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-2.5 bg-white border-t border-charcoal-100 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Planly a question..."
              className="flex-1 px-3.5 py-2 text-xs rounded-full border border-charcoal-200 outline-none focus:border-forest-800 transition-all placeholder:text-charcoal-400"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-full bg-forest-800 hover:bg-forest-900 disabled:opacity-40 text-white flex items-center justify-center shadow-soft transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

