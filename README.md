# Açucarada 🍫

> **Plataforma digital completa para confeitarias artesanais com gestão e analytics integrados**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-blue.svg)](https://tailwindcss.com/)

## 📋 Sobre o Projetoo

Solução web moderna que digitaliza confeitarias artesanais com **vitrine digital**, **painel administrativo** e **sistema de analytics** integrados. Oferece experiência completa desde a navegação do cliente até a gestão empresarial.

**Principais diferenciais:**
- Sistema de sabores com imagens individuais
- Analytics em tempo real para decisões baseadas em dados
- Integração WhatsApp para pedidos diretos
- Interface responsiva e acessível

---

## 🛠️ Stack Tecnológica

**Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui  
**Backend:** Supabase (PostgreSQL + Auth + Storage + Real-time)  
**Principais libs:** React Router, TanStack Query, React Hook Form + Zod

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

## ⚡ Funcionalidades

### 🌐 Área Pública
- **Catálogo interativo** com filtros e busca
- **Páginas de produto** com galeria de sabores
- **Integração WhatsApp** para pedidos
- **Sistema de curtidas** e compartilhamento
- **Design responsivo** mobile-first

### 🔧 Painel Admin
- **CRUD completo** de produtos e categorias
- **Upload de imagens** (principal + sabores individuais)
- **Dashboard analytics** com métricas em tempo real
- **Configurações** do sistema (WhatsApp, perfil)
- **Autenticação segura** com controle de acesso

### 📊 Analytics Integrado
- **Métricas automáticas:** visualizações, curtidas, cliques, compartilhamentos
- **Relatórios visuais** com gráficos interativos
- **Produtos populares** baseado em engajamento
- **Insights de negócio** para tomada de decisão

---

## 🚀 Instalação

**Pré-requisitos:** Node.js 18+, conta Supabase (gratuita)

```bash
# 1. Clone e instale
git clone <repository-url>
cd acucarada-v2
npm install

# 2. Configure ambiente
cp .env.example .env
# Edite .env com suas credenciais Supabase

# 3. Execute migrações no Supabase Dashboard
# Arquivos: supabase/migrations/

# 4. Configure buckets de storage:
# - product-images
# - product-flavor-images

# 5. Execute o projeto
npm run dev
```

---

## 📱 Como Usar

**Clientes:** Navegue pelo catálogo → Explore produtos → Faça pedidos via WhatsApp  
**Admins:** Acesse `/auth` → Login → Gerencie produtos em `/admin` → Monitore analytics

---

## 🗄️ Banco de Dados

**Tabelas principais:** `products`, `categories`, `profiles`, `product_analytics`, `app_settings`  
**Recursos:** Row Level Security (RLS), triggers automáticos, storage buckets

---

## 🔧 Scripts

```bash
npm run dev      # Desenvolvimento
npm run build    # Build produção
npm run test     # Testes + lint
```

---

## 🚀 Deploy

**Recomendado:** Vercel, Netlify ou Supabase Hosting  
**Configuração:** Variáveis de ambiente + build + domínio personalizado

---

## 📄 Licença

Projeto real e portfólio de desenvolvimento full-stack.

---

**Desenvolvido com ❤️ para modernizar confeitarias artesanais**  
*Açucarada - Onde tradição encontra inovação* 🍫✨
