-- Migração para adicionar campos de ingredientes e validade de armazenamento
-- Criada em 25/01/2025
-- Adiciona campos opcionais para melhorar as informações dos produtos

BEGIN;

-- 1. Adicionar novos campos na tabela products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS ingredientes TEXT,
ADD COLUMN IF NOT EXISTS validade_armazenamento_dias INTEGER;

-- 2. Adicionar comentários para documentar os novos campos
COMMENT ON COLUMN public.products.ingredientes IS 'Lista de ingredientes do produto (campo opcional)';
COMMENT ON COLUMN public.products.validade_armazenamento_dias IS 'Validade para armazenamento em dias (campo opcional)';

-- 3. Adicionar constraint para garantir que validade seja positiva quando informada
ALTER TABLE public.products 
ADD CONSTRAINT check_validade_positiva 
CHECK (validade_armazenamento_dias IS NULL OR validade_armazenamento_dias > 0);

-- 4. Criar índice para consultas por validade (útil para relatórios)
CREATE INDEX IF NOT EXISTS idx_products_validade 
ON public.products(validade_armazenamento_dias) 
WHERE validade_armazenamento_dias IS NOT NULL;

-- 5. Atualizar a view product_analytics_summary para incluir os novos campos (se existir)
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

-- 6. Conceder acesso à view atualizada
GRANT SELECT ON public.product_analytics_summary TO authenticated;
GRANT SELECT ON public.product_analytics_summary TO anon;

-- 7. Criar função RPC para buscar produtos com informações completas
CREATE OR REPLACE FUNCTION public.get_product_complete_info(product_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price DECIMAL(10,2),
  image_url TEXT,
  category TEXT,
  ingredientes TEXT,
  validade_armazenamento_dias INTEGER,
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
    p.image_url,
    p.category,
    p.ingredientes,
    p.validade_armazenamento_dias,
    p.is_featured,
    p.is_active,
    p.created_at,
    p.updated_at,
    COALESCE(pa.total_likes, 0)::INTEGER as total_likes,
    COALESCE(pa.total_shares, 0)::INTEGER as total_shares,
    COALESCE(pa.total_clicks, 0)::INTEGER as total_clicks
  FROM public.products p
  LEFT JOIN public.product_analytics pa ON p.id = pa.product_id
  WHERE p.id = product_id AND p.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Conceder acesso à função
GRANT EXECUTE ON FUNCTION public.get_product_complete_info(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_product_complete_info(UUID) TO anon;

-- 9. Adicionar comentário na função
COMMENT ON FUNCTION public.get_product_complete_info IS 'Retorna informações completas de um produto incluindo analytics e novos campos';

COMMIT;

-- Mensagem de sucesso
SELECT 'Migração de campos de detalhes do produto concluída com sucesso!' as status;
SELECT 'Campos adicionados: ingredientes, validade_armazenamento_dias' as details;
SELECT 'View e função RPC atualizadas para incluir os novos campos' as info;