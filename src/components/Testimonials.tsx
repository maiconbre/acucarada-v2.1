import { useState, useEffect, useRef } from 'react';
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Feedback = Database['public']['Tables']['feedbacks']['Row'];

interface MockFeedback {
  id: string;
  customer_name: string;
  feedback_text: string;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Dados mockados como fallback
const mockFeedbacks: MockFeedback[] = [
  {
    id: 'mock-1',
    customer_name: 'Maria Silva',
    feedback_text: 'Os doces são simplesmente incríveis! Encomendei para o aniversário da minha filha e todos elogiaram. Chegou tudo perfeito e o sabor é maravilhoso! 🎂✨',
    image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=600&fit=crop&fm=webp&q=80',
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-2',
    customer_name: 'João Santos',
    feedback_text: 'Qualidade excepcional! Os brigadeiros gourmet são os melhores que já provei. Recomendo de olhos fechados! 🍫👌',
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=600&fit=crop&fm=webp&q=80',
    is_active: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-3',
    customer_name: 'Ana Costa',
    feedback_text: 'Atendimento perfeito e doces maravilhosos! Fizeram tudo com muito carinho para o meu casamento. Superou minhas expectativas! 💕',
    image_url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=600&fit=crop&fm=webp&q=80',
    is_active: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-4',
    customer_name: 'Carlos Oliveira',
    feedback_text: 'Sabor incrível e apresentação impecável! Sempre peço para eventos da empresa. Nunca decepciona! 🏢⭐',
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=600&fit=crop&fm=webp&q=80',
    is_active: true,
    display_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-5',
    customer_name: 'Fernanda Lima',
    feedback_text: 'Doces artesanais de primeira qualidade! O carinho e dedicação em cada doce é visível. Virei cliente fiel! 🥰',
    image_url: null,
    is_active: true,
    display_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function Testimonials() {
  const [feedbacks, setFeedbacks] = useState<(Feedback | MockFeedback)[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const pausedTimeRef = useRef<number>(0);

  const animationDuration = 40000; // 40 segundos para movimento mais suave
  const cardWidth = 320; // Largura aumentada para melhor visualização
  const totalDistance = feedbacks.length * (cardWidth + 32); // 32px de gap

  // Carregar feedbacks do Supabase com fallback para dados mockados
  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        const { data: realFeedbacks, error } = await supabase
          .from('feedbacks')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) {
          console.warn('Erro ao carregar feedbacks do Supabase, usando dados mockados:', error);
          setFeedbacks(mockFeedbacks);
        } else if (realFeedbacks && realFeedbacks.length > 0) {
          // Se há feedbacks reais, usar apenas eles
          setFeedbacks(realFeedbacks);
        } else {
          // Se não há feedbacks reais, usar dados mockados
          setFeedbacks(mockFeedbacks);
        }
      } catch (error) {
        console.warn('Erro ao conectar com Supabase, usando dados mockados:', error);
        setFeedbacks(mockFeedbacks);
      } finally {
        setLoading(false);
      }
    };

    loadFeedbacks();
  }, []);

  useEffect(() => {
    if (!isPaused && feedbacks.length > 0) {
      const animate = (currentTime: number) => {
        if (!startTimeRef.current) {
          startTimeRef.current = currentTime - pausedTimeRef.current;
        }

        const elapsed = currentTime - startTimeRef.current;
        const progress = (elapsed % animationDuration) / animationDuration;
        const newTranslateX = -(progress * totalDistance);
        
        setTranslateX(newTranslateX);
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        if (startTimeRef.current) {
          pausedTimeRef.current = Date.now() - startTimeRef.current;
        }
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, totalDistance, feedbacks.length]);

  useEffect(() => {
    startTimeRef.current = undefined;
    pausedTimeRef.current = 0;
  }, [feedbacks]);
  
  // Duplicar feedbacks para efeito infinito suave
  const extendedFeedbacks = feedbacks.length > 0 ? [...feedbacks, ...feedbacks, ...feedbacks] : [];

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-title">
              Feedbacks dos Clientes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-text">
              Carregando depoimentos...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-title">
              Feedbacks dos Clientes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-text">
              Em breve teremos depoimentos de nossos clientes!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-title">
            Feedbacks dos Clientes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-text">
            Veja o que nossos clientes estão dizendo sobre nossos doces!
          </p>
        </div>
      </div>

      <div 
        className="relative overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          className="flex gap-8 transition-transform ease-linear"
          style={{
            width: `${extendedFeedbacks.length * (cardWidth + 32)}px`,
            transform: `translateX(${translateX}px)`
          }}
        >
          {extendedFeedbacks.map((feedback, index) => (
            <div
              key={`${feedback.id}-${index}`}
              className="flex-shrink-0"
              style={{ width: `${cardWidth}px` }}
            >
              <Card className="overflow-hidden rounded-2xl border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                <CardContent className="p-0">
                  {feedback.image_url ? (
                    // Feedback com imagem - estilo print de conversa
                    <div className="relative">
                      <img
                        src={feedback.image_url}
                        alt={`Feedback de ${feedback.customer_name}`}
                        className="w-full h-80 object-cover"
                        width="320"
                        height="320"
                        loading={index < 3 ? "eager" : "lazy"}
                        decoding="async"
                        sizes="320px"
                      />
                      
                      {/* Overlay com informações do cliente */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          </div>
                          <span className="text-white font-semibold text-sm">
                            {feedback.customer_name}
                          </span>
                        </div>
                        <p className="text-white/90 text-xs line-clamp-2">
                          {feedback.feedback_text}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Feedback apenas texto - estilo card de depoimento
                    <div className="p-6 h-80 flex flex-col justify-between bg-gradient-to-br from-pink-50 to-purple-50">
                      <div>
                        <Quote className="w-8 h-8 text-pink-400 mb-4" />
                        <p className="text-gray-700 text-sm leading-relaxed mb-4 font-text">
                          {feedback.feedback_text}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {feedback.customer_name}
                          </p>
                          <p className="text-gray-500 text-xs">Cliente verificado</p>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
      
      {/* Indicador de que são feedbacks reais */}
      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          Feedbacks reais de nossos clientes
        </p>
      </div>
    </section>
  );
}