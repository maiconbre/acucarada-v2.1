import { Button } from "@/components/ui/button";
import { Heart, Star, ChefHat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-sweets.jpg";
import logoImage from "@/assets/Fundo Transparente PNGPrancheta 1.png";


export const Hero = () => {
  const navigate = useNavigate();
  
  const handleOrderClick = () => {
    const whatsappNumber = "5511999999999";
    const message = encodeURIComponent("Olá! Gostaria de fazer um pedido dos doces da Açucarada 🍫✨");
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };
  
  const handleCatalogClick = () => {
    navigate('/catalog');
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24 md:pt-32">
      {/* Background Image with improved mobile optimization */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage}
          alt="Doces artesanais da Açucarada"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
        <div className="absolute inset-0 bg-background/85" />
      </div>

      {/* Floating elements for visual appeal */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        <div className="absolute top-20 right-10 w-4 h-4 bg-rose-primary/20 rounded-full animate-pulse" />
        <div className="absolute top-40 right-32 w-2 h-2 bg-rose-light/50 rounded-full animate-bounce" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-32 right-20 w-3 h-3 bg-brown-primary/30 rounded-full animate-pulse" style={{animationDelay: '2s'}} />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center md:text-left md:mx-0 md:max-w-2xl">
          {/* Main Title with improved mobile hierarchy */}
          <div className="flex flex-col items-center md:items-start animate-slide-up">
            <img
          src={logoImage}
          alt="Açucarada"
          className="h-auto object-contain m-0 p-0 w-[150%] max-w-none"
          loading="eager"
        />
          </div>

          {/* Description with better mobile readability */}
          <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl mx-auto md:mx-0 animate-fade-in font-text" style={{animationDelay: '0.3s'}}>
            Criamos doces artesanais únicos, feitos com ingredientes selecionados e muito amor. 
            Cada doce é uma pequena obra de arte que desperta os sentidos.
          </p>

          {/* CTA Buttons with improved mobile design */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8 animate-fade-in" style={{animationDelay: '0.6s'}}>
            <Button
              variant="hero"
              size="sm"
              onClick={handleOrderClick}
              className="text-sm sm:text-base px-4 py-3 sm:px-6 sm:py-4 h-auto group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 fill-current group-hover:animate-pulse" />
              Fazer Pedido
            </Button>
            <Button
              variant="elegant"
              size="sm"
              onClick={handleCatalogClick}
              className="text-sm sm:text-base px-4 py-3 sm:px-6 sm:py-4 h-auto hover:scale-105 transition-all duration-300"
            >
              <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Ver Catálogo
            </Button>
          </div>

          {/* Enhanced trust indicators - Mobile optimized */}
          <div className="space-y-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 sm:space-y-0 mt-8 animate-fade-in" style={{animationDelay: '0.9s'}}>
            <div className="flex items-center justify-center sm:justify-start gap-3 bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-3 sm:p-4 hover:bg-card/80 transition-colors">
              <div className="flex shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-rose-primary text-rose-primary" />
                ))}
              </div>
              <span className="text-sm sm:text-xs lg:text-sm font-medium text-center sm:text-left font-text">500+ clientes satisfeitos</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3 bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-3 sm:p-4 hover:bg-card/80 transition-colors">
              <ChefHat className="h-4 w-4 text-rose-primary shrink-0" />
              <span className="text-sm sm:text-xs lg:text-sm font-medium text-center sm:text-left font-text">Entrega em toda região</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3 bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-3 sm:p-4 hover:bg-card/80 transition-colors sm:col-span-2 lg:col-span-1">
              <ChefHat className="h-4 w-4 text-rose-primary shrink-0" />
              <span className="text-sm sm:text-xs lg:text-sm font-medium text-center sm:text-left font-text">Feito no dia da entrega</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};