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
  },
  {
    id: 6,
    name: "Pedro Almeida",
    username: "pedroalmeida",
    userImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    postImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo-nUpWwTWn0MIIuctIN4JEyt6j5PqWPnSbQ&s",
    comment: "Os melhores doces que já comi! A variedade é incrível e o sabor é divino. Recomendo a todos!",
  },
  {
    id: 7,
    name: "Sofia Mendes",
    username: "sofiamendes",
    userImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    postImage: "http://blog.hegapack.com.br/wp-content/uploads/2019/09/descubra-como-faturar-mais-com-doces-artesanais-20190815140307.jpg.jpg",
    comment: "Perfeitos para qualquer ocasião! Meus convidados amaram e eu também. Com certeza farei novas encomendas.",
  }
];

export function Testimonials() {
  const [translateX, setTranslateX] = useState(0);
  const cardWidth = 220; // Largura de cada card + gap (200 + 20)
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
          className="flex gap-8 transition-none"
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
              <Card className="overflow-hidden rounded-xl border-border/50 shadow-sm hover:shadow-lg transition-shadow duration-300 h-96 flex flex-col">
                <CardContent className="relative h-full w-full p-0">
                  {/* Post Image - Background */}
                  <img
                    src={testimonial.postImage}
                    alt={`Post by ${testimonial.username}`}
                    className="absolute inset-0 w-full h-full object-cover rounded-xl"
                    loading="lazy"
                  />

                  {/* Overlay Content */}
                  <div className="absolute inset-0 flex flex-col justify-between p-4 text-white bg-gradient-to-t from-black/70 via-transparent to-black/30 rounded-xl">
                    {/* User Info at Top */}
                    <div className="flex items-center">
                      <img
                        src={testimonial.userImage}
                        alt={testimonial.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white"
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