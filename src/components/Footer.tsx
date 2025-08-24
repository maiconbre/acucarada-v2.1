import { Heart, MessageCircle, Settings, Sparkles, Star, ChefHat } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppSettings } from "@/hooks/useAppSettings";
import footerLogoImage from "@/assets/Fundo Transparente PNGPrancheta 3.png";

export const Footer = () => {
  const { getWhatsAppLink } = useAppSettings();
  const currentYear = new Date().getFullYear();

  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative overflow-hidden bg-rose-light/20 border-t border-rose-primary/10">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-rose-primary/5" />
      <div className="absolute top-10 left-10 w-24 h-24 bg-rose-primary/10 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-brown-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 items-start">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
              
              <div className="w-48 sm:w-56 md:w-64 lg:w-72 h-auto">
                <img 
                  src={footerLogoImage} 
                  alt="Açucarada" 
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
              </div>
            </div>
            <p className="text-muted-foreground text-base leading-relaxed mb-6 max-w-sm mx-auto md:mx-0 font-text">
              Doces artesanais que despertam sorrisos e criam memórias especiais desde 2020. ✨
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground font-text">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-rose-primary text-rose-primary" />
                <span>500+ clientes felizes</span>
              </div>
              <div className="flex items-center gap-1">
                <ChefHat className="h-4 w-4 text-rose-primary" />
                <span>Feito com amor</span>
              </div>
            </div>
          </div>

          {/* Quick Links - Hidden on mobile */}
          <div className="text-center hidden md:block">
            <h4 className="font-title font-semibold text-lg mb-6 text-foreground flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-rose-primary" />
              Links Rápidos
            </h4>
            <div className="space-y-4">
              <button 
                onClick={() => handleSectionClick('produtos')} 
                className="group flex items-center justify-center gap-2 w-full text-muted-foreground hover:text-rose-primary transition-all duration-300 bg-card/50 hover:bg-card/80 backdrop-blur-sm border border-border/30 hover:border-rose-primary/30 rounded-xl px-4 py-3 hover:scale-105"
              >
                <Heart className="h-4 w-4 group-hover:fill-rose-primary transition-all" />
                <span className="font-text">Nossos Produtos</span>
              </button>
              <button 
                onClick={() => handleSectionClick('sobre')} 
                className="group flex items-center justify-center gap-2 w-full text-muted-foreground hover:text-rose-primary transition-all duration-300 bg-card/50 hover:bg-card/80 backdrop-blur-sm border border-border/30 hover:border-rose-primary/30 rounded-xl px-4 py-3 hover:scale-105"
              >
                <Star className="h-4 w-4 group-hover:fill-rose-primary transition-all" />
                <span className="font-text">Nossa História</span>
              </button>
              <button 
                onClick={() => handleSectionClick('contato')} 
                className="group flex items-center justify-center gap-2 w-full text-muted-foreground hover:text-rose-primary transition-all duration-300 bg-card/50 hover:bg-card/80 backdrop-blur-sm border border-border/30 hover:border-rose-primary/30 rounded-xl px-4 py-3 hover:scale-105"
              >
                <MessageCircle className="h-4 w-4 group-hover:fill-rose-primary transition-all" />
                <span className="font-text">Contato</span>
              </button>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center md:text-right md:col-span-1 col-span-full">
            <h4 className="font-title font-semibold text-lg mb-4 md:mb-6 text-foreground flex items-center justify-center md:justify-end gap-2">
              <MessageCircle className="h-5 w-5 text-rose-primary" />
              Fale Conosco
            </h4>
            <div className="space-y-3 md:space-y-4">
              {/* Mobile: 2 columns grid for WhatsApp and Address */}
              <div className="grid grid-cols-2 gap-2 md:space-y-0 md:block md:space-y-4">
                <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-3 md:p-4 hover:bg-card/80 transition-all duration-300">
                  <div className="flex items-center justify-center md:justify-end gap-2 md:gap-3 mb-1 md:mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs md:text-sm font-medium text-foreground font-text">📱 (21) 99776-0398</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-text">WhatsApp disponível</p>
                </div>
                <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-3 md:p-4 hover:bg-card/80 transition-all duration-300">
                  <div className="flex items-center justify-center md:justify-end gap-2 md:gap-3 mb-1 md:mb-2">
                    <span className="text-xs md:text-sm font-medium text-foreground font-text">📍 Rio de Janeiro - RJ</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-text">Entregamos em toda região</p>
                </div>
              </div>
              {/* Mobile: 1 column for schedule */}
              <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-3 md:p-4 hover:bg-card/80 transition-all duration-300">
                <div className="flex items-center justify-center md:justify-end gap-2 md:gap-3 mb-1 md:mb-2">
                  <span className="text-xs md:text-sm font-medium text-foreground font-text">🕒 Seg à Sáb: 9h às 18h</span>
                </div>
                <p className="text-xs text-muted-foreground font-text">Horário de atendimento</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary/20 mt-8 md:mt-12 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-muted-foreground text-sm mb-2 font-text">
                © {currentYear} Açucarada. Todos os direitos reservados.
              </p>
              <p className="text-xs text-muted-foreground/70 font-text">
                Feito com 💖 por <a 
                  href="https://targetweb.tech" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-rose-primary transition-colors duration-300"
                >
                  TargetWeb
                </a>
              </p>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-muted-foreground text-sm font-medium font-text">Conecte-se conosco:</span>
              <div className="flex items-center gap-4">
                {/* Redes Sociais */}
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-pink-500 transition-all duration-300 p-1 rounded-full hover:bg-pink-50"
                  title="Instagram"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                
                <a 
                  href="https://tiktok.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-black transition-all duration-300 p-1 rounded-full hover:bg-gray-50"
                  title="TikTok"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
                
                <a 
                  href="https://wa.me/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-green-500 transition-all duration-300 p-1 rounded-full hover:bg-green-50"
                  title="WhatsApp"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.531 3.488"/>
                  </svg>
                </a>
                
                {/* Botão Admin Discreto */}
                <Link 
                  to="/admin" 
                  className="text-muted-foreground/40 hover:text-muted-foreground transition-all duration-300 opacity-50 hover:opacity-100 px-2 py-1 rounded text-xs font-medium hover:bg-card/50"
                  title="Área Administrativa"
                >
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};