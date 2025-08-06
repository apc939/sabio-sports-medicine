const http = require('http');

console.log('🧪 PROBANDO CONECTIVIDAD FRONTEND-BACKEND...\n');

// Test backend directo
console.log('1️⃣ Probando Backend (Puerto 5001)...');
const backendReq = http.get('http://localhost:5001/api/folders-with-counts', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const folders = JSON.parse(data);
      console.log(`✅ Backend funcionando: ${folders.length} carpetas encontradas`);
      
      // Test proxy del frontend
      console.log('\n2️⃣ Probando Frontend con Proxy (Puerto 3000)...');
      const frontendReq = http.get('http://localhost:3000/api/folders-with-counts', (res2) => {
        let data2 = '';
        res2.on('data', (chunk) => data2 += chunk);
        res2.on('end', () => {
          try {
            const folders2 = JSON.parse(data2);
            console.log(`✅ Frontend proxy funcionando: ${folders2.length} carpetas encontradas`);
            console.log('\n🎯 DIAGNÓSTICO: Todo funciona correctamente!');
            console.log('💡 El error puede ser temporal. Refresca el navegador.');
          } catch (err) {
            console.log(`❌ Frontend proxy error: ${err.message}`);
          }
          process.exit(0);
        });
      }).on('error', (err) => {
        console.log(`❌ Error conectando a frontend: ${err.message}`);
        console.log('💡 Asegúrate de que React esté corriendo en puerto 3000');
        process.exit(1);
      });
      
    } catch (err) {
      console.log(`❌ Error parseando respuesta del backend: ${err.message}`);
      process.exit(1);
    }
  });
}).on('error', (err) => {
  console.log(`❌ Error conectando a backend: ${err.message}`);
  console.log('💡 Asegúrate de que el servidor esté corriendo en puerto 5001');
  process.exit(1);
});