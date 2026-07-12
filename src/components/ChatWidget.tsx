'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Dumbbell, User } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Habari! I am your Gym It Up With fitness assistant. Ready to crush your goals today? Ask me about workout plans, nutrition, or booking bootcamps!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleToggle = () => {
      setIsOpen((prev) => !prev);
    };
    window.addEventListener('toggle-gym-chatbot', handleToggle);
    return () => {
      window.removeEventListener('toggle-gym-chatbot', handleToggle);
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');

    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userText }),
      });

      const data = await response.json();

      const botMsg: Message = {
        id: Math.random().toString(),
        sender: 'bot',
        text: data.reply || "Sorry, I'm experiencing some network fatigue. Let's try again in a bit!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: Message = {
        id: Math.random().toString(),
        sender: 'bot',
        text: "Error connecting to the trainer. Please check your internet connection.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] max-w-[calc(100vw-2rem)] h-[500px] rounded-2xl glass-panel shadow-2xl flex flex-col overflow-hidden border border-white/10 animate-in slide-in-from-bottom duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#121214] to-[#1a1a1f] p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#ff6b00]/10 border border-[#ff6b00]/20 flex items-center justify-center">
                <Dumbbell className="w-4.5 h-4.5 text-[#ff6b00]" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Gym It Up Assistant</h4>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Coach Bot
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0c]/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Dumbbell className="w-3.5 h-3.5 text-[#ff6b00]" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-[#ff6b00] to-[#ff2a2a] text-white rounded-tr-none'
                      : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="block text-[8px] text-white/40 text-right mt-1.5">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0077ff] to-[#00e5ff] flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Dumbbell className="w-3.5 h-3.5 text-[#ff6b00] animate-bounce" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-3.5 flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-[#121214] border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff6b00] transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-8.5 h-8.5 rounded-xl bg-[#ff6b00] hover:bg-[#e05e00] disabled:bg-white/5 disabled:text-gray-600 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
