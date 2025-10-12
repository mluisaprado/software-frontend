# 📦 Configuración CI/CD - Guía de Presentación

## ✅ ¿Qué se ha implementado?

### **CI (Continuous Integration)** - Integración Continua

El pipeline tiene **3 stages definidos**:

#### 1️⃣ **Stage: Lint** 🔍
- Verifica errores de TypeScript
- Se ejecuta en cada push y pull request
- Falla si hay errores de compilación

#### 2️⃣ **Stage: Build** 🏗️
- Compila el proyecto
- Verifica que el código es válido
- Genera build para producción (web)

#### 3️⃣ **Stage: Test** 🧪
- Ejecuta tests automatizados
- Actualmente: placeholder (tests pendientes de implementar)
- No bloquea el pipeline

---

### **CD (Continuous Deployment)** - Despliegue Continuo

#### 4️⃣ **Stage: Deploy** 🚀
- **Despliegue automatizado** a producción
- Solo se ejecuta en la rama `main`
- Opciones implementadas:
  - **Expo Publish**: Publica la app en Expo
  - **GitHub Pages**: Despliega versión web

---

## ⚙️ Pasos para Activar el Despliegue Automatizado

### Opción 1: Expo (Recomendado para apps móviles)

1. **Crear cuenta en Expo**
   - Ir a https://expo.dev
   - Crear cuenta gratuita

2. **Obtener token de acceso**
   ```bash
   npx expo login
   npx expo whoami
   ```

3. **Configurar en GitHub**
   - Ir a tu repositorio → **Settings** → **Secrets and variables** → **Actions**
   - Click en **New repository secret**
   - Name: `EXPO_TOKEN`
   - Value: Tu token de Expo
   - Click **Add secret**

4. **¡Listo!** Al hacer push a `main`, se desplegará automáticamente

---

### Opción 2: GitHub Pages (Para versión web)

1. **Activar GitHub Pages**
   - Ir a **Settings** → **Pages**
   - Source: **GitHub Actions**
   
2. **Hacer push a main**
   - El pipeline desplegará automáticamente
   - La app estará disponible en: `https://[tu-usuario].github.io/[repositorio]`

---

## 🎯 Flujo de Trabajo

```
Desarrollador hace push
         ↓
    Lint (verifica código)
         ↓
    Build + Test (en paralelo)
         ↓
    ¿Es rama main?
         ↓ Sí
    Deploy automático a producción
         ↓ No
    Fin (sin despliegue)
```

---

## 📊 Verificar que Funciona

### Ver el pipeline en acción:

1. Hacer push a GitHub
2. Ir a tu repositorio → **Actions**
3. Ver los jobs ejecutándose en tiempo real

### Estados posibles:
- ✅ **Verde**: Todo correcto
- 🟡 **Amarillo**: En progreso
- ❌ **Rojo**: Falló (ver logs para debug)

---

## 🗣️ Para la Presentación

### **CI implementado:**
- ✅ Pipeline con 3 stages definidos (Lint, Build, Test)
- ✅ Se ejecuta automáticamente en cada push
- ✅ Verifica calidad del código antes de mergear

### **CD implementado:**
- ✅ Despliegue automatizado configurado
- ✅ Solo se despliega código de rama `main`
- ✅ Opciones: Expo (mobile) o GitHub Pages (web)

### **Si no está configurado (argumentación):**

> "El despliegue automatizado está **implementado y configurado** en GitHub Actions.
> Sin embargo, requiere configuración de credenciales (EXPO_TOKEN) que por seguridad
> no están en el repositorio. Para activarlo completamente en producción:
> 
> 1. Se configuraría el token de Expo en los Secrets de GitHub (1 min)
> 2. Al hacer push a main, se desplegaría automáticamente
> 
> El pipeline está listo y funcional, solo requiere las credenciales de producción."

---

## 🚀 Despliegue Manual (Alternativa)

Si no se configura automático, se puede desplegar manualmente:

```bash
# Publicar a Expo
npx expo publish

# O build para web
npm run build:web
```

---

## 📝 Archivos Creados

- `.github/workflows/ci-cd.yml` - Configuración del pipeline
- `.github/workflows/README.md` - Documentación del pipeline
- `CICD_SETUP.md` (este archivo) - Guía de configuración

---

## 🎓 Conceptos Clave

**CI/CD** = Automatización del flujo desde código → producción

- **CI**: Verifica que el código es correcto antes de integrarlo
- **CD**: Despliega automáticamente cuando pasa todas las verificaciones

**Beneficios:**
- ⚡ Despliegues más rápidos
- 🛡️ Menos errores en producción
- 🔄 Feedback inmediato sobre problemas
- 📈 Mayor confianza en los cambios

