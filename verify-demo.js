const sqlite3 = require('sqlite3').verbose();

console.log('🔍 VERIFICANDO DATOS DE DEMOSTRACIÓN...\n');

const db = new sqlite3.Database('./sports_medicine.db');

// Verificar carpetas principales
db.all('SELECT COUNT(*) as count FROM folders WHERE parent_id IS NULL', (err, rows) => {
  if (err) {
    console.error('❌ Error verificando carpetas principales:', err);
    return;
  }
  console.log(`📁 Carpetas principales: ${rows[0].count}`);
});

// Verificar subcarpetas
db.all('SELECT COUNT(*) as count FROM folders WHERE parent_id IS NOT NULL', (err, rows) => {
  if (err) {
    console.error('❌ Error verificando subcarpetas:', err);
    return;
  }
  console.log(`📂 Subcarpetas: ${rows[0].count}`);
});

// Verificar documentos
db.all('SELECT COUNT(*) as count FROM summaries', (err, rows) => {
  if (err) {
    console.error('❌ Error verificando documentos:', err);
    return;
  }
  console.log(`📄 Documentos: ${rows[0].count}`);
});

// Mostrar estructura de carpetas principales con subcarpetas
db.all(`
  SELECT 
    p.name as carpeta_principal,
    COUNT(s.id) as num_subcarpetas,
    SUM(COALESCE(doc_count.docs, 0)) as total_documentos
  FROM folders p
  LEFT JOIN folders s ON p.id = s.parent_id
  LEFT JOIN (
    SELECT folder_id, COUNT(*) as docs
    FROM summaries 
    GROUP BY folder_id
  ) doc_count ON s.id = doc_count.folder_id
  WHERE p.parent_id IS NULL
  GROUP BY p.id, p.name
  ORDER BY p.name
`, (err, rows) => {
  if (err) {
    console.error('❌ Error obteniendo estructura:', err);
    return;
  }
  
  console.log('\n📊 ESTRUCTURA DETALLADA:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  rows.forEach(row => {
    console.log(`📁 ${row.carpeta_principal.padEnd(30)} │ ${row.num_subcarpetas} subcarpetas │ ${row.total_documentos} docs`);
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Mostrar algunas subcarpetas de ejemplo
db.all(`
  SELECT 
    p.name as carpeta_principal,
    s.name as subcarpeta,
    COUNT(doc.id) as num_documentos
  FROM folders p
  JOIN folders s ON p.id = s.parent_id
  LEFT JOIN summaries doc ON s.id = doc.folder_id
  WHERE p.name = 'Lesiones Deportivas'
  GROUP BY p.id, s.id, p.name, s.name
  ORDER BY s.name
`, (err, rows) => {
  if (err) {
    console.error('❌ Error obteniendo subcarpetas:', err);
    return;
  }
  
  console.log('\n📂 EJEMPLO - SUBCARPETAS DE "LESIONES DEPORTIVAS":');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  rows.forEach(row => {
    console.log(`   📂 ${row.subcarpeta.padEnd(35)} │ ${row.num_documentos} documentos`);
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Mostrar algunos documentos de ejemplo
db.all(`
  SELECT 
    s.title,
    f.name as subcarpeta
  FROM summaries s
  JOIN folders f ON s.folder_id = f.id
  WHERE f.name = 'Lesiones del LCA'
  LIMIT 3
`, (err, rows) => {
  if (err) {
    console.error('❌ Error obteniendo documentos:', err);
    return;
  }
  
  console.log('\n📄 EJEMPLO - DOCUMENTOS EN "LESIONES DEL LCA":');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  rows.forEach((row, index) => {
    console.log(`   ${index + 1}. ${row.title}`);
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  setTimeout(() => {
    console.log('\n✅ VERIFICACIÓN COMPLETADA');
    console.log('🎯 La aplicación está lista para la presentación!');
    console.log('\n🚀 ACCEDE A LA APLICACIÓN EN:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend:  http://localhost:5001');
    console.log('\n📋 GUÍA DE PRESENTACIÓN: Ver archivo GUIA_PRESENTACION.md');
    
    db.close();
    process.exit(0);
  }, 1000);
});