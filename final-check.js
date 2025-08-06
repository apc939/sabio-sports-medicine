const http = require('http');

console.log('🔍 VERIFICACIÓN FINAL DE LA APLICACIÓN SABIO\n');

// Verificar backend
function checkBackend() {
  return new Promise((resolve, reject) => {
    console.log('1️⃣ Verificando Backend (puerto 5001)...');
    const req = http.get('http://localhost:5001/api/folders-with-counts', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const folders = JSON.parse(data);
          console.log(`✅ Backend OK: ${folders.length} carpetas principales`);
          resolve(folders.length);
        } catch (err) {
          console.log('❌ Backend devuelve datos inválidos');
          reject(err);
        }
      });
    }).on('error', (err) => {
      console.log('❌ Backend no accesible');
      reject(err);
    });
  });
}

// Verificar frontend
function checkFrontend() {
  return new Promise((resolve, reject) => {
    console.log('\n2️⃣ Verificando Frontend (puerto 3000)...');
    const req = http.get('http://localhost:3000', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Frontend OK: Servidor React corriendo');
        resolve(true);
      } else {
        console.log(`❌ Frontend error: Status ${res.statusCode}`);
        reject(new Error(`Status ${res.statusCode}`));
      }
    }).on('error', (err) => {
      console.log('❌ Frontend no accesible');
      reject(err);
    });
  });
}

// Verificar datos
function checkData() {
  return new Promise((resolve, reject) => {
    console.log('\n3️⃣ Verificando Datos en la base...');
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./sports_medicine.db');
    
    db.get('SELECT COUNT(*) as folders FROM folders WHERE parent_id IS NULL', (err, row) => {
      if (err) {
        console.log('❌ Error accediendo base de datos');
        reject(err);
        return;
      }
      
      db.get('SELECT COUNT(*) as subfolders FROM folders WHERE parent_id IS NOT NULL', (err2, row2) => {
        if (err2) {
          console.log('❌ Error contando subcarpetas');
          reject(err2);
          return;
        }
        
        db.get('SELECT COUNT(*) as docs FROM summaries', (err3, row3) => {
          if (err3) {
            console.log('❌ Error contando documentos');
            reject(err3);
            return;
          }
          
          console.log(`✅ Datos OK: ${row.folders} carpetas, ${row2.subfolders} subcarpetas, ${row3.docs} documentos`);
          resolve({ folders: row.folders, subfolders: row2.subfolders, docs: row3.docs });
          db.close();
        });
      });
    });
  });
}

// Ejecutar todas las verificaciones
async function runChecks() {
  try {
    await checkBackend();
    await checkFrontend();
    await checkData();
    
    console.log('\n🎉 ¡APLICACIÓN LISTA PARA PRESENTACIÓN!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 Frontend: http://localhost:3000');
    console.log('🔗 Backend:  http://localhost:5001');
    console.log('📊 Estado:   Ambos servicios funcionando correctamente');
    console.log('📚 Datos:    Estructura completa para demostración');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 PRÓXIMOS PASOS:');
    console.log('   1. Abre http://localhost:3000 en tu navegador');
    console.log('   2. Deberías ver las 10 carpetas principales');
    console.log('   3. Navega por la estructura jerárquica');
    console.log('   4. ¡Listo para impresionar en tu pitch! 🚀');
    
  } catch (error) {
    console.log('\n❌ HAY PROBLEMAS CON LA APLICACIÓN');
    console.log('Error:', error.message);
    console.log('\n🔧 SOLUCIONES:');
    console.log('   • Asegúrate que ambos servicios estén corriendo');
    console.log('   • Revisa los logs en las terminales');
    console.log('   • Verifica las conexiones de red');
  }
  
  process.exit(0);
}

runChecks();