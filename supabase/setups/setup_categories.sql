-- Execute este script no Supabase Dashboard > SQL Editor
-- para criar a tabela de categorias e dados iniciais

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories (public read, admin write)
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "Only authenticated users can manage categories" ON public.categories;
CREATE POLICY "Only authenticated users can manage categories" 
ON public.categories 
FOR ALL
USING (auth.role() = 'authenticated');

-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories (only if they don't exist)
INSERT INTO public.categories (name, description) 
SELECT * FROM (
  VALUES
    ('Brigadeiros', 'Brigadeiros tradicionais e gourmet'),
    ('Trufas', 'Trufas artesanais de diversos sabores'),
    ('Especiais', 'Doces especiais e edições limitadas'),
    ('Tradicionais', 'Doces tradicionais brasileiros'),
    ('Bolos', 'Bolos e tortas artesanais'),
    ('Outros', 'Outros tipos de doces')
) AS v(name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories WHERE categories.name = v.name
);

-- Verify the setup
SELECT 'Categories table created successfully!' as status;
SELECT * FROM public.categories ORDER BY name;