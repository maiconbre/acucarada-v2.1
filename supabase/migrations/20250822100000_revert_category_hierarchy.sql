-- Migração de reversão: Desfazer alterações na estrutura hierárquica de categorias
-- Esta migração reverte todas as mudanças feitas para implementar hierarquia de categorias
-- Baseada nas alterações encontradas no arquivo 2.ultimos.arquivos.sql

-- 1. Remover trigger e função de sincronização criados
DROP TRIGGER IF EXISTS sync_product_delivery_type_trigger ON public.products;
DROP FUNCTION IF EXISTS sync_product_delivery_type();

-- 2. Remover funções RPC criadas especificamente
DROP FUNCTION IF EXISTS public.get_products_with_category_info();
DROP FUNCTION IF EXISTS public.get_products_by_delivery_type(TEXT);
DROP FUNCTION IF EXISTS public.get_categories_with_hierarchy();
DROP FUNCTION IF EXISTS public.get_category_statistics();
DROP FUNCTION IF EXISTS public.rebalance_product_categories();
DROP FUNCTION IF EXISTS public.classify_category_delivery_type(TEXT);

-- 3. Remover índices criados para hierarquia
DROP INDEX IF EXISTS idx_products_category_id;
DROP INDEX IF EXISTS idx_products_delivery_type;
DROP INDEX IF EXISTS idx_products_is_featured_delivery;
DROP INDEX IF EXISTS idx_categories_parent_id;
DROP INDEX IF EXISTS idx_categories_delivery_type;

-- 4. Remover comentários das colunas
COMMENT ON COLUMN public.products.category_id IS NULL;
COMMENT ON COLUMN public.products.delivery_type IS NULL;
COMMENT ON COLUMN public.products.preparation_time_days IS NULL;

-- 5. Remover campos adicionados na tabela products (usando CASCADE para dependências)
ALTER TABLE public.products 
DROP COLUMN IF EXISTS category_id CASCADE,
DROP COLUMN IF EXISTS delivery_type CASCADE,
DROP COLUMN IF EXISTS preparation_time_days CASCADE;

-- 6. Remover campos hierárquicos da tabela categories (usando CASCADE para dependências)
ALTER TABLE public.categories 
DROP COLUMN IF EXISTS parent_id CASCADE,
DROP COLUMN IF EXISTS delivery_type CASCADE,
DROP COLUMN IF EXISTS is_master CASCADE,
DROP COLUMN IF EXISTS sort_order CASCADE;

-- 7. Remover views criadas para hierarquia (se existirem)
DROP VIEW IF EXISTS public.products_with_category_hierarchy;
DROP VIEW IF EXISTS public.categories_with_hierarchy;

-- 8. Garantir que o campo category seja TEXT (caso tenha sido alterado)
ALTER TABLE public.products 
ALTER COLUMN category TYPE TEXT;

-- 9. Atualizar produtos para usar apenas o campo category como TEXT
-- Garantir que todos os produtos tenham uma categoria válida
UPDATE public.products 
SET category = 'Outros' 
WHERE category IS NULL OR category = '';

-- 10. Remover constraints de foreign key relacionadas à hierarquia (se existirem)
ALTER TABLE public.products 
DROP CONSTRAINT IF EXISTS products_category_id_fkey;

ALTER TABLE public.categories 
DROP CONSTRAINT IF EXISTS categories_parent_id_fkey;

-- 11. Resetar categorias para o estado original (apenas se necessário)
-- Verificar se existem categorias com campos hierárquicos antes de resetar
DO $$
BEGIN
  -- Só resetar se existirem categorias com estrutura hierárquica
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' 
    AND column_name IN ('parent_id', 'delivery_type', 'is_master')
  ) THEN
    DELETE FROM public.categories;
    
    -- Reinserir categorias originais
    INSERT INTO public.categories (name, description) VALUES
      ('Brigadeiros', 'Brigadeiros tradicionais e gourmet'),
      ('Trufas', 'Trufas artesanais de diversos sabores'),
      ('Especiais', 'Doces especiais e edições limitadas'),
      ('Tradicionais', 'Doces tradicionais brasileiros'),
      ('Bolos', 'Bolos e tortas artesanais'),
      ('Outros', 'Outros tipos de doces');
  END IF;
END $$;

-- Comentário de confirmação
-- Esta migração reverte completamente a estrutura hierárquica de categorias
-- Retornando ao estado original com:
-- - categories: id, name, description, is_active, created_at, updated_at
-- - products: id, name, description, price, image_url, category (TEXT), is_featured, is_active, created_at, updated_at

SELECT 'Reversão da estrutura hierárquica de categorias concluída com sucesso!' as status;