-- Script para corrigir a função track_product_share
-- Este script deve ser executado no SQL Editor do Supabase
-- Criado em 25/01/2025

-- Problema: A função track_product_share está tentando atualizar product_analytics diretamente,
-- mas agora temos triggers que fazem isso automaticamente, causando conflitos.

-- 1. Remover função conflitante
DROP FUNCTION IF EXISTS track_product_share(UUID, TEXT, TEXT, UUID, TEXT, INET, TEXT);

-- 2. Criar função track_product_share corrigida (sem atualização manual de analytics)
CREATE OR REPLACE FUNCTION track_product_share(
  p_product_id UUID,
  p_share_type TEXT,
  p_page_source TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert the share record
  -- O trigger trigger_shares_analytics irá automaticamente atualizar product_analytics
  INSERT INTO product_shares (
    product_id,
    share_type,
    page_source,
    user_id,
    session_id,
    ip_address,
    user_agent
  ) VALUES (
    p_product_id,
    p_share_type,
    p_page_source,
    p_user_id,
    p_session_id,
    p_ip_address,
    p_user_agent
  );
  
  -- Não precisamos atualizar product_analytics manualmente
  -- O trigger fará isso automaticamente
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro para debug
    RAISE LOG 'Erro em track_product_share: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- 3. Fazer o mesmo para track_product_click
DROP FUNCTION IF EXISTS track_product_click(UUID, TEXT, TEXT, UUID, TEXT, INET, TEXT);

CREATE OR REPLACE FUNCTION track_product_click(
  p_product_id UUID,
  p_click_type TEXT,
  p_page_source TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert the click record
  -- O trigger trigger_clicks_analytics irá automaticamente atualizar product_analytics
  INSERT INTO product_clicks (
    product_id,
    click_type,
    page_source,
    user_id,
    session_id,
    ip_address,
    user_agent
  ) VALUES (
    p_product_id,
    p_click_type,
    p_page_source,
    p_user_id,
    p_session_id,
    p_ip_address,
    p_user_agent
  );
  
  -- Não precisamos atualizar product_analytics manualmente
  -- O trigger fará isso automaticamente
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro para debug
    RAISE LOG 'Erro em track_product_click: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- 4. Conceder permissões
GRANT EXECUTE ON FUNCTION track_product_share(UUID, TEXT, TEXT, UUID, TEXT, INET, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION track_product_click(UUID, TEXT, TEXT, UUID, TEXT, INET, TEXT) TO anon, authenticated;

-- 5. Verificar se tudo foi aplicado corretamente
DO $$
DECLARE
    share_function_exists BOOLEAN;
    click_function_exists BOOLEAN;
BEGIN
    -- Verificar funções
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'track_product_share'
    ) INTO share_function_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'track_product_click'
    ) INTO click_function_exists;
    
    IF share_function_exists AND click_function_exists THEN
        RAISE NOTICE '✅ FUNÇÕES DE TRACKING CORRIGIDAS COM SUCESSO!';
        RAISE NOTICE '✅ Função track_product_share: Corrigida (sem conflito com triggers)';
        RAISE NOTICE '✅ Função track_product_click: Corrigida (sem conflito com triggers)';
        RAISE NOTICE '';
        RAISE NOTICE '🎉 Agora as funções devem retornar TRUE e os dados devem persistir!';
    ELSE
        RAISE NOTICE '❌ ERRO: Funções não foram aplicadas completamente.';
        RAISE NOTICE 'Função track_product_share: %', CASE WHEN share_function_exists THEN '✅' ELSE '❌' END;
        RAISE NOTICE 'Função track_product_click: %', CASE WHEN click_function_exists THEN '✅' ELSE '❌' END;
    END IF;
END
$$;

-- Comentários para documentação
COMMENT ON FUNCTION track_product_share IS 'Função corrigida para rastrear shares sem conflito com triggers - 25/01/2025';
COMMENT ON FUNCTION track_product_click IS 'Função corrigida para rastrear clicks sem conflito com triggers - 25/01/2025';

SELECT 'Script de correção das funções de tracking concluído!' as status;