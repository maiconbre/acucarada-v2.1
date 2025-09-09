-- Migração para adicionar campo de descrições por sabor
-- Criada em 27/01/2025
-- Adiciona campo JSON para mapear sabores às suas descrições específicas

BEGIN;

-- 1. Adicionar campo sabor_descriptions na tabela products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sabor_descriptions JSONB;

-- 2. Adicionar comentário para documentar o novo campo
COMMENT ON COLUMN public.products.sabor_descriptions IS 'JSON mapeando sabores para suas descrições específicas. Ex: {"chocolate": "Delicioso sabor chocolate...", "morango": "Sabor morango refrescante..."}';

-- 3. Criar índice GIN para consultas eficientes em JSONB
CREATE INDEX IF NOT EXISTS idx_products_sabor_descriptions 
ON public.products USING GIN(sabor_descriptions) 
WHERE sabor_descriptions IS NOT NULL;

-- 4. Atualizar a view product_analytics_summary para incluir o novo campo
DROP VIEW IF EXISTS public.product_analytics_summary;
CREATE VIEW public.product_analytics_summary AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.price,
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
ORDER BY p.name;

-- 5. Conceder acesso à view atualizada
GRANT SELECT ON public.product_analytics_summary TO authenticated;
GRANT SELECT ON public.product_analytics_summary TO anon;

-- 6. Atualizar a função get_product_complete_info para incluir sabor_descriptions (se existir)
DROP FUNCTION IF EXISTS public.get_product_complete_info(UUID);
CREATE OR REPLACE FUNCTION public.get_product_complete_info(product_id_param UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price NUMERIC,
  image_url TEXT,
  category TEXT,
  ingredientes TEXT,
  validade_armazenamento_dias INTEGER,
  sabores TEXT[],
  sabor_images JSONB,
  sabor_descriptions JSONB,
  is_featured BOOLEAN,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  total_likes BIGINT,
  total_shares BIGINT,
  total_clicks BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
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
    COALESCE(pa.total_clicks, 0) as total_clicks
  FROM products p
  LEFT JOIN product_analytics pa ON p.id = pa.product_id
  WHERE p.id = product_id_param
    AND p.is_active = true
    AND (p.deleted_at IS NULL OR p.deleted_at > NOW());
END;
$$;

-- 7. Conceder permissões para a função
GRANT EXECUTE ON FUNCTION public.get_product_complete_info(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_product_complete_info(UUID) TO anon;

COMMIT;