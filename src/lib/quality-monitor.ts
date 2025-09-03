/**
 * Sistema de monitoramento de qualidade para conversões WebP
 * Monitora métricas de qualidade visual, performance e economia de espaço
 */

import { QUALITY_MONITORING_CONFIG, ConfigurationManager } from '@/config/image-optimization';
import { supabase } from '@/integrations/supabase/client';

export interface QualityMetrics {
  // Métricas de qualidade visual
  ssim?: number; // Structural Similarity Index (0-1)
  psnr?: number; // Peak Signal-to-Noise Ratio (dB)
  
  // Métricas de arquivo
  originalSize: number;
  webpSize: number;
  compressionRatio: number;
  savedBytes: number;
  savedPercentage: number;
  
  // Métricas de performance
  conversionTime: number; // ms
  uploadTime: number; // ms
  loadTime?: number; // ms (tempo de carregamento)
  
  // Metadados
  originalFormat: string;
  dimensions: { width: number; height: number };
  timestamp: Date;
  bucketName: string;
  filePath: string;
}

export interface QualityReport {
  passed: boolean;
  score: number; // 0-100
  issues: string[];
  recommendations: string[];
  metrics: QualityMetrics;
}

export interface QualityStats {
  totalImages: number;
  averageScore: number;
  averageCompression: number;
  averageSavings: number;
  totalSavedBytes: number;
  qualityDistribution: {
    excellent: number; // 90-100
    good: number; // 70-89
    fair: number; // 50-69
    poor: number; // 0-49
  };
  commonIssues: Array<{ issue: string; count: number }>;
}

class QualityMonitor {
  private static instance: QualityMonitor;
  private metricsHistory: QualityMetrics[] = [];
  private config = QUALITY_MONITORING_CONFIG;

  private constructor() {
    this.loadHistoryFromStorage();
  }

  public static getInstance(): QualityMonitor {
    if (!QualityMonitor.instance) {
      QualityMonitor.instance = new QualityMonitor();
    }
    return QualityMonitor.instance;
  }

  /**
   * Monitora a qualidade de uma conversão WebP
   */
  public async monitorConversion(
    originalFile: File,
    webpBlob: Blob,
    conversionTime: number,
    uploadTime: number,
    bucketName: string,
    filePath: string
  ): Promise<QualityReport> {
    const startTime = Date.now();
    
    try {
      // Calcular métricas básicas
      const metrics: QualityMetrics = {
        originalSize: originalFile.size,
        webpSize: webpBlob.size,
        compressionRatio: webpBlob.size / originalFile.size,
        savedBytes: originalFile.size - webpBlob.size,
        savedPercentage: ((originalFile.size - webpBlob.size) / originalFile.size) * 100,
        conversionTime,
        uploadTime,
        originalFormat: originalFile.type,
        dimensions: await this.getImageDimensions(originalFile),
        timestamp: new Date(),
        bucketName,
        filePath
      };

      // Calcular métricas de qualidade visual (se habilitado)
      if (this.config.metrics.ssim || this.config.metrics.psnr) {
        const visualMetrics = await this.calculateVisualQuality(originalFile, webpBlob);
        metrics.ssim = visualMetrics.ssim;
        metrics.psnr = visualMetrics.psnr;
      }

      // Medir tempo de carregamento (simulado)
      if (this.config.metrics.loadTime) {
        metrics.loadTime = await this.measureLoadTime(webpBlob);
      }

      // Gerar relatório de qualidade
      const report = this.generateQualityReport(metrics);

      // Salvar métricas se passou na amostragem
      if (Math.random() < this.config.sampleRate) {
        this.saveMetrics(metrics);
      }

      return report;
    } catch (error) {
      console.error('Erro no monitoramento de qualidade:', error);
      
      // Retornar relatório básico em caso de erro
      return {
        passed: true,
        score: 50,
        issues: ['Erro no monitoramento de qualidade'],
        recommendations: ['Verificar configurações do monitor'],
        metrics: {
          originalSize: originalFile.size,
          webpSize: webpBlob.size,
          compressionRatio: webpBlob.size / originalFile.size,
          savedBytes: originalFile.size - webpBlob.size,
          savedPercentage: ((originalFile.size - webpBlob.size) / originalFile.size) * 100,
          conversionTime,
          uploadTime,
          originalFormat: originalFile.type,
          dimensions: { width: 0, height: 0 },
          timestamp: new Date(),
          bucketName,
          filePath
        }
      };
    }
  }

  /**
   * Calcula métricas de qualidade visual
   */
  private async calculateVisualQuality(
    originalFile: File,
    webpBlob: Blob
  ): Promise<{ ssim?: number; psnr?: number }> {
    try {
      // Converter arquivos para ImageData para comparação
      const originalImageData = await this.fileToImageData(originalFile);
      const webpImageData = await this.blobToImageData(webpBlob);

      const result: { ssim?: number; psnr?: number } = {};

      if (this.config.metrics.ssim) {
        result.ssim = this.calculateSSIM(originalImageData, webpImageData);
      }

      if (this.config.metrics.psnr) {
        result.psnr = this.calculatePSNR(originalImageData, webpImageData);
      }

      return result;
    } catch (error) {
      console.warn('Erro no cálculo de qualidade visual:', error);
      return {};
    }
  }

  /**
   * Calcula SSIM (Structural Similarity Index)
   */
  private calculateSSIM(img1: ImageData, img2: ImageData): number {
    // Implementação simplificada do SSIM
    // Em produção, considere usar uma biblioteca especializada
    
    if (img1.width !== img2.width || img1.height !== img2.height) {
      return 0;
    }

    const data1 = img1.data;
    const data2 = img2.data;
    let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, sumProduct = 0;
    const length = data1.length;

    for (let i = 0; i < length; i += 4) {
      // Converter para escala de cinza
      const gray1 = 0.299 * data1[i] + 0.587 * data1[i + 1] + 0.114 * data1[i + 2];
      const gray2 = 0.299 * data2[i] + 0.587 * data2[i + 1] + 0.114 * data2[i + 2];
      
      sum1 += gray1;
      sum2 += gray2;
      sum1Sq += gray1 * gray1;
      sum2Sq += gray2 * gray2;
      sumProduct += gray1 * gray2;
    }

    const n = length / 4;
    const mean1 = sum1 / n;
    const mean2 = sum2 / n;
    const variance1 = (sum1Sq / n) - (mean1 * mean1);
    const variance2 = (sum2Sq / n) - (mean2 * mean2);
    const covariance = (sumProduct / n) - (mean1 * mean2);

    const c1 = 6.5025; // (0.01 * 255)^2
    const c2 = 58.5225; // (0.03 * 255)^2

    const ssim = ((2 * mean1 * mean2 + c1) * (2 * covariance + c2)) /
                 ((mean1 * mean1 + mean2 * mean2 + c1) * (variance1 + variance2 + c2));

    return Math.max(0, Math.min(1, ssim));
  }

  /**
   * Calcula PSNR (Peak Signal-to-Noise Ratio)
   */
  private calculatePSNR(img1: ImageData, img2: ImageData): number {
    if (img1.width !== img2.width || img1.height !== img2.height) {
      return 0;
    }

    const data1 = img1.data;
    const data2 = img2.data;
    let mse = 0;
    const length = data1.length;

    for (let i = 0; i < length; i += 4) {
      // Calcular MSE para cada canal RGB
      const diffR = data1[i] - data2[i];
      const diffG = data1[i + 1] - data2[i + 1];
      const diffB = data1[i + 2] - data2[i + 2];
      
      mse += (diffR * diffR + diffG * diffG + diffB * diffB) / 3;
    }

    mse /= (length / 4);
    
    if (mse === 0) return 100; // Imagens idênticas
    
    const maxPixelValue = 255;
    const psnr = 20 * Math.log10(maxPixelValue / Math.sqrt(mse));
    
    return Math.max(0, psnr);
  }

  /**
   * Mede tempo de carregamento simulado
   */
  private async measureLoadTime(blob: Blob): Promise<number> {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      
      img.onload = () => {
        const loadTime = Date.now() - startTime;
        URL.revokeObjectURL(url);
        resolve(loadTime);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(0);
      };
      
      img.src = url;
    });
  }

  /**
   * Converte File para ImageData
   */
  private async fileToImageData(file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Não foi possível obter contexto do canvas'));
        return;
      }
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        try {
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          resolve(imageData);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Converte Blob para ImageData
   */
  private async blobToImageData(blob: Blob): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Não foi possível obter contexto do canvas'));
        return;
      }
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        try {
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          URL.revokeObjectURL(img.src);
          resolve(imageData);
        } catch (error) {
          URL.revokeObjectURL(img.src);
          reject(error);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Erro ao carregar blob'));
      };
      
      img.src = URL.createObjectURL(blob);
    });
  }

  /**
   * Obtém dimensões da imagem
   */
  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
        URL.revokeObjectURL(img.src);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Gera relatório de qualidade
   */
  private generateQualityReport(metrics: QualityMetrics): QualityReport {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Verificar SSIM
    if (metrics.ssim !== undefined) {
      if (metrics.ssim < this.config.thresholds.minSSIM) {
        issues.push(`Qualidade visual baixa (SSIM: ${metrics.ssim.toFixed(3)})`);
        recommendations.push('Considere aumentar a qualidade WebP');
        score -= 20;
      }
    }

    // Verificar PSNR
    if (metrics.psnr !== undefined) {
      if (metrics.psnr < this.config.thresholds.minPSNR) {
        issues.push(`Ruído alto (PSNR: ${metrics.psnr.toFixed(1)}dB)`);
        recommendations.push('Ajustar configurações de compressão');
        score -= 15;
      }
    }

    // Verificar compressão
    if (metrics.compressionRatio > this.config.thresholds.maxCompressionRatio) {
      issues.push(`Compressão excessiva (${(metrics.compressionRatio * 100).toFixed(1)}%)`);
      recommendations.push('Reduzir nível de compressão');
      score -= 10;
    }

    // Verificar tempo de carregamento
    if (metrics.loadTime && metrics.loadTime > this.config.thresholds.maxLoadTime) {
      issues.push(`Tempo de carregamento alto (${metrics.loadTime}ms)`);
      recommendations.push('Otimizar tamanho da imagem');
      score -= 10;
    }

    // Verificar economia de espaço
    if (metrics.savedPercentage < 10) {
      issues.push('Pouca economia de espaço');
      recommendations.push('Verificar se WebP é o melhor formato para esta imagem');
      score -= 5;
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      recommendations,
      metrics
    };
  }

  /**
   * Salva métricas no histórico
   */
  private saveMetrics(metrics: QualityMetrics): void {
    this.metricsHistory.push(metrics);
    
    // Manter apenas os últimos 1000 registros
    if (this.metricsHistory.length > 1000) {
      this.metricsHistory = this.metricsHistory.slice(-1000);
    }
    
    this.saveHistoryToStorage();
  }

  /**
   * Gera estatísticas de qualidade
   */
  public generateQualityStats(): QualityStats {
    if (this.metricsHistory.length === 0) {
      return {
        totalImages: 0,
        averageScore: 0,
        averageCompression: 0,
        averageSavings: 0,
        totalSavedBytes: 0,
        qualityDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 },
        commonIssues: []
      };
    }

    const totalImages = this.metricsHistory.length;
    const totalSavedBytes = this.metricsHistory.reduce((sum, m) => sum + m.savedBytes, 0);
    const averageCompression = this.metricsHistory.reduce((sum, m) => sum + m.compressionRatio, 0) / totalImages;
    const averageSavings = this.metricsHistory.reduce((sum, m) => sum + m.savedPercentage, 0) / totalImages;

    // Calcular distribuição de qualidade (baseado em SSIM se disponível)
    const distribution = { excellent: 0, good: 0, fair: 0, poor: 0 };
    let totalScore = 0;

    this.metricsHistory.forEach(metrics => {
      const report = this.generateQualityReport(metrics);
      totalScore += report.score;
      
      if (report.score >= 90) distribution.excellent++;
      else if (report.score >= 70) distribution.good++;
      else if (report.score >= 50) distribution.fair++;
      else distribution.poor++;
    });

    return {
      totalImages,
      averageScore: totalScore / totalImages,
      averageCompression,
      averageSavings,
      totalSavedBytes,
      qualityDistribution: distribution,
      commonIssues: [] // Implementar análise de problemas comuns
    };
  }

  /**
   * Salva histórico no localStorage
   */
  private saveHistoryToStorage(): void {
    try {
      const data = JSON.stringify(this.metricsHistory.slice(-100)); // Salvar apenas os últimos 100
      localStorage.setItem('webp_quality_metrics', data);
    } catch (error) {
      console.warn('Erro ao salvar métricas:', error);
    }
  }

  /**
   * Carrega histórico do localStorage
   */
  private loadHistoryFromStorage(): void {
    try {
      const data = localStorage.getItem('webp_quality_metrics');
      if (data) {
        this.metricsHistory = JSON.parse(data).map((m: QualityMetrics) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Erro ao carregar métricas:', error);
      this.metricsHistory = [];
    }
  }

  /**
   * Limpa histórico de métricas
   */
  public clearHistory(): void {
    this.metricsHistory = [];
    localStorage.removeItem('webp_quality_metrics');
  }
}

// Instância singleton
export const qualityMonitor = QualityMonitor.getInstance();

// Funções de conveniência
export const monitorImageConversion = async (
  originalFile: File,
  webpBlob: Blob,
  conversionTime: number,
  uploadTime: number,
  bucketName: string,
  filePath: string
): Promise<QualityReport> => {
  return qualityMonitor.monitorConversion(
    originalFile,
    webpBlob,
    conversionTime,
    uploadTime,
    bucketName,
    filePath
  );
};

export const getQualityStatistics = (): QualityStats => {
  return qualityMonitor.generateQualityStats();
};

export default QualityMonitor;