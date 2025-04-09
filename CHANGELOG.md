# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2023-08-15

### Añadido
- Sistema avanzado de simulación de comportamiento humano
- Perfiles de comportamiento configurables (casual, detallado, social, profesional, investigador)
- Integración con Playwright para navegación visual
- Implementación de acciones de simulación (scroll, hover, escritura, etc.)
- Distribuciones estadísticas para tiempos de espera realistas
- Sistema de recolección de leads basado en criterios configurables
- Detección automática de cuándo usar API directa vs. navegador

### Cambiado
- Mejora en la estructura de directorios para separar simulación y comportamiento
- Optimización del proceso de inicio de sesión en Instagram
- Implementación de patrones de tiempo variables para acciones

### Seguridad
- Implementación de plugin stealth para evitar detección
- Simulación de comportamiento humano para evitar bloqueos
- Gestión de límites de acciones por sesión

## [0.2.0] - 2023-07-20

### Añadido
- Implementación de comportamiento humano para evitar bloqueos en redes sociales
- Servicio de gestión de sesiones para Instagram
- Límites configurables de cuentas por plataforma
- Controladores y rutas para gestión de leads
- Controladores y rutas para operaciones de Instagram
- Repositorios MongoDB para SocialMediaAccount y Lead
- Modelos MongoDB con índices optimizados

### Cambiado
- Mejora en el servicio de Instagram para mantener sesiones activas
- Optimización de las consultas a la API de Instagram
- Estructura de datos de Lead ampliada con más información

### Seguridad
- Implementación de límites diarios para acciones en redes sociales
- Patrones de actividad que simulan comportamiento humano
- Validación de permisos para acceder a recursos de otros usuarios

## [0.1.0] - 2023-12-20

### Añadido
- Estructura inicial del proyecto con Clean Architecture
- Entidades básicas (User, SocialMediaAccount, Lead)
- Repositorios para cada entidad
- Clase abstracta SocialMediaService y su implementación para Instagram
- Configuración básica de autenticación con JWT y Passport
- Controladores y rutas básicas para autenticación
- Configuración inicial de Express, MongoDB y middleware 