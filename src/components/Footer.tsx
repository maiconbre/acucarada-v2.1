import { Heart, MessageCircle, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <Heart className="h-6 w-6 fill-primary text-primary" />
              <span className="text-xl font-display font-bold">Açucarada</span>
            </div>
            <p className="text-background/70 text-sm leading-relaxed">
              Doces artesanais que despertam sorrisos e criam memórias especiais desde 2020.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <div className="space-y-2 text-sm">
              <a href="#produtos" className="block text-background/70 hover:text-primary transition-colors">
                Nossos Produtos
              </a>
              <a href="#sobre" className="block text-background/70 hover:text-primary transition-colors">
                Nossa História
              </a>
              <a href="#contato" className="block text-background/70 hover:text-primary transition-colors">
                Contato
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center md:text-right">
            <h4 className="font-semibold mb-4">Fale Conosco</h4>
            <div className="space-y-2 text-sm text-background/70">
              <p>📱 (11) 99999-9999</p>
              <p>📍 São Paulo - SP</p>
              <p>🕒 Seg à Sáb: 9h às 18h</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/60 text-sm">
            © {currentYear} Açucarada. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-background/60 text-sm">Conecte-se conosco:</span>
            <div className="flex items-center gap-3">
              <a 
                href="https://wa.me/5511999999999" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-background/70 hover:text-primary transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              {/* Botão Admin Discreto */}
              <Link 
                to="/admin" 
                className="text-background/40 hover:text-background/70 transition-colors opacity-50 hover:opacity-100"
                title="Área Administrativa"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};