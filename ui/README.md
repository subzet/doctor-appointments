# Doctor Appointments - Admin UI

Panel de administración para médicos. Gestiona turnos, pacientes y configuración.

## Stack

- Next.js 15 + TypeScript
- Tailwind CSS
- shadcn/ui
- Firebase Authentication

## Setup

### 1. Instalar dependencias

```bash
bun install
```

### 2. Configurar Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar Authentication → Email/Password
3. Copiar configuración del proyecto
4. Crear archivo `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Crear usuario inicial

En Firebase Console → Authentication → Add user

### 4. Correr en desarrollo

```bash
bun run dev
```

Abrir [http://localhost:3001](http://localhost:3001) (o el puerto que use Next.js)

## Build para producción

```bash
bun run build
```

Genera static export en `dist/`.

## Deploy

### Vercel (recomendado)

```bash
npx vercel --prod
```

### Railway

```bash
railway up
```

## Estructura

```
app/
├── login/page.tsx          # Login con Firebase Auth
├── components/
│   ├── appointments-tab.tsx   # Gestión de turnos
│   ├── patients-tab.tsx       # Lista de pacientes
│   └── settings-tab.tsx       # Configuración
├── page.tsx                # Dashboard principal
└── layout.tsx              # Auth provider + protected routes

lib/
├── firebase.ts             # Firebase config
├── auth-context.tsx        # Auth context/provider
├── api.ts                  # API client
└── types.ts                # TypeScript types
```
