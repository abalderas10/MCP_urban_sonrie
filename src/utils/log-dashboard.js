/**
 * Dashboard para visualización de logs
 * Este módulo proporciona un dashboard web para visualizar los logs del servidor MCP
 * en tiempo real y facilitar el diagnóstico de problemas.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { logger } = require('./logger');

/**
 * Configura las rutas del dashboard de logs
 * @param {express.Application} app - La aplicación Express
 */
const setupLogDashboard = (app) => {
  // Ruta principal del dashboard
  app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'dashboard.html'));
  });

  // API para obtener la lista de archivos de log
  app.get('/api/logs', (req, res) => {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      return res.status(404).json({ error: 'No hay logs disponibles' });
    }
    
    const logFiles = fs.readdirSync(logsDir)
      .filter(file => file.endsWith('.log') || file.match(/mcp-\d{4}-\d{2}-\d{2}/));
    
    // Obtener información adicional de cada archivo
    const logFilesInfo = logFiles.map(filename => {
      const filePath = path.join(logsDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    });
    
    // Ordenar por fecha de modificación (más reciente primero)
    logFilesInfo.sort((a, b) => b.modified - a.modified);
    
    res.json({ logFiles: logFilesInfo });
  });

  // API para obtener el contenido de un archivo de log
  app.get('/api/logs/:filename', (req, res) => {
    const { filename } = req.params;
    const logPath = path.join(process.cwd(), 'logs', filename);
    
    if (!fs.existsSync(logPath)) {
      return res.status(404).json({ error: 'Archivo de log no encontrado' });
    }
    
    // Leer el archivo y convertirlo a formato JSON para mejor visualización
    try {
      const logContent = fs.readFileSync(logPath, 'utf8');
      const logLines = logContent.split('\n').filter(line => line.trim());
      
      // Intentar parsear cada línea como un objeto JSON estructurado
      const parsedLogs = logLines.map(line => {
        try {
          // Extraer timestamp, level y mensaje
          const match = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)\]: (.+)$/);
          if (match) {
            const [, timestamp, level, rest] = match;
            
            // Intentar extraer JSON si existe
            let message = rest;
            let metadata = {};
            
            const jsonStart = rest.indexOf('{');
            if (jsonStart !== -1) {
              message = rest.substring(0, jsonStart).trim();
              try {
                metadata = JSON.parse(rest.substring(jsonStart));
              } catch (e) {
                // Si no se puede parsear, usar el resto como mensaje
              }
            }
            
            return {
              timestamp,
              level,
              message,
              metadata
            };
          }
          return { raw: line };
        } catch (e) {
          return { raw: line };
        }
      });
      
      res.json({ filename, logs: parsedLogs });
    } catch (error) {
      logger.error('Error al leer archivo de log', { error: error.message, filename });
      res.status(500).json({ error: 'Error al leer archivo de log', message: error.message });
    }
  });

  // API para obtener estadísticas de logs
  app.get('/api/stats', (req, res) => {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      return res.status(404).json({ error: 'No hay logs disponibles' });
    }
    
    try {
      // Obtener el archivo de log más reciente
      const logFiles = fs.readdirSync(logsDir)
        .filter(file => file.match(/mcp-\d{4}-\d{2}-\d{2}/))
        .sort();
      
      if (logFiles.length === 0) {
        return res.json({ stats: { errors: 0, warnings: 0, info: 0 } });
      }
      
      const latestLogFile = logFiles[logFiles.length - 1];
      const logPath = path.join(logsDir, latestLogFile);
      const logContent = fs.readFileSync(logPath, 'utf8');
      
      // Contar errores, advertencias e info
      const errors = (logContent.match(/\[error\]/gi) || []).length;
      const warnings = (logContent.match(/\[warn\]/gi) || []).length;
      const info = (logContent.match(/\[info\]/gi) || []).length;
      
      // Contar tipos de solicitudes MCP
      const discoveryRequests = (logContent.match(/"type":"discovery"/g) || []).length;
      const toolCallRequests = (logContent.match(/"type":"tool_call"/g) || []).length;
      
      res.json({
        stats: {
          errors,
          warnings,
          info,
          discoveryRequests,
          toolCallRequests,
          totalRequests: discoveryRequests + toolCallRequests
        }
      });
    } catch (error) {
      logger.error('Error al obtener estadísticas de logs', { error: error.message });
      res.status(500).json({ error: 'Error al obtener estadísticas', message: error.message });
    }
  });

  logger.info('Dashboard de logs configurado en /dashboard');
};

module.exports = {
  setupLogDashboard
};