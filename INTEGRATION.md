# Guía de Integración: ElevenLabs y Cal.com

Este documento proporciona una guía detallada sobre cómo funciona la integración entre ElevenLabs y Cal.com utilizando el Model Context Protocol (MCP).

## ¿Qué es el Model Context Protocol (MCP)?

El Model Context Protocol (MCP) es un estándar abierto que define cómo las aplicaciones proporcionan contexto a los Modelos de Lenguaje Grande (LLMs). Funciona como un conector universal que permite a los modelos de IA interactuar con diversas fuentes de datos y herramientas.

En este caso, utilizamos MCP para permitir que los agentes conversacionales de ElevenLabs accedan a las funcionalidades de Cal.com para programar reuniones.

## Arquitectura de la integración

```
+----------------+     +------------------+     +----------------+
|                |     |                  |     |                |
|   ElevenLabs   |     |   MCP Server    |     |    Cal.com     |
|   (Agente AI)  |<--->| (Este proyecto) |<--->|    (API)       |
|                |     |                  |     |                |
+----------------+     +------------------+     +----------------+
```

## Flujo de trabajo

1. **Configuración inicial**:
   - Configurar el servidor MCP con las claves API de ElevenLabs y Cal.com
   - Registrar el servidor MCP en la plataforma de ElevenLabs

2. **Interacción del usuario**:
   - Un usuario interactúa con un agente conversacional de ElevenLabs
   - El usuario expresa su intención de programar una reunión

3. **Verificación de disponibilidad**:
   - El agente utiliza la herramienta `get_available_slots` para consultar la disponibilidad en Cal.com
   - El servidor MCP traduce esta solicitud a una llamada a la API de Cal.com
   - Cal.com devuelve los espacios disponibles
   - El servidor MCP formatea la respuesta y la devuelve al agente

4. **Programación de la reunión**:
   - El agente presenta las opciones disponibles al usuario
   - El usuario selecciona un horario
   - El agente utiliza la herramienta `book_meeting` para programar la reunión
   - El servidor MCP traduce esta solicitud a una llamada a la API de Cal.com
   - Cal.com crea la reunión y devuelve la confirmación

5. **Confirmación**:
   - El agente puede utilizar `generate_speech` para proporcionar una confirmación verbal
   - Opcionalmente, el agente puede utilizar `make_outbound_call` para realizar una llamada de confirmación

## Configuración detallada en ElevenLabs

1. **Acceder a la plataforma de ElevenLabs**:
   - Inicia sesión en tu cuenta de ElevenLabs
   - Navega a la sección de agentes conversacionales

2. **Configurar un servidor MCP personalizado**:
   - Haz clic en "Añadir servidor MCP personalizado"
   - Proporciona la siguiente información:
     - Nombre: "Cal.com Integration"
     - Descripción: "Servidor MCP para programar reuniones a través de Cal.com"
     - URL del servidor: `https://tu-dominio-vercel.vercel.app/mcp` (usa la URL HTTPS proporcionada por Vercel)
     - Token secreto (opcional): Si has configurado autenticación adicional
     
   **IMPORTANTE**: ElevenLabs requiere que la URL del servidor MCP use HTTPS por razones de seguridad.

3. **Configurar un agente conversacional**:
   - Crea un nuevo agente o edita uno existente
   - En la sección de herramientas, habilita el servidor MCP personalizado
   - Configura el modo de aprobación según tus preferencias

## Configuración detallada en Cal.com

1. **Generar una clave API**:
   - Inicia sesión en tu cuenta de Cal.com
   - Ve a "Configuración" > "Desarrollador"
   - Haz clic en "Clave API"
   - Haz clic en "+ Añadir" para generar una nueva clave API
   - Copia la clave API generada (formato: `cal_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

2. **Obtener el ID del tipo de evento**:
   - Ve a "Tipos de eventos"
   - Selecciona el tipo de evento que deseas utilizar para las reuniones
   - El ID del tipo de evento se encuentra en la URL (por ejemplo, `https://app.cal.com/event-types/123456`)

3. **Configurar el dominio de Cal.com**:
   - Identifica tu dominio de Cal.com (por ejemplo, `cal.com/tu-usuario`)
   - **IMPORTANTE**: Al configurar la variable de entorno `CALCOM_DOMAIN`, asegúrate de incluir el protocolo `https://` al inicio
   - Formato correcto: `https://cal.com/tu-usuario`
   - Formato incorrecto: `cal.com/tu-usuario` (sin el protocolo)

## Ejemplos de uso

### Ejemplo 1: Consultar disponibilidad

```json
{
  "type": "tool_call",
  "tool_name": "get_available_slots",
  "tool_args": {
    "event_type_id": "123456",
    "start_date": "2023-12-01",
    "end_date": "2023-12-07",
    "timezone": "America/Mexico_City"
  }
}
```

### Ejemplo 2: Programar una reunión

```json
{
  "type": "tool_call",
  "tool_name": "book_meeting",
  "tool_args": {
    "event_type_id": "123456",
    "start_time": "2023-12-05T15:00:00Z",
    "end_time": "2023-12-05T15:30:00Z",
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "notes": "Discutir propuesta de proyecto",
    "timezone": "America/Mexico_City"
  }
}
```

### Ejemplo 3: Generar voz para confirmación

```json
{
  "type": "tool_call",
  "tool_name": "generate_speech",
  "tool_args": {
    "text": "Su reunión ha sido programada para el 5 de diciembre a las 3:00 PM. Recibirá una invitación por correo electrónico.",
    "voice_id": "21m00Tcm4TlvDq8ikWAM",
    "stability": 0.5,
    "similarity_boost": 0.75
  }
}
```

## Sistema de Logs

El servidor MCP incluye un sistema de logs persistente que registra todas las interacciones y llamadas a herramientas. Esto facilita la depuración y el seguimiento de las comunicaciones entre ElevenLabs y Cal.com.

### Estructura de los logs

Cada interacción con el servidor MCP genera entradas de log que incluyen:

- **Solicitudes MCP**: Registra todas las solicitudes entrantes al servidor MCP
- **Respuestas MCP**: Registra todas las respuestas enviadas por el servidor MCP
- **Llamadas a herramientas**: Registra cada vez que se invoca una herramienta (con sus argumentos)
- **Resultados de herramientas**: Registra los resultados devueltos por cada herramienta
- **Errores**: Registra cualquier error que ocurra durante el procesamiento

### Verificación de interacciones

#### En desarrollo local

Cuando ejecutas el servidor localmente, puedes verificar las interacciones de varias maneras:

1. **Consola**: Los logs se muestran en la consola donde se ejecuta el servidor
2. **Archivos de log**: Los logs se almacenan en el directorio `logs/` con rotación diaria
3. **Endpoints de log**: En modo desarrollo, puedes acceder a los logs a través de:
   - `GET /logs`: Lista todos los archivos de logs disponibles
   - `GET /logs/:filename`: Muestra el contenido de un archivo de log específico

#### En producción (Vercel)

En un entorno de producción como Vercel, puedes verificar las interacciones mediante:

1. **Archivos de log**: Los logs se almacenan en el directorio `logs/` del servidor
2. **CLI de Vercel**: Puedes usar `vercel logs` para ver los logs en tiempo real
3. **Log Drains**: Configura un Log Drain en Vercel para enviar los logs a un servicio externo

## Solución de problemas

### El agente no puede acceder al servidor MCP

- Verifica que el servidor MCP esté en ejecución
- Asegúrate de que la URL del servidor sea accesible desde Internet
- Revisa los logs del servidor para identificar posibles errores (usando los métodos descritos arriba)

### Error al consultar disponibilidad

- Verifica que la clave API de Cal.com sea válida
- Asegúrate de que el ID del tipo de evento sea correcto
- Comprueba que el formato de las fechas sea correcto (YYYY-MM-DD)
- Revisa los logs para ver la respuesta exacta de la API de Cal.com

### Error al programar reuniones

- Verifica que todos los campos requeridos estén presentes
- Asegúrate de que el formato de las horas sea correcto (ISO 8601)
- Comprueba que el espacio de tiempo solicitado esté disponible
- Consulta los logs para ver los detalles completos del error

## Recursos adicionales

- [Documentación de la API de Cal.com](https://developer.cal.com/api)
- [Documentación de ElevenLabs sobre MCP](https://elevenlabs.io/docs/conversational-ai/customization/mcp)
- [Especificación del Model Context Protocol](https://github.com/anthropics/anthropic-cookbook/tree/main/model_context_protocol)