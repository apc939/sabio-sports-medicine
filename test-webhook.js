// Test script para probar el webhook de n8n
const webhookUrl = 'https://n8n.srv879499.hstgr.cloud/webhook-test/medicina-deportiva-chat';

const testData = {
  message: "¿Puedes ver este mensaje de prueba?",
  context: {
    folders: [
      {
        id: 1,
        name: "Test Folder",
        created_at: "2025-01-30"
      }
    ],
    summaries: [
      {
        id: 1,
        folder_id: 1,
        title: "Test Document",
        summary: "Este es un documento de prueba para verificar la conexión.",
        critical_analysis: "Análisis de prueba.",
        keywords: "test, prueba, conexión",
        created_at: "2025-01-30"
      }
    ],
    total_documents: 1,
    research_areas: 1,
    last_updated: new Date().toISOString()
  },
  timestamp: new Date().toISOString(),
  sessionId: `test_session_${Date.now()}`
};

async function testWebhook() {
  try {
    console.log('🔄 Enviando datos de prueba al webhook...');
    console.log('URL:', webhookUrl);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta exitosa:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Error en la respuesta:');
      console.log(errorText);
    }
  } catch (error) {
    console.log('❌ Error de conexión:');
    console.log(error.message);
  }
}

// Ejecutar test si se llama directamente
if (typeof window === 'undefined') {
  // Polyfill para fetch en Node.js
  const https = require('https');
  const http = require('http');
  
  global.fetch = function(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;
      
      const req = protocol.request({
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: options.headers || {}
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            statusText: res.statusMessage,
            json: () => Promise.resolve(JSON.parse(data)),
            text: () => Promise.resolve(data)
          });
        });
      });
      
      req.on('error', reject);
      
      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  };
  
  testWebhook();
}

module.exports = { testWebhook };