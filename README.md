# Desafio NTT — Mini Loja

Monorepo full-stack: **NestJS + Prisma + PostgreSQL + Redis** (backend) e **React + Vite** (frontend).

## Estrutura

```
DesafioNtt/
├── backend/src/          # API NestJS (modules: products, categories, prisma, redis)
├── frontend/src/         # React (pages → hooks → services → API)
├── docker-compose.yml    # PostgreSQL + Redis
└── README.md
```

## Como subir

**Pré-requisitos:** Node.js 20+, Docker.

```bash
# 1. Infraestrutura
docker compose up -d

# 2. Backend (http://localhost:3000/api)
cd backend && cp .env.example .env && npm i
npm run prisma:generate && npm run prisma:migrate && npm run start:dev

# 3. Frontend (http://localhost:5173) — proxy /api → backend
cd frontend && npm i && npm run dev
```

Variáveis de ambiente em `backend/.env` (ver `.env.example`).

## Testar endpoints

Base: `http://localhost:3000/api`

```bash
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

Leituras (`GET /products`, `GET /products/:id`, `GET /categories`, `GET /categories/:id`) consultam Redis primeiro. Em cache miss, busca no PostgreSQL e grava com **TTL 300s**.

| Chave | Invalidação |
|-------|-------------|
| `products:list:page:{p}:limit:{l}:search:{s}` | mutação em produto ou categoria |
| `products:item:{id}` | PATCH/DELETE produto; PATCH/DELETE categoria |
| `categories:list:search:{s}` | mutação em categoria ou produto |
| `categories:item:{id}` | PATCH/DELETE categoria; mutação de produto na categoria |

```
GET ──► Redis hit? ──sim──► resposta
          │
         não ──► PostgreSQL ──► salva Redis ──► resposta

POST/PATCH/DELETE ──► invalida chaves (SCAN+DEL) ──► operação no banco
```

Invalidação cruzada garante consistência: ex. renomear categoria limpa cache de produtos que embutem o nome; criar produto atualiza `_count` da categoria.

**Regra de negócio:** categoria com produtos vinculados não pode ser excluída (validação no service + `onDelete: Restrict` no Prisma).
