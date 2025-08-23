-- Execute este script no Supabase Dashboard > SQL Editor
-- para remover completamente o campo is_master do ambiente de produção

-- IMPORTANTE: Execute este script no ambiente de produção para resolver
-- o erro "record 'new' has no field 'is_master'"

-- 1. Verificar se o campo is_master ainda existe
SELECT 
    'VERIFICAÇÃO INICIAL' as status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'categories' 
            AND column_name = 'is_master'
        ) THEN 'Campo is_master EXISTE - será removido'
        ELSE 'Campo is_master NÃO EXISTE - verificando outras referências'
    END as resultado;

-- 2. Remover o campo is_master se ainda existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'is_master'
    ) THEN
        ALTER TABLE public.categories DROP COLUMN is_master CASCADE;
        RAISE NOTICE 'Campo is_master removido da tabela categories';
    ELSE
        RAISE NOTICE 'Campo is_master já não existe na tabela categories';
    END IF;
END $$;

-- 3. Verificar e remover funções que referenciam is_master
DO $$
DECLARE
    func_record RECORD;
    func_count INTEGER := 0;
BEGIN
    FOR func_record IN 
        SELECT routine_name, routine_schema
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
        AND routine_type = 'FUNCTION'
        AND routine_definition ILIKE '%is_master%'
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I.%I CASCADE', func_record.routine_schema, func_record.routine_name);
        RAISE NOTICE 'Função removida: %', func_record.routine_name;
        func_count := func_count + 1;
    END LOOP;
    
    IF func_count = 0 THEN
        RAISE NOTICE 'Nenhuma função com referência a is_master encontrada';
    ELSE
        RAISE NOTICE 'Total de % função(ões) removida(s)', func_count;
    END IF;
END $$;

-- 4. Verificar e remover triggers que referenciam is_master
DO $$
DECLARE
    trigger_record RECORD;
    trigger_count INTEGER := 0;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
        AND (
            trigger_name ILIKE '%master%' 
            OR trigger_name ILIKE '%is_master%'
        )
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I CASCADE', trigger_record.trigger_name, trigger_record.event_object_table);
        RAISE NOTICE 'Trigger removido: %', trigger_record.trigger_name;
        trigger_count := trigger_count + 1;
    END LOOP;
    
    IF trigger_count = 0 THEN
        RAISE NOTICE 'Nenhum trigger com referência a is_master encontrado';
    ELSE
        RAISE NOTICE 'Total de % trigger(s) removido(s)', trigger_count;
    END IF;
END $$;

-- 5. Verificar e remover views que referenciam is_master
DO $$
DECLARE
    view_record RECORD;
    view_count INTEGER := 0;
BEGIN
    FOR view_record IN 
        SELECT table_name
        FROM information_schema.views 
        WHERE table_schema = 'public'
        AND view_definition ILIKE '%is_master%'
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I CASCADE', view_record.table_name);
        RAISE NOTICE 'View removida: %', view_record.table_name;
        view_count := view_count + 1;
    END LOOP;
    
    IF view_count = 0 THEN
        RAISE NOTICE 'Nenhuma view com referência a is_master encontrada';
    ELSE
        RAISE NOTICE 'Total de % view(s) removida(s)', view_count;
    END IF;
END $$;

-- 6. Verificar constraints que podem referenciar is_master
DO $$
DECLARE
    constraint_record RECORD;
    constraint_count INTEGER := 0;
BEGIN
    FOR constraint_record IN 
        SELECT constraint_name, table_name
        FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public'
        AND constraint_name ILIKE '%master%'
    LOOP
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I CASCADE', constraint_record.table_name, constraint_record.constraint_name);
        RAISE NOTICE 'Constraint removida: %', constraint_record.constraint_name;
        constraint_count := constraint_count + 1;
    END LOOP;
    
    IF constraint_count = 0 THEN
        RAISE NOTICE 'Nenhuma constraint com referência a master encontrada';
    ELSE
        RAISE NOTICE 'Total de % constraint(s) removida(s)', constraint_count;
    END IF;
END $$;

-- 7. Verificação final
SELECT 
    'VERIFICAÇÃO FINAL' as status,
    CASE 
        WHEN COUNT(*) = 0 THEN 'SUCESSO - Nenhuma referência a is_master encontrada'
        ELSE 'ATENÇÃO - ' || COUNT(*) || ' referência(s) a is_master ainda existem'
    END as resultado
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'is_master';

-- 8. Verificar estrutura atual da tabela categories
SELECT 
    'ESTRUTURA ATUAL DA TABELA CATEGORIES' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'categories'
ORDER BY ordinal_position;

-- Mensagem final
SELECT 'Campo is_master e todas as suas referências foram removidos com sucesso!' as status_final;