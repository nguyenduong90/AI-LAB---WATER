
import React, { useState, useRef, useEffect } from 'react';
import type { AiMessage, Quiz } from '../types';
import { MessageSender } from '../types';
import { AiIcon } from './icons/AiIcon';
import { UserIcon } from './icons/UserIcon';

interface AiAssistantProps {
  messages: AiMessage[];
  quiz: Quiz | null;
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1 p-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
    </div>
);


export const AiAssistant: React.FC<AiAssistantProps> = ({ messages, quiz, isLoading, onSendMessage }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, quiz, isLoading]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userAnswer.trim() && !isLoading) {
      onSendMessage(userAnswer.trim());
      setUserAnswer('');
    }
  };

  return (
    <div className="flex-grow flex flex-col h-full min-h-[300px] max-h-[60vh] md:max-h-full">
        <h2 className="text-xl font-bold text-center mb-4 text-blue-800 p-2">Trợ lý AI</h2>
        <div className="flex-grow bg-blue-50/50 rounded-lg p-4 overflow-y-auto mb-4 border border-blue-200/80 shadow-inner">
            <div className="space-y-4">
                {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === MessageSender.USER ? 'justify-end' : ''}`}>
                    {msg.sender === MessageSender.AI && <div className="w-8 h-8 flex-shrink-0 text-blue-600"><AiIcon /></div>}
                    <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${
                        msg.sender === MessageSender.AI
                        ? 'bg-white shadow-sm border border-gray-200 rounded-bl-none'
                        : 'bg-blue-500 text-white rounded-br-none'
                    }`}>
                    <p className="text-sm">{msg.text}</p>
                    </div>
                     {msg.sender === MessageSender.USER && <div className="w-8 h-8 flex-shrink-0 text-gray-500"><UserIcon /></div>}
                </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 flex-shrink-0 text-blue-600"><AiIcon /></div>
                        <div className="px-4 py-2 rounded-2xl bg-white shadow-sm border border-gray-200 rounded-bl-none">
                            <TypingIndicator />
                        </div>
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </div>
        </div>
        <div className="p-2">
            {quiz && !isLoading && (
                <p className="text-sm font-semibold text-blue-700 mb-2">{quiz.question}</p>
            )}
            <form onSubmit={handleFormSubmit} className="flex gap-2">
                <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={quiz ? "Câu trả lời của con..." : "Hỏi trợ lý AI..."}
                className="flex-grow p-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
                disabled={isLoading}
                />
                <button type="submit" className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors disabled:bg-green-300" disabled={isLoading || !userAnswer.trim()}>
                    Gửi
                </button>
            </form>
        </div>
    </div>
  );
};