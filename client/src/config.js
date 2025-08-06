// Configuración de la API
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' 
  : 'http://localhost:5001';

// Helper para construir URLs de API
export const apiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;