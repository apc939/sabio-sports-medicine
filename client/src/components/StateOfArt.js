import React, { useState, useEffect } from 'react';
import './StateOfArt.css';

const StateOfArt = ({ folders, selectedFolder, onFolderSelected }) => {
  const [stateOfArt, setStateOfArt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (selectedFolder) {
      fetchStateOfArt(selectedFolder.id);
    }
  }, [selectedFolder]);

  const fetchStateOfArt = async (folderId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/state-of-art/${folderId}`);
      const data = await response.json();
      setStateOfArt(data);
    } catch (error) {
      console.error('Error fetching state of art:', error);
    }
    setLoading(false);
  };

  const generateStateOfArt = async (folderId) => {
    setGenerating(true);
    try {
      const response = await fetch(`/api/state-of-art/${folderId}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setStateOfArt({ content: data.content, created_at: new Date().toISOString() });
      } else {
        const error = await response.json();
        alert(error.error || 'Error generando el estado del arte');
      }
    } catch (error) {
      console.error('Error generating state of art:', error);
      alert('Error de conexión');
    }
    setGenerating(false);
  };

  const handleFolderSelect = (folder) => {
    onFolderSelected(folder);
    fetchStateOfArt(folder.id);
  };

  return (
    <div className="state-of-art">
      <h2>🔬 Estado del Arte</h2>
      <p className="description">
        Síntesis integral del conocimiento científico actual basado en todos los resúmenes de la carpeta temática
      </p>
      
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
          
          <div className="generate-section">
            <button
              onClick={() => generateStateOfArt(selectedFolder.id)}
              disabled={generating}
              className="generate-btn"
            >
              {generating ? '🔄 Generando Estado del Arte...' : '🚀 Generar Estado del Arte'}
            </button>
            <p className="generate-info">
              Este proceso analizará todos los resúmenes de la carpeta para crear una síntesis integral
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading">🔄 Cargando estado del arte...</div>
      )}

      {stateOfArt && stateOfArt.content && (
        <div className="state-of-art-content">
          <div className="content-header">
            <h3>📊 Estado del Arte - {selectedFolder?.name}</h3>
            <p className="generated-date">
              📅 Generado: {new Date(stateOfArt.created_at).toLocaleString()}
            </p>
          </div>
          
          <div className="content-body">
            <pre>{stateOfArt.content}</pre>
          </div>
          
          <div className="content-actions">
            <button className="export-btn">
              📤 Exportar PDF
            </button>
            <button className="share-btn">
              📧 Compartir por Email
            </button>
            <button className="print-btn">
              🖨️ Imprimir
            </button>
          </div>
        </div>
      )}

      {selectedFolder && !stateOfArt?.content && !loading && !generating && (
        <div className="empty-state">
          <div className="empty-icon">🔬</div>
          <h3>Estado del Arte no disponible</h3>
          <p>Genera un estado del arte basado en los resúmenes de esta carpeta</p>
          <p className="hint">
            💡 Necesitas tener al menos un resumen guardado en la carpeta para poder generar el estado del arte
          </p>
        </div>
      )}

      {!selectedFolder && (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>Selecciona una carpeta temática</h3>
          <p>Elige una carpeta para ver o generar su estado del arte</p>
        </div>
      )}

      <div className="info-section">
        <h4>❓ ¿Qué es el Estado del Arte?</h4>
        <div className="info-grid">
          <div className="info-card">
            <h5>📊 Síntesis General</h5>
            <p>Resumen del conocimiento científico actual en el área temática</p>
          </div>
          <div className="info-card">
            <h5>📈 Tendencias</h5>
            <p>Identificación de patrones y direcciones de la investigación</p>
          </div>
          <div className="info-card">
            <h5>🔍 Gaps de Investigación</h5>
            <p>Áreas que requieren más estudio y desarrollo</p>
          </div>
          <div className="info-card">
            <h5>💡 Recomendaciones</h5>
            <p>Guías prácticas para la aplicación clínica</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StateOfArt;