import { Button } from "@/components/ui/button";
import { Heart, Star, ChefHat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSettings } from "@/hooks/useAppSettings";
import heroImage from "@/assets/hero-sweetsweb.webp";
import logoImage from "@/assets/Fundo Transparente PNGPrancheta 1.png";


export const Hero = () => {
  const navigate = useNavigate();
  const { getWhatsAppLink } = useAppSettings();
  
  const handleOrderClick = () => {
    const customMessage = "Olá! Gostaria de fazer um pedido dos doces da Açucarada 🍫✨";
    const link = getWhatsAppLink(customMessage);
    window.open(link, '_blank');
  };
  
  const handleCatalogClick = () => {
    navigate('/catalog');
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-100 md:pt-20">
      {/* Background Image with improved mobile optimization */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage}
          alt="Doces artesanais da Açucarada"
          className="w-full h-full object-cover object-center"
          width="1920"
          height="1080"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-background/85" />
      </div>



      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center md:text-left md:mx-0 md:max-w-2xl">
          {/* Main Title with improved mobile hierarchy */}
          <div className="flex flex-col items-center md:items-start animate-slide-up -mt-20 md:-mt-6 py-2">
            <img
          src={logoImage}
          alt="Açucarada"
          className="h-auto object-contain m-0 p-0 w-[155%] max-w-2xl md:max-w-3xl lg:max-w-4xl md:-ml-52"
          width="800"
          height="400"
          loading="eager"
          decoding="async"
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
          <div className="flex justify-center sm:justify-start mt-8 animate-fade-in" style={{animationDelay: '0.9s'}}>
            <div className="inline-flex items-center justify-center sm:justify-start gap-3 bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-2 sm:px-5 sm:py-3 hover:bg-card/80 transition-colors">
              <div className="flex shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-rose-primary text-rose-primary" />
                ))}
              </div>
              <span className="text-sm sm:text-xs lg:text-base font-medium text-center sm:text-left font-text whitespace-nowrap">500+ clientes satisfeitos</span>
            </div>
            
            
          </div>
        </div>
      </div>
    </section>
  );
};