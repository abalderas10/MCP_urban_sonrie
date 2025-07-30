const axios = require('axios');

/**
 * Maneja las herramientas relacionadas con ElevenLabs
 * @param {string} toolName - Nombre de la herramienta a ejecutar
 * @param {Object} args - Argumentos para la herramienta
 * @returns {Object} - Respuesta de la herramienta
 */
async function handleElevenLabsTools(toolName, args) {
  try {
    switch (toolName) {
      case 'generate_speech':
        return await generateSpeech(args);
      case 'list_voices':
        return await listVoices();
      case 'create_voice_agent':
        return await createVoiceAgent(args);
      case 'make_outbound_call':
        return await makeOutboundCall(args);
      default:
        return {
          type: 'tool_call_error',
          error: `Herramienta de ElevenLabs desconocida: ${toolName}`
        };
    }
  } catch (error) {
    console.error(`Error en herramienta de ElevenLabs ${toolName}:`, error);
    return {
      type: 'tool_call_error',
      error: error.message
    };
  }
}

/**
 * Genera voz a partir de texto usando ElevenLabs
 * @param {Object} args - Argumentos para la herramienta
 * @returns {Object} - Respuesta con la URL del audio generado
 */
async function generateSpeech(args) {
  const { text, voice_id, model_id, stability, similarity_boost } = args;
  
  // Validar argumentos
  if (!text || !voice_id) {
    return {
      type: 'tool_call_error',
      error: 'Se requieren text y voice_id'
    };
  }

  try {
    // Preparar datos para la solicitud
    const requestData = {
      text,
      model_id: model_id || 'eleven_multilingual_v2',
      voice_settings: {
        stability: stability || 0.5,
        similarity_boost: similarity_boost || 0.75
      }
    };

    // Realizar solicitud a la API de ElevenLabs
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      requestData,
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer'
      }
    );

    // En un caso real, aquí guardaríamos el audio y devolveríamos una URL
    // Para este ejemplo, simplemente indicamos que se generó correctamente
    return {
      type: 'tool_call_response',
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: 'Audio generado exitosamente',
            format: 'audio/mpeg',
            size_bytes: response.data.length
          })
        }
      ]
    };
  } catch (error) {
    console.error('Error al generar voz:', error);
    return {
      type: 'tool_call_error',
      error: `Error al generar voz: ${error.message}`
    };
  }
}

/**
 * Lista las voces disponibles en ElevenLabs
 * @returns {Object} - Respuesta con la lista de voces
 */
async function listVoices() {
  try {
    // Realizar solicitud a la API de ElevenLabs
    const response = await axios.get(
      'https://api.elevenlabs.io/v1/voices',
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    // Formatear la respuesta para el MCP
    return {
      type: 'tool_call_response',
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            voices: response.data.voices,
            message: 'Voces recuperadas exitosamente'
          })
        }
      ]
    };
  } catch (error) {
    console.error('Error al listar voces:', error);
    return {
      type: 'tool_call_error',
      error: `Error al listar voces: ${error.message}`
    };
  }
}

/**
 * Crea un agente de voz en ElevenLabs
 * @param {Object} args - Argumentos para la herramienta
 * @returns {Object} - Respuesta con la información del agente creado
 */
async function createVoiceAgent(args) {
  const { name, voice_id, system_prompt, initial_message, knowledge } = args;
  
  // Validar argumentos
  if (!name || !voice_id || !system_prompt || !initial_message) {
    return {
      type: 'tool_call_error',
      error: 'Se requieren name, voice_id, system_prompt e initial_message'
    };
  }

  try {
    // Preparar datos para la solicitud
    const requestData = {
      name,
      voice_id,
      system_prompt,
      initial_message
    };

    if (knowledge) {
      requestData.knowledge = knowledge;
    }

    // Realizar solicitud a la API de ElevenLabs
    const response = await axios.post(
      'https://api.elevenlabs.io/v1/agents',
      requestData,
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    // Formatear la respuesta para el MCP
    return {
      type: 'tool_call_response',
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            agent: response.data,
            message: 'Agente de voz creado exitosamente'
          })
        }
      ]
    };
  } catch (error) {
    console.error('Error al crear agente de voz:', error);
    return {
      type: 'tool_call_error',
      error: `Error al crear agente de voz: ${error.message}`
    };
  }
}

/**
 * Realiza una llamada saliente usando un agente de voz de ElevenLabs
 * @param {Object} args - Argumentos para la herramienta
 * @returns {Object} - Respuesta con la información de la llamada
 */
async function makeOutboundCall(args) {
  const { agent_id, phone_number, purpose } = args;
  
  // Validar argumentos
  if (!agent_id || !phone_number) {
    return {
      type: 'tool_call_error',
      error: 'Se requieren agent_id y phone_number'
    };
  }

  try {
    // Preparar datos para la solicitud
    const requestData = {
      agent_id,
      to: phone_number,
      purpose: purpose || 'Llamada programada'
    };

    // Realizar solicitud a la API de ElevenLabs
    const response = await axios.post(
      'https://api.elevenlabs.io/v1/call',
      requestData,
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    // Formatear la respuesta para el MCP
    return {
      type: 'tool_call_response',
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            call: response.data,
            message: 'Llamada iniciada exitosamente'
          })
        }
      ]
    };
  } catch (error) {
    console.error('Error al realizar llamada:', error);
    return {
      type: 'tool_call_error',
      error: `Error al realizar llamada: ${error.message}`
    };
  }
}

module.exports = {
  handleElevenLabsTools
};