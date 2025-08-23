import { MapPin, Phone, Clock, MessageCircle, Sparkles, Send, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSettings } from "@/hooks/useAppSettings";

export function Contact() {
  const { getWhatsAppLink } = useAppSettings();

  const handleWhatsAppClick = () => {
    const customMessage = "Olá! Gostaria de fazer um pedido dos seus doces artesanais.";
    const link = getWhatsAppLink(customMessage);
    window.open(link, "_blank");
  };

  return (
    <section id="contato" className="py-12 md:py-20 gradient-soft relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-primary/5" />
      <div className="absolute top-10 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="text-center mb-8 md:mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm text-primary px-4 py-2 rounded-full mb-6 border border-primary/20">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium font-text">Fale Conosco</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-title font-bold mb-4 md:mb-6">
            Entre em <span className="gradient-primary bg-clip-text text-transparent">Contato</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-text px-4">
            Estamos prontos para atender você! Entre em contato conosco e faça seu pedido personalizado.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          {/* Contact Info */}
          <div className="space-y-6 md:space-y-8 animate-fade-in px-4 md:px-0" style={{animationDelay: '0.2s'}}>
            <div className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 md:p-6 hover:bg-card/70 transition-all duration-300 hover:scale-105">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/30 transition-all">
                  <Phone className="h-5 w-5 md:h-7 md:w-7 text-green-600 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-semibold mb-2 group-hover:text-green-600 transition-colors font-title">WhatsApp</h3>
                  <p className="text-muted-foreground mb-4 font-text">
                    Faça seu pedido diretamente pelo WhatsApp
                  </p>
                  <Button 
                    onClick={handleWhatsAppClick} 
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white group-hover:scale-105 transition-all text-sm md:text-base"
                    size="sm"
                  >
                    <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
                    (11) 99999-9999
                  </Button>
                </div>
              </div>
            </div>

            <div className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 md:p-6 hover:bg-card/70 transition-all duration-300 hover:scale-105">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/30 transition-all">
                  <MapPin className="h-5 w-5 md:h-7 md:w-7 text-blue-600 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors font-title">Localização</h3>
                  <p className="text-sm md:text-base text-muted-foreground font-text">
                    Atendemos toda a região metropolitana<br />
                    <span className="font-medium">São Paulo - SP</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:bg-card/70 transition-all duration-300 hover:scale-105">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/30 transition-all">
                  <Clock className="h-5 w-5 md:h-7 md:w-7 text-purple-600 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-2 group-hover:text-purple-600 transition-colors font-title">Horário de Atendimento</h3>
                  <div className="text-sm md:text-base text-muted-foreground space-y-1 font-text">
                    <p><span className="font-medium">Segunda a Sexta:</span> 8h às 18h</p>
                    <p><span className="font-medium">Sábado:</span> 8h às 16h</p>
                    <p><span className="font-medium">Domingo:</span> 9h às 15h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced CTA Card */}
          <div className="animate-fade-in mx-4 md:mx-0" style={{animationDelay: '0.4s'}}>
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-primary/5" />
              <div className="absolute top-4 right-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
              
              <div className="text-center relative">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg">
                  <MessageCircle className="h-8 w-8 md:h-10 md:w-10 text-primary animate-pulse" />
                </div>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-3 md:mb-4 text-primary font-title">
                  Pronto para fazer seu pedido?
                </h3>
                <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8 leading-relaxed font-text px-2 md:px-0">
                  Clique no botão abaixo e fale conosco pelo WhatsApp. 
                  Vamos criar algo delicioso especialmente para você!
                </p>
                
                {/* Features */}
                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                  <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground font-text">
                    <Heart className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                    <span>Atendimento personalizado</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground font-text">
                    <Send className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
                    <span>Resposta rápida</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleWhatsAppClick} 
                  size="lg" 
                  className="w-full gap-2 md:gap-3 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group text-sm md:text-base"
                >
                  <MessageCircle className="h-4 w-4 md:h-5 md:w-5 group-hover:animate-bounce" />
                  Fazer Pedido pelo WhatsApp
                  <Send className="h-3 w-3 md:h-4 md:w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}