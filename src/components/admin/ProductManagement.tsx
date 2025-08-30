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
import { ImageUpload } from "@/components/ui/image-upload";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  ingredientes?: string;
  validade_armazenamento_dias?: number;
  sabores?: string[];
  sabor_images?: Record<string, string>;
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
  const [actionLoading, setActionLoading] = useState<string | null>(null); // ID do produto sendo processado
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category: "Outros",
    ingredientes: "",
    validade_armazenamento_dias: "",
    sabores: "" as string,
    sabor_images: {} as Record<string, string>,
    is_featured: false,
    is_active: true,
  });
  
  // Estado para gerenciar sabores dinamicamente
  const [flavors, setFlavors] = useState<Array<{id: string, name: string, image: string}>>([]);
  const [newFlavorName, setNewFlavorName] = useState("");
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
      ingredientes: "",
      validade_armazenamento_dias: "",
      sabores: "" as string,
      sabor_images: {} as Record<string, string>,
      is_featured: false,
      is_active: true,
    });
    setFlavors([]);
    setNewFlavorName("");
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
      ingredientes: product.ingredientes || "",
      validade_armazenamento_dias: product.validade_armazenamento_dias?.toString() || "",
      sabores: product.sabores?.join(", ") || "",
      sabor_images: product.sabor_images || {},
      is_featured: product.is_featured,
      is_active: product.is_active,
    });
    
    // Carregar sabores existentes
    if (product.sabores && product.sabores.length > 0) {
      const existingFlavors = product.sabores.map((flavor, index) => ({
        id: `flavor-${index}`,
        name: flavor,
        image: product.sabor_images?.[flavor] || ""
      }));
      setFlavors(existingFlavors);
    } else {
      setFlavors([]);
    }
    
    setIsDialogOpen(true);
  };

  // Funções para gerenciar sabores
  const addFlavor = () => {
    if (newFlavorName.trim() && !flavors.some(f => f.name.toLowerCase() === newFlavorName.toLowerCase())) {
      const newFlavor = {
        id: `flavor-${Date.now()}`,
        name: newFlavorName.trim(),
        image: ""
      };
      setFlavors([...flavors, newFlavor]);
      setNewFlavorName("");
    }
  };

  const removeFlavor = (id: string) => {
    setFlavors(flavors.filter(f => f.id !== id));
  };

  const updateFlavorImage = (id: string, imageUrl: string) => {
    setFlavors(flavors.map(f => f.id === id ? { ...f, image: imageUrl } : f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validação inteligente
        if (flavors.length === 0) {
          toast({
            variant: "destructive",
            title: "Erro de validação",
            description: "Adicione pelo menos um sabor para o produto.",
          });
          setLoading(false);
          return;
        }
 
        if (!formData.name.trim()) {
          toast({
            variant: "destructive",
            title: "Erro de validação",
            description: "Nome do produto é obrigatório.",
          });
          setLoading(false);
          return;
        }
 
        if (!formData.price || parseFloat(formData.price) <= 0) {
          toast({
            variant: "destructive",
            title: "Erro de validação",
            description: "Preço deve ser maior que zero.",
          });
          setLoading(false);
          return;
        }
 
        if (!formData.category || formData.category === "") {
          toast({
            variant: "destructive",
            title: "Erro de validação",
            description: "Selecione uma categoria.",
          });
          setLoading(false);
          return;
        }

      // Preparar dados dos sabores
      const saboresArray = flavors.map(f => f.name);
      const saborImages = flavors.reduce((acc, flavor) => {
        if (flavor.image) {
          acc[flavor.name] = flavor.image;
        }
        return acc;
      }, {} as Record<string, string>);

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image_url: formData.image_url,
        category: formData.category,
        ingredientes: formData.ingredientes || null,
        validade_armazenamento_dias: formData.validade_armazenamento_dias ? parseInt(formData.validade_armazenamento_dias) : null,
        sabores: saboresArray.length > 0 ? saboresArray : null,
        sabor_images: Object.keys(saborImages).length > 0 ? saborImages : null,
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
   * Soft delete: Remove o produto da visualização do admin
   * Preserva os dados históricos e permite recuperação posterior via banco
   */
  const handleSoftDelete = async (id: string) => {
    setActionLoading(id);
    try {
      // Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      console.log('Movendo produto para lixeira (soft delete):', id);
      
      // Soft delete: marcar como deletado e inativo
      const { error } = await supabase
        .from("products")
        .update({ 
          is_active: false,
          deleted_at: new Date().toISOString()
        })
        .eq("id", id)
        .select(); // Adicionar select para melhor performance

      if (error) {
        console.error('Erro ao mover produto para lixeira:', error);
        throw error;
      }

      toast({
        title: "Produto movido para lixeira!",
        description: "O produto foi removido do painel admin, mas pode ser recuperado via banco de dados.",
      });
      
      // Atualizar estado local com um pequeno delay para melhor UX
      setTimeout(() => {
        onProductsChange();
      }, 100);
    } catch (error: unknown) {
      console.error('Erro ao mover produto para lixeira:', error);
      let errorMessage = "Erro desconhecido";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Verificar tipos específicos de erro
        if (error.message.includes('permission') || error.message.includes('policy')) {
          errorMessage = "Você não tem permissão para mover este produto para lixeira.";
        }
      }
      
      toast({
        variant: "destructive",
        title: "Erro ao mover produto para lixeira",
        description: errorMessage,
      });
    } finally {
      setActionLoading(null);
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
    setActionLoading(product.id);
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_active: !product.is_active })
        .eq("id", product.id)
        .select(); // Adicionar select para melhor performance

      if (error) throw error;

      toast({
        title: product.is_active ? "Produto ocultado" : "Produto exibido",
        description: `O produto foi ${product.is_active ? "ocultado do" : "exibido no"} catálogo público.`,
      });
      
      // Atualizar estado local com um pequeno delay para melhor UX
      setTimeout(() => {
        onProductsChange();
      }, 100);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMessage,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const openConfirmDialog = (type: 'toggle' | 'soft_delete' | 'hard_delete', product: Product) => {
    // Prevenir múltiplos cliques se já estiver processando este produto
    if (actionLoading === product.id) return;
    
    setConfirmDialog({ isOpen: true, type, product });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.product) return;

    // Fechar modal imediatamente para melhor UX
    const product = confirmDialog.product;
    const actionType = confirmDialog.type;
    setConfirmDialog({ isOpen: false, type: 'toggle', product: null });

    if (actionType === 'toggle') {
      await toggleActive(product);
    } else if (actionType === 'soft_delete') {
      await handleSoftDelete(product.id);
    } else if (actionType === 'hard_delete') {
      await handleHardDelete(product.id);
    }
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
                <Label>Imagem do Produto</Label>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData({...formData, image_url: url})}
                  bucketName="product-images"
                  folder="products"
                  showPreview={true}
                  showMetadata={false}
                  processingOptions={{
                    maxWidth: 1200,
                    maxHeight: 1200,
                    quality: 0.85,
                    generateThumbnail: true,
                    thumbnailSize: 300
                  }}
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

              {/* Campos Opcionais */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ingredientes">Ingredientes (opcional)</Label>
                  <Textarea
                    id="ingredientes"
                    value={formData.ingredientes}
                    onChange={(e) => setFormData({...formData, ingredientes: e.target.value})}
                    placeholder="Liste os ingredientes do produto..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="validade_armazenamento_dias">Validade para armazenamento (dias)</Label>
                  <Input
                    id="validade_armazenamento_dias"
                    type="number"
                    min="1"
                    value={formData.validade_armazenamento_dias}
                    onChange={(e) => setFormData({...formData, validade_armazenamento_dias: e.target.value})}
                    placeholder="Ex: 7, 15, 30..."
                  />
                </div>
                
                {/* Seção de Sabores Dinâmica */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Sabores disponíveis</Label>
                    <Badge variant="secondary" className="text-xs">
                      {flavors.length} {flavors.length === 1 ? 'sabor' : 'sabores'}
                    </Badge>
                  </div>
                  
                  {/* Adicionar novo sabor */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Nome do sabor (ex: chocolate, morango)"
                      value={newFlavorName}
                      onChange={(e) => setNewFlavorName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFlavor())}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={addFlavor}
                      disabled={!newFlavorName.trim()}
                      size="sm"
                      className="px-4 w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="sm:hidden">Adicionar Sabor</span>
                    </Button>
                  </div>
                  
                  {/* Preview compacto dos sabores */}
                       {flavors.length > 0 && (
                         <div className="space-y-4">
                           {/* Galeria de preview */}
                           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                             {flavors.map((flavor) => (
                               <div key={`preview-${flavor.id}`} className="relative group">
                                 <div className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/20 overflow-hidden bg-muted/30">
                                   {flavor.image ? (
                                     <img 
                                       src={flavor.image} 
                                       alt={flavor.name}
                                       className="w-full h-full object-cover"
                                     />
                                   ) : (
                                     <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                       <div className="text-center">
                                         <Plus className="h-4 w-4 sm:h-6 sm:w-6 mx-auto mb-1" />
                                         <p className="text-xs hidden sm:block">Sem imagem</p>
                                       </div>
                                     </div>
                                   )}
                                 </div>
                                 <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-1 rounded-b-lg">
                                   <p className="text-xs font-medium truncate text-center">{flavor.name}</p>
                                 </div>
                               </div>
                             ))}
                           </div>
                       
                       {/* Lista detalhada para edição */}
                           <div className="space-y-3 max-h-80 overflow-y-auto">
                             {flavors.map((flavor) => (
                               <Card key={flavor.id} className="p-3">
                                 <div className="space-y-3">
                                   <div className="flex items-center justify-between">
                                     <div className="flex items-center gap-2 flex-1 min-w-0">
                                       <Badge variant="outline" className="font-medium text-xs">
                                         {flavor.name}
                                       </Badge>
                                       {flavor.image && (
                                         <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                                           📷 Com imagem
                                         </Badge>
                                       )}
                                     </div>
                                     <Button
                                       type="button"
                                       variant="ghost"
                                       size="sm"
                                       onClick={() => removeFlavor(flavor.id)}
                                       className="h-8 w-8 p-0 text-destructive hover:text-destructive flex-shrink-0 mobile-touch-target"
                                     >
                                       <Trash2 className="h-4 w-4" />
                                     </Button>
                                   </div>
                               
                               {/* Upload de imagem para o sabor */}
                                   <div className="space-y-2">
                                     <Label className="text-sm text-muted-foreground">
                                       Imagem do sabor {flavor.name}
                                     </Label>
                                     <div className="w-full">
                                       <ImageUpload
                                         value={flavor.image}
                                         onChange={(url) => updateFlavorImage(flavor.id, url)}
                                         bucketName="product-flavor-images"
                                         folder={`flavors`}
                                         showPreview={true}
                                         showMetadata={false}
                                         processingOptions={{
                                           maxWidth: 800,
                                           maxHeight: 800,
                                           quality: 0.85,
                                           generateThumbnail: true,
                                           thumbnailSize: 200
                                         }}
                                       />
                                     </div>
                                   </div>
                             </div>
                           </Card>
                         ))}
                       </div>
                     </div>
                   )}
                  
                  {flavors.length === 0 && (
                    <div className="text-center py-6 sm:py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      <p className="text-sm">Nenhum sabor adicionado</p>
                      <p className="text-xs mt-1 px-4">Use o campo acima para adicionar sabores</p>
                    </div>
                  )}
                </div>
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
                            disabled={actionLoading === product.id}
                          >
                            {actionLoading ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                            ) : product.is_active ? (
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
                            disabled={actionLoading === product.id}
                           >
                             {actionLoading === product.id ? (
                               <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                             ) : (
                               <Trash2 className="h-4 w-4" />
                             )}
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
                          disabled={actionLoading === product.id}
                         >
                           {actionLoading === product.id ? (
                             <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                           ) : product.is_active ? (
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
                          disabled={actionLoading === product.id}
                         >
                           {actionLoading === product.id ? (
                             <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                           ) : (
                             <Trash2 className="h-3 w-3" />
                           )}
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
                          disabled={actionLoading === product.id}
                      >
                        {actionLoading === product.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                        ) : product.is_active ? (
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
                          disabled={actionLoading === product.id}
                         >
                           {actionLoading === product.id ? (
                             <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                           ) : (
                             <Trash2 className="h-4 w-4" />
                           )}
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
                  Mover para Lixeira
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
                "O produto será movido para a lixeira e removido do painel admin. Os dados podem ser recuperados via banco de dados se necessário! 🗑️"
              ) : confirmDialog.type === 'hard_delete' ? (
                "Esta ação não pode ser desfeita. O produto será permanentemente removido do catálogo e todos os dados relacionados serão excluídos."
              ) : confirmDialog.product?.is_active ? (
                "O produto será ocultado do catálogo público, mas continuará visível no painel admin."
              ) : (
                "O produto será exibido no catálogo público e ficará visível para os clientes."
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
              disabled={actionLoading !== null}
             >
               {actionLoading !== null ? (
                 <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
               ) : null}
              {confirmDialog.type === 'soft_delete' ? (
                'Mover para Lixeira'
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