# 📱 Software Frontend

Aplicación frontend desarrollada con **React Native + Expo** con despliegue web automatizado a Netlify.

---

## 🚀 Tecnologías

- **React Native** - Framework para desarrollo móvil
- **Expo** - Plataforma de desarrollo
- **TypeScript** - Tipado estático
- **Axios** - Cliente HTTP
- **Netlify** - Hosting y despliegue web pagando el plan personal de 9 USD al mes por el equipo de desarrollo del proyecto 
- **GitHub Actions** - CI/CD

---

## 📋 Requisitos Previos

- Node.js 18 o superior
- npm o yarn
- Expo CLI (se instala automáticamente)

---

## ⚙️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/[tu-usuario]/software-frontend.git
   cd software-frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crear archivo `.env` en la raíz del proyecto:
   ```env
   VITE_BACKEND_URL=http://localhost:3000
   ```

---

## 🏃 Ejecutar el Proyecto

### Desarrollo Local

```bash
# Iniciar en modo desarrollo
npm start

# Abrir en navegador web
npm run web

# Abrir en Android (requiere emulador o dispositivo)
npm run android

# Abrir en iOS (requiere Mac con Xcode)
npm run ios
```

### Build para Producción

```bash
# Generar build para web
npm run build:web

# Deploy manual a Netlify
npm run deploy
```

---

## 📜 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Inicia Expo en modo desarrollo |
| `npm run web` | Abre la aplicación en el navegador |
| `npm run android` | Abre en emulador Android |
| `npm run ios` | Abre en simulador iOS |
| `npm run build:web` | Genera build optimizado para web |
| `npm run build:android` | Build de producción para Android con EAS |
| `npm run build:ios` | Build de producción para iOS con EAS |
| `npm run build:preview` | Build preview (APK) para testing |
| `npm run deploy` | Publica actualización mobile con EAS Update |
| `npm run deploy:web` | Despliega manualmente a Netlify |
| `npm run lint` | Verifica errores de TypeScript |
| `npm test` | Ejecuta tests (pendiente de implementar) |

---

## 🌐 Despliegue

### Web (Netlify)

**URL**: https://santiago-software.netlify.app

El despliegue a producción es **automático** cuando se hace push a la rama `main`.

**Ambientes:**
- **Producción**: rama `main` → https://santiago-software.netlify.app
- **Preview**: Pull Requests → URL temporal de Netlify

### Mobile (EAS)

**Actualizaciones OTA automáticas** en cada push a `main`.

**Canales:**
- **Production**: rama `main` → Usuarios reciben updates automáticamente
- **Preview**: Pull Requests → Build APK para testing

**Configuración rápida (5 min)**: [QUICK_START_EAS.md](QUICK_START_EAS.md)  
**Guía completa**: [EAS_SETUP.md](EAS_SETUP.md)

---

## 🔄 CI/CD Pipeline

El proyecto cuenta con **2 pipelines** automatizados usando **GitHub Actions**:

### Pipeline Web (Netlify)

1. **🔍 Lint** - Verificación de código TypeScript
2. **🏗️ Build** - Compilación del proyecto con Expo
3. **🧪 Test** - Ejecución de tests
4. **🚀 Deploy** - Despliegue automático a Netlify con plan pagado personal
5. **📦 Release** - Creación automática de tags y releases

```
git push main
    ↓
Lint → Build → Test → Deploy Web → Create Release
    ↓
✅ https://santiago-software.netlify.app
```

### Pipeline Mobile (EAS)

1. **🔍 Lint** - Verificación de código
2. **📱 EAS Update** - Publicación OTA (Over-The-Air)

```
git push main
    ↓
Lint → EAS Update
    ↓
✅ Usuarios reciben actualización automáticamente
```

**Ver más**: 
- [Web CI/CD](.github/workflows/README.md)
- [Mobile EAS Setup](EAS_SETUP.md)

---

## 📦 Sistema de Releases

Cada deploy a producción crea automáticamente:
- 🏷️ Tag de Git con formato: `v2025.10.13-1430`
- 📝 Release en GitHub con notas de cambios
- 🔗 Lista de commits incluidos

**Ver releases**: [GitHub Releases](https://github.com/[tu-usuario]/software-frontend/releases)

---

## 📁 Estructura del Proyecto

```
software-frontend/
├── .github/
│   └── workflows/          # Pipelines CI/CD
│       ├── web-netlify.yml # Pipeline principal
│       ├── create-release.yml # Releases manuales
│       └── README.md       # Documentación CI/CD
├── assets/                 # Imágenes y recursos
├── node_modules/          # Dependencias (ignorado)
├── dist/                  # Build de producción (ignorado)
├── App.tsx                # Componente principal
├── index.ts               # Punto de entrada
├── babel.config.js        # Configuración Babel
├── tsconfig.json          # Configuración TypeScript
├── netlify.toml           # Configuración Netlify
├── eas.json               # Configuración Expo
├── package.json           # Dependencias y scripts
├── .env                   # Variables de entorno (ignorado)
├── env.d.ts               # Tipos para variables de entorno
└── README.md              # Este archivo
```

---

## 🔐 Variables de Entorno

### Desarrollo Local

Crear archivo `.env`:

```env
VITE_BACKEND_URL=http://localhost:3000
```

### Producción (GitHub Actions)

Variables configuradas en GitHub Secrets:
- `NETLIFY_AUTH_TOKEN` - Token de autenticación de Netlify
- `NETLIFY_SITE_ID` - ID del sitio en Netlify
- `EXPO_PUBLIC_API_URL` - URL del backend en producción

---

## 🛠️ Desarrollo

### Agregar nueva funcionalidad

1. Crear rama desde `main`:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

2. Hacer cambios y commits:
   ```bash
   git add .
   git commit -m "feat: agregar nueva funcionalidad"
   ```

3. Push y crear Pull Request:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```

4. El CI/CD ejecutará automáticamente: Lint → Build → Test

5. Después de aprobar el PR, merge a `main` desplegará a producción

### Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bugs
- `docs:` - Cambios en documentación
- `style:` - Cambios de formato (no afectan lógica)
- `refactor:` - Refactorización de código
- `test:` - Agregar o modificar tests
- `chore:` - Tareas de mantenimiento

---

## 🐛 Debugging

### Ver logs en desarrollo

```bash
npm start
# Presionar 'j' para abrir debugger
```

### Ver logs en producción

1. Ir a [Netlify Dashboard](https://app.netlify.com)
2. Seleccionar el sitio
3. Ver "Deploy logs" o "Function logs"

### Ver logs del CI/CD

1. Ir a tu repositorio en GitHub
2. Tab **Actions**
3. Seleccionar el workflow
4. Ver detalles de cada step

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama (`git checkout -b feature/mejora`)
3. Commit cambios (`git commit -m 'feat: agregar mejora'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Crear Pull Request

---

## 📝 Notas

- El archivo `.env` **NO** debe subirse al repositorio (está en `.gitignore`)
- Las credenciales de producción están en GitHub Secrets
- El build se hace en GitHub Actions, Netlify solo sirve archivos estáticos
- Cada push a `main` crea un nuevo release automáticamente

---

## 📚 Recursos

- [Documentación de Expo](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Netlify Docs](https://docs.netlify.com/)
- [GitHub Actions](https://docs.github.com/es/actions)
- [CI/CD Pipeline](.github/workflows/README.md)

---

## 👥 Equipo

Desarrollado por [Tu Nombre/Equipo]

---

## 📄 Licencia

[MIT License](LICENSE) o tu licencia preferida

---

## 🆘 Soporte

¿Problemas o preguntas?
- Abrir un [Issue](https://github.com/[tu-usuario]/software-frontend/issues)
- Ver documentación en [.github/workflows/README.md](.github/workflows/README.md)

