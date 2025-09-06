import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/cart-context';
import { useAppSettings } from '@/hooks/useAppSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, X, Minus, Plus, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingCartProps {
  className?: string;
}

export const FloatingCart = ({ className }: FloatingCartProps) => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [lastTotalItems, setLastTotalItems] = useState(0);
  const { items, totalItems, totalPrice, updateQuantity, removeItem, getCartMessage } = useCart();
  const { getWhatsAppLink } = useAppSettings();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleWhatsAppOrder = () => {
    const message = getCartMessage();
    const link = getWhatsAppLink(message);
    window.open(link, '_blank');
  };

  const handleQuantityChange = (id: string, currentQuantity: number, change: number, flavor?: string) => {
    const newQuantity = currentQuantity + change;
    updateQuantity(id, newQuantity, flavor);
  };

  // Show cart when new items are added
  if (totalItems > lastTotalItems && totalItems > 0) {
    setIsVisible(true);
    setLastTotalItems(totalItems);
  } else if (totalItems !== lastTotalItems) {
    setLastTotalItems(totalItems);
  }

  // Don't render if not visible or if cart is empty
  if (!isVisible || totalItems === 0) {
    return null;
  }

  return (
    <div className={cn(
      "fixed z-50 transition-all duration-300 ease-in-out",
      isMinimized 
        ? "top-28 right-4 w-16 h-16" 
        : "top-28 right-4 w-96 max-h-[75vh]",
      className
    )}>
      {isMinimized ? (
        // Minimized cart icon
        <Button
          onClick={() => setIsMinimized(false)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative"
        >
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-900 border-2 border-white min-w-[24px] h-6 rounded-full flex items-center justify-center text-xs font-bold">
              {totalItems}
            </Badge>
          )}
        </Button>
      ) : (
        // Expanded cart
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-rose-200 shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-600 text-white p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrinho ({totalItems})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  title="Minimizar carrinho"
                >
                  <span className="text-lg font-bold leading-none">−</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVisible(false)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  title="Fechar carrinho"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 max-h-96 overflow-y-auto">
            <div className="space-y-2 p-4">
              {items.map((item, index) => (
                <div key={`${item.id}-${item.flavor || 'default'}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {item.image_url && (
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">{item.name}</h4>
                    {item.flavor && (
                      <p className="text-xs text-gray-600">Sabor: {item.flavor}</p>
                    )}
                    <p className="text-sm font-bold text-rose-600">{formatPrice(item.price)}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, item.quantity, -1, item.flavor)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, item.quantity, 1, item.flavor)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id, item.flavor)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Cart Summary */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-xl font-bold text-rose-600">{formatPrice(totalPrice)}</span>
              </div>
              
              <Button
                onClick={handleWhatsAppOrder}
                className="w-full h-14 sm:h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-xl border-2 border-green-400 hover:border-green-500"
              >
                <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 mr-2 sm:mr-3" />
                <span className="flex-1 text-center">Pedir pelo WhatsApp</span>
                <span className="ml-2 text-lg sm:text-xl">🍫</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FloatingCart;