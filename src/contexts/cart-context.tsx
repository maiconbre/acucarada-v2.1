import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  flavor?: string;
  image_url?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string, flavor?: string) => void;
  updateQuantity: (id: string, quantity: number, flavor?: string) => void;
  clearCart: () => void;
  getCartMessage: () => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('acucarada_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('acucarada_cart', JSON.stringify(items));
  }, [items]);

  // Calculate total items
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  // Calculate total price
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Add item to cart
  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(
        item => item.id === newItem.id && item.flavor === newItem.flavor
      );

      if (existingItemIndex >= 0) {
        // Item already exists, update quantity
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // New item, add to cart
        return [...currentItems, { ...newItem, quantity }];
      }
    });

    toast({
      title: "Item adicionado ao carrinho",
      description: `${newItem.name}${newItem.flavor ? ` (${newItem.flavor})` : ''} foi adicionado ao carrinho.`,
    });
  }, [toast]);

  // Remove item from cart
  const removeItem = useCallback((id: string, flavor?: string) => {
    setItems(currentItems => {
      const filteredItems = currentItems.filter(
        item => !(item.id === id && item.flavor === flavor)
      );
      return filteredItems;
    });

    toast({
      title: "Item removido",
      description: "Item removido do carrinho.",
    });
  }, [toast]);

  // Update item quantity
  const updateQuantity = useCallback((id: string, quantity: number, flavor?: string) => {
    if (quantity <= 0) {
      removeItem(id, flavor);
      return;
    }

    setItems(currentItems => {
      return currentItems.map(item => {
        if (item.id === id && item.flavor === flavor) {
          return { ...item, quantity };
        }
        return item;
      });
    });
  }, [removeItem]);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setItems([]);
    toast({
      title: "Carrinho limpo",
      description: "Todos os itens foram removidos do carrinho.",
    });
  }, [toast]);

  // Generate WhatsApp message for cart
  const getCartMessage = useCallback(() => {
    if (items.length === 0) {
      return "Olá! Gostaria de fazer um pedido dos seus doces artesanais.";
    }

    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(price);
    };

    let message = "🛒 *PEDIDO - AÇUCARADA DOCES* 🍫\n\n";
    message += "📋 *ITENS DO PEDIDO:*\n";
    message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

    items.forEach((item, index) => {
      message += `${index + 1}. 🍫 *${item.name}*\n`;
      if (item.flavor) {
        message += `   🎯 Sabor: ${item.flavor}\n`;
      }
      message += `   📦 Quantidade: ${item.quantity}\n`;
      message += `   💰 Preço unitário: ${formatPrice(item.price)}\n`;
      message += `   💵 Subtotal: ${formatPrice(item.price * item.quantity)}\n\n`;
    });

    message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    message += `🧮 *TOTAL DE ITENS:* ${totalItems}\n`;
    message += `💰 *VALOR TOTAL:* ${formatPrice(totalPrice)}\n`;
    message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    message += "📞 Poderia me dar mais informações sobre disponibilidade e entrega?\n\n";
    message += "Obrigado! 😊";

    return message;
  }, [items, totalItems, totalPrice]);

  const value: CartContextType = {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getCartMessage,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export { CartContext };