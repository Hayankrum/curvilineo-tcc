# Relatório do Projeto - Plataforma de Questionários

## 1. Visão Geral

Projeto de plataforma web para criação, gerenciamento e resposta de questionários online, com suporte a notificações push, autenticação de usuários e modo offline (PWA).

**Princípio Fundamental:** "Infraestrutura pode mudar. A regra de negócio deve permanecer."

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Frontend | Next.js | 16.3.3 |
| UI Library | React | 19.2.4 |
| Linguagem | TypeScript | ^5 |
| Estilo | Tailwind CSS | ^4 |
| Database | PostgreSQL | - |
| ORM | Prisma | ^7.8.0 |
| Autenticação | NextAuth v5 (beta) / JWT customizado | - |
| Storage | S3-compatible (AWS, R2, MinIO) ou Local | - |
| Web Push | web-push | ^3.6.7 |
| Gráficos | Recharts | ^3.10.1 |
| Drag & Drop | @dnd-kit | ^6.3.1 |
| QR Code | qrcode | ^1.5.4 |
| Senhas | bcryptjs | ^3.0.3 |
| JWT | jsonwebtoken | ^9.0.3 |
| Offline | IndexedDB (idb) | ^8.0.3 |

---

## 3. Arquitetura

### Estrutura de Pastas

```
src/
├── app/                    # Rotas Next.js (App Router)
│   ├── api/                # Rotas de API
│   ├── admin/              # Painel administrativo
│   ├── questionarios/      # CRUD de questionários
│   ├── usuarios/           # Autenticação e perfil
│   ├── notificacoes/       # Centro de notificações
│   └── offline/            # Página offline
│
├── modules/                # Módulos de domínio (lógica de negócio)
│   ├── usuarios/           # Ações e componentes de usuários
│   ├── questionarios/      # Ações e componentes de questionários
│   ├── notificacoes/       # Componente sino de notificações
│   ├── media/              # Upload e gerenciamento de arquivos
│   ├── admin/              # Componentes admin
│   ├── layout/             # Registro de service worker
│   └── tema/               # Gerenciamento de tema
│
├── infrastructure/         # Camada de infraestrutura (portável)
│   ├── auth/               # Autenticação
│   │   └── providers/      # CredentialsAuthProvider, NextAuthProvider
│   └── storage/            # Storage de arquivos
│       └── providers/      # LocalStorageProvider, S3StorageProvider
│
├── components/             # Componentes compartilhados
│   ├── Navbar.tsx          # Navegação principal
│   ├── HeroMinimal.tsx     # Hero section
│   ├── InstallPWAButton.tsx
│   ├── InstallPWMPopup.tsx
│   ├── NotificationPermissionPopup.tsx
│   ├── OfflineBanner.tsx
│   ├── TermosChecker.tsx
│   └── TermosModal.tsx
│
├── lib/                    # Utilitários e helpers
│   ├── auth.ts             # Configuração de auth
│   ├── db.ts               # Conexão banco
│   ├── prisma.ts           # Cliente Prisma
│   ├── session.ts          # Gerenciamento de sessão
│   ├── notifications.ts    # Web Push
│   ├── rateLimit.ts        # Rate limiting
│   ├── utils.ts            # Utilitários gerais
│   ├── ThemeProvider.tsx    # Context de tema
│   ├── useData.ts          # Hook de dados offline
│   ├── useOnlineStatus.ts  # Status de conexão
│   └── usePushSubscription.ts # Inscrição push
│
├── types/                  # Declarações TypeScript
├── generated/              # Código gerado pelo Prisma
└── proxy.ts                # Proxy de configuração
```

### Padrão Arquitetural

- **Módulos de Domínio:** Lógica de negócio organizada por domínio (questionários, usuários, etc.)
- **Infrastructure Layer:** Abstrações para auth e storage, permitindo troca de provedores sem alterar regra de negócio
- **Server Actions:** Uso de `'use server'` para mutações de dados
- **Server Components:** Renderização no servidor para SEO e performance

---

## 4. Modelos de Dados (Prisma Schema)

### Usuário (`Usuario`)
- `id`, `nome`, `email`, `senha`, `bio`, `fotoUrl`
- `tipoUsuario` (discente/docente/admin)
- `aceitouTermos`, `notificacoesAtivas`, `notificarSistema`, `notificarQuestionarios`
- `isAdmin`

### Sessão (`Sessao`)
- `token`, `usuarioId`, `expiraEm`

### Inscrição Push (`InscricaoPush`)
- `endpoint`, `p256dh`, `auth`, `usuarioId`

### Notificação (`Notificacao`)
- `titulo`, `mensagem`, `url`, `lida`, `usuarioId`

### Mídia (`Media`)
- `filename`, `originalName`, `mimeType`, `size`, `storageKey`, `ownerId`

### Questionário (`Questionario`)
- `titulo`, `descricao`, `status` (rascunho/publicado/encerrado/arquivado)
- `anonimo`, `corTema`, `encerraEm`, `usuariosEsperados`, `autorId`

### Pergunta (`Pergunta`)
- `texto`, `tipo` (texto_curto/texto_longo/escolha_unica/multipla_escolha/escala)
- `obrigatoria`, `ordem`, `configEscala`, `condicoes`

### Opção (`Opcao`)
- `texto`, `ordem`, `correta`, `perguntaId`

### Resposta (`Resposta`)
- `usuarioId`, `questionarioId`, `nomeAnonimo`

### ValorResposta (`ValorResposta`)
- `respostaId`, `perguntaId`, `texto`, `opcaoId`, `valorNumerico`

---

## 5. Funcionalidades Implementadas

### 5.1 Autenticação
- **Registro** com validação de senha, email e termos
- **Login** com email/senha (bcryptjs)
- **Login com Google** (NextAuth v5)
- **Logout** e destruição de sessão
- **Alteração de senha** com validação
- **Sessão persistente** via cookies

### 5.2 Questionários
- **CRUD completo:** Criar, editar, deletar, duplicar
- **Tipos de pergunta:** Texto curto/longo, escolha única, múltipla escolha, escala
- **Configurações:** Anônimo, cor de tema, data de encerramento, meta de respostas
- **Status:** Rascunho → Publicado → Encerrado → Arquivado
- **Validação:** Perguntas obrigatórios, limites de caracteres, sanitização de input
- **Condições condicionais** em perguntas

### 5.3 Respostas
- **Envio de respostas** com validação completa
- **Edição de respostas** pelo autor
- **Suporte a respostas anônimas** (usuário temporário criado)
- **Verificação de duplicidade** (um respondente por questionário, exceto anônimos)

### 5.4 Resultados e Estatísticas
- **Dashboard de resultados** com gráficos (Recharts)
- **Distribuição de respostas** por opção
- **Médias em escalas**
- **Taxa de acerto** para perguntas com alternativa correta
- **Filtros** por data e respondente
- **Exportação** dos dados

### 5.5 Notificações
- **Notificações in-app** (banco de dados)
- **Web Push** (service worker + VAPID)
- **Preferências do usuário:** Ativar/desativar por tipo
- **Sino de notificações** com contador
- **Notificação automática** quando questionário recebe resposta
- **Alerta de meta atingida**

### 5.6 PWA (Progressive Web App)
- **Service Worker** para cache offline
- **Manifest.json** para instalação
- **Popup de instalação** (PWA)
- **Banner de offline**
- **Página offline** dedicada

### 5.7 Storage
- **Upload de mídia** (fotos, arquivos)
- **Providers:** Local (desenvolvimento) e S3 (produção)
- **Presigned URLs** para upload direto ao S3

### 5.8 Admin
- **Ativação por código** (ADMIN_LOGIN_CODE)
- **Dashboard admin** com métricas
- **Gerenciamento de usuários**

### 5.9 Tema
- **Dark/Light mode** com persistência no localStorage
- **CSS variables** para theming

### 5.10 Segurança
- **CSP headers** (Content Security Policy)
- **Rate limiting**
- **Sanitização de input**
- **Validação server-side**
- **Senhas hasheadas** (bcryptjs)

---

## 6. Rotas da Aplicação

### Páginas
| Rota | Descrição |
|------|-----------|
| `/` | Página inicial |
| `/usuarios/login` | Login |
| `/usuarios/registrar` | Registro |
| `/usuarios/[id]` | Perfil do usuário |
| `/questionarios` | Lista de questionários do usuário |
| `/questionarios/novo` | Criar questionário |
| `/questionarios/[id]` | Detalhes do questionário |
| `/questionarios/[id]/editar` | Editar questionário |
| `/questionarios/[id]/responder` | Responder questionário |
| `/questionarios/[id]/resultados` | Ver resultados |
| `/questionarios/publicos` | Questionários públicos |
| `/notificacoes` | Centro de notificações |
| `/admin` | Painel admin |
| `/offline` | Página offline |

### APIs
| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/auth/*` | - | NextAuth routes |
| `/api/me` | GET | Usuário logado |
| `/api/media/*` | POST/GET | Upload de mídia |
| `/api/notifications` | GET | Notificações |
| `/api/subscribe` | POST | Inscrição push |
| `/api/unsubscribe` | POST | Cancelar inscrição |
| `/api/vapid-key` | GET | Chave pública VAPID |

---

## 7. Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Conexão PostgreSQL |
| `AUTH_PROVIDER` | Provedor de auth (nextauth/credentials) |
| `AUTH_SECRET` | Segredo para JWT |
| `NEXTAUTH_URL` | URL do app |
| `GOOGLE_CLIENT_ID` | Client ID Google |
| `GOOGLE_CLIENT_SECRET` | Client Secret Google |
| `VAPID_PUBLIC_KEY` | Chave pública Web Push |
| `VAPID_PRIVATE_KEY` | Chave privada Web Push |
| `VAPID_EMAIL` | Email para VAPID |
| `STORAGE_PROVIDER` | Provedor (local/s3) |
| `STORAGE_UPLOAD_DIR` | Diretório local |
| `STORAGE_BASE_URL` | URL base |
| `STORAGE_ENDPOINT` | Endpoint S3 |
| `STORAGE_REGION` | Região S3 |
| `STORAGE_BUCKET` | Bucket S3 |
| `STORAGE_ACCESS_KEY` | Access Key S3 |
| `STORAGE_SECRET_KEY` | Secret Key S3 |
| `ADMIN_LOGIN_CODE` | Código para ativar admin |

---

## 8. Scripts Disponíveis

```bash
npm run dev          # Iniciar desenvolvimento
npm run build        # Build de produção
npm run start        # Iniciar produção
npm run lint         # Linting
npm run clean        # Limpar e reinstalar tudo
```

---

## 9. Portabilidade

O projeto foi projetado para ser portável:

1. **Trocar banco:** Apenas alterar `DATABASE_URL` e rodar migrações
2. **Trocar storage:** Alterar `STORAGE_PROVIDER` e variáveis correspondentes
3. **Trocar auth:** Alterar `AUTH_PROVIDER` ou criar novo provider em `src/infrastructure/auth/providers/`

---

## 10. Notas para IA

- O projeto usa **Server Actions** para mutações (arquivos `*.actions.ts`)
- Validações são feitas **server-side** antes de salvar no banco
- O Prisma Client é gerado em `src/generated/prisma`
- Componentes seguem padrão **React Server Components** quando possível
- Hooks customizados estão em `src/lib/` (useData, useOnlineStatus, usePushSubscription)
- Tema é gerenciado via **CSS variables** e persistido no localStorage
