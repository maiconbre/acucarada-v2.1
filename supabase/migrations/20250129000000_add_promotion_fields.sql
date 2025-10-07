-- Migração para adicionar campos de promoção aos produtos
-- Criada em 29/01/2025
-- Adiciona campos para preço promocional e status de promoção

BEGIN;

-- 1. Adicionar novos campos na tabela products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_promotion BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS promotional_price DECIMAL(10,2) DEFAULT NULL;

-- 2. Adicionar comentários para documentar os novos campos
COMMENT ON COLUMN public.products.is_promotion IS 'Indica se o produto está em promoção';
COMMENT ON COLUMN public.products.promotional_price IS 'Preço promocional do produto (quando em promoção)';

-- 3. Adicionar constraint para garantir que preço promocional seja menor que preço normal quando informado
ALTER TABLE public.products 
ADD CONSTRAINT check_promotional_price_valid 
CHECK (
  promotional_price IS NULL OR 
  (promotional_price > 0 AND promotional_price < price)
);

-- 4. Adicionar constraint para garantir que se is_promotion for true, promotional_price deve estar preenchido
ALTER TABLE public.products 
ADD CONSTRAINT check_promotion_consistency 
CHECK (
  (is_promotion = FALSE) OR 
  (is_promotion = TRUE AND promotional_price IS NOT NULL)
);

-- 5. Criar índice para consultas por produtos em promoção
CREATE INDEX IF NOT EXISTS idx_products_promotion 
ON public.products(is_promotion, promotional_price) 
WHERE is_promotion = TRUE;

-- 6. Atualizar a view product_analytics_summary para incluir os novos campos
DROP VIEW IF EXISTS public.product_analytics_summary;
CREATE VIEW public.product_analytics_summary AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.price,
  p.promotional_price,
  p.is_promotion,
  p.image_url,
  p.category,
  p.ingredientes,
  p.validade_armazenamento_dias,
  p.sabores,
  p.sabor_images,
  p.sabor_descriptions,
  p.is_featured,
  p.is_active,
  p.created_at,
  p.updated_at,
  COALESCE(pa.total_likes, 0) as total_likes,
  COALESCE(pa.total_shares, 0) as total_shares,
  COALESCE(pa.total_clicks, 0) as total_clicks,
  0 as unique_viewers
FROM products p
LEFT JOIN product_analytics pa ON p.id = pa.product_id
ORDER BY 
  p.is_promotion DESC,  -- Produtos em promoção primeiro
  p.is_featured DESC,   -- Depois produtos em destaque
  p.name;               -- Por último, ordem alfabética

-- 7. Conceder acesso à view atualizada
GRANT SELECT ON public.product_analytics_summary TO authenticated;
GRANT SELECT ON public.product_analytics_summary TO anon;

-- 8. Atualizar função RPC para buscar produtos com informações completas
CREATE OR REPLACE FUNCTION public.get_product_complete_info(product_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price DECIMAL(10,2),
  promotional_price DECIMAL(10,2),
  is_promotion BOOLEAN,
  image_url TEXT,
  category TEXT,
  ingredientes TEXT,
  validade_armazenamento_dias INTEGER,
  sabores TEXT[],
  sabor_images JSON,
  sabor_descriptions JSON,
  is_featured BOOLEAN,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  total_likes INTEGER,
  total_shares INTEGER,
  total_clicks INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.promotional_price,
    p.is_promotion,
    p.image_url,
    p.category,
    p.ingredientes,
    p.validade_armazenamento_dias,
    p.sabores,
    p.sabor_images,
    p.sabor_descriptions,
    p.is_featured,
    p.is_active,
    p.created_at,
    p.updated_at,
    COALESCE(pa.total_likes, 0)::INTEGER as total_likes,
    COALESCE(pa.total_shares, 0)::INTEGER as total_shares,
    COALESCE(pa.total_clicks, 0)::INTEGER as total_clicks
  FROM public.products p
  LEFT JOIN public.product_analytics pa ON p.id = pa.product_id
  WHERE p.id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Criar função para buscar produtos ordenados por promoção
CREATE OR REPLACE FUNCTION public.get_products_ordered_by_promotion()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price DECIMAL(10,2),
  promotional_price DECIMAL(10,2),
  is_promotion BOOLEAN,
  image_url TEXT,
  category TEXT,
  ingredientes TEXT,
  validade_armazenamento_dias INTEGER,
  sabores TEXT[],
  sabor_images JSON,
  sabor_descriptions JSON,
  is_featured BOOLEAN,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.promotional_price,
    p.is_promotion,
    p.image_url,
    p.category,
    p.ingredientes,
    p.validade_armazenamento_dias,
    p.sabores,
    p.sabor_images,
    p.sabor_descriptions,
    p.is_featured,
    p.is_active,
    p.created_at,
    p.updated_at
  FROM public.products p
  WHERE p.is_active = TRUE
  ORDER BY 
    p.is_promotion DESC,  -- Produtos em promoção primeiro
    p.is_featured DESC,   -- Depois produtos em destaque
    p.name;               -- Por último, ordem alfabética
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Conceder permissões para as funções
GRANT EXECUTE ON FUNCTION public.get_product_complete_info(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_product_complete_info(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_products_ordered_by_promotion() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_products_ordered_by_promotion() TO anon;

COMMIT;

-- Verificar se a migração foi aplicada corretamente
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('is_promotion', 'promotional_price')
ORDER BY column_name;