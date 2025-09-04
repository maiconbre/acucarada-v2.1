import React from 'react';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { ArrowLeft } from 'lucide-react';

const ProductDetailSkeleton = React.memo(() => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header com botão de voltar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted/50 rounded-full animate-pulse flex items-center justify-center">
              <ArrowLeft className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <div className="h-6 bg-muted/50 rounded w-32 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Seção da Imagem */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square bg-muted/50 animate-pulse relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/60" />
                  <div className="absolute bottom-4 right-4 h-8 w-16 bg-muted/70 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
            
            {/* Miniaturas */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-16 w-16 bg-muted/50 rounded-lg animate-pulse flex-shrink-0"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>

          {/* Seção de Informações */}
          <div className="space-y-6">
            {/* Título e Preço */}
            <div className="space-y-4">
              <div className="h-8 bg-muted/50 rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-pink-100 rounded w-24 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-muted/30 rounded w-full animate-pulse" />
                <div className="h-4 bg-muted/30 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-muted/30 rounded w-4/6 animate-pulse" />
              </div>
            </div>

            {/* Sabores */}
            <div className="space-y-3">
              <div className="h-5 bg-muted/40 rounded w-32 animate-pulse" />
              <div className="flex flex-wrap gap-2">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className="h-8 bg-muted/40 rounded-full px-4 animate-pulse"
                    style={{ 
                      width: `${Math.random() * 40 + 60}px`,
                      animationDelay: `${i * 0.1}s` 
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Ingredientes */}
            <div className="space-y-3">
              <div className="h-5 bg-muted/40 rounded w-24 animate-pulse" />
              <div className="flex flex-wrap gap-2">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className="h-6 bg-muted/30 rounded px-3 animate-pulse"
                    style={{ 
                      width: `${Math.random() * 30 + 50}px`,
                      animationDelay: `${i * 0.05}s` 
                    }}
                  />
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Botões de Ação */}
            <div className="flex gap-4">
              <div className="h-12 bg-pink-100 rounded flex-1 animate-pulse" />
              <div className="h-12 w-12 bg-muted/40 rounded animate-pulse" />
              <div className="h-12 w-12 bg-muted/40 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Seção de Comentários */}
        <div className="mt-16">
          <div className="h-6 bg-muted/50 rounded w-32 mb-6 animate-pulse" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-muted/50 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 bg-muted/40 rounded w-24 animate-pulse" />
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, starIndex) => (
                          <div key={starIndex} className="h-3 w-3 bg-muted/30 rounded animate-pulse" />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-3 bg-muted/30 rounded w-full animate-pulse" />
                      <div className="h-3 bg-muted/30 rounded w-3/4 animate-pulse" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

ProductDetailSkeleton.displayName = 'ProductDetailSkeleton';

export default ProductDetailSkeleton;