# Solución para Despliegue en Vercel

Esta rama (`fix-vercel-serverless`) contiene modificaciones específicas para permitir que el servidor MCP funcione correctamente en el entorno serverless de Vercel.

## Cambios Realizados

### 1. Sistema de Logs

- Modificado `src/utils/logger.js` para que no intente escribir en el sistema de archivos cuando está en entorno de producción.
- Los logs ahora solo se escriben en archivos en entorno de desarrollo, mientras que en producción solo se envían a la consola.

### 2. Generación de Audio con ElevenLabs

- Modificado `src/tools/elevenlabs.js` para usar la API de streaming de ElevenLabs en entorno de producción.
- Esto evita el límite de tamaño de respuesta de 4.5MB en Vercel, ya que ahora devolvemos una URL de streaming en lugar del audio completo.

### 3. Monitoreo de Memoria

- Modificado `src/utils/alerts.js` para desactivar el monitoreo de memoria en entorno serverless.
- Esto evita problemas con las funciones serverless que tienen un ciclo de vida diferente a los servidores tradicionales.

### 4. Inicialización del Servidor

- Modificado `src/index.js` para manejar correctamente la inicialización en entorno serverless.
- En Vercel, no es necesario iniciar explícitamente el servidor con `app.listen()`, ya que Vercel maneja esto automáticamente.

## Cómo Desplegar en Vercel

1. **Asegúrate de estar en la rama correcta**:
   ```bash
   git checkout fix-vercel-serverless
   ```

2. **Sube los cambios a GitHub**:
   ```bash
   git add .
   git commit -m "Adaptaciones para entorno serverless de Vercel"
   git push origin fix-vercel-serverless
   ```

3. **Importa el proyecto en Vercel**:
   - Inicia sesión en [Vercel](https://vercel.com)
   - Haz clic en "New Project"
   - Importa tu repositorio de GitHub
   - Selecciona la rama `fix-vercel-serverless`

4. **Configura las variables de entorno**:
   - `NODE_ENV`: `production`
   - `ELEVENLABS_API_KEY`: Tu clave API de ElevenLabs
   - `CALCOM_API_KEY`: Tu clave API de Cal.com
   - `CALCOM_DOMAIN`: El dominio de Cal.com **con el protocolo https://** (ejemplo: `https://cal.com/urban-sonrie`)

5. **Despliega el proyecto**:
   - Haz clic en "Deploy"

6. **Verifica el despliegue**:
   - Una vez completado, Vercel te proporcionará una URL (por ejemplo: `https://mcp-urban-sonrie.vercel.app`)
   - Prueba el endpoint de salud accediendo a `https://tu-dominio-vercel.vercel.app/health`
   - Debería devolver un mensaje indicando que el servidor está funcionando

## Configuración en ElevenLabs

Una vez desplegado en Vercel, puedes configurar tu agente en ElevenLabs:

1. **Inicia sesión en ElevenLabs**
2. **Ve a la sección de agentes conversacionales**
3. **Configura un nuevo servidor MCP personalizado**:
   - Nombre: "Urban Sonrie MCP Server" (o el nombre que prefieras)
   - Descripción: "Servidor MCP para integrar ElevenLabs con Cal.com"
   - Tipo de servidor: Streamable HTTP
   - URL del servidor: `https://tu-dominio-vercel.vercel.app/mcp` (usa la URL HTTPS proporcionada por Vercel)
   - Modo de aprobación de herramientas: No Approval (para pruebas iniciales)

## Funcionamiento

Con estos cambios, el agente de ElevenLabs podrá:

1. Consultar disponibilidad en Cal.com
2. Agendar reuniones
3. Generar respuestas de voz

Todo esto funcionando en el entorno serverless de Vercel, sin problemas de límites de tamaño de respuesta o acceso al sistema de archivos.