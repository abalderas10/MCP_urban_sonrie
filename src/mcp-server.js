const { handleCalComTools } = require('./tools/calcom');
const { handleElevenLabsTools } = require('./tools/elevenlabs');

// Definición de las herramientas disponibles en el servidor MCP
const tools = [
  // Herramientas de Cal.com
  {
    name: 'get_available_slots',
    description: 'Obtiene los espacios disponibles en el calendario para programar una reunión',
    inputSchema: {
      type: 'object',
      properties: {
        event_type_id: { type: 'string', description: 'ID del tipo de evento en Cal.com' },
        start_date: { type: 'string', description: 'Fecha de inicio para buscar disponibilidad (YYYY-MM-DD)' },
        end_date: { type: 'string', description: 'Fecha de fin para buscar disponibilidad (YYYY-MM-DD)' },
        timezone: { type: 'string', description: 'Zona horaria del usuario (e.j. "America/New_York")' }
      },
      required: ['event_type_id']
    }
  },
  {
    name: 'book_meeting',
    description: 'Programa una reunión en Cal.com',
    inputSchema: {
      type: 'object',
      properties: {
        event_type_id: { type: 'string', description: 'ID del tipo de evento en Cal.com' },
        start_time: { type: 'string', description: 'Hora de inicio de la reunión (ISO 8601)' },
        end_time: { type: 'string', description: 'Hora de fin de la reunión (ISO 8601)' },
        name: { type: 'string', description: 'Nombre del asistente' },
        email: { type: 'string', description: 'Email del asistente' },
        notes: { type: 'string', description: 'Notas adicionales para la reunión' },
        timezone: { type: 'string', description: 'Zona horaria del asistente' }
      },
      required: ['event_type_id', 'start_time', 'name', 'email']
    }
  },
  // Herramientas de ElevenLabs
  {
    name: 'generate_speech',
    description: 'Genera voz a partir de texto usando ElevenLabs',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Texto a convertir en voz' },
        voice_id: { type: 'string', description: 'ID de la voz a utilizar' },
        model_id: { type: 'string', description: 'ID del modelo a utilizar (opcional)' },
        stability: { type: 'number', description: 'Estabilidad de la voz (0.0 - 1.0)' },
        similarity_boost: { type: 'number', description: 'Aumento de similitud (0.0 - 1.0)' }
      },
      required: ['text', 'voice_id']
    }
  },
  {
    name: 'list_voices',
    description: 'Lista las voces disponibles en ElevenLabs',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'create_voice_agent',
    description: 'Crea un agente de voz en ElevenLabs para realizar llamadas',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nombre del agente de voz' },
        voice_id: { type: 'string', description: 'ID de la voz a utilizar' },
        system_prompt: { type: 'string', description: 'Instrucciones del sistema para el agente' },
        initial_message: { type: 'string', description: 'Mensaje inicial que dirá el agente' },
        knowledge: { type: 'string', description: 'Conocimiento adicional para el agente (opcional)' }
      },
      required: ['name', 'voice_id', 'system_prompt', 'initial_message']
    }
  },
  {
    name: 'make_outbound_call',
    description: 'Realiza una llamada saliente usando un agente de voz de ElevenLabs',
    inputSchema: {
      type: 'object',
      properties: {
        agent_id: { type: 'string', description: 'ID del agente de voz' },
        phone_number: { type: 'string', description: 'Número de teléfono a llamar' },
        purpose: { type: 'string', description: 'Propósito de la llamada' }
      },
      required: ['agent_id', 'phone_number']
    }
  }
];

/**
 * Maneja una solicitud MCP y devuelve la respuesta apropiada
 * @param {Object} request - La solicitud MCP
 * @returns {Object} - La respuesta MCP
 */
async function handleMcpRequest(request) {
  // Verificar si es una solicitud de descubrimiento de herramientas
  if (request.type === 'discovery') {
    return {
      type: 'discovery_response',
      tools
    };
  }

  // Verificar si es una solicitud de ejecución de herramienta
  if (request.type === 'tool_call') {
    const { tool_name, tool_args } = request;
    
    // Determinar qué conjunto de herramientas manejar
    if (tool_name.startsWith('get_available_slots') || tool_name.startsWith('book_meeting')) {
      return await handleCalComTools(tool_name, tool_args);
    } else if (
      tool_name.startsWith('generate_speech') || 
      tool_name.startsWith('list_voices') || 
      tool_name.startsWith('create_voice_agent') || 
      tool_name.startsWith('make_outbound_call')
    ) {
      return await handleElevenLabsTools(tool_name, tool_args);
    } else {
      return {
        type: 'tool_call_error',
        error: `Herramienta desconocida: ${tool_name}`
      };
    }
  }

  // Si no es una solicitud válida
  return {
    type: 'error',
    error: 'Tipo de solicitud MCP no válido'
  };
}

module.exports = {
  handleMcpRequest
};