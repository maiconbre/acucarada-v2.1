-- Script para configurar o bucket de storage para imagens de produtos
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. Criar bucket para imagens de produtos (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Criar políticas de acesso para o bucket

-- Política para permitir visualização pública das imagens
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Política para permitir upload de imagens (usuários autenticados)
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN ('products', 'categories', 'temp')
);

-- Política para permitir atualização de imagens (usuários autenticados)
CREATE POLICY "Authenticated users can update images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
) WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir exclusão de imagens (usuários autenticados)
CREATE POLICY "Authenticated users can delete images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- 3. Criar função para limpeza de imagens órfãs
CREATE OR REPLACE FUNCTION cleanup_orphaned_images()
RETURNS TABLE(
  deleted_count INTEGER,
  deleted_files TEXT[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  orphaned_files TEXT[];
  file_record RECORD;
  deleted_files_array TEXT[] := '{}';
  total_deleted INTEGER := 0;
BEGIN
  -- Encontrar imagens órfãs (que não estão referenciadas em products.image_url)
  SELECT ARRAY_AGG(name) INTO orphaned_files
  FROM storage.objects 
  WHERE bucket_id = 'product-images'
    AND name NOT IN (
      SELECT REPLACE(image_url, 
        'https://yqzqybxtuatjfbwphvvo.supabase.co/storage/v1/object/public/product-images/', 
        ''
      )
      FROM products 
      WHERE image_url IS NOT NULL 
        AND image_url LIKE '%product-images%'
    )
    AND created_at < NOW() - INTERVAL '24 hours'; -- Apenas arquivos com mais de 24h

  -- Deletar arquivos órfãos
  IF orphaned_files IS NOT NULL THEN
    FOR file_record IN 
      SELECT unnest(orphaned_files) as file_name
    LOOP
      DELETE FROM storage.objects 
      WHERE bucket_id = 'product-images' 
        AND name = file_record.file_name;
      
      IF FOUND THEN
        deleted_files_array := array_append(deleted_files_array, file_record.file_name);
        total_deleted := total_deleted + 1;
      END IF;
    END LOOP;
  END IF;

  RETURN QUERY SELECT total_deleted, deleted_files_array;
END;
$$;

-- 4. Criar função para otimizar storage (compactar e reorganizar)
CREATE OR REPLACE FUNCTION optimize_storage_usage()
RETURNS TABLE(
  total_files INTEGER,
  total_size_mb NUMERIC,
  folders_info JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  storage_stats RECORD;
BEGIN
  -- Coletar estatísticas do storage
  SELECT 
    COUNT(*) as file_count,
    ROUND(SUM(metadata->>'size')::NUMERIC / 1024 / 1024, 2) as size_mb,
    JSONB_OBJECT_AGG(
      COALESCE((storage.foldername(name))[1], 'root'),
      JSONB_BUILD_OBJECT(
        'count', COUNT(*),
        'size_mb', ROUND(SUM(metadata->>'size')::NUMERIC / 1024 / 1024, 2)
      )
    ) as folder_stats
  INTO storage_stats
  FROM storage.objects 
  WHERE bucket_id = 'product-images';

  RETURN QUERY SELECT 
    storage_stats.file_count,
    storage_stats.size_mb,
    storage_stats.folder_stats;
END;
$$;

-- 5. Criar trigger para log de uploads
CREATE TABLE IF NOT EXISTS storage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bucket_id TEXT NOT NULL,
  object_name TEXT NOT NULL,
  action TEXT NOT NULL, -- 'upload', 'delete', 'update'
  user_id UUID REFERENCES auth.users(id),
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela de logs
ALTER TABLE storage_logs ENABLE ROW LEVEL SECURITY;

-- Política para logs (apenas usuários autenticados podem ver seus próprios logs)
CREATE POLICY "Users can view own storage logs" ON storage_logs
FOR SELECT USING (auth.uid() = user_id);

-- Função para registrar uploads
CREATE OR REPLACE FUNCTION log_storage_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO storage_logs (bucket_id, object_name, action, user_id, file_size, mime_type)
    VALUES (
      NEW.bucket_id,
      NEW.name,
      'upload',
      auth.uid(),
      (NEW.metadata->>'size')::BIGINT,
      NEW.metadata->>'mimetype'
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO storage_logs (bucket_id, object_name, action, user_id)
    VALUES (
      OLD.bucket_id,
      OLD.name,
      'delete',
      auth.uid()
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Criar trigger para log automático
DROP TRIGGER IF EXISTS storage_action_log ON storage.objects;
CREATE TRIGGER storage_action_log
  AFTER INSERT OR DELETE ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'product-images' OR OLD.bucket_id = 'product-images')
  EXECUTE FUNCTION log_storage_action();

-- 6. Criar view para estatísticas de storage
CREATE OR REPLACE VIEW storage_statistics AS
SELECT 
  bucket_id,
  COUNT(*) as total_files,
  ROUND(SUM((metadata->>'size')::BIGINT) / 1024.0 / 1024.0, 2) as total_size_mb,
  ROUND(AVG((metadata->>'size')::BIGINT) / 1024.0, 2) as avg_file_size_kb,
  MIN(created_at) as oldest_file,
  MAX(created_at) as newest_file,
  COUNT(DISTINCT owner) as unique_uploaders
FROM storage.objects
WHERE bucket_id = 'product-images'
GROUP BY bucket_id;

-- 7. Comentários e documentação
COMMENT ON TABLE storage_logs IS 'Log de ações realizadas no storage de imagens';
COMMENT ON FUNCTION cleanup_orphaned_images() IS 'Remove imagens órfãs que não estão sendo utilizadas por produtos';
COMMENT ON FUNCTION optimize_storage_usage() IS 'Retorna estatísticas de uso do storage para otimização';
COMMENT ON VIEW storage_statistics IS 'Estatísticas consolidadas do uso do storage de imagens';

-- Mensagem de sucesso
SELECT 'Storage bucket configurado com sucesso! Bucket: product-images' as status;

-- Verificar configuração
SELECT 
  'Bucket criado: ' || name as info
FROM storage.buckets 
WHERE id = 'product-images'
UNION ALL
SELECT 
  'Políticas criadas: ' || COUNT(*)::TEXT
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%product-images%' OR policyname LIKE '%Public Access%';