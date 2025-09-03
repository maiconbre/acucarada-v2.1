/**
 * Middleware avançado para upload e conversão automática de imagens
 * Garante conversão WebP, backup de originais e otimização automática
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  convertToWebP, 
  generateUniqueFileName, 
  validateImageFile,
  getImageMetadata,
  type ProcessedImage,
  type ImageProcessingOptions 
} from './image-utils';
import { createImageBackup, BackupInfo } from './backup-manager';

export interface UploadConfig {
  bucketName: string;
  folder: string;
  createBackup?: boolean;
  processingOptions?: ImageProcessingOptions;
  generateThumbnail?: boolean;
  thumbnailFolder?: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  thumbnailUrl?: string;
  backupUrl?: string;
  originalSize: number;
  webpSize: number;
  compressionRatio: number;
  metadata: {
    width: number;
    height: number;
    format: string;
    fileName: string;
  };
  backup?: BackupInfo;
  error?: string;
}

export interface UploadProgress {
  stage: 'validating' | 'processing' | 'uploading' | 'backup' | 'thumbnail' | 'complete';
  progress: number;
  message: string;
}

class ImageUploadMiddleware {
  private config: UploadConfig;
  private onProgress?: (progress: UploadProgress) => void;

  constructor(config: UploadConfig, onProgress?: (progress: UploadProgress) => void) {
    this.config = {
      createBackup: true,
      generateThumbnail: true,
      thumbnailFolder: 'thumbs',
      processingOptions: {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85,
        format: 'webp'
      },
      ...config
    };
    this.onProgress = onProgress;
  }

  private updateProgress(stage: UploadProgress['stage'], progress: number, message: string): void {
    this.onProgress?.({
      stage,
      progress,
      message
    });
  }

  private async validateFile(file: File): Promise<void> {
    this.updateProgress('validating', 5, 'Validando arquivo...');
    
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Arquivo inválido');
    }

    // Verificar se já é WebP
    if (file.type === 'image/webp') {
      console.log('⚠️ Arquivo já está em formato WebP');
    }
  }

  private async processImage(file: File): Promise<{
    processed: ProcessedImage;
    metadata: {
      width: number;
      height: number;
      size: number;
      type: string;
      name: string;
    };
    originalSize: number;
  }> {
    this.updateProgress('processing', 20, 'Processando imagem...');
    
    // Obter metadados da imagem original
    const metadata = await getImageMetadata(file);
    const originalSize = file.size;

    // Processar imagem com configurações otimizadas
    const processed = await convertToWebP(file, {
      ...this.config.processingOptions,
      generateThumbnail: this.config.generateThumbnail
    });

    this.updateProgress('processing', 40, 'Imagem processada com sucesso');
    
    return {
      processed,
      metadata,
      originalSize
    };
  }

  private async uploadMainImage(processed: ProcessedImage): Promise<string> {
    this.updateProgress('uploading', 50, 'Enviando imagem principal...');
    
    const fileName = generateUniqueFileName(processed.file.name);
    const filePath = `${this.config.folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(this.config.bucketName)
      .upload(filePath, processed.file, {
        cacheControl: '31536000', // 1 ano
        upsert: false,
        contentType: 'image/webp'
      });

    if (error) {
      throw new Error(`Erro no upload principal: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(this.config.bucketName)
      .getPublicUrl(filePath);

    this.updateProgress('uploading', 60, 'Imagem principal enviada');
    return urlData.publicUrl;
  }

  private async uploadThumbnail(processed: ProcessedImage): Promise<string | undefined> {
    if (!this.config.generateThumbnail || !processed.thumbnail) {
      return undefined;
    }

    this.updateProgress('thumbnail', 70, 'Enviando thumbnail...');
    
    const fileName = generateUniqueFileName(processed.thumbnail.file.name);
    const thumbPath = `${this.config.folder}/${this.config.thumbnailFolder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(this.config.bucketName)
      .upload(thumbPath, processed.thumbnail.file, {
        cacheControl: '31536000',
        upsert: false,
        contentType: 'image/webp'
      });

    if (error) {
      console.warn(`Erro no upload do thumbnail: ${error.message}`);
      return undefined;
    }

    const { data: urlData } = supabase.storage
      .from(this.config.bucketName)
      .getPublicUrl(thumbPath);

    this.updateProgress('thumbnail', 80, 'Thumbnail enviado');
    return urlData.publicUrl;
  }

  private async createBackup(originalFile: File, webpPath: string, webpSize: number): Promise<BackupInfo | undefined> {
    if (!this.config.createBackup) {
      return undefined;
    }

    this.updateProgress('backup', 85, 'Criando backup da imagem original...');
    
    try {
      const originalBuffer = Buffer.from(await originalFile.arrayBuffer());
      
      const backupInfo = await createImageBackup(
        this.config.bucketName,
        webpPath,
        originalBuffer,
        {
          webpPath,
          webpSize
        }
      );

      this.updateProgress('backup', 90, 'Backup criado');
      return backupInfo;
    } catch (error) {
      console.warn(`Erro ao criar backup: ${error}`);
      return undefined;
    }
  }

  public async uploadImage(file: File): Promise<UploadResult> {
    try {
      // Validar arquivo
      await this.validateFile(file);

      // Processar imagem
      const { processed, metadata, originalSize } = await this.processImage(file);
      
      // Upload da imagem principal
      const url = await this.uploadMainImage(processed);
      
      // Upload do thumbnail (opcional)
      const thumbnailUrl = await this.uploadThumbnail(processed);
      
      // Criar backup da original (opcional)
      const backup = await this.createBackup(file, url, processed.file.size);
      
      this.updateProgress('complete', 100, 'Upload concluído com sucesso!');
      
      const webpSize = processed.file.size;
      const compressionRatio = ((originalSize - webpSize) / originalSize) * 100;

      return {
        success: true,
        url,
        thumbnailUrl,
        backupUrl: backup?.backupPath,
        originalSize,
        webpSize,
        compressionRatio,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: 'webp',
          fileName: processed.file.name
        },
        backup
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      return {
        success: false,
        error: errorMessage,
        originalSize: file.size,
        webpSize: 0,
        compressionRatio: 0,
        metadata: {
          width: 0,
          height: 0,
          format: file.type,
          fileName: file.name
        }
      };
    }
  }

  public async uploadMultipleImages(files: File[]): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`📸 Processando imagem ${i + 1}/${files.length}: ${file.name}`);
      
      const result = await this.uploadImage(file);
      results.push(result);
      
      // Pequena pausa entre uploads para evitar sobrecarga
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return results;
  }
}

// Funções de conveniência para diferentes tipos de upload
export const createProductImageUploader = (onProgress?: (progress: UploadProgress) => void) => {
  return new ImageUploadMiddleware({
    bucketName: 'product-images',
    folder: 'products',
    createBackup: true,
    generateThumbnail: true,
    processingOptions: {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.85
    }
  }, onProgress);
};

export const createFlavorImageUploader = (onProgress?: (progress: UploadProgress) => void) => {
  return new ImageUploadMiddleware({
    bucketName: 'product-flavor-images',
    folder: 'flavors',
    createBackup: true,
    generateThumbnail: true,
    processingOptions: {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.85
    }
  }, onProgress);
};

export const createCategoryImageUploader = (onProgress?: (progress: UploadProgress) => void) => {
  return new ImageUploadMiddleware({
    bucketName: 'product-images',
    folder: 'categories',
    createBackup: true,
    generateThumbnail: true,
    processingOptions: {
      maxWidth: 600,
      maxHeight: 600,
      quality: 0.9
    }
  }, onProgress);
};

export { ImageUploadMiddleware };
export default ImageUploadMiddleware;