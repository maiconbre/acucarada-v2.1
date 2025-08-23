/**
 * Componente de Upload de Imagens Otimizado
 * Suporta conversão WebP, compressão, thumbnails e preview
 */

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  convertToWebP, 
  validateImageFile, 
  getImageMetadata,
  generateUniqueFileName,
  type ProcessedImage,
  type ImageProcessingOptions
} from '@/lib/image-utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onFileChange?: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
  maxFiles?: number;
  processingOptions?: ImageProcessingOptions;
  bucketName?: string;
  folder?: string;
  showPreview?: boolean;
  showMetadata?: boolean;
  allowMultiple?: boolean;
}

interface UploadState {
  uploading: boolean;
  processing: boolean;
  progress: number;
  error: string | null;
  processedImage: ProcessedImage | null;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onFileChange,
  disabled = false,
  className,
  maxFiles = 1,
  processingOptions = {},
  bucketName = 'product-images',
  folder = 'products',
  showPreview = true,
  showMetadata = false,
  allowMultiple = false
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    processing: false,
    progress: 0,
    error: null,
    processedImage: null
  });
  
  const [dragActive, setDragActive] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetState = useCallback(() => {
    setUploadState({
      uploading: false,
      processing: false,
      progress: 0,
      error: null,
      processedImage: null
    });
    setMetadata(null);
  }, []);

  const processImage = useCallback(async (file: File): Promise<ProcessedImage> => {
    setUploadState(prev => ({ ...prev, processing: true, progress: 10 }));
    
    try {
      // Validar arquivo
      const validation = validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      setUploadState(prev => ({ ...prev, progress: 30 }));

      // Obter metadados
      if (showMetadata) {
        const meta = await getImageMetadata(file);
        setMetadata(meta);
      }

      setUploadState(prev => ({ ...prev, progress: 50 }));

      // Processar imagem
      const processed = await convertToWebP(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85,
        generateThumbnail: true,
        thumbnailSize: 300,
        ...processingOptions
      });

      setUploadState(prev => ({ ...prev, progress: 80, processedImage: processed }));
      
      return processed;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar imagem';
      setUploadState(prev => ({ ...prev, error: errorMessage, processing: false }));
      throw error;
    }
  }, [processingOptions, showMetadata]);

  const uploadToSupabase = useCallback(async (processedImage: ProcessedImage): Promise<string> => {
    setUploadState(prev => ({ ...prev, uploading: true, progress: 85 }));
    
    try {
      const fileName = generateUniqueFileName(processedImage.file.name);
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Upload da imagem principal
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, processedImage.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Upload do thumbnail se existir
      if (processedImage.thumbnail) {
        const thumbPath = folder ? `${folder}/thumbs/${fileName}` : `thumbs/${fileName}`;
        await supabase.storage
          .from(bucketName)
          .upload(thumbPath, processedImage.thumbnail.file, {
            cacheControl: '3600',
            upsert: false
          });
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      setUploadState(prev => ({ ...prev, progress: 100, uploading: false }));
      
      return urlData.publicUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer upload';
      setUploadState(prev => ({ ...prev, error: errorMessage, uploading: false }));
      throw error;
    }
  }, [bucketName, folder]);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    resetState();
    
    try {
      const processed = await processImage(file);
      const url = await uploadToSupabase(processed);
      
      onChange(url);
      onFileChange?.(processed.file);
      
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  }, [processImage, uploadToSupabase, onChange, onFileChange, toast, resetState]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const handleRemove = useCallback(() => {
    onChange('');
    onFileChange?.(null);
    resetState();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange, onFileChange, resetState]);

  const isProcessing = uploadState.processing || uploadState.uploading;
  const hasError = !!uploadState.error;
  const hasImage = !!value || !!uploadState.processedImage;

  return (
    <div className={cn("space-y-3 sm:space-y-4", className)}>
      {/* Área de Upload */}
      {!hasImage && (
        <Card className={cn(
          "border-2 border-dashed transition-all duration-200",
          dragActive && "border-primary bg-primary/5",
          hasError && "border-destructive",
          disabled && "opacity-50 cursor-not-allowed"
        )}>
          <CardContent className="p-4 sm:p-6">
            <div
              className={cn(
                "flex flex-col items-center justify-center space-y-2 sm:space-y-4 text-center",
                "min-h-[120px] sm:min-h-[160px] cursor-pointer transition-colors",
                dragActive && "text-primary"
              )}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !disabled && fileInputRef.current?.click()}
          >
            {isProcessing ? (
              <div className="space-y-4 w-full max-w-xs">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {uploadState.processing ? 'Processando imagem...' : 'Enviando...'}
                  </p>
                  <Progress value={uploadState.progress} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    {uploadState.progress}% concluído
                  </p>
                </div>
              </div>
            ) : hasError ? (
              <div className="space-y-2">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                <p className="text-sm font-medium text-destructive">
                  {uploadState.error}
                </p>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    resetState();
                  }}
                >
                  Tentar novamente
                </Button>
              </div>
            ) : !hasImage ? (
              <>
                <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    !disabled && fileInputRef.current?.click();
                  }}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Selecionar Imagem
                </Button>
              </>
            ) : null
            }
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={allowMultiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {/* Preview da imagem */}
      {showPreview && hasImage && (
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Imagem Selecionada</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  className="text-xs sm:text-sm"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Remover
                </Button>
              </div>
              
              <div className="w-full">
                <img
                  src={value || uploadState.processedImage?.dataUrl}
                  alt="Preview"
                  className="w-full h-32 sm:h-48 object-cover rounded-lg border"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadados */}
      {showMetadata && metadata && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3">Informações da Imagem</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Dimensões:</span>
                <p>{metadata.width} × {metadata.height}px</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tamanho:</span>
                <p>{(metadata.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tipo:</span>
                <p>{metadata.type}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Nome:</span>
                <p className="truncate">{metadata.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageUpload;