import React, { useState } from 'react'
import './AIChat.css'

const AIChat = ({ isOpen, onToggle, folders, summaries }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: '¡Hola! Soy tu asistente de IA especializado en medicina del deporte. En esta versión demo puedo mostrarte cómo funcionaría el chat con toda tu literatura científica. ¿En qué puedo ayudarte?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')

    // Simular respuesta de IA
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `Esta es una respuesta demo. En la versión completa, analizaría tu consulta "${userMessage.content}" contra toda tu base de conocimientos de ${folders.length} áreas de investigación y ${summaries.length} documentos para darte una respuesta precisa y basada en evidencia científica.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
    }, 1000)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!isOpen) {
    return (
      <button className="chat-toggle-btn" onClick={onToggle}>
        <span className="chat-icon">🤖</span>
        <span className="chat-label">Chat IA</span>
      </button>
    )
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
      </div>

      <div className="chat-input-area">
        <div className="chat-input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Pregunta sobre medicina del deporte..."
            rows="2"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="send-btn"
          >
            📤
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
  )
}

export default AIChat