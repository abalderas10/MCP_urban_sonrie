/**
 * Script para obtener los tipos de eventos disponibles en Cal.com
 */

require('dotenv').config();
const axios = require('axios');

async function getEventTypes() {
  try {
    console.log('Verificando variables de entorno:');
    console.log('- CALCOM_DOMAIN:', process.env.CALCOM_DOMAIN || 'No definido');
    console.log('- CALCOM_API_KEY:', process.env.CALCOM_API_KEY ? 'Definido (oculto por seguridad)' : 'No definido');
    
    // Preparar la URL base de Cal.com (eliminar https:// si ya está incluido)
    const baseUrl = 'https://api.cal.com';
    const apiKey = process.env.CALCOM_API_KEY;
    
    if (!apiKey) {
      console.error('Error: No se ha definido CALCOM_API_KEY en el archivo .env');
      return;
    }
    
    console.log('\nConsultando tipos de eventos disponibles...');
    
    // Realizar solicitud a la API de Cal.com
    const apiUrl = `${baseUrl}/v1/event-types?apiKey=${apiKey}`;
    console.log(`Consultando API de Cal.com: ${apiUrl}`);
    
    const response = await axios.get(apiUrl);
    
    console.log('\nTipos de eventos disponibles:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Mostrar información resumida de cada tipo de evento
    if (response.data) {
      console.log('\nResumen de tipos de eventos:');
      
      // Verificar si la respuesta es un array o un objeto con una propiedad que contiene el array
      const eventTypes = Array.isArray(response.data) ? response.data : 
                        (response.data.data ? response.data.data : 
                        (response.data.eventTypes ? response.data.eventTypes : 
                        (response.data.event_types ? response.data.event_types : null)));
      
      if (eventTypes && Array.isArray(eventTypes)) {
        eventTypes.forEach(eventType => {
          console.log(`- ID: ${eventType.id}, Título: ${eventType.title}, Slug: ${eventType.slug}`);
        });
      } else {
        console.log('Estructura de datos detectada:');
        console.log(Object.keys(response.data));
        console.log('No se pudo identificar el array de tipos de eventos en la respuesta.');
        
        // Intentar acceder directamente a event_types si existe
        if (response.data.event_types) {
          console.log('\nContenido de event_types:');
          console.log(JSON.stringify(response.data.event_types, null, 2));
        }
      }
    } else {
      console.log('No se encontraron tipos de eventos o el formato de respuesta es inesperado.');
    }
    
  } catch (error) {
    console.error('Error al obtener tipos de eventos:', error.message);
    if (error.response) {
      console.error('Detalles de la respuesta:', error.response.data);
    }
  }
}

// Ejecutar la función
getEventTypes();