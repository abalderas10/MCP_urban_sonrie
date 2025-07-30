# ElevenLabs-CalCom MCP Server

Este proyecto implementa un servidor Model Context Protocol (MCP) que sirve como puente entre ElevenLabs y Cal.com, permitiendo a los agentes conversacionales de ElevenLabs programar reuniones a través de Cal.com.

## Características

- Integración con la API de Cal.com para:
  - Consultar disponibilidad de calendario
  - Programar reuniones

- Integración con la API de ElevenLabs para:
  - Generar voz a partir de texto
  - Listar voces disponibles
  - Crear agentes de voz
  - Realizar llamadas salientes

## Requisitos previos

- Node.js (v14 o superior)
- Cuenta en ElevenLabs con clave API
- Cuenta en Cal.com con clave API

## Instalación

1. Clona este repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd elevenlabs-calcom-mcp
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` basado en `.env.example` y configura tus claves API:
   ```bash
   cp .env.example .env
   # Edita el archivo .env con tus claves API
   ```

## Uso

### Iniciar el servidor localmente

```bash
npm start
```

El servidor se ejecutará en `http://localhost:3000` (o el puerto configurado en el archivo `.env`).

### Despliegue en Vercel

1. Sube el repositorio a GitHub:
   ```bash
   git init
   git add .
   git commit -m "Primer commit"
   git remote add origin <tu-repositorio-github>
   git push -u origin main
   ```

2. Importa el proyecto en Vercel:
   - Inicia sesión en [Vercel](https://vercel.com)
   - Haz clic en "New Project"
   - Importa tu repositorio de GitHub
   - Configura las variables de entorno (ELEVENLABS_API_KEY, CALCOM_API_KEY, CALCOM_DOMAIN)
   - Haz clic en "Deploy"

3. Una vez desplegado, Vercel te proporcionará una URL HTTPS que puedes usar para tu servidor MCP.

### Configurar en ElevenLabs

1. Inicia sesión en tu cuenta de ElevenLabs
2. Ve a la sección de agentes conversacionales
3. Configura un nuevo servidor MCP personalizado:
   - Nombre: "Urban Sonrie MCP Server" (o el nombre que prefieras)
   - Descripción: "Servidor MCP para integrar ElevenLabs con Cal.com"
   - Tipo de servidor: SSE
   - URL del servidor: `https://tu-dominio-vercel.vercel.app/mcp` (usa la URL HTTPS proporcionada por Vercel)
   - Tipo: Value

> **Importante**: ElevenLabs requiere que la URL del servidor MCP use HTTPS por razones de seguridad.

## Herramientas disponibles

### Cal.com

- `get_available_slots`: Obtiene los espacios disponibles en el calendario
- `book_meeting`: Programa una reunión

### ElevenLabs

- `generate_speech`: Genera voz a partir de texto
- `list_voices`: Lista las voces disponibles
- `create_voice_agent`: Crea un agente de voz
- `make_outbound_call`: Realiza una llamada saliente

## Ejemplo de flujo

1. Un usuario interactúa con un agente conversacional de ElevenLabs
2. El usuario solicita programar una reunión
3. El agente utiliza `get_available_slots` para verificar la disponibilidad
4. El agente sugiere horarios disponibles al usuario
5. Una vez que el usuario confirma un horario, el agente utiliza `book_meeting` para programar la reunión
6. El agente puede utilizar `generate_speech` para proporcionar una confirmación verbal
7. Opcionalmente, el agente puede utilizar `make_outbound_call` para realizar una llamada de confirmación

## Sistema de Logs

El servidor incluye un sistema de logs persistente que registra todas las interacciones MCP y llamadas a herramientas. Los logs se almacenan en archivos y también se muestran en la consola.

### Características del sistema de logs

- Rotación diaria de archivos de logs
- Niveles de log configurables (error, warn, info, http, verbose, debug, silly)
- Archivos separados para errores
- Compresión automática de archivos antiguos
- Retención configurable (por defecto 14 días)

### Acceso a los logs

#### En desarrollo local

En modo desarrollo, puedes acceder a los logs a través de las siguientes rutas:

- `GET /logs`: Lista todos los archivos de logs disponibles
- `GET /logs/:filename`: Muestra el contenido de un archivo de log específico

#### En producción

En entorno de producción, los logs se almacenan en el directorio `logs/` del servidor. Para acceder a ellos en Vercel, puedes usar la CLI de Vercel o configurar un Log Drain para enviarlos a un servicio externo.

### Configuración

Puedes configurar el sistema de logs mediante las siguientes variables de entorno:

- `NODE_ENV`: Establece el entorno (`development` o `production`)
- `LOG_LEVEL`: Establece el nivel de detalle de los logs

## Estructura del proyecto

```
.
├── .env.example       # Plantilla para variables de entorno
├── package.json       # Dependencias y scripts
├── README.md          # Documentación
├── logs/              # Directorio donde se almacenan los logs (creado automáticamente)
└── src/
    ├── index.js       # Punto de entrada del servidor
    ├── mcp-server.js  # Implementación del servidor MCP
    ├── tools/         # Implementaciones de herramientas
    │   ├── calcom.js  # Herramientas de Cal.com
    │   └── elevenlabs.js # Herramientas de ElevenLabs
    └── utils/         # Utilidades
        └── logger.js  # Sistema de logs
```

## Licencia

MIT