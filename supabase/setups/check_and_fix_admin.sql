-- Script de diagnóstico e correção de permissões
-- Execute este script no Supabase Dashboard > SQL Editor

-- DIAGNÓSTICO: Verificar usuário atual logado
SELECT auth.uid() as current_user_id;

-- DIAGNÓSTICO: Verificar todos os usuários na tabela profiles
SELECT 
  user_id,
  email,
  role,
  created_at,
  updated_at
FROM profiles;

-- DIAGNÓSTICO: Verificar se o usuário logado tem registro na tabela profiles
SELECT 
  p.user_id,
  p.email,
  p.role,
  auth.uid() as current_auth_uid,
  CASE 
    WHEN p.user_id = auth.uid() THEN 'MATCH' 
    ELSE 'NO MATCH' 
  END as user_match
FROM profiles p
WHERE p.user_id = auth.uid();

-- CORREÇÃO 1: Promover todos os usuários para admin (caso haja dessincronia)
UPDATE profiles 
SET role = 'admin', updated_at = NOW();

-- CORREÇÃO 2: Se não existir registro para o usuário atual, criar um
INSERT INTO profiles (user_id, email, role, created_at, updated_at)
SELECT 
  auth.uid(),
  au.email,
  'admin',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.id = auth.uid()
  AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = auth.uid()
  );

-- VERIFICAÇÃO FINAL: Confirmar que o usuário atual é admin
SELECT 
  user_id,
  email,
  role,
  CASE 
    WHEN user_id = auth.uid() AND role = 'admin' THEN 'READY TO UPDATE SETTINGS' 
    ELSE 'STILL HAS ISSUES' 
  END as status
FROM profiles
WHERE user_id = auth.uid();

-- TESTE: Tentar atualizar configuração
SELECT update_app_setting('whatsapp_number', '5521997760398');
