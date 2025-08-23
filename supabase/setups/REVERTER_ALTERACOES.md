# Como Reverter as Alterações da Estrutura Hierárquica de Categorias

Este guia explica como reverter todas as alterações feitas na estrutura hierárquica de categorias e retornar ao estado original do banco de dados.

## ⚠️ IMPORTANTE - BACKUP

Antes de executar qualquer reversão, **SEMPRE** faça um backup do seu banco de dados:

```bash
# Fazer backup do banco (substitua pelos seus dados)
pg_dump -h seu-host -U seu-usuario -d seu-banco > backup_antes_reversao.sql
```

## 📋 O que será revertido

A reversão irá desfazer (baseado no arquivo `2.ultimos.arquivos.sql`):

1. **Campos adicionados na tabela `products`:**
   - `category_id` (UUID com referência à tabela categories)
   - `delivery_type` (TEXT com check constraint)
   - `preparation_time_days` (INTEGER)

2. **Campos adicionados na tabela `categories`:**
   - `parent_id` (UUID)
   - `delivery_type` (enum)
   - `sort_order` (integer)

3. **Funções RPC criadas:**
   - `get_products_with_category_info()`
   - `get_products_by_delivery_type(TEXT)`
   - `sync_product_delivery_type()`
   - `get_categories_with_hierarchy()`
   - `get_category_statistics()`
   - `rebalance_product_categories()`
   - `classify_category_delivery_type()`

4. **Triggers criados:**
   - `sync_product_delivery_type_trigger`

5. **Índices criados:**
   - `idx_products_category_id`
   - `idx_products_delivery_type`
   - `idx_products_is_featured_delivery`
   - `idx_categories_parent_id`
   - `idx_categories_delivery_type`

6. **Views criadas:**
   - `products_with_category_hierarchy`
   - `categories_with_hierarchy`

7. **Comentários de colunas e constraints relacionados à hierarquia**

## 🚀 Como aplicar a reversão

### Opção 1: Usando Supabase CLI (Recomendado)

```bash
# 1. Navegar para o diretório do projeto
cd c:/Users/Acer/Documents/GitHub/doce-conecta-digital

# 2. Aplicar a migração de reversão
supabase db push

# 3. Verificar se foi aplicada corretamente
supabase db diff
```

### Opção 2: Aplicar manualmente via SQL

1. **Conecte-se ao seu banco Supabase**
2. **Execute o arquivo de reversão:**
   ```sql
   -- Copie e cole o conteúdo do arquivo:
   -- 20250822100000_revert_category_hierarchy.sql
   ```

3. **Execute o arquivo de verificação:**
   ```sql
   -- Copie e cole o conteúdo do arquivo:
   -- 20250822100100_verify_revert_status.sql
   ```

### Opção 3: Via Dashboard Supabase

1. Acesse o Dashboard do Supabase
2. Vá para **Database > SQL Editor**
3. Cole o conteúdo do arquivo `20250822100000_revert_category_hierarchy.sql`
4. Execute o script
5. Cole e execute o arquivo de verificação `20250822100100_verify_revert_status.sql`

## ✅ Verificação pós-reversão

O script de verificação `20250822100100_verify_revert_status.sql` irá confirmar automaticamente:

1. **Estrutura das tabelas está correta:**
   - `categories`: apenas `id`, `name`, `description`, `is_active`, `created_at`, `updated_at`
   - `products`: apenas `id`, `name`, `description`, `price`, `image_url`, `category` (TEXT), `is_featured`, `is_active`, `created_at`, `updated_at`

2. **Campos hierárquicos foram removidos:**
   - Nenhum campo `category_id`, `delivery_type`, `preparation_time_days` em `products`
   - Nenhum campo `parent_id`, `delivery_type`, `sort_order` em `categories`

3. **Funções RPC específicas foram removidas:**
   - `get_products_with_category_info()`, `get_products_by_delivery_type()`, etc.

4. **Índices hierárquicos foram removidos:**
   - `idx_products_category_id`, `idx_products_delivery_type`, etc.

5. **Triggers foram removidos:**
   - `sync_product_delivery_type_trigger`

6. **Views hierárquicas foram removidas**

7. **Categorias padrão existem (se necessário):**
   - Brigadeiros, Trufas, Especiais, Tradicionais, Bolos, Outros

8. **Todos os produtos têm categoria válida**

## 🔄 Próximos passos

Após a reversão do banco de dados, você também precisará:

1. **Reverter alterações no código TypeScript:**
   - Restaurar `src/types/database.ts` para a versão original
   - Remover `src/types/categories.ts`
   - Reverter componentes `CategoryManagement.tsx` e `ProductManagement.tsx`

2. **Testar a aplicação:**
   - Verificar se o gerenciamento de categorias funciona
   - Verificar se o gerenciamento de produtos funciona
   - Testar a exibição no catálogo

## 📞 Suporte

Se encontrar problemas durante a reversão:

1. Verifique os logs de erro
2. Consulte o backup feito antes da reversão
3. Execute novamente o script de verificação

---

**Data de criação:** $(date)
**Arquivos de migração:**
- `20250822100000_revert_category_hierarchy.sql`
- `20250822100100_verify_revert_status.sql`