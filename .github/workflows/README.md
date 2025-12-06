# Pipeline CI/CD - Configuración

## 📋 Descripción

Este pipeline automatiza la verificación y despliegue del proyecto usando GitHub Actions.

## 🔄 Stages del Pipeline

### 1. **Lint** 🔍
- Verifica el estilo y calidad del código
- Se ejecuta en todos los push y pull requests

### 2. **Test** 🧪
- Ejecuta tests unitarios y de integración
- Genera reporte de cobertura de código
- Valida que no se rompan funcionalidades existentes
- Se ejecuta después de Lint y antes de Build

### 3. **Build** 🏗️
- Verifica que el código compila correctamente
- Ejecuta verificación de TypeScript
- Genera build para web
- Solo se ejecuta si los tests pasan

### 4. **Deploy** 🚀
- **Solo se ejecuta en rama `main`**
- Despliega automáticamente a Netlify
- URL: https://santiago-software.netlify.app

### 5. **Create Release** 📦
- Crea automáticamente tag de Git
- Genera release en GitHub con notas de cambios
- Formato: `v2025.10.13-1430` (fecha + hora)

## ⚙️ Configuración Necesaria

### Para Netlify (Deploy Web):

1. Crear cuenta en [Netlify](https://netlify.com)
2. Crear un nuevo sitio desde el dashboard
3. Obtener credenciales:
   - **NETLIFY_AUTH_TOKEN**: Settings → User settings → Applications → Personal access tokens
   - **NETLIFY_SITE_ID**: Site settings → General → Site details → Site ID
4. Ir a tu repositorio GitHub → **Settings** → **Secrets and variables** → **Actions**
5. Crear secrets:
   - Name: `NETLIFY_AUTH_TOKEN` | Value: tu token
   - Name: `NETLIFY_SITE_ID` | Value: tu site ID

## 📊 Scripts Disponibles

Ya configurados en `package.json`:

```json
"scripts": {
  "start": "expo start",
  "web": "expo start --web",
  "build:web": "expo export --platform web --output-dir dist",
  "deploy": "netlify deploy --dir=dist --prod",
  "lint": "tsc --noEmit",
  "test": "npx jest",
  "test:watch": "npx jest --watch",
  "test:coverage": "npx jest --coverage"
}
```

## 🚦 Flujo de Trabajo

```
Push/PR → Lint → Test → Build → Deploy a Netlify (solo main) → Create Release
```

## 🎯 Triggers

- **Push** a `main` o `develop`: Ejecuta todo el pipeline
- **Pull Request**: Ejecuta Lint, Test y Build (no Deploy)
- **Deploy**: Solo en push a `main` (después de que pasen todos los tests)

## 📝 Notas

- Los tests deben pasar para que el build continúe
- El despliegue es **automático** solo en la rama `main` y solo si todos los tests pasan
- El reporte de cobertura se genera automáticamente en cada ejecución de tests
- Cada deploy a producción crea automáticamente un **tag y release en GitHub**
- El archivo `netlify.toml` configura Netlify para omitir el build (ya se hace en GitHub Actions)
- Para deploys manuales, puedes ejecutar localmente:
  ```bash
  npm run build:web
  netlify deploy --dir=dist --prod
  ```

## 📦 Sistema de Releases

- **Automático**: Cada push a `main` crea un release con formato `v2025.10.13-1430`
- **Manual**: Usa el workflow "Crear Release Manual" en GitHub Actions
- Ver más detalles en [RELEASES.md](../../RELEASES.md)

