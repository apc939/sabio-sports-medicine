#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando Sabio Sports Medicine con Gemini AI y Subcarpetas...');
console.log('🔧 Verificando configuración...');

// Verificar que existe la build del cliente
const clientBuildPath = path.join(__dirname, 'client', 'build');
if (!fs.existsSync(clientBuildPath)) {
  console.log('📦 Build del cliente no encontrado, construyendo...');
  
  const buildProcess = spawn('npm', ['run', 'build'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });
  
  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Build completado, iniciando servidor...');
      startServer();
    } else {
      console.error('❌ Error en el build');
      process.exit(1);
    }
  });
} else {
  console.log('✅ Build del cliente encontrado');
  startServer();
}

function startServer() {
  console.log('📡 Iniciando servidor con Gemini AI...');
  
  // Verificar que existe la API key de Gemini
  require('dotenv').config();
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.log('⚠️  ADVERTENCIA: API Key de Gemini no configurada');
    console.log('🔑 Edita el archivo .env y configura GEMINI_API_KEY');
    console.log('🔗 Obtén tu API key en: https://makersuite.google.com/app/apikey');
    console.log('');
  } else {
    console.log('✅ Gemini API Key configurada');
  }

  const serverPath = path.join(__dirname, 'server.js');
  
  const serverProcess = spawn(process.execPath, [serverPath], {
    env: { ...process.env, PORT: 5001 },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(`Server: ${output}`);
    
    // Cuando el servidor esté listo, abrir Electron
    if (output.includes('Servidor corriendo en puerto')) {
      console.log('✅ Servidor listo con todas las funcionalidades:');
      console.log('   🤖 Gemini AI para análisis');
      console.log('   📁 Sistema de subcarpetas');
      console.log('   🧭 Navegación jerárquica');
      console.log('   💬 Chat IA especializado');
      console.log('');
      console.log('🖥️  Abriendo aplicación Electron...');
      
      setTimeout(() => {
        const electronProcess = spawn(require('electron'), ['.'], {
          stdio: 'inherit'
        });
        
        electronProcess.on('close', () => {
          console.log('🛑 Cerrando servidor...');
          serverProcess.kill();
          process.exit(0);
        });
        
        electronProcess.on('error', (error) => {
          console.error('❌ Error abriendo Electron:', error);
          console.log('🌐 Puedes acceder manualmente en: http://localhost:5000');
        });
      }, 1500);
    }
  });

  serverProcess.stderr.on('data', (data) => {
    const error = data.toString().trim();
    if (!error.includes('DeprecationWarning')) {
      console.error(`Server Error: ${error}`);
    }
  });

  serverProcess.on('error', (error) => {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  });

  // Manejar cierre
  process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando aplicación...');
    if (serverProcess) {
      serverProcess.kill();
    }
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    if (serverProcess) {
      serverProcess.kill();
    }
    process.exit(0);
  });
}