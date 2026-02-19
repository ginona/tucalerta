# TucAlerta

Sistema colaborativo de alertas ciudadanas para Tucumán, Argentina.

**Demo:** https://tucalerta.vercel.app

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)

## Origen del proyecto

Durante las emergencias climáticas en Tucumán, la falta de información oficial sobre zonas afectadas por lluvias e inundaciones deja a los ciudadanos sin herramientas para tomar decisiones. La desinformación y las fake news complican aún más la situación.

Este proyecto nació como una respuesta concreta a ese problema: una plataforma donde la comunidad reporta y valida incidentes en tiempo real. Fue desarrollado con asistencia de IA como ejemplo de cómo esta tecnología puede usarse para resolver problemas reales y generar impacto positivo.

## Features

- Mapa interactivo con reportes geolocalizados en tiempo real
- Sectorización por localidades de Tucumán (33 localidades)
- Sistema de votación comunitaria (confirmar / reportar falso)
- Auto-verificación: reportes con +3 votos positivos son verificados
- Auto-ocultamiento: reportes con -3 votos son marcados como falsos
- Anti-spam: límite de 1 reporte cada 45 minutos por dispositivo
- 100% responsive, mobile-first
- Actualizaciones automáticas cada 2 minutos

## Stack

### Frontend
| Tecnología | Uso |
|------------|-----|
| React 18 | UI |
| Vite | Build tool |
| TypeScript | Type safety |
| TailwindCSS | Estilos |
| Leaflet | Mapas open source |
| Zustand | Estado global |
| TanStack Query | Data fetching |

### Backend
| Tecnología | Uso |
|------------|-----|
| Node.js | Runtime |
| Express | Framework |
| TypeScript | Type safety |
| PostgreSQL | Base de datos |
| Prisma ORM | Database client |

### Infraestructura
| Servicio | Uso |
|----------|-----|
| Vercel | Frontend |
| Railway | Backend + PostgreSQL |
| pnpm | Package manager |
| Turborepo | Monorepo |

## Estructura del proyecto

```
tucalerta/
├── apps/
│   ├── web/                 # Frontend React + Vite
│   │   └── src/
│   │       ├── components/  # Map, AlertCard, AlertForm, etc.
│   │       ├── hooks/       # useAlerts, useVote
│   │       ├── store/       # Zustand store
│   │       ├── lib/         # API client, fingerprint
│   │       └── config/      # Constantes, localidades
│   └── api/                 # Backend Express + Prisma
│       ├── src/
│       │   ├── routes/      # alerts, localities
│       │   ├── controllers/
│       │   ├── services/
│       │   └── middleware/  # validation, rateLimit, errorHandler
│       └── prisma/
│           ├── schema.prisma
│           └── seed.ts
├── packages/
│   └── types/               # Tipos TypeScript compartidos
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Setup local

### Requisitos

- Node.js >= 18
- pnpm >= 8
- PostgreSQL >= 14

### 1. Clonar

```bash
git clone https://github.com/ginona/tucalerta.git
cd tucalerta
```

### 2. Crear base de datos

```sql
psql -U postgres
CREATE DATABASE tucalerta;
```

### 3. Variables de entorno

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

**apps/api/.env:**
```env
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/tucalerta?schema=public"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**apps/web/.env:**
```env
VITE_API_URL=http://localhost:3001
```

### 4. Instalar dependencias

```bash
pnpm install
```

### 5. Compilar paquetes compartidos

```bash
cd packages/types && pnpm build && cd ../..
```

### 6. Base de datos

```bash
cd apps/api
pnpm db:generate
pnpm db:migrate --name init
pnpm db:seed
```

### 7. Desarrollo

```bash
# Desde la raíz (frontend + backend)
pnpm dev
```

O en terminales separadas:

```bash
# Terminal 1
cd apps/api && pnpm dev

# Terminal 2
cd apps/web && pnpm dev
```

### 8. URLs locales

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Health check: http://localhost:3001/health
- Prisma Studio: `cd apps/api && pnpm db:studio`

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `pnpm dev` | Frontend y backend en desarrollo |
| `pnpm build` | Compila todos los paquetes |
| `pnpm lint` | Linter en todo el proyecto |
| `pnpm type-check` | Verifica tipos TypeScript |
| `pnpm db:migrate` | Ejecuta migraciones |
| `pnpm db:studio` | Abre Prisma Studio |
| `pnpm db:seed` | Carga localidades en la DB |
| `pnpm db:reset` | Resetea la base de datos |

## Sistema anti-spam

1. **Device fingerprinting:** cada dispositivo tiene un ID único persistente
2. **Rate limiting:** máximo 1 reporte cada 45 minutos por dispositivo
3. **Vote limiting:** 1 voto por alerta por dispositivo
4. **Self-vote prevention:** no se puede votar en la propia alerta
5. **Validation score:** alertas con score <= -3 se ocultan automáticamente

## Deployment

### Frontend — Vercel

1. Conectar repositorio en Vercel
2. Root Directory: `apps/web`
3. Build Command: `pnpm build`
4. Output Directory: `dist`
5. Variable: `VITE_API_URL=https://tu-api.railway.app`

### Backend — Railway

1. Crear proyecto en Railway
2. Agregar servicio PostgreSQL
3. Conectar repositorio, Root Directory: `apps/api`
4. Las variables de entorno se configuran automáticamente
5. El `railway.json` ejecuta migraciones en cada deploy

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/alerts` | Lista alertas (filtros: type, localityId, includeHidden) |
| GET | `/alerts/:id` | Obtiene una alerta |
| POST | `/alerts` | Crea nueva alerta |
| POST | `/alerts/:id/vote` | Vota en una alerta |
| GET | `/localities` | Lista localidades |

## Contribuir

1. Fork el repositorio
2. Crea tu branch: `git checkout -b feature/nueva-feature`
3. Commit: `git commit -m 'Add nueva feature'`
4. Push: `git push origin feature/nueva-feature`
5. Abre un Pull Request

## Licencia

MIT — Hecho para Tucumán, Argentina
