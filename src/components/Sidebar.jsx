import React from 'react'
import './Sidebar.css'

const Sidebar = ({ folders, selectedFolder, onFolderSelect }) => {
  const totalDocuments = folders.reduce((sum, folder) => sum + folder.summary_count, 0)

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Folders</h2>
        <div className="folder-stats">
          {folders.length} Carpetas
        </div>
      </div>

      <div className="folders-list">
        {folders.map(folder => (
          <div 
            key={folder.id}
            className={`folder-item ${selectedFolder?.id === folder.id ? 'active' : ''}`}
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
              <div className="folder-count">{folder.summary_count} docs</div>
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="quick-stats">
          <div className="stat">
            <span className="stat-value">{totalDocuments}</span>
            <span className="stat-label">Documentos</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar