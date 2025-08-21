-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'Outros',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for products (public read, admin write)
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Only authenticated users can manage products" 
ON public.products 
FOR ALL
USING (auth.role() = 'authenticated');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample products
INSERT INTO public.products (name, description, price, category, image_url, is_featured) VALUES
('Brigadeiro Gourmet', 'Brigadeiros artesanais com chocolate belga e coberturas especiais', 3.50, 'Brigadeiros', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=300&fit=crop', true),
('Trufa de Chocolate', 'Trufas cremosas com recheios variados e chocolate premium', 4.00, 'Trufas', 'https://images.unsplash.com/photo-1547043928-6adb67ae1a4f?w=500&h=300&fit=crop', true),
('Bem Casado', 'Tradicional doce de casamento com massa fofinha e doce de leite', 5.50, 'Especiais', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&h=300&fit=crop', false),
('Beijinho Premium', 'Beijinhos com coco fresco e toque especial da casa', 3.00, 'Tradicionais', 'https://images.unsplash.com/photo-1605681398213-d901a8e55b78?w=500&h=300&fit=crop', true),
('Alfajor Artesanal', 'Delicioso alfajor com doce de leite caseiro e coco', 6.00, 'Especiais', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=300&fit=crop', false),
('Petit Four', 'Mini bolos decorados perfeitos para ocasiões especiais', 7.50, 'Bolos', 'https://images.unsplash.com/photo-1535141919479-077b4ac741fc?w=500&h=300&fit=crop', true);