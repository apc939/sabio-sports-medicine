const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./sports_medicine.db');

console.log('🔄 Iniciando migración de base de datos...');

db.serialize(() => {
  // Verificar si la columna parent_id ya existe
  db.all("PRAGMA table_info(folders)", (err, rows) => {
    if (err) {
      console.error('Error verificando estructura de tabla:', err);
      return;
    }
    
    const hasParentId = rows.some(row => row.name === 'parent_id');
    
    if (hasParentId) {
      console.log('✅ La columna parent_id ya existe');
      process.exit(0);
    } else {
      console.log('📝 Agregando columna parent_id a la tabla folders...');
      
      // Crear tabla temporal con la nueva estructura
      db.run(`CREATE TABLE folders_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        parent_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES folders (id) ON DELETE CASCADE,
        UNIQUE(name, parent_id)
      )`, (err) => {
        if (err) {
          console.error('Error creando tabla temporal:', err);
          return;
        }
        
        // Migrar datos existentes
        db.run(`INSERT INTO folders_new (id, name, created_at)
                SELECT id, name, created_at FROM folders`, (err) => {
          if (err) {
            console.error('Error migrando datos:', err);
            return;
          }
          
          // Eliminar tabla antigua
          db.run('DROP TABLE folders', (err) => {
            if (err) {
              console.error('Error eliminando tabla antigua:', err);
              return;
            }
            
            // Renombrar tabla nueva
            db.run('ALTER TABLE folders_new RENAME TO folders', (err) => {
              if (err) {
                console.error('Error renombrando tabla:', err);
                return;
              }
              
              console.log('✅ Migración completada exitosamente');
              console.log('🎯 Ahora puedes ejecutar el script de datos de demostración');
              process.exit(0);
            });
          });
        });
      });
    }
  });
});

// Manejar errores
db.on('error', (err) => {
  console.error('Error de base de datos:', err);
  process.exit(1);
});