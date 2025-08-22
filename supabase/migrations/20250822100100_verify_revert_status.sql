-- Script de verificação: Confirmar que a reversão foi aplicada corretamente
-- Este script verifica se as tabelas estão no estado original

-- Verificar estrutura da tabela categories
SELECT 
    'categories' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'categories'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela products
SELECT 
    'products' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;

-- Verificar se views hierárquicas foram removidas
SELECT 
    'views_removed' as check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN 'OK - Nenhuma view hierárquica encontrada'
        ELSE 'ATENÇÃO - ' || COUNT(*) || ' views hierárquicas ainda existem'
    END as status
FROM information_schema.views 
WHERE table_schema = 'public' 
AND (table_name LIKE '%hierarchy%' OR table_name LIKE '%categories_with%');

-- Verificar se funções RPC específicas foram removidas
SELECT 
    'functions_removed' as check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN 'OK - Nenhuma função hierárquica encontrada'
        ELSE 'ATENÇÃO - ' || COUNT(*) || ' funções hierárquicas ainda existem: ' || string_agg(routine_name, ', ')
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'get_products_with_category_info',
    'get_products_by_delivery_type',
    'sync_product_delivery_type',
    'get_categories_with_hierarchy',
    'get_category_statistics',
    'rebalance_product_categories',
    'classify_category_delivery_type'
);

-- Verificar se índices específicos foram removidos
SELECT 
    'indexes_removed' as check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN 'OK - Nenhum índice hierárquico encontrado'
        ELSE 'ATENÇÃO - ' || COUNT(*) || ' índices hierárquicos ainda existem: ' || string_agg(indexname, ', ')
    END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname IN (
    'idx_products_category_id',
    'idx_products_delivery_type',
    'idx_products_is_featured_delivery',
    'idx_categories_parent_id',
    'idx_categories_delivery_type'
);

-- Verificar se triggers foram removidos
SELECT 
    'triggers_removed' as check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN 'OK - Nenhum trigger hierárquico encontrado'
        ELSE 'ATENÇÃO - ' || COUNT(*) || ' triggers hierárquicos ainda existem: ' || string_agg(trigger_name, ', ')
    END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name IN ('sync_product_delivery_type_trigger');

-- Verificar categorias existentes
SELECT 
    'categories_count' as check_type,
    COUNT(*) as total_categories,
    CASE 
        WHEN COUNT(*) = 6 THEN 'OK - 6 categorias padrão encontradas'
        ELSE 'ATENÇÃO - Número inesperado de categorias'
    END as status
FROM public.categories;

-- Listar categorias atuais
SELECT 
    'current_categories' as info_type,
    name,
    description,
    is_active
FROM public.categories
ORDER BY name;

-- Verificar se campos hierárquicos foram removidos das tabelas
SELECT 
    'hierarchical_fields_removed' as check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN 'OK - Nenhum campo hierárquico encontrado'
        ELSE 'ATENÇÃO - ' || COUNT(*) || ' campos hierárquicos ainda existem: ' || string_agg(table_name || '.' || column_name, ', ')
    END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND (
    (table_name = 'products' AND column_name IN ('category_id', 'delivery_type', 'preparation_time_days'))
    OR 
    (table_name = 'categories' AND column_name IN ('parent_id', 'delivery_type', 'is_master', 'sort_order'))
);

-- Verificar produtos sem categoria ou com categoria inválida
SELECT 
    'products_validation' as check_type,
    COUNT(*) as products_without_valid_category,
    CASE 
        WHEN COUNT(*) = 0 THEN 'OK - Todos os produtos têm categoria válida'
        ELSE 'ATENÇÃO - ' || COUNT(*) || ' produtos sem categoria válida'
    END as status
FROM public.products p
WHERE p.category IS NULL 
   OR p.category = '' 
   OR NOT EXISTS (
       SELECT 1 FROM public.categories c 
       WHERE c.name = p.category AND c.is_active = true
   );

-- Resumo final
SELECT 
    'RESUMO DA REVERSÃO' as titulo,
    'Estrutura hierárquica de categorias foi revertida' as descricao,
    'Campos, funções, índices e triggers hierárquicos foram removidos' as detalhes,
    'Tabelas categories e products retornaram ao estado original' as estado_tabelas,
    NOW() as timestamp_verificacao;

-- Verificação final de integridade
SELECT 
    'VERIFICAÇÃO FINAL' as tipo,
    (
        SELECT COUNT(*) FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'category'
    ) as campo_category_existe,
    (
        SELECT COUNT(*) FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name IN ('id', 'name', 'description', 'is_active', 'created_at', 'updated_at')
    ) as campos_originais_categories,
    (
        SELECT COUNT(*) FROM public.categories
    ) as total_categorias_atuais;