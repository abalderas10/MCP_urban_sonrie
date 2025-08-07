require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { handleMcpRequest } = require('./mcp-server');
const { logger, logMcpRequest, logMcpResponse, logMcpError } = require('./utils/logger');
const { logCriticalError, startMemoryMonitoring, monitorApiResponseTime } = require('./utils/alerts');
const { setupLogDashboard } = require('./utils/log-dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ruta principal para el servidor MCP
app.post('/mcp', async (req, res) => {
  const startTime = Date.now();
  try {
    logMcpRequest(req.body);
    const response = await handleMcpRequest(req.body);
    logMcpResponse(response);
    
    // Monitorear tiempo de respuesta
    const responseTime = Date.now() - startTime;
    monitorApiResponseTime('MCP Request', responseTime);
    
    res.json(response);
  } catch (error) {
    logMcpError(error, req.body);
    // Registrar como error crítico si es un error grave
    if (error.status >= 500 || error.message.includes('API key') || error.message.includes('timeout')) {
      logCriticalError(error, req.body);
    }
    console.error('Error handling MCP request:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Ruta de verificación de estado
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Ruta de documentación
app.get('/', (req, res) => {
  res.json({
    name: 'ElevenLabs-CalCom MCP Server',
    description: 'Servidor MCP para integrar ElevenLabs con Cal.com',
    endpoints: [
      { path: '/mcp', method: 'POST', description: 'Endpoint principal del MCP' },
      { path: '/health', method: 'GET', description: 'Verificación de estado del servidor' },
      { path: '/dashboard', method: 'GET', description: 'Dashboard de visualización de logs' }
    ]
  });
});

// Configurar el dashboard de logs
setupLogDashboard(app);

// Ruta para acceder a los logs (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  const fs = require('fs');
  const path = require('path');
  
  app.get('/logs', (req, res) => {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      return res.status(404).json({ error: 'No hay logs disponibles' });
    }
    
    const logFiles = fs.readdirSync(logsDir);
    res.json({ logFiles });
  });
  
  app.get('/logs/:filename', (req, res) => {
    const { filename } = req.params;
    const logPath = path.join(process.cwd(), 'logs', filename);
    
    if (!fs.existsSync(logPath)) {
      return res.status(404).json({ error: 'Archivo de log no encontrado' });
    }
    
    const logContent = fs.readFileSync(logPath, 'utf8');
    res.type('text/plain').send(logContent);
  });
} else {
  // En producción, mostrar mensaje informativo
  app.get('/logs', (req, res) => {
    res.status(403).json({ error: 'Los logs no están disponibles en producción' });
  });
  
  app.get('/logs/:filename', (req, res) => {
    res.status(403).json({ error: 'Los logs no están disponibles en producción' });
  });
}

// Iniciar el servidor
if (process.env.NODE_ENV === 'production' && process.env.VERCEL === '1') {
  // En Vercel, no necesitamos iniciar el servidor explícitamente
  // ya que Vercel maneja esto automáticamente
  logger.info('Servidor MCP ejecutándose en Vercel');
  console.log('Servidor MCP ejecutándose en Vercel');
  
  // No iniciamos monitoreo de memoria en Vercel
} else {
  // Iniciar el servidor en entorno local
  app.listen(PORT, () => {
    logger.info(`Servidor MCP ejecutándose en http://localhost:${PORT}`);
    console.log(`Servidor MCP ejecutándose en http://localhost:${PORT}`);
    
    // Iniciar monitoreo de memoria
    startMemoryMonitoring();
  });
}