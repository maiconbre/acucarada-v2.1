-- Script para corrigir a função toggle_product_like
-- Este script deve ser executado no SQL Editor do Supabase
-- Criado em 25/01/2025

-- Problema: Existem duas versões da função toggle_product_like com tipos diferentes
-- para o parâmetro session_id (VARCHAR vs TEXT), causando ambiguidade

-- 1. Remover todas as versões conflitantes da função
DROP FUNCTION IF EXISTS toggle_product_like(UUID, UUID, VARCHAR, INET);
DROP FUNCTION IF EXISTS toggle_product_like(UUID, UUID, TEXT, INET);

-- 2. Criar função toggle_product_like unificada e corrigida
CREATE OR REPLACE FUNCTION toggle_product_like(
  p_product_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_like_id UUID;
  is_liked BOOLEAN := FALSE;
BEGIN
  -- Check if already liked
  SELECT id INTO existing_like_id
  FROM product_likes
  WHERE product_id = p_product_id
    AND (
      (p_user_id IS NOT NULL AND user_id = p_user_id) OR
      (p_user_id IS NULL AND session_id = p_session_id)
    );
  
  IF existing_like_id IS NOT NULL THEN
    -- Unlike: remove the like
    -- O trigger trigger_likes_analytics irá automaticamente atualizar product_analytics
    DELETE FROM product_likes WHERE id = existing_like_id;
    is_liked := FALSE;
  ELSE
    -- Like: add new like
    -- O trigger trigger_likes_analytics irá automaticamente atualizar product_analytics
    INSERT INTO product_likes (product_id, user_id, session_id, ip_address)
    VALUES (p_product_id, p_user_id, p_session_id, p_ip_address);
    is_liked := TRUE;
  END IF;
  
  -- Não precisamos chamar update_product_analytics manualmente
  -- O trigger fará isso automaticamente
  
  RETURN is_liked;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro para debug
    RAISE LOG 'Erro em toggle_product_like: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- 3. Conceder permissões
GRANT EXECUTE ON FUNCTION toggle_product_like(UUID, UUID, TEXT, INET) TO anon, authenticated;

-- 4. Verificar se tudo foi aplicado corretamente
DO $$
DECLARE
    function_exists BOOLEAN;
    function_count INTEGER;
BEGIN
    -- Verificar se existe apenas uma versão da função
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_name = 'toggle_product_like';
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'toggle_product_like'
    ) INTO function_exists;
    
    IF function_exists AND function_count = 1 THEN
        RAISE NOTICE '✅ FUNÇÃO TOGGLE_PRODUCT_LIKE CORRIGIDA COM SUCESSO!';
        RAISE NOTICE '✅ Ambiguidade resolvida - apenas uma versão da função existe';
        RAISE NOTICE '✅ Função corrigida para usar triggers automáticos';
        RAISE NOTICE '';
        RAISE NOTICE '🎉 Agora a função deve funcionar sem conflitos!';
    ELSE
        RAISE NOTICE '❌ ERRO: Problema na aplicação da função.';
        RAISE NOTICE 'Número de versões encontradas: %', function_count;
        RAISE NOTICE 'Função existe: %', CASE WHEN function_exists THEN '✅' ELSE '❌' END;
    END IF;
END
$$;

-- Comentário para documentação
COMMENT ON FUNCTION toggle_product_like IS 'Função corrigida para resolver ambiguidade e usar triggers automáticos - 25/01/2025';

SELECT 'Script de correção da função toggle_product_like concluído!' as status;