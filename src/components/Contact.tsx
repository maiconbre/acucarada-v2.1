import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, MapPin, Clock, Phone } from "lucide-react";

const Contact = () => {
  const handleWhatsAppClick = () => {
    const whatsappNumber = "5511999999999";
    const message = encodeURIComponent("Olá! Gostaria de entrar em contato com a Açucarada 🍫");
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "WhatsApp",
      subtitle: "(11) 99999-9999",
      description: "Atendimento rápido via WhatsApp"
    },
    {
      icon: MapPin,
      title: "Localização",
      subtitle: "São Paulo - SP",
      description: "Entregamos em toda a região metropolitana"
    },
    {
      icon: Clock,
      title: "Horário",
      subtitle: "Seg à Sáb: 9h às 18h",
      description: "Domingo apenas por encomenda"
    }
  ];

  return (
    <section id="contato" className="py-20 gradient-soft">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Entre em <span className="gradient-primary bg-clip-text text-transparent">Contato</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Estamos sempre prontos para criar momentos doces especiais para você. 
            Entre em contato e descubra como podemos adoçar seu dia!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Contact Cards */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="border-0 shadow-soft bg-card/80 backdrop-blur-sm hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="gradient-primary p-3 rounded-xl">
                      <info.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{info.title}</h3>
                      <p className="text-primary font-medium mb-2">{info.subtitle}</p>
                      <p className="text-sm text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="lg:pl-8">
            <Card className="border-0 shadow-elegant gradient-warm text-white overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-6 opacity-90" />
                  <h3 className="text-2xl font-display font-bold mb-4">
                    Faça seu Pedido Agora!
                  </h3>
                  <p className="mb-8 opacity-90 leading-relaxed">
                    Clique no botão abaixo e fale conosco diretamente pelo WhatsApp. 
                    Nosso atendimento é rápido e personalizado!
                  </p>
                  <Button
                    variant="whatsapp"
                    size="lg"
                    onClick={handleWhatsAppClick}
                    className="w-full text-lg py-6 h-auto bg-white/20 hover:bg-white/30 border border-white/30"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Conversar no WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                💌 Também fazemos encomendas para eventos especiais
              </p>
              <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                <span>🎂 Aniversários</span>
                <span>💒 Casamentos</span>
                <span>🎉 Festas</span>
                <span>🎁 Presentes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;