const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Detectar si estamos en desarrollo
const isDev = process.env.NODE_ENV === 'development' || 
             process.defaultApp || 
             /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || 
             /[\\/]electron[\\/]/.test(process.execPath);

let mainWindow;
let serverProcess;

// Prevenir múltiples instancias
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Alguien intentó ejecutar una segunda instancia, enfocar nuestra ventana
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Función para iniciar servidor
function startServer() {
  if (isDev) {
    // En desarrollo no hacer nada
    return;
  }
  
  if (serverProcess) {
    // Ya hay un servidor corriendo
    return;
  }
  
  // Iniciar servidor en producción
  const serverPath = path.join(__dirname, 'server.js');
  
  // Verificar que el archivo del servidor existe
  try {
    require('fs').accessSync(serverPath);
  } catch (e) {
    return; // No se puede acceder al servidor
  }
  
  serverProcess = spawn(process.execPath, [serverPath], {
    stdio: 'ignore',
    env: { 
      ...process.env, 
      PORT: 5001,
      NODE_ENV: 'production'
    },
    cwd: __dirname
  });

  serverProcess.on('error', () => {
    serverProcess = null;
  });

  serverProcess.on('exit', () => {
    serverProcess = null;
  });
}

function createWindow() {
  // Evitar múltiples ventanas
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.focus();
    return;
  }

  // Crear la ventana del navegador
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      cache: false // Deshabilitar cache para forzar actualizaciones
    },
    title: 'Sabio Sports Medicine',
    titleBarStyle: 'default',
    show: false
  });

  // Configurar el menú de la aplicación
  const menuTemplate = [
    {
      label: 'Sabio',
      submenu: [
        {
          label: 'Acerca de Sabio Sports Medicine',
          role: 'about'
        },
        { type: 'separator' },
        {
          label: 'Ocultar Sabio',
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Ocultar Otros',
          accelerator: 'Command+Alt+H',
          role: 'hideothers'
        },
        {
          label: 'Mostrar Todo',
          role: 'unhide'
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { label: 'Deshacer', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Rehacer', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cortar', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copiar', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Pegar', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Seleccionar Todo', accelerator: 'CmdOrCtrl+A', role: 'selectall' }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        {
          label: 'Recargar',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        {
          label: 'Limpiar Cache y Recargar',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow.webContents.session.clearCache();
            mainWindow.webContents.reloadIgnoringCache();
          }
        },
        {
          label: 'Forzar Recarga',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow.webContents.reloadIgnoringCache();
          }
        },
        {
          label: 'Herramientas de Desarrollador',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        },
        { type: 'separator' },
        { label: 'Pantalla Completa', accelerator: 'Ctrl+Command+F', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Ventana',
      submenu: [
        { label: 'Minimizar', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Cerrar', accelerator: 'CmdOrCtrl+W', role: 'close' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Iniciar servidor si es necesario
  startServer();

  // URL a cargar  
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : 'http://localhost:5001';

  // Limpiar cache al iniciar para forzar actualizaciones
  mainWindow.webContents.session.clearCache();
  
  // Función para intentar cargar con fallback
  const loadWithRetry = (attempt = 1) => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    
    if (isDev) {
      // En desarrollo, cargar directamente
      mainWindow.loadURL(startUrl);
      return;
    }

    // En producción, intentar cargar la URL del servidor
    mainWindow.loadURL(startUrl).catch(() => {
      if (attempt < 3) {
        // Reintentar después de 3 segundos
        setTimeout(() => loadWithRetry(attempt + 1), 3000);
      } else {
        // Fallback: cargar archivos estáticos
        const fallbackUrl = `file://${path.join(__dirname, 'client/build/index.html')}`;
        mainWindow.loadURL(fallbackUrl);
      }
    });
  };

  // Esperar y cargar con reintentos
  setTimeout(() => {
    loadWithRetry();
  }, isDev ? 2000 : 6000);

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Abrir DevTools para debug (temporal)
    mainWindow.webContents.openDevTools();
  });

  // Agregar listeners para debug
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    // Si falla cargar, mostrar página de error
    const errorHtml = `
      <html>
        <body style="font-family: Arial; padding: 50px; text-align: center;">
          <h1>🔄 Iniciando Sabio Sports Medicine</h1>
          <p>El servidor se está iniciando, por favor espera...</p>
          <p style="color: #666;">Error: ${errorDescription}</p>
          <p style="color: #666;">URL: ${validatedURL}</p>
          <button onclick="location.reload()" style="padding: 10px 20px; font-size: 16px;">Reintentar</button>
        </body>
      </html>
    `;
    mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
  });

  // Manejar enlaces externos
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Este método será llamado cuando Electron haya terminado la inicialización
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Salir cuando todas las ventanas estén cerradas
app.on('window-all-closed', () => {
  // En macOS es común que las aplicaciones permanezcan activas 
  // hasta que el usuario las cierre explícitamente con Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Limpiar procesos al salir
app.on('before-quit', () => {
  if (serverProcess && !serverProcess.killed) {
    try {
      serverProcess.kill('SIGTERM');
    } catch (e) {
      // Ignorar errores al cerrar
    }
    serverProcess = null;
  }
});

// Prevenir navegación no autorizada
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:5001'];

    if (!allowedOrigins.includes(parsedUrl.origin)) {
      event.preventDefault();
    }
  });
});