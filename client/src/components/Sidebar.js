import React, { useState } from 'react';
import './Sidebar.css';
import './SidebarExtensions.css';
import { apiUrl } from '../config';

const Sidebar = ({ 
  folders, 
  selectedFolder, 
  onFolderSelect, 
  onCreateFolder,
  folderCounts = {},
  showToast,
  currentParentId = null,
  navigationPath = []
}) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showSubfolderModal, setShowSubfolderModal] = useState(false);
  const [subfolderParent, setSubfolderParent] = useState(null);
  const [subfolderName, setSubfolderName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [subfolders, setSubfolders] = useState({});

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      showToast('Por favor ingresa un nombre para la carpeta', 'warning');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch(apiUrl('/api/folders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newFolderName, parent_id: currentParentId }),
      });

      if (response.ok) {
        setNewFolderName('');
        onCreateFolder();
        showToast('Carpeta creada exitosamente', 'success');
      } else {
        showToast('Error creando la carpeta', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error de conexión', 'error');
    }
    setIsCreating(false);
  };

  const handleCreateSubfolder = async () => {
    if (!subfolderName.trim()) {
      showToast('Por favor ingresa un nombre para la subcarpeta', 'warning');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch(apiUrl('/api/folders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: subfolderName, parent_id: subfolderParent.id }),
      });

      if (response.ok) {
        setSubfolderName('');
        setShowSubfolderModal(false);
        setSubfolderParent(null);
        onCreateFolder();
        showToast(`Subcarpeta creada en "${subfolderParent.name}"`, 'success');
      } else {
        showToast('Error creando la subcarpeta', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error de conexión', 'error');
    }
    setIsCreating(false);
  };

  const handleDeleteFolder = async (folderId, folderName, event) => {
    event.stopPropagation();
    
    if (!window.confirm(`¿Eliminar "${folderName}" y todo su contenido?`)) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/folders/${folderId}`), {
        method: 'DELETE',
      });

      if (response.ok) {
        onCreateFolder(); // Refresh folders
        showToast('Carpeta eliminada exitosamente', 'success');
        if (selectedFolder?.id === folderId) {
          onFolderSelect(null);
        }
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error de conexión', 'error');
    }
  };

  const toggleFolderExpansion = async (folderId) => {
    const newExpanded = new Set(expandedFolders);
    
    if (expandedFolders.has(folderId)) {
      // Contraer
      newExpanded.delete(folderId);
      const newSubfolders = { ...subfolders };
      delete newSubfolders[folderId];
      setSubfolders(newSubfolders);
    } else {
      // Expandir
      newExpanded.add(folderId);
      try {
        const response = await fetch(apiUrl(`/api/folders-with-counts?parent_id=${folderId}`));
        if (response.ok) {
          const data = await response.json();
          setSubfolders(prev => ({ ...prev, [folderId]: data }));
        }
      } catch (error) {
        console.error('Error fetching subfolders:', error);
        showToast('Error cargando subcarpetas', 'error');
        return;
      }
    }
    
    setExpandedFolders(newExpanded);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Folders</h2>
        {navigationPath.length > 0 && (
          <nav className="sidebar-breadcrumb">
            <button 
              className="breadcrumb-home"
              onClick={() => onFolderSelect(null, true)}
              title="Ir a la raíz"
            >
              🏠
            </button>
            {navigationPath.map((pathItem, index) => (
              <React.Fragment key={`${pathItem.id}-${index}`}>
                <span className="breadcrumb-sep">›</span>
                <button 
                  className="breadcrumb-folder"
                  onClick={() => onFolderSelect(pathItem, true)}
                  title={`Ir a ${pathItem.name}`}
                >
                  {pathItem.name}
                </button>
              </React.Fragment>
            ))}
          </nav>
        )}
        <div className="folder-stats">
          {folders.length} {currentParentId ? 'Subcarpetas' : 'Carpetas'}
        </div>
      </div>

      <div className="new-folder-section">
        <input
          type="text"
          placeholder={currentParentId ? "Nueva Subcarpeta..." : "Nueva Carpeta..."}
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          className="new-folder-input"
          onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
        />
        <button 
          onClick={handleCreateFolder}
          disabled={isCreating}
          className="create-folder-btn"
        >
          {isCreating ? '...' : '+'}
        </button>
      </div>

      <div className="folders-list">
        {folders.map(folder => {
          const count = folderCounts[folder.id] || 0;
          const isActive = selectedFolder?.id === folder.id;
          const isExpanded = expandedFolders.has(folder.id);
          const folderSubfolders = subfolders[folder.id] || [];
          
          return (
            <React.Fragment key={folder.id}>
              <div 
                className={`folder-item ${isActive ? 'active' : ''}`}
                onClick={() => onFolderSelect(folder)}
              >
                <div className="folder-info">
                  <div className="folder-name">
                    <span className="folder-icon">
                      {folder.subfolder_count > 0 ? '📂' : '📁'}
                    </span>
                    {folder.name}
                    {folder.subfolder_count > 0 && (
                      <span className="subfolder-indicator"> ({folder.subfolder_count} sub)</span>
                    )}
                  </div>
                  <div className="folder-count">{count} docs</div>
                </div>
                <div className="folder-buttons">
                  {folder.subfolder_count > 0 && (
                    <button
                      className="expand-folder-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFolderExpansion(folder.id);
                      }}
                      title={isExpanded ? "Contraer subcarpetas" : "Expandir subcarpetas"}
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  )}
                  {currentParentId && (
                    <button
                      className="back-folder-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        const parentFolder = navigationPath.length > 1 
                          ? navigationPath[navigationPath.length - 2] 
                          : null;
                        onFolderSelect(parentFolder, true);
                      }}
                      title="Volver"
                    >
                      ↑
                    </button>
                  )}
                  <button
                    className="create-subfolder-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSubfolderParent(folder);
                      setSubfolderName('');
                      setShowSubfolderModal(true);
                    }}
                    title="Crear subcarpeta"
                  >
                    📁+
                  </button>
                  <button
                    className="delete-folder-btn"
                    onClick={(e) => handleDeleteFolder(folder.id, folder.name, e)}
                    title="Eliminar carpeta"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              {/* Subcarpetas expandidas inline */}
              {isExpanded && folderSubfolders.map(subfolder => {
                const subCount = folderCounts[subfolder.id] || 0;
                const isSubActive = selectedFolder?.id === subfolder.id;
                
                return (
                  <div 
                    key={`sub-${subfolder.id}`}
                    className={`folder-item subfolder-item ${isSubActive ? 'active' : ''}`}
                    onClick={() => onFolderSelect(subfolder)}
                  >
                    <div className="folder-info">
                      <div className="folder-name">
                        <span className="subfolder-indent">└─</span>
                        <span className="folder-icon">
                          {subfolder.subfolder_count > 0 ? '📂' : '📁'}
                        </span>
                        {subfolder.name}
                        {subfolder.subfolder_count > 0 && (
                          <span className="subfolder-indicator"> ({subfolder.subfolder_count} sub)</span>
                        )}
                      </div>
                      <div className="folder-count">{subCount} docs</div>
                    </div>
                    <div className="folder-buttons">
                      <button
                        className="nav-into-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFolderSelect(subfolder, true);
                        }}
                        title={`Navegar a ${subfolder.name}`}
                      >
                        →
                      </button>
                      <button
                        className="create-subfolder-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSubfolderParent(subfolder);
                          setSubfolderName('');
                          setShowSubfolderModal(true);
                        }}
                        title="Crear subcarpeta"
                      >
                        📁+
                      </button>
                      <button
                        className="delete-folder-btn"
                        onClick={(e) => handleDeleteFolder(subfolder.id, subfolder.name, e)}
                        title="Eliminar subcarpeta"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>

      {folders.length === 0 && (
        <div className="empty-folders">
          <div className="empty-icon">📁</div>
          <p>{currentParentId ? 'No Hay Subcarpetas Aún' : 'No Hay Carpetas Aún'}</p>
          <small>{currentParentId ? 'Crea Tu Primera Subcarpeta' : 'Crea Tu Primera Carpeta Temática'}</small>
        </div>
      )}

      <div className="sidebar-footer">
        <div className="quick-stats">
          <div className="stat">
            <span className="stat-value">{Object.values(folderCounts).reduce((a, b) => a + b, 0)}</span>
            <span className="stat-label">Documentos</span>
          </div>
        </div>
      </div>

      {/* Subfolder Creation Modal */}
      {showSubfolderModal && (
        <div className="modal-overlay" onClick={() => setShowSubfolderModal(false)}>
          <div className="subfolder-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Crear Subcarpeta</h3>
              <button 
                className="modal-close"
                onClick={() => setShowSubfolderModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="parent-info">
                <span className="parent-label">Carpeta padre:</span>
                <span className="parent-name">📂 {subfolderParent?.name}</span>
              </div>
              <input
                type="text"
                placeholder="Nombre de la subcarpeta..."
                value={subfolderName}
                onChange={(e) => setSubfolderName(e.target.value)}
                className="subfolder-input"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateSubfolder()}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowSubfolderModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="create-btn"
                onClick={handleCreateSubfolder}
                disabled={isCreating || !subfolderName.trim()}
              >
                {isCreating ? '⏳ Creando...' : '📁 Crear Subcarpeta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;