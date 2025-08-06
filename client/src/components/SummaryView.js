import React, { useState, useEffect } from 'react';
import './SummaryView.css';

const SummaryView = ({ folders, selectedFolder, onFolderSelected }) => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedSummary, setExpandedSummary] = useState(null);

  useEffect(() => {
    if (selectedFolder) {
      fetchSummaries(selectedFolder.id);
    }
  }, [selectedFolder]);

  const fetchSummaries = async (folderId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/summaries/${folderId}`);
      const data = await response.json();
      setSummaries(data);
    } catch (error) {
      console.error('Error fetching summaries:', error);
    }
    setLoading(false);
  };

  const handleFolderSelect = (folder) => {
    onFolderSelected(folder);
    fetchSummaries(folder.id);
  };

  const toggleSummary = (summaryId) => {
    setExpandedSummary(expandedSummary === summaryId ? null : summaryId);
  };

  const handleDeleteSummary = async (summaryId, summaryTitle) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar el resumen "${summaryTitle}"?\n\n` +
      `Esta acción NO se puede deshacer.`
    );
    
    if (!confirmDelete) return;

    try {
      console.log(`Attempting to delete summary ${summaryId} - ${summaryTitle}`);
      
      const response = await fetch(`/api/summaries/${summaryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete summary response status:', response.status);
      console.log('Delete summary response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('Delete summary result:', result);
        
        // Refrescar la lista de resúmenes
        if (selectedFolder) {
          fetchSummaries(selectedFolder.id);
        }
        alert('Resumen eliminado exitosamente');
      } else {
        const errorText = await response.text();
        console.error('Delete summary error response:', errorText);
        
        let errorMessage = 'Error desconocido';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        alert(`Error eliminando el resumen: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert(`Error de conexión: ${error.message}`);
    }
  };

  return (
    <div className="summary-view">
      <h2>📋 Resúmenes de Literatura Científica</h2>
      
      <div className="folder-selector">
        <h3>Seleccionar Carpeta Temática:</h3>
        <div className="folders-list">
          {folders.map(folder => (
            <button
              key={folder.id}
              className={`folder-btn ${selectedFolder?.id === folder.id ? 'active' : ''}`}
              onClick={() => handleFolderSelect(folder)}
            >
              📁 {folder.name}
            </button>
          ))}
        </div>
      </div>

      {selectedFolder && (
        <div className="selected-folder-info">
          <h3>📁 {selectedFolder.name}</h3>
          <p>{summaries.length} resúmenes disponibles</p>
        </div>
      )}

      {loading && (
        <div className="loading">🔄 Cargando resúmenes...</div>
      )}

      <div className="summaries-container">
        {summaries.map(summary => (
          <div key={summary.id} className="summary-card">
            <div className="summary-header" onClick={() => toggleSummary(summary.id)}>
              <h4>{summary.title}</h4>
              <div className="summary-meta">
                <span>📅 {new Date(summary.created_at).toLocaleDateString()}</span>
                <div className="summary-controls">
                  <button 
                    className="delete-summary-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSummary(summary.id, summary.title);
                    }}
                    title="Eliminar resumen"
                  >
                    🗑️
                  </button>
                  <span className="expand-icon">
                    {expandedSummary === summary.id ? '➖' : '➕'}
                  </span>
                </div>
              </div>
            </div>
            
            {expandedSummary === summary.id && (
              <div className="summary-content">
                <div className="summary-section">
                  <h5>📊 Resumen y Análisis Crítico:</h5>
                  <div className="summary-text">
                    <pre>{summary.summary}</pre>
                  </div>
                </div>
                
                {summary.keywords && (
                  <div className="summary-section">
                    <h5>🔍 Palabras Clave:</h5>
                    <div className="keywords">
                      {summary.keywords.split(',').map((keyword, index) => (
                        <span key={index} className="keyword-tag">
                          {keyword.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="summary-actions">
                  <button className="export-btn">
                    📤 Exportar PDF
                  </button>
                  <button className="share-btn">
                    📤 Compartir
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedFolder && summaries.length === 0 && !loading && (
        <div className="empty-state">
          <p>📄 No hay resúmenes en esta carpeta</p>
          <p>Comienza subiendo documentos PDF para generar resúmenes científicos</p>
        </div>
      )}

      {!selectedFolder && (
        <div className="empty-state">
          <p>📁 Selecciona una carpeta temática para ver sus resúmenes</p>
        </div>
      )}
    </div>
  );
};

export default SummaryView;