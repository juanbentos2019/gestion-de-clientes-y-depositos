# Guía Rápida de Inicialización

## 🚀 Setup Rápido (5 minutos)

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

```bash
# Copia el archivo de ejemplo
cp .env.local.example .env.local

# Luego edita .env.local con tus credenciales de Firebase
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

---

## ⚠️ Primera Vez Usando el Proyecto

Si es tu primera vez, **DEBES configurar Firebase primero**:

### Paso 1: Configura Firebase

Lee y sigue **TODOS** los pasos en: [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md)

Esto incluye:
- ✅ Crear proyecto en Firebase Console
- ✅ Activar Authentication (Email/Password)
- ✅ Crear Firestore Database
- ✅ Configurar reglas de seguridad
- ✅ Crear usuario MASTER inicial
- ✅ Crear sucursal inicial

**⚠️ SIN ESTE PASO, LA APP NO FUNCIONARÁ**

---

## 📋 Checklist de Verificación

Antes de usar la aplicación, verifica:

- [ ] Node.js 18+ instalado (`node --version`)
- [ ] Dependencias instaladas (`npm install` completado)
- [ ] Archivo `.env.local` creado y configurado
- [ ] Proyecto de Firebase creado
- [ ] Authentication activado en Firebase
- [ ] Firestore Database creado
- [ ] Reglas de seguridad configuradas
- [ ] Usuario MASTER creado en Firebase Console
- [ ] Sucursal inicial creada en Firestore

---

## 🔑 Credenciales de Prueba

Después de configurar Firebase, tus credenciales serán:

**Email:** (el que creaste en Firebase Auth)  
**Password:** (la que configuraste)

**Ejemplo:**
- Email: `master@goldfolio.com`
- Password: `tu_password_segura`

---

## 🐛 Problemas Comunes

### Error: "Cannot find module 'firebase'"

**Solución:**
```bash
npm install firebase firebase-admin
```

### Error: "Firebase: Error (auth/configuration-not-found)"

**Solución:**
- Verifica que `.env.local` existe
- Verifica que las variables empiezan con `NEXT_PUBLIC_`
- Reinicia el servidor: `Ctrl+C` y luego `npm run dev`

### Error: "Missing or insufficient permissions"

**Solución:**
- Ve a Firebase Console → Firestore → Rules
- Copia las reglas de `FIREBASE_SETUP.md`
- Publica las reglas

### La página está en blanco

**Solución:**
1. Abre la consola del navegador (F12)
2. Busca errores en la pestaña "Console"
3. Si hay errores de Firebase, verifica la configuración

---

## 📱 Probar la Funcionalidad Anti-Fraude

Una vez que la app funcione:

1. **Inicia sesión** con el usuario MASTER
2. **Ve a "Boletas de Depósito"**
3. **Crea una boleta:**
   - Cliente: "Juan Pérez"
   - Banco: "Banco Santander"
   - Monto: 100000
   - Número de operación: "ABC123"

4. **Intenta crear otra boleta:**
   - Cliente: "María López"
   - Banco: "Banco Santander" (mismo)
   - Monto: 50000
   - Número de operación: "ABC123" (mismo)

5. **Deberías ver:** ⚠️ ALERTA DE FRAUDE

---

## 📚 Documentación Completa

- [`README.md`](./README.md) - Documentación principal
- [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md) - Setup detallado de Firebase
- [`NEXT_STEPS.md`](./NEXT_STEPS.md) - Componentes a implementar
- [`MIGRATION_SUMMARY.md`](./MIGRATION_SUMMARY.md) - Resumen de la migración

---

## 🆘 ¿Necesitas Ayuda?

1. Revisa la sección "Solución de Problemas" en `FIREBASE_SETUP.md`
2. Verifica la consola del navegador (F12) en busca de errores
3. Verifica que todas las dependencias estén instaladas
4. Asegúrate de que Firebase esté correctamente configurado

---

## ✅ Todo Configurado

Si ves la pantalla de login, **¡estás listo!**

Inicia sesión y comienza a explorar la aplicación.

---

**Happy coding! 🚀**
