import ProductCard from "./ProductCard";

const ProductGrid = () => {
  // Sample products - in a real app, this would come from Supabase
  const products = [
    {
      id: 1,
      name: "Brigadeiro Gourmet",
      description: "Brigadeiros artesanais com chocolate belga e coberturas especiais",
      price: "R$ 3,50",
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=300&fit=crop",
      category: "Brigadeiros"
    },
    {
      id: 2,
      name: "Trufa de Chocolate",
      description: "Trufas cremosas com recheios variados e chocolate premium",
      price: "R$ 4,00",
      image: "https://images.unsplash.com/photo-1547043928-6adb67ae1a4f?w=500&h=300&fit=crop",
      category: "Trufas"
    },
    {
      id: 3,
      name: "Bem Casado",
      description: "Tradicional doce de casamento com massa fofinha e doce de leite",
      price: "R$ 5,50",
      image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&h=300&fit=crop",
      category: "Especiais"
    },
    {
      id: 4,
      name: "Beijinho Premium",
      description: "Beijinhos com coco fresco e toque especial da casa",
      price: "R$ 3,00",
      image: "https://images.unsplash.com/photo-1605681398213-d901a8e55b78?w=500&h=300&fit=crop",
      category: "Tradicionais"
    },
    {
      id: 5,
      name: "Alfajor Artesanal",
      description: "Delicioso alfajor com doce de leite caseiro e coco",
      price: "R$ 6,00",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=300&fit=crop",
      category: "Especiais"
    },
    {
      id: 6,
      name: "Petit Four",
      description: "Mini bolos decorados perfeitos para ocasiões especiais",
      price: "R$ 7,50",
      image: "https://images.unsplash.com/photo-1535141919479-077b4ac741fc?w=500&h=300&fit=crop",
      category: "Bolos"
    }
  ];

  return (
    <section id="produtos" className="py-20 gradient-soft">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Nossos <span className="gradient-primary bg-clip-text text-transparent">Doces</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Cada doce é cuidadosamente preparado com ingredientes selecionados e muito carinho. 
            Descubra sabores únicos que vão despertar seus sentidos.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              description={product.description}
              price={product.price}
              image={product.image}
              category={product.category}
            />
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">
            Não encontrou o que procurava? Entre em contato conosco!
          </p>
          <div className="inline-flex items-center gap-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-soft">
            <span className="text-sm font-medium">📱 Pedidos personalizados via WhatsApp</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;