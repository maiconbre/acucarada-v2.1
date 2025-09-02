import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Instagram, Paperclip, User, Star } from 'lucide-react';

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  author_name?: string;
  instagram_handle?: string;
  image_url?: string;
  rating: number; // Adicionado
}

interface CommentSectionProps {
  productId: string;
}

export const CommentSection = ({ productId }: CommentSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5); // Inicializado com 5 estrelas
  const [hoverRating, setHoverRating] = useState(0); // Novo estado para o efeito de hover

  useEffect(() => {
    if (user?.user_metadata.username) {
      setAuthorName(user.user_metadata.username);
    }
  }, [user]);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        comment,
        created_at,
        author_name,
        instagram_handle,
        image_url,
        rating
      `)
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      toast({ variant: 'destructive', title: 'Erro ao carregar comentários.' });
    } else {
      setComments(data as Comment[]);
    }
    setLoading(false);
  }, [productId, toast]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmitComment = async () => {
    if (newComment.trim() === '') {
      toast({ title: 'Por favor, escreva um comentário.' });
      return;
    }
    if (!user && authorName.trim() === '') {
      toast({ title: 'Por favor, insira seu nome.' });
      return;
    }

    setLoading(true);
    let imageUrl = null;

    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('comment_images')
        .upload(fileName, selectedFile);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        toast({ variant: 'destructive', title: 'Erro ao enviar imagem.' });
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('comment_images')
        .getPublicUrl(uploadData.path);
      imageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from('comments').insert([
      {
        product_id: productId,
        comment: newComment,
        author_name: authorName,
        instagram_handle: instagramHandle,
        image_url: imageUrl,
        rating: selectedRating, // Adicionado
      },
    ]);

    if (error) {
      console.error('Error submitting comment:', error);
      toast({ variant: 'destructive', title: 'Erro ao enviar comentário.' });
    } else {
      setNewComment('');
      setInstagramHandle('');
      setSelectedFile(null);
      setSelectedRating(5); // Resetar para 5 estrelas
      if (!user) setAuthorName('');
      toast({ title: 'Comentário enviado!', description: 'Seu comentário está aguardando aprovação.' });
      fetchComments(); 
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold font-title">Comentários e Avaliações</h3>
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <Textarea
              placeholder="Deixe seu comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={loading}
              className="bg-white"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!user && (
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Seu nome"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    disabled={loading}
                    className="pl-10 bg-white"
                    />
                </div>
              )}
              <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                  placeholder="@seu_instagram"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  disabled={loading}
                  className="pl-10 bg-white"
                  />
              </div>
              {/* Seletor de Avaliação (Estrelas Clicáveis) */}
              <div className="relative md:col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Sua avaliação (estrelas):</label>
                  <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, index) => {
                          const ratingValue = index + 1;
                          return (
                              <Star
                                  key={ratingValue}
                                  className={`cursor-pointer h-6 w-6 transition-colors duration-200 ${
                                      ratingValue <= (hoverRating || selectedRating)
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                  }`}
                                  onClick={() => setSelectedRating(ratingValue)}
                                  onMouseEnter={() => setHoverRating(ratingValue)}
                                  onMouseLeave={() => setHoverRating(0)}
                              />
                          );
                      })}
                      {selectedRating > 0 && (
                          <span className="ml-2 text-sm font-semibold text-yellow-600">
                              {selectedRating} Estrela{selectedRating > 1 ? 's' : ''}
                          </span>
                      )}
                  </div>
              </div>
              <div className="relative md:col-span-2">
                  <label htmlFor="file-upload" className="flex items-center justify-center w-full h-10 px-4 bg-white border rounded-md cursor-pointer hover:bg-gray-50">
                      <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                          {selectedFile ? selectedFile.name : 'Enviar foto (opcional)'}
                      </span>
                  </label>
                  <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} disabled={loading} accept="image/*" />
              </div>
            </div>
            <Button onClick={handleSubmitComment} disabled={loading} className="w-full">
              {loading ? 'Enviando...' : 'Enviar Comentário'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="p-4 flex gap-4">
              <Avatar>
                <AvatarFallback>{comment.author_name?.[0].toUpperCase() || 'A'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-semibold">{comment.author_name || 'Anônimo'}</p>
                        {comment.instagram_handle && (
                            <a href={`https://instagram.com/${comment.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="text-xs text-pink-500 hover:underline">
                                @{comment.instagram_handle}
                            </a>
                        )}
                        {/* Exibir Estrelas */}
                        <div className="flex mt-1">
                            {[...Array(comment.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                            {[...Array(5 - comment.rating)].map((_, i) => (
                                <Star key={i + comment.rating} className="h-4 w-4 text-gray-300" />
                            ))}
                        </div>
                    </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <p className="text-sm mt-2">{comment.comment}</p>
                {comment.image_url && (
                  <img src={comment.image_url} alt="Comentário" className="mt-2 rounded-lg w-full max-w-xs" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {comments.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
        )}
      </div>
    </div>
  );
};
