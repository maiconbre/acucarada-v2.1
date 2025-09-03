/**
 * Sistema de gerenciamento de backup para imagens originais
 * Permite criar, restaurar e gerenciar backups de imagens
 */

import { supabase } from '@/integrations/supabase/client';

export interface BackupInfo {
  originalPath: string;
  backupPath: string;
  bucket: string;
  createdAt: Date;
  originalSize: number;
  webpPath?: string;
  webpSize?: number;
}

export interface RestoreResult {
  success: boolean;
  restoredUrl?: string;
  error?: string;
}

export interface BackupStats {
  totalBackups: number;
  totalSize: number;
  oldestBackup: Date | null;
  newestBackup: Date | null;
}

class BackupManager {
  private static instance: BackupManager;
  private backupPrefix = 'backup/';

  private constructor() {}

  public static getInstance(): BackupManager {
    if (!BackupManager.instance) {
      BackupManager.instance = new BackupManager();
    }
    return BackupManager.instance;
  }

  /**
   * Cria backup de uma imagem original
   */
  public async createBackup(
    bucket: string,
    originalPath: string,
    imageBuffer: Buffer,
    metadata?: { webpPath?: string; webpSize?: number }
  ): Promise<BackupInfo> {
    try {
      const timestamp = Date.now();
      const pathParts = originalPath.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const folder = pathParts.slice(0, -1).join('/');
      
      // Criar nome do backup com timestamp
      const backupFileName = `${timestamp}_${fileName}`;
      const backupPath = `${this.backupPrefix}${folder}/${backupFileName}`;

      // Upload do backup
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(backupPath, imageBuffer, {
          cacheControl: '31536000', // 1 ano
          upsert: false
        });

      if (error) {
        throw new Error(`Erro ao criar backup: ${error.message}`);
      }

      const backupInfo: BackupInfo = {
        originalPath,
        backupPath,
        bucket,
        createdAt: new Date(),
        originalSize: imageBuffer.length,
        webpPath: metadata?.webpPath,
        webpSize: metadata?.webpSize
      };

      // Salvar informações do backup no localStorage para referência
      await this.saveBackupInfo(backupInfo);

      return backupInfo;
    } catch (error) {
      throw new Error(`Falha ao criar backup: ${error}`);
    }
  }

  /**
   * Restaura uma imagem a partir do backup
   */
  public async restoreFromBackup(
    bucket: string,
    backupPath: string,
    targetPath?: string
  ): Promise<RestoreResult> {
    try {
      // Baixar backup
      const { data: backupData, error: downloadError } = await supabase.storage
        .from(bucket)
        .download(backupPath);

      if (downloadError || !backupData) {
        return {
          success: false,
          error: `Erro ao baixar backup: ${downloadError?.message || 'Arquivo não encontrado'}`
        };
      }

      // Determinar caminho de destino
      const restorePath = targetPath || this.getOriginalPathFromBackup(backupPath);
      
      // Converter blob para buffer
      const buffer = Buffer.from(await backupData.arrayBuffer());

      // Upload da imagem restaurada
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(restorePath, buffer, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        return {
          success: false,
          error: `Erro ao restaurar imagem: ${uploadError.message}`
        };
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(restorePath);

      return {
        success: true,
        restoredUrl: urlData.publicUrl
      };
    } catch (error) {
      return {
        success: false,
        error: `Falha na restauração: ${error}`
      };
    }
  }

  /**
   * Lista todos os backups disponíveis
   */
  public async listBackups(bucket: string, folder?: string): Promise<BackupInfo[]> {
    try {
      const searchPath = folder ? `${this.backupPrefix}${folder}` : this.backupPrefix;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(searchPath, {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        throw new Error(`Erro ao listar backups: ${error.message}`);
      }

      const backups: BackupInfo[] = [];
      
      for (const file of data || []) {
        if (file.name && !file.name.endsWith('/')) {
          const backupPath = `${searchPath}/${file.name}`;
          const originalPath = this.getOriginalPathFromBackup(backupPath);
          
          backups.push({
            originalPath,
            backupPath,
            bucket,
            createdAt: new Date(file.created_at || Date.now()),
            originalSize: file.metadata?.size || 0
          });
        }
      }

      return backups;
    } catch (error) {
      console.error('Erro ao listar backups:', error);
      return [];
    }
  }

  /**
   * Remove backups antigos (mais de X dias)
   */
  public async cleanupOldBackups(
    bucket: string,
    daysToKeep: number = 30
  ): Promise<{ removed: number; errors: string[] }> {
    try {
      const backups = await this.listBackups(bucket);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const oldBackups = backups.filter(backup => backup.createdAt < cutoffDate);
      
      let removed = 0;
      const errors: string[] = [];

      for (const backup of oldBackups) {
        try {
          const { error } = await supabase.storage
            .from(bucket)
            .remove([backup.backupPath]);

          if (error) {
            errors.push(`Erro ao remover ${backup.backupPath}: ${error.message}`);
          } else {
            removed++;
            await this.removeBackupInfo(backup);
          }
        } catch (error) {
          errors.push(`Erro ao remover ${backup.backupPath}: ${error}`);
        }
      }

      return { removed, errors };
    } catch (error) {
      return {
        removed: 0,
        errors: [`Erro na limpeza: ${error}`]
      };
    }
  }

  /**
   * Obtém estatísticas dos backups
   */
  public async getBackupStats(bucket: string): Promise<BackupStats> {
    try {
      const backups = await this.listBackups(bucket);
      
      if (backups.length === 0) {
        return {
          totalBackups: 0,
          totalSize: 0,
          oldestBackup: null,
          newestBackup: null
        };
      }

      const totalSize = backups.reduce((sum, backup) => sum + backup.originalSize, 0);
      const dates = backups.map(backup => backup.createdAt).sort();

      return {
        totalBackups: backups.length,
        totalSize,
        oldestBackup: dates[0],
        newestBackup: dates[dates.length - 1]
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        totalBackups: 0,
        totalSize: 0,
        oldestBackup: null,
        newestBackup: null
      };
    }
  }

  /**
   * Verifica se existe backup para uma imagem
   */
  public async hasBackup(bucket: string, originalPath: string): Promise<boolean> {
    try {
      const backups = await this.listBackups(bucket);
      return backups.some(backup => backup.originalPath === originalPath);
    } catch (error) {
      return false;
    }
  }

  /**
   * Encontra backup mais recente para uma imagem
   */
  public async findLatestBackup(bucket: string, originalPath: string): Promise<BackupInfo | null> {
    try {
      const backups = await this.listBackups(bucket);
      const imageBackups = backups
        .filter(backup => backup.originalPath === originalPath)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return imageBackups[0] || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extrai o caminho original a partir do caminho de backup
   */
  private getOriginalPathFromBackup(backupPath: string): string {
    // Remove o prefixo de backup
    const withoutPrefix = backupPath.replace(this.backupPrefix, '');
    
    // Remove o timestamp do nome do arquivo
    const parts = withoutPrefix.split('/');
    const fileName = parts[parts.length - 1];
    const folder = parts.slice(0, -1).join('/');
    
    // Remove timestamp do nome do arquivo (formato: timestamp_originalname.ext)
    const originalFileName = fileName.replace(/^\d+_/, '');
    
    return folder ? `${folder}/${originalFileName}` : originalFileName;
  }

  /**
   * Salva informações do backup (pode ser expandido para usar banco de dados)
   */
  private async saveBackupInfo(backupInfo: BackupInfo): Promise<void> {
    try {
      const key = `backup_${backupInfo.bucket}_${backupInfo.originalPath.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const data = {
        ...backupInfo,
        createdAt: backupInfo.createdAt.toISOString()
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Erro ao salvar info do backup:', error);
    }
  }

  /**
   * Remove informações do backup
   */
  private async removeBackupInfo(backupInfo: BackupInfo): Promise<void> {
    try {
      const key = `backup_${backupInfo.bucket}_${backupInfo.originalPath.replace(/[^a-zA-Z0-9]/g, '_')}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Erro ao remover info do backup:', error);
    }
  }
}

// Funções de conveniência
export const backupManager = BackupManager.getInstance();

export const createImageBackup = async (
  bucket: string,
  originalPath: string,
  imageBuffer: Buffer,
  metadata?: { webpPath?: string; webpSize?: number }
): Promise<BackupInfo> => {
  return backupManager.createBackup(bucket, originalPath, imageBuffer, metadata);
};

export const restoreImageFromBackup = async (
  bucket: string,
  backupPath: string,
  targetPath?: string
): Promise<RestoreResult> => {
  return backupManager.restoreFromBackup(bucket, backupPath, targetPath);
};

export const getBackupStatistics = async (bucket: string): Promise<BackupStats> => {
  return backupManager.getBackupStats(bucket);
};

export const cleanupOldBackups = async (
  bucket: string,
  daysToKeep: number = 30
): Promise<{ removed: number; errors: string[] }> => {
  return backupManager.cleanupOldBackups(bucket, daysToKeep);
};

export default BackupManager;