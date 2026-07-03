# Desafio NTT — Mini Loja

Monorepo com frontend React e backend NestJS para o desafio técnico NTT.

## Como subir

**1. Infraestrutura** (PostgreSQL + Redis):

```bash
docker compose up -d
```

**2. Backend** (`http://localhost:3000/api`):

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

**3. Frontend** (`http://localhost:5173`):

```bash
cd frontend
npm install
npm run dev
```

O Vite faz proxy de `/api` para o backend.

## Testar endpoints (curl)

Base: `http://localhost:3000/api`

```bash
# Health check
curl http://localhost:3000/api/health

# Categorias
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Eletrônicos"}'

curl http://localhost:3000/api/categories
curl http://localhost:3000/api/categories/1

curl -X PATCH http://localhost:3000/api/categories/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Eletrônicos e Acessórios"}'

curl -X DELETE http://localhost:3000/api/categories/1

# Produtos (paginado)
curl "http://localhost:3000/api/products?page=1&limit=10"
curl "http://localhost:3000/api/products?page=1&limit=10&search=notebook"

curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Notebook","description":"16GB RAM","price":3499.90,"categoryId":1}'

curl http://localhost:3000/api/products/1

curl -X PATCH http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price":3299.90}'

curl -X DELETE http://localhost:3000/api/products/1
```

Resposta paginada de `GET /products`:

```json
{
  "data": [/* produtos com category */],
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

## Estratégia de cache (Redis)

| Chave | Conteúdo | TTL |
|-------|----------|-----|
| `products:list:page:{p}:limit:{l}:search:{term\|all}` | JSON da resposta paginada | 300s |
| `products:item:{id}` | JSON do produto com categoria | 300s |

**Fluxo:** `GET /products` e `GET /products/:id` consultam o Redis primeiro. Em cache miss, busca no PostgreSQL e grava no Redis.

**Invalidação:**
- `POST /products` → remove todas as chaves `products:list:*`
- `PATCH /products/:id` → remove `products:item:{id}` + todas as listas
- `DELETE /products/:id` → remove `products:item:{id}` + todas as listas

Isso garante que mutações nunca sirvam dados desatualizados; listas são invalidadas em lote via `SCAN` + `DEL`.
