-- Script para configurar bucket de imagens de feedbacks
-- Execute este script no Supabase Dashboard > SQL Editor
-- Criado para suportar upload de imagens de feedbacks de clientes

BEGIN;

-- 1. Criar bucket para imagens de feedbacks
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'feedback-images',
  'feedback-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Remover políticas existentes se houver
DROP POLICY IF EXISTS "Public read access for feedback images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload feedback images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update feedback images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete feedback images" ON storage.objects;

-- 3. Política para permitir leitura pública das imagens
CREATE POLICY "Public read access for feedback images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'feedback-images');

-- 4. Política para permitir upload apenas para usuários autenticados
CREATE POLICY "Authenticated users can upload feedback images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'feedback-images' 
  AND auth.role() = 'authenticated'
);

-- 5. Política para permitir atualização apenas para usuários autenticados
CREATE POLICY "Authenticated users can update feedback images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'feedback-images' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'feedback-images' 
  AND auth.role() = 'authenticated'
);

-- 6. Política para permitir exclusão apenas para usuários autenticados
CREATE POLICY "Authenticated users can delete feedback images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'feedback-images' 
  AND auth.role() = 'authenticated'
);

-- 7. Função para limpeza de imagens órfãs de feedbacks
CREATE OR REPLACE FUNCTION cleanup_orphaned_feedback_images()
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
  -- Buscar arquivos no storage que não estão referenciados na tabela feedbacks
  SELECT ARRAY(
    SELECT name 
    FROM storage.objects 
    WHERE bucket_id = 'feedback-images'
    AND name NOT IN (
      SELECT SUBSTRING(image_url FROM '[^/]*$')
      FROM feedbacks 
      WHERE image_url IS NOT NULL 
      AND image_url LIKE '%feedback-images%'
    )
  ) INTO orphaned_files;
  
  -- Deletar arquivos órfãos
  FOR file_record IN 
    SELECT unnest(orphaned_files) as filename
  LOOP
    DELETE FROM storage.objects 
    WHERE bucket_id = 'feedback-images' 
    AND name = file_record.filename;
    
    IF FOUND THEN
      deleted_files_array := array_append(deleted_files_array, file_record.filename);
      total_deleted := total_deleted + 1;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT total_deleted, deleted_files_array;
END;
$$;

-- 8. Comentários para documentação
COMMENT ON FUNCTION cleanup_orphaned_feedback_images() IS 'Remove imagens órfãs do bucket feedback-images que não estão mais referenciadas na tabela feedbacks';

COMMIT;

-- Instruções de uso:
-- 1. Execute este script no Supabase Dashboard > SQL Editor
-- 2. Verifique se o bucket foi criado em Storage > Buckets
-- 3. Para limpar imagens órfãs, execute: SELECT * FROM cleanup_orphaned_feedback_images();
-- 4. O bucket suporta imagens JPEG, PNG, WebP e GIF com limite de 5MB
-- 5. Apenas usuários autenticados podem fazer upload, atualizar ou deletar imagens
-- 6. Todas as imagens são publicamente acessíveis para leitura