# Guía de Despliegue en Render

## ✅ Preparación

El proyecto está listo para desplegarse en Render. Se han realizado las siguientes configuraciones:

1. ✅ Script `start` agregado en `package.json`
2. ✅ Archivo `render.yaml` creado con configuración
3. ✅ `.gitignore` actualizado

## 🚀 Pasos para Desplegar

### Opción 1: Usando render.yaml (Recomendado)

1. **Sube tu código a GitHub/GitLab/Bitbucket**

2. **En Render Dashboard:**
   - Ve a "New" → "Static Site"
   - Conecta tu repositorio
   - Render detectará automáticamente el `render.yaml`

3. **Configura la Variable de Entorno:**
   - En la configuración del servicio, ve a "Environment"
   - Agrega: `GEMINI_API_KEY` con tu clave de API de Google Gemini
   - ⚠️ **IMPORTANTE**: Esta variable debe estar disponible durante el BUILD

4. **Build Settings:**
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

### Opción 2: Configuración Manual

Si prefieres configurar manualmente:

1. **Tipo de Servicio**: Static Site
2. **Build Command**: `npm install && npm run build`
3. **Publish Directory**: `dist`
4. **Environment Variables**:
   - `GEMINI_API_KEY`: (tu clave de API)

## ⚠️ Problemas Potenciales y Soluciones

### Problema 1: Variable de Entorno no disponible en Build

**Síntoma**: El build funciona pero la API de Gemini falla.

**Solución**: 
- Asegúrate de que `GEMINI_API_KEY` esté configurada en Render **ANTES** del primer build
- Si ya hiciste el build sin la variable, haz un "Manual Deploy" después de agregarla

### Problema 2: Rutas no funcionan (404 en refresh)

**Solución**: El `render.yaml` ya incluye la regla de rewrite para SPA:
```yaml
routes:
  - type: rewrite
    source: /*
    destination: /index.html
```

### Problema 3: Import Maps de CDN

El proyecto usa import maps en `index.html` que apuntan a CDN de AI Studio. Esto está bien, pero si prefieres usar las dependencias de npm:

1. Vite ya las incluye en el build
2. Los import maps son un fallback
3. No debería causar problemas

## 🔍 Verificación Post-Despliegue

1. ✅ La aplicación carga correctamente
2. ✅ Puedes cargar datos (CSV/JSON o mock data)
3. ✅ Las visualizaciones funcionan
4. ✅ El análisis con IA funciona (requiere `GEMINI_API_KEY`)

## 📝 Notas Importantes

- **Variables de Entorno**: Vite inyecta las variables en BUILD TIME, no en runtime
- **Puerto**: Render asigna el puerto automáticamente (variable `$PORT`)
- **HTTPS**: Render proporciona HTTPS automáticamente
- **Dominio**: Render asigna un dominio `.onrender.com` automáticamente

## 🆘 Si Algo Sale Mal

1. Revisa los logs de build en Render Dashboard
2. Verifica que `GEMINI_API_KEY` esté configurada
3. Asegúrate de que el build se complete sin errores
4. Revisa la consola del navegador para errores de runtime

