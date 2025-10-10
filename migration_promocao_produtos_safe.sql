-- Migration SEGURA para adicionar funcionalidade de promoção aos produtos
-- Esta versão pode ser executada múltiplas vezes sem erros
-- Execute este código no painel do Supabase em SQL Editor

-- Verificar e adicionar colunas de promoção na tabela products
DO $$
BEGIN
  -- Adicionar is_on_promotion se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'is_on_promotion'
  ) THEN
    ALTER TABLE products ADD COLUMN is_on_promotion BOOLEAN DEFAULT FALSE;
  END IF;

  -- Adicionar promotional_price se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'promotional_price'
  ) THEN
    ALTER TABLE products ADD COLUMN promotional_price DECIMAL(10,2) DEFAULT NULL;
  END IF;

  -- Adicionar promotion_start_date se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'promotion_start_date'
  ) THEN
    ALTER TABLE products ADD COLUMN promotion_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;
  END IF;

  -- Adicionar promotion_end_date se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'promotion_end_date'
  ) THEN
    ALTER TABLE products ADD COLUMN promotion_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;
  END IF;
END $$;

-- Adicionar comentários para documentação (sempre seguro executar)
COMMENT ON COLUMN products.is_on_promotion IS 'Indica se o produto está em promoção';
COMMENT ON COLUMN products.promotional_price IS 'Preço promocional do produto (quando em promoção)';
COMMENT ON COLUMN products.promotion_start_date IS 'Data de início da promoção';
COMMENT ON COLUMN products.promotion_end_date IS 'Data de fim da promoção';

-- Criar índice para melhorar performance (verificar se já existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_products_promotion' 
    AND tablename = 'products'
  ) THEN
    CREATE INDEX idx_products_promotion ON products(is_on_promotion, promotion_start_date, promotion_end_date) 
    WHERE is_on_promotion = TRUE;
  END IF;
END $$;

-- Adicionar constraint (verificar se já existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_promotional_price' 
    AND table_name = 'products'
  ) THEN
    ALTER TABLE products 
    ADD CONSTRAINT check_promotional_price 
    CHECK (
      (is_on_promotion = FALSE) OR 
      (is_on_promotion = TRUE AND promotional_price IS NOT NULL AND promotional_price > 0 AND promotional_price < price)
    );
  END IF;
END $$;

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

-- Exemplo de como criar um produto em promoção para teste
-- DESCOMENTE as linhas abaixo para testar:
/*
UPDATE products 
SET 
  is_on_promotion = TRUE,
  promotional_price = 12.00,
  promotion_start_date = NOW(),
  promotion_end_date = NOW() + INTERVAL '30 days'
WHERE name ILIKE '%COXINHA DE MORANGO FERRERO%'
LIMIT 1;
*/