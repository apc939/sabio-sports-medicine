# 🏥 Sabio Sports Medicine

Plataforma de Literatura Científica para Medicina del Deporte - Una aplicación web que utiliza IA para análizar, resumir y organizar literatura científica especializada en ciencias del deporte.

## 🚀 Características

### ✨ Funcionalidades Principales
- **📄 Subida de Archivos PDF**: Carga documentos científicos para análisis automático
- **🤖 Análisis con IA**: Resúmenes críticos automáticos de literatura científica usando GPT-4
- **📁 Organización Temática**: Sistema de carpetas para clasificar estudios por áreas (lesiones, rendimiento, nutrición, etc.)
- **🔬 Estado del Arte**: Generación automática de síntesis integral del conocimiento científico actual
- **🎯 Enfoque Especializado**: Diseñado específicamente para médicos del deporte y profesionales de ciencias del deporte

### 🎯 Casos de Uso
- Mantenerse actualizado con la literatura científica más reciente
- Crear síntesis de conocimiento para áreas específicas
- Preparar revisiones bibliográficas
- Identificar gaps en la investigación
- Generar guías de práctica clínica basadas en evidencia

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** con Express
- **SQLite** para base de datos
- **OpenAI GPT-4** para análisis de texto
- **Multer** para manejo de archivos
- **pdf-parse** para extracción de texto PDF

### Frontend
- **React** con Hooks
- **CSS3** con diseño responsivo
- **Fetch API** para comunicación con backend

## 📋 Requisitos Previos

- Node.js (versión 14 o superior)
- npm o yarn
- Clave API de OpenAI

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd sabio-sports-medicine
```

### 2. Instalar dependencias del backend
```bash
npm install
```

### 3. Instalar dependencias del frontend
```bash
cd client
npm install
cd ..
```

### 4. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita el archivo `.env` y agrega tu clave de OpenAI:
```env
OPENAI_API_KEY=tu_clave_de_openai_aqui
PORT=5000
```

### 5. Ejecutar la aplicación
```bash
# Ejecutar tanto backend como frontend
npm run dev

# O ejecutar por separado:
# Backend (puerto 5000)
npm run server

# Frontend (puerto 3000)
npm run client
```

## 📚 Uso de la Aplicación

### 1. **Subir Documento** 📄
- Selecciona un archivo PDF de literatura científica
- Haz clic en "Analizar Documento"
- La IA generará automáticamente un resumen crítico

### 2. **Organizar en Carpetas** 📁
- Crea carpetas temáticas (ej: "Lesiones Deportivas", "Rendimiento")
- Asigna un título al documento
- Guarda el resumen en la carpeta correspondiente

### 3. **Ver Resúmenes** 📋
- Navega por las carpetas temáticas
- Revisa los resúmenes guardados
- Expande para ver análisis completos

### 4. **Generar Estado del Arte** 🔬
- Selecciona una carpeta temática
- Genera una síntesis integral de todos los resúmenes
- Obtén tendencias, gaps y recomendaciones

## 🏗️ Estructura del Proyecto

```
sabio-sports-medicine/
├── server.js              # Servidor Express
├── package.json           # Dependencias backend
├── .env.example          # Variables de entorno ejemplo
├── sports_medicine.db    # Base de datos SQLite (se crea automáticamente)
└── client/               # Aplicación React
    ├── src/
    │   ├── App.js        # Componente principal
    │   ├── App.css       # Estilos principales
    │   └── components/   # Componentes React
    │       ├── FileUpload.js
    │       ├── FolderManager.js
    │       ├── SummaryView.js
    │       └── StateOfArt.js
    └── package.json      # Dependencias frontend
```

## 🎨 Características de Diseño

- **Interfaz Intuitiva**: Navegación por pestañas clara y fácil de usar
- **Diseño Responsivo**: Funciona en dispositivos móviles y escritorio
- **Tema Médico**: Colores y iconografía apropiados para el ámbito médico
- **Experiencia de Usuario**: Feedback visual y estados de carga claros

## 🔒 Seguridad

- Validación de tipos de archivo (solo PDF)
- Sanitización de inputs
- Variables de entorno para claves API
- Base de datos local para privacidad de datos

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- Abre un issue en GitHub
- Contacta al equipo de desarrollo

## 🔮 Roadmap Futuro

- [ ] Integración con más APIs de IA
- [ ] Exportación a diferentes formatos (Word, LaTeX)
- [ ] Sistema de colaboración multi-usuario
- [ ] Integración con bases de datos científicas (PubMed, etc.)
- [ ] Análisis de citaciones y métricas
- [ ] App móvil nativa

---

**Desarrollado con ❤️ para la comunidad de medicina del deporte**