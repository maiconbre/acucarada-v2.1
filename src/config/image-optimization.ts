/**
 * Configurações centralizadas para otimização de imagens WebP
 * Define padrões, limites e configurações para todo o sistema
 */

export interface ImageOptimizationConfig {
  // Configurações gerais de WebP
  webp: {
    quality: number;
    effort: number; // 0-6, maior = melhor compressão mas mais lento
    lossless: boolean;
    nearLossless: number; // 0-100, apenas se lossless = true
  };
  
  // Configurações de redimensionamento
  resize: {
    maxWidth: number;
    maxHeight: number;
    maintainAspectRatio: boolean;
    upscaleSmaller: boolean;
  };
  
  // Configurações de thumbnail
  thumbnail: {
    enabled: boolean;
    size: number;
    quality: number;
    suffix: string;
  };
  
  // Configurações de backup
  backup: {
    enabled: boolean;
    retentionDays: number;
    compressBackups: boolean;
  };
  
  // Configurações de cache
  cache: {
    webpMaxAge: number; // em segundos
    thumbnailMaxAge: number;
    backupMaxAge: number;
  };
  
  // Limites de arquivo
  limits: {
    maxFileSize: number; // em bytes
    minWidth: number;
    minHeight: number;
    allowedFormats: string[];
  };
}

// Configuração padrão para produtos
export const PRODUCT_IMAGE_CONFIG: ImageOptimizationConfig = {
  webp: {
    quality: 85,
    effort: 4,
    lossless: false,
    nearLossless: 90
  },
  resize: {
    maxWidth: 1920,
    maxHeight: 1080,
    maintainAspectRatio: true,
    upscaleSmaller: false
  },
  thumbnail: {
    enabled: true,
    size: 300,
    quality: 80,
    suffix: 'thumb'
  },
  backup: {
    enabled: true,
    retentionDays: 90,
    compressBackups: false
  },
  cache: {
    webpMaxAge: 31536000, // 1 ano
    thumbnailMaxAge: 2592000, // 30 dias
    backupMaxAge: 86400 // 1 dia
  },
  limits: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    minWidth: 100,
    minHeight: 100,
    allowedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  }
};

// Configuração para sabores (menor qualidade para economizar espaço)
export const FLAVOR_IMAGE_CONFIG: ImageOptimizationConfig = {
  webp: {
    quality: 80,
    effort: 4,
    lossless: false,
    nearLossless: 85
  },
  resize: {
    maxWidth: 800,
    maxHeight: 800,
    maintainAspectRatio: true,
    upscaleSmaller: false
  },
  thumbnail: {
    enabled: true,
    size: 200,
    quality: 75,
    suffix: 'thumb'
  },
  backup: {
    enabled: true,
    retentionDays: 60,
    compressBackups: true
  },
  cache: {
    webpMaxAge: 31536000, // 1 ano
    thumbnailMaxAge: 2592000, // 30 dias
    backupMaxAge: 86400 // 1 dia
  },
  limits: {
    maxFileSize: 3 * 1024 * 1024, // 3MB
    minWidth: 50,
    minHeight: 50,
    allowedFormats: ['image/jpeg', 'image/png', 'image/webp']
  }
};

// Configuração para categorias (alta qualidade para banners)
export const CATEGORY_IMAGE_CONFIG: ImageOptimizationConfig = {
  webp: {
    quality: 90,
    effort: 5,
    lossless: false,
    nearLossless: 95
  },
  resize: {
    maxWidth: 2048,
    maxHeight: 1024,
    maintainAspectRatio: true,
    upscaleSmaller: false
  },
  thumbnail: {
    enabled: true,
    size: 400,
    quality: 85,
    suffix: 'thumb'
  },
  backup: {
    enabled: true,
    retentionDays: 180,
    compressBackups: false
  },
  cache: {
    webpMaxAge: 31536000, // 1 ano
    thumbnailMaxAge: 2592000, // 30 dias
    backupMaxAge: 86400 // 1 dia
  },
  limits: {
    maxFileSize: 8 * 1024 * 1024, // 8MB
    minWidth: 200,
    minHeight: 100,
    allowedFormats: ['image/jpeg', 'image/png', 'image/webp']
  }
};

// Configurações de bucket
export interface BucketConfiguration {
  name: string;
  folder: string;
  config: ImageOptimizationConfig;
  description: string;
}

export const BUCKET_CONFIGURATIONS: Record<string, BucketConfiguration> = {
  products: {
    name: 'product-images',
    folder: 'products',
    config: PRODUCT_IMAGE_CONFIG,
    description: 'Imagens principais de produtos'
  },
  flavors: {
    name: 'product-flavor-images',
    folder: 'flavors',
    config: FLAVOR_IMAGE_CONFIG,
    description: 'Imagens de sabores de produtos'
  },
  categories: {
    name: 'product-images',
    folder: 'categories',
    config: CATEGORY_IMAGE_CONFIG,
    description: 'Imagens de categorias e banners'
  }
};

// Configurações de monitoramento de qualidade
export interface QualityMonitoringConfig {
  enabled: boolean;
  sampleRate: number; // 0-1, porcentagem de imagens para analisar
  metrics: {
    ssim: boolean; // Structural Similarity Index
    psnr: boolean; // Peak Signal-to-Noise Ratio
    fileSize: boolean;
    loadTime: boolean;
  };
  thresholds: {
    minSSIM: number; // 0-1, mínimo aceitável
    minPSNR: number; // dB, mínimo aceitável
    maxCompressionRatio: number; // máxima compressão permitida
    maxLoadTime: number; // ms, tempo máximo de carregamento
  };
}

export const QUALITY_MONITORING_CONFIG: QualityMonitoringConfig = {
  enabled: true,
  sampleRate: 0.1, // 10% das imagens
  metrics: {
    ssim: true,
    psnr: true,
    fileSize: true,
    loadTime: true
  },
  thresholds: {
    minSSIM: 0.85,
    minPSNR: 30,
    maxCompressionRatio: 0.9, // máximo 90% de compressão
    maxLoadTime: 2000 // 2 segundos
  }
};

// Configurações de conversão em lote
export interface BatchConversionConfig {
  batchSize: number;
  concurrency: number;
  retryAttempts: number;
  retryDelay: number; // ms
  skipExisting: boolean;
  createBackups: boolean;
  updateDatabase: boolean;
  logProgress: boolean;
}

export const BATCH_CONVERSION_CONFIG: BatchConversionConfig = {
  batchSize: 50,
  concurrency: 3,
  retryAttempts: 3,
  retryDelay: 1000,
  skipExisting: true,
  createBackups: true,
  updateDatabase: true,
  logProgress: true
};

// Utilitários para configuração
export class ConfigurationManager {
  /**
   * Obtém configuração para um tipo específico de imagem
   */
  static getConfigForType(type: 'products' | 'flavors' | 'categories'): ImageOptimizationConfig {
    return BUCKET_CONFIGURATIONS[type].config;
  }

  /**
   * Obtém configuração de bucket para um tipo específico
   */
  static getBucketConfig(type: 'products' | 'flavors' | 'categories'): BucketConfiguration {
    return BUCKET_CONFIGURATIONS[type];
  }

  /**
   * Valida se um arquivo atende aos critérios de configuração
   */
  static validateFile(file: File, config: ImageOptimizationConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Verificar tamanho
    if (file.size > config.limits.maxFileSize) {
      errors.push(`Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(1)}MB (máximo: ${(config.limits.maxFileSize / 1024 / 1024).toFixed(1)}MB)`);
    }

    // Verificar tipo
    if (!config.limits.allowedFormats.includes(file.type)) {
      errors.push(`Formato não permitido: ${file.type}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Calcula configurações otimizadas baseadas no tamanho da imagem
   */
  static getOptimizedSettings(
    originalWidth: number,
    originalHeight: number,
    config: ImageOptimizationConfig
  ): { width: number; height: number; quality: number } {
    const aspectRatio = originalWidth / originalHeight;
    let targetWidth = Math.min(originalWidth, config.resize.maxWidth);
    let targetHeight = Math.min(originalHeight, config.resize.maxHeight);

    // Manter proporção
    if (config.resize.maintainAspectRatio) {
      if (targetWidth / targetHeight > aspectRatio) {
        targetWidth = targetHeight * aspectRatio;
      } else {
        targetHeight = targetWidth / aspectRatio;
      }
    }

    // Ajustar qualidade baseada no tamanho
    let quality = config.webp.quality;
    const totalPixels = targetWidth * targetHeight;
    
    if (totalPixels > 1920 * 1080) {
      quality = Math.max(quality - 10, 70); // Reduzir qualidade para imagens grandes
    } else if (totalPixels < 400 * 400) {
      quality = Math.min(quality + 5, 95); // Aumentar qualidade para imagens pequenas
    }

    return {
      width: Math.round(targetWidth),
      height: Math.round(targetHeight),
      quality
    };
  }

  /**
   * Gera nome de arquivo otimizado
   */
  static generateOptimizedFileName(
    originalName: string,
    type: 'main' | 'thumbnail' | 'backup',
    timestamp?: number
  ): string {
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const cleanName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const ts = timestamp || Date.now();
    
    switch (type) {
      case 'thumbnail':
        return `${cleanName}_thumb_${ts}.webp`;
      case 'backup':
        return `${cleanName}_backup_${ts}.${originalName.split('.').pop()}`;
      default:
        return `${cleanName}_${ts}.webp`;
    }
  }

  /**
   * Calcula estatísticas de economia de espaço
   */
  static calculateSavings(
    originalSize: number,
    webpSize: number
  ): { savedBytes: number; savedPercentage: number; compressionRatio: number } {
    const savedBytes = originalSize - webpSize;
    const savedPercentage = (savedBytes / originalSize) * 100;
    const compressionRatio = webpSize / originalSize;

    return {
      savedBytes,
      savedPercentage,
      compressionRatio
    };
  }
}

// Exportar configurações padrão
export default {
  PRODUCT_IMAGE_CONFIG,
  FLAVOR_IMAGE_CONFIG,
  CATEGORY_IMAGE_CONFIG,
  BUCKET_CONFIGURATIONS,
  QUALITY_MONITORING_CONFIG,
  BATCH_CONVERSION_CONFIG,
  ConfigurationManager
};