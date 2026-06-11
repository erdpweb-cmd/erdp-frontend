# El Rincón De Los Perritos - Frontend

Sistema de toma de pedidos para el local de comidas rápidas "El Rincón De Los Perritos".

## 🚀 Tecnologías

- **Angular 21** - Framework frontend
- **PrimeNG 21** - Biblioteca de componentes UI
- **Firebase** - Autenticación, base de datos y almacenamiento
- **QuaggaJS** - Escáner de códigos de barras
- **jsPDF** - Generación de reportes PDF

## 📋 Requisitos Previos

- Node.js 18+ 
- npm 9+
- Angular CLI 21+
- Cuenta de Firebase

## 🔧 Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd erdp-frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar Firebase:
   - Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilitar Authentication (Email/Password)
   - Crear base de datos Firestore
   - Habilitar Storage (opcional, para fotos)
   - Copiar la configuración de Firebase

4. Actualizar las credenciales de Firebase en `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'TU_API_KEY',
    authDomain: 'TU_PROYECTO.firebaseapp.com',
    projectId: 'TU_PROYECTO',
    storageBucket: 'TU_PROYECTO.appspot.com',
    messagingSenderId: 'TU_SENDER_ID',
    appId: 'TU_APP_ID'
  }
};
```

## 🏃 Ejecutar la Aplicación

```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200`

## 👥 Roles de Usuario

### Administrador
- Acceso completo a todas las funcionalidades
- Dashboard con métricas
- Gestión de inventario, productos, promociones y personal
- Reportes
- Configuración de turnos
- Apertura/cierre de día

### Colaborador
- Acceso a panel de cocina
- Acceso a panel de barra/recepción
- Toma de pedidos
- Despacho de pedidos

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── core/                    # Funcionalidades core
│   │   ├── guards/             # Guards de autenticación y roles
│   │   ├── models/             # Interfaces TypeScript
│   │   └── services/           # Servicios (Auth, Firebase, Notificaciones)
│   ├── features/               # Módulos de funcionalidad
│   │   ├── auth/               # Login
│   │   ├── dashboard/          # Dashboard administrativo
│   │   ├── business/           # Configuración de turnos y apertura de día
│   │   ├── inventory/          # Gestión de inventario con escáner
│   │   ├── products/           # CRUD de productos
│   │   ├── promotions/         # CRUD de promociones y cupones
│   │   ├── staff/              # Gestión de personal y pagos
│   │   ├── reports/            # Reportes y exportación
│   │   ├── kitchen/            # Panel de cocina (row expansion)
│   │   └── counter/            # Panel de barra/recepción
│   ├── layout/                 # Layout principal con sidebar
│   ├── app.component.ts
│   └── app.routes.ts
├── assets/
│   └── styles/
│       └── global.scss         # Estilos globales
└── environments/
    ├── environment.ts          # Desarrollo
    └── environment.prod.ts     # Producción
```

## 🔥 Configuración de Firestore

### Colecciones necesarias:

- `users` - Usuarios del sistema
- `products` - Productos del menú
- `inventory` - Inventario de insumos
- `orders` - Pedidos realizados
- `promotions` - Promociones activas
- `coupons` - Cupones de descuento
- `payments` - Pagos al personal
- `shifts` - Turnos de trabajo

### Reglas de seguridad (Firestore):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Orders can be read by authenticated users
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    // Products, inventory, promotions, coupons - admin only for write
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 📱 Funcionalidades Principales

### Dashboard
- Métricas de ventas diarias/mensuales/trimestrales/semestrales
- Gráficos de ventas y egresos
- Alertas de stock bajo

### Negocio
- Configuración de turnos (recepción/cocina)
- Apertura y cierre de día
- Redirección automática según turno

### Inventario
- CRUD completo de items
- Escáner de códigos de barras (QuaggaJS)
- Categorías: Bebidas, Empaques, Alimentos, Limpieza
- Alertas de stock mínimo

### Productos
- CRUD de productos
- Cálculo automático de ganancias
- Registro de ingredientes por producto
- Tipos: Bebida, Comida, Acompañamiento, Otro

### Promociones
- Tipos: Bono, Producto Gratis, Descuento, Cupón
- Promociones diarias o por fecha
- Aplicación automática en pedidos

### Personal
- Registro de colaboradores
- Historial de pagos
- Tipos: Salario, Bono, Anticipo, Otro

### Reportes
- Reportes diarios/semanales/mensuales
- Detalle de productos vendidos
- Promociones y cupones aplicados
- Exportación a PDF
- Envío por WhatsApp

### Panel de Cocina
- Tabla con row expansion para ingredientes
- Tiempo de espera en tiempo real
- Despacho de pedidos
- Actualización automática de inventario

### Panel de Barra/Recepción
- Selección rápida de productos
- Cálculo automático de totales
- Aplicación de promociones y cupones
- Métodos de pago: Efectivo, Tarjeta, Transferencia

## 🎨 Diseño

- Tema minimalista con PrimeNG
- Colores: Azul primario, verde éxito, rojo peligro, amarillo advertencia
- Tipografía: Inter
- Animaciones suaves
- Totalmente responsive

## 📝 Notas de Desarrollo

- El proyecto usa **Signals** de Angular 21 para gestión de estado
- Los componentes son **standalone**
- Se usa **Firestore onSnapshot** para actualizaciones en tiempo real
- El escáner de códigos de barras usa **QuaggaJS** (solo 1D)

## 🔜 Próximos Pasos

1. Configurar el backend (Express + Firebase Functions)
2. Implementar lógica de negocio completa
3. Agregar pruebas unitarias y E2E
4. Optimizar rendimiento
5. Desplegar en producción

## 📄 Licencia

Este proyecto es privado y confidencial.
