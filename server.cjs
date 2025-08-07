const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.static('client/build'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const db = new sqlite3.Database('./sports_medicine.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES folders (id) ON DELETE CASCADE,
    UNIQUE(name, parent_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    folder_id INTEGER,
    title TEXT NOT NULL,
    original_text TEXT,
    summary TEXT,
    critical_analysis TEXT,
    keywords TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (folder_id) REFERENCES folders (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS state_of_art (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    folder_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (folder_id) REFERENCES folders (id)
  )`);
});

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'), false);
    }
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se encontró archivo' });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text;

    const prompt = `#Role 
You are a research agent. You are very good at analyzing a research article and obtaining the best detail from it. You are a research expert who is providing data to another researcher. You are well versed in the scientific method. You will be provided data from a pdf. You are to analyze this text and provide a thorough summary of it.

Provide your summary in the format of:
Title

Introduction:
-What is the importance of this study.
-What are the specific aims of this study.
-What questions are they trying to answer.
-What studies have been done in the past in regards to this topic.

Methods:
-Go into detail about their methods.
-What type of study is this.
-How many subjects were included in the study.
-How was their study designed.
-What parameters or variables were they measuring. 
         -This is the most important part of this group. In the methods section of each paper they will define what the measurable outcomes of the study were. Sometimes they will have primary and secondary outcomes. You should include all of these.
-What was their inclusion and exclusion criteria.

Results:
-This should be comprehensive.
-It should give the results for every variable or measurable outcome tested.
-specific numbers with statistical significance should be given.

Summary:
-You should provide the specific conclusions they came to from their results.
-Provide how their results compare to other studies mentioned in their paper. In the summary section of the paper they often reference how their results compare to other studies. You should provide this in your summary.
-Provide what their recommendations are based off the results.

Conclusion:
Provide any weaknesses of the paper.
Provide all examples of future studies they recommend be performed.

#additional information
Introduction, methods, results, summary, and conclusion should all be new paragraphs. Your information should read smoothly and make sense. you can utilize bullet points or - if you would like for the individual points within the paragraphs.

Please analyze the following research article:

${text.substring(0, 15000)}`;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    // Generar sugerencias de nombres cortos basadas en el análisis
    const titlePrompt = `Basándote en este análisis de un artículo científico de medicina del deporte, genera 3 títulos cortos y descriptivos (máximo 8 palabras cada uno) que capturen la esencia del estudio. Los títulos deben ser profesionales y específicos.

Análisis del artículo:
${analysis.substring(0, 2000)}

Formato de respuesta:
1. [Título corto 1]
2. [Título corto 2] 
3. [Título corto 3]

Solo proporciona los 3 títulos numerados, sin explicaciones adicionales.`;

    const titleResult = await model.generateContent(titlePrompt);
    const titleSuggestions = titleResult.response.text();

    // Parsear las sugerencias y limpiarlas
    const suggestions = titleSuggestions
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(title => title.length > 0)
      .slice(0, 3); // Asegurar máximo 3 sugerencias

    res.json({
      originalText: text,
      analysis: analysis,
      filename: req.file.originalname,
      titleSuggestions: suggestions
    });

  } catch (error) {
    console.error('Error procesando archivo:', error);
    res.status(500).json({ error: 'Error procesando el archivo' });
  }
});

app.get('/api/folders', (req, res) => {
  const parentId = req.query.parent_id || null;
  const query = parentId ? 
    'SELECT * FROM folders WHERE parent_id = ? ORDER BY created_at DESC' :
    'SELECT * FROM folders WHERE parent_id IS NULL ORDER BY created_at DESC';
  const params = parentId ? [parentId] : [];
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/folders-with-counts', (req, res) => {
  const parentId = req.query.parent_id || null;
  const expandSubfolders = req.query.expand === 'true';
  
  if (expandSubfolders && !parentId) {
    // Modo expandido: mostrar carpetas principales con sus subcarpetas anidadas
    const query = `
      WITH RECURSIVE folder_hierarchy AS (
        -- Carpetas principales
        SELECT 
          f.*,
          0 as level,
          f.id as root_id,
          f.name as path
        FROM folders f 
        WHERE f.parent_id IS NULL
        
        UNION ALL
        
        -- Subcarpetas
        SELECT 
          sf.*,
          fh.level + 1 as level,
          fh.root_id,
          fh.path || ' › ' || sf.name as path
        FROM folders sf
        JOIN folder_hierarchy fh ON sf.parent_id = fh.id
        WHERE fh.level < 3  -- Limite de 3 niveles
      )
      SELECT 
        fh.*,
        -- Contar resúmenes directos + todos los resúmenes de subcarpetas
        CASE 
          WHEN fh.level = 0 THEN 
            (SELECT COUNT(*) FROM summaries s WHERE s.folder_id = fh.id) +
            (SELECT COUNT(*) FROM summaries s 
             JOIN folders sf ON s.folder_id = sf.id 
             WHERE sf.parent_id = fh.id OR sf.id IN (
               SELECT id FROM folders WHERE parent_id IN (
                 SELECT id FROM folders WHERE parent_id = fh.id
               )
             ))
          ELSE 
            (SELECT COUNT(*) FROM summaries s WHERE s.folder_id = fh.id)
        END as summary_count,
        (SELECT COUNT(*) FROM folders sf WHERE sf.parent_id = fh.id) as subfolder_count
      FROM folder_hierarchy fh
      ORDER BY fh.root_id, fh.level, fh.created_at DESC
    `;
    
    db.all(query, [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  } else {
    // Modo normal: solo carpetas del nivel actual
    const whereClause = parentId ? 'WHERE f.parent_id = ?' : 'WHERE f.parent_id IS NULL';
    const params = parentId ? [parentId] : [];
    
    const query = `
      SELECT 
        f.*,
        CASE 
          WHEN f.parent_id IS NULL THEN 
            -- Para carpetas principales: incluir documentos de subcarpetas
            (SELECT COUNT(*) FROM summaries s WHERE s.folder_id = f.id) +
            (SELECT COUNT(*) FROM summaries s 
             JOIN folders sf ON s.folder_id = sf.id 
             WHERE sf.parent_id = f.id OR sf.id IN (
               SELECT id FROM folders WHERE parent_id IN (
                 SELECT id FROM folders WHERE parent_id = f.id
               )
             ))
          ELSE 
            -- Para subcarpetas: solo documentos directos
            (SELECT COUNT(*) FROM summaries s WHERE s.folder_id = f.id)
        END as summary_count,
        (SELECT COUNT(*) FROM folders sf WHERE sf.parent_id = f.id) as subfolder_count
      FROM folders f
      ${whereClause}
      ORDER BY f.created_at DESC
    `;
    
    db.all(query, params, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  }
});

app.post('/api/folders', (req, res) => {
  const { name, parent_id } = req.body;
  
  db.run('INSERT INTO folders (name, parent_id) VALUES (?, ?)', [name, parent_id || null], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, parent_id: parent_id || null });
  });
});

app.post('/api/summaries', (req, res) => {
  const { folderId, title, originalText, summary, criticalAnalysis, keywords } = req.body;
  
  // Validate required fields
  if (!folderId || !title || !summary) {
    return res.status(400).json({ error: 'Faltan campos requeridos: folderId, title, summary' });
  }
  
  console.log('Saving summary:', { folderId, title: title.substring(0, 50) + '...' });
  
  db.run(
    'INSERT INTO summaries (folder_id, title, original_text, summary, critical_analysis, keywords) VALUES (?, ?, ?, ?, ?, ?)',
    [folderId, title, originalText, summary, criticalAnalysis, keywords],
    function(err) {
      if (err) {
        console.error('Error saving summary:', err);
        res.status(500).json({ error: `Error guardando resumen: ${err.message}` });
        return;
      }
      console.log('Summary saved successfully with ID:', this.lastID);
      res.json({ id: this.lastID });
    }
  );
});

app.get('/api/summaries/:folderId', (req, res) => {
  const { folderId } = req.params;
  const includeSubfolders = req.query.include_subfolders === 'true';
  
  if (includeSubfolders) {
    // Obtener resúmenes de la carpeta y todas sus subcarpetas recursivamente
    const query = `
      WITH RECURSIVE subfolder_tree AS (
        -- Carpeta seleccionada
        SELECT id FROM folders WHERE id = ?
        
        UNION ALL
        
        -- Todas las subcarpetas recursivamente
        SELECT f.id FROM folders f
        JOIN subfolder_tree st ON f.parent_id = st.id
      )
      SELECT 
        s.*,
        f.name as folder_name,
        CASE 
          WHEN f.id = ? THEN f.name
          ELSE f.name || ' (subcarpeta)'
        END as display_folder_name
      FROM summaries s
      JOIN folders f ON s.folder_id = f.id
      WHERE s.folder_id IN (SELECT id FROM subfolder_tree)
      ORDER BY f.parent_id IS NULL DESC, f.created_at DESC, s.created_at DESC
    `;
    
    db.all(query, [folderId, folderId], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  } else {
    // Solo resúmenes de la carpeta específica
    db.all(
      'SELECT * FROM summaries WHERE folder_id = ? ORDER BY created_at DESC',
      [folderId],
      (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(rows);
      }
    );
  }
});

app.post('/api/state-of-art/:folderId', async (req, res) => {
  const { folderId } = req.params;
  
  try {
    db.all(
      'SELECT summary, critical_analysis, keywords FROM summaries WHERE folder_id = ?',
      [folderId],
      async (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        if (rows.length === 0) {
          res.status(400).json({ error: 'No hay resúmenes en esta carpeta' });
          return;
        }

        const combinedContent = rows.map(row => 
          `RESUMEN: ${row.summary}\nANÁLISIS: ${row.critical_analysis}\nPALABRAS CLAVE: ${row.keywords}`
        ).join('\n\n---\n\n');

        const stateOfArtPrompt = `Eres un investigador senior en medicina del deporte creando una revisión para una revista de alto impacto. Analiza estos estudios y genera un ESTADO DEL ARTE ESTRUCTURADO Y CUANTITATIVO:

${combinedContent}

**ESTRUCTURA OBLIGATORIA:**

**1. CARACTERIZACIÓN DE LA EVIDENCIA**
- Total de estudios: [n=]
- Distribución por tipo: [RCT: n=, Observacionales: n=, Revisiones: n=, etc.]
- Población total combinada: [n= participantes]
- Rango de calidad metodológica: [mín-máx puntuación]
- Período de publicación: [años]

**2. ANÁLISIS POR OUTCOMES PRINCIPALES**
Para cada outcome identificado:
- Estudios que lo evaluaron: [n=]
- Consistencia de resultados: [%, describir concordancia]
- Rangos de effect size reportados: [mín-máx]
- Poblaciones donde es efectivo: [especificar características]
- Protocolos más exitosos: [describir parámetros exactos]

**3. SÍNTESIS DE INTERVENCIONES/FACTORES**
- Dosis-respuesta identificadas: [especificar rangos óptimos]
- Factores moderadores clave: [edad, género, nivel deportivo, etc.]
- Duración mínima para efecto: [semanas/meses]
- Predictores de respuesta positiva: [biomarcadores, características]

**4. CALIDAD DE LA EVIDENCIA POR TEMA**
Usar formato:
- TEMA X: [Evidencia Alta/Moderada/Baja/Muy Baja] - Basado en [n= estudios, tipos]
- TEMA Y: [nivel] - [justificación]

**5. GAPS CRÍTICOS ESPECÍFICOS**
- Poblaciones no estudiadas: [rangos de edad, deportes, niveles]
- Comparaciones directas faltantes: [especificar cuáles]
- Outcomes no evaluados: [biomarcadores, seguimientos]
- Duraciones de seguimiento insuficientes: [especificar necesarias]

**6. RECOMENDACIONES GRADUADAS**

**GRADO A (Implementar ahora):**
- [Intervención/factor]: Protocolo exacto, población target, evidencia de apoyo

**GRADO B (Considerar implementación):**
- [Intervención/factor]: Condiciones específicas, modificaciones sugeridas

**GRADO C (Solo en investigación):**
- [Intervención/factor]: Razones para no implementar aún

**7. ALGORITMO CLÍNICO BASADO EN EVIDENCIA**
Crear flujo de decisión:
- Si paciente cumple [características] -> Aplicar [protocolo específico]
- Si [criterio de respuesta] -> Continuar
- Si no responde -> Modificar a [alternativa]

**8. PRIORIDADES DE INVESTIGACIÓN FUTURA**
Por urgencia:
1. [Pregunta específica] - [Diseño sugerido, n= requerido, duración]
2. [Siguiente prioridad] - [justificación]

**FORMATO**: Usa tablas, números específicos, y referencias cruzadas. Cada afirmación debe tener soporte cuantitativo de los estudios analizados. Evita generalidades.`;

        const result = await model.generateContent(stateOfArtPrompt);
        const stateOfArt = result.response.text();

        db.run(
          'INSERT OR REPLACE INTO state_of_art (folder_id, content) VALUES (?, ?)',
          [folderId, stateOfArt],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ content: stateOfArt });
          }
        );
      }
    );
  } catch (error) {
    console.error('Error generando estado del arte:', error);
    res.status(500).json({ error: 'Error generando estado del arte' });
  }
});

app.get('/api/state-of-art/:folderId', (req, res) => {
  const { folderId } = req.params;
  
  db.get(
    'SELECT * FROM state_of_art WHERE folder_id = ? ORDER BY created_at DESC LIMIT 1',
    [folderId],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(row || null);
    }
  );
});

// DELETE endpoints
app.delete('/api/folders/:folderId', (req, res) => {
  const { folderId } = req.params;
  
  // Eliminar en orden: state_of_art, summaries, folder
  db.serialize(() => {
    db.run('DELETE FROM state_of_art WHERE folder_id = ?', [folderId]);
    db.run('DELETE FROM summaries WHERE folder_id = ?', [folderId]);
    db.run('DELETE FROM folders WHERE id = ?', [folderId], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Carpeta no encontrada' });
        return;
      }
      res.json({ message: 'Carpeta eliminada exitosamente' });
    });
  });
});

app.delete('/api/summaries/:summaryId', (req, res) => {
  const { summaryId } = req.params;
  
  db.run('DELETE FROM summaries WHERE id = ?', [summaryId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Resumen no encontrado' });
      return;
    }
    res.json({ message: 'Resumen eliminado exitosamente' });
  });
});

app.put('/api/summaries/:summaryId/title', (req, res) => {
  const { summaryId } = req.params;
  const { title } = req.body;
  
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Título requerido' });
  }
  
  db.run('UPDATE summaries SET title = ? WHERE id = ?', [title.trim(), summaryId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Resumen no encontrado' });
      return;
    }
    res.json({ message: 'Título actualizado exitosamente' });
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});