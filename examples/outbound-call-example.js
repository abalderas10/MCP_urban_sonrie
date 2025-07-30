/**
 * Este es un ejemplo de cómo configurar un agente de voz en ElevenLabs
 * para realizar llamadas salientes y programar reuniones a través de Cal.com.
 */

const axios = require('axios');

// URL del servidor MCP
const MCP_SERVER_URL = 'http://localhost:3000/mcp';

/**
 * Realiza una llamada a una herramienta del servidor MCP
 * @param {string} toolName - Nombre de la herramienta
 * @param {Object} toolArgs - Argumentos para la herramienta
 * @returns {Promise<Object>} - Respuesta de la herramienta
 */
async function callMcpTool(toolName, toolArgs) {
  try {
    const response = await axios.post(MCP_SERVER_URL, {
      type: 'tool_call',
      tool_name: toolName,
      tool_args: toolArgs
    });
    return response.data;
  } catch (error) {
    console.error(`Error al llamar a la herramienta ${toolName}:`, error.message);
    throw error;
  }
}

/**
 * Ejemplo de flujo para crear un agente de voz y realizar una llamada saliente
 */
async function outboundCallExample() {
  try {
    // Paso 1: Listar voces disponibles
    console.log('Listando voces disponibles...');
    const voicesResponse = await callMcpTool('list_voices', {});
    const voicesData = JSON.parse(voicesResponse.content[0].text);
    
    // Seleccionar una voz (en un caso real, esto sería seleccionado por el usuario)
    const selectedVoice = voicesData.voices[0];
    console.log(`Voz seleccionada: ${selectedVoice.name} (${selectedVoice.voice_id})`);
    
    // Paso 2: Crear un agente de voz
    console.log('\nCreando agente de voz...');
    const agentResponse = await callMcpTool('create_voice_agent', {
      name: 'Asistente de Programación',
      voice_id: selectedVoice.voice_id,
      system_prompt: `Eres un asistente virtual profesional especializado en programar reuniones. 
                     Tu objetivo es ayudar a los usuarios a encontrar horarios disponibles y programar 
                     reuniones de manera eficiente. Debes ser cortés, profesional y eficiente. 
                     Cuando un usuario solicite programar una reunión, debes preguntarle por el propósito, 
                     la duración preferida y las fechas/horas que le convienen. Luego, utilizarás las 
                     herramientas de Cal.com para verificar la disponibilidad y programar la reunión.`,
      initial_message: 'Hola, soy tu asistente virtual de programación. ¿En qué puedo ayudarte hoy?',
      knowledge: `El calendario está disponible de lunes a viernes, de 9:00 AM a 5:00 PM. 
                 Las reuniones pueden ser de 15, 30 o 60 minutos. 
                 Las reuniones deben programarse con al menos 24 horas de anticipación.`
    });
    
    const agentData = JSON.parse(agentResponse.content[0].text);
    const agentId = agentData.agent.agent_id;
    console.log(`Agente creado con ID: ${agentId}`);
    
    // Paso 3: Realizar una llamada saliente
    console.log('\nRealizando llamada saliente...');
    const callResponse = await callMcpTool('make_outbound_call', {
      agent_id: agentId,
      phone_number: '+1234567890', // Reemplazar con un número real
      purpose: 'Programar una reunión de seguimiento'
    });
    
    const callData = JSON.parse(callResponse.content[0].text);
    console.log('Llamada iniciada:', callData);
    
    console.log('\n¡Proceso completado con éxito!');
  } catch (error) {
    console.error('Error en el flujo de llamada saliente:', error);
  }
}

// Ejecutar el ejemplo
outboundCallExample();