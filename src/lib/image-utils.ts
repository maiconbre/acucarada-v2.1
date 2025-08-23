/**
 * Utilitários para processamento de imagens
 * Inclui conversão para WebP, compressão e redimensionamento
 */

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  generateThumbnail?: boolean;
  thumbnailSize?: number;
}

export interface ProcessedImage {
  file: File;
  dataUrl: string;
  thumbnail?: {
    file: File;
    dataUrl: string;
  };
}

/**
 * Converte um arquivo de imagem para WebP com compressão
 */
export const convertToWebP = async (
  file: File,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.85,
    generateThumbnail = true,
    thumbnailSize = 300
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Não foi possível criar contexto do canvas'));
      return;
    }

    img.onload = async () => {
      try {
        // Calcular dimensões mantendo proporção
        const { width, height } = calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        );

        // Redimensionar imagem principal
        canvas.width = width;
        canvas.height = height;
        
        // Aplicar filtro de suavização para melhor qualidade
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, width, height);

        // Converter para WebP
        const webpDataUrl = canvas.toDataURL('image/webp', quality);
        const webpBlob = await dataURLToBlob(webpDataUrl);
        const webpFile = new File([webpBlob], getWebPFileName(file.name), {
          type: 'image/webp',
          lastModified: Date.now()
        });

        const result: ProcessedImage = {
          file: webpFile,
          dataUrl: webpDataUrl
        };

        // Gerar thumbnail se solicitado
        if (generateThumbnail) {
          const thumbnailDimensions = calculateDimensions(
            width,
            height,
            thumbnailSize,
            thumbnailSize
          );

          canvas.width = thumbnailDimensions.width;
          canvas.height = thumbnailDimensions.height;
          
          ctx.drawImage(img, 0, 0, thumbnailDimensions.width, thumbnailDimensions.height);
          
          const thumbnailDataUrl = canvas.toDataURL('image/webp', 0.8);
          const thumbnailBlob = await dataURLToBlob(thumbnailDataUrl);
          const thumbnailFile = new File([thumbnailBlob], getThumbnailFileName(file.name), {
            type: 'image/webp',
            lastModified: Date.now()
          });

          result.thumbnail = {
            file: thumbnailFile,
            dataUrl: thumbnailDataUrl
          };
        }

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Erro ao carregar a imagem'));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calcula dimensões mantendo proporção
 */
const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  let { width, height } = { width: originalWidth, height: originalHeight };

  // Redimensionar se exceder limites
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }

  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }

  return { width: Math.round(width), height: Math.round(height) };
};

/**
 * Converte DataURL para Blob
 */
const dataURLToBlob = async (dataURL: string): Promise<Blob> => {
  const response = await fetch(dataURL);
  return response.blob();
};

/**
 * Gera nome de arquivo WebP
 */
const getWebPFileName = (originalName: string): string => {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  return `${nameWithoutExt}.webp`;
};

/**
 * Gera nome de arquivo para thumbnail
 */
const getThumbnailFileName = (originalName: string): string => {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  return `${nameWithoutExt}_thumb.webp`;
};

/**
 * Valida se o arquivo é uma imagem suportada
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de arquivo não suportado. Use JPEG, PNG, WebP ou GIF.'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Arquivo muito grande. Tamanho máximo: 10MB.'
    };
  }

  return { valid: true };
};

/**
 * Comprime uma imagem mantendo qualidade visual
 */
export const compressImage = async (
  file: File,
  targetSizeKB: number = 500
): Promise<File> => {
  let quality = 0.9;
  let compressedFile = file;

  // Tentar diferentes níveis de qualidade até atingir o tamanho desejado
  while (compressedFile.size > targetSizeKB * 1024 && quality > 0.1) {
    const processed = await convertToWebP(file, { quality });
    compressedFile = processed.file;
    quality -= 0.1;
  }

  return compressedFile;
};

/**
 * Gera um nome único para o arquivo
 */
export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${sanitizedName}_${timestamp}_${random}.webp`;
};

/**
 * Redimensiona imagem para dimensões específicas
 */
export const resizeImage = async (
  file: File,
  width: number,
  height: number,
  quality: number = 0.9
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Não foi possível criar contexto do canvas'));
      return;
    }

    img.onload = async () => {
      canvas.width = width;
      canvas.height = height;
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], getWebPFileName(file.name), {
              type: 'image/webp',
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Erro ao redimensionar imagem'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Erro ao carregar a imagem'));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Extrai metadados da imagem
 */
export const getImageMetadata = (file: File): Promise<{
  width: number;
  height: number;
  size: number;
  type: string;
  name: string;
}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        size: file.size,
        type: file.type,
        name: file.name
      });
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = () => {
      reject(new Error('Erro ao carregar metadados da imagem'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};