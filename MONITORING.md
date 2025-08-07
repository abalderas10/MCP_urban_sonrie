# Sistema de Monitoreo para MCP Urban Sonrie

Este documento describe el sistema de monitoreo implementado para el servidor MCP de Urban Sonrie, que incluye alertas para errores críticos y una interfaz de visualización de logs para facilitar el diagnóstico de problemas.

## Características Implementadas

### 1. Sistema de Alertas para Errores Críticos

Se ha implementado un sistema de alertas que monitorea y notifica sobre eventos críticos en el servidor MCP. Las alertas se envían por correo electrónico cuando se detectan condiciones problemáticas.

#### Tipos de Alertas

- **Errores Críticos**: Se activa cuando se detecta un número específico de errores en un período de tiempo determinado.
- **Alto Uso de Memoria**: Monitorea el uso de memoria del servidor y alerta cuando supera un umbral definido.
- **Tiempo de Respuesta Lento**: Detecta cuando las APIs externas (Cal.com, ElevenLabs) o el propio servidor MCP responden lentamente.

#### Configuración

Las alertas se configuran a través de variables de entorno en el archivo `.env`:

```
# Configuración de alertas por correo electrónico
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=alerts@example.com
EMAIL_PASS=tu_contraseña_segura
EMAIL_TO=admin@example.com

# Umbrales de alertas
ERROR_THRESHOLD=5 # Número de errores para activar alerta
ERROR_WINDOW_MS=60000 # Ventana de tiempo para contar errores (1 minuto)
MEMORY_CHECK_INTERVAL=60000 # Intervalo para verificar uso de memoria (1 minuto)
MEMORY_THRESHOLD_MB=500 # Umbral de uso de memoria para alertas (500 MB)
API_RESPONSE_THRESHOLD_MS=2000 # Umbral de tiempo de respuesta lento (2 segundos)
```

### 2. Dashboard de Visualización de Logs

Se ha implementado un dashboard web para visualizar y analizar los logs del servidor MCP en tiempo real, facilitando el diagnóstico de problemas.

#### Características del Dashboard

- **Visualización de Logs en Tiempo Real**: Muestra los logs del servidor con formato mejorado y resaltado por nivel de severidad.
- **Estadísticas**: Proporciona estadísticas sobre errores, advertencias, solicitudes de herramientas y más.
- **Filtrado y Búsqueda**: Permite filtrar y buscar en los logs para encontrar información específica.
- **Auto-Refresh**: Actualización automática de los datos para monitoreo en tiempo real.
- **Descarga de Logs**: Permite descargar archivos de log para análisis offline.

#### Acceso al Dashboard

El dashboard está disponible en la ruta `/dashboard` del servidor MCP:

```
http://localhost:3000/dashboard
```

## Mejoras en el Sistema de Logging

Se han realizado mejoras en el sistema de logging existente para proporcionar información más detallada y estructurada:

- **Logs Estructurados**: Los logs ahora incluyen metadatos estructurados para facilitar el análisis.
- **Información Adicional para Errores**: Se registra información adicional para los errores, como detalles de la solicitud, nombre de la herramienta y argumentos.
- **Monitoreo de Rendimiento**: Se registra el tiempo de respuesta de las APIs y operaciones críticas.

## Integración con Herramientas Externas

El sistema de monitoreo está diseñado para integrarse fácilmente con herramientas externas:

### Integración con Vercel

Para entornos desplegados en Vercel, se recomienda configurar Vercel Log Drains para enviar los logs a un servicio externo como Datadog, Logtail o Papertrail.

### Integración con Servicios de Monitoreo

Los logs estructurados facilitan la integración con servicios de monitoreo como:

- **Datadog**: Para monitoreo avanzado y alertas.
- **New Relic**: Para análisis de rendimiento.
- **Sentry**: Para seguimiento de errores y excepciones.

## Próximos Pasos y Mejoras Futuras

- **Métricas de Negocio**: Implementar métricas específicas del negocio, como número de reuniones programadas, tasa de éxito, etc.
- **Paneles Personalizados**: Crear paneles personalizados para diferentes roles (desarrolladores, operaciones, negocio).
- **Alertas Avanzadas**: Implementar alertas basadas en patrones y anomalías detectadas mediante análisis de logs.
- **Integración con Slack/Teams**: Enviar alertas críticas a canales de comunicación del equipo.

## Solución de Problemas

### Problemas Comunes

1. **No se envían alertas por correo**:
   - Verificar la configuración SMTP en el archivo `.env`
   - Comprobar que el servidor SMTP permite el envío desde la IP del servidor

2. **Dashboard no muestra logs**:
   - Verificar que existen archivos en el directorio `logs/`
   - Comprobar permisos de lectura en los archivos de log

3. **Alertas excesivas**:
   - Ajustar los umbrales en el archivo `.env` para reducir la sensibilidad

### Contacto para Soporte

Para problemas o consultas sobre el sistema de monitoreo, contactar a:

- Email: soporte@urbansonrie.com
- Slack: #urban-sonrie-support