import { Heart, MessageCircle, Settings, Sparkles, Star, ChefHat } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-cream-50 to-brown-50 border-t border-primary/10">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-10 left-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute top-20 right-20 w-4 h-4 bg-primary/20 rounded-full animate-bounce" />
      <div className="absolute bottom-32 left-20 w-2 h-2 bg-rose-300/40 rounded-full animate-pulse" style={{animationDelay: '1s'}} />
      
      <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 items-start">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
              <div className="relative">
                <Heart className="h-8 w-8 fill-primary text-primary animate-pulse" />
                <Sparkles className="h-3 w-3 text-primary/60 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <span className="text-2xl font-display font-bold gradient-primary bg-clip-text text-transparent">
                Açucarada
              </span>
            </div>
            <p className="text-muted-foreground text-base leading-relaxed mb-6 max-w-sm mx-auto md:mx-0">
              Doces artesanais que despertam sorrisos e criam memórias especiais desde 2020. ✨
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span>500+ clientes felizes</span>
              </div>
              <div className="flex items-center gap-1">
                <ChefHat className="h-4 w-4 text-primary" />
                <span>Feito com amor</span>
              </div>
            </div>
          </div>

          {/* Quick Links - Hidden on mobile */}
          <div className="text-center hidden md:block">
            <h4 className="font-display font-semibold text-lg mb-6 text-foreground flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Links Rápidos
            </h4>
            <div className="space-y-4">
              <button 
                onClick={() => handleSectionClick('produtos')} 
                className="group flex items-center justify-center gap-2 w-full text-muted-foreground hover:text-primary transition-all duration-300 bg-card/50 hover:bg-card/80 backdrop-blur-sm border border-border/30 hover:border-primary/30 rounded-xl px-4 py-3 hover:scale-105"
              >
                <Heart className="h-4 w-4 group-hover:fill-primary transition-all" />
                <span>Nossos Produtos</span>
              </button>
              <button 
                onClick={() => handleSectionClick('sobre')} 
                className="group flex items-center justify-center gap-2 w-full text-muted-foreground hover:text-primary transition-all duration-300 bg-card/50 hover:bg-card/80 backdrop-blur-sm border border-border/30 hover:border-primary/30 rounded-xl px-4 py-3 hover:scale-105"
              >
                <Star className="h-4 w-4 group-hover:fill-primary transition-all" />
                <span>Nossa História</span>
              </button>
              <button 
                onClick={() => handleSectionClick('contato')} 
                className="group flex items-center justify-center gap-2 w-full text-muted-foreground hover:text-primary transition-all duration-300 bg-card/50 hover:bg-card/80 backdrop-blur-sm border border-border/30 hover:border-primary/30 rounded-xl px-4 py-3 hover:scale-105"
              >
                <MessageCircle className="h-4 w-4 group-hover:fill-primary transition-all" />
                <span>Contato</span>
              </button>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center md:text-right md:col-span-1 col-span-full">
            <h4 className="font-display font-semibold text-lg mb-4 md:mb-6 text-foreground flex items-center justify-center md:justify-end gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Fale Conosco
            </h4>
            <div className="space-y-3 md:space-y-4">
              {/* Mobile: 2 columns grid for WhatsApp and Address */}
              <div className="grid grid-cols-2 gap-2 md:space-y-0 md:block md:space-y-4">
                <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-3 md:p-4 hover:bg-card/80 transition-all duration-300">
                  <div className="flex items-center justify-center md:justify-end gap-2 md:gap-3 mb-1 md:mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs md:text-sm font-medium text-foreground">📱 (11) 99999-9999</span>
                  </div>
                  <p className="text-xs text-muted-foreground">WhatsApp disponível</p>
                </div>
                <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-3 md:p-4 hover:bg-card/80 transition-all duration-300">
                  <div className="flex items-center justify-center md:justify-end gap-2 md:gap-3 mb-1 md:mb-2">
                    <span className="text-xs md:text-sm font-medium text-foreground">📍 São Paulo - SP</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Entregamos em toda região</p>
                </div>
              </div>
              {/* Mobile: 1 column for schedule */}
              <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-3 md:p-4 hover:bg-card/80 transition-all duration-300">
                <div className="flex items-center justify-center md:justify-end gap-2 md:gap-3 mb-1 md:mb-2">
                  <span className="text-xs md:text-sm font-medium text-foreground">🕒 Seg à Sáb: 9h às 18h</span>
                </div>
                <p className="text-xs text-muted-foreground">Horário de atendimento</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary/20 mt-8 md:mt-12 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-muted-foreground text-sm mb-2">
                © {currentYear} Açucarada. Todos os direitos reservados.
              </p>
              <p className="text-xs text-muted-foreground/70">
                Feito com 💖 para adoçar seus momentos especiais
              </p>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-muted-foreground text-sm font-medium">Conecte-se conosco:</span>
              <div className="flex items-center gap-4">
                <a 
                  href="https://wa.me/5511999999999" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                  title="Fale conosco no WhatsApp"
                >
                  <MessageCircle className="h-5 w-5 group-hover:animate-pulse" />
                </a>
                {/* Botão Admin Discreto */}
                <Link 
                  to="/admin" 
                  className="text-muted-foreground/40 hover:text-muted-foreground transition-all duration-300 opacity-50 hover:opacity-100 p-2 rounded-full hover:bg-card/50"
                  title="Área Administrativa"
                >
                  <Settings className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};