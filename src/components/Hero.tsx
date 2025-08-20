import { Button } from "@/components/ui/button";
import { Heart, Star } from "lucide-react";
import heroImage from "@/assets/hero-sweets.jpg";

const Hero = () => {
  const handleOrderClick = () => {
    const whatsappNumber = "5511999999999";
    const message = encodeURIComponent("Olá! Gostaria de fazer um pedido dos doces da Açucarada 🍫✨");
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage}
          alt="Doces artesanais da Açucarada"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-soft/80 backdrop-blur-sm text-primary px-4 py-2 rounded-full mb-6">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium">Doces Artesanais Premium</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight">
            <span className="gradient-primary bg-clip-text text-transparent">
              Açucarada
            </span>
            <br />
            <span className="text-foreground">
              Doces que
            </span>
            <br />
            <span className="text-primary">
              Encantam
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Criamos doces artesanais únicos, feitos com ingredientes selecionados e muito amor. 
            Cada doce é uma pequena obra de arte que desperta os sentidos.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="hero"
              size="lg"
              onClick={handleOrderClick}
              className="text-lg px-8 py-6 h-auto"
            >
              <Heart className="h-5 w-5 fill-current" />
              Fazer Pedido
            </Button>
            <Button
              variant="elegant"
              size="lg"
              onClick={() => document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-lg px-8 py-6 h-auto"
            >
              Ver Catálogo
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <span>500+ clientes satisfeitos</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-border" />
            <span className="hidden sm:inline">Entrega em toda região</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;