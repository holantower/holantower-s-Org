import React, { useState, useRef, useEffect } from 'react';
import { getGeminiClient } from '../services/gemini';
import { ChatMessage, MODELS } from '../types';
import { Send, User, Bot, Loader2, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatApp: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'system',
      text: 'HolanTower Concierge online. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const client = getGeminiClient();
      const chat = client.chats.create({
        model: MODELS.CHAT,
        history: messages
          .filter(m => m.role !== 'system')
          .map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          }))
      });

      const result = await chat.sendMessageStream({ message: userMsg.text });
      
      let fullResponse = '';
      const botMsgId = (Date.now() + 1).toString();
      
      // Initialize bot message placeholder
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        text: '',
        timestamp: new Date()
      }]);

      for await (const chunk of result) {
        const text = chunk.text;
        fullResponse += text;
        setMessages(prev => prev.map(m => 
          m.id === botMsgId ? { ...m, text: fullResponse } : m
        ));
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        text: 'Connection error. Please try again.',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-tower-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-tower-800 bg-tower-900/50 backdrop-blur">
        <div>
          <h2 className="text-lg font-semibold flex items-center">
            <MessageSquareIcon className="mr-2 text-tower-accent" size={20} />
            Concierge Chat
          </h2>
          <p className="text-xs text-tower-500">Gemini 3 Flash • Low Latency</p>
        </div>
        <button 
          onClick={() => setMessages([messages[0]])}
          className="p-2 text-tower-500 hover:text-red-400 transition-colors"
          title="Clear History"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              flex max-w-[85%] md:max-w-[70%] rounded-2xl p-4 
              ${msg.role === 'user' 
                ? 'bg-tower-accent text-white rounded-br-none' 
                : msg.role === 'system'
                  ? 'bg-tower-800/50 text-tower-400 text-sm w-full justify-center border border-dashed border-tower-700'
                  : 'bg-tower-800 text-tower-100 border border-tower-700 rounded-bl-none shadow-sm'}
            `}>
              {msg.role !== 'system' && (
                <div className={`mr-3 mt-1 flex-shrink-0 ${msg.role === 'user' ? 'order-2 ml-3 mr-0' : ''}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-tower-accent" />}
                </div>
              )}
              
              <div className="overflow-hidden text-sm leading-relaxed">
                {msg.role === 'system' ? (
                  <span className="italic">{msg.text}</span>
                ) : (
                  <ReactMarkdown 
                    className="prose prose-invert prose-sm max-w-none"
                    components={{
                      code({node, className, children, ...props}) {
                         // @ts-ignore
                        const match = /language-(\w+)/.exec(className || '')
                        return match ? (
                          <div className="bg-black/30 rounded p-2 my-2 border border-tower-700 overflow-x-auto">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </div>
                        ) : (
                          <code className="bg-black/30 px-1 py-0.5 rounded text-tower-300" {...props}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-tower-800 border border-tower-700 rounded-2xl rounded-bl-none p-4 flex items-center space-x-2">
              <Bot size={16} className="text-tower-accent" />
              <Loader2 size={16} className="animate-spin text-tower-400" />
              <span className="text-xs text-tower-400">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-tower-800 bg-tower-900">
        <div className="relative max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="w-full bg-tower-800 text-white placeholder-tower-500 border border-tower-700 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-tower-accent focus:border-transparent resize-none h-[52px] max-h-32 scrollbar-hide"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-2 bg-tower-accent hover:bg-tower-accentHover disabled:bg-tower-700 disabled:text-tower-500 text-white rounded-lg transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="text-center mt-2">
           <span className="text-[10px] text-tower-600 uppercase tracking-widest">HolanTower Secure Channel</span>
        </div>
      </div>
    </div>
  );
};

const MessageSquareIcon = ({className, size}: {className?: string, size?: number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
)

export default ChatApp;
