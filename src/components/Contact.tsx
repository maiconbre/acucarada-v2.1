import { MapPin, Phone, Clock, MessageCircle, Sparkles, Send, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Contact() {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Olá! Gostaria de fazer um pedido dos seus doces artesanais.");
    window.open(`https://wa.me/5511999999999?text=${message}`, "_blank");
  };

  return (
    <section id="contato" className="py-20 gradient-soft relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute top-10 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm text-primary px-4 py-2 rounded-full mb-6 border border-primary/20">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Fale Conosco</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Entre em <span className="gradient-primary bg-clip-text text-transparent">Contato</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Estamos prontos para atender você! Entre em contato conosco e faça seu pedido personalizado.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:bg-card/70 transition-all duration-300 hover:scale-105">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-green-500/30 group-hover:to-green-600/20 transition-all">
                  <Phone className="h-7 w-7 text-green-600 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-green-600 transition-colors">WhatsApp</h3>
                  <p className="text-muted-foreground mb-4">
                    Faça seu pedido diretamente pelo WhatsApp
                  </p>
                  <Button 
                    onClick={handleWhatsAppClick} 
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white group-hover:scale-105 transition-all"
                    size="sm"
                  >
                    <MessageCircle className="h-4 w-4" />
                    (11) 99999-9999
                  </Button>
                </div>
              </div>
            </div>

            <div className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:bg-card/70 transition-all duration-300 hover:scale-105">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-blue-500/30 group-hover:to-blue-600/20 transition-all">
                  <MapPin className="h-7 w-7 text-blue-600 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">Localização</h3>
                  <p className="text-muted-foreground">
                    Atendemos toda a região metropolitana<br />
                    <span className="font-medium">São Paulo - SP</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:bg-card/70 transition-all duration-300 hover:scale-105">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-purple-500/30 group-hover:to-purple-600/20 transition-all">
                  <Clock className="h-7 w-7 text-purple-600 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-600 transition-colors">Horário de Atendimento</h3>
                  <div className="text-muted-foreground space-y-1">
                    <p><span className="font-medium">Segunda a Sexta:</span> 8h às 18h</p>
                    <p><span className="font-medium">Sábado:</span> 8h às 16h</p>
                    <p><span className="font-medium">Domingo:</span> 9h às 15h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced CTA Card */}
          <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
            <div className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
              <div className="absolute top-4 right-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
              
              <div className="text-center relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <MessageCircle className="h-10 w-10 text-primary animate-pulse" />
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Pronto para fazer seu pedido?
                </h3>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Clique no botão abaixo e fale conosco pelo WhatsApp. 
                  Vamos criar algo delicioso especialmente para você!
                </p>
                
                {/* Features */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>Atendimento personalizado</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Send className="h-4 w-4 text-blue-500" />
                    <span>Resposta rápida</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleWhatsAppClick} 
                  size="lg" 
                  className="w-full gap-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
                >
                  <MessageCircle className="h-5 w-5 group-hover:animate-bounce" />
                  Fazer Pedido pelo WhatsApp
                  <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}