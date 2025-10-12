# Pipeline CI/CD - Configuración

## 📋 Descripción

Este pipeline automatiza la verificación y despliegue del proyecto usando GitHub Actions.

## 🔄 Stages del Pipeline

### 1. **Lint** 🔍
- Verifica el estilo y calidad del código
- Se ejecuta en todos los push y pull requests

### 2. **Build** 🏗️
- Verifica que el código compila correctamente
- Ejecuta verificación de TypeScript
- Genera build para web

### 3. **Test** 🧪
- Ejecuta tests unitarios y de integración
- Valida que no se rompan funcionalidades existentes

### 4. **Deploy** 🚀
- **Solo se ejecuta en rama `main`**
- Publica automáticamente a producción
- Opciones de despliegue:
  - Expo Publish
  - GitHub Pages (versión web)

## ⚙️ Configuración Necesaria

### Para EAS (Expo Application Services) - Recomendado:

1. Crear cuenta en [Expo](https://expo.dev)
2. Inicializar EAS:
   ```bash
   npx expo login
   eas build:configure
   ```
3. Obtener token en: https://expo.dev/accounts/[tu-usuario]/settings/access-tokens
4. Ir a tu repositorio GitHub → **Settings** → **Secrets and variables** → **Actions**
5. Crear secret: `EXPO_TOKEN` con tu token de Expo

### Para GitHub Pages (Alternativa para web):

1. Ir a **Settings** → **Pages**
2. Source: **GitHub Actions**
3. El pipeline desplegará automáticamente

## 📊 Scripts Recomendados

Agrega estos scripts a tu `package.json`:

```json
"scripts": {
  "lint": "eslint .",
  "test": "jest",
  "build:web": "expo export --platform web"
}
```

## 🚦 Flujo de Trabajo

```
Push/PR → Lint → Build + Test → Deploy (solo main)
```

## 🎯 Triggers

- **Push** a `main` o `develop`: Ejecuta todo el pipeline
- **Pull Request**: Ejecuta Lint, Build y Test (no Deploy)
- **Deploy**: Solo en push a `main`

## 📝 Notas

- Si no tienes tests configurados, el pipeline continuará (no falla)
- El despliegue es **automático** solo en la rama `main`
- Para deploys manuales, puedes ejecutar localmente:
  ```bash
  eas update --branch production --message "Deploy manual"
  ```
- Requiere tener configurado `eas.json` (ya incluido en el proyecto)

