# Estilo Lavi — E-commerce

Mini e-commerce full-stack para a loja de roupas femininas Estilo Lavi.
Pagamento via Pix (QR Code dinâmico + chave copia-e-cola), confirmação manual via WhatsApp e painel administrativo.

## Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + shadcn/ui + Wouter (hash router)
- **Backend**: Node.js + Express 5 (servidor único, mesma porta 5000)
- **Banco**: SQLite (better-sqlite3) + Drizzle ORM — arquivo `data.db` na raiz
- **Auth admin**: JWT (jsonwebtoken) + bcryptjs
- **Pix**: gerador de payload EMV BR Code + lib `qrcode`

## Rodar localmente

```bash
cp .env.example .env       # ajuste as variáveis se quiser
npm install
npm run dev                # http://localhost:5000
```

Na primeira execução o banco é criado automaticamente, com:
- 6 produtos seed (roupas femininas)
- Usuário admin com as credenciais de `ADMIN_EMAIL` / `ADMIN_PASS`

## Estrutura

```
estilo-lavi/
├── client/                  # Frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/           # Home, Produtos, Detalhe, Carrinho, Checkout, Contato
│   │   │   └── admin/       # Login, Dashboard, Vendas, Produtos
│   │   ├── components/loja/ # Header, Footer, Logo, ProductCard
│   │   ├── components/ui/   # shadcn/ui
│   │   ├── store/cart.tsx   # CartProvider (React Context)
│   │   ├── lib/queryClient.ts
│   │   └── index.css        # paleta rosé/dourado/off-white
│   └── index.html
├── server/                  # Backend
│   ├── index.ts             # Express bootstrap
│   ├── routes.ts            # Todas as rotas REST
│   ├── storage.ts           # Drizzle + seed
│   └── lib/pix.ts           # gerador EMV BR Code
├── shared/schema.ts         # Schema + tipos compartilhados
├── data.db                  # SQLite (criado em runtime)
└── .env.example
```

## Rotas da API

### Públicas
- `GET /api/config` — Retorna chave Pix e WhatsApp configurados
- `GET /api/produtos[?destaque=true]` — Lista produtos ativos
- `GET /api/produtos/:id` — Detalhe de produto
- `POST /api/pedidos` — Cria pedido e gera QR Code Pix
- `GET /api/pedidos/:id` — Status público do pedido

### Admin (Authorization: Bearer <token>)
- `POST /api/admin/login`
- `GET /api/admin/dashboard` — Cards de vendas
- `GET /api/admin/pedidos[?status&from&to]` — Lista pedidos
- `PUT /api/admin/pedidos/:id/confirmar` — Marca como pago
- `PUT /api/admin/pedidos/:id/status` — Atualiza status
- `GET /api/admin/produtos` — CRUD completo
- `POST /api/admin/produtos`
- `PUT /api/admin/produtos/:id`
- `DELETE /api/admin/produtos/:id`

## Fluxo de pagamento

1. Cliente preenche checkout → backend cria pedido status `pendente`, gera EMV Pix com txid `LAVI{id}`, devolve QR + copia-cola + link WhatsApp
2. Cliente paga manualmente no app do banco
3. Cliente clica no link WhatsApp pré-preenchido para enviar comprovante
4. Loja acessa `/admin/vendas` e clica em "confirmar pagamento" → status vira `pago` (e depois `enviado`)

## Schema do banco

```sql
CREATE TABLE produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco REAL NOT NULL,
  tamanhos TEXT NOT NULL DEFAULT '[]',  -- JSON array
  cores TEXT NOT NULL DEFAULT '[]',     -- JSON array
  imagem_url TEXT,
  destaque INTEGER DEFAULT 0,
  ativo INTEGER DEFAULT 1,
  estoque INTEGER DEFAULT 99,
  criado_em INTEGER
);

CREATE TABLE pedidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_nome TEXT NOT NULL,
  cliente_whatsapp TEXT NOT NULL,
  cliente_email TEXT,
  endereco_entrega TEXT,
  itens TEXT,         -- JSON: PedidoItem[]
  total REAL NOT NULL,
  pix_key TEXT,
  qr_code_data TEXT,  -- payload EMV BR Code
  status TEXT DEFAULT 'pendente',  -- pendente | pago | enviado | cancelado
  observacoes TEXT,
  data_criacao INTEGER,
  data_pagamento INTEGER
);

CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  senha_hash TEXT
);
```

## Build de produção

```bash
npm run build
NODE_ENV=production node dist/index.cjs
```

## Próximos passos sugeridos

- Webhook do banco (OpenPix/Asaas) para confirmar pagamento automaticamente
- Upload de imagens (Cloudinary / Supabase Storage)
- Integração com transportadoras (Melhor Envio)
- 2FA / OAuth para admin
- Cupons de desconto

---

**Credenciais admin de teste:**
- Email: `laisavitoriaa77@gmail.com`
- Senha: `Lais@2412`

Acesse `/#/admin/login` para entrar.
