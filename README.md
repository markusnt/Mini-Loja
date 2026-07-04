# Desafio NTT — Mini Loja

Monorepo full-stack: **NestJS + Prisma + PostgreSQL + Redis** (backend) e **React + Vite** (frontend).

Repositório: https://github.com/markusnt/Mini-Loja

## Estrutura

```
DesafioNtt/
├── backend/src/          # API NestJS (products, categories, prisma, redis)
├── frontend/src/         # React (pages → hooks → services → API)
├── docker-compose.yml    # PostgreSQL + Redis
└── README.md
```

- **Backend:** `Controller → Service → CacheService → Prisma`, DTOs com `class-validator` + `ValidationPipe` global
- **Frontend:** CRUD de produtos (listagem paginada, formulário e detalhes em Sheet) e categorias (listagem, formulário, detalhes, bloqueio de exclusão com produtos vinculados)

## Arquitetura

```
┌─────────────┐     proxy /api      ┌──────────────┐     Prisma     ┌────────────┐
│  Frontend   │ ──────────────────► │   Backend    │ ────────────► │ PostgreSQL │
│  React/Vite │   localhost:5173    │   NestJS     │               │  (Docker)  │
└─────────────┘                     └──────┬───────┘               └────────────┘
                                           │
                                           │ cache GET
                                           ▼
                                    ┌────────────┐
                                    │   Redis    │
                                    │  (Docker)  │
                                    └────────────┘
```

## Como subir

**Pré-requisitos:** Node.js 20+, Docker.

```bash
# 1. Infraestrutura
docker compose up -d

# 2. Backend (http://localhost:3000/api)
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev

# 3. Frontend (http://localhost:5173) — proxy /api → backend
cd frontend
npm install
npm run dev
```

Valores para `backend/.env` com o Docker local:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/desafio_ntt?schema=public"
REDIS_URL="redis://localhost:6379"
```

## Testar endpoints

Base: `http://localhost:3000/api`

```bash
# Health — verifica PostgreSQL (SELECT 1) e Redis (PING)
curl http://localhost:3000/api/health

# Categorias (CRUD)
curl -X POST http://localhost:3000/api/categories -H "Content-Type: application/json" -d '{"name":"Eletrônicos"}'
curl http://localhost:3000/api/categories
curl http://localhost:3000/api/categories/1
curl -X PATCH http://localhost:3000/api/categories/1 -H "Content-Type: application/json" -d '{"name":"Informática"}'
curl -X DELETE http://localhost:3000/api/categories/1   # 409 se houver produtos vinculados

# Produtos (CRUD + paginação)
curl "http://localhost:3000/api/products?page=1&limit=10&search=note"
curl -X POST http://localhost:3000/api/products -H "Content-Type: application/json" \
  -d '{"name":"Notebook","description":"16GB RAM","price":3499.90,"categoryId":1}'
curl http://localhost:3000/api/products/1
curl -X PATCH http://localhost:3000/api/products/1 -H "Content-Type: application/json" -d '{"price":3299.90}'
curl -X DELETE http://localhost:3000/api/products/1
```

`GET /products` retorna `{ data: Product[], meta: { page, limit, total, totalPages } }`.

## Estratégia de cache (Redis)

Leituras (`GET /products`, `GET /products/:id`, `GET /categories`, `GET /categories/:id`) consultam Redis primeiro. Em cache miss, busca no PostgreSQL e grava com **TTL 300s**. Invalidação em lote via `SCAN` + `DEL`.

| Chave | TTL | Invalidação |
|-------|-----|-------------|
| `products:list:page:{p}:limit:{l}:search:{s}` | 300s | mutação em produto ou categoria |
| `products:item:{id}` | 300s | PATCH/DELETE produto; PATCH/DELETE categoria |
| `categories:list:search:{s}` | 300s | mutação em categoria ou produto |
| `categories:item:{id}` | 300s | PATCH/DELETE categoria; mutação de produto na categoria |

```
GET /products ou /categories
        │
        ▼
   Existe no Redis? ──sim──► retorna JSON cacheado
        │
       não
        ▼
   Consulta PostgreSQL ──► grava no Redis (TTL 300s) ──► retorna

POST / PATCH / DELETE
        │
        ▼
   Invalida chaves afetadas ──► executa operação no banco
```

Invalidação cruzada garante consistência: ex. renomear categoria limpa cache de produtos que embutem o nome; criar produto atualiza `_count` da categoria.

**Regra de negócio:** categoria com produtos vinculados não pode ser excluída (validação no service + `onDelete: Restrict` no Prisma).
