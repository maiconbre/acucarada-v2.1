import { useState, useEffect } from "react";
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
    userImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
    postImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTN7e4FswWAX9GhLpzO3qJ-KHWWMJCL02nxJl4uofv61Yk_ENUUlU42deAUGi5WcXZtQ5s&usqp=CAU",
    comment: "Os doces são simplesmente incríveis! Encomendei para o aniversário da minha filha e todos elogiaram. Chegou tudo perfeito e o sabor é maravilhoso! Recomendo muito, com certeza pedirei novamente em outras ocasiões.",
  },
  {
    id: 2,
    name: "João Santos",
    username: "joaosantos",
    userImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    postImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJa1EXeSDozfS5k9yr8ZpgZnfwuEgAQwgs0Q&s",
    comment: "Qualidade excepcional! Os brigadeiros gourmet são os melhores que já provei. Recomendo de olhos fechados!",
  },
  {
    id: 3,
    name: "Ana Costa",
    username: "anacosta",
    userImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit_crop&crop=face",
    postImage: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&h=800&fit=crop",
    comment: "Atendimento perfeito e doces maravilhosos! Fizeram tudo com muito carinho para o meu casamento. Superou minhas expectativas!",
  },
  {
    id: 4,
    name: "Carlos Oliveira",
    username: "carlosoliveira",
    userImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    postImage: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&h=800&fit=crop",
    comment: "Sabor incrível e apresentação impecável! Sempre peço para eventos da empresa. Nunca decepciona!",
  },
  {
    id: 5,
    name: "Fernanda Lima",
    username: "fernandalima",
    userImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    postImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhVQLVMCQbCriMECKFs8LZAR-PjHnQRUzhlA&s",
    comment: "Doces artesanais de primeira qualidade! O carinho e dedicação em cada doce é visível. Virei cliente fiel!",
  }
];

export function Testimonials() {
  const [translateX, setTranslateX] = useState(0);
  const cardWidth = 340; // Largura de cada card + gap (320 + 20)
  const totalWidth = testimonials.length * cardWidth;

  useEffect(() => {
    const interval = setInterval(() => {
      setTranslateX((prev) => {
        const newTranslateX = prev - 1;
        if (Math.abs(newTranslateX) >= totalWidth) {
          return 0;
        }
        return newTranslateX;
      });
    }, 25); // Movimento mais suave

    return () => clearInterval(interval);
  }, [totalWidth]);

  const duplicatedTestimonials = [...testimonials, ...testimonials];

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

      <div className="relative overflow-hidden">
        <div 
          className="flex gap-5 transition-none"
          style={{
            transform: `translateX(${translateX}px)`,
            width: `${totalWidth * 2}px`
          }}
        >
          {duplicatedTestimonials.map((testimonial, index) => (
            <div
              key={`${testimonial.id}-${index}`}
              className="flex-shrink-0"
              style={{ width: `${cardWidth - 20}px` }}
            >
              <Card className="overflow-hidden rounded-xl border-border/50 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
                <CardContent className="p-0 flex flex-col flex-1">
                  {/* Post Header */}
                  <div className="flex items-center p-3">
                    <img
                      src={testimonial.userImage}
                      alt={testimonial.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-pink-400/70"
                    />
                    <div className="ml-3">
                      <p className="font-semibold text-sm text-foreground">
                        {testimonial.username}
                      </p>
                    </div>
                  </div>

                  {/* Post Image */}
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={testimonial.postImage}
                      alt={`Post by ${testimonial.username}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Post Actions & Caption */}
                  <div className="p-3 flex flex-col flex-1">
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-4 mb-2">
                      <Heart className="h-6 w-6 text-foreground/80 hover:text-red-500 cursor-pointer transition-colors" />
                    </div>

                    {/* Caption */}
                    <div className="text-sm text-foreground/90 font-text flex-1 min-h-0">
                      <span className="font-semibold cursor-pointer hover:underline">
                        {testimonial.username}
                      </span>
                      <span className="ml-1.5">{testimonial.comment}</span>
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