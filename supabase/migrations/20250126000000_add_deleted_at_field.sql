-- Adicionar campo deleted_at para soft delete
ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Criar índice para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);

-- Comentário explicativo
COMMENT ON COLUMN products.deleted_at IS 'Timestamp quando o produto foi movido para lixeira (soft delete). NULL significa que o produto não foi deletado.';