import { Heart, Award, Clock, Sparkles, Users, Star, ChefHat, Gift } from "lucide-react";

export function About() {
  return (
    <section id="sobre" className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-primary/5" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm text-primary px-4 py-2 rounded-full mb-6 border border-primary/20">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium font-text">Nossa História</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-title font-bold mb-6">
            Por que escolher a <span className="gradient-primary bg-clip-text text-transparent">Doce Conecta</span>?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-text">
            Somos apaixonados por criar momentos especiais através dos nossos doces artesanais. 
            Cada produto é feito com dedicação e os melhores ingredientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center group animate-fade-in hover:scale-105 transition-all duration-300" style={{animationDelay: '0.2s'}}>
            <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/30 transition-all duration-300 shadow-lg group-hover:shadow-xl">
              <Heart className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors font-title">Feito com Amor</h3>
            <p className="text-muted-foreground leading-relaxed font-text">
              Cada doce é preparado com carinho e atenção aos detalhes, 
              garantindo sabor e qualidade únicos.
            </p>
          </div>

          <div className="text-center group animate-fade-in hover:scale-105 transition-all duration-300" style={{animationDelay: '0.4s'}}>
            <div className="w-20 h-20 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary/30 transition-all duration-300 shadow-lg group-hover:shadow-xl">
              <Award className="h-10 w-10 text-secondary group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-semibold mb-4 group-hover:text-secondary transition-colors font-title">Ingredientes Premium</h3>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos apenas ingredientes selecionados e de alta qualidade 
              para garantir o melhor sabor em cada mordida.
            </p>
          </div>

          <div className="text-center group animate-fade-in hover:scale-105 transition-all duration-300" style={{animationDelay: '0.6s'}}>
            <div className="w-20 h-20 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/30 transition-all duration-300 shadow-lg group-hover:shadow-xl">
              <Clock className="h-10 w-10 text-accent group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-semibold mb-4 group-hover:text-accent transition-colors font-title">Sempre Frescos</h3>
            <p className="text-muted-foreground leading-relaxed">
              Nossos doces são preparados diariamente para garantir 
              frescor e sabor incomparáveis.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Story Content - Left */}
            <div className="space-y-6 animate-fade-in" style={{animationDelay: '1s'}}>
              <div className="inline-flex items-center gap-2 bg-accent/10 backdrop-blur-sm text-accent px-4 py-2 rounded-full border border-accent/20">
                <ChefHat className="h-4 w-4" />
                <span className="text-sm font-medium font-text">Nossa Jornada</span>
              </div>
              
              <h3 className="text-3xl md:text-4xl font-title font-bold text-foreground">
                Como tudo <span className="gradient-primary bg-clip-text text-transparent">começou</span>
              </h3>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed font-text">
                <p className="text-lg">
                  Em 2020, durante um período desafiador para todos, <strong className="text-foreground">Maria Clara</strong> descobriu sua paixão pela confeitaria em sua própria cozinha. O que começou como uma forma de trazer alegria para a família rapidamente se transformou em algo muito maior.
                </p>
                
                <p>
                  Inspirada pelas receitas da avó e movida pelo desejo de criar momentos especiais, Maria começou a experimentar combinações únicas de sabores. Cada doce era uma pequena obra de arte, feita com ingredientes cuidadosamente selecionados e muito amor.
                </p>
                
                <p>
                  O primeiro pedido veio de uma vizinha que provou um brigadeiro gourmet de pistache com chocolate belga. A partir dali, o boca a boca fez a magia acontecer. Amigos, familiares e conhecidos começaram a encomendar para suas celebrações especiais.
                </p>
                
                <p>
                  <strong className="text-foreground">"Açucarada"</strong> nasceu da união entre tradição e inovação, onde cada receita conta uma história e cada doce carrega o carinho de quem o fez. Hoje, nossa missão continua a mesma: adoçar momentos especiais e criar memórias que durem para sempre.
                </p>
              </div>
              
              <div className="flex items-center gap-4 pt-4">
                <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                  <Gift className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary font-text">Desde 2020</span>
                </div>
                <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full">
                  <Heart className="h-4 w-4 text-accent fill-accent" />
                  <span className="text-sm font-medium text-accent font-text">Feito com amor</span>
                </div>
              </div>
            </div>
            
            {/* Story Image - Right */}
            <div className="relative animate-fade-in" style={{animationDelay: '1.2s'}}>
              <div className="relative overflow-hidden rounded-2xl shadow-elegant">
                {/* Story image */}
                <div className="aspect-[4/5] relative">
                  <img 
                    src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                    alt="Confeiteira preparando doces artesanais" 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay with founder info */}
                  <div className="absolute inset-0 bg-black/60" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="text-center space-y-2">
                      <p className="text-lg font-title font-semibold">Maria Clara</p>
                      <p className="text-sm opacity-90 font-text">Fundadora & Chef Confeiteira</p>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 rounded-full animate-pulse" />
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-accent/30 rounded-full animate-bounce" />
              </div>
              
              {/* Quote overlay */}
              <div className="absolute -bottom-6 left-6 right-6 bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-lg">
                <p className="text-sm italic text-muted-foreground text-center font-text">
                  "Cada doce que faço carrega um pedacinho do meu coração e a tradição da minha família."
                </p>
                <p className="text-xs text-primary text-center mt-2 font-medium font-text">- Maria Clara, Fundadora</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-in" style={{animationDelay: '0.8s'}}>
          <div className="text-center bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:bg-card/70 transition-all duration-300">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-primary mr-2" />
              <span className="text-2xl md:text-3xl font-bold text-primary">500+</span>
            </div>
            <p className="text-sm text-muted-foreground font-text">Clientes Satisfeitos</p>
          </div>
          
          <div className="text-center bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:bg-card/70 transition-all duration-300">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-6 w-6 text-yellow-500 mr-2" />
              <span className="text-2xl md:text-3xl font-bold text-yellow-500">4.9</span>
            </div>
            <p className="text-sm text-muted-foreground font-text">Avaliação Média</p>
          </div>
          
          <div className="text-center bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:bg-card/70 transition-all duration-300 col-span-2 md:col-span-1">
            <div className="flex items-center justify-center mb-2">
              <Heart className="h-6 w-6 text-red-500 mr-2" />
              <span className="text-2xl md:text-3xl font-bold text-red-500">3+</span>
            </div>
            <p className="text-sm text-muted-foreground font-text">Anos de Experiência</p>
          </div>
        </div>
      </div>
    </section>
  );
}