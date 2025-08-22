-- Migração para atualizar estrutura de produtos para usar category_id
-- Substitui o campo category TEXT por category_id UUID com referência à tabela categories

-- 1. Adicionar nova coluna category_id
ALTER TABLE public.products 
ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- 2. Criar função temporária para mapear categorias por nome
CREATE OR REPLACE FUNCTION map_category_name_to_id(category_name TEXT)
RETURNS UUID AS $$
DECLARE
  category_uuid UUID;
BEGIN
  -- Buscar categoria existente pelo nome
  SELECT id INTO category_uuid 
  FROM public.categories 
  WHERE name = category_name AND is_active = true;
  
  -- Se não encontrar, usar categoria "Outros" como fallback
  IF category_uuid IS NULL THEN
    SELECT id INTO category_uuid 
    FROM public.categories 
    WHERE name = 'Outros' AND is_active = true;
  END IF;
  
  -- Se ainda não encontrar, criar categoria "Outros" como subcategoria de "Pronta Entrega"
  IF category_uuid IS NULL THEN
    INSERT INTO public.categories (name, description, parent_id, delivery_type, is_master)
    VALUES (
      'Outros', 
      'Outros tipos de doces',
      (SELECT id FROM public.categories WHERE name = 'Pronta Entrega' AND is_master = true),
      'pronta_entrega',
      false
    )
    RETURNING id INTO category_uuid;
  END IF;
  
  RETURN category_uuid;
END;
$$ LANGUAGE plpgsql;

-- 3. Migrar dados existentes do campo category para category_id
UPDATE public.products 
SET category_id = map_category_name_to_id(category)
WHERE category_id IS NULL;

-- 4. Adicionar campos relacionados ao delivery_type no products
ALTER TABLE public.products 
ADD COLUMN delivery_type TEXT CHECK (delivery_type IN ('pronta_entrega', 'encomenda')) DEFAULT 'pronta_entrega',
ADD COLUMN preparation_time_days INTEGER DEFAULT 0;

-- 5. Atualizar delivery_type baseado na categoria
UPDATE public.products p
SET delivery_type = c.delivery_type
FROM public.categories c
WHERE p.category_id = c.id;

-- 6. Criar índices para performance
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_delivery_type ON public.products(delivery_type);
CREATE INDEX idx_products_is_featured_delivery ON public.products(is_featured, delivery_type) WHERE is_active = true;

-- 7. Criar função para obter produtos com informações de categoria
CREATE OR REPLACE FUNCTION get_products_with_category_info()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price DECIMAL(10,2),
  image_url TEXT,
  category_id UUID,
  category_name TEXT,
  parent_category_name TEXT,
  delivery_type TEXT,
  preparation_time_days INTEGER,
  is_featured BOOLEAN,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.image_url,
    p.category_id,
    c.name as category_name,
    pc.name as parent_category_name,
    p.delivery_type,
    p.preparation_time_days,
    p.is_featured,
    p.is_active,
    p.created_at,
    p.updated_at
  FROM public.products p
  LEFT JOIN public.categories c ON p.category_id = c.id
  LEFT JOIN public.categories pc ON c.parent_id = pc.id
  WHERE p.is_active = true
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 8. Criar função para obter produtos por tipo de entrega
CREATE OR REPLACE FUNCTION get_products_by_delivery_type(delivery_type_param TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price DECIMAL(10,2),
  image_url TEXT,
  category_name TEXT,
  parent_category_name TEXT,
  delivery_type TEXT,
  preparation_time_days INTEGER,
  is_featured BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.image_url,
    c.name as category_name,
    pc.name as parent_category_name,
    p.delivery_type,
    p.preparation_time_days,
    p.is_featured
  FROM public.products p
  LEFT JOIN public.categories c ON p.category_id = c.id
  LEFT JOIN public.categories pc ON c.parent_id = pc.id
  WHERE p.is_active = true 
    AND p.delivery_type = delivery_type_param
  ORDER BY p.is_featured DESC, p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 9. Criar trigger para sincronizar delivery_type quando categoria muda
CREATE OR REPLACE FUNCTION sync_product_delivery_type()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar delivery_type baseado na nova categoria
  IF NEW.category_id IS NOT NULL AND (OLD.category_id IS NULL OR NEW.category_id != OLD.category_id) THEN
    SELECT delivery_type INTO NEW.delivery_type
    FROM public.categories
    WHERE id = NEW.category_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_product_delivery_type_trigger ON public.products;
CREATE TRIGGER sync_product_delivery_type_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION sync_product_delivery_type();

-- 10. Remover função temporária
DROP FUNCTION IF EXISTS map_category_name_to_id(TEXT);

-- 11. Comentários para documentação
COMMENT ON COLUMN public.products.category_id IS 'Referência para a categoria do produto';
COMMENT ON COLUMN public.products.delivery_type IS 'Tipo de entrega herdado da categoria';
COMMENT ON COLUMN public.products.preparation_time_days IS 'Tempo de preparo em dias para produtos sob encomenda';

-- 12. Manter campo category por compatibilidade (será removido em migração futura)
-- Atualizar campo category com o nome da nova categoria para compatibilidade
UPDATE public.products p
SET category = c.name
FROM public.categories c
WHERE p.category_id = c.id;

-- Verificar a migração
SELECT 'Migração de estrutura de produtos concluída com sucesso!' as status;
SELECT COUNT(*) as produtos_migrados FROM public.products WHERE category_id IS NOT NULL;




-- Migração de reversão: Desfazer alterações na estrutura hierárquica de categorias
-- Esta migração reverte todas as mudanças feitas para implementar hierarquia de categorias

-- 1. Remover campos adicionados na tabela products (se existirem)
ALTER TABLE public.products 
DROP COLUMN IF EXISTS category_id,
DROP COLUMN IF EXISTS delivery_type,
DROP COLUMN IF EXISTS preparation_time_days;

-- 2. Garantir que o campo category seja TEXT (caso tenha sido alterado)
ALTER TABLE public.products 
ALTER COLUMN category TYPE TEXT;

-- 3. Remover campos hierárquicos da tabela categories (se existirem)
ALTER TABLE public.categories 
DROP COLUMN IF EXISTS parent_id,
DROP COLUMN IF EXISTS delivery_type,
DROP COLUMN IF EXISTS is_master,
DROP COLUMN IF EXISTS sort_order;

-- 4. Remover views criadas para hierarquia (se existirem)
DROP VIEW IF EXISTS public.products_with_category_hierarchy;
DROP VIEW IF EXISTS public.categories_with_hierarchy;

-- 5. Remover funções RPC criadas para hierarquia (se existirem)
DROP FUNCTION IF EXISTS public.get_categories_with_hierarchy();
DROP FUNCTION IF EXISTS public.get_category_statistics();
DROP FUNCTION IF EXISTS public.rebalance_product_categories();
DROP FUNCTION IF EXISTS public.classify_category_delivery_type(TEXT);

-- 6. Resetar categorias para o estado original
DELETE FROM public.categories;

-- Reinserir categorias originais
INSERT INTO public.categories (name, description) VALUES
  ('Brigadeiros', 'Brigadeiros tradicionais e gourmet'),
  ('Trufas', 'Trufas artesanais de diversos sabores'),
  ('Especiais', 'Doces especiais e edições limitadas'),
  ('Tradicionais', 'Doces tradicionais brasileiros'),
  ('Bolos', 'Bolos e tortas artesanais'),
  ('Outros', 'Outros tipos de doces');

-- 7. Atualizar produtos para usar apenas o campo category como TEXT
-- Garantir que todos os produtos tenham uma categoria válida
UPDATE public.products 
SET category = 'Outros' 
WHERE category IS NULL OR category = '';

-- 8. Remover constraints de foreign key relacionadas à hierarquia (se existirem)
ALTER TABLE public.products 
DROP CONSTRAINT IF EXISTS products_category_id_fkey;

ALTER TABLE public.categories 
DROP CONSTRAINT IF EXISTS categories_parent_id_fkey;

-- 9. Remover índices criados para hierarquia (se existirem)
DROP INDEX IF EXISTS idx_categories_parent_id;
DROP INDEX IF EXISTS idx_categories_delivery_type;
DROP INDEX IF EXISTS idx_products_category_id;
DROP INDEX IF EXISTS idx_products_delivery_type;

-- Comentário de confirmação
-- Esta migração reverte completamente a estrutura hierárquica de categorias
-- Retornando ao estado original com:
-- - categories: id, name, description, is_active, created_at, updated_at
-- - products: id, name, description, price, image_url, category (TEXT), is_featured, is_active, created_at, updated_at

SELECT 'Reversão da estrutura hierárquica de categorias concluída com sucesso!' as status;