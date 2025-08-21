import { useState } from "react";
import { Package, Tag, TrendingUp, Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileBottomNav = ({ activeTab, onTabChange }: MobileBottomNavProps) => {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      color: "text-blue-500"
    },
    {
      id: "products",
      label: "Produtos",
      icon: Package,
      color: "text-green-500"
    },
    {
      id: "categories",
      label: "Categorias",
      icon: Tag,
      color: "text-purple-500"
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: TrendingUp,
      color: "text-orange-500"
    },
    {
      id: "settings",
      label: "Configurações",
      icon: Settings,
      color: "text-gray-500"
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-border/50 shadow-lg md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex items-center justify-center transition-all duration-200 relative",
                "mobile-touch-target mobile-ripple",
                "hover:bg-gray-50 active:scale-95",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {/* Indicador ativo */}
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full" />
              )}
              
              <Icon 
                className={cn(
                  "h-6 w-6 transition-all duration-200",
                  isActive ? "scale-110" : "scale-100",
                  isActive ? item.color : "text-muted-foreground"
                )} 
              />
            </button>
          );
        })}
      </div>
      
      {/* Espaçamento para o safe area em dispositivos com notch */}
      <div className="h-safe-area-inset-bottom bg-white/95" />
    </div>
  );
};

export default MobileBottomNav;