# 🚨 TucAlerta

Sistema colaborativo de alertas ciudadanas para Tucumán, Argentina.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)

## 🎯 Problema

La falta de comunicación oficial sobre zonas afectadas por lluvias e inundaciones deja a los ciudadanos tucumanos sin información para tomar decisiones. Durante emergencias climáticas, la desinformación y las fake news complican aún más la situación.

## 💡 Solución

Plataforma colaborativa donde la comunidad reporta y valida incidentes en tiempo real. Sistema anti-fake-news mediante validación comunitaria que permite identificar rápidamente reportes verificados y descartar información falsa.

## ✨ Features

- 🗺️ **Mapa interactivo** con reportes geolocalizados en tiempo real
- 📍 **Sectorización** por localidades de Tucumán (12 localidades)
- ✅ **Sistema de votación** comunitaria (confirmar/reportar falso)
- 🎯 **Auto-verificación:** reportes con +3 votos positivos son verificados
- 🚫 **Auto-ocultamiento:** reportes con -3 votos son marcados como falsos
- 🔒 **Anti-spam:** límite de 1 reporte por hora por dispositivo
- 📱 **100% responsive** (mobile-first design)
- ⚡ **Actualizaciones automáticas** cada 60 segundos

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Uso |
|------------|-----|
| React 18 | UI Library |
| Vite | Build tool |
| TypeScript | Type safety |
| TailwindCSS | Styling |
| Leaflet | Mapas open source |
| Zustand | Estado global |
| TanStack Query | Data fetching |

### Backend
| Tecnología | Uso |
|------------|-----|
| Node.js | Runtime |
| Express | Web framework |
| TypeScript | Type safety |
| PostgreSQL | Base de datos |
| Prisma ORM | Database client |

### Infraestructura
| Servicio | Uso |
|----------|-----|
| Vercel | Frontend hosting |
| Railway | Backend + PostgreSQL |
| pnpm | Package manager |
| Turborepo | Monorepo build system |

## 📁 Estructura del Proyecto

```
tucalerta/
├── apps/
│   ├── web/                 # Frontend React + Vite
│   │   ├── src/
│   │   │   ├── components/  # Map, AlertCard, AlertForm, etc.
│   │   │   ├── hooks/       # useAlerts, useVote
│   │   │   ├── store/       # Zustand store
│   │   │   ├── lib/         # API client, fingerprint
│   │   │   └── config/      # Constants, localities
│   │   └── ...
│   └── api/                 # Backend Express + Prisma
│       ├── src/
│       │   ├── routes/      # alerts, localities
│       │   ├── controllers/ # alertController
│       │   ├── services/    # alertService
│       │   ├── middleware/  # validation, rateLimit, errorHandler
│       │   └── lib/         # prisma client
│       └── prisma/
│           ├── schema.prisma
│           └── seed.ts
├── packages/
│   └── types/               # Tipos TypeScript compartidos
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## 🚀 Setup Local

### Requisitos

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL >= 14

### 1. Clonar y navegar

```bash
git clone https://github.com/tu-usuario/tucalerta.git
cd tucalerta
```

### 2. Crear base de datos PostgreSQL

```sql
-- Conectarse a PostgreSQL
psql -U postgres

-- Crear base de datos
CREATE DATABASE tucalerta;
```

### 3. Configurar variables de entorno

```bash
# Backend
cp apps/api/.env.example apps/api/.env
# Editar con tus credenciales de PostgreSQL

# Frontend
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

### 6. Configurar base de datos

```bash
cd apps/api

# Generar cliente Prisma
pnpm db:generate

# Crear tablas
pnpm db:migrate --name init

# Poblar localidades
pnpm db:seed
```

### 7. Ejecutar en desarrollo

```bash
# Desde la raíz (ejecuta frontend y backend)
pnpm dev
```

O en terminales separadas:

```bash
# Terminal 1 - API
cd apps/api && pnpm dev

# Terminal 2 - Web
cd apps/web && pnpm dev
```

### 8. Acceder a la app

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001
- **Health check:** http://localhost:3001/health
- **Prisma Studio:** `cd apps/api && pnpm db:studio`

## 📋 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `pnpm dev` | Ejecuta frontend y backend en desarrollo |
| `pnpm build` | Compila todos los paquetes |
| `pnpm lint` | Ejecuta linter en todo el proyecto |
| `pnpm type-check` | Verifica tipos TypeScript |
| `pnpm db:migrate` | Ejecuta migraciones de Prisma |
| `pnpm db:studio` | Abre Prisma Studio |
| `pnpm db:seed` | Pobla la DB con localidades |
| `pnpm db:reset` | Resetea la base de datos |

## 🔒 Sistema Anti-Spam

El sistema implementa múltiples capas de protección:

1. **Device Fingerprinting:** Cada dispositivo tiene un ID único persistente
2. **Rate Limiting:** Máximo 1 reporte por hora por dispositivo
3. **Vote Limiting:** Solo 1 voto por alerta por dispositivo
4. **Self-Vote Prevention:** No puedes votar en tu propia alerta
5. **Validation Score:** Alertas con score <= -3 se ocultan automáticamente

## 🌐 Deployment

### Frontend → Vercel

1. Conectar repositorio en Vercel
2. Configurar:
   - **Root Directory:** `apps/web`
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist`
3. Agregar variable: `VITE_API_URL=https://tu-api.railway.app`

### Backend → Railway

1. Crear proyecto en Railway
2. Agregar servicio PostgreSQL
3. Conectar repositorio
4. Configurar:
   - **Root Directory:** `apps/api`
   - Variables de entorno se configuran automáticamente
5. El `railway.json` ejecuta migraciones en cada deploy

## 📊 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/alerts` | Lista alertas (filtros: type, localityId, includeHidden) |
| GET | `/alerts/:id` | Obtiene una alerta |
| POST | `/alerts` | Crea nueva alerta |
| POST | `/alerts/:id/vote` | Vota en una alerta |
| GET | `/localities` | Lista localidades |

## 🏘️ Localidades Soportadas

- San Miguel de Tucumán (Capital)
- Yerba Buena
- Tafí Viejo
- Banda del Río Salí
- Las Talitas
- Alderetes
- Concepción
- Monteros
- Famaillá
- Aguilares
- Lules
- Simoca

## 🤝 Contribuir

1. Fork el repositorio
2. Crea tu branch (`git checkout -b feature/nueva-feature`)
3. Commit tus cambios (`git commit -m 'Add nueva feature'`)
4. Push al branch (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

## 📄 Licencia

MIT

---

Hecho con ❤️ para Tucumán, Argentina
