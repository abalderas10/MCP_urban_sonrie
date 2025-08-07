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
 * Obtiene información detallada sobre un tipo de evento
 * @param {string} eventTypeId - ID del tipo de evento
 * @returns {Object} - Información del tipo de evento
 */
async function getEventTypeInfo(eventTypeId) {
  try {
    const apiUrl = `https://api.cal.com/v1/event-types/${eventTypeId}`;
    console.log(`Consultando API de Cal.com para tipo de evento: ${apiUrl}`);
    
    const response = await axios.get(
      apiUrl,
      {
        params: {
          apiKey: process.env.CALCOM_API_KEY
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error al obtener información del tipo de evento ${eventTypeId}:`, error);
    return null;
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
    // Usar la API oficial de Cal.com para slots
    const baseUrl = 'https://api.cal.com';
    
    // Convertir fechas al formato ISO
    const startTime = new Date(start_date).toISOString();
    const endTime = new Date(end_date).toISOString();
    
    // Configurar parámetros de la solicitud según la documentación
    const params = {
      apiKey: process.env.CALCOM_API_KEY,
      eventTypeId: event_type_id,
      startTime: startTime,
      endTime: endTime,
      timeZone: timezone || 'UTC'
    };
    
    // Realizar solicitud a la API de Cal.com usando el endpoint de slots
    const apiUrl = `${baseUrl}/v1/slots`;
    console.log(`Consultando API de Cal.com: ${apiUrl}`);
    console.log('Parámetros:', JSON.stringify(params, null, 2));
    
    const response = await axios.get(
      apiUrl,
      {
        params,
        headers: {
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
    // Obtener información del tipo de evento para conocer su duración
    const eventTypeInfo = await getEventTypeInfo(event_type_id);
    console.log('Información del tipo de evento:', eventTypeInfo);
    
    // Asegurarse de que las fechas estén en formato ISO
    const startDate = new Date(start_time);
    
    // Simplificar la solicitud para usar solo la hora de inicio
    // Cal.com calculará automáticamente la hora de fin basada en la duración del evento
    
    // Preparar datos para la solicitud según la API oficial de Cal.com v1
    const bookingData = {
      eventTypeId: parseInt(event_type_id),
      start: startDate.toISOString(),
      responses: {
        name: name,
        email: email,
        notes: notes || '',
        location: {
          value: 'integrations:daily',
          optionValue: ''
        }
      },
      timeZone: timezone || 'UTC',
      language: 'es',
      metadata: {}
    };
    
    // Imprimir los datos completos para depuración
    console.log('Datos de reserva completos:', JSON.stringify(bookingData, null, 2));

    // Realizar la solicitud a la API de Cal.com
    const apiUrl = 'https://api.cal.com/v1/bookings';
    console.log(`Consultando API de Cal.com para reserva: ${apiUrl}`);
    
    const response = await axios.post(
      apiUrl,
      bookingData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        params: {
          apiKey: process.env.CALCOM_API_KEY
        }
      }
    );

    // Formatear la respuesta para el MCP en el formato esperado por test-appointment.js
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
    
    let errorMessage = 'Error al programar reunión';
    
    if (error.response) {
      // Capturar detalles del error de la API
      const { status, statusText, data } = error.response;
      console.log('Respuesta de error completa:', error.response);
      errorMessage = `Error al programar reunión: Request failed with status code ${status}. Detalles: ${JSON.stringify(data)}`;
    } else if (error.request) {
      errorMessage = `Error al programar reunión: No se recibió respuesta del servidor`;
    } else {
      errorMessage = `Error al programar reunión: ${error.message}`;
    }
    
    return {
      type: 'tool_call_error',
      error: errorMessage
    };
  }
}

module.exports = {
  handleCalComTools
};