# 🗑️ Guia Completo: Exclusão de Produtos no Supabase

## 📋 Problema

Ao tentar excluir um produto da tabela `products`, você recebe o erro:

```
Erro 409 (Conflict) - Código 23503
"insert or update on table 'product_analytics' violates foreign key constraint 'product_analytics_product_id_fkey'"
```

Este erro indica que existem registros nas tabelas relacionadas (`product_analytics`, `product_likes`, `product_views`, `product_clicks`) que dependem do produto que você está tentando excluir.

## 🎯 Soluções Disponíveis

### 1. 🚀 Solução Recomendada: ON DELETE CASCADE

**O que é:** Configura o banco de dados para automaticamente excluir registros relacionados quando o produto pai é excluído.

**Vantagens:**
- ✅ Mais rápido e eficiente
- ✅ Automático, sem código adicional
- ✅ Garante consistência dos dados
- ✅ Menos propenso a erros

**Como implementar:**

1. Execute o script SQL no Supabase SQL Editor:

```sql
-- Ativar ON DELETE CASCADE nas chaves estrangeiras
ALTER TABLE product_analytics 
DROP CONSTRAINT IF EXISTS product_analytics_product_id_fkey,
ADD CONSTRAINT product_analytics_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE;

ALTER TABLE product_likes 
DROP CONSTRAINT IF EXISTS product_likes_product_id_fkey,
ADD CONSTRAINT product_likes_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE;

ALTER TABLE product_views 
DROP CONSTRAINT IF EXISTS product_views_product_id_fkey,
ADD CONSTRAINT product_views_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE;

ALTER TABLE product_clicks 
DROP CONSTRAINT IF EXISTS product_clicks_product_id_fkey,
ADD CONSTRAINT product_clicks_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE;
```

2. Use no JavaScript/TypeScript:

```typescript
export async function deleteProductWithCascade(productId: string) {
  try {
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Usuário não autenticado');
    }
    
    // Com CASCADE configurado, apenas excluir o produto
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (error) {
      if (error.code === '23503') {
        throw new Error('ON DELETE CASCADE não está configurado. Execute o script SQL primeiro.');
      }
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}
```

### 2. 🔒 Solução Segura: Função SQL com Transação

**O que é:** Usa uma função SQL que executa todas as exclusões em uma transação.

**Vantagens:**
- ✅ Muito seguro (tudo ou nada)
- ✅ Melhor performance que exclusão manual
- ✅ Logs detalhados
- ✅ Rollback automático em caso de erro

**Como implementar:**

1. Execute a função SQL (arquivo `delete_product_safely.sql`):

```sql
CREATE OR REPLACE FUNCTION delete_product_safely(p_product_id UUID)
RETURNS boolean AS $$
BEGIN
    -- Verificações e exclusões em transação
    DELETE FROM product_analytics WHERE product_id = p_product_id;
    DELETE FROM product_likes WHERE product_id = p_product_id;
    DELETE FROM product_views WHERE product_id = p_product_id;
    DELETE FROM product_clicks WHERE product_id = p_product_id;
    DELETE FROM products WHERE id = p_product_id;
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao excluir produto %: %', p_product_id, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

2. Use no JavaScript/TypeScript:

```typescript
export async function deleteProductWithTransaction(productId: string) {
  try {
    const { data, error } = await supabase.rpc('delete_product_safely', {
      p_product_id: productId
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}
```

### 3. 🛠️ Solução Manual: Exclusão Passo a Passo

**O que é:** Exclui manualmente cada tabela relacionada antes de excluir o produto.

**Vantagens:**
- ✅ Controle total sobre o processo
- ✅ Funciona sem modificar o banco
- ✅ Útil para debugging

**Desvantagens:**
- ❌ Mais lento
- ❌ Mais código para manter
- ❌ Risco de inconsistência se falhar no meio

**Como implementar:**

```typescript
export async function deleteProductManual(productId: string) {
  try {
    // 1. Excluir product_analytics
    const { error: analyticsError } = await supabase
      .from('product_analytics')
      .delete()
      .eq('product_id', productId);
    
    if (analyticsError) throw analyticsError;
    
    // 2. Excluir product_likes
    const { error: likesError } = await supabase
      .from('product_likes')
      .delete()
      .eq('product_id', productId);
    
    if (likesError) throw likesError;
    
    // 3. Excluir product_views
    const { error: viewsError } = await supabase
      .from('product_views')
      .delete()
      .eq('product_id', productId);
    
    if (viewsError) throw viewsError;
    
    // 4. Excluir product_clicks
    const { error: clicksError } = await supabase
      .from('product_clicks')
      .delete()
      .eq('product_id', productId);
    
    if (clicksError) throw clicksError;
    
    // 5. Excluir o produto
    const { error: productError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (productError) throw productError;
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}
```

### 4. 👁️ Solução Alternativa: Soft Delete (Recomendada)

**O que é:** Em vez de excluir, apenas marca o produto como inativo.

**Vantagens:**
- ✅ Preserva dados históricos
- ✅ Permite "desfazer" a exclusão
- ✅ Mantém integridade dos analytics
- ✅ Mais seguro para dados importantes

**Como implementar:**

```typescript
export async function deactivateProduct(productId: string) {
  try {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', productId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}
```

## 🎯 Estratégia Recomendada

### Para Implementação Imediata:

1. **Configure ON DELETE CASCADE** (Solução 1)
2. **Use Soft Delete** para produtos importantes (Solução 4)
3. **Mantenha a função de transação** como backup (Solução 2)

### Código de Exemplo Completo:

```typescript
// Função principal que escolhe a melhor estratégia
export async function deleteProductSafely(
  productId: string, 
  strategy: 'cascade' | 'transaction' | 'manual' | 'deactivate' = 'cascade'
) {
  // Verificar se o produto existe
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();
  
  if (fetchError || !product) {
    return { success: false, error: 'Produto não encontrado' };
  }
  
  // Executar estratégia escolhida
  switch (strategy) {
    case 'cascade':
      return await deleteProductWithCascade(productId);
    case 'transaction':
      return await deleteProductWithTransaction(productId);
    case 'manual':
      return await deleteProductManual(productId);
    case 'deactivate':
      return await deactivateProduct(productId);
    default:
      return { success: false, error: 'Estratégia inválida' };
  }
}

// Uso no componente
const handleDelete = async (productId: string) => {
  // Tentar CASCADE primeiro
  let result = await deleteProductSafely(productId, 'cascade');
  
  // Se falhar, tentar transação
  if (!result.success && result.error?.includes('CASCADE')) {
    result = await deleteProductSafely(productId, 'transaction');
  }
  
  // Se ainda falhar, sugerir desativação
  if (!result.success) {
    const useDeactivation = confirm(
      'Não foi possível excluir. Deseja desativar o produto?'
    );
    
    if (useDeactivation) {
      result = await deleteProductSafely(productId, 'deactivate');
    }
  }
  
  // Mostrar resultado
  if (result.success) {
    toast({ title: 'Sucesso!', description: 'Produto processado.' });
    onProductsChange();
  } else {
    toast({ 
      title: 'Erro', 
      description: result.error,
      variant: 'destructive' 
    });
  }
};
```

## 🔧 Scripts de Configuração

### 1. Configurar CASCADE (execute no Supabase SQL Editor):

```bash
# Arquivo: enable_cascade_delete.sql
```

### 2. Criar funções auxiliares:

```bash
# Arquivo: delete_product_safely.sql
```

### 3. Verificar configuração:

```sql
-- Verificar se CASCADE está ativo
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc 
    ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name IN ('product_analytics', 'product_likes', 'product_views', 'product_clicks')
    AND tc.constraint_type = 'FOREIGN KEY';
```

## 🛡️ Boas Práticas

### ✅ Faça Sempre:

1. **Configure ON DELETE CASCADE** nas chaves estrangeiras
2. **Use transações** para operações críticas
3. **Implemente soft delete** para dados importantes
4. **Teste em ambiente de desenvolvimento** primeiro
5. **Mantenha backups** antes de exclusões em massa
6. **Use políticas RLS** para controlar acesso
7. **Implemente logs de auditoria**
8. **Monitore performance** em tabelas grandes

### ❌ Evite:

1. **Exclusões sem verificação** de dados relacionados
2. **Operações sem transação** em múltiplas tabelas
3. **Exclusão hard delete** de dados históricos importantes
4. **Ignorar erros** de chave estrangeira
5. **Não testar** estratégias de exclusão
6. **Exclusões em massa** sem backup
7. **Modificar constraints** em produção sem teste

## 🚨 Tratamento de Erros

### Códigos de Erro Comuns:

- **23503**: Violação de chave estrangeira
- **409**: Conflito de dados
- **42P01**: Tabela não existe
- **42501**: Permissão negada

### Exemplo de Tratamento:

```typescript
const handleError = (error: any) => {
  if (error.code === '23503') {
    return 'Produto possui dados relacionados. Configure CASCADE ou use exclusão manual.';
  }
  
  if (error.message.includes('409')) {
    return 'Conflito de dados. Tente novamente ou use soft delete.';
  }
  
  if (error.message.includes('permission')) {
    return 'Você não tem permissão para esta operação.';
  }
  
  return error.message || 'Erro desconhecido';
};
```

## 📊 Monitoramento

### Verificar Dados Órfãos:

```sql
-- Encontrar registros órfãos
SELECT 'product_analytics' as tabela, COUNT(*) as orfaos
FROM product_analytics pa
LEFT JOIN products p ON pa.product_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 'product_likes' as tabela, COUNT(*) as orfaos
FROM product_likes pl
LEFT JOIN products p ON pl.product_id = p.id
WHERE p.id IS NULL;
```

### Limpar Dados Órfãos:

```sql
-- Use a função cleanup_orphaned_analytics()
SELECT cleanup_orphaned_analytics();
```

## 📞 Suporte

Se encontrar problemas:

1. Verifique se executou os scripts SQL
2. Confirme as permissões do usuário
3. Teste com um produto sem dados relacionados
4. Consulte os logs do Supabase
5. Use a estratégia de soft delete como fallback

---

**Arquivos de Referência:**
- `exemplo-exclusao-produto.ts` - Código TypeScript completo
- `delete_product_safely.sql` - Funções SQL
- `enable_cascade_delete.sql` - Configuração CASCADE
- `ProductManagement-melhorado.tsx` - Componente React exemplo

**Data de criação:** $(date)
**Versão:** 1.0