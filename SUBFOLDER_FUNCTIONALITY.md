# Funcionalidad de Subcarpetas - Sabio Sports Medicine

## ✨ Nueva Funcionalidad Agregada

Se ha implementado un sistema completo de **subcarpetas** para mejorar la organización jerárquica de la literatura científica.

## 🚀 Características Implementadas

### 1. **Creación de Subcarpetas**
- **Botón "📁+"** en cada carpeta padre para crear subcarpetas
- **Modal intuitivo** con información del padre
- **Validación** de nombres de subcarpetas
- **Feedback visual** durante la creación

### 2. **Navegación Jerárquica**
- **Breadcrumb navigation** en el sidebar
- **Botón "🏠"** para volver a la raíz
- **Navegación por niveles** con botón "🔍"  
- **Indicadores visuales** de subcarpetas existentes

### 3. **Interfaz Visualizada**
- **Iconos diferenciados**: 📂 (con subcarpetas) vs 📁 (sin subcarpetas)
- **Contadores**: muestra cantidad de subcarpetas "(X sub)"
- **Información contextual** en Dashboard
- **Botones hover** para acciones rápidas

### 4. **Funcionalidades Base Mantenidas**
- **Análisis con Gemini AI** con prompt detallado
- **Estados del arte** por carpetas/subcarpetas
- **Chat IA especializado** con acceso a toda la estructura
- **Eliminación en cascada** (carpeta padre elimina subcarpetas)

## 🎯 Cómo Usar las Subcarpetas

### **Crear Subcarpeta:**
1. Hover sobre cualquier carpeta
2. Clic en botón **"📁+"**
3. Ingresa nombre en el modal
4. Confirma con **"📁 Crear Subcarpeta"**

### **Navegar en Subcarpetas:**
1. Clic en botón **"🔍"** para entrar a subcarpetas
2. Usa el **breadcrumb** para navegar hacia atrás
3. Clic en **"🏠"** para volver a la raíz

### **Organización Sugerida:**
```
📂 Medicina del Deporte
├── 📁 Lesiones Deportivas
│   ├── 📁 LCA
│   ├── 📁 Hombro
│   └── 📁 Tobillo
├── 📁 Rendimiento
│   ├── 📁 HIIT
│   ├── 📁 Fuerza
│   └── 📁 Resistencia
└── 📁 Rehabilitación
    ├── 📁 Post-Quirúrgica
    └── 📁 Conservadora
```

## 🔧 Implementación Técnica

### **Backend (SQLite)**
- Relación `parent_id` en tabla `folders`
- Consultas jerárquicas con conteos
- Eliminación en cascada

### **Frontend (React)**
- Estado de navegación en `App.js`
- Modal de creación en `Sidebar.js`
- Breadcrumb navigation
- Indicadores visuales

### **Base de Datos**
```sql
folders (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id INTEGER,  -- Nueva columna para jerarquía
  created_at DATETIME,
  FOREIGN KEY (parent_id) REFERENCES folders (id)
)
```

## ✅ Estado de la Funcionalidad

- ✅ **Creación de subcarpetas** - Completado
- ✅ **Navegación jerárquica** - Completado  
- ✅ **Interface visual** - Completado
- ✅ **Modal de creación** - Completado
- ✅ **Breadcrumb navigation** - Completado
- ✅ **Integración con Gemini AI** - Completado
- ✅ **Testing funcional** - En progreso

## 🎨 Estilos CSS

Se han agregado estilos específicos para:
- `.subfolder-modal` - Modal de creación
- `.breadcrumb-navigation` - Navegación superior
- `.folder-icon` - Iconos diferenciados
- `.create-subfolder-btn` - Botón de creación
- `.current-folder-info` - Información en Dashboard

La funcionalidad está **completamente integrada** y lista para uso en producción.