import { Heart, MessageCircle, Phone, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const whatsappNumber = "5511999999999"; // Replace with actual number
  const whatsappMessage = encodeURIComponent("Olá! Gostaria de saber mais sobre os doces da Açucarada 🍫");

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank');
    setIsMobileMenuOpen(false);
  };

  const handleMenuItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="gradient-soft border-b border-border/50 sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary fill-primary" />
            <h1 className="text-2xl font-display font-bold gradient-primary bg-clip-text text-transparent">
              Açucarada
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-muted-foreground hover:text-primary transition-smooth">
              Início
            </a>
            <a href="/catalog" className="text-muted-foreground hover:text-primary transition-smooth">
              Catálogo
            </a>
            <a href="#sobre" className="text-muted-foreground hover:text-primary transition-smooth">
              Sobre
            </a>
            <a href="#contato" className="text-muted-foreground hover:text-primary transition-smooth">
              Contato
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            <Button
              variant="whatsapp"
              size="sm"
              onClick={handleWhatsAppClick}
              className="hidden sm:flex"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-background/95 backdrop-blur-sm border-t border-border/50">
            <nav className="container mx-auto px-4 py-4 space-y-3">
              <a 
                href="/" 
                className="block text-muted-foreground hover:text-primary transition-smooth py-2"
                onClick={handleMenuItemClick}
              >
                Início
              </a>
              <a 
                href="/catalog" 
                className="block text-muted-foreground hover:text-primary transition-smooth py-2"
                onClick={handleMenuItemClick}
              >
                Catálogo
              </a>
              <a 
                href="#sobre" 
                className="block text-muted-foreground hover:text-primary transition-smooth py-2"
                onClick={handleMenuItemClick}
              >
                Sobre
              </a>
              <a 
                href="#contato" 
                className="block text-muted-foreground hover:text-primary transition-smooth py-2"
                onClick={handleMenuItemClick}
              >
                Contato
              </a>
              <Button
                variant="whatsapp"
                size="sm"
                onClick={handleWhatsAppClick}
                className="w-full justify-start mt-4"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};