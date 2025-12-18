# GoldFolio CRM - Next.js + Firebase

Sistema de gestión de clientes y boletas de depósito para sucursales de inversión en oro, construido con Next.js 14, TypeScript, Tailwind CSS y Firebase.

## ✨ Características Principales

### Gestión de Usuarios
- ✅ Autenticación con Firebase Auth
- ✅ Tres niveles de roles: **MASTER**, **ADMIN** y **USER**
- ✅ Gestión de usuarios por sucursal
- ✅ Cambio de contraseña seguro

### Gestión de Clientes
- ✅ Registro completo de información del cliente
- ✅ Estados de cliente: Pendiente, Contactado, Completado, Cancelado
- ✅ Filtrado y búsqueda de clientes
- ✅ Asignación por sucursal

### 🆕 Boletas de Depósito (NUEVA FUNCIONALIDAD)
- ✅ Registro de depósitos bancarios
- ✅ Información de cliente, banco, monto y moneda
- ✅ **Validación anti-fraude**: Detecta números de operación duplicados por banco
- ✅ Moneda de contraparte (ej: deposita ARS, compra USD)
- ✅ Visible desde vista Master para auditoría

### Arquitectura
- ✅ Mobile-first responsive design
- ✅ Firebase Firestore como base de datos
- ✅ Reglas de seguridad de Firestore configuradas
- ✅ Real-time updates
- ✅ Escalable y optimizado

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ instalado
- Cuenta de Firebase
- npm o yarn

### Instalación

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar Firebase** (Ver [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))

3. **Configurar variables de entorno**
   ```bash
   cp .env.local.example .env.local
   # Editar .env.local con tus credenciales de Firebase
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

5. Abre [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
goldfolio-crm-next/
├── app/                     # Next.js App Router
├── components/              # Componentes React
│   ├── auth/               # Autenticación
│   └── ui/                 # UI reutilizables
├── lib/
│   ├── context/            # React Context
│   ├── firebase/           # Configuración Firebase
│   └── services/           # Servicios de datos
│       ├── depositReceiptService.ts  # ⭐ Validación anti-fraude
└── types/                  # TypeScript types
```

## 🔐 Validación Anti-Fraude

El sistema incluye validación automática de números de operación duplicados:

```typescript
// Al registrar una boleta, el sistema verifica:
if (existeOperacionDuplicada(banco, numeroOperacion)) {
  // ⚠️ ALERTA: Posible fraude detectado
  throw new Error('Número de operación ya existe para este banco');
}
```

## 🎨 Tecnologías

- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Firebase Auth** - Autenticación
- **Firestore** - Base de datos
- **React Context** - Estado global

## 📱 Mobile-First

Toda la interfaz está optimizada para dispositivos móviles con navegación táctil y diseño responsive.

## 📝 Documentación Adicional

- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Guía completa de configuración de Firebase

## 🐛 Solución de Problemas

Ver sección "Solución de Problemas" en [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

---

⭐ **Recuerda configurar Firebase antes de ejecutar!** Lee [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
