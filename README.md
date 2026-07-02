# Desafio NTT

Monorepo com frontend e backend para o desafio técnico NTT.

## Estrutura

```
DesafioNtt/
├── frontend/   # React + Vite + Tailwind CSS + Shadcn UI
├── backend/    # NestJS + Prisma ORM + Redis
└── docker-compose.yml
```

## Pré-requisitos

- Node.js 20+
- Docker e Docker Compose

## Infraestrutura

Suba PostgreSQL e Redis:

```bash
docker compose up -d
```

## Backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

API disponível em `http://localhost:3000/api`

- Health check: `GET /api/health`

## Frontend

```bash
cd frontend
npm install
npm run dev
```

App disponível em `http://localhost:5173`

O Vite está configurado para fazer proxy de `/api` para o backend.

## Stack

| Camada    | Tecnologias                          |
|-----------|--------------------------------------|
| Frontend  | React, Vite, TypeScript, Tailwind v4, Shadcn UI |
| Backend   | NestJS, Prisma ORM, PostgreSQL, Redis (ioredis) |
