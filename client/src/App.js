import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AIChat from './components/AIChat';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';
import { apiUrl } from './config';

function App() {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folders, setFolders] = useState([]);
  const [folderCounts, setFolderCounts] = useState({});
  const [summaries, setSummaries] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentParentId, setCurrentParentId] = useState(null);
  const [navigationPath, setNavigationPath] = useState([]);
  
  const { toasts, removeToast, showSuccess, showError, showWarning, showInfo } = useToast();

  useEffect(() => {
    fetchFoldersWithCounts();
  }, []);

  useEffect(() => {
    if (folders.length > 0) {
      fetchAllSummaries();
    }
  }, [folders]);

  const fetchAllSummaries = async () => {
    try {
      const allSummaries = await Promise.all(
        folders.map(async folder => {
          try {
            const response = await fetch(apiUrl(`/api/summaries/${folder.id}`));
            return response.ok ? response.json() : [];
          } catch {
            return [];
          }
        })
      );
      setSummaries(allSummaries.flat());
    } catch (error) {
      console.error('Error fetching all summaries:', error);
    }
  };

  const fetchFoldersWithCounts = async (parentId = null) => {
    try {
      const urlParams = new URLSearchParams();
      if (parentId) urlParams.append('parent_id', parentId);
      
      const url = apiUrl(`/api/folders-with-counts?${urlParams}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setFolders(data);
      
      const counts = {};
      data.forEach(folder => {
        counts[folder.id] = folder.summary_count;
      });
      setFolderCounts(counts);
    } catch (error) {
      console.error('Error fetching folders:', error);
      showError(`Error cargando carpetas: ${error.message}`);
    }
  };

  const handleFolderCreated = () => {
    fetchFoldersWithCounts(currentParentId);
  };

  const handleFolderSelect = (folder, isNavigation = false) => {
    if (isNavigation) {
      if (folder === null) {
        setNavigationPath([]);
        setCurrentParentId(null);
        setSelectedFolder(null);
        fetchFoldersWithCounts(null);
        return;
      }

      const folderIndex = navigationPath.findIndex(pathFolder => pathFolder.id === folder.id);
      
      if (folderIndex >= 0) {
        const newPath = navigationPath.slice(0, folderIndex + 1);
        setNavigationPath(newPath);
      } else {
        const isAlreadyInPath = navigationPath.some(item => item.id === folder.id);
        if (!isAlreadyInPath && folder.id !== null) {
          setNavigationPath(prev => [...prev, folder]);
        }
      }
      
      setCurrentParentId(folder.id);
      setSelectedFolder(null);
      fetchFoldersWithCounts(folder.id);
    } else {
      setSelectedFolder(folder);
    }
  };

  const showToast = (message, type = 'info') => {
    if (type === 'success') showSuccess(message);
    else if (type === 'error') showError(message);
    else if (type === 'warning') showWarning(message);
    else showInfo(message);
  };

  return (
    <div className="App">
      <Sidebar
        folders={folders}
        selectedFolder={selectedFolder}
        onFolderSelect={handleFolderSelect}
        onCreateFolder={handleFolderCreated}
        folderCounts={folderCounts}
        showToast={showToast}
        currentParentId={currentParentId}
        navigationPath={navigationPath}
      />
      
      <Dashboard
        selectedFolder={selectedFolder}
        folders={folders}
        onFolderCreated={handleFolderCreated}
        showToast={showToast}
      />

      <AIChat 
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        folders={folders}
        summaries={summaries}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
