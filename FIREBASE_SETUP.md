# Configuración de Firebase para GoldFolio CRM

## Paso 1: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto" o "Add project"
3. Nombre del proyecto: `goldfolio-crm` (o el que prefieras)
4. Acepta los términos y crea el proyecto

## Paso 2: Configurar Firebase Authentication

1. En el menú lateral, ve a **Authentication**
2. Haz clic en "Get started" o "Comenzar"
3. Habilita el método de autenticación: **Email/Password**
4. Activa ambas opciones:
   - ✅ Email/Password
   - ✅ Email link (opcional)

## Paso 3: Configurar Firestore Database

1. En el menú lateral, ve a **Firestore Database**
2. Haz clic en "Create database"
3. Selecciona el modo: **Production mode** (para seguridad)
4. Elige la ubicación más cercana a tus usuarios (ej: `southamerica-east1` para Brasil/Argentina)
5. Haz clic en "Enable"

## Paso 4: Configurar Reglas de Seguridad de Firestore

Copia y pega estas reglas en la pestaña "Rules" de Firestore:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is MASTER
    function isMaster() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'MASTER';
    }
    
    // Helper function to check if user is ADMIN or MASTER
    function isAdminOrMaster() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['ADMIN', 'MASTER'];
    }
    
    // Helper function to check if user belongs to a branch
    function belongsToBranch(branchId) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.branchId == branchId;
    }
    
    // Users collection - Only MASTER can create/update users
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isMaster();
    }
    
    // Branches collection - Only ADMIN or MASTER can manage
    match /branches/{branchId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdminOrMaster();
    }
    
    // Clients collection - Users can only see their branch's clients
    match /clients/{clientId} {
      allow read: if isAuthenticated() && 
                     (isMaster() || belongsToBranch(resource.data.branchId));
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
                              (isMaster() || belongsToBranch(resource.data.branchId));
    }
    
    // Deposit Receipts collection - Same rules as clients
    match /depositReceipts/{receiptId} {
      allow read: if isAuthenticated() && 
                     (isMaster() || belongsToBranch(resource.data.branchId));
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
                              (isMaster() || belongsToBranch(resource.data.branchId));
    }
  }
}
\`\`\`

## Paso 5: Crear Índices en Firestore (Para consultas compuestas)

Ve a la pestaña "Indexes" y crea estos índices:

### Clientes por sucursal y fecha
- Collection: `clients`
- Fields: `branchId` (Ascending), `createdAt` (Descending)

### Boletas por sucursal y fecha
- Collection: `depositReceipts`
- Fields: `branchId` (Ascending), `createdAt` (Descending)

### Boletas por banco y fecha
- Collection: `depositReceipts`
- Fields: `bank` (Ascending), `createdAt` (Descending)

### Usuarios por sucursal
- Collection: `users`
- Fields: `branchId` (Ascending), `username` (Ascending)

**Nota:** Firebase te pedirá crear estos índices automáticamente cuando intentes hacer las consultas. Simplemente haz clic en el link que aparece en el error y Firebase lo creará por ti.

## Paso 6: Obtener las Credenciales de Firebase

1. En el menú lateral, ve a **Project Settings** (ícono de engranaje)
2. Scroll down hasta la sección "Your apps"
3. Haz clic en el ícono web `</>` para agregar una app web
4. Registra la app con el nombre: `goldfolio-crm-web`
5. Copia las credenciales que aparecen (firebaseConfig)

## Paso 7: Configurar Variables de Entorno en el Proyecto

1. En tu proyecto Next.js, crea un archivo `.env.local` (copiando `.env.local.example`)
2. Pega las credenciales de Firebase:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
\`\`\`

## Paso 8: Crear el Usuario Master Inicial

Dado que las reglas de seguridad solo permiten que MASTER cree usuarios, necesitas crear el primer usuario manualmente:

1. Ve a **Authentication** en Firebase Console
2. Haz clic en "Add user" o "Agregar usuario"
3. Email: `master@goldfolio.com` (o el que prefieras)
4. Password: Crea una contraseña segura
5. Copia el **User UID** que Firebase genera

6. Ve a **Firestore Database**
7. Crea una colección llamada `users`
8. Agrega un documento con el **User UID** como ID del documento
9. Campos del documento:
   \`\`\`json
   {
     "email": "master@goldfolio.com",
     "username": "master",
     "role": "MASTER",
     "branchId": "", // Vacío para Master
     "createdAt": 1734518400000 // Timestamp actual
   }
   \`\`\`

10. Crea también la sucursal inicial:
    - Colección: `branches`
    - ID del documento: genera uno automático
    - Campos:
      \`\`\`json
      {
        "name": "Casa Central",
        "createdAt": 1734518400000
      }
      \`\`\`

## ¡Listo!

Ya puedes ejecutar tu aplicación:

\`\`\`bash
npm run dev
\`\`\`

E iniciar sesión con:
- Email: `master@goldfolio.com`
- Password: (la que configuraste)

Desde ahí podrás crear más usuarios, sucursales y comenzar a usar el sistema.

## Solución de Problemas

### Error: "Missing or insufficient permissions"
- Verifica que las reglas de Firestore estén configuradas correctamente
- Asegúrate de que el usuario esté autenticado
- Verifica que el documento del usuario exista en Firestore

### Error al hacer consultas compuestas
- Firebase te mostrará un link para crear el índice necesario
- Haz clic en el link y espera unos minutos a que se cree

### La app no conecta con Firebase
- Verifica que las variables de entorno en `.env.local` sean correctas
- Reinicia el servidor de desarrollo (`npm run dev`)
