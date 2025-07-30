/**
 * Este es un ejemplo de cómo un cliente podría interactuar con el servidor MCP
 * para programar una reunión a través de Cal.com y generar una confirmación de voz
 * utilizando ElevenLabs.
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
 * Obtiene las herramientas disponibles en el servidor MCP
 * @returns {Promise<Object>} - Lista de herramientas disponibles
 */
async function discoverTools() {
  try {
    const response = await axios.post(MCP_SERVER_URL, {
      type: 'discovery'
    });
    return response.data;
  } catch (error) {
    console.error('Error al descubrir herramientas:', error.message);
    throw error;
  }
}

/**
 * Ejemplo de flujo completo para programar una reunión y generar confirmación de voz
 */
async function scheduleMeetingExample() {
  try {
    console.log('Descubriendo herramientas disponibles...');
    const toolsResponse = await discoverTools();
    console.log(`Herramientas disponibles: ${toolsResponse.tools.map(t => t.name).join(', ')}`);

    // Parámetros de ejemplo
    const eventTypeId = '123456'; // Reemplazar con un ID real
    const startDate = '2023-12-01';
    const endDate = '2023-12-07';
    const timezone = 'America/Mexico_City';

    console.log('\nConsultando disponibilidad...');
    const availabilityResponse = await callMcpTool('get_available_slots', {
      event_type_id: eventTypeId,
      start_date: startDate,
      end_date: endDate,
      timezone: timezone
    });

    // Parsear la respuesta para obtener los espacios disponibles
    const availabilityData = JSON.parse(availabilityResponse.content[0].text);
    console.log('Espacios disponibles:', availabilityData);

    // Supongamos que seleccionamos el primer espacio disponible
    // En un caso real, esto sería seleccionado por el usuario
    const selectedSlot = {
      start_time: '2023-12-05T15:00:00Z',
      end_time: '2023-12-05T15:30:00Z'
    };

    console.log('\nProgramando reunión...');
    const bookingResponse = await callMcpTool('book_meeting', {
      event_type_id: eventTypeId,
      start_time: selectedSlot.start_time,
      end_time: selectedSlot.end_time,
      name: 'Juan Pérez',
      email: 'juan@ejemplo.com',
      notes: 'Discutir propuesta de proyecto',
      timezone: timezone
    });

    // Parsear la respuesta para obtener la confirmación de la reunión
    const bookingData = JSON.parse(bookingResponse.content[0].text);
    console.log('Reunión programada:', bookingData);

    // Generar confirmación de voz
    console.log('\nGenerando confirmación de voz...');
    const speechResponse = await callMcpTool('generate_speech', {
      text: `Su reunión ha sido programada para el 5 de diciembre a las 3:00 PM. 
             El propósito es discutir la propuesta de proyecto. 
             Recibirá una invitación por correo electrónico.`,
      voice_id: '21m00Tcm4TlvDq8ikWAM' // Reemplazar con un ID de voz real
    });

    // Parsear la respuesta para obtener la información del audio generado
    const speechData = JSON.parse(speechResponse.content[0].text);
    console.log('Audio generado:', speechData);

    console.log('\n¡Proceso completado con éxito!');
  } catch (error) {
    console.error('Error en el flujo de programación:', error);
  }
}

// Ejecutar el ejemplo
scheduleMeetingExample();