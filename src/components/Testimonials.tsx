import { useState, useEffect, useRef } from 'react';
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  id: number;
  name: string;
  username: string;
  userImage: string;
  postImage: string;
  comment: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Maria Silva",
    username: "mariasilva",
    userImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face",
    postImage: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop&fm=webp&q=80",
    comment: "Os doces são simplesmente incríveis! Encomendei para o aniversário da minha filha e todos elogiaram. Chegou tudo perfeito e o sabor é maravilhoso! Recomendo muito, com certeza pedirei novamente em outras ocasiões.",
  },
  {
    id: 2,
    name: "João Santos",
    username: "joaosantos",
    userImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
    postImage: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&fm=webp&q=80",
    comment: "Qualidade excepcional! Os brigadeiros gourmet são os melhores que já provei. Recomendo de olhos fechados!",
  },
  {
    id: 3,
    name: "Ana Costa",
    username: "anacosta",
    userImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
    postImage: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=400&fit=crop&fm=webp&q=80",
    comment: "Atendimento perfeito e doces maravilhosos! Fizeram tudo com muito carinho para o meu casamento. Superou minhas expectativas!",
  },
  {
    id: 4,
    name: "Carlos Oliveira",
    username: "carlosoliveira",
    userImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
    postImage: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop&fm=webp&q=80",
    comment: "Sabor incrível e apresentação impecável! Sempre peço para eventos da empresa. Nunca decepciona!",
  },
  {
    id: 5,
    name: "Fernanda Lima",
    username: "fernandalima",
    userImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face",
    postImage: "https://img.elo7.com.br/product/zoom/1FEDB43/docinhos-gourmet-para-festas-casamentos-cento-de-docinhos-para-festa.jpg",
    comment: "Doces artesanais de primeira qualidade! O carinho e dedicação em cada doce é visível. Virei cliente fiel!",
  },
  {
    id: 6,
    name: "Pedro Almeida",
    username: "pedroalmeida",
    userImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face",
    postImage: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop&fm=webp&q=80",
    comment: "Os melhores doces que já comi! A variedade é incrível e o sabor é divino. Recomendo a todos!",
  },
  {
    id: 7,
    name: "Sofia Mendes",
    username: "sofiamendes",
    userImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face",
    postImage: "https://i.pinimg.com/originals/1d/33/c5/1d33c579f19ed6b3395ab79c84361148.jpg",
    comment: "Perfeitos para qualquer ocasião! Meus convidados amaram e eu também. Com certeza farei novas encomendas.",
  }
];

export function Testimonials() {
  const [isPaused, setIsPaused] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const pausedTimeRef = useRef<number>(0);

  const animationDuration = 30000; // 30 segundos
  const totalDistance = testimonials.length * 220;

  useEffect(() => {
    if (!isPaused) {
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
  }, [isPaused, totalDistance]);

  useEffect(() => {
    startTimeRef.current = undefined;
    pausedTimeRef.current = 0;
  }, []);
  
  // Duplicar testimonials para efeito infinito suave
  const extendedTestimonials = [...testimonials, ...testimonials, ...testimonials];

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-title">
            Nossos Clientes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-text">
            Veja o que nossos clientes estão dizendo!
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
            width: `${extendedTestimonials.length * 220}px`,
            transform: `translateX(${translateX}px)`
          }}
        >
          {extendedTestimonials.map((testimonial, index) => (
            <div
              key={`${testimonial.id}-${index}`}
              className="flex-shrink-0"
              style={{ width: '200px' }}
            >
              <Card className="overflow-hidden rounded-xl border-border/50 shadow-sm hover:shadow-lg transition-shadow duration-300 h-96 flex flex-col">
                <CardContent className="relative h-full w-full p-0">
                  {/* Post Image - Background */}
                  <img
                    src={testimonial.postImage}
                    srcSet={`${testimonial.postImage} 1x, ${testimonial.postImage.replace('w=400', 'w=800')} 2x`}
                    alt={`Post by ${testimonial.username}`}
                    className="absolute inset-0 w-full h-full object-cover rounded-xl"
                    width="400"
                    height="384"
                    loading={index < 3 ? "eager" : "lazy"}
                    decoding="async"
                    sizes="(max-width: 768px) 300px, 400px"
                  />

                  {/* Overlay Content */}
                  <div className="absolute inset-0 flex flex-col justify-between p-4 text-white bg-gradient-to-t from-black/70 via-transparent to-black/30 rounded-xl">
                    {/* User Info at Top */}
                    <div className="flex items-center">
                      <img
                        src={testimonial.userImage}
                        srcSet={`${testimonial.userImage} 1x, ${testimonial.userImage.replace('w=64', 'w=128')} 2x`}
                        alt={testimonial.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white"
                        width="32"
                        height="32"
                        loading={index < 3 ? "eager" : "lazy"}
                        decoding="async"
                        sizes="32px"
                      />
                      <div className="ml-2">
                        <p className="font-semibold text-sm">
                          {testimonial.username}
                        </p>
                      </div>
                    </div>

                    {/* Comment at Bottom */}
                    <div className="text-sm font-text">
                      <p className="line-clamp-3">{testimonial.comment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}