/**
 * Script para probar la programación de una cita para mañana a las 11:00 am
 */

require('dotenv').config();
const axios = require('axios');

// Verificar que las variables de entorno estén cargadas
console.log('Verificando variables de entorno:');
console.log('- CALCOM_DOMAIN:', process.env.CALCOM_DOMAIN || 'No definido');
console.log('- CALCOM_API_KEY:', process.env.CALCOM_API_KEY ? 'Definido (oculto por seguridad)' : 'No definido');
console.log('- ELEVENLABS_API_KEY:', process.env.ELEVENLABS_API_KEY ? 'Definido (oculto por seguridad)' : 'No definido');

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
 * Función para obtener la fecha de mañana en formato YYYY-MM-DD
 * @returns {string} - Fecha de mañana en formato YYYY-MM-DD
 */
function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

/**
 * Función para obtener la fecha de una semana después en formato YYYY-MM-DD
 * @returns {string} - Fecha de una semana después en formato YYYY-MM-DD
 */
function getOneWeekLaterDate() {
  const oneWeekLater = new Date();
  oneWeekLater.setDate(oneWeekLater.getDate() + 7);
  return oneWeekLater.toISOString().split('T')[0];
}

/**
 * Función para formatear una fecha ISO a un formato más legible
 * @param {string} isoDate - Fecha en formato ISO
 * @returns {string} - Fecha formateada
 */
function formatDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Ejemplo de programación de una cita para mañana a las 11:00 am
 */
async function scheduleAppointmentForTomorrow() {
  try {
    console.log('Descubriendo herramientas disponibles...');
    const toolsResponse = await discoverTools();
    console.log(`Herramientas disponibles: ${toolsResponse.tools.map(t => t.name).join(', ')}`);

    // Obtener fechas para la consulta
    const startDate = getTomorrowDate();
    const endDate = getOneWeekLaterDate();
    
    // Configurar parámetros
    // Nota: Este es un ID de ejemplo, debe ser reemplazado con un ID real de tu cuenta de Cal.com
    // Los IDs de Cal.com suelen ser números enteros como 123456
    // IDs reales de tipos de eventos obtenidos de la API
    const eventTypeIds = ['2945679', '2945677', '2945678']; // Secret Meeting, 30 Min Meeting, 15 Min Meeting
    const timezone = 'America/Mexico_City';
    
    console.log(`Usando Cal.com domain: ${process.env.CALCOM_DOMAIN}`);
    console.log(`IDs de tipos de evento a probar: ${eventTypeIds.join(', ')}`);
    
    // Variables para almacenar la respuesta exitosa
    let availabilityResponse = null;
    let successfulEventTypeId = null;
    
    // Probar con cada ID de evento hasta encontrar uno que funcione
    for (const eventTypeId of eventTypeIds) {
      console.log(`\nProbando con ID de tipo de evento: ${eventTypeId}`);
      
      console.log('Consultando disponibilidad...');
      console.log(`Período de consulta: ${startDate} a ${endDate}`);
      
      try {
        const response = await callMcpTool('get_available_slots', {
          event_type_id: eventTypeId,
          start_date: startDate,
          end_date: endDate,
          timezone: timezone
        });
        
        // Mostrar la respuesta completa para depuración
        console.log('Respuesta de disponibilidad:', JSON.stringify(response, null, 2));
        
        // Verificar si la respuesta tiene el formato esperado
        if (response.content && response.content[0] && response.content[0].text) {
          console.log(`¡Éxito! El ID de tipo de evento ${eventTypeId} funciona correctamente.`);
          availabilityResponse = response;
          successfulEventTypeId = eventTypeId;
          break; // Salir del bucle si encontramos un ID que funciona
        } else {
          console.log(`El ID de tipo de evento ${eventTypeId} no devolvió el formato esperado.`);
        }
      } catch (error) {
        console.log(`Error al probar el ID de tipo de evento ${eventTypeId}:`, error.message);
      }
    }
    
    // Verificar si encontramos un ID que funciona
    if (!availabilityResponse) {
      console.error('Error: Ninguno de los IDs de tipo de evento funcionó.');
      throw new Error('No se encontró un tipo de evento válido');
    }
    
    console.log(`Continuando con el ID de tipo de evento: ${successfulEventTypeId}`);
    
    // Verificar si la respuesta tiene el formato esperado
    if (!availabilityResponse.content || !availabilityResponse.content[0] || !availabilityResponse.content[0].text) {
      console.error('Error: La respuesta de disponibilidad no tiene el formato esperado');
      console.log('Respuesta recibida:', availabilityResponse);
      throw new Error('Formato de respuesta inválido');
    }
    
    // Parsear la respuesta para obtener los espacios disponibles
    const availabilityData = JSON.parse(availabilityResponse.content[0].text);
    console.log('Espacios disponibles:', availabilityData);

    // Buscar un espacio disponible para mañana a las 11:00 am
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);
    
    // Formatear la hora objetivo para comparación
    const targetHour = tomorrow.getHours();
    const targetDate = tomorrow.toISOString().split('T')[0];
    
    console.log(`Buscando espacio disponible para mañana (${targetDate}) a las 11:00 am...`);
    
    // Buscar en los espacios disponibles
    let selectedSlot = null;
    
    if (availabilityData && availabilityData.available_slots) {
      // Verificar la estructura de la respuesta
      if (Array.isArray(availabilityData.available_slots)) {
        // Si available_slots es un array, buscar directamente
        for (const slot of availabilityData.available_slots) {
          const slotTime = new Date(slot.start_time);
          const slotDate = slotTime.toISOString().split('T')[0];
          const slotHour = slotTime.getHours();
          
          if (slotDate === targetDate && slotHour === targetHour) {
            selectedSlot = {
              start_time: slot.start_time,
              end_time: slot.end_time
            };
            break;
          }
        }
      } else if (availabilityData.available_slots.slots) {
        // Si available_slots tiene una propiedad 'slots'
        const slotsObj = availabilityData.available_slots.slots;
        
        // Buscar en los slots del día objetivo
        if (slotsObj[targetDate]) {
          const daySlots = slotsObj[targetDate];
          
          if (Array.isArray(daySlots)) {
            for (const slot of daySlots) {
              const slotTime = new Date(slot.time);
              const slotHour = slotTime.getHours();
              
              if (slotHour === targetHour) {
                // Calcular la hora de fin (30 minutos después para una reunión de 30 minutos)
                const endTime = new Date(slotTime);
                endTime.setMinutes(endTime.getMinutes() + 30);
                
                selectedSlot = {
                  start_time: slot.time,
                  end_time: endTime.toISOString()
                };
                break;
              }
            }
          }
        }
      }
    }

    if (!selectedSlot) {
      console.log('No se encontró disponibilidad para mañana a las 11:00 am.');
      console.log('Seleccionando el primer espacio disponible como alternativa...');
      
      if (availabilityData && availabilityData.available_slots) {
        // Verificar la estructura de la respuesta
        if (Array.isArray(availabilityData.available_slots) && availabilityData.available_slots.length > 0) {
          // Si available_slots es un array
          const firstSlot = availabilityData.available_slots[0];
          selectedSlot = {
            start_time: firstSlot.start_time,
            end_time: firstSlot.end_time
          };
        } else if (availabilityData.available_slots.slots) {
          // Si available_slots tiene una propiedad 'slots'
          const slotsObj = availabilityData.available_slots.slots;
          // Buscar el primer día con slots disponibles
          for (const date in slotsObj) {
            if (slotsObj[date] && Array.isArray(slotsObj[date]) && slotsObj[date].length > 0) {
              const firstSlot = slotsObj[date][0];
              // Calcular la hora de fin (30 minutos después)
              const startTime = new Date(firstSlot.time);
              const endTime = new Date(startTime);
              endTime.setMinutes(endTime.getMinutes() + 30);
              
              selectedSlot = {
                start_time: firstSlot.time,
                end_time: endTime.toISOString()
              };
              break;
            }
          }
        }
        
        if (!selectedSlot) {
          throw new Error('No se encontraron espacios disponibles en el formato esperado.');
        }
      } else {
        throw new Error('No hay espacios disponibles en el período consultado.');
      }
    }

    console.log(`Espacio seleccionado: ${formatDate(selectedSlot.start_time)} a ${formatDate(selectedSlot.end_time)}`);

    // Programar la reunión
    console.log('\nProgramando reunión...');
    let bookingResponse;
    
    try {
      bookingResponse = await callMcpTool('book_meeting', {
        event_type_id: successfulEventTypeId,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        name: 'Usuario de Prueba',
        email: 'prueba@ejemplo.com',
        notes: 'Esta es una cita de prueba programada automáticamente',
        timezone: timezone
      });
      
      // Imprimir los datos que se están enviando para la reserva
      console.log('Datos enviados para la reserva:');
      console.log(JSON.stringify({
        event_type_id: successfulEventTypeId,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        name: 'Usuario de Prueba',
        email: 'prueba@ejemplo.com',
        notes: 'Esta es una cita de prueba programada automáticamente',
        timezone: timezone
      }, null, 2));
      
      // Verificar y parsear la respuesta para obtener la confirmación de la reunión
      console.log('Respuesta de reserva:', JSON.stringify(bookingResponse, null, 2));
      
      if (bookingResponse && bookingResponse.content && Array.isArray(bookingResponse.content) && bookingResponse.content.length > 0) {
        const bookingData = JSON.parse(bookingResponse.content[0].text);
        console.log('Reunión programada:', bookingData);
        
        // Generar confirmación de voz
        console.log('\nGenerando confirmación de voz...');
        try {
          const speechResponse = await callMcpTool('generate_speech', {
            text: `Su cita ha sido programada para ${formatDate(selectedSlot.start_time)}. 
                   El propósito es una prueba automática. 
                   Recibirá una invitación por correo electrónico.`,
            voice_id: '21m00Tcm4TlvDq8ikWAM' // Reemplazar con un ID de voz real
          });
          
          // Parsear la respuesta para obtener la información del audio generado
          const speechData = JSON.parse(speechResponse.content[0].text);
          console.log('Audio generado:', speechData);
        } catch (speechError) {
          console.error('Error al generar audio:', speechError.message);
        }
      } else if (bookingResponse.type === 'tool_call_error') {
        console.error(`Error en la reserva: ${bookingResponse.error}`);
      } else {
        console.error('Error: La respuesta de reserva no tiene el formato esperado');
      }
    } catch (bookingError) {
      console.error(`Error al programar la reunión: ${bookingError.message}`);
    }
    
    console.log('\n¡Proceso completado!');
  } catch (error) {
    console.error('Error en el flujo de programación:', error);
  }
}

// Ejecutar el ejemplo
scheduleAppointmentForTomorrow();