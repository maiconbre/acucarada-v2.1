-- Migração para remover completamente o sistema de tracking de views
-- Criada em 24/01/2025
-- Remove tabela product_views e todas as suas dependências

BEGIN;

-- 1. Remover triggers relacionados a product_views
DROP TRIGGER IF EXISTS trigger_views_analytics ON public.product_views;

-- 2. Remover políticas RLS da tabela product_views
DROP POLICY IF EXISTS "Anyone can insert views" ON public.product_views;
DROP POLICY IF EXISTS "Users can view their own views" ON public.product_views;
DROP POLICY IF EXISTS "Anyone can view analytics" ON public.product_views;

-- 3. Remover índices da tabela product_views
DROP INDEX IF EXISTS public.idx_product_views_product_id;
DROP INDEX IF EXISTS public.idx_product_views_user_id;
DROP INDEX IF EXISTS public.idx_product_views_session_id;
DROP INDEX IF EXISTS public.idx_product_views_created_at;

-- 4. Remover função track_product_view (se existir)
-- Função já foi removida ou nunca existiu

-- 5. Atualizar função update_product_analytics para remover referências a views
CREATE OR REPLACE FUNCTION public.update_product_analytics(p_product_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.product_analytics (product_id, total_likes, total_shares, total_clicks, unique_viewers)
  SELECT 
    p_product_id,
    COALESCE(likes.count, 0) as total_likes,
    COALESCE(shares.count, 0) as total_shares,
    COALESCE(clicks.count, 0) as total_clicks,
    0 as unique_viewers -- Removido tracking de views
  FROM (
    SELECT COUNT(*) as count 
    FROM public.product_likes 
    WHERE product_id = p_product_id
  ) likes
  CROSS JOIN (
    SELECT COUNT(*) as count 
    FROM public.product_shares 
    WHERE product_id = p_product_id
  ) shares
  CROSS JOIN (
    SELECT COUNT(*) as count 
    FROM public.product_clicks 
    WHERE product_id = p_product_id
  ) clicks
  ON CONFLICT (product_id) DO UPDATE SET
    total_likes = EXCLUDED.total_likes,
    total_shares = EXCLUDED.total_shares,
    total_clicks = EXCLUDED.total_clicks,
    unique_viewers = 0, -- Sempre 0 agora
    last_updated = now();
END;
$$ LANGUAGE plpgsql;

-- 6. Atualizar coluna unique_viewers para 0 em todos os registros existentes
UPDATE public.product_analytics SET unique_viewers = 0;

-- 7. Remover coluna total_views da tabela product_analytics (se existir)
ALTER TABLE public.product_analytics DROP COLUMN IF EXISTS total_views;

-- 8. Remover a tabela product_views
DROP TABLE IF EXISTS public.product_views CASCADE;

-- 9. Revogar permissões relacionadas à função removida
-- Função já foi removida ou nunca existiu

-- 10. Atualizar view product_analytics_summary (se existir)
DROP VIEW IF EXISTS public.product_analytics_summary;
CREATE OR REPLACE VIEW public.product_analytics_summary AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.category as product_category,
  p.price as product_price,
  p.is_active as product_is_active,
  COALESCE(pa.total_likes, 0) as total_likes,
  COALESCE(pa.total_shares, 0) as total_shares,
  COALESCE(pa.total_clicks, 0) as total_clicks,
  0 as unique_viewers, -- Sempre 0 agora
  p.created_at as analytics_created_at,
  p.updated_at as analytics_updated_at
FROM products p
LEFT JOIN product_analytics pa ON p.id = pa.product_id
ORDER BY p.name;

-- Conceder acesso à view atualizada
GRANT SELECT ON public.product_analytics_summary TO authenticated;

-- 11. Comentários sobre a migração
COMMENT ON TABLE public.product_analytics IS 'Tabela de analytics de produtos - tracking de views removido em 24/01/2025';

COMMIT;

-- Mensagem de sucesso
SELECT 'Migração de remoção do tracking de views concluída com sucesso!' as status;
SELECT 'Tabela product_views e todas as suas dependências foram removidas.' as details;
SELECT 'Sistema de analytics agora funciona apenas com likes, shares e clicks.' as info;