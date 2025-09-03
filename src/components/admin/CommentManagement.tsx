import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, ThumbsUp, AlertTriangle } from 'lucide-react';
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
import { Label } from '@/components/ui/label';

interface Comment {
  id: string;
  comment: string;
  author_name?: string;
  instagram_handle?: string;
  image_url?: string;
  is_approved: boolean;
  created_at: string;
  product_id: string;
  product?: {
    id: string;
    name: string;
    image_url?: string;
  };
}

const CommentManagement = () => {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  const fetchComments = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('comments')
      .select(`
        *,
        product:products(
          id,
          name,
          image_url
        )
      `)
      .order('created_at', { ascending: false });

    if (filter === 'pending') {
      query = query.eq('is_approved', false);
    } else if (filter === 'approved') {
      query = query.eq('is_approved', true);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar comentários',
        description: error.message,
      });
    } else {
      setComments(data as Comment[]);
    }
    setLoading(false);
  }, [toast, filter]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleApproval = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('comments')
      .update({ is_approved: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar comentário',
        description: error.message,
      });
    } else {
      toast({
        title: 'Sucesso!',
        description: `Comentário ${!currentStatus ? 'aprovado' : 'reprovado'}.`,
      });
      fetchComments();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('comments').delete().eq('id', id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir comentário',
        description: error.message,
      });
    } else {
      toast({
        title: 'Sucesso!',
        description: 'Comentário excluído.',
      });
      fetchComments();
    }
  };

  const CommentCard = ({ comment }: { comment: Comment }) => (
    <Card>
      <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
        {/* Informações do Produto */}
        {comment.product && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4 sm:mb-0 sm:w-64 flex-shrink-0">
            {comment.product.image_url && (
              <img 
                src={comment.product.image_url} 
                alt={comment.product.name} 
                className="w-12 h-12 rounded-lg object-cover"
                loading="lazy" 
                decoding="async" 
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {comment.product.name}
              </p>
              <p className="text-xs text-gray-500">Produto</p>
            </div>
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              {comment.instagram_handle && (
                <a href={`https://instagram.com/${comment.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-pink-600 hover:text-pink-700 hover:underline">
                  @{comment.instagram_handle}
                </a>
              )}
              {comment.author_name && !comment.instagram_handle && (
                <span className="text-sm font-medium text-gray-700">{comment.author_name}</span>
              )}
            </div>
            <Badge variant={comment.is_approved ? 'default' : 'destructive'}>
              {comment.is_approved ? 'Aprovado' : 'Pendente'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {new Date(comment.created_at).toLocaleString('pt-BR')}
          </p>
          <p className="text-sm mb-3">{comment.comment}</p>
          {comment.image_url && (
            <a href={comment.image_url} target="_blank" rel="noopener noreferrer">
              <img src={comment.image_url} alt="Imagem do Comentário" className="rounded-lg max-w-xs w-full h-auto" width="320" height="240" loading="lazy" decoding="async" />
            </a>
          )}
        </div>
        <div className="flex flex-row sm:flex-col items-center justify-end sm:justify-center gap-2">
          <div className="flex items-center space-x-2">
            <Switch
              id={`approve-${comment.id}`}
              checked={comment.is_approved}
              onCheckedChange={() => handleApproval(comment.id, comment.is_approved)}
              aria-label="Aprovar comentário"
            />
            <Label htmlFor={`approve-${comment.id}`} className="text-sm">{comment.is_approved ? 'Aprovado' : 'Aprovar'}</Label>
          </div>
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o comentário.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(comment.id)}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ThumbsUp className="h-5 w-5" />
          Gerenciamento de Comentários
        </CardTitle>
        <CardDescription>
          Aprove, reprove ou exclua os comentários dos seus produtos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Button variant={filter === 'pending' ? 'secondary' : 'ghost'} onClick={() => setFilter('pending')}>Pendentes</Button>
                <Button variant={filter === 'approved' ? 'secondary' : 'ghost'} onClick={() => setFilter('approved')}>Aprovados</Button>
                <Button variant={filter === 'all' ? 'secondary' : 'ghost'} onClick={() => setFilter('all')}>Todos</Button>
            </div>
            <Button variant="ghost" size="icon" onClick={fetchComments} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
        </div>

        {loading ? (
          <div className="text-center p-8">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
            <p className="text-muted-foreground mt-2">Carregando comentários...</p>
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map(comment => <CommentCard key={comment.id} comment={comment} />)}
          </div>
        ) : (
          <div className="text-center p-8 border-2 border-dashed rounded-lg">
            <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">Nenhum comentário encontrado para este filtro.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommentManagement;
