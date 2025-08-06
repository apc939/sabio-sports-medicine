const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

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

  // Crear página de carga personalizada
  const loadingHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sabio Sports Medicine</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .logo {
          font-size: 48px;
          font-weight: 300;
          margin-bottom: 20px;
        }
        .loading {
          font-size: 18px;
          opacity: 0.8;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255,255,255,0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 20px 0;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .buttons {
          margin-top: 30px;
        }
        .btn {
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 10px 20px;
          margin: 0 10px;
          border-radius: 5px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }
        .btn:hover {
          background: rgba(255,255,255,0.3);
        }
      </style>
    </head>
    <body>
      <div class="logo">Sabio Sports Medicine</div>
      <div class="spinner"></div>
      <div class="loading">Iniciando servidor...</div>
      <div class="buttons">
        <button class="btn" onclick="tryAgain()">Reintentar</button>
        <button class="btn" onclick="openBrowser()">Abrir en Navegador</button>
        <button class="btn" onclick="showLogs()">Ver Logs</button>
      </div>
      
      <script>
        let attempt = 0;
        
        function tryConnection() {
          attempt++;
          console.log('Intento', attempt, 'de conectar al servidor...');
          
          fetch('http://localhost:5001')
            .then(response => {
              if (response.ok) {
                console.log('Servidor conectado, redirigiendo...');
                window.location.href = 'http://localhost:5001';
              } else {
                throw new Error('Servidor no responde');
              }
            })
            .catch(error => {
              console.log('Servidor no disponible:', error.message);
              if (attempt < 10) {
                setTimeout(tryConnection, 2000);
              } else {
                document.querySelector('.loading').textContent = 'No se pudo conectar al servidor';
              }
            });
        }
        
        function tryAgain() {
          attempt = 0;
          document.querySelector('.loading').textContent = 'Iniciando servidor...';
          tryConnection();
        }
        
        function openBrowser() {
          const { shell } = require('electron');
          shell.openExternal('http://localhost:5001');
        }
        
        function showLogs() {
          console.log('Logs del servidor en la terminal');
        }
        
        // Iniciar verificación automática
        setTimeout(tryConnection, 3000);
      </script>
    </body>
    </html>
  `;

  // Cargar página de carga
  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(loadingHtml)}`);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Only open DevTools in development
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
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