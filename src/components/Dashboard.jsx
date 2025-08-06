import React, { useState } from 'react'
import './Dashboard.css'

const Dashboard = ({ selectedFolder, summaries }) => {
  const [expandedSummary, setExpandedSummary] = useState(null)

  const toggleSummary = (summaryId) => {
    setExpandedSummary(expandedSummary === summaryId ? null : summaryId)
  }

  return (
    <div className="dashboard">
      <div className="overview-section">
        <div className="welcome-header">
          <h1>Bienvenido a <span className="highlight-sabio">Sabio</span></h1>
          <p>El nuevo orden de la medicina del deporte</p>
          <div className="author-credit">by @medandresparra</div>
          {selectedFolder && (
            <div className="current-folder-info">
              <span>📂 {selectedFolder.name}</span>
            </div>
          )}
        </div>

        {!selectedFolder ? (
          <div className="quick-actions">
            <div className="action-card">
              <div className="action-icon">📄</div>
              <h3>Subir Documento</h3>
              <p>Analizar Nueva Literatura Científica</p>
            </div>
            <div className="action-card">
              <div className="action-icon">📋</div>
              <h3>Ver Resúmenes</h3>
              <p>Selecciona una carpeta para ver documentos</p>
            </div>
            <div className="action-card">
              <div className="action-icon">🔬</div>
              <h3>Estado del Arte</h3>
              <p>Síntesis de Investigación Actual</p>
            </div>
          </div>
        ) : (
          <div className="summaries-section">
            <div className="section-header">
              <h2>Resúmenes - {selectedFolder.name}</h2>
            </div>

            {summaries.length === 0 ? (
              <div className="folder-empty-state">
                <div className="empty-content">
                  <div className="empty-icon">📚</div>
                  <h3>Carpeta de Demostración</h3>
                  <p>Esta es una versión demo de Sabio Sports Medicine</p>
                  <p>En la versión completa aquí verías los documentos analizados</p>
                </div>
              </div>
            ) : (
              <div className="summaries-list">
                {summaries.map(summary => (
                  <div key={summary.id} className="summary-card">
                    <div className="summary-header">
                      <div 
                        className="summary-title-section clickable-title" 
                        onClick={() => toggleSummary(summary.id)}
                      >
                        <h4>{summary.title}</h4>
                      </div>
                      <div className="summary-controls">
                        <span className="summary-date">
                          {new Date(summary.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {expandedSummary === summary.id && (
                      <div className="summary-content-expanded">
                        <div className="summary-header-modal">
                          <h3>{summary.title}</h3>
                          <button 
                            className="summary-close-btn"
                            onClick={() => setExpandedSummary(null)}
                          >
                            ← Volver
                          </button>
                        </div>
                        <div className="summary-text">
                          {summary.summary}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!selectedFolder && (
          <div className="platform-guide">
            <h3>Comienza Tu Investigación</h3>
            <p>Selecciona una carpeta del sidebar para explorar la literatura científica organizada</p>
            <div className="demo-note">
              <h4>🎯 Versión Demo</h4>
              <p>Esta es una demostración de Sabio Sports Medicine. La versión completa incluye:</p>
              <ul>
                <li>✅ Análisis automático con IA (Gemini)</li>
                <li>✅ Sistema de subcarpetas jerárquicas</li>
                <li>✅ Chat IA especializado</li>
                <li>✅ Estados del arte automáticos</li>
                <li>✅ 250+ documentos organizados</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard