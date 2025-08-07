/**
 * Script para configurar HTTPS en localhost
 * Este script genera certificados SSL autofirmados y configura el servidor para usar HTTPS
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk') || { green: (text) => text, yellow: (text) => text, red: (text) => text };

// Directorio para almacenar los certificados
const certsDir = path.join(__dirname, 'certs');

// Crear directorio si no existe
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
  console.log(chalk.green('✓ Directorio de certificados creado'));
}

// Rutas de los archivos de certificados
const keyPath = path.join(certsDir, 'localhost.key');
const certPath = path.join(certsDir, 'localhost.crt');

// Generar certificados si no existen
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  try {
    console.log(chalk.yellow('Generando certificados SSL autofirmados...'));
    
    // Verificar si OpenSSL está instalado
    try {
      execSync('openssl version', { stdio: 'ignore' });
    } catch (error) {
      console.error(chalk.red('Error: OpenSSL no está instalado o no está en el PATH.'));
      console.log(chalk.yellow('Por favor, instala OpenSSL y asegúrate de que esté en tu PATH.'));
      console.log('Windows: https://slproweb.com/products/Win32OpenSSL.html');
      console.log('macOS: brew install openssl');
      console.log('Linux: apt-get install openssl o yum install openssl');
      process.exit(1);
    }
    
    // Generar clave privada
    execSync(`openssl genrsa -out "${keyPath}" 2048`);
    
    // Generar certificado autofirmado
    execSync(`openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"`);
    
    console.log(chalk.green('✓ Certificados SSL generados correctamente'));
  } catch (error) {
    console.error(chalk.red('Error al generar certificados:'), error.message);
    process.exit(1);
  }
} else {
  console.log(chalk.green('✓ Certificados SSL ya existen'));
}

module.exports = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
};

console.log(chalk.green('✓ Configuración HTTPS completada'));
console.log(chalk.yellow('IMPORTANTE: Para que ElevenLabs acepte estos certificados autofirmados:'));
console.log('1. Abre https://localhost:3000 en tu navegador');
console.log('2. Acepta el certificado autofirmado (procedimiento avanzado/inseguro)');
console.log('3. Una vez aceptado, ElevenLabs debería poder conectarse correctamente');