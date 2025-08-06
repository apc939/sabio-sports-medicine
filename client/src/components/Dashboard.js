import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { apiUrl } from '../config';

const Dashboard = ({ selectedFolder, folders, onFolderCreated, showToast }) => {
  const [view, setView] = useState('overview');
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [showTitleEditor, setShowTitleEditor] = useState(false);
  const [summaries, setSummaries] = useState([]);
  const [expandedSummary, setExpandedSummary] = useState(null);
  const [stateOfArt, setStateOfArt] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (selectedFolder) {
      fetch(apiUrl(`/api/summaries/${selectedFolder.id}`))
        .then(response => response.json())
        .then(data => setSummaries(data))
        .catch(error => console.error('Error:', error));

      fetch(apiUrl(`/api/state-of-art/${selectedFolder.id}`))
        .then(response => response.json())
        .then(data => setStateOfArt(data))
        .catch(error => console.error('Error:', error));
    } else {
      setSummaries([]);
      setStateOfArt(null);
    }
  }, [selectedFolder]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setAnalysis(null);
    setTitle(selectedFile?.name.replace('.pdf', '') || '');
  };

  const handleUpload = async () => {
    if (!file) {
      showToast('Por favor selecciona un archivo PDF', 'warning');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(apiUrl('/api/upload'), {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
        setTitleSuggestions(data.titleSuggestions || []);
        setShowTitleEditor(true);
        showToast('Documento analizado exitosamente', 'success');
      } else {
        showToast('Error procesando el archivo', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearAnalysisData = () => {
    setFile(null);
    setAnalysis(null);
    setTitle('');
    setTitleSuggestions([]);
    setShowTitleEditor(false);
  };

  const handleDiscardAnalysis = () => {
    if (window.confirm('¿Estás seguro de que quieres descartar este análisis?')) {
      clearAnalysisData();
      showToast('Análisis descartado', 'info');
    }
  };

  const handleBackFromUpload = () => {
    if (analysis && !window.confirm('¿Salir sin guardar? Se perderá el análisis actual.')) {
      return;
    }
    clearAnalysisData();
    setView('overview');
  };

  const handleSaveSummary = async () => {
    if (!analysis || !selectedFolder || !title.trim()) {
      showToast('Por favor completa todos los campos requeridos', 'warning');
      return;
    }

    try {
      const response = await fetch(apiUrl('/api/summaries'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderId: selectedFolder.id,
          title,
          originalText: analysis.originalText,
          summary: analysis.analysis,
          criticalAnalysis: analysis.analysis,
          keywords: 'medicina del deporte'
        }),
      });

      if (response.ok) {
        showToast('Resumen guardado exitosamente', 'success');
        clearAnalysisData();
        // Refetch summaries
        fetch(apiUrl(`/api/summaries/${selectedFolder.id}`))
          .then(response => response.json())
          .then(data => setSummaries(data));
        onFolderCreated();
      } else {
        const errorData = await response.json();
        showToast(`Error guardando el resumen: ${errorData.error || 'Error desconocido'}`, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error de conexión', 'error');
    }
  };

  const handleDeleteSummary = async (summaryId, summaryTitle) => {
    if (!window.confirm(`¿Eliminar "${summaryTitle}"?`)) return;

    try {
      const response = await fetch(apiUrl(`/api/summaries/${summaryId}`), {
        method: 'DELETE',
      });

      if (response.ok) {
        fetch(apiUrl(`/api/summaries/${selectedFolder.id}`))
          .then(response => response.json())
          .then(data => setSummaries(data));
        onFolderCreated();
        showToast('Resumen eliminado exitosamente', 'success');
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error de conexión', 'error');
    }
  };

  const generateStateOfArt = async () => {
    if (!selectedFolder) return;

    setGenerating(true);
    try {
      const response = await fetch(apiUrl(`/api/state-of-art/${selectedFolder.id}`), {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setStateOfArt({ content: data.content, created_at: new Date().toISOString() });
        showToast('Estado del arte generado exitosamente', 'success');
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error de conexión', 'error');
    } finally {
      setGenerating(false);
    }
  };

  if (view === 'upload') {
    return (
      <div className="dashboard">
        <div className="upload-section">
          <div className="section-header">
            <h2>Subir Documento</h2>
            <button className="back-btn" onClick={handleBackFromUpload}>← Volver</button>
          </div>

          <div className="upload-area">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="file-input"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="file-label">
              {file ? `📄 ${file.name}` : '📁 selecciona archivo PDF'}
            </label>
            
            <button 
              onClick={handleUpload} 
              disabled={!file || loading}
              className="upload-btn"
            >
              {loading ? 'analizando...' : 'analizar documento'}
            </button>
          </div>

          {analysis && (
            <div className="analysis-result">
              <h3>análisis generado</h3>
              
              <div className="save-controls">
                <input
                  type="text"
                  placeholder="título del documento"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="title-input"
                />
                
                {titleSuggestions.length > 0 && showTitleEditor && (
                  <div className="title-suggestions">
                    <h4>✨ Sugerencias de títulos:</h4>
                    <div className="suggestions-list">
                      {titleSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="suggestion-btn"
                          onClick={() => {
                            setTitle(suggestion);
                            setShowTitleEditor(false);
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedFolder && (
                  <div className="selected-folder-info">
                    guardar en: <span className="folder-name">{selectedFolder.name}</span>
                  </div>
                )}

                <div className="action-buttons">
                  <button 
                    onClick={handleSaveSummary}
                    className="save-btn"
                    disabled={!selectedFolder || !title.trim()}
                  >
                    Guardar Resumen
                  </button>
                  <button 
                    onClick={handleDiscardAnalysis}
                    className="discard-btn"
                  >
                    Descartar Análisis
                  </button>
                </div>
              </div>

              <div className="analysis-content">
                <pre>{analysis.analysis}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'summaries') {
    return (
      <div className="dashboard">
        <div className="summaries-section">
          <div className="section-header">
            <h2>Resúmenes - {selectedFolder?.name}</h2>
            <button className="back-btn" onClick={() => setView('overview')}>← Volver</button>
          </div>

          {summaries.length === 0 ? (
            <div className="folder-empty-state">
              <div className="empty-content">
                <div className="empty-icon">📚</div>
                <h3>Carpeta Vacía</h3>
                <p>Esta Carpeta Está Esperando Su Primera Investigación</p>
                <button className="upload-btn" onClick={() => setView('upload')}>
                  📄 Subir Primer Documento
                </button>
              </div>
            </div>
          ) : (
            <div className="summaries-list">
              {summaries.map(summary => (
                <div key={summary.id} className="summary-card">
                  <div className="summary-header">
                    <div 
                      className="summary-title-section clickable-title" 
                      onClick={() => setExpandedSummary(expandedSummary === summary.id ? null : summary.id)}
                    >
                      <h4>{summary.title}</h4>
                    </div>
                    <div className="summary-controls">
                      <span className="summary-date">
                        {new Date(summary.created_at).toLocaleDateString()}
                      </span>
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSummary(summary.id, summary.title);
                        }}
                      >
                        ×
                      </button>
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
      </div>
    );
  }

  if (view === 'research') {
    return (
      <div className="dashboard">
        <div className="research-section">
          <div className="section-header">
            <h2>estado del arte - {selectedFolder?.name}</h2>
            <button className="back-btn" onClick={() => setView('overview')}>← Volver</button>
          </div>

          {summaries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔬</div>
              <h3>necesitas resúmenes</h3>
              <p>sube y analiza documentos primero para generar un estado del arte</p>
              <button className="upload-btn" onClick={() => setView('upload')}>
                Subir Documento
              </button>
            </div>
          ) : (
            <div className="research-content">
              <div className="generate-section">
                <button
                  onClick={generateStateOfArt}
                  disabled={generating}
                  className="generate-btn"
                >
                  {generating ? 'Generando...' : 'Generar Estado del Arte'}
                </button>
                <p>Se Analizarán {summaries.length} Resúmenes Para Crear Una Síntesis Integral</p>
              </div>

              {stateOfArt && stateOfArt.content && (
                <div className="state-of-art-result">
                  <div className="result-header">
                    <h3>estado del arte generado</h3>
                    <span>{new Date(stateOfArt.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="result-content">
                    <pre>{stateOfArt.content}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Overview (default)
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

        <div className="quick-actions">
          <div className="action-card" onClick={() => setView('upload')}>
            <div className="action-icon">📄</div>
            <h3>Subir Documento</h3>
            <p>Analizar Nueva Literatura Científica</p>
          </div>

          {selectedFolder && (
            <>
              <div className="action-card" onClick={() => setView('summaries')}>
                <div className="action-icon">📋</div>
                <h3>Ver Resúmenes</h3>
                <p>{summaries.length} Documentos en {selectedFolder.name}</p>
              </div>
              <div className="action-card" onClick={() => setView('research')}>
                <div className="action-icon">🔬</div>
                <h3>Estado del Arte</h3>
                <p>Síntesis de Investigación Actual</p>
              </div>
            </>
          )}
        </div>

        {!selectedFolder && (
          <div className="platform-guide">
            <h3>Comienza Tu Investigación</h3>
            <p>Selecciona una carpeta del sidebar o crea una nueva para organizar tu literatura científica</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;