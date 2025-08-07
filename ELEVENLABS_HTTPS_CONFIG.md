# Configuración de ElevenLabs con HTTPS

Este documento proporciona instrucciones específicas para configurar correctamente un agente de ElevenLabs para que se conecte a tu servidor MCP local a través de HTTPS.

## Problema: "MCP tool extraction failed"

Si al intentar conectar tu agente de ElevenLabs al servidor MCP recibes el error "Failed to connect to integration" o "MCP tool extraction failed", es probable que se deba a que ElevenLabs requiere una conexión HTTPS segura, pero está intentando conectarse a través de HTTP.

## Solución

### 1. Asegúrate de que tu servidor local esté ejecutándose con HTTPS

Primero, verifica que tu servidor MCP esté ejecutándose con HTTPS:

```bash
npm run start-https
```

Esto iniciará el servidor en `https://localhost:3000`.

### 2. Acepta el certificado autofirmado en tu navegador

**IMPORTANTE**: Antes de que ElevenLabs pueda conectarse, debes aceptar manualmente el certificado autofirmado:

1. Abre `https://localhost:3000` en tu navegador
2. Verás una advertencia de seguridad sobre el certificado
3. Haz clic en "Avanzado" o "Configuración avanzada"
4. Selecciona "Continuar a localhost (inseguro)" o una opción similar

### 3. Actualiza la configuración de tu agente en ElevenLabs

Asegúrate de que la URL del servidor MCP en la configuración de tu agente use HTTPS:

```json
"mcp_servers": [
  {
    "name": "Cal.com Integration",
    "url": "https://localhost:3000/mcp",
    ...
  }
]
```

Puedes usar el archivo de ejemplo `examples/elevenlabs-agent-config-https.json` como referencia.

### 4. Reinicia tu agente en ElevenLabs

Después de actualizar la configuración, reinicia tu agente en ElevenLabs para que los cambios surtan efecto.

## Verificación

Para verificar que la conexión funciona correctamente:

1. Intenta crear un nuevo agente en ElevenLabs usando la configuración actualizada
2. Comprueba los logs del servidor MCP para ver si hay solicitudes entrantes
3. Prueba una interacción simple con el agente para confirmar que puede comunicarse con el servidor MCP

## Solución de problemas

### ElevenLabs sigue sin poder conectarse

1. Verifica que hayas aceptado el certificado en el mismo navegador que estás usando para acceder a ElevenLabs
2. Asegúrate de que no haya firewalls o software de seguridad bloqueando las conexiones
3. Comprueba que la URL en la configuración del agente sea exactamente `https://localhost:3000/mcp`
4. Revisa los logs del servidor para ver si hay errores específicos

### Certificado no confiable

Este es un comportamiento esperado con certificados autofirmados. ElevenLabs requiere HTTPS, pero no valida la autoridad del certificado, por lo que un certificado autofirmado es suficiente siempre que lo hayas aceptado previamente en tu navegador.

## Notas adicionales

- Esta configuración es solo para desarrollo local
- En producción (como Vercel), deberás usar la URL de tu despliegue con HTTPS proporcionado por Vercel
- Los certificados generados son válidos por 365 días, después de los cuales deberás regenerarlos