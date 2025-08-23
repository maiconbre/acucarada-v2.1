-- Script para aplicar migração de tracking de shares
-- Execute este script no Supabase Dashboard > SQL Editor
-- Data: 23/01/2025

-- ========================================
-- MIGRAÇÃO: TRACKING DE SHARES
-- ========================================

BEGIN;

-- 1. Verificar se a tabela product_shares já existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_shares') THEN
        RAISE NOTICE 'Criando tabela product_shares...';
        
        -- Criar tabela product_shares
        CREATE TABLE public.product_shares (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          session_id TEXT,
          ip_address INET,
          user_agent TEXT,
          share_type TEXT NOT NULL, -- 'native_share', 'copy_link', 'whatsapp', 'facebook', etc.
          page_source TEXT, -- 'catalog', 'product_detail', etc.
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        RAISE NOTICE 'Tabela product_shares criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela product_shares já existe.';
    END IF;
END
$$;

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_product_shares_product_id ON public.product_shares(product_id);
CREATE INDEX IF NOT EXISTS idx_product_shares_user_id ON public.product_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_product_shares_session_id ON public.product_shares(session_id);
CREATE INDEX IF NOT EXISTS idx_product_shares_created_at ON public.product_shares(created_at);
CREATE INDEX IF NOT EXISTS idx_product_shares_share_type ON public.product_shares(share_type);

-- 3. Adicionar campo total_shares na tabela product_analytics
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'product_analytics' AND column_name = 'total_shares') THEN
        ALTER TABLE public.product_analytics ADD COLUMN total_shares INTEGER DEFAULT 0;
        RAISE NOTICE 'Campo total_shares adicionado à tabela product_analytics.';
    ELSE
        RAISE NOTICE 'Campo total_shares já existe na tabela product_analytics.';
    END IF;
END
$$;

-- 4. Atualizar função update_product_analytics para incluir shares
CREATE OR REPLACE FUNCTION update_product_analytics(p_product_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.product_analytics (product_id, total_likes, total_shares, total_clicks, unique_viewers)
  SELECT 
    p_product_id,
    COALESCE(likes.count, 0) as total_likes,
    COALESCE(shares.count, 0) as total_shares,
    COALESCE(clicks.count, 0) as total_clicks,
    COALESCE(unique_views.count, 0) as unique_viewers
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
  CROSS JOIN (
    SELECT COUNT(DISTINCT COALESCE(user_id::text, session_id)) as count 
    FROM public.product_views 
    WHERE product_id = p_product_id
  ) unique_views
  ON CONFLICT (product_id) DO UPDATE SET
    total_likes = EXCLUDED.total_likes,
    total_shares = EXCLUDED.total_shares,
    total_clicks = EXCLUDED.total_clicks,
    unique_viewers = EXCLUDED.unique_viewers,
    last_updated = now();
END;
$$ LANGUAGE plpgsql;

-- 5. Criar função para rastrear compartilhamentos
CREATE OR REPLACE FUNCTION track_product_share(
  p_product_id UUID,
  p_share_type TEXT,
  p_page_source TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Insert share record
  INSERT INTO public.product_shares (
    product_id, user_id, session_id, ip_address, share_type, page_source, user_agent
  ) VALUES (
    p_product_id, p_user_id, p_session_id, p_ip_address, p_share_type, p_page_source, p_user_agent
  );
  
  -- Update analytics
  PERFORM update_product_analytics(p_product_id);
END;
$$ LANGUAGE plpgsql;

-- 6. Configurar RLS (Row Level Security)
ALTER TABLE public.product_shares ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Anyone can insert shares" ON public.product_shares;
DROP POLICY IF EXISTS "Admins can view shares" ON public.product_shares;

-- Política para permitir inserção (qualquer usuário pode compartilhar)
CREATE POLICY "Anyone can insert shares" ON public.product_shares
  FOR INSERT WITH CHECK (true);

-- Política para leitura (apenas admins podem ver dados de shares)
CREATE POLICY "Admins can view shares" ON public.product_shares
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 7. Atualizar dados existentes (migrar total_shares para 0 se não existir)
UPDATE public.product_analytics 
SET total_shares = 0 
WHERE total_shares IS NULL;

-- 8. Adicionar comentários para documentação
COMMENT ON TABLE public.product_shares IS 'Tabela para rastrear compartilhamentos de produtos';
COMMENT ON COLUMN public.product_shares.share_type IS 'Tipo de compartilhamento: native_share, copy_link, whatsapp, facebook, etc.';
COMMENT ON COLUMN public.product_shares.page_source IS 'Página onde o compartilhamento foi feito: catalog, product_detail, etc.';
COMMENT ON FUNCTION track_product_share IS 'Função para rastrear compartilhamentos de produtos';

-- 9. Verificação final
DO $$
DECLARE
    shares_table_exists BOOLEAN;
    shares_column_exists BOOLEAN;
    function_exists BOOLEAN;
BEGIN
    -- Verificar se a tabela product_shares existe
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_shares') INTO shares_table_exists;
    
    -- Verificar se a coluna total_shares existe
    SELECT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'product_analytics' AND column_name = 'total_shares') INTO shares_column_exists;
    
    -- Verificar se a função track_product_share existe
    SELECT EXISTS (SELECT 1 FROM information_schema.routines 
                   WHERE routine_name = 'track_product_share') INTO function_exists;
    
    IF shares_table_exists AND shares_column_exists AND function_exists THEN
        RAISE NOTICE '✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
        RAISE NOTICE '✅ Tabela product_shares: Criada';
        RAISE NOTICE '✅ Campo total_shares: Adicionado';
        RAISE NOTICE '✅ Função track_product_share: Criada';
        RAISE NOTICE '✅ Políticas RLS: Configuradas';
        RAISE NOTICE '';
        RAISE NOTICE '🎉 O sistema agora rastreia compartilhamentos ao invés de views!';
    ELSE
        RAISE NOTICE '❌ ERRO: Migração não foi completada corretamente.';
        RAISE NOTICE 'Tabela product_shares: %', CASE WHEN shares_table_exists THEN '✅' ELSE '❌' END;
        RAISE NOTICE 'Campo total_shares: %', CASE WHEN shares_column_exists THEN '✅' ELSE '❌' END;
        RAISE NOTICE 'Função track_product_share: %', CASE WHEN function_exists THEN '✅' ELSE '❌' END;
    END IF;
END
$$;

COMMIT;

-- Mensagem final
SELECT 
    '🎯 MIGRAÇÃO DE TRACKING DE SHARES APLICADA!' as status,
    'Execute este script no Supabase Dashboard para ativar o tracking de compartilhamentos.' as instrucoes;