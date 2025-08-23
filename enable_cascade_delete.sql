-- Script para ativar ON DELETE CASCADE nas chaves estrangeiras das tabelas de analytics
-- Execute este script no Supabase SQL Editor

-- 1. Atualizar product_analytics
ALTER TABLE product_analytics 
DROP CONSTRAINT IF EXISTS product_analytics_product_id_fkey,
ADD CONSTRAINT product_analytics_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES products (id) 
ON DELETE CASCADE;

-- 2. Atualizar product_likes
ALTER TABLE product_likes 
DROP CONSTRAINT IF EXISTS product_likes_product_id_fkey,
ADD CONSTRAINT product_likes_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES products (id) 
ON DELETE CASCADE;

-- 3. Atualizar product_views
ALTER TABLE product_views 
DROP CONSTRAINT IF EXISTS product_views_product_id_fkey,
ADD CONSTRAINT product_views_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES products (id) 
ON DELETE CASCADE;

-- 4. Atualizar product_clicks
ALTER TABLE product_clicks 
DROP CONSTRAINT IF EXISTS product_clicks_product_id_fkey,
ADD CONSTRAINT product_clicks_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES products (id) 
ON DELETE CASCADE;

-- Verificar se as constraints foram criadas corretamente
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc 
    ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name IN ('product_analytics', 'product_likes', 'product_views', 'product_clicks')
    AND tc.constraint_type = 'FOREIGN KEY'
    AND rc.delete_rule = 'CASCADE';

-- Comentário: Após executar este script, quando um produto for excluído,
-- todos os registros relacionados nas tabelas de analytics serão automaticamente removidos.