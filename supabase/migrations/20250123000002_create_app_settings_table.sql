-- Create app_settings table for centralized system configuration
-- This table will store global application settings like WhatsApp number, etc.

CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT false, -- Whether this setting can be accessed by non-admin users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Admins can do everything
CREATE POLICY "Admins can manage all settings" ON public.app_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Public users can only read public settings
CREATE POLICY "Public can read public settings" ON public.app_settings
  FOR SELECT USING (is_public = true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON public.app_settings(key);
CREATE INDEX IF NOT EXISTS idx_app_settings_category ON public.app_settings(category);
CREATE INDEX IF NOT EXISTS idx_app_settings_is_public ON public.app_settings(is_public);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_app_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_app_settings_updated_at_trigger
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_app_settings_updated_at();

-- Insert default settings
INSERT INTO public.app_settings (key, value, description, category, is_public) VALUES
  ('whatsapp_number', '5511999999999', 'Número do WhatsApp para contato (com código do país)', 'contact', true),
  ('whatsapp_message', 'Olá! Gostaria de fazer um pedido dos seus doces artesanais.', 'Mensagem padrão para WhatsApp', 'contact', true),
  ('site_name', 'Açucarada Doces', 'Nome do site/empresa', 'general', true),
  ('site_description', 'Doces artesanais feitos com amor e carinho', 'Descrição do site/empresa', 'general', true),
  ('maintenance_mode', 'false', 'Modo de manutenção do site', 'system', false),
  ('analytics_enabled', 'true', 'Habilitar coleta de analytics', 'system', false)
ON CONFLICT (key) DO NOTHING;

-- Create helper functions

-- Function to get a setting value
CREATE OR REPLACE FUNCTION get_app_setting(setting_key TEXT)
RETURNS TEXT AS $$
DECLARE
  setting_value TEXT;
BEGIN
  SELECT value INTO setting_value
  FROM public.app_settings
  WHERE key = setting_key;
  
  RETURN setting_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a setting (admin only)
CREATE OR REPLACE FUNCTION update_app_setting(setting_key TEXT, setting_value TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN := false;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  -- Update the setting
  UPDATE public.app_settings
  SET value = setting_value, updated_at = now()
  WHERE key = setting_key;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get public settings (for frontend)
CREATE OR REPLACE FUNCTION get_public_settings()
RETURNS TABLE(
  key TEXT,
  value TEXT,
  description TEXT,
  category TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    app_settings.key,
    app_settings.value,
    app_settings.description,
    app_settings.category
  FROM public.app_settings
  WHERE is_public = true
  ORDER BY category, key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE public.app_settings IS 'Tabela para configurações globais da aplicação';
COMMENT ON COLUMN public.app_settings.key IS 'Chave única da configuração';
COMMENT ON COLUMN public.app_settings.value IS 'Valor da configuração (sempre texto)';
COMMENT ON COLUMN public.app_settings.description IS 'Descrição da configuração';
COMMENT ON COLUMN public.app_settings.category IS 'Categoria da configuração (general, contact, system, etc.)';
COMMENT ON COLUMN public.app_settings.is_public IS 'Se a configuração pode ser acessada por usuários não-admin';
COMMENT ON FUNCTION get_app_setting IS 'Função para obter valor de uma configuração';
COMMENT ON FUNCTION update_app_setting IS 'Função para atualizar uma configuração (apenas admins)';
COMMENT ON FUNCTION get_public_settings IS 'Função para obter todas as configurações públicas';