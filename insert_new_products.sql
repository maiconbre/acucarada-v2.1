-- Script para inserir novos produtos no catálogo da Açucarada
-- Criado em: $(date)
-- Todos os produtos terão validade de 3 dias conforme solicitado

BEGIN;


-- 🍰 Fatia de Bolo R$16,00
INSERT INTO public.products (
  name, 
  description, 
  price, 
  category, 
  ingredientes, 
  validade_armazenamento_dias, 
  sabores, 
  is_featured, 
  is_active
) VALUES (
  'Fatia de Bolo',
  'Fatias generosas de bolos artesanais com recheios cremosos e sabores únicos.',
  16.00,
  'Bolos',
  'Massa de chocolate, brigadeiro de ninho, geleia de morango, brigadeiro tradicional, granulado de chocolate nobre, nutella',
  3,
  ARRAY['Três Amores', 'Ninho com Nutella'],
  true,
  true
);

-- 🍓 Copo Duo Morango R$15,00
INSERT INTO public.products (
  name, 
  description, 
  price, 
  category, 
  ingredientes, 
  validade_armazenamento_dias, 
  is_featured, 
  is_active
) VALUES (
  'Copo Duo Morango',
  'Uma experiência única em camadas: brigadeiro tradicional, brownie molhadinho, morango fresco, brigadeiro cremoso de ninho e finalizado com nutella. Servido em copo de 205ml.',
  15.00,
  'Especiais',
  'Brigadeiro tradicional, brownie, morango fresco, brigadeiro de ninho, nutella',
  3,
  true,
  true
);

-- 🍫 Fatia Brownie
INSERT INTO public.products (
  name, 
  description, 
  price, 
  category, 
  ingredientes, 
  validade_armazenamento_dias, 
  sabores, 
  is_featured, 
  is_active
) VALUES (
  'Fatia Brownie',
  'Brownies molhadinhos e irresistíveis com coberturas especiais e ingredientes premium.',
  16.00,
  'Bolos',
  'Brownie, brigadeiro de ninho, nutella, biscoito kinder bueno, morango, brigadeiro tradicional, kit kat, amendoim, bombom ferrero rocher',
  3,
  ARRAY['Ninho com Nutella', 'Kit Kat', 'Ferrero'],
  true,
  true
);

-- 🍪 Torta Cookie com Nutella R$18,00
INSERT INTO public.products (
  name, 
  description, 
  price, 
  category, 
  ingredientes, 
  validade_armazenamento_dias, 
  is_featured, 
  is_active
) VALUES (
  'Torta Cookie com Nutella',
  'Fatia extremamente crocante por fora e macia por dentro, com base feita de cookie artesanal e recheada com abundante nutella.',
  18.00,
  'Bolos',
  'Cookie artesanal, nutella, farinha de trigo, açúcar, manteiga, ovos',
  3,
  true,
  true
);

-- 🍇 Caixa de Bombom de Uva R$12,00
INSERT INTO public.products (
  name, 
  description, 
  price, 
  category, 
  ingredientes, 
  validade_armazenamento_dias, 
  is_featured, 
  is_active
) VALUES (
  'Caixa de Bombom de Uva',
  'Caixa com quatro bombons especiais, cada um com recheio de brigadeiro de ninho banhado em chocolate e uma uva fresca no centro.',
  12.00,
  'Brigadeiros',
  'Uva fresca, brigadeiro de ninho, chocolate ao leite, leite condensado, leite ninho, manteiga',
  3,
  true,
  true
);

-- 🍇 Bombom Aberto de Uva R$8,00
INSERT INTO public.products (
  name, 
  description, 
  price, 
  category, 
  ingredientes, 
  validade_armazenamento_dias, 
  is_featured, 
  is_active
) VALUES (
  'Bombom Aberto de Uva',
  'Pedaços de uva fresca cobertos com brigadeiro cremoso de ninho e finalizados com ganache de chocolate ao leite.',
  8.00,
  'Brigadeiros',
  'Uva fresca, brigadeiro de ninho, ganache de chocolate ao leite, leite condensado, leite ninho, manteiga',
  3,
  true,
  true
);

-- 🍓 Coxinha de Morango R$15,00
INSERT INTO public.products (
  name, 
  description, 
  price, 
  category, 
  ingredientes, 
  validade_armazenamento_dias, 
  sabores, 
  is_featured, 
  is_active
) VALUES (
  'Coxinha de Morango',
  'Coxinhas doces inovadoras com morango fresco e diferentes combinações de brigadeiro e coberturas especiais.',
  15.00,
  'Especiais',
  'Morango fresco, brigadeiro tradicional, brigadeiro de ninho, nutella, amendoim, granulado de chocolate branco, granulado de chocolate ao leite',
  3,
  ARRAY['Ferrero', 'Ninho com Nutella', 'Ninho', 'Tradicional'],
  true,
  true
);

-- 🍓 Kit Coxinha de Morango R$35,00
INSERT INTO public.products (
  name, 
  description, 
  price, 
  category, 
  ingredientes, 
  validade_armazenamento_dias, 
  sabores, 
  is_featured, 
  is_active
) VALUES (
  'Kit Coxinha de Morango',
  'Caixa especial com os quatro sabores de coxinha de morango em versão menor: perfeita para experimentar todos os sabores.',
  35.00,
  'Especiais',
  'Morango fresco, brigadeiro de ninho, nutella, granulado de chocolate branco, brigadeiro tradicional, granulado de chocolate ao leite, amendoim',
  3,
  ARRAY['Ninho com Nutella', 'Ninho com Granulado Branco', 'Tradicional com Granulado', 'Ferrero'],
  true,
  true
);

-- 🍿 Pipoca Gourmet R$10,00
INSERT INTO public.products (
  name, 
  description, 
  price, 
  category, 
  ingredientes, 
  validade_armazenamento_dias, 
  is_featured, 
  is_active
) VALUES (
  'Pipoca Gourmet',
  'Pipoca caramelizada banhada em chocolate branco e finalizada com abundante leite ninho. Sequinha e crocante.',
  10.00,
  'Outros',
  'Pipoca, caramelo, chocolate branco, leite ninho, açúcar',
  3,
  true,
  true
);

-- Primeiro, inserir as novas categorias necessárias
INSERT INTO public.categories (name, description) 
SELECT * FROM (
  VALUES
    ('Salgados', 'Salgados artesanais e tradicionais'),
    ('Bebidas', 'Bebidas e refrigerantes')
) AS v(name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories WHERE categories.name = v.name
);

-- 🍗 Coxinha de Frango com Catupiry R$12,00
INSERT INTO public.products (
  name, 
  description, 
  price, 
  category, 
  ingredientes, 
  validade_armazenamento_dias, 
  is_featured, 
  is_active
) VALUES (
  'Coxinha de Frango com Catupiry',
  'O salgado que fideliza todos os nossos clientes! Empanada na farinha Panko para extra crocância, com massa levinha e completamente recheada com frango e Catupiry Original.',
  12.00,
  'Salgados',
  'Frango desfiado, catupiry original, farinha de trigo, farinha panko, ovos, leite, manteiga, temperos',
  3,
  true,
  true
);

-- 🦐 Empadão de Camarão com Catupiry R$15,00
INSERT INTO public.products (
  name, 
  description, 
  price, 
  category, 
  ingredientes, 
  validade_armazenamento_dias, 
  is_featured, 
  is_active
) VALUES (
  'Empadão de Camarão com Catupiry',
  'Muito amado pelos nossos clientes! Massa levinha recheada com camarão saboroso e finalizado com Catupiry Original.',
  15.00,
  'Salgados',
  'Camarão, catupiry original, farinha de trigo, manteiga, ovos, temperos especiais, azeite',
  3,
  true,
  true
);

-- 🥤 Coca-Cola Lata 350ml R$5,00
INSERT INTO public.products (
  name, 
  description, 
  price, 
  category, 
  ingredientes, 
  validade_armazenamento_dias, 
  is_featured, 
  is_active
) VALUES (
  'Coca-Cola Lata 350ml',
  'Refrigerante Coca-Cola tradicional em lata de 350ml, gelado e refrescante.',
  5.00,
  'Bebidas',
  'Água gaseificada, açúcar, extrato de noz de cola, cafeína, acidulante, aromatizante',
  90,
  false,
  true
);

-- 🥤 Coca-Cola Zero Lata 350ml R$7,00
INSERT INTO public.products (
  name, 
  description, 
  price, 
  category, 
  ingredientes, 
  validade_armazenamento_dias, 
  is_featured, 
  is_active
) VALUES (
  'Coca-Cola Zero Lata 350ml',
  'Refrigerante Coca-Cola Zero açúcar em lata de 350ml, todo o sabor sem açúcar.',
  7.00,
  'Bebidas',
  'Água gaseificada, edulcorantes, extrato de noz de cola, cafeína, acidulante, aromatizante',
  90,
  false,
  true
);

COMMIT;

-- Verificar inserções
SELECT 'Produtos inseridos com sucesso!' as status;
SELECT COUNT(*) as total_produtos_inseridos FROM public.products WHERE created_at >= NOW() - INTERVAL '1 minute';

-- Listar produtos recém inseridos
SELECT 
  name,
  price,
  category,
  validade_armazenamento_dias,
  array_length(sabores, 1) as quantidade_sabores
FROM public.products 
WHERE created_at >= NOW() - INTERVAL '1 minute'
ORDER BY name;