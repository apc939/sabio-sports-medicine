import React, { useState, useRef, useEffect } from 'react';
import './AIChat.css';

const AIChat = ({ isOpen, onToggle, folders, summaries }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: '¡Hola! Soy tu asistente de IA especializado en medicina del deporte. Puedo ayudarte a analizar y consultar toda tu literatura científica. ¿En qué puedo ayudarte?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendToN8N = async (userMessage, context) => {
    try {
      // URL del webhook de n8n configurado
      const n8nWebhookUrl = process.env.REACT_APP_N8N_WEBHOOK_URL || 'https://n8n.srv879499.hstgr.cloud/webhook-test/medicina-deportiva-chat';
      
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: context,
          timestamp: new Date().toISOString(),
          sessionId: `session_${Date.now()}` // Opcional: para mantener contexto de sesión
        })
      });

      if (!response.ok) {
        throw new Error('Error en la comunicación con n8n');
      }

      const data = await response.json();
      return data.response || data.message || 'Lo siento, no pude procesar tu consulta.';
    } catch (error) {
      console.error('Error enviando a n8n:', error);
      return 'Lo siento, hay un problema con la conexión. Por favor intenta nuevamente.';
    }
  };

  const prepareContext = () => {
    // Preparar contexto con todos los resúmenes y estados del arte
    const context = {
      folders: folders.map(folder => ({
        id: folder.id,
        name: folder.name,
        parent_id: folder.parent_id || null,
        subfolder_count: folder.subfolder_count || 0,
        created_at: folder.created_at
      })),
      summaries: summaries.map(summary => ({
        id: summary.id,
        folder_id: summary.folder_id,
        title: summary.title,
        summary: summary.summary,
        critical_analysis: summary.critical_analysis,
        keywords: summary.keywords,
        created_at: summary.created_at
      })),
      total_documents: summaries.length,
      research_areas: folders.length,
      folder_hierarchy: folders.filter(f => !f.parent_id).length,
      total_subfolders: folders.filter(f => f.parent_id).length,
      last_updated: new Date().toISOString()
    };

    return context;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const context = prepareContext();
      const aiResponse = await sendToN8N(userMessage.content, context);

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor intenta nuevamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) {
    return (
      <button className="chat-toggle-btn" onClick={onToggle}>
        <span className="chat-icon">🤖</span>
        <span className="chat-label">Chat IA</span>
      </button>
    );
  }

  return (
    <div className="ai-chat-container">
      <div className="chat-header">
        <div className="chat-title">
          <span className="chat-avatar">🤖</span>
          <div className="chat-info">
            <h3>Asistente IA - Medicina del Deporte</h3>
            <span className="chat-status">
              {summaries.length} documentos • {folders.length} áreas de investigación
            </span>
          </div>
        </div>
        <button className="chat-close-btn" onClick={onToggle}>
          ×
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-content">
              <p>{message.content}</p>
              <span className="message-time">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <div className="chat-input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Pregunta sobre tu literatura científica..."
            rows="2"
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="send-btn"
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
        
        <div className="chat-suggestions">
          <button 
            onClick={() => setInputMessage('¿Cuáles son las principales tendencias en lesiones deportivas?')}
            className="suggestion-btn"
          >
            📊 Tendencias en lesiones
          </button>
          <button 
            onClick={() => setInputMessage('Resume los hallazgos más importantes sobre rendimiento atlético')}
            className="suggestion-btn"
          >
            🏃 Rendimiento atlético  
          </button>
          <button 
            onClick={() => setInputMessage('¿Qué gaps de investigación has identificado?')}
            className="suggestion-btn"
          >
            🔍 Gaps de investigación
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;