-- Migração para adicionar campo de sabores aos produtos
-- Criada em 25/01/2025
-- Adiciona campo opcional para sabores disponíveis do produto

BEGIN;

-- 1. Adicionar novo campo sabores na tabela products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sabores TEXT[];

-- 2. Adicionar comentário para documentar o novo campo
COMMENT ON COLUMN public.products.sabores IS 'Array de sabores disponíveis para o produto (campo opcional). Ex: ["maracujá", "morango", "uva"]';

-- 3. Criar índice GIN para consultas eficientes em arrays de sabores
CREATE INDEX IF NOT EXISTS idx_products_sabores 
ON public.products USING GIN(sabores) 
WHERE sabores IS NOT NULL;

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

-- 6. Atualizar a função get_product_complete_info para incluir sabores (se existir)
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
    p.is_featured,
    p.is_active,
    p.created_at,
    p.updated_at,
    COALESCE(pa.total_likes, 0) as total_likes,
    COALESCE(pa.total_shares, 0) as total_shares,
    COALESCE(pa.total_clicks, 0) as total_clicks
  FROM products p
  LEFT JOIN product_analytics pa ON p.id = pa.product_id
  WHERE p.id = product_id_param AND p.is_active = true;
END;
$$;

-- 7. Conceder acesso à função
GRANT EXECUTE ON FUNCTION public.get_product_complete_info(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_product_complete_info(UUID) TO anon;

COMMIT;

-- Exemplos de uso:
-- INSERT INTO products (name, description, price, category, sabores) 
-- VALUES ('Bom Bom de Chocolate', 'Delicioso bombom artesanal', 5.50, 'Doces', ARRAY['maracujá', 'morango', 'uva']);

-- SELECT * FROM products WHERE 'morango' = ANY(sabores);
-- SELECT * FROM products WHERE sabores && ARRAY['maracujá', 'uva'];