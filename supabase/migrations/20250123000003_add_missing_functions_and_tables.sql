-- Migration to add missing functions and fix database schema
-- This migration adds the missing RPC functions and updates table schemas

-- First, let's add missing columns to existing tables if they don't exist
ALTER TABLE product_analytics 
ADD COLUMN IF NOT EXISTS total_shares INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_clicks INTEGER DEFAULT 0;

-- Create product_shares table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  share_type VARCHAR(50) NOT NULL, -- 'whatsapp', 'facebook', 'copy_link', etc.
  page_source VARCHAR(255), -- where the share was initiated from
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255), -- for anonymous users
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_clicks table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  click_type VARCHAR(50) NOT NULL, -- 'whatsapp_order', 'view_details', 'add_to_cart', etc.
  page_source VARCHAR(255), -- where the click was initiated from
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255), -- for anonymous users
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255), -- for anonymous users
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id),
  UNIQUE(product_id, session_id)
);

-- Create product_views table if it doesn't exist (for tracking unique viewers)
CREATE TABLE IF NOT EXISTS product_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255), -- for anonymous users
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id, DATE(created_at)),
  UNIQUE(product_id, session_id, DATE(created_at))
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_shares_product_id ON product_shares(product_id);
CREATE INDEX IF NOT EXISTS idx_product_shares_user_id ON product_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_product_shares_session_id ON product_shares(session_id);
CREATE INDEX IF NOT EXISTS idx_product_shares_created_at ON product_shares(created_at);

CREATE INDEX IF NOT EXISTS idx_product_clicks_product_id ON product_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_product_clicks_user_id ON product_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_product_clicks_session_id ON product_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_product_clicks_created_at ON product_clicks(created_at);

CREATE INDEX IF NOT EXISTS idx_product_likes_product_id ON product_likes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_likes_user_id ON product_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_product_likes_session_id ON product_likes(session_id);
CREATE INDEX IF NOT EXISTS idx_product_likes_created_at ON product_likes(created_at);

CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_user_id ON product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_product_views_session_id ON product_views(session_id);
CREATE INDEX IF NOT EXISTS idx_product_views_created_at ON product_views(created_at);

-- Create or replace the get_public_settings function
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
    s.key,
    s.value,
    s.description,
    s.category
  FROM app_settings s
  WHERE s.is_public = true
  ORDER BY s.category, s.key;
END;
$$;

-- Create or replace the update_app_setting function
CREATE OR REPLACE FUNCTION update_app_setting(
  setting_key TEXT,
  setting_value TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Permission denied: Only administrators can update app settings.';
  END IF;

  -- Update the setting
  UPDATE app_settings
  SET 
    value = setting_value,
    updated_at = NOW()
  WHERE key = setting_key;

  -- Return true if a row was updated, false otherwise
  RETURN FOUND;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Create or replace the track_product_share function
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

-- Update the existing track_product_click function or create it
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

-- Create or replace the toggle_product_like function
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
  -- Check if like already exists
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
    -- Remove like
    IF p_user_id IS NOT NULL THEN
      DELETE FROM product_likes 
      WHERE product_id = p_product_id AND user_id = p_user_id;
    ELSE
      DELETE FROM product_likes 
      WHERE product_id = p_product_id AND session_id = p_session_id;
    END IF;
    
    -- Update analytics (decrease likes)
    UPDATE product_analytics 
    SET 
      total_likes = GREATEST(0, total_likes - 1),
      updated_at = NOW()
    WHERE product_id = p_product_id;
    
    is_liked := FALSE;
  ELSE
    -- Add like
    INSERT INTO product_likes (
      product_id,
      user_id,
      session_id,
      ip_address
    ) VALUES (
      p_product_id,
      p_user_id,
      p_session_id,
      p_ip_address
    );
    
    -- Update analytics (increase likes)
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

-- Create or replace the track_product_view function
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
  -- Insert the view record (with unique constraint to prevent duplicates per day)
  INSERT INTO product_views (
    product_id,
    user_id,
    session_id,
    ip_address,
    user_agent
  ) VALUES (
    p_product_id,
    p_user_id,
    p_session_id,
    p_ip_address,
    p_user_agent
  )
  ON CONFLICT DO NOTHING; -- Ignore if already viewed today
  
  -- Update analytics table (only if a new view was inserted)
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

-- Create trigger function to update analytics when shares/clicks are added
CREATE OR REPLACE FUNCTION update_product_analytics_on_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update or insert analytics record
  IF TG_TABLE_NAME = 'product_shares' THEN
    INSERT INTO product_analytics (product_id, total_shares)
    VALUES (NEW.product_id, 1)
    ON CONFLICT (product_id)
    DO UPDATE SET 
      total_shares = product_analytics.total_shares + 1,
      updated_at = NOW();
  ELSIF TG_TABLE_NAME = 'product_clicks' THEN
    INSERT INTO product_analytics (product_id, total_clicks)
    VALUES (NEW.product_id, 1)
    ON CONFLICT (product_id)
    DO UPDATE SET 
      total_clicks = product_analytics.total_clicks + 1,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers if they don't exist
DROP TRIGGER IF EXISTS trigger_update_analytics_on_share ON product_shares;
CREATE TRIGGER trigger_update_analytics_on_share
  AFTER INSERT ON product_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_product_analytics_on_activity();

DROP TRIGGER IF EXISTS trigger_update_analytics_on_click ON product_clicks;
CREATE TRIGGER trigger_update_analytics_on_click
  AFTER INSERT ON product_clicks
  FOR EACH ROW
  EXECUTE FUNCTION update_product_analytics_on_activity();

-- Enable RLS on new tables
ALTER TABLE product_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product_shares
CREATE POLICY "Anyone can insert shares" ON product_shares
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own shares" ON product_shares
  FOR SELECT USING (
    auth.uid() = user_id OR 
    user_id IS NULL
  );

-- Create RLS policies for product_clicks
CREATE POLICY "Anyone can insert clicks" ON product_clicks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own clicks" ON product_clicks
  FOR SELECT USING (
    auth.uid() = user_id OR 
    user_id IS NULL
  );

-- Create RLS policies for product_likes
CREATE POLICY "Anyone can insert likes" ON product_likes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete likes" ON product_likes
  FOR DELETE USING (
    auth.uid() = user_id OR 
    user_id IS NULL
  );

CREATE POLICY "Users can view their own likes" ON product_likes
  FOR SELECT USING (
    auth.uid() = user_id OR 
    user_id IS NULL
  );

-- Create RLS policies for product_views
CREATE POLICY "Anyone can insert views" ON product_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own views" ON product_views
  FOR SELECT USING (
    auth.uid() = user_id OR 
    user_id IS NULL
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT ON product_shares TO anon, authenticated;
GRANT SELECT, INSERT ON product_clicks TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON product_likes TO anon, authenticated;
GRANT SELECT, INSERT ON product_views TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_public_settings() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_app_setting(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION track_product_share(UUID, VARCHAR, VARCHAR, UUID, VARCHAR, INET, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION track_product_click(UUID, VARCHAR, VARCHAR, UUID, VARCHAR, INET, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION track_product_view(UUID, UUID, VARCHAR, INET, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION toggle_product_like(UUID, UUID, VARCHAR, INET) TO anon, authenticated;

-- Insert some default app settings if they don't exist
INSERT INTO app_settings (key, value, description, category, is_public)
VALUES 
  ('whatsapp_number', '5511999999999', 'Número do WhatsApp para contato', 'contact', true),
  ('whatsapp_message', 'Olá! Gostaria de fazer um pedido dos seus doces artesanais.', 'Mensagem padrão do WhatsApp', 'contact', true),
  ('site_name', 'Açucarada Doces', 'Nome do site', 'general', true),
  ('site_description', 'Doces artesanais feitos com amor e carinho', 'Descrição do site', 'general', true),
  ('maintenance_mode', 'false', 'Modo de manutenção ativo', 'system', false),
  ('analytics_enabled', 'true', 'Analytics habilitado', 'system', false)
ON CONFLICT (key) DO NOTHING;

-- Create a view for easier analytics querying
CREATE OR REPLACE VIEW product_analytics_summary AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  COALESCE(pa.total_likes, 0) as total_likes,
  COALESCE(pa.total_shares, 0) as total_shares,
  COALESCE(pa.total_clicks, 0) as total_clicks,
  COALESCE(pa.unique_viewers, 0) as unique_viewers,
  pa.created_at as analytics_created_at,
  pa.updated_at as analytics_updated_at
FROM products p
LEFT JOIN product_analytics pa ON p.id = pa.product_id
ORDER BY p.name;

-- Grant access to the view
GRANT SELECT ON product_analytics_summary TO authenticated;

COMMIT;