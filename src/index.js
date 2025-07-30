require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { handleMcpRequest } = require('./mcp-server');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta principal para el servidor MCP
app.post('/mcp', async (req, res) => {
  try {
    const response = await handleMcpRequest(req.body);
    res.json(response);
  } catch (error) {
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
      { path: '/health', method: 'GET', description: 'Verificación de estado del servidor' }
    ]
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor MCP ejecutándose en http://localhost:${PORT}`);
});