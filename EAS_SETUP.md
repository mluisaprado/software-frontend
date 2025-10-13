# 📱 Configuración EAS (Expo Application Services)

Guía completa para configurar el despliegue automático mobile con EAS.

---

## 📋 ¿Qué es EAS?

**EAS (Expo Application Services)** es la plataforma de Expo para:
- 🏗️ **Builds**: Compilar apps para Android/iOS en la nube
- 📦 **Updates**: Enviar actualizaciones OTA (Over-The-Air) sin rebuild
- 🚀 **Submit**: Publicar a Google Play Store y App Store

---

## ⚙️ Configuración Inicial

### 1. Instalar EAS CLI (local)

```bash
npm install -g eas-cli
```

### 2. Login en Expo

```bash
npx expo login
```

Crea una cuenta en [expo.dev](https://expo.dev) si no tienes una.

### 3. Configurar el proyecto

```bash
eas build:configure
```

Esto creará/actualizará el archivo `eas.json` (ya está configurado).

### 4. Vincular el proyecto a tu cuenta

```bash
eas project:init
```

Sigue las instrucciones para vincular el proyecto a tu cuenta de Expo.

---

## 🔑 Obtener EXPO_TOKEN para CI/CD

### Paso 1: Generar token

1. Ve a https://expo.dev/accounts/[tu-usuario]/settings/access-tokens
2. Click en **"Create Token"**
3. Nombre: `github-actions-ci`
4. Copiar el token generado ⚠️ **Solo se muestra una vez**

### Paso 2: Agregar a GitHub Secrets

1. Ve a tu repositorio en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `EXPO_TOKEN`
5. Value: Pegar el token de Expo
6. Click **"Add secret"**

---

## 🚀 Cómo Funciona el Pipeline

### Flujo Automático

```
git push main
    ↓
Lint (verificar código)
    ↓
EAS Update (publicar actualización OTA)
    ↓
✅ Usuarios reciben actualización
```

### ¿Qué son EAS Updates?

**EAS Update** permite enviar actualizaciones de código JavaScript/TypeScript sin necesidad de:
- ❌ Recompilar la app
- ❌ Subir a Google Play/App Store
- ❌ Esperar aprobación de las tiendas

✅ **Los usuarios reciben la actualización al abrir la app**

---

## 📦 Tipos de Despliegue

### 1. EAS Update (Rápido - Automático en main)

**¿Cuándo se usa?**
- Cambios en código JavaScript/TypeScript
- Correcciones de bugs
- Nuevas features que no requieren dependencias nativas

**¿Cómo funciona?**
```bash
# Automático en push a main
git push origin main

# Manual
eas update --branch production --message "Descripción"
```

**Limitaciones:**
- ⚠️ No actualiza código nativo (Java/Kotlin/Swift/Objective-C)
- ⚠️ No actualiza dependencias nativas nuevas
- ⚠️ No cambia permisos (en AndroidManifest.xml, Info.plist)

### 2. EAS Build (Completo - Manual)

**¿Cuándo se usa?**
- Cambios en código nativo
- Nuevas dependencias nativas (cámara, notificaciones, etc.)
- Cambio de versión/permisos
- Primera instalación de la app

**¿Cómo funciona?**
```bash
# Build para Android
eas build --platform android --profile production

# Build para iOS
eas build --platform ios --profile production

# Build para ambos
eas build --platform all --profile production
```

---

## 🔄 Workflow del Pipeline Mobile

### En Push a `main`:

1. ✅ **Lint**: Verifica código TypeScript
2. ✅ **EAS Update**: Publica actualización OTA
3. ✅ Usuarios reciben actualización automáticamente

### En Pull Request:

1. ✅ **Lint**: Verifica código
2. ✅ **Build Preview**: Crea build de prueba (Android APK)
3. ✅ Comenta en el PR con link al build

---

## 📱 Probar la App

### Opción 1: Expo Go (Desarrollo)

```bash
npm start
```

Escanea el QR con:
- **Android**: App Expo Go
- **iOS**: Cámara del iPhone

### Opción 2: Development Build (Recomendado)

```bash
# Crear build de desarrollo
eas build --profile development --platform android

# Instalar APK en dispositivo
# Luego ejecutar:
npm start
```

### Opción 3: Build Preview (Para testing)

```bash
# Crear APK de preview
eas build --profile preview --platform android
```

Descarga el APK desde el Expo Dashboard.

---

## 🔧 Comandos Útiles

### Ver historial de updates

```bash
eas update:list --branch production
```

### Ver builds

```bash
eas build:list
```

### Ver proyecto en dashboard

```bash
eas open
```

O directamente: https://expo.dev/accounts/[tu-usuario]/projects/software-frontend

---

## 🎯 Estrategia Recomendada

### Para desarrollo diario:

1. Hacer cambios en el código
2. Push a `main`
3. **EAS Update automático** → Usuarios reciben actualización en minutos

### Para cambios grandes (versión nueva):

1. Hacer cambios (incluye dependencias nativas)
2. Incrementar versión en `app.json`:
   ```json
   {
     "expo": {
       "version": "1.1.0"
     }
   }
   ```
3. Build manual:
   ```bash
   eas build --platform all --profile production
   ```
4. Submit a tiendas (opcional):
   ```bash
   eas submit --platform android
   eas submit --platform ios
   ```

---

## 📊 Monitoreo

### Ver actualizaciones en tiempo real

1. Ir a [Expo Dashboard](https://expo.dev)
2. Seleccionar tu proyecto
3. Tab **"Updates"**
4. Ver:
   - Cuántos usuarios tienen cada versión
   - Fecha de publicación
   - Commits incluidos

---

## ❓ Preguntas Frecuentes

### ¿Cuánto tarda en llegar la actualización?

- **EAS Update**: 1-5 minutos después del push
- Los usuarios la reciben al abrir la app (próximo lanzamiento)

### ¿Puedo revertir una actualización?

Sí, con:
```bash
eas update:republish --branch production --group [id-del-grupo-anterior]
```

### ¿Necesito pagar por EAS?

- **Plan gratuito**: Incluye updates ilimitados
- **Builds**: 30 builds/mes gratis, luego de pago

### ¿Funciona sin internet?

- La app funciona offline
- Pero necesita internet para descargar actualizaciones

### ¿Los usuarios deben actualizar manualmente?

No, la actualización es automática al abrir la app.

---

## 🆘 Troubleshooting

### Error: "No Expo token found"

```bash
# Verificar que el token está en GitHub Secrets
# Settings → Secrets → EXPO_TOKEN
```

### Error: "Project not found"

```bash
# Vincular proyecto primero
eas project:init
```

### Update no llega a usuarios

1. Verificar que el canal es correcto (`production`)
2. Ver logs en Expo Dashboard
3. Verificar que la app fue construida con EAS

---

## 🎓 Recursos

- [EAS Documentation](https://docs.expo.dev/eas/)
- [EAS Update](https://docs.expo.dev/eas-update/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo Dashboard](https://expo.dev/)

---

## ✨ Resumen

**Setup único:**
1. Crear cuenta Expo
2. Configurar EAS CLI
3. Generar EXPO_TOKEN
4. Agregar token a GitHub Secrets

**Uso diario:**
1. Push a `main`
2. EAS Update automático
3. ✅ Usuarios reciben actualización

**Para versiones grandes:**
1. `eas build` manual
2. Distribuir APK/IPA
3. Submit a tiendas (opcional)

