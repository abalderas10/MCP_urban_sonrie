/**
 * Script para probar la conexión con ElevenLabs
 * Este script prueba las funcionalidades básicas de la API de ElevenLabs
 */

require('dotenv').config();
const axios = require('axios');

// Verificar que las variables de entorno estén cargadas
console.log('Verificando variables de entorno:');
console.log('- ELEVENLABS_API_KEY:', process.env.ELEVENLABS_API_KEY ? 'Definido (oculto por seguridad)' : 'No definido');

// URL del servidor MCP
const MCP_SERVER_URL = 'http://localhost:3000/mcp';

/**
 * Función para realizar una llamada al servidor MCP
 * @param {string} toolName - Nombre de la herramienta a ejecutar
 * @param {Object} toolArgs - Argumentos para la herramienta
 * @returns {Promise<Object>} - Respuesta del servidor
 */
async function callMCP(toolName, toolArgs) {
  try {
    const response = await axios.post(MCP_SERVER_URL, {
      type: 'tool_call',
      tool_name: toolName,
      tool_args: toolArgs || {}
    });
    return response.data;
  } catch (error) {
    console.error('Error al llamar al servidor MCP:', error.message);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
    }
    throw error;
  }
}

/**
 * Prueba la función de listar voces disponibles
 */
async function testListVoices() {
  console.log('\n--- Probando list_voices ---');
  try {
    const response = await callMCP('list_voices', {});
    console.log('Respuesta:', JSON.stringify(response, null, 2));
    
    // Verificar si la respuesta tiene el formato esperado
    if (response.type === 'tool_call_response' && response.content && response.content[0]) {
      const content = JSON.parse(response.content[0].text);
      if (content.voices && Array.isArray(content.voices)) {
        console.log(`✅ Éxito: Se encontraron ${content.voices.length} voces disponibles`);
        // Mostrar algunas voces como ejemplo
        if (content.voices.length > 0) {
          console.log('Ejemplos de voces disponibles:');
          content.voices.slice(0, 3).forEach(voice => {
            console.log(`- ${voice.name} (ID: ${voice.voice_id})`);
          });
          // Guardar el primer ID de voz para usarlo en otras pruebas
          return content.voices[0].voice_id;
        }
      } else {
        console.log('❌ Error: La respuesta no contiene una lista de voces válida');
      }
    } else {
      console.log('❌ Error: La respuesta no tiene el formato esperado');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  return null;
}

/**
 * Prueba la función de generar voz
 * @param {string} voiceId - ID de la voz a utilizar
 */
async function testGenerateSpeech(voiceId) {
  console.log('\n--- Probando generate_speech ---');
  if (!voiceId) {
    console.log('❌ Error: Se requiere un ID de voz válido');
    return;
  }
  
  try {
    const response = await callMCP('generate_speech', {
      text: 'Hola, esta es una prueba de la API de ElevenLabs. ¿Me escuchas correctamente?',
      voice_id: voiceId
    });
    console.log('Respuesta:', JSON.stringify(response, null, 2));
    
    // Verificar si la respuesta tiene el formato esperado
    if (response.type === 'tool_call_response' && response.content && response.content[0]) {
      const content = JSON.parse(response.content[0].text);
      if (content.message && content.message.includes('exitosamente')) {
        console.log(`✅ Éxito: ${content.message}`);
        console.log(`Tamaño del audio: ${content.size_bytes} bytes`);
      } else {
        console.log('❌ Error: La respuesta no indica una generación exitosa');
      }
    } else {
      console.log('❌ Error: La respuesta no tiene el formato esperado');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

/**
 * Función principal que ejecuta todas las pruebas
 */
async function runTests() {
  console.log('=== INICIANDO PRUEBAS DE CONEXIÓN CON ELEVENLABS ===');
  
  // Verificar que la clave API esté configurada
  if (!process.env.ELEVENLABS_API_KEY) {
    console.log('❌ Error: La variable de entorno ELEVENLABS_API_KEY no está definida');
    console.log('Por favor, configura esta variable en el archivo .env');
    return;
  }
  
  try {
    // Probar listar voces
    const voiceId = await testListVoices();
    
    // Probar generar voz
    if (voiceId) {
      await testGenerateSpeech(voiceId);
    } else {
      console.log('\n❌ No se pudo obtener un ID de voz válido para probar generate_speech');
    }
    
    console.log('\n=== PRUEBAS COMPLETADAS ===');
  } catch (error) {
    console.error('Error durante las pruebas:', error);
  }
}

// Ejecutar las pruebas
runTests();