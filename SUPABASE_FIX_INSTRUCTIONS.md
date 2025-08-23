# Instruções para Resolver Erros 406 do Supabase

## Problema Identificado
Os erros `406 (Not Acceptable)` nas requisições para `product_likes` indicam que:
1. As tabelas de analytics podem não existir no banco de dados
2. As políticas de segurança (RLS) podem estar bloqueando as requisições
3. As funções necessárias podem não estar criadas

## Solução

### Passo 1: Executar Script de Criação das Tabelas
1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Vá para o projeto: `yqzqybxtuatjfbwphvvo`
3. Navegue para **SQL Editor**
4. Execute o conteúdo do arquivo `create_missing_analytics_tables.sql`

### Passo 2: Verificar se as Tabelas Foram Criadas
Após executar o script, verifique se as seguintes tabelas existem:
- `product_likes`
- `product_views` 
- `product_clicks`
- `product_analytics`

### Passo 3: Verificar Políticas de Segurança
Certifique-se de que as seguintes políticas estão ativas:

**Para product_likes:**
- `Anyone can view likes` (SELECT)
- `Anyone can insert likes` (INSERT)
- `Users can delete own likes` (DELETE)

**Para product_views:**
- `Anyone can view analytics` (SELECT)
- `Anyone can insert views` (INSERT)

**Para product_clicks:**
- `Anyone can view clicks` (SELECT)
- `Anyone can insert clicks` (INSERT)

### Passo 4: Verificar Funções
Certifique-se de que as seguintes funções existem:
- `toggle_product_like()`
- `track_product_view()`
- `track_product_click()`
- `update_product_analytics()`

### Passo 5: Testar a Aplicação
Após executar o script:
1. Reinicie o servidor de desenvolvimento
2. Teste a funcionalidade de curtir produtos
3. Verifique se os erros 406 foram resolvidos

## Arquivos Relacionados
- `create_missing_analytics_tables.sql` - Script completo de criação
- `src/hooks/useProductAnalytics.ts` - Hook que faz as requisições
- `src/integrations/supabase/types.ts` - Tipos das tabelas

## Observações
- O erro pode estar relacionado ao fato de que as tabelas não existem no banco de dados de produção
- As políticas de RLS precisam permitir acesso anônimo para funcionalidades básicas
- As funções SQL são necessárias para operações complexas como toggle de likes