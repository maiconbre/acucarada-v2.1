-- Execute este script no painel do Supabase (SQL Editor)
-- Este script resolve os erros nos hooks useAppSettings e useProductAnalytics

-- 1. Criar tabela app_settings
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'general',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Adicionar colunas faltantes na tabela product_analytics
ALTER TABLE product_analytics 
ADD COLUMN IF NOT EXISTS total_shares INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_clicks INTEGER DEFAULT 0;

-- 3. Criar tabela product_shares
CREATE TABLE IF NOT EXISTS product_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  share_type VARCHAR(50) NOT NULL,
  page_source VARCHAR(255),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela product_clicks
CREATE TABLE IF NOT EXISTS product_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  click_type VARCHAR(50) NOT NULL,
  page_source VARCHAR(255),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela product_likes
CREATE TABLE IF NOT EXISTS product_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id),
  UNIQUE(product_id, session_id)
);

-- 6. Criar tabela product_views
CREATE TABLE IF NOT EXISTS product_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  view_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id, view_date),
  UNIQUE(product_id, session_id, view_date)
);

-- 7. Função get_public_settings
CREATE OR REPLACE FUNCTION get_public_settings()
RETURNS TABLE(
  key TEXT,
  value TEXT,
  description TEXT,
  category TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.key::TEXT,
    s.value::TEXT,
    s.description::TEXT,
    s.category::TEXT
  FROM app_settings s
  WHERE s.is_public = true
  ORDER BY s.category, s.key;
END;
$$;

-- 8. Função update_app_setting
CREATE OR REPLACE FUNCTION update_app_setting(
  setting_key TEXT,
  setting_value TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Permission denied: Only administrators can update app settings.';
  END IF;

  UPDATE app_settings
  SET 
    value = setting_value,
    updated_at = NOW()
  WHERE key = setting_key;

  RETURN FOUND;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- 9. Função track_product_share
CREATE OR REPLACE FUNCTION track_product_share(
  p_product_id UUID,
  p_share_type VARCHAR(50),
  p_page_source VARCHAR(255) DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_session_id VARCHAR(255) DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO product_shares (
    product_id, share_type, page_source, user_id, session_id, ip_address, user_agent
  ) VALUES (
    p_product_id, p_share_type, p_page_source, p_user_id, p_session_id, p_ip_address, p_user_agent
  );
  
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

-- 10. Função track_product_click
CREATE OR REPLACE FUNCTION track_product_click(
  p_product_id UUID,
  p_click_type VARCHAR(50),
  p_page_source VARCHAR(255) DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_session_id VARCHAR(255) DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO product_clicks (
    product_id, click_type, page_source, user_id, session_id, ip_address, user_agent
  ) VALUES (
    p_product_id, p_click_type, p_page_source, p_user_id, p_session_id, p_ip_address, p_user_agent
  );
  
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

-- 11. Função toggle_product_like
CREATE OR REPLACE FUNCTION toggle_product_like(
  p_product_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_session_id VARCHAR(255) DEFAULT NULL,
  p_ip_address INET DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  like_exists BOOLEAN := FALSE;
  is_liked BOOLEAN := FALSE;
BEGIN
  IF p_user_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM product_likes 
      WHERE product_id = p_product_id AND user_id = p_user_id
    ) INTO like_exists;
  ELSE
    SELECT EXISTS(
      SELECT 1 FROM product_likes 
      WHERE product_id = p_product_id AND session_id = p_session_id
    ) INTO like_exists;
  END IF;

  IF like_exists THEN
    IF p_user_id IS NOT NULL THEN
      DELETE FROM product_likes 
      WHERE product_id = p_product_id AND user_id = p_user_id;
    ELSE
      DELETE FROM product_likes 
      WHERE product_id = p_product_id AND session_id = p_session_id;
    END IF;
    
    UPDATE product_analytics 
    SET 
      total_likes = GREATEST(0, total_likes - 1),
      updated_at = NOW()
    WHERE product_id = p_product_id;
    
    is_liked := FALSE;
  ELSE
    INSERT INTO product_likes (
      product_id, user_id, session_id, ip_address
    ) VALUES (
      p_product_id, p_user_id, p_session_id, p_ip_address
    );
    
    INSERT INTO product_analytics (product_id, total_likes)
    VALUES (p_product_id, 1)
    ON CONFLICT (product_id)
    DO UPDATE SET 
      total_likes = product_analytics.total_likes + 1,
      updated_at = NOW();
    
    is_liked := TRUE;
  END IF;
  
  RETURN is_liked;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- 12. Função track_product_view
CREATE OR REPLACE FUNCTION track_product_view(
  p_product_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_session_id VARCHAR(255) DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO product_views (
    product_id, user_id, session_id, ip_address, user_agent, view_date
  ) VALUES (
    p_product_id, p_user_id, p_session_id, p_ip_address, p_user_agent, CURRENT_DATE
  )
  ON CONFLICT DO NOTHING;
  
  IF FOUND THEN
    INSERT INTO product_analytics (product_id, unique_viewers)
    VALUES (p_product_id, 1)
    ON CONFLICT (product_id)
    DO UPDATE SET 
      unique_viewers = product_analytics.unique_viewers + 1,
      updated_at = NOW();
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- 13. Habilitar RLS nas novas tabelas
ALTER TABLE product_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

-- 14. Políticas RLS
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_shares' AND policyname = 'Anyone can insert shares') THEN
    CREATE POLICY "Anyone can insert shares" ON product_shares FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_clicks' AND policyname = 'Anyone can insert clicks') THEN
    CREATE POLICY "Anyone can insert clicks" ON product_clicks FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_likes' AND policyname = 'Anyone can insert likes') THEN
    CREATE POLICY "Anyone can insert likes" ON product_likes FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_likes' AND policyname = 'Anyone can delete likes') THEN
    CREATE POLICY "Anyone can delete likes" ON product_likes FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_views' AND policyname = 'Anyone can insert views') THEN
    CREATE POLICY "Anyone can insert views" ON product_views FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- 15. Inserir configurações padrão
INSERT INTO app_settings (key, value, description, category, is_public)
VALUES 
  ('whatsapp_number', '5511999999999', 'Número do WhatsApp para contato', 'contact', true),
  ('whatsapp_message', 'Olá! Gostaria de fazer um pedido dos seus doces artesanais.', 'Mensagem padrão do WhatsApp', 'contact', true),
  ('site_name', 'Açucarada Doces', 'Nome do site', 'general', true),
  ('site_description', 'Doces artesanais feitos com amor e carinho', 'Descrição do site', 'general', true),
  ('maintenance_mode', 'false', 'Modo de manutenção ativo', 'system', false),
  ('analytics_enabled', 'true', 'Analytics habilitado', 'system', false)
ON CONFLICT (key) DO NOTHING;

-- Fim do script
-- Execute este script completo no SQL Editor do Supabase Dashboard