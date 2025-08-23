/**
 * ProductManagement Component
 * 
 * Gerencia produtos com funcionalidade de soft delete implementada.
 * 
 * Funcionalidades:
 * - Soft Delete: Desativa produtos preservando dados históricos (padrão)
 * - Hard Delete: Exclusão física permanente (disponível mas não exposta na UI)
 * - Toggle Active: Ativa/desativa produtos
 * 
 * O soft delete permite:
 * - Preservação de dados de analytics
 * - Recuperação posterior via painel do Supabase
 * - Manutenção do histórico de vendas e interações
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye, EyeOff, Grid3X3, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_featured: boolean;
  is_active: boolean;
}

interface ProductManagementProps {
  products: Product[];
  onProductsChange: () => void;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

export const ProductManagement = ({ products, onProductsChange }: ProductManagementProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'toggle' | 'soft_delete' | 'hard_delete';
    product: Product | null;
  }>({ isOpen: false, type: 'toggle', product: null });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category: "Outros",
    is_featured: false,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories' as 'products')
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image_url: "",
      category: "Outros",
      is_featured: false,
      is_active: true,
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      image_url: product.image_url || "",
      category: product.category,
      is_featured: product.is_featured,
      is_active: product.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image_url: formData.image_url,
        category: formData.category,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;
        
        toast({
          title: "Produto atualizado!",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from("products")
          .insert([productData]);

        if (error) throw error;
        
        toast({
          title: "Produto criado!",
          description: "O novo produto foi adicionado ao catálogo.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      onProductsChange();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Soft delete: Desativa o produto em vez de excluí-lo fisicamente
   * Preserva os dados históricos e permite recuperação posterior
   */
  const handleSoftDelete = async (id: string) => {
    try {
      // Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      console.log('Desativando produto (soft delete):', id);
      
      // Soft delete: apenas marcar como inativo
      const { error } = await supabase
        .from("products")
        .update({ is_active: false })
        .eq("id", id);

      if (error) {
        console.error('Erro ao desativar produto:', error);
        throw error;
      }

      toast({
        title: "Produto desativado!",
        description: "O produto foi removido do catálogo público, mas os dados foram preservados.",
      });
      
      onProductsChange();
    } catch (error: unknown) {
      console.error('Erro ao desativar produto:', error);
      let errorMessage = "Erro desconhecido";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Verificar tipos específicos de erro
        if (error.message.includes('permission') || error.message.includes('policy')) {
          errorMessage = "Você não tem permissão para desativar este produto.";
        }
      }
      
      toast({
        variant: "destructive",
        title: "Erro ao desativar produto",
        description: errorMessage,
      });
    }
  };

  /**
   * Hard delete: Exclusão física do produto (mantido para casos especiais)
   * Use com cuidado - remove permanentemente todos os dados
   */
  const handleHardDelete = async (id: string) => {
    try {
      // Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      console.log('Excluindo produto permanentemente:', id);
      
      // Hard delete: exclusão física
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) {
        console.error('Erro detalhado:', error);
        throw error;
      }

      toast({
        title: "Produto excluído permanentemente!",
        description: "O produto e todos os dados relacionados foram removidos.",
      });
      
      onProductsChange();
    } catch (error: unknown) {
      console.error('Erro ao excluir produto:', error);
      let errorMessage = "Erro desconhecido";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Verificar tipos específicos de erro
        if (error.message.includes('409') || error.message.includes('conflict')) {
          errorMessage = "Não é possível excluir este produto pois ele possui dados relacionados. Tente desativar o produto em vez de excluí-lo.";
        } else if (error.message.includes('permission') || error.message.includes('policy')) {
          errorMessage = "Você não tem permissão para excluir este produto.";
        }
      }
      
      toast({
        variant: "destructive",
        title: "Erro ao excluir produto",
        description: errorMessage,
      });
    }
  };

  const toggleActive = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_active: !product.is_active })
        .eq("id", product.id);

      if (error) throw error;

      toast({
        title: product.is_active ? "Produto desativado" : "Produto ativado",
        description: `O produto foi ${product.is_active ? "removido" : "adicionado"} ao catálogo público.`,
      });
      
      onProductsChange();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMessage,
      });
    }
  };

  const openConfirmDialog = (type: 'toggle' | 'soft_delete' | 'hard_delete', product: Product) => {
    setConfirmDialog({ isOpen: true, type, product });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.product) return;
    
    if (confirmDialog.type === 'toggle') {
      await toggleActive(confirmDialog.product);
    } else if (confirmDialog.type === 'soft_delete') {
      await handleSoftDelete(confirmDialog.product.id);
    } else if (confirmDialog.type === 'hard_delete') {
      await handleHardDelete(confirmDialog.product.id);
    }
    
    setConfirmDialog({ isOpen: false, type: 'toggle', product: null });
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold">Gerenciar Produtos</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Crie, edite e gerencie os produtos do catálogo
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" onClick={resetForm} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Novo Produto</span>
              <span className="xs:hidden">Novo</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {editingProduct 
                  ? "Atualize as informações do produto"
                  : "Preencha os dados para criar um novo produto"
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL da Imagem</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                />
                <Label htmlFor="is_featured">Pronta entrega</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Produto ativo</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="hero" disabled={loading}>
                  {loading ? "Salvando..." : editingProduct ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Produtos</CardTitle>
              <CardDescription>
                {products.length} produtos cadastrados
              </CardDescription>
            </div>
            {/* Botão toggle para modo de visualização - apenas mobile */}
            <div className="flex sm:hidden items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* Mobile Layout */}
          <div className="block sm:hidden">
            {viewMode === 'list' ? (
              /* Mobile List Layout */
              <div className="space-y-3 p-4">
                {products.map((product) => (
                  <Card key={product.id} className="p-3 mobile-card-hover mobile-ripple">
                    <div className="flex items-center space-x-3">
                      {product.image_url && (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="h-20 w-20 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 pr-2">
                            <h3 className="font-medium text-sm leading-tight mb-1">{product.name}</h3>
                            <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                            <p className="text-sm font-semibold text-primary">R$ {product.price.toFixed(2).replace(".", ",")}</p>
                          </div>
                        </div>
                        
                        {/* Badges */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.is_featured && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5">
                              Pronta entrega
                            </Badge>
                          )}
                          <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs px-2 py-0.5">
                            {product.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openConfirmDialog('toggle', product)}
                            className="h-8 w-8 p-0 mobile-touch-target"
                          >
                            {product.is_active ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="h-8 w-8 p-0 mobile-touch-target"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openConfirmDialog('soft_delete', product)}
                            className="text-destructive hover:text-destructive h-8 w-8 p-0 mobile-touch-target"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              /* Mobile Grid Layout */
              <div className="grid grid-cols-2 gap-3 p-4">
                {products.map((product) => (
                  <Card key={product.id} className="p-3 mobile-card-hover mobile-ripple">
                    <div className="space-y-2">
                      {product.image_url && (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-24 rounded-lg object-cover"
                        />
                      )}
                      <div className="space-y-1">
                        <h3 className="font-medium text-xs leading-tight line-clamp-2">{product.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{product.category}</p>
                        <p className="text-sm font-semibold text-primary">R$ {product.price.toFixed(2).replace(".", ",")}</p>
                      </div>
                      
                      {/* Badges */}
                      <div className="flex flex-wrap gap-1">
                        {product.is_featured && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                            Pronta entrega
                          </Badge>
                        )}
                        <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs px-1.5 py-0.5">
                          {product.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      
                      {/* Compact Action Buttons */}
                      <div className="flex items-center justify-between gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openConfirmDialog('toggle', product)}
                          className="h-7 w-7 p-0 mobile-touch-target"
                        >
                          {product.is_active ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          className="h-7 w-7 p-0 mobile-touch-target"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openConfirmDialog('soft_delete', product)}
                          className="text-destructive hover:text-destructive h-7 w-7 p-0 mobile-touch-target"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {/* Desktop Table Layout */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {product.image_url && (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.is_featured && (
                            <Badge variant="secondary" className="text-xs">
                              Pronta entrega
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>R$ {product.price.toFixed(2).replace(".", ",")}</TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openConfirmDialog('toggle', product)}
                        >
                          {product.is_active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openConfirmDialog('soft_delete', product)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Confirmação */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog({ isOpen: false, type: 'toggle', product: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmDialog.type === 'soft_delete' ? (
                <>
                  <Trash2 className="h-5 w-5 text-destructive" />
                  Excluir Produto
                </>
              ) : confirmDialog.type === 'hard_delete' ? (
                <>
                  <Trash2 className="h-5 w-5 text-destructive" />
                  Excluir Produto Permanentemente
                </>
              ) : (
                <>
                  {confirmDialog.product?.is_active ? (
                    <>
                      <EyeOff className="h-5 w-5 text-orange-500" />
                      Ocultar Produto
                    </>
                  ) : (
                    <>
                      <Eye className="h-5 w-5 text-green-500" />
                      Mostrar Produto
                    </>
                  )}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {confirmDialog.product && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <img
                  src={confirmDialog.product.image_url || "/placeholder.svg"}
                  alt={confirmDialog.product.name}
                  className="h-12 w-12 rounded-md object-cover"
                />
                <div>
                  <p className="font-medium">{confirmDialog.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {confirmDialog.product.category}
                  </p>
                </div>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              {confirmDialog.type === 'soft_delete' ? (
                "Este item está sendo excluído, mas não se preocupe os dados podem ser recuperados se necessário! ✨"
              ) : confirmDialog.type === 'hard_delete' ? (
                "Esta ação não pode ser desfeita. O produto será permanentemente removido do catálogo e todos os dados relacionados serão excluídos."
              ) : confirmDialog.product?.is_active ? (
                "O produto será removido do catálogo público e não ficará visível para os clientes."
              ) : (
                "O produto será adicionado ao catálogo público e ficará visível para os clientes."
              )}
            </p>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ isOpen: false, type: 'toggle', product: null })}
            >
              Cancelar
            </Button>
            <Button
              variant={confirmDialog.type === 'hard_delete' ? 'destructive' : 'default'}
              onClick={handleConfirmAction}
              className={confirmDialog.type === 'toggle' && !confirmDialog.product?.is_active ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {confirmDialog.type === 'soft_delete' ? (
                'Excluir'
              ) : confirmDialog.type === 'hard_delete' ? (
                'Excluir Permanentemente'
              ) : confirmDialog.product?.is_active ? (
                'Ocultar'
              ) : (
                'Mostrar'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};