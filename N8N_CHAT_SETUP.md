# 🤖 Configuración del Chat IA con n8n

## 📋 Descripción
El chat IA integrado permite consultar toda la literatura científica almacenada usando un flujo de n8n. Los usuarios pueden hacer preguntas y recibir respuestas basadas en sus resúmenes y estados del arte.

## 🛠️ Configuración de n8n

### 1. Crear el Flujo en n8n

1. **Webhook Node**:
   - URL: `https://n8n.srv879499.hstgr.cloud/webhook-test/medicina-deportiva-chat`
   - Método: `POST`
   - Responder inmediatamente: `false`

2. **Estructura de datos que recibirá**:
```json
{
  "message": "¿Cuáles son las principales tendencias en lesiones deportivas?",
  "context": {
    "folders": [
      {
        "id": 1,
        "name": "Lesiones Deportivas",
        "created_at": "2025-01-01"
      }
    ],
    "summaries": [
      {
        "id": 1,
        "folder_id": 1,
        "title": "Prevención de lesiones del LCA",
        "summary": "RESUMEN: Estudio sobre...",
        "critical_analysis": "ANÁLISIS: Fortalezas...",
        "keywords": "LCA, prevención, fútbol",
        "created_at": "2025-01-01"
      }
    ],
    "total_documents": 25,
    "research_areas": 5,
    "last_updated": "2025-01-01T10:00:00Z"
  },
  "timestamp": "2025-01-01T10:00:00Z",
  "sessionId": "session_123456"
}
```

### 2. Procesamiento con IA (OpenAI/Claude/etc.)

**Prompt sugerido para la IA**:
```
Eres un asistente especializado en medicina del deporte. Tienes acceso a una base de conocimientos que incluye:

CARPETAS DE INVESTIGACIÓN:
{{$json.context.folders}}

RESÚMENES Y ANÁLISIS:
{{$json.context.summaries}}

ESTADÍSTICAS:
- Total documentos: {{$json.context.total_documents}}
- Áreas de investigación: {{$json.context.research_areas}}

PREGUNTA DEL USUARIO:
{{$json.message}}

Responde de manera precisa y científica, citando específicamente los estudios relevantes de la base de conocimientos. Si la pregunta no puede responderse con la información disponible, indícalo claramente.
```

### 3. Respuesta al Cliente

El nodo final debe devolver un JSON con este formato:
```json
{
  "response": "Basado en tu literatura científica, las principales tendencias en lesiones deportivas incluyen..."
}
```

## 🔧 Configuración en la Aplicación

### 1. Variables de Entorno

Crea un archivo `.env` en `/client/` con:
```env
REACT_APP_N8N_WEBHOOK_URL=https://n8n.srv879499.hstgr.cloud/webhook-test/medicina-deportiva-chat
```

### 2. Configuración Actual

El webhook ya está configurado con tu instancia de n8n:
```env
REACT_APP_N8N_WEBHOOK_URL=https://n8n.srv879499.hstgr.cloud/webhook-test/medicina-deportiva-chat
```

## 🚀 Características del Chat

### ✨ Funcionalidades Implementadas:
- **Interfaz moderna** con animaciones fluidas
- **Memoria completa** de todos los resúmenes y estados del arte
- **Suggestions inteligentes** para preguntas comunes
- **Indicador de escritura** mientras la IA procesa
- **Responsive design** que se adapta a móviles
- **Botón flotante** pulsante para llamar la atención

### 🎯 Preguntas Sugeridas:
- "¿Cuáles son las principales tendencias en lesiones deportivas?"
- "Resume los hallazgos más importantes sobre rendimiento atlético"
- "¿Qué gaps de investigación has identificado?"
- "Compara los estudios sobre nutrición deportiva"
- "¿Qué protocolos de rehabilitación son más efectivos?"

## 📊 Sincronización con Base de Datos Externa (Opcional)

### Opción A: Supabase
Para persistir la memoria del chat y permitir acceso desde múltiples dispositivos:

1. **Crear tabla en Supabase**:
```sql
CREATE TABLE summaries_sync (
  id SERIAL PRIMARY KEY,
  folder_id INTEGER,
  title TEXT,
  summary TEXT,
  critical_analysis TEXT,
  keywords TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

2. **Modificar server.js** para sincronizar automáticamente:
```javascript
// Agregar después de cada INSERT en summaries
const syncToSupabase = async (summaryData) => {
  // Código para enviar a Supabase
};
```

### Opción B: Firebase
Similar configuración usando Firebase como base de datos externa.

## 🔐 Seguridad

### Recomendaciones:
- **Autenticación**: Agregar API keys para el webhook de n8n
- **Rate limiting**: Limitar consultas por minuto por usuario
- **Sanitización**: Validar inputs antes de enviar a la IA
- **CORS**: Configurar correctamente para producción

## 🐛 Troubleshooting

### Errores Comunes:

1. **"Error en la comunicación con n8n"**
   - Verificar que n8n esté ejecutándose
   - Comprobar la URL del webhook
   - Revisar logs de n8n

2. **"Chat no muestra datos"**
   - Verificar que hay resúmenes creados
   - Comprobar la función `fetchAllSummaries()`
   - Revisar consola del navegador

3. **"Respuesta de IA incompleta"**
   - Verificar límites de tokens en el modelo IA
   - Reducir contexto si es muy extenso
   - Comprobar prompt en n8n

## 📈 Métricas Sugeridas

Para monitorear el uso del chat:
- Número de consultas por día
- Temas más consultados
- Tiempo de respuesta promedio
- Satisfacción de respuestas (thumbs up/down)

## 🔄 Flujo de Datos

```
Usuario escribe → Frontend → n8n Webhook → IA (OpenAI/Claude) → n8n → Frontend → Usuario
                     ↓
              Contexto completo
           (Carpetas + Resúmenes)
```

## 📞 Soporte

Si necesitas ayuda con la configuración:
1. Revisar logs de n8n en `/root/.n8n/logs/`
2. Probar webhook manualmente con Postman
3. Verificar variables de entorno en React