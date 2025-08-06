#!/bin/bash

echo "🔧 Creando acceso directo para Sabio Sports Medicine..."

# Crear el acceso directo en el escritorio
cat > "/Users/andresp.ch./Desktop/Sabio Sports Medicine.command" << 'EOF'
#!/bin/bash

# Script de acceso directo para Sabio Sports Medicine
echo "🏥 Iniciando Sabio Sports Medicine..."
echo "📍 Navegando al directorio de la aplicación..."

cd "/Users/andresp.ch./Desktop/App Sabio Sports Medicine"

if [ ! -f "start-app.js" ]; then
    echo "❌ Error: No se encontró start-app.js"
    echo "Presiona Enter para cerrar..."
    read
    exit 1
fi

echo "✅ Directorio correcto encontrado"
echo "🚀 Ejecutando Sabio Sports Medicine..."
echo ""
echo "📌 INSTRUCCIONES:"
echo "   • La aplicación se abrirá automáticamente"
echo "   • Para cerrar: presiona Ctrl+C aquí o cierra la ventana"
echo "   • No cierres esta ventana de Terminal mientras uses la app"
echo ""

node start-app.js

echo ""
echo "👋 Sabio Sports Medicine se ha cerrado"
echo "Presiona Enter para cerrar esta ventana..."
read
EOF

# Hacer ejecutable
chmod +x "/Users/andresp.ch./Desktop/Sabio Sports Medicine.command"

echo "✅ Acceso directo creado en el escritorio"
echo "🎯 Ahora puedes hacer doble clic en 'Sabio Sports Medicine.command'"
echo ""