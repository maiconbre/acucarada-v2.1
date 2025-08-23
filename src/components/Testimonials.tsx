import { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  id: number;
  name: string;
  image: string;
  rating: number;
  comment: string;
  location: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Maria Silva",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face",
    rating: 5,
    comment: "Os doces são simplesmente incríveis! Encomendei para o aniversário da minha filha e todos elogiaram. Entrega super rápida e tudo fresquinho!",
    location: "São Paulo, SP"
  },
  {
    id: 2,
    name: "João Santos",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
    rating: 5,
    comment: "Qualidade excepcional! Os brigadeiros gourmet são os melhores que já provei. Recomendo de olhos fechados!",
    location: "Rio de Janeiro, RJ"
  },
  {
    id: 3,
    name: "Ana Costa",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face",
    rating: 5,
    comment: "Atendimento perfeito! Fizeram exatamente como eu queria para o meu casamento. Os convidados não paravam de elogiar!",
    location: "Belo Horizonte, MG"
  },
  {
    id: 4,
    name: "Carlos Oliveira",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face",
    rating: 5,
    comment: "Sabor incrível e apresentação impecável! Sempre peço para eventos da empresa. Nunca decepciona!",
    location: "Brasília, DF"
  },
  {
    id: 5,
    name: "Fernanda Lima",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face",
    rating: 5,
    comment: "Doces artesanais de primeira qualidade! O carinho e dedicação em cada doce é visível. Virei cliente fiel!",
    location: "Porto Alegre, RS"
  }
];

export function Testimonials() {
  const [translateX, setTranslateX] = useState(0);
  const cardWidth = 400; // largura de cada card + gap
  const totalWidth = testimonials.length * cardWidth;

  useEffect(() => {
    const interval = setInterval(() => {
      setTranslateX((prev) => {
        const newTranslateX = prev - 1;
        // Reset quando completar um ciclo completo
        if (Math.abs(newTranslateX) >= totalWidth) {
          return 0;
        }
        return newTranslateX;
      });
    }, 20); // movimento mais suave

    return () => clearInterval(interval);
  }, [totalWidth]);

  // Duplicar testimonials para criar efeito infinito
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <section className="pt-16 pb-0 bg-background">
      <div className="container mx-auto px-4 pb-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-title">
            O que nossos clientes dizem
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-text">
            Depoimentos reais de quem já provou nossos doces artesanais
          </p>
        </div>

        <div className="relative overflow-hidden h-80">
          <div 
            className="flex gap-6 transition-none"
            style={{
              transform: `translateX(${translateX}px)`,
              width: `${totalWidth * 2}px`
            }}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.id}-${index}`}
                className="flex-shrink-0"
                style={{ width: `${cardWidth - 24}px` }}
              >
                <Card className="h-72 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className="relative">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                          loading="lazy"
                        />
                        <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1">
                          <Quote className="h-3 w-3 text-primary-foreground" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-semibold text-foreground text-lg font-title">
                          {testimonial.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2 font-text">
                          {testimonial.location}
                        </p>
                        <div className="flex">
                          {renderStars(testimonial.rating)}
                        </div>
                      </div>
                    </div>
                    <blockquote className="text-muted-foreground italic leading-relaxed flex-1 flex items-center font-text">
                      "{testimonial.comment}"
                    </blockquote>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>




      </div>
    </section>
  );
}