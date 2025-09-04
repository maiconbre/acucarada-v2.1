import { MessageCircle, Menu, X, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSettings } from "@/hooks/useAppSettings";
import logoImage from "@/assets/morigote.png";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

export const Header = memo(() => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { getWhatsAppLink } = useAppSettings();

  const handleWhatsAppClick = useCallback(() => {
    const customMessage = "Olá! Gostaria de saber mais sobre os doces da Açucarada 🍫";
    const link = getWhatsAppLink(customMessage);
    window.open(link, '_blank');
    setIsMobileMenuOpen(false);
  }, [getWhatsAppLink]);

  const handleMenuItemClick = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleSectionClick = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  }, []);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
      setSearchTerm("");
      setIsMobileMenuOpen(false);
    }
  }, [searchTerm, navigate]);

  const handleSearchToggle = useCallback(() => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchTerm("");
    }
  }, [isSearchOpen]);

  useEffect(() => {
    let lastScrollYRef = lastScrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isMobile = window.innerWidth < 768; // md breakpoint
      
      if (isMobile) {
        if (currentScrollY < lastScrollYRef || currentScrollY < 10) {
          // Scrolling up or near top
          setIsHeaderVisible(true);
        } else if (currentScrollY > lastScrollYRef && currentScrollY > 100) {
          // Scrolling down and past threshold
          setIsHeaderVisible(false);
          setIsMobileMenuOpen(false); // Close mobile menu when hiding
        }
      } else {
        // Always visible on desktop
        setIsHeaderVisible(true);
      }
      
      lastScrollYRef = currentScrollY;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className={`border-b border-brown-primary/30 fixed top-0 left-0 right-0 z-50 backdrop-blur-sm transition-transform duration-300 ease-in-out ${
      isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
    }`} style={{backgroundColor: '#FDE7E5'}}>
      <div className="container mx-auto px-2 md:px-4 py-3 md:py-8">
        <div className="flex items-center justify-between md:justify-start">
          {/* Mobile: Logo à esquerda */}
          <div className="flex-1 flex justify-start ml-2 md:hidden items-center relative">
            <Link to="/">
              <img 
              src={logoImage} 
              alt="Açucarada Logo" 
              className="h-20 w-20 object-contain transition-transform hover:scale-105"
              width="80"
              height="80"
              loading="lazy"
              decoding="async"
            />
            </Link>
            
            {/* Mobile Search Expanded */}
            {isSearchOpen && (
              <div className="absolute inset-0 flex items-center justify-center animate-in slide-in-from-right-5 duration-300">
                <form onSubmit={handleSearchSubmit} className="flex items-center w-full px-3">
                  <Input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 h-10 backdrop-blur-md bg-black/20 border border-brown-primary rounded-lg text-white placeholder:text-white focus:ring-0 focus:outline-none text-sm px-3"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSearchToggle}
                    className="text-brown-primary hover:bg-brown-primary/10 h-8 w-8 p-0 ml-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}
            
            {/* Badge - Hidden when search is open */}
            <div className={`transition-opacity duration-300 ml-4 ${
              isSearchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}>
              <div className="bg-gradient-to-r from-brown-primary/10 to-brown-primary/5 backdrop-blur-sm border border-brown-primary/20 rounded-full px-3 py-1.5 shadow-sm">
                <span className="text-brown-primary text-xs font-medium tracking-wide">
                  By: Evelyn Martins
                </span>
              </div>
            </div>
          </div>
          
          {/* Desktop: Logo à esquerda */}
          <div className="hidden md:flex items-center mr-8">
            <Link to="/">
              <img 
                src={logoImage} 
                alt="Açucarada Logo" 
                className="h-16 lg:h-20 w-auto object-contain transition-transform hover:scale-105"
                width="80"
                height="80"
                loading="lazy"
                decoding="async"
              />
            </Link>
            {/* Badge ao lado do logo */}
            <div className="ml-20 inline-flex items-center gap-1 bg-rose-primary/10 backdrop-blur-sm text-rose-primary px-2 py-1 rounded-full border border-rose-primary/20">
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
                    <Link to="/" className="text-brown-primary hover:text-brown-primary transition-smooth px-4 py-2 rounded-md hover:bg-brown-primary/10 font-text">
                      Início
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/catalog" className="text-brown-primary hover:text-brown-primary transition-smooth px-6 py-3 rounded-md hover:bg-brown-primary/10 font-text text-base h-12 flex items-center">
                      Catálogo
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/sobre" className="text-brown-primary hover:text-brown-primary transition-smooth px-6 py-3 rounded-md hover:bg-brown-primary/10 font-text text-base h-12 flex items-center">
                      Sobre
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/contato" className="text-brown-primary hover:text-brown-primary transition-smooth px-6 py-3 rounded-md hover:bg-brown-primary/10 font-text text-base h-12 flex items-center">
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
                      className="text-brown-primary hover:bg-brown-primary/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </form>
                ) : (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleSearchToggle}
                    className="text-brown-primary hover:bg-brown-primary/10 h-12 w-12"
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
              className="text-brown-primary hover:bg-brown-primary/10"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-10 w-10 text-brown-primary hover:bg-brown-primary/10 transition-all duration-300 ease-in-out"
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                <Menu className={`h-5 w-5 absolute transition-all duration-300 ease-in-out transform ${
                  isMobileMenuOpen 
                    ? 'opacity-0 rotate-90 scale-75' 
                    : 'opacity-100 rotate-0 scale-100'
                }`} />
                <X className={`h-5 w-5 absolute transition-all duration-300 ease-in-out transform ${
                  isMobileMenuOpen 
                    ? 'opacity-100 rotate-0 scale-100' 
                    : 'opacity-0 -rotate-90 scale-75'
                }`} />
              </div>
            </Button>
          </div>
        </div>


        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="backdrop-blur-md border-t border-white/20 shadow-lg" style={{backgroundColor: '#FDE7E5'}}>
            <nav className="container mx-auto px-4 py-4 space-y-1">
              <Link 
                to="/" 
                className="block text-brown-primary font-text py-4 px-6 rounded-lg transition-all duration-200 ease-in-out hover:bg-brown-primary/10 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] active:bg-brown-primary/20 transform text-base"
                onClick={handleMenuItemClick}
              >
                <span className="font-medium">Início</span>
              </Link>
              <Link 
                to="/catalog" 
                className="block text-brown-primary font-text py-4 px-6 rounded-lg transition-all duration-200 ease-in-out hover:bg-brown-primary/10 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] active:bg-brown-primary/20 transform text-base"
                onClick={handleMenuItemClick}
              >
                <span className="font-medium">Catálogo</span>
              </Link>
              <Link 
                to="/sobre" 
                className="block text-brown-primary font-text py-4 px-6 rounded-lg transition-all duration-200 ease-in-out hover:bg-brown-primary/10 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] active:bg-brown-primary/20 transform text-base"
                onClick={handleMenuItemClick}
              >
                <span className="font-medium">Sobre</span>
              </Link>
              <Link 
                to="/contato" 
                className="block text-brown-primary font-text py-4 px-6 rounded-lg transition-all duration-200 ease-in-out hover:bg-brown-primary/10 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] active:bg-brown-primary/20 transform text-base"
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
});

Header.displayName = 'Header';