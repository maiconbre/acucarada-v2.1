-- Migration para adicionar funcionalidade de promoção aos produtos
-- Execute este código no painel do Supabase em SQL Editor

-- Adicionar colunas de promoção na tabela products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_on_promotion BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS promotional_price DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS promotion_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS promotion_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Adicionar comentários para documentação
COMMENT ON COLUMN products.is_on_promotion IS 'Indica se o produto está em promoção';
COMMENT ON COLUMN products.promotional_price IS 'Preço promocional do produto (quando em promoção)';
COMMENT ON COLUMN products.promotion_start_date IS 'Data de início da promoção';
COMMENT ON COLUMN products.promotion_end_date IS 'Data de fim da promoção';

-- Criar índice para melhorar performance de consultas de produtos em promoção
CREATE INDEX IF NOT EXISTS idx_products_promotion ON products(is_on_promotion, promotion_start_date, promotion_end_date) 
WHERE is_on_promotion = TRUE;

-- Adicionar constraint para garantir que promotional_price seja menor que price quando em promoção
ALTER TABLE products 
ADD CONSTRAINT check_promotional_price 
CHECK (
  (is_on_promotion = FALSE) OR 
  (is_on_promotion = TRUE AND promotional_price IS NOT NULL AND promotional_price > 0 AND promotional_price < price)
);

-- Criar função para verificar se uma promoção está ativa
CREATE OR REPLACE FUNCTION is_promotion_active(
  p_is_on_promotion BOOLEAN,
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN p_is_on_promotion = TRUE 
    AND (p_start_date IS NULL OR p_start_date <= NOW())
    AND (p_end_date IS NULL OR p_end_date >= NOW());
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Criar view para produtos com promoção ativa
CREATE OR REPLACE VIEW products_with_active_promotion AS
SELECT 
  *,
  is_promotion_active(is_on_promotion, promotion_start_date, promotion_end_date) as promotion_active
FROM products
WHERE is_active = TRUE;

-- Atualizar RLS policies se necessário (manter as existentes e adicionar para novos campos)
-- As policies existentes já cobrem a tabela products, então não precisamos criar novas

-- Exemplo de como atualizar alguns produtos para teste (opcional - remover em produção)
-- UPDATE products 
-- SET is_on_promotion = TRUE, 
--     promotional_price = price * 0.8,
--     promotion_start_date = NOW(),
--     promotion_end_date = NOW() + INTERVAL '30 days'
-- WHERE id IN (SELECT id FROM products LIMIT 2);

-- Verificar se a migration foi aplicada corretamente
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('is_on_promotion', 'promotional_price', 'promotion_start_date', 'promotion_end_date')
ORDER BY column_name;