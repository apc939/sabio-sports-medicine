import React, { useState } from 'react';
import './FolderManager.css';

const FolderManager = ({ folders, onFolderCreated, onFolderSelected, currentParentId = null, parentPath = [] }) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newFolderName, parent_id: currentParentId }),
      });

      if (response.ok) {
        setNewFolderName('');
        onFolderCreated();
        alert('Carpeta creada exitosamente');
      } else {
        const errorData = await response.json();
        if (errorData.error && errorData.error.includes('UNIQUE constraint failed')) {
          alert('Ya existe una carpeta con ese nombre. Por favor, elige un nombre diferente.');
        } else {
          alert(`Error creando la carpeta: ${errorData.error || 'Error desconocido'}`);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const handleDeleteFolder = async (folderId, folderName, event) => {
    event.stopPropagation(); // Evitar que se active el onClick del card
    
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar la carpeta "${folderName}"?\n\n` +
      `Esta acción eliminará:\n` +
      `• Todos los resúmenes dentro de la carpeta\n` +
      `• El estado del arte generado\n` +
      `• La carpeta completa\n\n` +
      `Esta acción NO se puede deshacer.`
    );
    
    if (!confirmDelete) return;

    try {
      console.log(`Attempting to delete folder ${folderId} - ${folderName}`);
      
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('Delete result:', result);
        onFolderCreated(); // Refrescar la lista
        alert('Carpeta eliminada exitosamente');
      } else {
        const errorText = await response.text();
        console.error('Delete error response:', errorText);
        
        let errorMessage = 'Error desconocido';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        alert(`Error eliminando la carpeta: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert(`Error de conexión: ${error.message}`);
    }
  };

  const toggleFolderExpansion = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleSubfolderNavigation = (folder) => {
    onFolderSelected(folder, true); // true indica navegación a subcarpeta
  };

  const FolderCard = ({ folder, level = 0 }) => {
    const hasSubfolders = folder.subfolder_count > 0;
    const isExpanded = expandedFolders.has(folder.id);
    
    return (
      <div className={`folder-card level-${level}`}>
        <div className="folder-main">
          <div className="folder-left">
            {hasSubfolders && (
              <button 
                className="expand-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolderExpansion(folder.id);
                }}
              >
                {isExpanded ? '📂' : '📁'}
              </button>
            )}
            {!hasSubfolders && <span className="folder-icon">📁</span>}
          </div>
          
          <div 
            className="folder-content"
            onClick={() => onFolderSelected(folder)}
          >
            <h3>{folder.name}</h3>
            <div className="folder-stats">
              <span>📄 {folder.summary_count || 0} documentos</span>
              {hasSubfolders && <span>📁 {folder.subfolder_count} subcarpetas</span>}
            </div>
            <p>Creada: {new Date(folder.created_at).toLocaleDateString()}</p>
          </div>
          
          <div className="folder-actions">
            {hasSubfolders && (
              <button 
                className="explore-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubfolderNavigation(folder);
                }}
                title="Explorar subcarpetas"
              >
                📂 Explorar
              </button>
            )}
            <button 
              className="delete-folder-btn"
              onClick={(e) => handleDeleteFolder(folder.id, folder.name, e)}
              title="Eliminar carpeta"
            >
              ❌
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="folder-manager">
      <div className="folder-header">
        <div className="header-top">
          <h2>📁 Gestión de Carpetas Temáticas</h2>
          {parentPath.length > 0 && (
            <button 
              className="back-btn"
              onClick={() => {
                if (parentPath.length > 0) {
                  const parentFolder = parentPath[parentPath.length - 1];
                  onFolderSelected(parentFolder, true);
                } else {
                  onFolderSelected(null, true);
                }
              }}
              title="Volver al nivel anterior"
            >
              ← Volver
            </button>
          )}
        </div>
        {parentPath.length > 0 && (
          <nav className="breadcrumb">
            <button 
              className="breadcrumb-item root"
              onClick={() => onFolderSelected(null, true)}
            >
              🏠 Inicio
            </button>
            {parentPath.map((pathItem, index) => (
              <React.Fragment key={pathItem.id}>
                <span className="breadcrumb-separator">›</span>
                <button 
                  className="breadcrumb-item"
                  onClick={() => onFolderSelected(pathItem, true)}
                >
                  {pathItem.name}
                </button>
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>
      
      <div className="create-folder-section">
        <input
          type="text"
          placeholder={currentParentId ? "Nombre de la subcarpeta..." : "Nombre de la nueva carpeta temática (ej: Lesiones Deportivas, Rendimiento, Nutrición)"}
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          className="folder-name-input"
        />
        <button onClick={handleCreateFolder} className="create-btn">
          ➕ {currentParentId ? 'Crear Subcarpeta' : 'Crear Carpeta'}
        </button>
      </div>

      <div className="folders-list">
        {folders.map(folder => (
          <FolderCard key={folder.id} folder={folder} level={0} />
        ))}
      </div>

      {folders.length === 0 && (
        <div className="empty-state">
          <p>🏗️ {currentParentId ? 'No Hay Subcarpetas Creadas Aún' : 'No Hay Carpetas Creadas Aún'}</p>
          <p>{currentParentId ? 'Crea Subcarpetas Para Organizar Mejor Tu Contenido' : 'Crea Tu Primera Carpeta Temática Para Organizar La Literatura Científica'}</p>
        </div>
      )}

      <div className="folder-suggestions">
        <h3>💡 Sugerencias De Carpetas Temáticas:</h3>
        <div className="suggestions-grid">
          <div className="suggestion-card">
            <h4>🦴 Lesiones Deportivas</h4>
            <small>Prevención, Tratamiento y Rehabilitación</small>
          </div>
          <div className="suggestion-card">
            <h4>⚡ Rendimiento Deportivo</h4>
            <small>Entrenamiento, Fatiga y Optimización</small>
          </div>
          <div className="suggestion-card">
            <h4>🍎 Nutrición Deportiva</h4>
            <small>Suplementación y Estrategias Nutricionales</small>
          </div>
          <div className="suggestion-card">
            <h4>🧠 Psicología del Deporte</h4>
            <small>Aspectos Mentales y Motivacionales</small>
          </div>
          <div className="suggestion-card">
            <h4>🔬 Fisiología del Ejercicio</h4>
            <small>Adaptaciones y Respuestas Fisiológicas</small>
          </div>
          <div className="suggestion-card">
            <h4>⚕️ Medicina Preventiva</h4>
            <small>Promoción De Salud y Prevención</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolderManager;