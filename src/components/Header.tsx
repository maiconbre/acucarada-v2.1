import { MessageCircle, Phone, Menu, X, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImage from "@/assets/logo-navbar.png";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
      setSearchTerm("");
      setIsMobileMenuOpen(false);
    }
  };

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchTerm("");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isMobile = window.innerWidth < 768; // md breakpoint
      
      if (isMobile) {
        if (currentScrollY < lastScrollY || currentScrollY < 10) {
          // Scrolling up or near top
          setIsHeaderVisible(true);
        } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down and past threshold
          setIsHeaderVisible(false);
          setIsMobileMenuOpen(false); // Close mobile menu when hiding
        }
      } else {
        // Always visible on desktop
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (!isMobile) {
        setIsHeaderVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [lastScrollY]);

  return (
    <header className={`bg-rose-light border-b border-border/50 fixed top-0 left-0 right-0 z-50 backdrop-blur-sm transition-transform duration-300 ease-in-out ${
      isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="container mx-auto px-2 md:px-4 py-2 md:py-6">
        <div className="flex items-center justify-between md:justify-start">
          {/* Mobile: Logo centralizado */}
          <div className="flex-1 flex justify-center md:hidden items-center">
            <Link to="/">
              <img 
              src={logoImage} 
              alt="Açucarada Logo" 
              className="h-16 w-16 object-contain transition-transform hover:scale-105"
            />
            </Link>
            {/* Badge ao lado do logo mobile */}
            <div className="ml-2 inline-flex items-center gap-1 bg-rose-primary/10 backdrop-blur-sm text-rose-primary px-2 py-1 rounded-full border border-rose-primary/20">
              <Sparkles className="h-2 w-2 animate-pulse" />
              <span className="text-xs font-medium font-text">Confeitaria</span>
            </div>
          </div>
          
          {/* Desktop: Logo à esquerda */}
          <div className="hidden md:flex items-center mr-8">
            <Link to="/">
              <img 
                src={logoImage} 
                alt="Açucarada Logo" 
                className="h-12 lg:h-16 w-auto object-contain transition-transform hover:scale-105"
              />
            </Link>
            {/* Badge ao lado do logo */}
            <div className="ml-3 inline-flex items-center gap-1 bg-rose-primary/10 backdrop-blur-sm text-rose-primary px-2 py-1 rounded-full border border-rose-primary/20">
              <Sparkles className="h-3 w-3 animate-pulse" />
              <span className="text-xs font-medium font-text">Doces Artesanais</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1 justify-between">
            <NavigationMenu>
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
                    <Link to="/catalog" className="text-white hover:text-white transition-smooth px-6 py-3 rounded-md hover:bg-accent font-text text-base h-12 flex items-center">
                      Catálogo
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/sobre" className="text-white hover:text-white transition-smooth px-6 py-3 rounded-md hover:bg-accent font-text text-base h-12 flex items-center">
                      Sobre
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/contato" className="text-white hover:text-white transition-smooth px-6 py-3 rounded-md hover:bg-accent font-text text-base h-12 flex items-center">
                      Contato
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center space-x-3">
              {/* Desktop Search */}
              <div className="flex items-center">
                {isSearchOpen ? (
                  <form onSubmit={handleSearchSubmit} className="flex items-center">
                    <Input
                      type="text"
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 mr-2 bg-white/90 border-white/20 text-gray-800 placeholder:text-gray-500"
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSearchToggle}
                      className="text-white hover:bg-white/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </form>
                ) : (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleSearchToggle}
                    className="text-white hover:bg-white/10 h-12 w-12"
                  >
                    <Search className="h-6 w-6" />
                  </Button>
                )}
              </div>
              
              <Button
                variant="whatsapp"
                size="lg"
                onClick={handleWhatsAppClick}
                className="h-12 px-6 text-base"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </Button>
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center space-x-2 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSearchToggle}
              className="text-white hover:bg-white/10"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-10 w-10 text-white hover:bg-white/10"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden bg-rose-light/95 backdrop-blur-md border-t border-white/20">
            <div className="container mx-auto px-4 py-3">
              <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-white/90 border-white/20 text-gray-800 placeholder:text-gray-500"
                  autoFocus
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/10 h-12 w-12"
                >
                  <Search className="h-6 w-6" />
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-rose-light/98 backdrop-blur-md border-t border-white/20 shadow-lg">
            <nav className="container mx-auto px-4 py-4 space-y-1">
              <Link 
                to="/" 
                className="block text-white font-text py-4 px-6 rounded-lg transition-all duration-200 ease-in-out hover:bg-white/10 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] active:bg-white/20 transform text-base"
                onClick={handleMenuItemClick}
              >
                <span className="font-medium">Início</span>
              </Link>
              <Link 
                to="/catalog" 
                className="block text-white font-text py-4 px-6 rounded-lg transition-all duration-200 ease-in-out hover:bg-white/10 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] active:bg-white/20 transform text-base"
                onClick={handleMenuItemClick}
              >
                <span className="font-medium">Catálogo</span>
              </Link>
              <Link 
                to="/sobre" 
                className="block text-white font-text py-4 px-6 rounded-lg transition-all duration-200 ease-in-out hover:bg-white/10 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] active:bg-white/20 transform text-base"
                onClick={handleMenuItemClick}
              >
                <span className="font-medium">Sobre</span>
              </Link>
              <Link 
                to="/contato" 
                className="block text-white font-text py-4 px-6 rounded-lg transition-all duration-200 ease-in-out hover:bg-white/10 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] active:bg-white/20 transform text-base"
                onClick={handleMenuItemClick}
              >
                <span className="font-medium">Contato</span>
              </Link>
              <div className="pt-2 border-t border-white/20 mt-4">
                <Button
                  variant="whatsapp"
                  size="lg"
                  onClick={handleWhatsAppClick}
                  className="w-full justify-start transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] transform shadow-md hover:shadow-lg h-12 px-6 text-base"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
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