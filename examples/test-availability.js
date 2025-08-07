require('dotenv').config();
const axios = require('axios');

async function testAvailability() {
  try {
    // Obtener los IDs de los tipos de eventos
    const eventTypeIds = [2945677, 2945678]; // IDs obtenidos del script anterior
    
    for (const eventTypeId of eventTypeIds) {
      console.log(`\nProbando disponibilidad para el tipo de evento: ${eventTypeId}`);
      
      // Crear fechas para una semana a partir de mañana
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(nextWeek.getDate() + 6);
      
      // Formatear fechas como YYYY-MM-DD
      const dateFrom = tomorrow.toISOString().split('T')[0];
      const dateTo = nextWeek.toISOString().split('T')[0];
      
      console.log(`Período de consulta: ${dateFrom} a ${dateTo}`);
      
      // Construir URL para consultar disponibilidad
      const apiUrl = `https://api.cal.com/v1/event-types/${eventTypeId}/availability?apiKey=${process.env.CALCOM_API_KEY}`;
      
      // Parámetros para la consulta
      const params = {
        dateFrom,
        dateTo,
        timeZone: 'Europe/Madrid'
      };
      
      console.log(`URL: ${apiUrl}`);
      console.log(`Parámetros: ${JSON.stringify(params)}`);
      
      // Realizar la solicitud
      const response = await axios.get(apiUrl, { params });
      
      console.log('Respuesta exitosa:');
      console.log(JSON.stringify(response.data, null, 2));
    }
    
    return true;
  } catch (error) {
    console.error('Error al verificar disponibilidad:');
    if (error.response) {
      // La solicitud fue realizada y el servidor respondió con un código de estado
      console.error(`Código de estado: ${error.response.status}`);
      console.error('Datos de respuesta:', error.response.data);
      console.error('Encabezados:', error.response.headers);
    } else if (error.request) {
      // La solicitud fue realizada pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor');
      console.error(error.request);
    } else {
      // Algo ocurrió al configurar la solicitud
      console.error('Error:', error.message);
    }
    return false;
  }
}

// Ejecutar la prueba
testAvailability();