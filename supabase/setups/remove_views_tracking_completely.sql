-- Script para remover completamente o sistema de rastreamento de visualizações
-- Este script deve ser executado no SQL Editor do Supabase
-- Criado em 25/01/2025

-- Remove todas as funcionalidades relacionadas ao rastreamento de views
-- Mantém apenas: likes, shares e clicks

BEGIN;

-- 1. Remover triggers relacionados a product_views
DROP TRIGGER IF EXISTS trigger_views_analytics ON public.product_views;
DROP FUNCTION IF EXISTS trigger_views_analytics();

-- 2. Remover função track_product_view
DROP FUNCTION IF EXISTS track_product_view(UUID, UUID, TEXT, INET, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS track_product_view(UUID, UUID, VARCHAR, INET, TEXT);
DROP FUNCTION IF EXISTS track_product_view;

-- 3. Remover tabela product_views completamente
DROP TABLE IF EXISTS public.product_views CASCADE;

-- 4. Atualizar função update_product_analytics para remover unique_viewers
CREATE OR REPLACE FUNCTION update_product_analytics(p_product_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.product_analytics (
    product_id, 
    total_likes, 
    total_shares, 
    total_clicks
  )
  SELECT 
    p_product_id,
    COALESCE(likes.count, 0) as total_likes,
    COALESCE(shares.count, 0) as total_shares,
    COALESCE(clicks.count, 0) as total_clicks
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
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- 5. Remover coluna unique_viewers da tabela product_analytics se existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'product_analytics' 
        AND column_name = 'unique_viewers'
    ) THEN
        ALTER TABLE public.product_analytics DROP COLUMN unique_viewers;
        RAISE NOTICE '✅ Coluna unique_viewers removida da tabela product_analytics';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna unique_viewers não existe na tabela product_analytics';
    END IF;
END
$$;

-- 6. Atualizar analytics existentes para recalcular sem unique_viewers
DO $$
DECLARE
    product_record RECORD;
BEGIN
    FOR product_record IN SELECT id FROM public.products LOOP
        PERFORM update_product_analytics(product_record.id);
    END LOOP;
    RAISE NOTICE '✅ Analytics recalculados para todos os produtos (sem unique_viewers)';
END
$$;

-- 7. Verificar se tudo foi removido corretamente
DO $$
DECLARE
    table_exists BOOLEAN;
    function_exists BOOLEAN;
    trigger_exists BOOLEAN;
    column_exists BOOLEAN;
BEGIN
    -- Verificar se tabela foi removida
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'product_views'
    ) INTO table_exists;
    
    -- Verificar se função foi removida
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'track_product_view'
    ) INTO function_exists;
    
    -- Verificar se trigger foi removido
    SELECT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_views_analytics'
    ) INTO trigger_exists;
    
    -- Verificar se coluna unique_viewers foi removida
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'product_analytics' 
        AND column_name = 'unique_viewers'
    ) INTO column_exists;
    
    IF NOT table_exists AND NOT function_exists AND NOT trigger_exists AND NOT column_exists THEN
        RAISE NOTICE '✅ SISTEMA DE RASTREAMENTO DE VISUALIZAÇÕES REMOVIDO COMPLETAMENTE!';
        RAISE NOTICE '✅ Tabela product_views: Removida';
        RAISE NOTICE '✅ Função track_product_view: Removida';
        RAISE NOTICE '✅ Trigger views_analytics: Removido';
        RAISE NOTICE '✅ Coluna unique_viewers: Removida';
        RAISE NOTICE '';
        RAISE NOTICE '🎯 Sistema agora mantém apenas: likes, shares e clicks!';
        RAISE NOTICE '📊 Analytics recalculados sem dados de visualizações';
        RAISE NOTICE '⚡ Performance otimizada - sem rastreamento de views';
    ELSE
        RAISE NOTICE '❌ ATENÇÃO: Alguns componentes ainda existem:';
        RAISE NOTICE 'Tabela product_views: %', CASE WHEN table_exists THEN '❌ AINDA EXISTE' ELSE '✅ Removida' END;
        RAISE NOTICE 'Função track_product_view: %', CASE WHEN function_exists THEN '❌ AINDA EXISTE' ELSE '✅ Removida' END;
        RAISE NOTICE 'Trigger views_analytics: %', CASE WHEN trigger_exists THEN '❌ AINDA EXISTE' ELSE '✅ Removido' END;
        RAISE NOTICE 'Coluna unique_viewers: %', CASE WHEN column_exists THEN '❌ AINDA EXISTE' ELSE '✅ Removida' END;
    END IF;
END
$$;

COMMIT;

-- Comentários para documentação
COMMENT ON FUNCTION update_product_analytics IS 'Função atualizada para rastrear apenas likes, shares e clicks - views removidas em 25/01/2025';

SELECT 'Sistema de rastreamento de visualizações removido completamente!' as status;
SELECT 'Mantendo apenas: likes, shares e clicks para melhor performance.' as info;