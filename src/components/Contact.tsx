import { MapPin, Phone, Clock, MessageCircle, Sparkles, Send, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Contact() {
  const handleWhatsAppClick = () => {
    const whatsappNumber = "5521973774279";
    const customMessage = "Olá! Gostaria de fazer um pedido dos seus doces artesanais.";
    const encodedMessage = encodeURIComponent(customMessage);
    const link = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(link, "_blank");
  };

  return (
    <section id="contato" className="py-12 md:py-20 gradient-soft relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-primary/5" />
      <div className="absolute top-10 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="text-center mb-8 md:mb-16">
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
          <div className="space-y-6 md:space-y-8 px-4 md:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* WhatsApp */}
              <div className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 md:p-6 hover:bg-card/70 transition-all duration-300 hover:scale-105">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/30 transition-all">
                    <MessageCircle className="h-5 w-5 md:h-7 md:w-7 text-green-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-title font-semibold text-base md:text-lg mb-1 md:mb-2">WhatsApp</h3>
                    <p className="text-muted-foreground text-xs md:text-sm mb-2 md:mb-3 leading-relaxed">
                      WhatsApp disponível - (21) 97377-4279
                    </p>
                    <Button 
                      onClick={handleWhatsAppClick}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm h-8 md:h-9 px-3 md:px-4"
                    >
                      <MessageCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      Enviar Mensagem
                    </Button>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 md:p-6 hover:bg-card/70 transition-all duration-300 hover:scale-105">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/30 transition-all">
                    <Phone className="h-5 w-5 md:h-7 md:w-7 text-blue-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-title font-semibold text-base md:text-lg mb-1 md:mb-2">Telefone</h3>
                    <p className="text-muted-foreground text-xs md:text-sm mb-2 md:mb-3 leading-relaxed">
                      (21) 97377-4279 - Ligue durante o horário de atendimento
                    </p>
                    <a 
                      href="tel:+5521973774279" 
                      className="inline-flex items-center justify-center rounded-md text-xs md:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-8 md:h-9 px-3 md:px-4"
                    >
                      <Phone className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      Ligar Agora
                    </a>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 md:p-6 hover:bg-card/70 transition-all duration-300 hover:scale-105">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/30 transition-all">
                    <MapPin className="h-5 w-5 md:h-7 md:w-7 text-orange-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-title font-semibold text-base md:text-lg mb-1 md:mb-2">Localização</h3>
                    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                      📍 Est. Agua Branca, 4.296 - Bangu<br />
                      Rio de Janeiro - RJ<br />
                      Entregamos em toda região
                    </p>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 md:p-6 hover:bg-card/70 transition-all duration-300 hover:scale-105">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/30 transition-all">
                    <Clock className="h-5 w-5 md:h-7 md:w-7 text-purple-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-title font-semibold text-base md:text-lg mb-1 md:mb-2">Horário</h3>
                    <div className="text-muted-foreground text-xs md:text-sm leading-relaxed space-y-1">
                      <p>🕒 Qui à Sex: 15h às 22h</p>
                      <p>🕒 Sab e Dom: 13h às 23h</p>
                      <p>Horário de atendimento</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="mx-4 md:mx-0">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 md:p-8 shadow-lg">
              <h3 className="font-title font-semibold text-xl md:text-2xl mb-6 text-center">Envie uma Mensagem</h3>
              <form className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">Nome</label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">E-mail</label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">Assunto</label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    placeholder="Assunto da mensagem"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">Mensagem</label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background resize-none"
                    placeholder="Sua mensagem..."
                  ></textarea>
                </div>
                <Button type="submit" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}