-- Script para corrigir problemas de tipos nas funções RPC
-- Execute este script no Supabase Dashboard após executar o script principal

-- 1. Corrigir função get_public_settings
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

-- 2. Verificar se a tabela app_settings existe e tem os tipos corretos
DO $$
BEGIN
  -- Se a tabela não existir, criar com os tipos corretos
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'app_settings') THEN
    CREATE TABLE app_settings (
      id SERIAL PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'general',
      is_public BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ELSE
    -- Se a tabela existir, alterar os tipos das colunas se necessário
    ALTER TABLE app_settings 
      ALTER COLUMN key TYPE TEXT,
      ALTER COLUMN value TYPE TEXT,
      ALTER COLUMN description TYPE TEXT,
      ALTER COLUMN category TYPE TEXT;
  END IF;
END
$$;

-- 3. Inserir configurações padrão se não existirem
INSERT INTO app_settings (key, value, description, category, is_public) VALUES
  ('whatsapp_number', '5511999999999', 'Número do WhatsApp para contato', 'whatsapp', true),
  ('whatsapp_message', 'Olá! Gostaria de fazer um pedido dos seus doces artesanais.', 'Mensagem padrão do WhatsApp', 'whatsapp', true),
  ('site_name', 'Açucarada Doces', 'Nome do site', 'general', true),
  ('site_description', 'Doces artesanais feitos com amor e carinho', 'Descrição do site', 'general', true),
  ('maintenance_mode', 'false', 'Modo de manutenção ativo', 'system', false),
  ('analytics_enabled', 'true', 'Analytics habilitado', 'system', false)
ON CONFLICT (key) DO NOTHING;

-- 4. Atualizar função update_app_setting para garantir compatibilidade
CREATE OR REPLACE FUNCTION update_app_setting(
  setting_key TEXT,
  setting_value TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário é admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Permission denied: Only administrators can update app settings.';
  END IF;

  -- Atualizar a configuração
  UPDATE app_settings
  SET 
    value = setting_value::TEXT,
    updated_at = NOW()
  WHERE key = setting_key::TEXT;

  RETURN FOUND;
END;
$$;

-- 5. Verificar se as políticas RLS estão configuradas
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública de configurações públicas
CREATE POLICY "Public settings are viewable by everyone" ON app_settings
  FOR SELECT USING (is_public = true);

-- Política para admins gerenciarem todas as configurações
CREATE POLICY "Admins can manage all settings" ON app_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Conceder permissões necessárias
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON app_settings TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_public_settings() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_app_setting(TEXT, TEXT) TO authenticated;