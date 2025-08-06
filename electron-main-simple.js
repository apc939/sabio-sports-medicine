const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

// Prevenir múltiples instancias
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  if (mainWindow) return;

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    title: 'Sabio Sports Medicine',
    show: false
  });

  // Verificar si el servidor existe (puede estar en app.asar.unpacked)
  let serverPath = path.join(__dirname, 'server.js');
  const unpackedPath = path.join(__dirname, '..', 'app.asar.unpacked', 'server.js');
  
  // Verificar si está en unpacked primero
  try {
    require('fs').accessSync(unpackedPath);
    serverPath = unpackedPath;
    console.log('Servidor encontrado en unpacked:', serverPath);
  } catch (e) {
    console.log('Buscando servidor en:', serverPath);
  }
  
  try {
    require('fs').accessSync(serverPath);
    console.log('Servidor encontrado, iniciando...');
    
    serverProcess = spawn(process.execPath, [serverPath], {
      env: { ...process.env, PORT: 5001 },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    serverProcess.stdout.on('data', (data) => {
      console.log('Server output:', data.toString());
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('Server error:', data.toString());
    });

    serverProcess.on('error', (error) => {
      console.error('Failed to start server:', error);
    });

  } catch (error) {
    console.error('Server file not found:', error);
  }

  // Función para probar conexión
  const testConnection = () => {
    return fetch('http://localhost:5001')
      .then(() => {
        console.log('Servidor respondiendo en puerto 5001');
        return true;
      })
      .catch(() => {
        console.log('Servidor no responde en puerto 5001');
        return false;
      });
  };

  // Cargar página con verificación
  setTimeout(async () => {
    const serverWorking = await testConnection();
    
    if (serverWorking) {
      console.log('Cargando desde servidor principal...');
      mainWindow.loadURL('http://localhost:5001');
    } else {
      console.log('Servidor no funciona, usando modo offline...');
      // Cargar solo frontend sin funcionalidad de servidor
      const buildPath = path.join(__dirname, 'client/build');
      const indexPath = `file://${path.join(buildPath, 'index.html')}`;
      
      // Configurar base href para archivos estáticos
      const fs = require('fs');
      let indexContent = fs.readFileSync(path.join(buildPath, 'index.html'), 'utf8');
      indexContent = indexContent.replace('<head>', `<head><base href="file://${buildPath}/">`);
      
      // Escribir archivo temporal
      const tempPath = path.join(buildPath, 'index-electron.html');
      fs.writeFileSync(tempPath, indexContent);
      
      mainWindow.loadURL(`file://${tempPath}`);
    }
  }, 10000);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});