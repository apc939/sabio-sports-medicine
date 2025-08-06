import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import AIChat from './components/AIChat'
import './App.css'

// Datos de demostración
const demoFolders = [
  { id: 1, name: "Lesiones Deportivas", summary_count: 25, subfolder_count: 5 },
  { id: 2, name: "Rendimiento Deportivo", summary_count: 25, subfolder_count: 5 },
  { id: 3, name: "Nutrición Deportiva", summary_count: 25, subfolder_count: 5 },
  { id: 4, name: "Rehabilitación", summary_count: 25, subfolder_count: 5 },
  { id: 5, name: "Psicología del Deporte", summary_count: 25, subfolder_count: 5 },
  { id: 6, name: "Fisiología del Ejercicio", summary_count: 25, subfolder_count: 5 },
  { id: 7, name: "Medicina Preventiva", summary_count: 25, subfolder_count: 5 },
  { id: 8, name: "Dopaje y Antidoping", summary_count: 25, subfolder_count: 5 },
  { id: 9, name: "Deporte Femenino", summary_count: 25, subfolder_count: 5 },
  { id: 10, name: "Deportes Específicos", summary_count: 25, subfolder_count: 5 }
]

const demoSummaries = {
  1: [
    {
      id: 1,
      title: "Efectividad de la Reconstrucción del LCA con Injerto de Tendón Rotuliano vs Isquiotibiales",
      summary: "RESUMEN EJECUTIVO: Estudio comparativo sobre técnicas de reconstrucción del LCA...",
      created_at: "2024-01-15"
    },
    {
      id: 2,
      title: "Programas de Prevención de Lesiones del LCA en Fútbol Femenino",
      summary: "ANÁLISIS: Evaluación de programas preventivos específicos para atletas femeninas...",
      created_at: "2024-01-10"
    }
  ]
}

function App() {
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [folders] = useState(demoFolders)
  const [summaries] = useState(demoSummaries)

  const handleFolderSelect = (folder) => {
    setSelectedFolder(folder)
  }

  return (
    <div className="App">
      <Sidebar
        folders={folders}
        selectedFolder={selectedFolder}
        onFolderSelect={handleFolderSelect}
      />
      
      <Dashboard
        selectedFolder={selectedFolder}
        summaries={summaries[selectedFolder?.id] || []}
      />

      <AIChat 
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        folders={folders}
        summaries={Object.values(summaries).flat()}
      />
    </div>
  )
}

export default App