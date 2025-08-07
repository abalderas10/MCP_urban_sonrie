/**
 * Sistema de alertas para errores críticos
 * Este módulo proporciona funcionalidades para detectar, notificar y gestionar
 * errores críticos en el servidor MCP.
 */

const { logger } = require('./logger');
const nodemailer = require('nodemailer');

// Configuración para el envío de correos electrónicos
// Nota: Estas variables deberían configurarse en el archivo .env
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.example.com';
const EMAIL_PORT = process.env.EMAIL_PORT || 587;
const EMAIL_USER = process.env.EMAIL_USER || 'alerts@example.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'password';
const EMAIL_TO = process.env.EMAIL_TO || 'admin@example.com';

// Umbral de errores para activar alertas
const ERROR_THRESHOLD = process.env.ERROR_THRESHOLD || 5;
const ERROR_WINDOW_MS = process.env.ERROR_WINDOW_MS || 60000; // 1 minuto

// Registro de errores recientes
let recentErrors = [];

/**
 * Configura el transporte de correo electrónico para las alertas
 */
const configureMailTransport = () => {
  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });
};

/**
 * Envía una alerta por correo electrónico
 * @param {string} subject - Asunto del correo
 * @param {string} message - Mensaje del correo
 * @param {Object} errorDetails - Detalles adicionales del error
 */
const sendEmailAlert = async (subject, message, errorDetails = {}) => {
  try {
    const transporter = configureMailTransport();
    
    await transporter.sendMail({
      from: `"MCP Alert System" <${EMAIL_USER}>`,
      to: EMAIL_TO,
      subject: subject,
      text: message,
      html: `
        <h2>Alerta del Servidor MCP</h2>
        <p>${message}</p>
        ${errorDetails.error ? `<h3>Error:</h3><pre>${errorDetails.error}</pre>` : ''}
        ${errorDetails.stack ? `<h3>Stack:</h3><pre>${errorDetails.stack}</pre>` : ''}
        ${errorDetails.request ? `<h3>Request:</h3><pre>${JSON.stringify(errorDetails.request, null, 2)}</pre>` : ''}
        <p>Fecha y hora: ${new Date().toLocaleString()}</p>
      `
    });
    
    logger.info('Alerta enviada por correo electrónico', { subject });
  } catch (error) {
    logger.error('Error al enviar alerta por correo electrónico', { error: error.message });
  }
};

/**
 * Registra un error crítico y envía alertas si es necesario
 * @param {Error} error - El error ocurrido
 * @param {Object} request - La solicitud que causó el error
 */
const logCriticalError = (error, request = {}) => {
  // Registrar el error en el sistema de logs
  logger.error('ERROR CRÍTICO', { error: error.message, stack: error.stack, request });
  
  // Añadir el error al registro de errores recientes
  const now = Date.now();
  recentErrors.push(now);
  
  // Limpiar errores antiguos
  recentErrors = recentErrors.filter(timestamp => (now - timestamp) < ERROR_WINDOW_MS);
  
  // Verificar si se ha superado el umbral de errores
  if (recentErrors.length >= ERROR_THRESHOLD) {
    sendEmailAlert(
      'Alerta: Umbral de errores críticos superado',
      `Se han detectado ${recentErrors.length} errores en los últimos ${ERROR_WINDOW_MS/1000} segundos.`,
      { error: error.message, stack: error.stack, request }
    );
  }
};

/**
 * Monitorea el uso de memoria y envía alertas si es necesario
 */
/**
 * Monitorea el uso de memoria (solo en entorno no serverless)
 */
const startMemoryMonitoring = () => {
  // No ejecutar monitoreo de memoria en entorno serverless (Vercel)
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL === '1') {
    logger.info('Monitoreo de memoria desactivado en entorno serverless');
    return;
  }
  
  const MEMORY_CHECK_INTERVAL = process.env.MEMORY_CHECK_INTERVAL || 60000; // 1 minuto
  const MEMORY_THRESHOLD_MB = process.env.MEMORY_THRESHOLD_MB || 500; // 500 MB
  
  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    
    logger.info('Uso de memoria', { heapUsedMB, memoryUsage });
    
    if (heapUsedMB > MEMORY_THRESHOLD_MB) {
      sendEmailAlert(
        'Alerta: Alto uso de memoria',
        `El servidor está utilizando ${heapUsedMB}MB de memoria, superando el umbral de ${MEMORY_THRESHOLD_MB}MB.`,
        { memoryUsage }
      );
    }
  }, MEMORY_CHECK_INTERVAL);
};

/**
 * Monitorea el tiempo de respuesta de las APIs externas
 * @param {string} apiName - Nombre de la API
 * @param {number} responseTimeMs - Tiempo de respuesta en milisegundos
 */
const monitorApiResponseTime = (apiName, responseTimeMs) => {
  const API_RESPONSE_THRESHOLD_MS = process.env.API_RESPONSE_THRESHOLD_MS || 2000; // 2 segundos
  
  logger.info('Tiempo de respuesta de API', { apiName, responseTimeMs });
  
  if (responseTimeMs > API_RESPONSE_THRESHOLD_MS) {
    sendEmailAlert(
      'Alerta: Tiempo de respuesta lento',
      `La API ${apiName} está respondiendo lentamente (${responseTimeMs}ms, umbral: ${API_RESPONSE_THRESHOLD_MS}ms).`,
      { apiName, responseTimeMs }
    );
  }
};

module.exports = {
  logCriticalError,
  startMemoryMonitoring,
  monitorApiResponseTime,
  sendEmailAlert
};