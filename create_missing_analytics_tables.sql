-- Migração para criar tabelas de analytics que podem estar faltando no banco de dados
-- Execute este script no SQL Editor do Supabase

-- Verificar se as tabelas existem e criar apenas se não existirem

-- 1. Criar tabela product_likes se não existir
CREATE TABLE IF NOT EXISTS public.product_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT, -- Para usuários anônimos
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Criar tabela product_views se não existir
CREATE TABLE IF NOT EXISTS public.product_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT, -- Para usuários anônimos
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Criar tabela product_clicks se não existir
CREATE TABLE IF NOT EXISTS public.product_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT, -- Para usuários anônimos
  ip_address INET,
  click_type TEXT NOT NULL, -- 'view_details', 'like', 'image_click', etc.
  page_source TEXT, -- 'catalog', 'home', 'search', etc.
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Criar tabela product_analytics se não existir
CREATE TABLE IF NOT EXISTS public.product_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  total_likes INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id)
);

-- Habilitar Row Level Security nas tabelas
ALTER TABLE public.product_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_analytics ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança para product_likes
DO $$ 
BEGIN
  -- Política para visualizar likes
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_likes' AND policyname = 'Anyone can view likes') THEN
    CREATE POLICY "Anyone can view likes" 
    ON public.product_likes 
    FOR SELECT 
    USING (true);
  END IF;

  -- Política para inserir likes
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_likes' AND policyname = 'Anyone can insert likes') THEN
    CREATE POLICY "Anyone can insert likes" 
    ON public.product_likes 
    FOR INSERT 
    WITH CHECK (true);
  END IF;

  -- Política para deletar likes próprios
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_likes' AND policyname = 'Users can delete own likes') THEN
    CREATE POLICY "Users can delete own likes" 
    ON public.product_likes 
    FOR DELETE 
    USING (
      (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
      (auth.uid() IS NULL AND session_id IS NOT NULL)
    );
  END IF;
END $$;

-- Criar políticas de segurança para product_views
DO $$ 
BEGIN
  -- Política para visualizar analytics
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_views' AND policyname = 'Anyone can view analytics') THEN
    CREATE POLICY "Anyone can view analytics" 
    ON public.product_views 
    FOR SELECT 
    USING (true);
  END IF;

  -- Política para inserir views
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_views' AND policyname = 'Anyone can insert views') THEN
    CREATE POLICY "Anyone can insert views" 
    ON public.product_views 
    FOR INSERT 
    WITH CHECK (true);
  END IF;
END $$;

-- Criar políticas de segurança para product_clicks
DO $$ 
BEGIN
  -- Política para visualizar clicks
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_clicks' AND policyname = 'Anyone can view clicks') THEN
    CREATE POLICY "Anyone can view clicks" 
    ON public.product_clicks 
    FOR SELECT 
    USING (true);
  END IF;

  -- Política para inserir clicks
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_clicks' AND policyname = 'Anyone can insert clicks') THEN
    CREATE POLICY "Anyone can insert clicks" 
    ON public.product_clicks 
    FOR INSERT 
    WITH CHECK (true);
  END IF;
END $$;

-- Criar políticas de segurança para product_analytics
DO $$ 
BEGIN
  -- Política para visualizar product analytics
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_analytics' AND policyname = 'Anyone can view product analytics') THEN
    CREATE POLICY "Anyone can view product analytics" 
    ON public.product_analytics 
    FOR SELECT 
    USING (true);
  END IF;

  -- Política para gerenciar analytics (apenas usuários autenticados)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_analytics' AND policyname = 'Only authenticated users can manage analytics') THEN
    CREATE POLICY "Only authenticated users can manage analytics" 
    ON public.product_analytics 
    FOR ALL
    USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Criar índices para melhor performance (apenas se não existirem)
DO $$ 
BEGIN
  -- Índices para product_likes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_likes_product_id') THEN
    CREATE INDEX idx_product_likes_product_id ON public.product_likes(product_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_likes_user_id') THEN
    CREATE INDEX idx_product_likes_user_id ON public.product_likes(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_likes_session_id') THEN
    CREATE INDEX idx_product_likes_session_id ON public.product_likes(session_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_likes_created_at') THEN
    CREATE INDEX idx_product_likes_created_at ON public.product_likes(created_at);
  END IF;

  -- Índices para product_views
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_views_product_id') THEN
    CREATE INDEX idx_product_views_product_id ON public.product_views(product_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_views_user_id') THEN
    CREATE INDEX idx_product_views_user_id ON public.product_views(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_views_session_id') THEN
    CREATE INDEX idx_product_views_session_id ON public.product_views(session_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_views_created_at') THEN
    CREATE INDEX idx_product_views_created_at ON public.product_views(created_at);
  END IF;

  -- Índices para product_clicks
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_clicks_product_id') THEN
    CREATE INDEX idx_product_clicks_product_id ON public.product_clicks(product_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_clicks_user_id') THEN
    CREATE INDEX idx_product_clicks_user_id ON public.product_clicks(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_clicks_session_id') THEN
    CREATE INDEX idx_product_clicks_session_id ON public.product_clicks(session_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_clicks_type') THEN
    CREATE INDEX idx_product_clicks_type ON public.product_clicks(click_type);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_clicks_created_at') THEN
    CREATE INDEX idx_product_clicks_created_at ON public.product_clicks(created_at);
  END IF;
END $$;

-- Função para atualizar agregações de analytics
CREATE OR REPLACE FUNCTION update_product_analytics(p_product_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.product_analytics (product_id, total_likes, total_views, total_clicks, unique_viewers)
  SELECT 
    p_product_id,
    COALESCE(likes.count, 0) as total_likes,
    COALESCE(views.count, 0) as total_views,
    COALESCE(clicks.count, 0) as total_clicks,
    COALESCE(unique_views.count, 0) as unique_viewers
  FROM (
    SELECT COUNT(*) as count 
    FROM public.product_likes 
    WHERE product_id = p_product_id
  ) likes
  CROSS JOIN (
    SELECT COUNT(*) as count 
    FROM public.product_views 
    WHERE product_id = p_product_id
  ) views
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
    total_views = EXCLUDED.total_views,
    total_clicks = EXCLUDED.total_clicks,
    unique_viewers = EXCLUDED.unique_viewers,
    last_updated = now();
END;
$$ LANGUAGE plpgsql;

-- Função para rastrear visualização de produto
CREATE OR REPLACE FUNCTION track_product_view(
  p_product_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Inserir registro de visualização
  INSERT INTO public.product_views (
    product_id, user_id, session_id, ip_address, user_agent, referrer
  ) VALUES (
    p_product_id, p_user_id, p_session_id, p_ip_address, p_user_agent, p_referrer
  );
  
  -- Atualizar analytics
  PERFORM update_product_analytics(p_product_id);
END;
$$ LANGUAGE plpgsql;

-- Função para rastrear clique de produto
CREATE OR REPLACE FUNCTION track_product_click(
  p_product_id UUID,
  p_click_type TEXT,
  p_page_source TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Inserir registro de clique
  INSERT INTO public.product_clicks (
    product_id, user_id, session_id, ip_address, click_type, page_source, user_agent
  ) VALUES (
    p_product_id, p_user_id, p_session_id, p_ip_address, p_click_type, p_page_source, p_user_agent
  );
  
  -- Atualizar analytics
  PERFORM update_product_analytics(p_product_id);
END;
$$ LANGUAGE plpgsql;

-- Função para alternar curtida de produto
CREATE OR REPLACE FUNCTION toggle_product_like(
  p_product_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  existing_like_id UUID;
  is_liked boolean := false;
BEGIN
  -- Verificar se já foi curtido
  SELECT id INTO existing_like_id
  FROM public.product_likes
  WHERE product_id = p_product_id
    AND (
      (p_user_id IS NOT NULL AND user_id = p_user_id) OR
      (p_user_id IS NULL AND session_id = p_session_id)
    );
  
  IF existing_like_id IS NOT NULL THEN
    -- Descurtir: remover a curtida
    DELETE FROM public.product_likes WHERE id = existing_like_id;
    is_liked := false;
  ELSE
    -- Curtir: adicionar nova curtida
    INSERT INTO public.product_likes (product_id, user_id, session_id, ip_address)
    VALUES (p_product_id, p_user_id, p_session_id, p_ip_address);
    is_liked := true;
  END IF;
  
  -- Atualizar analytics
  PERFORM update_product_analytics(p_product_id);
  
  RETURN is_liked;
END;
$$ LANGUAGE plpgsql;

-- Inicializar analytics para produtos existentes
INSERT INTO public.product_analytics (product_id)
SELECT id FROM public.products
ON CONFLICT (product_id) DO NOTHING;

-- Função de trigger para atualizar analytics automaticamente
CREATE OR REPLACE FUNCTION trigger_update_analytics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM update_product_analytics(NEW.product_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM update_product_analytics(OLD.product_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers apenas se não existirem
DO $$ 
BEGIN
  -- Trigger para likes
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_likes_analytics') THEN
    CREATE TRIGGER trigger_likes_analytics
      AFTER INSERT OR DELETE ON public.product_likes
      FOR EACH ROW EXECUTE FUNCTION trigger_update_analytics();
  END IF;

  -- Trigger para views
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_views_analytics') THEN
    CREATE TRIGGER trigger_views_analytics
      AFTER INSERT OR DELETE ON public.product_views
      FOR EACH ROW EXECUTE FUNCTION trigger_update_analytics();
  END IF;

  -- Trigger para clicks
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_clicks_analytics') THEN
    CREATE TRIGGER trigger_clicks_analytics
      AFTER INSERT OR DELETE ON public.product_clicks
      FOR EACH ROW EXECUTE FUNCTION trigger_update_analytics();
  END IF;
END $$;

-- Mensagem de confirmação
SELECT 'Migração de analytics concluída com sucesso! Todas as tabelas, funções e triggers foram criados ou verificados.' as resultado;