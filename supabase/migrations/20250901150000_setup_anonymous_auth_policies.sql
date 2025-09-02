-- Definição das Políticas de RLS para Autenticação Anônima
-- Este script configura as permissões para as tabelas `profiles` e `comments`,
-- garantindo que usuários anônimos e autenticados possam acessar apenas os dados permitidos.

-- 1. Garante que a RLS (Row-Level Security) esteja habilitada nas tabelas.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 2. Remove políticas antigas para evitar conflitos.
-- Sinta-se à vontade para adicionar outros nomes de políticas antigas que você possa ter criado.
DROP POLICY IF EXISTS "Allow individual user to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow read on approved or own comments" ON public.comments;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Enable read for authenticated users only" ON public.comments;

-- 3. Política para a tabela `profiles`
-- Permite que um usuário (anônimo ou autenticado) leia APENAS o seu próprio perfil.
-- A função `auth.uid()` retorna o ID do usuário da sessão JWT atual.
CREATE POLICY "Allow individual user to read their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- 4. Política para a tabela `comments`
-- Permite que um usuário leia comentários que já foram aprovados (`is_approved = true`)
-- OU os comentários que ele mesmo criou (mesmo que ainda não aprovados).
CREATE POLICY "Allow read on approved or own comments"
ON public.comments
FOR SELECT
USING (
  is_approved = true OR auth.uid() = user_id
);

-- 5. Concede permissão de SELECT às roles `anon` e `authenticated`.
-- A RLS irá filtrar quais linhas eles podem ver com base nas políticas acima.
GRANT SELECT ON TABLE public.profiles TO anon, authenticated;
GRANT SELECT ON TABLE public.comments TO anon, authenticated;

