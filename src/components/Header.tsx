import { MessageCircle, Phone, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImage from "@/assets/logo2.png";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const whatsappNumber = "5511999999999"; // Replace with actual number
  const whatsappMessage = encodeURIComponent("Olá! Gostaria de saber mais sobre os doces da Açucarada 🍫");

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank');
    setIsMobileMenuOpen(false);
  };

  const handleMenuItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-rose-light border-b border-border/50 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-2 py-2 md:px-4 md:py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src={logoImage} 
              alt="Açucarada Logo" 
              className="h-12 w-auto max-w-none md:h-15 lg:h-18 object-contain transition-transform hover:scale-105"
            />
          </div>
          
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/" className="text-white hover:text-white transition-smooth px-4 py-2 rounded-md hover:bg-accent font-text">
                    Início
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/catalog" className="text-white hover:text-white transition-smooth px-4 py-2 rounded-md hover:bg-accent font-text">
                    Catálogo
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <button 
                    onClick={() => handleSectionClick('sobre')} 
                    className="text-white hover:text-white transition-smooth bg-transparent border-none cursor-pointer px-4 py-2 rounded-md hover:bg-accent font-text"
                  >
                    Sobre
                  </button>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <button 
                    onClick={() => handleSectionClick('contato')} 
                    className="text-white hover:text-white transition-smooth bg-transparent border-none cursor-pointer px-4 py-2 rounded-md hover:bg-accent font-text"
                  >
                    Contato
                  </button>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

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
        <div className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-rose-light/98 backdrop-blur-md border-t border-white/20 shadow-lg">
            <nav className="container mx-auto px-4 py-4 space-y-1">
              <Link 
                to="/" 
                className="block text-white font-text py-3 px-4 rounded-lg transition-all duration-200 ease-in-out hover:bg-white/10 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] active:bg-white/20 transform"
                onClick={handleMenuItemClick}
              >
                <span className="font-medium">Início</span>
              </Link>
              <Link 
                to="/catalog" 
                className="block text-white font-text py-3 px-4 rounded-lg transition-all duration-200 ease-in-out hover:bg-white/10 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] active:bg-white/20 transform"
                onClick={handleMenuItemClick}
              >
                <span className="font-medium">Catálogo</span>
              </Link>
              <button 
                onClick={() => handleSectionClick('sobre')} 
                className="block text-left w-full text-white font-text py-3 px-4 rounded-lg transition-all duration-200 ease-in-out hover:bg-white/10 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] active:bg-white/20 transform bg-transparent border-none cursor-pointer"
              >
                <span className="font-medium">Sobre</span>
              </button>
              <button 
                onClick={() => handleSectionClick('contato')} 
                className="block text-left w-full text-white font-text py-3 px-4 rounded-lg transition-all duration-200 ease-in-out hover:bg-white/10 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] active:bg-white/20 transform bg-transparent border-none cursor-pointer"
              >
                <span className="font-medium">Contato</span>
              </button>
              <div className="pt-2 border-t border-white/20 mt-4">
                <Button
                  variant="whatsapp"
                  size="sm"
                  onClick={handleWhatsAppClick}
                  className="w-full justify-start transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] transform shadow-md hover:shadow-lg"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  <span className="font-medium">WhatsApp</span>
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};