/**
 * Script para configurar HTTPS en localhost
 * Este script genera certificados SSL autofirmados y configura el servidor para usar HTTPS
 * Utiliza node-forge para generar los certificados sin depender de OpenSSL
 */

const fs = require('fs');
const path = require('path');
const forge = require('node-forge');
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
    console.log(chalk.yellow('Generando certificados SSL autofirmados con node-forge...'));
    
    // Generar par de claves RSA
    const keys = forge.pki.rsa.generateKeyPair(2048);
    const privateKey = forge.pki.privateKeyToPem(keys.privateKey);
    
    // Crear certificado
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    
    // Configurar atributos del certificado
    cert.serialNumber = '01' + Math.floor(Math.random() * 100000000).toString();
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1); // Válido por 1 año
    
    // Atributos del sujeto y emisor
    const attrs = [
      { name: 'commonName', value: 'localhost' },
      { name: 'organizationName', value: 'MCP Server Development' },
      { name: 'organizationalUnitName', value: 'Development' },
      { name: 'localityName', value: 'Local' },
      { name: 'countryName', value: 'ES' }
    ];
    
    cert.setSubject(attrs);
    cert.setIssuer(attrs); // Auto-firmado, el emisor es el mismo que el sujeto
    
    // Extensiones del certificado
    cert.setExtensions([
      {
        name: 'basicConstraints',
        cA: false
      },
      {
        name: 'keyUsage',
        digitalSignature: true,
        keyEncipherment: true,
        dataEncipherment: true
      },
      {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true
      },
      {
        name: 'subjectAltName',
        altNames: [
          { type: 2, value: 'localhost' }, // DNS
          { type: 7, ip: '127.0.0.1' }      // IP
        ]
      }
    ]);
    
    // Firmar el certificado con la clave privada
    cert.sign(keys.privateKey, forge.md.sha256.create());
    
    // Convertir a PEM
    const certPem = forge.pki.certificateToPem(cert);
    
    // Guardar archivos
    fs.writeFileSync(keyPath, privateKey);
    fs.writeFileSync(certPath, certPem);
    
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