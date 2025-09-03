# Scripts de Conversão de Imagens WebP

Este diretório contém scripts utilitários para conversão e otimização de imagens no formato WebP.

## 📋 Pré-requisitos

1. **Node.js 16+**
2. **Dependências instaladas**:
   ```bash
   npm install
   ```

3. **Variáveis de ambiente configuradas** (`.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
   ```

## 🚀 Scripts Disponíveis

### 1. Setup e Verificação

```bash
# Verificar configuração e instalar dependências
npm run convert:setup
```

Este comando:
- ✅ Verifica versão do Node.js
- ✅ Instala dependências faltantes
- ✅ Valida variáveis de ambiente
- ✅ Verifica configuração dos buckets Supabase

### 2. Otimização de Buckets

```bash
# Otimizar configurações dos buckets
npm run optimize:buckets
```

Este comando:
- 🔧 Configura buckets para WebP
- 🔧 Define políticas de cache
- 🔧 Cria estrutura de pastas
- 🔧 Configura CORS

### 3. Conversão em Lote

```bash
# Converter todas as imagens existentes
npm run convert:images
```

Este comando:
- 🔄 Converte imagens para WebP
- 💾 Cria backups das originais
- 📊 Gera relatório de economia
- 🗄️ Atualiza banco de dados

### 4. Gerenciamento de Backups

```bash
# Listar backups disponíveis
npm run backup:list

# Limpar backups antigos (30+ dias)
npm run backup:cleanup
```

## 📁 Estrutura dos Scripts

```
scripts/
├── convert-images-to-webp.ts    # Conversão em lote
├── optimize-buckets.ts          # Otimização de buckets
├── setup-image-converter.js     # Configuração inicial
├── tsconfig.scripts.json       # Config TypeScript para scripts
└── README.md                   # Este arquivo
```

## 🔧 Configurações

### Qualidade WebP
- **Produtos**: 85% (alta qualidade)
- **Sabores**: 80% (qualidade média)
- **Thumbnails**: 75% (qualidade otimizada)

### Dimensões Máximas
- **Produtos**: 1920x1080px
- **Sabores**: 800x800px
- **Thumbnails**: 300x300px

### Buckets Supabase
- `product-images`: Imagens de produtos
- `product-flavor-images`: Imagens de sabores

## 📊 Relatórios

Após a conversão, você verá:

```
🎯 Conversão Concluída!
📊 Estatísticas:
   • Total de imagens: 150
   • Convertidas: 142
   • Ignoradas: 8 (já WebP)
   • Erros: 0
   • Economia total: 45.2 MB (67%)

💾 Backups criados em:
   • product-images/backup/
   • product-flavor-images/backup/

📝 Log detalhado: conversion-log-2025-01-XX.txt
```

## 🚨 Troubleshooting

### Erro: "Sharp não encontrado"
```bash
npm install sharp --save-dev
```

### Erro: "Variáveis de ambiente"
1. Verifique se `.env.local` existe
2. Confirme as variáveis do Supabase
3. Execute `npm run convert:setup`

### Erro: "Bucket não encontrado"
1. Execute `npm run optimize:buckets`
2. Verifique permissões no Supabase
3. Confirme a chave de serviço

### Erro: "TypeScript"
```bash
npm install typescript ts-node --save-dev
```

## 📈 Performance

### Economia Típica
- **JPEG → WebP**: 25-35%
- **PNG → WebP**: 50-80%
- **GIF → WebP**: 60-90%

### Velocidade
- **Conversão**: ~2-5 imagens/segundo
- **Upload**: Depende da conexão
- **Backup**: Paralelo ao upload

## 🔒 Segurança

- ✅ Backups automáticos
- ✅ Validação de arquivos
- ✅ Logs detalhados
- ✅ Rollback disponível
- ✅ Chaves de ambiente seguras

## 📞 Suporte

Para problemas:
1. Execute `npm run convert:setup`
2. Verifique logs de erro
3. Consulte a documentação principal
4. Contate a equipe de desenvolvimento

---

**Última atualização**: Janeiro 2025  
**Compatibilidade**: Node.js 16+, TypeScript 5+