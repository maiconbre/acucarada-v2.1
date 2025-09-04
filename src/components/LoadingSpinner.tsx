import { ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export const LoadingSpinner = ({ 
  size = "md", 
  text = "Carregando...", 
  className 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3 p-6 loading-enter loading-enter-active",
      className
    )}>
      <ChefHat 
        className={cn(
          "text-rose-primary animate-pulse transition-all duration-300",
          sizeClasses[size]
        )} 
      />
      <p className={cn(
        "text-muted-foreground font-medium transition-opacity duration-300",
        textSizeClasses[size]
      )}>
        {text}
      </p>
    </div>
  );
};

export default LoadingSpinner;