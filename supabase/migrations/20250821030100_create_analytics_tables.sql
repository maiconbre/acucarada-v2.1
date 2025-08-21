-- Create analytics tables for tracking user interactions

-- Table for product likes
CREATE TABLE public.product_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT, -- For anonymous users
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for product views
CREATE TABLE public.product_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT, -- For anonymous users
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for product clicks (detailed tracking)
CREATE TABLE public.product_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT, -- For anonymous users
  ip_address INET,
  click_type TEXT NOT NULL, -- 'view_details', 'like', 'image_click', etc.
  page_source TEXT, -- 'catalog', 'home', 'search', etc.
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for aggregated analytics (for performance)
CREATE TABLE public.product_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  total_likes INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id)
);

-- Enable Row Level Security
ALTER TABLE public.product_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for product_likes
CREATE POLICY "Anyone can view likes" 
ON public.product_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert likes" 
ON public.product_likes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can delete own likes" 
ON public.product_likes 
FOR DELETE 
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  (auth.uid() IS NULL AND session_id IS NOT NULL)
);

-- Policies for product_views
CREATE POLICY "Anyone can view analytics" 
ON public.product_views 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert views" 
ON public.product_views 
FOR INSERT 
WITH CHECK (true);

-- Policies for product_clicks
CREATE POLICY "Anyone can view clicks" 
ON public.product_clicks 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert clicks" 
ON public.product_clicks 
FOR INSERT 
WITH CHECK (true);

-- Policies for product_analytics
CREATE POLICY "Anyone can view product analytics" 
ON public.product_analytics 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can manage analytics" 
ON public.product_analytics 
FOR ALL
USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_product_likes_product_id ON public.product_likes(product_id);
CREATE INDEX idx_product_likes_user_id ON public.product_likes(user_id);
CREATE INDEX idx_product_likes_session_id ON public.product_likes(session_id);
CREATE INDEX idx_product_likes_created_at ON public.product_likes(created_at);

CREATE INDEX idx_product_views_product_id ON public.product_views(product_id);
CREATE INDEX idx_product_views_user_id ON public.product_views(user_id);
CREATE INDEX idx_product_views_session_id ON public.product_views(session_id);
CREATE INDEX idx_product_views_created_at ON public.product_views(created_at);

CREATE INDEX idx_product_clicks_product_id ON public.product_clicks(product_id);
CREATE INDEX idx_product_clicks_user_id ON public.product_clicks(user_id);
CREATE INDEX idx_product_clicks_session_id ON public.product_clicks(session_id);
CREATE INDEX idx_product_clicks_type ON public.product_clicks(click_type);
CREATE INDEX idx_product_clicks_created_at ON public.product_clicks(created_at);

-- Function to update analytics aggregations
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

-- Function to track product view
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
  -- Insert view record
  INSERT INTO public.product_views (
    product_id, user_id, session_id, ip_address, user_agent, referrer
  ) VALUES (
    p_product_id, p_user_id, p_session_id, p_ip_address, p_user_agent, p_referrer
  );
  
  -- Update analytics
  PERFORM update_product_analytics(p_product_id);
END;
$$ LANGUAGE plpgsql;

-- Function to track product click
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
  -- Insert click record
  INSERT INTO public.product_clicks (
    product_id, user_id, session_id, ip_address, click_type, page_source, user_agent
  ) VALUES (
    p_product_id, p_user_id, p_session_id, p_ip_address, p_click_type, p_page_source, p_user_agent
  );
  
  -- Update analytics
  PERFORM update_product_analytics(p_product_id);
END;
$$ LANGUAGE plpgsql;

-- Function to toggle product like
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
  -- Check if already liked
  SELECT id INTO existing_like_id
  FROM public.product_likes
  WHERE product_id = p_product_id
    AND (
      (p_user_id IS NOT NULL AND user_id = p_user_id) OR
      (p_user_id IS NULL AND session_id = p_session_id)
    );
  
  IF existing_like_id IS NOT NULL THEN
    -- Unlike: remove the like
    DELETE FROM public.product_likes WHERE id = existing_like_id;
    is_liked := false;
  ELSE
    -- Like: add new like
    INSERT INTO public.product_likes (product_id, user_id, session_id, ip_address)
    VALUES (p_product_id, p_user_id, p_session_id, p_ip_address);
    is_liked := true;
  END IF;
  
  -- Update analytics
  PERFORM update_product_analytics(p_product_id);
  
  RETURN is_liked;
END;
$$ LANGUAGE plpgsql;

-- Initialize analytics for existing products
INSERT INTO public.product_analytics (product_id)
SELECT id FROM public.products
ON CONFLICT (product_id) DO NOTHING;

-- Create triggers to automatically update analytics
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

-- Create triggers
CREATE TRIGGER trigger_likes_analytics
  AFTER INSERT OR DELETE ON public.product_likes
  FOR EACH ROW EXECUTE FUNCTION trigger_update_analytics();

CREATE TRIGGER trigger_views_analytics
  AFTER INSERT OR DELETE ON public.product_views
  FOR EACH ROW EXECUTE FUNCTION trigger_update_analytics();

CREATE TRIGGER trigger_clicks_analytics
  AFTER INSERT OR DELETE ON public.product_clicks
  FOR EACH ROW EXECUTE FUNCTION trigger_update_analytics();