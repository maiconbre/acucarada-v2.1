import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  RefreshCw, 
  Trash2, 
  Star,
  MessageSquare,
  Image as ImageIcon
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Database } from "@/integrations/supabase/types";
import { convertToWebP } from "@/lib/image-utils";
import { useAuth } from "@/hooks/useAuth";

type Feedback = Database['public']['Tables']['feedbacks']['Row'];
type FeedbackInsert = Database['public']['Tables']['feedbacks']['Insert'];

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user, session } = useAuth();
  
  const [newFeedback, setNewFeedback] = useState<{
    customer_name: string;
    feedback_text: string;
    image_url: string;
    is_active: boolean;
  }>({
    customer_name: '',
    feedback_text: '',
    image_url: '',
    is_active: true
  });

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error('Erro ao carregar feedbacks:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao carregar feedbacks'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função de conversão WebP otimizada usando a biblioteca centralizada
  const handleWebPConversion = async (file: File): Promise<File> => {
    try {
      const processed = await convertToWebP(file, {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.85,
        generateThumbnail: false
      });
      return processed.file;
    } catch (error) {
      console.error('Erro na conversão WebP:', error);
      throw new Error('Falha na conversão da imagem para WebP');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Por favor, selecione apenas arquivos de imagem'
      });
      return;
    }
    
    setUploading(true);
    try {
      // Converter para WebP usando a função centralizada
      const webpFile = await handleWebPConversion(file);
      
      // Upload para Supabase Storage
      const fileName = `feedback-${Date.now()}.webp`;
      const { data, error } = await supabase.storage
        .from('feedback-images')
        .upload(fileName, webpFile, {
          contentType: 'image/webp',
          cacheControl: '3600'
        });
      
      if (error) throw error;
      
      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('feedback-images')
        .getPublicUrl(data.path);
      
      setNewFeedback(prev => ({ ...prev, image_url: publicUrl }));
      
      toast({
        title: 'Sucesso',
        description: 'Imagem carregada e convertida para WebP com sucesso'
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao fazer upload da imagem'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveFeedback = async () => {
    // Verificar autenticação
    if (!user || !session) {
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: 'Você precisa estar logado para adicionar feedbacks'
      });
      return;
    }

    if (!newFeedback.customer_name.trim() || !newFeedback.feedback_text.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Nome do cliente e texto do feedback são obrigatórios'
      });
      return;
    }
    
    setLoading(true);
    try {
      // Verificar sessão atual
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      // Determinar próxima ordem de exibição
      const maxOrder = Math.max(...feedbacks.map(f => f.display_order || 0), 0);
      
      const feedbackData: FeedbackInsert = {
        customer_name: newFeedback.customer_name.trim(),
        feedback_text: newFeedback.feedback_text.trim(),
        image_url: newFeedback.image_url || null,
        is_active: newFeedback.is_active,
        display_order: maxOrder + 1
      };
      
      console.log('Tentando inserir feedback:', feedbackData);
      console.log('Usuário atual:', currentSession.user.email);
      console.log('Role atual:', currentSession.user.role);
      
      const { data, error } = await supabase
        .from('feedbacks')
        .insert([feedbackData])
        .select();
      
      if (error) {
        console.error('Erro detalhado do Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('Feedback inserido com sucesso:', data);
      
      // Resetar formulário
      setNewFeedback({
        customer_name: '',
        feedback_text: '',
        image_url: '',
        is_active: true
      });
      
      // Recarregar feedbacks
      await loadFeedbacks();
      
      toast({
        title: 'Sucesso',
        description: 'Feedback adicionado com sucesso'
      });
    } catch (error: unknown) {
      console.error('Erro ao salvar feedback:', error);
      
      let errorMessage = 'Erro ao salvar feedback';
      
      if (error && typeof error === 'object' && 'message' in error) {
        const errorObj = error as { message?: string; code?: string };
        if (errorObj.message?.includes('403') || errorObj.code === '42501') {
          errorMessage = 'Erro de permissão: Execute o script fix_feedback_policies.sql no Supabase';
        } else if (errorObj.message?.includes('Sessão expirada')) {
          errorMessage = errorObj.message;
        } else if (errorObj.message) {
          errorMessage = errorObj.message;
        }
      }
      
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };



  const deleteFeedback = async (id: string) => {
    try {
      const { error } = await supabase
        .from('feedbacks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await loadFeedbacks();
      
      toast({
        title: 'Sucesso',
        description: 'Feedback excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir feedback:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao excluir feedback'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulário para adicionar novo feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Adicionar Novo Feedback
          </CardTitle>
          <CardDescription>
            Adicione feedbacks de clientes com imagens de prints reais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Nome do Cliente *</Label>
              <Input
                id="customer_name"
                value={newFeedback.customer_name}
                onChange={(e) => setNewFeedback(prev => ({ ...prev, customer_name: e.target.value }))}
                placeholder="Ex: Maria Silva"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback_image">Imagem do Feedback</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="feedback_image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading && <RefreshCw className="h-4 w-4 animate-spin" />}
              </div>
              <p className="text-sm text-muted-foreground">
                Imagem será automaticamente convertida para WebP
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="feedback_text">Texto do Feedback *</Label>
            <Textarea
              id="feedback_text"
              value={newFeedback.feedback_text}
              onChange={(e) => setNewFeedback(prev => ({ ...prev, feedback_text: e.target.value }))}
              placeholder="Digite o feedback do cliente..."
              rows={3}
            />
          </div>
          
          {newFeedback.image_url && (
            <div className="space-y-2">
              <Label>Preview da Imagem</Label>
              <div className="border rounded-lg p-2">
                <img 
                  src={newFeedback.image_url} 
                  alt="Preview" 
                  className="max-w-xs max-h-32 object-contain rounded"
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={newFeedback.is_active}
              onCheckedChange={(checked) => setNewFeedback(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Ativo (visível no site)</Label>
          </div>
          
          <Button 
            onClick={handleSaveFeedback} 
            disabled={loading || uploading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Feedback
          </Button>
        </CardContent>
      </Card>

      {/* Lista de feedbacks existentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedbacks Cadastrados ({feedbacks.length})
          </CardTitle>
          <CardDescription>
            Gerencie os feedbacks exibidos no site
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Carregando feedbacks...</span>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum feedback cadastrado ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{feedback.customer_name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          feedback.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {feedback.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {feedback.feedback_text}
                      </p>
                      {feedback.image_url && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                          <span>Imagem anexada</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Feedback</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este feedback de "{feedback.customer_name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteFeedback(feedback.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  {feedback.image_url && (
                    <div className="border-t pt-3">
                      <img 
                        src={feedback.image_url} 
                        alt={`Feedback de ${feedback.customer_name}`}
                        className="max-w-xs max-h-40 object-contain rounded border"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackManagement;