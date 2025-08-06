import React, { useState } from 'react';
import './FileUpload.css';

const FileUpload = ({ folders, onFolderCreated }) => {
  // Added reanalyze and clear buttons - v2.0
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [title, setTitle] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setAnalysis(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
        setTitle(data.filename.replace('.pdf', ''));
      } else {
        alert('Error procesando el archivo');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }

    setLoading(false);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newFolderName }),
      });

      if (response.ok) {
        setNewFolderName('');
        onFolderCreated();
        alert('Carpeta creada exitosamente');
      } else {
        alert('Error creando la carpeta');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const handleSaveSummary = async () => {
    if (!analysis || !selectedFolder || !title.trim()) {
      alert('Por favor complete todos los campos');
      return;
    }

    try {
      const response = await fetch('/api/summaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderId: selectedFolder,
          title: title,
          originalText: analysis.originalText,
          summary: analysis.analysis,
          criticalAnalysis: analysis.analysis,
          keywords: 'medicina del deporte'
        }),
      });

      if (response.ok) {
        alert('Resumen guardado exitosamente');
        setFile(null);
        setAnalysis(null);
        setTitle('');
        setSelectedFolder('');
      } else {
        alert('Error guardando el resumen');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const handleReanalyze = async () => {
    if (!file) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      } else {
        alert('Error reanalización el archivo');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }

    setLoading(false);
  };

  const handleClear = () => {
    setFile(null);
    setAnalysis(null);
    setTitle('');
    setSelectedFolder('');
    setNewFolderName('');
    // Reset file input
    const fileInput = document.querySelector('.file-input');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="file-upload">
      <div className="upload-section">
        <h2>📄 Subir Documento PDF</h2>
        
        <div className="file-input-container">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="file-input"
          />
          <button 
            onClick={handleUpload} 
            disabled={!file || loading}
            className="upload-btn"
          >
            {loading ? '🔄 Analizando...' : '🚀 Analizar Documento'}
          </button>
        </div>

        {file && (
          <div className="file-info">
            <p>📁 Archivo seleccionado: {file.name}</p>
          </div>
        )}
      </div>

      {analysis && (
        <div className="analysis-section">
          <h3>📊 Análisis Generado</h3>
          
          <div className="save-controls">
            <input
              type="text"
              placeholder="Título del documento"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="title-input"
            />
            
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="folder-select"
            >
              <option value="">Seleccionar carpeta temática</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>

            <div className="new-folder-section">
              <input
                type="text"
                placeholder="Nueva carpeta temática"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="new-folder-input"
              />
              <button onClick={handleCreateFolder} className="create-folder-btn">
                ➕ Crear Carpeta
              </button>
            </div>

            <div className="action-buttons">
              <button 
                onClick={handleSaveSummary}
                className="save-btn"
                disabled={!selectedFolder || !title.trim()}
              >
                💾 Guardar Resumen
              </button>
              
              <button 
                onClick={handleReanalyze}
                className="reanalyze-btn"
                disabled={loading}
              >
                {loading ? '🔄 Reanalizado...' : '🔄 Reanálizar'}
              </button>
              
              <button 
                onClick={handleClear}
                className="clear-btn"
              >
                🗑️ Limpiar Todo
              </button>
            </div>
          </div>

          <div className="analysis-content">
            <pre>{analysis.analysis}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;