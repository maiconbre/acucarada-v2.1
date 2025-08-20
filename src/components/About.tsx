import { Heart, Award, Users, Clock } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Heart,
      title: "Feito com Amor",
      description: "Cada doce é preparado artesanalmente com muito carinho e dedicação"
    },
    {
      icon: Award,
      title: "Ingredientes Premium",
      description: "Utilizamos apenas ingredientes selecionados e de alta qualidade"
    },
    {
      icon: Users,
      title: "500+ Clientes Felizes",
      description: "Centenas de famílias já experimentaram nossos doces únicos"
    },
    {
      icon: Clock,
      title: "Sempre Fresquinhos",
      description: "Doces preparados no dia da entrega para máxima qualidade"
    }
  ];

  return (
    <section id="sobre" className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Nossa <span className="gradient-primary bg-clip-text text-transparent">História</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              A Açucarada nasceu do sonho de criar doces únicos que despertam sorrisos e criam memórias especiais. 
              Começamos em nossa cozinha caseira e hoje atendemos centenas de famílias apaixonadas pelos nossos sabores artesanais.
            </p>
            <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
              Cada receita é desenvolvida com cuidado, utilizando técnicas tradicionais combinadas com toques modernos 
              que tornam nossos doces verdadeiramente especiais.
            </p>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="gradient-primary p-3 rounded-xl">
                    <feature.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="gradient-warm rounded-3xl p-8 shadow-elegant">
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop"
                alt="Processo artesanal de confecção dos doces"
                className="w-full h-96 object-cover rounded-2xl"
              />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-card border border-border/50 rounded-2xl p-6 shadow-elegant backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="gradient-primary p-2 rounded-lg">
                  <Award className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Qualidade Garantida</p>
                  <p className="text-xs text-muted-foreground">Receitas exclusivas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;