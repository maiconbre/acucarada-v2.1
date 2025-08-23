-- Migração para substituir tracking de views por tracking de shares
-- Criada em 23/01/2025

-- 1. Criar tabela product_shares
CREATE TABLE IF NOT EXISTS public.product_shares (
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

-- 2. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_product_shares_product_id ON public.product_shares(product_id);
CREATE INDEX IF NOT EXISTS idx_product_shares_user_id ON public.product_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_product_shares_session_id ON public.product_shares(session_id);
CREATE INDEX IF NOT EXISTS idx_product_shares_created_at ON public.product_shares(created_at);
CREATE INDEX IF NOT EXISTS idx_product_shares_share_type ON public.product_shares(share_type);

-- 3. Adicionar campo total_shares na tabela product_analytics
ALTER TABLE public.product_analytics 
ADD COLUMN IF NOT EXISTS total_shares INTEGER DEFAULT 0;

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

-- 8. Comentários para documentação
COMMENT ON TABLE public.product_shares IS 'Tabela para rastrear compartilhamentos de produtos';
COMMENT ON COLUMN public.product_shares.share_type IS 'Tipo de compartilhamento: native_share, copy_link, whatsapp, facebook, etc.';
COMMENT ON COLUMN public.product_shares.page_source IS 'Página onde o compartilhamento foi feito: catalog, product_detail, etc.';
COMMENT ON FUNCTION track_product_share IS 'Função para rastrear compartilhamentos de produtos';

-- Mensagem de sucesso
SELECT 'Migração de tracking de shares concluída com sucesso!' as status;