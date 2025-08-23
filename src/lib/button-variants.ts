import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-smooth",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-elegant rounded-lg",
        hero: "bg-rose-primary text-white hover:bg-rose-primary/90 hover:shadow-glow transform hover:scale-[1.02] rounded-xl font-medium",
        elegant: "bg-brown-primary text-white hover:bg-brown-primary/90 shadow-soft hover:shadow-elegant rounded-lg",
        soft: "bg-primary-soft text-primary hover:bg-primary-soft/80 rounded-lg",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft rounded-lg",
        outline:
          "border border-border bg-background hover:bg-secondary/50 hover:text-secondary-foreground rounded-lg",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg",
        ghost: "hover:bg-secondary/50 hover:text-secondary-foreground rounded-lg",
        link: "text-primary underline-offset-4 hover:underline",
        whatsapp: "bg-brown-primary text-white hover:bg-brown-primary/90 shadow-soft hover:shadow-elegant rounded-lg",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)