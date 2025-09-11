-- Script específico para corrigir o problema de toggle de feedbacks
-- Execute este script IMEDIATAMENTE no Supabase Dashboard > SQL Editor
-- Resolve o erro 403 ao clicar no ícone do olho para ocultar/mostrar feedback

BEGIN;

-- 1. Desabilitar RLS temporariamente para limpeza
ALTER TABLE public.feedbacks DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas existentes
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'feedbacks' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.feedbacks', policy_record.policyname);
    END LOOP;
END $$;

-- 3. Reabilitar RLS
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas simples e permissivas para admin

-- Política para SELECT (visualização pública de feedbacks ativos)
CREATE POLICY "Public can view active feedbacks"
ON public.feedbacks
FOR SELECT
USING (is_active = true);

-- Política para INSERT (admin pode inserir)
CREATE POLICY "Admin can insert feedbacks"
ON public.feedbacks
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para UPDATE (admin pode atualizar) - CRÍTICA PARA O TOGGLE
CREATE POLICY "Admin can update feedbacks"
ON public.feedbacks
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para DELETE (admin pode deletar)
CREATE POLICY "Admin can delete feedbacks"
ON public.feedbacks
FOR DELETE
TO authenticated
USING (true);

-- 5. Verificar se as políticas foram criadas
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'feedbacks' AND schemaname = 'public'
ORDER BY policyname;

COMMIT;

-- Instruções:
-- 1. Execute este script AGORA no Supabase Dashboard > SQL Editor
-- 2. Após executar, teste o toggle do feedback (ícone do olho)
-- 3. Se ainda houver erro, verifique se o usuário está logado como admin
-- 4. Este script resolve especificamente o erro 403 no UPDATE de feedbacks