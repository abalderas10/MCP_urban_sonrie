const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize } = format;
const path = require('path');
const fs = require('fs');
require('winston-daily-rotate-file');

// Asegurarse de que el directorio de logs exista
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Formato personalizado para los logs
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let metaStr = '';
  if (Object.keys(metadata).length > 0) {
    metaStr = JSON.stringify(metadata);
  }
  return `${timestamp} [${level}]: ${message} ${metaStr}`;
});

// Configuración de transporte para archivos rotados diariamente
const fileRotateTransport = new transports.DailyRotateFile({
  filename: path.join(logsDir, 'mcp-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d', // Mantener logs por 14 días
  maxSize: '20m', // Tamaño máximo de cada archivo
  zippedArchive: true,
  level: 'info'
});

// Crear el logger con múltiples transportes
const logger = createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Escribir en consola
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      )
    }),
    // Escribir en archivos rotados
    fileRotateTransport,
    // Archivo separado para errores
    new transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error' 
    })
  ],
  exitOnError: false
});

// Función para registrar solicitudes MCP
const logMcpRequest = (request) => {
  logger.info('MCP Request', { request });
};

// Función para registrar respuestas MCP
const logMcpResponse = (response) => {
  logger.info('MCP Response', { response });
};

// Función para registrar errores MCP
const logMcpError = (error, request) => {
  logger.error('MCP Error', { error: error.message, stack: error.stack, request });
};

// Función para registrar llamadas a herramientas
const logToolCall = (toolName, args) => {
  logger.info(`Tool Call: ${toolName}`, { args });
};

// Función para registrar resultados de herramientas
const logToolResult = (toolName, result) => {
  logger.info(`Tool Result: ${toolName}`, { result });
};

module.exports = {
  logger,
  logMcpRequest,
  logMcpResponse,
  logMcpError,
  logToolCall,
  logToolResult
};