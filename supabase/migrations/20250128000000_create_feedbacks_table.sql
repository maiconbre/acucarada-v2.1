-- Create feedbacks table for customer testimonials
CREATE TABLE public.feedbacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_username TEXT,
  feedback_text TEXT NOT NULL,
  image_url TEXT NOT NULL, -- URL da imagem do feedback (print)
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0, -- Para controlar ordem de exibição
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Create policies for feedbacks
CREATE POLICY "Feedbacks are viewable by everyone"
ON public.feedbacks
FOR SELECT
USING (is_active = true);

CREATE POLICY "Only admins can manage feedbacks"
ON public.feedbacks
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create trigger for updated_at
CREATE TRIGGER update_feedbacks_updated_at
  BEFORE UPDATE ON public.feedbacks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_feedbacks_active_order ON public.feedbacks(is_active, display_order);
CREATE INDEX idx_feedbacks_created_at ON public.feedbacks(created_at DESC);

-- Insert some mock data for fallback
INSERT INTO public.feedbacks (customer_name, customer_username, feedback_text, image_url, display_order) VALUES
('Maria Silva', 'mariasilva', 'Os doces são simplesmente incríveis! Encomendei para o aniversário da minha filha e todos elogiaram. Chegou tudo perfeito e o sabor é maravilhoso!', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop&fm=webp&q=80', 1),
('João Santos', 'joaosantos', 'Qualidade excepcional! Os brigadeiros gourmet são os melhores que já provei. Recomendo de olhos fechados!', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&fm=webp&q=80', 2),
('Ana Costa', 'anacosta', 'Atendimento perfeito e doces maravilhosos! Fizeram tudo com muito carinho para o meu casamento. Superou minhas expectativas!', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=400&fit=crop&fm=webp&q=80', 3),
('Carlos Oliveira', 'carlosoliveira', 'Sabor incrível e apresentação impecável! Sempre peço para eventos da empresa. Nunca decepciona!', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop&fm=webp&q=80', 4),
('Fernanda Lima', 'fernandalima', 'Doces artesanais de primeira qualidade! O carinho e dedicação em cada doce é visível. Virei cliente fiel!', 'https://img.elo7.com.br/product/zoom/1FEDB43/docinhos-gourmet-para-festas-casamentos-cento-de-docinhos-para-festa.jpg', 5),
('Pedro Almeida', 'pedroalmeida', 'Os melhores doces que já comi! A variedade é incrível e o sabor é divino. Recomendo a todos!', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop&fm=webp&q=80', 6),
('Sofia Mendes', 'sofiamendes', 'Perfeitos para qualquer ocasião! Meus convidados amaram e eu também. Com certeza farei novas encomendas.', 'https://i.pinimg.com/originals/1d/33/c5/1d33c579f19ed6b3395ab79c84361148.jpg', 7);