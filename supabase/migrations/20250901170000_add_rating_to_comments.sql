-- Adiciona a coluna 'rating' à tabela 'comments'
ALTER TABLE public.comments
ADD COLUMN rating INTEGER NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5);
