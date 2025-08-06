const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar a la base de datos
const db = new sqlite3.Database('./sports_medicine.db');

// Datos de ejemplo para medicina del deporte
const demoData = {
  folders: [
    {
      name: "Lesiones Deportivas",
      subcarpetas: [
        "Lesiones del LCA",
        "Lesiones Musculares", 
        "Fracturas por Estrés",
        "Lesiones del Hombro",
        "Conmociones Cerebrales"
      ]
    },
    {
      name: "Rendimiento Deportivo",
      subcarpetas: [
        "Entrenamiento de Fuerza",
        "Resistencia Cardiovascular",
        "Velocidad y Agilidad", 
        "Análisis Biomecánico",
        "Periodización"
      ]
    },
    {
      name: "Nutrición Deportiva",
      subcarpetas: [
        "Suplementación",
        "Hidratación",
        "Nutrición Pre-Competencia",
        "Recuperación Nutricional",
        "Composición Corporal"
      ]
    },
    {
      name: "Rehabilitación",
      subcarpetas: [
        "Fisioterapia Deportiva",
        "Ejercicios Terapéuticos",
        "Tecnologías de Recuperación",
        "Retorno al Deporte",
        "Prevención Secundaria"
      ]
    },
    {
      name: "Psicología del Deporte",
      subcarpetas: [
        "Motivación y Concentración",
        "Manejo del Estrés",
        "Confianza Deportiva",
        "Cohesión de Equipo",
        "Burnout Atlético"
      ]
    },
    {
      name: "Fisiología del Ejercicio",
      subcarpetas: [
        "Metabolismo Energético",
        "Adaptaciones Cardiovasculares",
        "Respuesta Hormonal",
        "Fatiga Muscular",
        "Termorregulación"
      ]
    },
    {
      name: "Medicina Preventiva",
      subcarpetas: [
        "Screening Cardiovascular",
        "Evaluaciones Pretemporada",
        "Programas de Prevención",
        "Vacunación en Atletas",
        "Salud Mental"
      ]
    },
    {
      name: "Dopaje y Antidoping",
      subcarpetas: [
        "Sustancias Prohibidas",
        "Procedimientos de Control",
        "Exenciones Terapéuticas",
        "Educación Antidopaje",
        "Casos y Jurisprudencia"
      ]
    },
    {
      name: "Deporte Femenino",
      subcarpetas: [
        "Tríada de la Atleta",
        "Ciclo Menstrual y Rendimiento",
        "Embarazo y Deporte",
        "Lesiones Específicas",
        "Diferencias Fisiológicas"
      ]
    },
    {
      name: "Deportes Específicos",
      subcarpetas: [
        "Fútbol",
        "Baloncesto",
        "Atletismo",
        "Natación",
        "Deportes de Combate"
      ]
    }
  ],
  
  // Títulos de documentos realistas por subcarpeta
  documentTitles: {
    "Lesiones del LCA": [
      "Efectividad de la Reconstrucción del LCA con Injerto de Tendón Rotuliano vs Isquiotibiales",
      "Programas de Prevención de Lesiones del LCA en Fútbol Femenino",
      "Biomecánica del Aterrizaje y Riesgo de Lesión del LCA",
      "Factores de Riesgo Hormonales en Lesiones del LCA en Mujeres Atletas",
      "Resultados a Largo Plazo de la Reconstrucción del LCA en Atletas Profesionales"
    ],
    "Lesiones Musculares": [
      "Clasificación de Lesiones Musculares por Resonancia Magnética",
      "PRP vs Plasma Rico en Plaquetas en Lesiones de Isquiotibiales",
      "Factores de Riesgo de Lesiones Musculares en Sprinters",
      "Protocolos de Retorno al Juego post Lesión Muscular",
      "Excentric Training para Prevención de Lesiones Musculares"
    ],
    "Fracturas por Estrés": [
      "Fracturas por Estrés en Corredores de Maratón: Incidencia y Factores de Riesgo",
      "Papel de la Vitamina D en la Prevención de Fracturas por Estrés",
      "Densitometría Ósea en Atletas con Fracturas por Estrés Recurrentes",
      "Tratamiento Conservador vs Quirúrgico en Fracturas por Estrés del Escafoides",
      "Biomecánica de la Carrera y Fracturas por Estrés de Tibia"
    ],
    "Lesiones del Hombro": [
      "Impingement Subacromial en Nadadores: Diagnóstico y Tratamiento",
      "Inestabilidad Glenohumeral en Deportes de Lanzamiento",
      "Lesiones del Manguito Rotador en Atletas Overhead",
      "Artroscopia vs Tratamiento Conservador en Lesiones SLAP",
      "Programas de Fortalecimiento para Prevención de Lesiones del Hombro"
    ],
    "Conmociones Cerebrales": [
      "Protocolo de Retorno al Juego post Conmoción Cerebral",
      "Biomarcadores Sanguíneos en Conmociones Cerebrales Deportivas",
      "Efectos a Largo Plazo de Conmociones Repetidas en NFL",
      "Evaluación Neuropsicológica en Atletas con Conmoción",
      "Prevención de Conmociones en Deportes de Contacto"
    ],
    "Entrenamiento de Fuerza": [
      "Periodización del Entrenamiento de Fuerza en Atletas Elite",
      "Entrenamiento Isométrico vs Dinámico para Desarrollo de Fuerza",
      "Efectos del Entrenamiento de Fuerza en Adolescentes Atletas",
      "Optimización de la Hipertrofia Muscular en Deportistas",
      "Entrenamiento de Fuerza Específico para Deportes de Resistencia"
    ],
    "Resistencia Cardiovascular": [
      "Entrenamiento Intervalado de Alta Intensidad vs Continuo Moderado",
      "Adaptaciones Cardiovasculares al Entrenamiento en Altitud",
      "VO2max y Rendimiento en Deportes de Resistencia",
      "Fatiga Cardiovascular en Ultra Maratones",
      "Monitorizacion de la Frecuencia Cardíaca en el Entrenamiento"
    ],
    "Velocidad y Agilidad": [
      "Biomecánica de la Aceleración en Sprints de 100 metros",
      "Entrenamiento Pliométrico para Mejora de la Velocidad",
      "Agilidad Reactiva vs Programada en Deportes de Equipo",
      "Efectos del Entrenamiento de Fuerza en la Velocidad Máxima",
      "Análisis Cinemático de Cambios de Dirección en Fútbol"
    ],
    "Análisis Biomecánico": [
      "Análisis 3D de la Técnica de Lanzamiento en Jabalina",
      "Biomecánica de la Técnica de Nado en Crol",
      "Eficiencia Mecánica en la Carrera de Fondo",
      "Análisis de Fuerzas en el Salto Vertical",
      "Biomecánica del Swing en Golf: Factores de Rendimiento"
    ],
    "Periodización": [
      "Modelos de Periodización en Deportes Cíclicos vs Acíclicos",
      "Periodización del Entrenamiento en Deportes de Equipo",
      "Tapering: Estrategias de Reducción Pre-Competitiva",
      "Periodización Inversa en Deportes de Resistencia",
      "Monitorización de la Carga de Entrenamiento y Recuperación"
    ]
  }
};

async function createDemoData() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Iniciando creación de datos de demostración...');
    
    db.serialize(() => {
      let foldersCreated = 0;
      let subfoldersCreated = 0;
      let summariesCreated = 0;
      
      // Crear carpetas principales y subcarpetas
      demoData.folders.forEach((folderData, index) => {
        // Crear carpeta principal
        db.run('INSERT INTO folders (name, parent_id) VALUES (?, ?)', 
          [folderData.name, null], 
          function(err) {
            if (err) {
              console.error(`Error creando carpeta ${folderData.name}:`, err);
              return;
            }
            
            const parentId = this.lastID;
            foldersCreated++;
            console.log(`📁 Creada carpeta principal: ${folderData.name} (ID: ${parentId})`);
            
            // Crear subcarpetas
            folderData.subcarpetas.forEach((subcarpetaName, subIndex) => {
              db.run('INSERT INTO folders (name, parent_id) VALUES (?, ?)', 
                [subcarpetaName, parentId], 
                function(err) {
                  if (err) {
                    console.error(`Error creando subcarpeta ${subcarpetaName}:`, err);
                    return;
                  }
                  
                  const subcarpetaId = this.lastID;
                  subfoldersCreated++;
                  console.log(`  📂 Creada subcarpeta: ${subcarpetaName} (ID: ${subcarpetaId})`);
                  
                  // Crear documentos de ejemplo para esta subcarpeta
                  const titles = demoData.documentTitles[subcarpetaName] || [
                    `Estudio sobre ${subcarpetaName} - Revisión Sistemática`,
                    `Análisis Clínico de ${subcarpetaName} en Atletas Elite`,
                    `Protocolo de Tratamiento para ${subcarpetaName}`,
                    `Factores de Riesgo en ${subcarpetaName}`,
                    `Nuevas Tendencias en ${subcarpetaName}`
                  ];
                  
                  titles.forEach((title, docIndex) => {
                    const summary = `RESUMEN EJECUTIVO: ${title}
                    
OBJETIVO: Analizar los aspectos más relevantes de ${subcarpetaName} en el contexto de la medicina del deporte moderna.

METODOLOGÍA: Revisión sistemática de literatura científica publicada entre 2020-2024, incluyendo estudios randomizados controlados, meta-análisis y revisiones de expertos.

POBLACIÓN: Atletas profesionales y semi-profesionales de diferentes disciplinas deportivas, edades entre 18-35 años.

RESULTADOS PRINCIPALES:
• Identificación de factores clave que influyen en ${subcarpetaName}
• Establecimiento de protocolos de intervención basados en evidencia
• Análisis de efectividad de diferentes enfoques terapéuticos
• Evaluación de outcomes a corto y largo plazo

CONCLUSIONES: Los hallazgos sugieren la importancia de un enfoque multidisciplinario para abordar ${subcarpetaName}, integrando aspectos biomecánicos, fisiológicos y psicológicos.`;

                    const criticalAnalysis = `ANÁLISIS CRÍTICO - ${title}

FORTALEZAS METODOLÓGICAS:
• Diseño de estudio robusto con adecuado poder estadístico
• Criterios de inclusión y exclusión bien definidos
• Seguimiento longitudinal apropiado para el tipo de intervención
• Uso de herramientas de medición validadas

LIMITACIONES IDENTIFICADAS:
• Tamaño muestral limitado para subgrupos específicos
• Posible sesgo de selección en la población estudiada
• Variabilidad en protocolos de implementación entre centros
• Tiempo de seguimiento insuficiente para outcomes a largo plazo

RELEVANCIA CLÍNICA:
La evidencia presentada tiene implicaciones directas para la práctica clínica en medicina del deporte, especialmente en el manejo de ${subcarpetaName}. Se recomienda implementación gradual con monitoreo continuo.

CALIDAD DE EVIDENCIA: Moderada a Alta
GRADO DE RECOMENDACIÓN: B (Se recomienda su implementación)`;

                    const keywords = `${subcarpetaName}, medicina deportiva, atletas, evidencia científica, protocolo clínico, rendimiento deportivo, prevención, tratamiento`;
                    
                    db.run('INSERT INTO summaries (folder_id, title, original_text, summary, critical_analysis, keywords) VALUES (?, ?, ?, ?, ?, ?)',
                      [subcarpetaId, title, `Texto original completo del documento: ${title}...`, summary, criticalAnalysis, keywords],
                      function(err) {
                        if (err) {
                          console.error(`Error creando resumen ${title}:`, err);
                          return;
                        }
                        summariesCreated++;
                        console.log(`    📄 Creado documento: ${title}`);
                        
                        // Verificar si hemos terminado
                        if (summariesCreated === demoData.folders.length * 5 * 5) {
                          console.log(`\n✅ DATOS DE DEMOSTRACIÓN CREADOS EXITOSAMENTE:`);
                          console.log(`   📁 ${foldersCreated} carpetas principales`);
                          console.log(`   📂 ${subfoldersCreated} subcarpetas`);
                          console.log(`   📄 ${summariesCreated} documentos simulados`);
                          console.log(`\n🎯 ¡Listo para la presentación!`);
                          resolve();
                        }
                      });
                  });
                });
            });
          });
      });
    });
  });
}

// Función para limpiar datos existentes (opcional)
function clearExistingData() {
  return new Promise((resolve) => {
    console.log('🧹 Limpiando datos existentes...');
    db.serialize(() => {
      db.run('DELETE FROM summaries', () => {
        db.run('DELETE FROM state_of_art', () => {
          db.run('DELETE FROM folders', () => {
            console.log('✅ Datos anteriores eliminados');
            resolve();
          });
        });
      });
    });
  });
}

// Ejecutar el script
async function main() {
  try {
    await clearExistingData();
    await createDemoData();
    console.log('\n🎉 ¡Script completado exitosamente!');
    console.log('💡 Ahora puedes iniciar la aplicación y mostrar el flujo completo');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando el script:', error);
    process.exit(1);
  }
}

main();