# Açucarada v2 🍫

> **Plataforma digital moderna para confeitaria artesanal com sistema completo de gestão e analytics**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-blue.svg)](https://tailwindcss.com/)

## 📋 Sobre o Projeto

**Açucarada v2** é uma aplicação web completa desenvolvida para modernizar confeitarias artesanais, oferecendo uma solução integrada que combina vitrine digital, sistema de gestão administrativo e analytics avançado.

### 🎯 Objetivos

- **Digitalização Completa**: Presença digital profissional com catálogo interativo
- **Gestão Inteligente**: Painel administrativo completo para produtos, categorias e analytics
- **Experiência do Cliente**: Interface responsiva e intuitiva com integração WhatsApp
- **Analytics Avançado**: Sistema de métricas para decisões baseadas em dados
- **Sistema de Sabores**: Gestão dinâmica de sabores com imagens individuais

### 👥 Público-Alvo

- **Clientes**: Consumidores de doces artesanais premium
- **Administradores**: Proprietários e funcionários da confeitaria
- **Visitantes**: Potenciais clientes explorando produtos

---

## 🏗️ Arquitetura e Tecnologias

### Stack Principal

**Frontend**
- **React 18** + **TypeScript** - Interface moderna e tipada
- **Vite** - Build tool performático
- **Tailwind CSS** + **shadcn/ui** - Design system consistente
- **React Router** - Navegação SPA
- **TanStack Query** - Gerenciamento de estado servidor
- **React Hook Form** + **Zod** - Formulários e validação

**Backend & Infraestrutura**
- **Supabase** - Backend-as-a-Service completo
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security (RLS)** - Segurança granular
- **Real-time subscriptions** - Atualizações em tempo real
- **Storage** - Upload e gestão de imagens

### 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes reutilizáveis
│   ├── admin/           # Componentes do painel admin
│   └── ui/              # Componentes base (shadcn/ui)
├── pages/               # Páginas da aplicação
├── hooks/               # Custom hooks
├── integrations/        # Configurações externas (Supabase)
├── lib/                 # Utilitários e configurações
└── types/               # Definições de tipos TypeScript

supabase/
├── migrations/          # Migrações do banco de dados
└── setups/             # Scripts de configuração
```

---

## ⚡ Funcionalidades Implementadas

### 🌐 Sistema Público
- ✅ **Landing Page** com hero section atrativo
- ✅ **Catálogo Completo** com filtros por categoria e busca
- ✅ **Detalhes do Produto** com galeria de imagens e sabores
- ✅ **Sistema de Sabores** com imagens individuais por sabor
- ✅ **Integração WhatsApp** para pedidos diretos
- ✅ **Sistema de Curtidas** e compartilhamento
- ✅ **Design Responsivo** otimizado para mobile e desktop

### 🔧 Painel Administrativo
- ✅ **Gestão de Produtos** (CRUD completo)
  - Upload de imagem principal
  - Gestão dinâmica de sabores
  - Upload individual de imagens por sabor
  - Campos detalhados (ingredientes, validade, etc.)
- ✅ **Gerenciamento de Categorias**
- ✅ **Dashboard de Analytics** com métricas em tempo real
- ✅ **Sistema de Configurações** (WhatsApp, site, etc.)
- ✅ **Perfil de Usuário** personalizável
- ✅ **Interface Mobile-Friendly**

### 📊 Sistema de Analytics
- ✅ **Tracking de Visualizações** por produto
- ✅ **Sistema de Curtidas** e engajamento
- ✅ **Métricas de Compartilhamento** (WhatsApp, redes sociais)
- ✅ **Relatórios Visuais** com gráficos interativos
- ✅ **Analytics Agregado** por categoria e período
- ✅ **Produtos Mais Populares** baseado em métricas

### 🔐 Sistema de Autenticação
- ✅ **Login/Registro** seguro via Supabase Auth
- ✅ **Controle de Acesso** baseado em roles (admin/user)
- ✅ **Sessões Persistentes** e logout automático
- ✅ **Recuperação de Senha** via email

---

## 🚀 Instalação e Execução

### Pré-requisitos

- **Node.js** 18+ e npm/yarn
- **Conta Supabase** (gratuita)
- **Git** para controle de versão

### 1. Clonagem e Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd acucarada-v2

# Instale as dependências
npm install
```

### 2. Configuração do Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Configure as variáveis no .env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Configuração do Banco de Dados

```bash
# Execute as migrações no Supabase Dashboard ou CLI
# Arquivos em: supabase/migrations/

# Configure os buckets de storage:
# - product-images (imagens principais)
# - product-flavor-images (imagens de sabores)
```

### 4. Execução

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Linting
npm run lint
```

---

## 📱 Como Usar

### Para Clientes
1. **Navegue** pelo catálogo na página inicial
2. **Explore** produtos por categoria ou busca
3. **Visualize** detalhes e sabores disponíveis
4. **Faça pedidos** via botão WhatsApp
5. **Curta** produtos favoritos

### Para Administradores
1. **Acesse** `/auth` para login
2. **Navegue** para `/admin` após autenticação
3. **Gerencie** produtos na aba "Produtos"
4. **Adicione** sabores e imagens individuais
5. **Monitore** performance na aba "Analytics"
6. **Configure** WhatsApp e outras opções

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **`products`** - Produtos com sabores e imagens
- **`categories`** - Categorias de produtos
- **`profiles`** - Perfis de usuários
- **`product_analytics`** - Métricas agregadas
- **`product_likes`** - Sistema de curtidas
- **`product_shares`** - Tracking de compartilhamentos
- **`app_settings`** - Configurações do sistema

### Recursos Avançados

- **Row Level Security (RLS)** para segurança granular
- **Triggers** para atualização automática de analytics
- **Views** para consultas otimizadas
- **Functions** para operações complexas
- **Storage Buckets** para gestão de imagens

---

## 🎨 Design e UX

### Princípios de Design
- **Mobile-First** - Responsividade prioritária
- **Acessibilidade** - Componentes acessíveis (shadcn/ui)
- **Performance** - Lazy loading e otimizações
- **Consistência** - Design system unificado

### Paleta de Cores
- **Primária**: Tons de rosa/roxo (confeitaria)
- **Secundária**: Verde (destaque/sucesso)
- **Neutra**: Cinzas para textos e backgrounds

---

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run build:dev    # Build em modo desenvolvimento
npm run preview      # Preview da build
npm run lint         # Verificação de código
npm run test         # Testes (TypeScript + lint)
npm run type-check   # Verificação de tipos
```

---

## 📈 Métricas e Analytics

O sistema coleta automaticamente:
- **Visualizações** de produtos
- **Curtidas** e engajamento
- **Cliques** em botões de ação
- **Compartilhamentos** por tipo
- **Sessões** de usuários

Todas as métricas respeitam a privacidade e são agregadas para insights de negócio.

---

## 🚀 Deploy

### Opções Recomendadas

- **Vercel** - Deploy automático via Git
- **Netlify** - Integração contínua
- **Supabase Hosting** - Hospedagem integrada

### Configuração de Produção

1. Configure variáveis de ambiente na plataforma
2. Execute build de produção
3. Configure domínio personalizado
4. Ative HTTPS e CDN

---

## 🤝 Contribuição

Este projeto foi desenvolvido como demonstração de habilidades em desenvolvimento full-stack moderno, showcasing:

- **Arquitetura Limpa** e organizada
- **Boas Práticas** de desenvolvimento
- **Tecnologias Modernas** e relevantes
- **UX/UI** profissional
- **Código Limpo** e documentado

---

## 📄 Licença

Este projeto é uma demonstração educacional e portfólio de desenvolvimento.

---

**Desenvolvido com ❤️ para modernizar confeitarias artesanais**

*Açucarada v2 - Onde tradição encontra inovação* 🍫✨
