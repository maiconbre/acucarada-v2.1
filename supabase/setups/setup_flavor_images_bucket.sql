-- Script para configurar bucket de imagens de sabores
-- Criado para suportar imagens específicas por sabor de produto

BEGIN;

-- 1. Criar bucket para imagens de sabores
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-flavor-images',
  'product-flavor-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Remover políticas existentes se houver
DROP POLICY IF EXISTS "Public read access for flavor images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload flavor images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update flavor images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete flavor images" ON storage.objects;

-- 3. Política para permitir leitura pública das imagens
CREATE POLICY "Public read access for flavor images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-flavor-images');

-- 4. Política para permitir upload apenas para usuários autenticados
CREATE POLICY "Authenticated users can upload flavor images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'product-flavor-images' 
  AND auth.role() = 'authenticated'
);

-- 5. Política para permitir atualização apenas para usuários autenticados
CREATE POLICY "Authenticated users can update flavor images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'product-flavor-images' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'product-flavor-images' 
  AND auth.role() = 'authenticated'
);

-- 6. Política para permitir exclusão apenas para usuários autenticados
CREATE POLICY "Authenticated users can delete flavor images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'product-flavor-images' 
  AND auth.role() = 'authenticated'
);

COMMIT;

-- Exemplos de uso:
-- Upload: supabase.storage.from('product-flavor-images').upload('produto-id/sabor-nome.jpg', file)
-- URL pública: supabase.storage.from('product-flavor-images').getPublicUrl('produto-id/sabor-nome.jpg')
-- Estrutura sugerida: produto-id/sabor-nome.extensao
-- Exemplo: 123e4567-e89b-12d3-a456-426614174000/chocolate.jpg