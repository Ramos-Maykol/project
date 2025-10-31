import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export const Chatbot: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: '¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Enviar mensaje al backend
      const response = await fetch('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputMessage,
          userId: user?.id
        })
      });

      const data = await response.json();

      // Simular delay de escritura
      setTimeout(() => {
        const botMessage: Message = {
          id: messages.length + 2,
          text: data.response,
          isBot: true,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 500);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      const errorMessage: Message = {
        id: messages.length + 2,
        text: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { label: '📦 Productos', message: 'Que productos tienen?' },
    { label: '⏱️ Tiempos', message: 'Cuanto tarda un pedido?' },
    { label: '❓ Ayuda', message: 'Ayuda' }
  ];

  const handleQuickAction = (message: string) => {
    setInputMessage(message);
    setTimeout(() => sendMessage(), 100);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110 z-50"
        title="Abrir chat de ayuda"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5" />
          <div>
            <h3 className="font-semibold">Asistente Virtual</h3>
            <p className="text-xs opacity-90">En línea</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-blue-800 p-1 rounded transition-colors"
            title={isMinimized ? 'Maximizar' : 'Minimizar'}
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-blue-800 p-1 rounded transition-colors"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="h-[420px] overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isBot
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.isBot ? 'text-gray-500' : 'text-blue-100'
                  }`}>
                    {message.timestamp.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-white">
              <p className="text-xs text-gray-600 mb-2">Acciones rápidas:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.message)}
                    className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isTyping}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
