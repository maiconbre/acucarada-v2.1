-- Função SQL para exclusão segura de produtos usando transação
-- Execute este script no Supabase SQL Editor

-- Função para excluir produto de forma segura com transação
CREATE OR REPLACE FUNCTION delete_product_safely(p_product_id UUID)
RETURNS boolean AS $$
DECLARE
    product_exists boolean := false;
    analytics_count integer := 0;
    likes_count integer := 0;
    views_count integer := 0;
    clicks_count integer := 0;
BEGIN
    -- Verificar se o produto existe
    SELECT EXISTS(
        SELECT 1 FROM products WHERE id = p_product_id
    ) INTO product_exists;
    
    IF NOT product_exists THEN
        RAISE EXCEPTION 'Produto não encontrado com ID: %', p_product_id;
    END IF;
    
    -- Contar registros relacionados para log
    SELECT COUNT(*) INTO analytics_count FROM product_analytics WHERE product_id = p_product_id;
    SELECT COUNT(*) INTO likes_count FROM product_likes WHERE product_id = p_product_id;
    SELECT COUNT(*) INTO views_count FROM product_views WHERE product_id = p_product_id;
    SELECT COUNT(*) INTO clicks_count FROM product_clicks WHERE product_id = p_product_id;
    
    -- Log da operação
    RAISE NOTICE 'Excluindo produto % com % analytics, % likes, % views, % clicks', 
        p_product_id, analytics_count, likes_count, views_count, clicks_count;
    
    -- Iniciar transação implícita (função já roda em transação)
    
    -- 1. Excluir product_analytics
    DELETE FROM product_analytics WHERE product_id = p_product_id;
    
    -- 2. Excluir product_likes
    DELETE FROM product_likes WHERE product_id = p_product_id;
    
    -- 3. Excluir product_views
    DELETE FROM product_views WHERE product_id = p_product_id;
    
    -- 4. Excluir product_clicks
    DELETE FROM product_clicks WHERE product_id = p_product_id;
    
    -- 5. Excluir o produto
    DELETE FROM products WHERE id = p_product_id;
    
    -- Log de sucesso
    RAISE NOTICE 'Produto % excluído com sucesso', p_product_id;
    
    RETURN true;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Em caso de erro, a transação será automaticamente revertida
        RAISE EXCEPTION 'Erro ao excluir produto %: %', p_product_id, SQLERRM;
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para desativar produto (soft delete)
CREATE OR REPLACE FUNCTION deactivate_product_safely(p_product_id UUID)
RETURNS boolean AS $$
DECLARE
    product_exists boolean := false;
BEGIN
    -- Verificar se o produto existe
    SELECT EXISTS(
        SELECT 1 FROM products WHERE id = p_product_id
    ) INTO product_exists;
    
    IF NOT product_exists THEN
        RAISE EXCEPTION 'Produto não encontrado com ID: %', p_product_id;
    END IF;
    
    -- Desativar o produto
    UPDATE products 
    SET is_active = false, 
        updated_at = now()
    WHERE id = p_product_id;
    
    RAISE NOTICE 'Produto % desativado com sucesso', p_product_id;
    
    RETURN true;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao desativar produto %: %', p_product_id, SQLERRM;
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar dados relacionados de um produto
CREATE OR REPLACE FUNCTION check_product_related_data(p_product_id UUID)
RETURNS TABLE(
    has_analytics boolean,
    has_likes boolean,
    has_views boolean,
    has_clicks boolean,
    analytics_count integer,
    likes_count integer,
    views_count integer,
    clicks_count integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXISTS(SELECT 1 FROM product_analytics WHERE product_id = p_product_id) as has_analytics,
        EXISTS(SELECT 1 FROM product_likes WHERE product_id = p_product_id) as has_likes,
        EXISTS(SELECT 1 FROM product_views WHERE product_id = p_product_id) as has_views,
        EXISTS(SELECT 1 FROM product_clicks WHERE product_id = p_product_id) as has_clicks,
        (SELECT COUNT(*)::integer FROM product_analytics WHERE product_id = p_product_id) as analytics_count,
        (SELECT COUNT(*)::integer FROM product_likes WHERE product_id = p_product_id) as likes_count,
        (SELECT COUNT(*)::integer FROM product_views WHERE product_id = p_product_id) as views_count,
        (SELECT COUNT(*)::integer FROM product_clicks WHERE product_id = p_product_id) as clicks_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para limpeza de dados órfãos (opcional)
CREATE OR REPLACE FUNCTION cleanup_orphaned_analytics()
RETURNS integer AS $$
DECLARE
    deleted_count integer := 0;
BEGIN
    -- Limpar analytics órfãos
    DELETE FROM product_analytics 
    WHERE product_id NOT IN (SELECT id FROM products);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Limpar likes órfãos
    DELETE FROM product_likes 
    WHERE product_id NOT IN (SELECT id FROM products);
    
    -- Limpar views órfãos
    DELETE FROM product_views 
    WHERE product_id NOT IN (SELECT id FROM products);
    
    -- Limpar clicks órfãos
    DELETE FROM product_clicks 
    WHERE product_id NOT IN (SELECT id FROM products);
    
    RAISE NOTICE 'Limpeza concluída. % registros órfãos removidos', deleted_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissões para usuários autenticados
GRANT EXECUTE ON FUNCTION delete_product_safely(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION deactivate_product_safely(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_product_related_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_orphaned_analytics() TO authenticated;

-- Comentários de uso:
-- Para usar no JavaScript/TypeScript:
-- 
-- // Exclusão segura
-- const { data, error } = await supabase.rpc('delete_product_safely', {
--   p_product_id: 'uuid-do-produto'
-- });
-- 
-- // Desativação
-- const { data, error } = await supabase.rpc('deactivate_product_safely', {
--   p_product_id: 'uuid-do-produto'
-- });
-- 
-- // Verificar dados relacionados
-- const { data, error } = await supabase.rpc('check_product_related_data', {
--   p_product_id: 'uuid-do-produto'
-- });
-- 
-- // Limpeza de dados órfãos
-- const { data, error } = await supabase.rpc('cleanup_orphaned_analytics');