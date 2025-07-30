const axios = require('axios');

/**
 * Maneja las herramientas relacionadas con Cal.com
 * @param {string} toolName - Nombre de la herramienta a ejecutar
 * @param {Object} args - Argumentos para la herramienta
 * @returns {Object} - Respuesta de la herramienta
 */
async function handleCalComTools(toolName, args) {
  try {
    switch (toolName) {
      case 'get_available_slots':
        return await getAvailableSlots(args);
      case 'book_meeting':
        return await bookMeeting(args);
      default:
        return {
          type: 'tool_call_error',
          error: `Herramienta de Cal.com desconocida: ${toolName}`
        };
    }
  } catch (error) {
    console.error(`Error en herramienta de Cal.com ${toolName}:`, error);
    return {
      type: 'tool_call_error',
      error: error.message
    };
  }
}

/**
 * Obtiene los espacios disponibles en el calendario
 * @param {Object} args - Argumentos para la herramienta
 * @returns {Object} - Respuesta con los espacios disponibles
 */
async function getAvailableSlots(args) {
  const { event_type_id, start_date, end_date, timezone } = args;
  
  // Validar argumentos
  if (!event_type_id) {
    return {
      type: 'tool_call_error',
      error: 'Se requiere el ID del tipo de evento'
    };
  }

  try {
    // Configurar parámetros de la solicitud
    const params = {};
    if (start_date) params.startDate = start_date;
    if (end_date) params.endDate = end_date;
    if (timezone) params.timeZone = timezone;

    // Realizar solicitud a la API de Cal.com
    const response = await axios.get(
      `https://${process.env.CALCOM_DOMAIN}/api/availability/${event_type_id}`,
      {
        params,
        headers: {
          Authorization: `Bearer ${process.env.CALCOM_API_KEY}`,
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
            available_slots: response.data,
            message: 'Espacios disponibles recuperados exitosamente'
          })
        }
      ]
    };
  } catch (error) {
    console.error('Error al obtener espacios disponibles:', error);
    return {
      type: 'tool_call_error',
      error: `Error al obtener espacios disponibles: ${error.message}`
    };
  }
}

/**
 * Programa una reunión en Cal.com
 * @param {Object} args - Argumentos para la herramienta
 * @returns {Object} - Respuesta con la confirmación de la reunión
 */
async function bookMeeting(args) {
  const { 
    event_type_id, 
    start_time, 
    end_time, 
    name, 
    email, 
    notes, 
    timezone 
  } = args;
  
  // Validar argumentos requeridos
  if (!event_type_id || !start_time || !name || !email) {
    return {
      type: 'tool_call_error',
      error: 'Se requieren event_type_id, start_time, name y email'
    };
  }

  try {
    // Preparar datos para la solicitud
    const bookingData = {
      start: start_time,
      end: end_time,
      name,
      email,
      notes,
      timeZone: timezone || 'UTC',
      language: 'es' // Puedes hacer esto configurable
    };

    // Realizar solicitud a la API de Cal.com
    const response = await axios.post(
      `https://${process.env.CALCOM_DOMAIN}/api/book/${event_type_id}`,
      bookingData,
      {
        headers: {
          Authorization: `Bearer ${process.env.CALCOM_API_KEY}`,
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
            booking: response.data,
            message: 'Reunión programada exitosamente'
          })
        }
      ]
    };
  } catch (error) {
    console.error('Error al programar reunión:', error);
    return {
      type: 'tool_call_error',
      error: `Error al programar reunión: ${error.message}`
    };
  }
}

module.exports = {
  handleCalComTools
};