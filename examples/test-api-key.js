require('dotenv').config();
const axios = require('axios');

async function testApiKey() {
  try {
    console.log('Verificando API key de Cal.com...');
    console.log('API Key:', process.env.CALCOM_API_KEY);
    
    // Intentar obtener la lista de tipos de eventos (endpoint básico)
    const apiUrl = `https://api.cal.com/v1/event-types?apiKey=${process.env.CALCOM_API_KEY}`;
    console.log(`Consultando: ${apiUrl}`);
    
    const response = await axios.get(apiUrl);
    
    console.log('Respuesta exitosa:');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('Error al verificar API key:');
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
testApiKey();