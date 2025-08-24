-- Migração para corrigir conflitos nas funções de tracking
-- Criada em 24/01/2025

-- 1. Remover funções conflitantes
DROP FUNCTION IF EXISTS track_product_share(UUID, VARCHAR, VARCHAR, UUID, VARCHAR, INET, TEXT);
DROP FUNCTION IF EXISTS track_product_share(UUID, TEXT, TEXT, UUID, TEXT, INET, TEXT);
DROP FUNCTION IF EXISTS track_product_click(UUID, VARCHAR, VARCHAR, UUID, VARCHAR, INET, TEXT);
DROP FUNCTION IF EXISTS track_product_click(UUID, TEXT, TEXT, UUID, TEXT, INET, TEXT);

-- 2. Criar função track_product_share com tipos corretos
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
  
  -- Update analytics table
  INSERT INTO product_analytics (product_id, total_shares)
  VALUES (p_product_id, 1)
  ON CONFLICT (product_id)
  DO UPDATE SET 
    total_shares = product_analytics.total_shares + 1,
    updated_at = NOW();
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- 3. Criar função track_product_click com tipos corretos
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
  
  -- Update analytics table
  INSERT INTO product_analytics (product_id, total_clicks)
  VALUES (p_product_id, 1)
  ON CONFLICT (product_id)
  DO UPDATE SET 
    total_clicks = product_analytics.total_clicks + 1,
    updated_at = NOW();
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- 4. Conceder permissões
GRANT EXECUTE ON FUNCTION track_product_share(UUID, TEXT, TEXT, UUID, TEXT, INET, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION track_product_click(UUID, TEXT, TEXT, UUID, TEXT, INET, TEXT) TO anon, authenticated;

-- 5. Comentários para documentação
COMMENT ON FUNCTION track_product_share IS 'Função para rastrear compartilhamentos de produtos com tipos TEXT corretos';
COMMENT ON FUNCTION track_product_click IS 'Função para rastrear cliques de produtos com tipos TEXT corretos';

-- Mensagem de sucesso
SELECT 'Funções de tracking corrigidas com sucesso!' as status;