# AutoFácil — Frontend

Marketplace brasileiro de veículos. Permite que vendedores publiquem anúncios e compradores pesquisem, filtrem e entrem em contato direto pelo WhatsApp.

---

## Tecnologias

| Pacote | Versão | Função |
|---|---|---|
| React | 19 | UI |
| TypeScript | 6 | Tipagem estática |
| Vite | 8 | Bundler / dev server |
| TailwindCSS | 4 | Estilização utilitária |
| React Router DOM | 7 | Roteamento SPA |
| Axios | 1.16 | Cliente HTTP |
| Lucide React | 1.14 | Ícones |

---

## Pré-requisitos

- Node.js ≥ 18
- Backend rodando (ver `../Projeto_Agro/README.md`)

---

## Instalação e execução

```bash
# instalar dependências
npm install

# rodar em desenvolvimento (exposto na rede local)
npm run dev

# build de produção
npm run build

# preview do build
npm run preview

# lint
npm run lint
```

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3668
```

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3668` | URL base do backend |

---

## Estrutura de diretórios

```
src/
├── assets/
│   └── categories/               # imagens das categorias (SUV, Sedan, etc.)
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx             # barra de navegação com busca, notificações e menu
│   │   └── Footer.tsx
│   └── ui/
│       ├── BrandSearchInput.tsx   # input com autocomplete de marcas (FIPE)
│       ├── CarCard.tsx            # card de listagem
│       ├── CommentsSection.tsx    # seção de comentários/perguntas (threaded)
│       ├── NotificationDropdown.tsx
│       ├── Button.tsx
│       └── CreateOrgModal.tsx
├── contexts/
│   └── ThemeContext.tsx           # provider light/dark
├── hooks/
│   └── useNotifications.ts       # polling de notificações não lidas (30s)
├── pages/
│   ├── Auth/
│   │   ├── Login.tsx
│   │   └── Cadastro.tsx          # registro com validação de confirmação de senha
│   ├── Home/                     # hero com busca, categorias e destaques
│   ├── Listings/                 # listagem com filtros laterais + cascata FIPE
│   ├── ListingDetail/            # detalhe + galeria + contato + comentários
│   ├── CriarAnuncio/             # wizard 6 etapas
│   ├── Perfil/                   # abas: info / meus anúncios / notificações / editar
│   └── SellerProfile/            # perfil público do vendedor
├── services/
│   ├── api.ts                    # todos os serviços HTTP
│   └── fipe.ts                   # integração com API FIPE (proxy via backend)
└── types/
    └── api.ts                    # interfaces e enums TypeScript
```

---

## Rotas

| Rota | Página | Auth | Descrição |
|---|---|---|---|
| `/` | `Home` | Não | Página inicial com hero, categorias e destaques |
| `/anuncios` | `Listings` | Não | Listagem com filtros avançados |
| `/anuncios/:id` | `ListingDetail` | Não | Detalhe do anúncio |
| `/criar-anuncio` | `CriarAnuncio` | Sim | Wizard de criação de anúncio |
| `/perfil` | `Perfil` | Sim | Painel do usuário logado |
| `/vendedor/:id` | `SellerProfile` | Não | Perfil público do vendedor |
| `/login` | `Login` | Não | Autenticação |
| `/cadastro` | `Cadastro` | Não | Registro de conta |

---

## Autenticação

O token JWT é armazenado em `localStorage` sob a chave `token`. O interceptor do Axios injeta automaticamente o header `Authorization: Bearer <token>` em todas as requisições.

Páginas protegidas verificam a presença do token e redirecionam para `/login` quando ausente ou inválido.

---

## Serviços HTTP (`src/services/api.ts`)

### `authService`

| Método | Endpoint | Resposta |
|---|---|---|
| `login(email, password)` | `POST /auth/login` | `{ token: string }` |
| `register(data)` | `POST /users` | `{ data: User }` |

### `usersService`

| Método | Endpoint | Descrição |
|---|---|---|
| `getMe()` | `GET /users/:id` | Usuário logado (lê ID do token) |
| `getById(id)` | `GET /users/:id` | Usuário por ID |
| `update(data)` | `PUT /users/:id` | Atualiza perfil, avatar, senha |

### `listingsService`

| Método | Endpoint | Descrição |
|---|---|---|
| `search(filters)` | `GET /listings` | Busca com filtros e paginação |
| `getById(id)` | `GET /listings/:id` | Detalhe + imagens + vendedor |
| `getFeatured()` | `GET /listings?featured=true&per_page=6` | Anúncios em destaque |
| `getByUser(id)` | `GET /listings/user/:id` | Anúncios do vendedor |
| `create(data)` | `POST /listings` | Cria anúncio |
| `update(id, data)` | `PUT /listings/:id` | Edita anúncio |
| `remove(id)` | `DELETE /listings/:id` | Remove anúncio |
| `incrementView(id)` | `POST /listings/:id/view` | Registra visualização distinta |

### `commentsService`

| Método | Endpoint | Descrição |
|---|---|---|
| `getComments(listingId)` | `GET /listings/:id/comments` | Comentários + respostas aninhadas |
| `addComment(listingId, body, parentId?)` | `POST /listings/:id/comments` | Novo comentário ou resposta |
| `getUnreadCount()` | `GET /notifications/unread` | Contagem de não lidos |
| `markAllRead()` | `POST /notifications/mark-read` | Marca todos como lidos |
| `getNotifications(params)` | `GET /notifications` | Histórico paginado |

### `fipeService` (`src/services/fipe.ts`)

| Método | Endpoint | Descrição |
|---|---|---|
| `getMarcas(tipo)` | `GET /fipe/:tipo/marcas` | Lista de marcas |
| `getModelos(tipo, codMarca)` | `GET /fipe/:tipo/marcas/:cod/modelos` | Modelos da marca |
| `getAnos(tipo, codMarca, codModelo)` | `GET /fipe/:tipo/.../anos` | Anos/versões do modelo |
| `getPreco(tipo, ...)` | `GET /fipe/.../preco` | Preço FIPE + código |

`tipo` aceita `carros`, `motos` ou `caminhoes`.

---

## Tipos principais (`src/types/api.ts`)

### Enums

```ts
ListingCategory  = 'SEDANS' | 'SUVS' | 'PICKUPS' | 'MOTOS' | 'CLASSICOS' | 'VANS' | 'CAMINHOES' | 'OUTROS'
VehicleCondition = 'NOVO' | 'SEMINOVO' | 'USADO'
FuelType         = 'FLEX' | 'GASOLINA' | 'ETANOL' | 'DIESEL' | 'ELETRICO' | 'HIBRIDO'
TransmissionType = 'MANUAL' | 'AUTOMATICO' | 'CVT' | 'AUTOMATIZADO'
ListingStatus    = 'ATIVO' | 'PAUSADO' | 'VENDIDO' | 'EXPIRADO' | 'REMOVIDO'
```

### `SearchFilters`

Parâmetros aceitos por `listingsService.search()`:

```ts
{
  query?        : string           // busca no título do anúncio
  category?     : ListingCategory
  brand?        : string           // nome da marca (ex: 'HONDA')
  model?        : string           // nome do modelo (ex: 'CIVIC')
  year?         : number           // ano exato (prioridade sobre min/max_year)
  min_year?     : number
  max_year?     : number
  condition?    : VehicleCondition
  fuel?         : FuelType
  transmission? : TransmissionType
  state?        : string           // UF de dois dígitos (ex: 'SP')
  min_price?    : number
  max_price?    : number
  max_km?       : number
  order_by?     : 'recente' | 'menor_preco' | 'maior_preco' | 'relevancia'
  page?         : number
  per_page?     : number
}
```

> **Atenção:** todos os valores de enum devem ser **MAIÚSCULOS** (ex: `'NOVO'`, não `'novo'`).

### Envelope de resposta

Todas as respostas seguem o padrão:

```ts
// recurso único
{ success: true, message: string, data: T }

// lista paginada
{ success: true, data: { data: T[], pagination: { total, page, limit, pages } } }
```

---

## Funcionalidades em destaque

### Busca com autocomplete de marcas
`BrandSearchInput` carrega as marcas da API FIPE uma vez e filtra localmente. Ao selecionar, navega para `/anuncios?brand=<marca>`. Presente no Navbar (todas as páginas exceto Home) e na Hero da Home.

### Cascata FIPE nos filtros de Anúncios
Marca → Modelo → Versão/Ano são selects encadeados. Selecionar uma marca carrega os modelos; selecionar um modelo carrega os anos/versões. Cada nível tem opção "Todos" para não restringir.

### Contador de visualizações distintas
Ao abrir um anúncio, o frontend verifica `localStorage[viewed_listing_<id>]`. Se ausente e o usuário não for o vendedor, chama `POST /listings/:id/view` e grava a chave para evitar recontagem.

### Comentários estilo rede social
Qualquer usuário logado pode comentar e responder. Thread de um nível (flat threading). Clicar "Responder" em uma resposta abre o campo com `@nome` pré-preenchido. O comprador recebe notificação quando alguém responde ao seu comentário.

### Notificações unificadas
`useNotifications` faz polling a cada 30 s. Unifica notificações do vendedor (novos comentários nos seus anúncios) e do comprador (respostas aos seus comentários). O dropdown exibe as 5 mais recentes; a aba "Notificações" do perfil exibe o histórico com filtros de data e leitura.

### Wizard de criação (6 etapas)
1. **Tipo** — categoria e condição
2. **Veículo** — marca/modelo/ano via FIPE com preço sugerido automático; especificações técnicas
3. **Opcionais** — segurança, conforto, tecnologia, mecânica (componentes em chips)
4. **Anúncio** — título, preço com máscara de milhar, descrição; localização com cascata Estado → Cidade (API IBGE)
5. **Fotos** — upload de até 10 imagens com reordenação
6. **Revisão** — sumário antes de publicar

### Boost por anúncio
Em "Meus Anúncios", cada card exibe botão ⚡ no hover. Abre modal com seleção de valor (chips R$10/25/50/100 ou campo livre) e forma de pagamento. O botão "Finalizar" gera link WhatsApp com título e ID do anúncio específico na mensagem.
