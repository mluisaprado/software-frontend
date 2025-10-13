# ⚡ Quick Start: EAS Mobile Deploy

Guía rápida para activar el despliegue automático mobile en 5 minutos.

---

## 📋 Requisitos

- Cuenta en [expo.dev](https://expo.dev) (gratis)
- Acceso al repositorio en GitHub

---

## 🚀 Pasos (5 minutos)

### 1️⃣ Instalar EAS CLI (local)

```bash
npm install -g eas-cli
```

### 2️⃣ Login en Expo

```bash
npx expo login
```

Si no tienes cuenta, créala en [expo.dev](https://expo.dev/signup)

### 3️⃣ Vincular proyecto

```bash
cd software-frontend
eas project:init
```

Sigue las instrucciones para vincular el proyecto a tu cuenta.

### 4️⃣ Obtener EXPO_TOKEN

1. Ve a https://expo.dev/settings/access-tokens
2. Click **"Create Token"**
3. Nombre: `github-actions`
4. **Copiar el token** (solo se muestra una vez ⚠️)

### 5️⃣ Agregar token a GitHub

1. Ve a tu repositorio en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `EXPO_TOKEN`
5. Value: **Pegar el token**
6. Click **"Add secret"**

---

## ✅ ¡Listo!

Ahora cada push a `main` publicará automáticamente una actualización mobile.

```bash
git push origin main
```

➡️ Los usuarios recibirán la actualización al abrir la app.

---

## 📱 Probar la App

### Opción 1: Expo Go (Más fácil)

1. Instalar **Expo Go** en tu teléfono:
   - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS](https://apps.apple.com/app/expo-go/id982107779)

2. Ejecutar:
   ```bash
   npm start
   ```

3. Escanear el QR:
   - **Android**: Desde la app Expo Go
   - **iOS**: Desde la cámara del iPhone

### Opción 2: Build APK (Para testing)

```bash
npm run build:preview
```

Espera ~10 minutos, descarga el APK desde [Expo Dashboard](https://expo.dev) e instálalo en Android.

---

## 🔄 Flujo de Trabajo

### Desarrollo diario:

```bash
# 1. Hacer cambios en el código
# 2. Push a main
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# 3. El pipeline automáticamente:
#    - Verifica el código (lint)
#    - Publica actualización con EAS Update
#    - ✅ Usuarios reciben actualización
```

### Versión nueva (con dependencias nativas):

```bash
# 1. Actualizar versión en app.json
# 2. Build completo
npm run build:android
npm run build:ios

# 3. Descargar e instalar APK/IPA
```

---

## 📊 Monitorear

Ver actualizaciones en tiempo real:

1. Ir a https://expo.dev
2. Seleccionar proyecto **software-frontend**
3. Tab **"Updates"**

Verás:
- Cuántos usuarios tienen cada versión
- Fecha de publicación
- Commits incluidos

---

## ❓ Preguntas Rápidas

**¿Cuánto tarda la actualización?**
- 1-5 minutos después del push
- Los usuarios la reciben al abrir la app

**¿Necesito recompilar para cada cambio?**
- No. EAS Update envía solo el código JavaScript/TypeScript
- Solo recompila cuando cambias dependencias nativas

**¿Es gratis?**
- Sí, el plan gratuito incluye updates ilimitados
- Builds: 30/mes gratis

**¿Funciona en iOS y Android?**
- Sí, el mismo código funciona en ambos
- Puedes buildear para ambas plataformas

---

## 📚 Más Información

- Guía completa: [EAS_SETUP.md](EAS_SETUP.md)
- Pipeline CI/CD: [.github/workflows/README.md](.github/workflows/README.md)
- Documentación oficial: https://docs.expo.dev/eas/

---

## 🆘 ¿Problemas?

### Error: "No Expo token found"

✅ Verifica que agregaste `EXPO_TOKEN` en GitHub Secrets

### Error: "Project not found"

✅ Ejecuta `eas project:init` para vincular el proyecto

### Update no llega

✅ Verifica el canal en Expo Dashboard (debe ser "production")

---

**¿Listo?** Haz tu primer deploy:

```bash
git add .
git commit -m "feat: configurar EAS deploy automático"
git push origin main
```

🎉 ¡El pipeline se encarga del resto!

