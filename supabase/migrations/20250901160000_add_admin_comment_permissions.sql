-- Adiciona permissões de administrador para gerenciar comentários

-- Esta política permite que usuários com a role 'admin' leiam TODOS os comentários,
-- independentemente do status de aprovação.
-- Ela funciona EM CONJUNTO com a política existente para usuários normais.
CREATE POLICY "Allow admin to read all comments"
ON public.comments
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

-- Esta política permite que usuários com a role 'admin' atualizem TODOS os comentários
-- (essencial para aprovar um comentário mudando `is_approved` para `true`).
CREATE POLICY "Allow admin to update all comments"
ON public.comments
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

-- Esta política permite que usuários com a role 'admin' deletem TODOS os comentários.
CREATE POLICY "Allow admin to delete all comments"
ON public.comments
FOR DELETE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);
