# Guía de Despliegue en Vercel

## Solución al Error 500 en Vercel

Si estás experimentando errores 500 (`FUNCTION_INVOCATION_FAILED`) en tu despliegue de Vercel, sigue esta guía para resolverlos.

## Causas comunes del error 500

1. **Variables de entorno mal configuradas**
   - Falta de variables de entorno necesarias
   - Formato incorrecto en las variables de entorno

2. **Límites de tamaño de respuesta**
   - Vercel tiene un límite de 4.5MB para el tamaño de la respuesta
   - Respuestas grandes pueden causar errores 500

3. **Errores en el código del servidor**
   - Excepciones no manejadas
   - Problemas con dependencias

## Configuración correcta de las variables de entorno

### 1. En el panel de Vercel

Asegúrate de configurar las siguientes variables de entorno en el panel de Vercel:

- `ELEVENLABS_API_KEY`: Tu clave API de ElevenLabs
- `CALCOM_API_KEY`: Tu clave API de Cal.com
- `CALCOM_DOMAIN`: El dominio de Cal.com **con el protocolo https://** (ejemplo: `https://cal.com/urban-sonrie`)

### 2. Verificar el formato del dominio de Cal.com

Es crucial que el dominio de Cal.com incluya el protocolo `https://` al inicio. Un formato incorrecto como `cal.com/urban-sonrie` (sin el protocolo) causará errores 401 en las solicitudes a la API.

**Formato correcto:** `https://cal.com/urban-sonrie`
**Formato incorrecto:** `cal.com/urban-sonrie`

## Verificación del despliegue

1. **Revisar logs en Vercel**
   - Ve al panel de Vercel > Tu proyecto > Deployments > Selecciona el despliegue más reciente > Functions
   - Revisa los logs de la función para identificar errores específicos

2. **Probar el endpoint de salud**
   - Accede a `https://tu-dominio-vercel.vercel.app/health`
   - Debería devolver un mensaje indicando que el servidor está funcionando

3. **Verificar la configuración de vercel.json**
   - Asegúrate de que el archivo `vercel.json` esté correctamente configurado
   - Verifica que las rutas estén dirigiendo correctamente a `src/index.js`

## Solución de problemas comunes

### Error 401 en llamadas a la API

Si ves errores 401 (No autorizado) en los logs:

1. Verifica que las claves API sean correctas y estén actualizadas
2. Asegúrate de que el formato del dominio de Cal.com incluya `https://`
3. Comprueba que las claves API no hayan expirado o sido revocadas

### Error de tamaño de respuesta

Si recibes errores relacionados con el tamaño de la respuesta:

1. Considera implementar streaming de respuestas para respuestas grandes
2. Limita la cantidad de datos devueltos en cada respuesta
3. Comprime los datos cuando sea posible

### Problemas con dependencias

Si hay errores relacionados con módulos o dependencias:

1. Verifica que todas las dependencias estén correctamente listadas en `package.json`
2. Asegúrate de que no haya conflictos entre versiones de dependencias
3. Considera usar `vercel.json` para especificar la versión de Node.js

## Contacto y soporte

Si continúas experimentando problemas después de seguir esta guía, contacta al equipo de soporte o abre un issue en el repositorio del proyecto.