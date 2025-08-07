# Configuración de HTTPS en Localhost

Este documento explica cómo configurar HTTPS en tu entorno de desarrollo local para que ElevenLabs pueda conectarse correctamente a tu servidor MCP.

## ¿Por qué necesitamos HTTPS?

ElevenLabs requiere que las conexiones a servidores MCP personalizados se realicen a través de HTTPS por razones de seguridad. Esto significa que necesitamos configurar nuestro servidor de desarrollo local para que utilice HTTPS con certificados SSL.

## Requisitos previos

- Node.js 12.0.0 o superior
- NPM para instalar las dependencias necesarias

## Pasos para configurar HTTPS

### 1. Configurar la variable de entorno

Asegúrate de que tu archivo `.env` tenga la siguiente configuración:

```
PORT=3000
USE_HTTPS=true
```

### 2. Generar certificados SSL

Ejecuta el script de configuración HTTPS:

```bash
node setup-https.js
```

Este script:
- Crea un directorio `certs` si no existe
- Genera una clave privada (`localhost.key`)
- Genera un certificado autofirmado (`localhost.crt`)

### 3. Iniciar el servidor

Inicia el servidor normalmente:

```bash
npm start
```

El servidor ahora debería estar ejecutándose en `https://localhost:3000`.

### 4. Aceptar el certificado en el navegador

**IMPORTANTE**: Antes de que ElevenLabs pueda conectarse, debes aceptar manualmente el certificado autofirmado:

1. Abre `https://localhost:3000` en tu navegador
2. Verás una advertencia de seguridad sobre el certificado
3. Haz clic en "Avanzado" o "Configuración avanzada"
4. Selecciona "Continuar a localhost (inseguro)" o una opción similar

### 5. Configurar ElevenLabs

Ahora puedes configurar tu agente en ElevenLabs para que se conecte a:

```
https://localhost:3000/mcp
```

## Solución de problemas

### El navegador muestra "ERR_CERT_AUTHORITY_INVALID"

Esto es normal para certificados autofirmados. Sigue los pasos en la sección "Aceptar el certificado en el navegador".

### ElevenLabs no puede conectarse

1. Asegúrate de haber aceptado el certificado en tu navegador primero
2. Verifica que el servidor esté ejecutándose correctamente en HTTPS
3. Comprueba que la URL en ElevenLabs sea exactamente `https://localhost:3000/mcp`

### Error al cargar certificados

Si ves un error como "Error al cargar certificados SSL", asegúrate de haber ejecutado `node setup-https.js` antes de iniciar el servidor.

## Notas adicionales

- El servidor también configura una redirección automática de HTTP a HTTPS en el puerto 2999 (PORT-1)
- Los certificados generados son válidos por 365 días
- Estos certificados son solo para desarrollo local y no son adecuados para producción

## Para entornos de producción

En producción (como Vercel), no necesitas configurar HTTPS manualmente, ya que Vercel proporciona HTTPS automáticamente para todos los despliegues.