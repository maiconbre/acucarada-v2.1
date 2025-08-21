import { Heart, Award, Clock, Sparkles, Users, Star } from "lucide-react";

export function About() {
  return (
    <section id="sobre" className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm text-primary px-4 py-2 rounded-full mb-6 border border-primary/20">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Nossa História</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Por que escolher a <span className="gradient-primary bg-clip-text text-transparent">Doce Conecta</span>?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Somos apaixonados por criar momentos especiais através dos nossos doces artesanais. 
            Cada produto é feito com dedicação e os melhores ingredientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center group animate-fade-in hover:scale-105 transition-all duration-300" style={{animationDelay: '0.2s'}}>
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 shadow-lg group-hover:shadow-xl">
              <Heart className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors">Feito com Amor</h3>
            <p className="text-muted-foreground leading-relaxed">
              Cada doce é preparado com carinho e atenção aos detalhes, 
              garantindo sabor e qualidade únicos.
            </p>
          </div>

          <div className="text-center group animate-fade-in hover:scale-105 transition-all duration-300" style={{animationDelay: '0.4s'}}>
            <div className="w-20 h-20 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-secondary/30 group-hover:to-secondary/20 transition-all duration-300 shadow-lg group-hover:shadow-xl">
              <Award className="h-10 w-10 text-secondary group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-semibold mb-4 group-hover:text-secondary transition-colors">Ingredientes Premium</h3>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos apenas ingredientes selecionados e de alta qualidade 
              para garantir o melhor sabor em cada mordida.
            </p>
          </div>

          <div className="text-center group animate-fade-in hover:scale-105 transition-all duration-300" style={{animationDelay: '0.6s'}}>
            <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-accent/30 group-hover:to-accent/20 transition-all duration-300 shadow-lg group-hover:shadow-xl">
              <Clock className="h-10 w-10 text-accent group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-semibold mb-4 group-hover:text-accent transition-colors">Sempre Frescos</h3>
            <p className="text-muted-foreground leading-relaxed">
              Nossos doces são preparados diariamente para garantir 
              frescor e sabor incomparáveis.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-in" style={{animationDelay: '0.8s'}}>
          <div className="text-center bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:bg-card/70 transition-all duration-300">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-primary mr-2" />
              <span className="text-2xl md:text-3xl font-bold text-primary">500+</span>
            </div>
            <p className="text-sm text-muted-foreground">Clientes Satisfeitos</p>
          </div>
          
          <div className="text-center bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:bg-card/70 transition-all duration-300">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-6 w-6 text-yellow-500 mr-2" />
              <span className="text-2xl md:text-3xl font-bold text-yellow-500">4.9</span>
            </div>
            <p className="text-sm text-muted-foreground">Avaliação Média</p>
          </div>
          
          <div className="text-center bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:bg-card/70 transition-all duration-300 col-span-2 md:col-span-1">
            <div className="flex items-center justify-center mb-2">
              <Heart className="h-6 w-6 text-red-500 mr-2" />
              <span className="text-2xl md:text-3xl font-bold text-red-500">3+</span>
            </div>
            <p className="text-sm text-muted-foreground">Anos de Experiência</p>
          </div>
        </div>
      </div>
    </section>
  );
}