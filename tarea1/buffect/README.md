# Bufect — Sistema Web (Frontend + Backend)

Proyecto de la asignatura **Seguridad Informática**. Incluye un frontend en Vue 3 (Vite) y un backend en Node.js/Express, además de un `docker-compose.yaml` para levantar el stack con Docker.

## Estructura del proyecto

- `frontend/`: aplicación web (Vite + Vue 3).
- `backend/`: API en Express.
- `docker-compose.yaml`: orquestación con Docker.

## Requisitos

- Node.js 18+ y npm
- Docker (opcional, para levantar con `docker compose`)

## Variables de entorno

### Frontend

- `VITE_API_URL` (ejemplo: `http://localhost:3000`)

### Backend

- `Contenedor_tribunal` (ejemplo: `http://tribunales_back:3001`)

## Ejecución local (sin Docker)

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Por defecto:

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

## Ejecución con Docker Compose

Este `docker-compose.yaml` usa una red externa llamada `abogados_asociados`.

```bash
docker network create abogados_asociados
docker compose up --build
```

Puertos expuestos:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3000`

## Documentación adicional

- Comandos básicos de Docker: `backend/ComandDocker.md`
