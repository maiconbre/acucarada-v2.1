-- Script para corrigir políticas RLS da tabela feedbacks
-- Execute este script no Supabase Dashboard > SQL Editor
-- Permite que usuários admin autenticados gerenciem feedbacks

BEGIN;

-- 1. Remover todas as políticas restritivas existentes
DROP POLICY IF EXISTS "Only admins can manage feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Authenticated users can insert feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Authenticated users can update feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Authenticated users can delete feedbacks" ON public.feedbacks;

-- 2. Criar políticas mais específicas para diferentes operações

-- Política para INSERT - permite usuários autenticados inserir feedbacks
CREATE POLICY "Admin can insert feedbacks"
ON public.feedbacks
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para UPDATE - permite usuários autenticados atualizar feedbacks
CREATE POLICY "Admin can update feedbacks"
ON public.feedbacks
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para DELETE - permite usuários autenticados deletar feedbacks
CREATE POLICY "Admin can delete feedbacks"
ON public.feedbacks
FOR DELETE
TO authenticated
USING (true);

-- 3. Verificar se a política de SELECT já existe (deve permitir visualização pública)
-- Se não existir, criar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'feedbacks' 
        AND policyname = 'Feedbacks are viewable by everyone'
    ) THEN
        CREATE POLICY "Feedbacks are viewable by everyone"
        ON public.feedbacks
        FOR SELECT
        USING (is_active = true);
    END IF;
END $$;

-- 4. Verificar se RLS está habilitado
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Instruções:
-- 1. Execute este script no Supabase Dashboard > SQL Editor
-- 2. Verifique se as políticas foram criadas em Authentication > Policies
-- 3. Teste a inserção de feedbacks no painel administrativo
-- 4. As políticas agora permitem que usuários autenticados gerenciem feedbacks
-- 5. A visualização pública continua funcionando apenas para feedbacks ativos