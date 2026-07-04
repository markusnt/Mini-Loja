# Desafio NTT — Mini Loja

Aplicação full-stack para gerenciar produtos e categorias. Backend NestJS + Prisma + Redis; frontend React + Vite.

## Visão geral

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

**Frontend:** listagem paginada de produtos, formulários e detalhes em painéis laterais (Sheet). CRUD de categorias.

**Backend:** API REST em `/api` com validação via DTOs. Leituras de produtos e categorias passam pelo Redis; mutações invalidam o cache relacionado.

## Como subir

**1. Infraestrutura** (PostgreSQL + Redis):

```bash
docker compose up -d
```

**2. Backend** → `http://localhost:3000/api`

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

**3. Frontend** → `http://localhost:5173`

```bash
cd frontend
npm install
npm run dev
```

## Testar endpoints (curl)

Base: `http://localhost:3000/api`

```bash
# Health
curl http://localhost:3000/api/health

# Categorias
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" -d '{"name":"Eletrônicos"}'
curl http://localhost:3000/api/categories
curl "http://localhost:3000/api/categories?search=ele"
curl http://localhost:3000/api/categories/1
curl -X PATCH http://localhost:3000/api/categories/1 \
  -H "Content-Type: application/json" -d '{"name":"Eletrônicos e Acessórios"}'
curl -X DELETE http://localhost:3000/api/categories/1

# Produtos (paginado)
curl "http://localhost:3000/api/products?page=1&limit=10"
curl "http://localhost:3000/api/products?page=1&limit=10&search=notebook"
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Notebook","description":"16GB RAM","price":3499.90,"categoryId":1}'
curl http://localhost:3000/api/products/1
curl -X PATCH http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" -d '{"price":3299.90}'
curl -X DELETE http://localhost:3000/api/products/1
```

Resposta paginada de `GET /products`:

```json
{ "data": [/* produtos com category */], "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 } }
```

## Estratégia de cache (Redis)

TTL padrão: **300s** (5 min). Chaves via `SCAN` + `DEL` na invalidação em lote.

| Recurso | Chave | Quando invalida |
|---------|-------|-----------------|
| Lista de produtos | `products:list:page:{p}:limit:{l}:search:{term\|all}` | POST/PATCH/DELETE produto; PATCH/DELETE categoria |
| Produto por ID | `products:item:{id}` | PATCH/DELETE produto; PATCH/DELETE categoria |
| Lista de categorias | `categories:list:search:{term\|all}` | POST/PATCH/DELETE categoria; mutações de produto |
| Categoria por ID | `categories:item:{id}` | PATCH/DELETE categoria; mutações de produto na categoria |

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

**Invalidação cruzada:** ao alterar um produto, o contador `_count.products` das categorias é atualizado no cache. Ao renomear uma categoria, produtos cacheados com o nome antigo também são invalidados.
