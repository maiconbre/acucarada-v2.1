/**
 * Componente para gerenciar backups de imagens
 * Permite visualizar, restaurar e limpar backups
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  backupManager, 
  BackupInfo, 
  BackupStats, 
  RestoreResult,
  getBackupStatistics,
  cleanupOldBackups,
  restoreImageFromBackup
} from '@/lib/backup-manager';
import { 
  Archive, 
  RotateCcw, 
  Trash2, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  HardDrive,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { formatBytes, formatDate } from '@/lib/utils';

interface BackupManagerProps {
  bucket: string;
  title?: string;
  description?: string;
}

const BackupManager: React.FC<BackupManagerProps> = ({ 
  bucket, 
  title = 'Gerenciador de Backups',
  description = 'Gerencie backups de imagens originais'
}) => {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [cleaning, setCleaning] = useState(false);
  const [selectedBackups, setSelectedBackups] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadBackups();
    loadStats();
  }, [bucket]);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const backupList = await backupManager.listBackups(bucket);
      setBackups(backupList);
    } catch (error) {
      console.error('Erro ao carregar backups:', error);
      toast.error('Erro ao carregar lista de backups');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const backupStats = await getBackupStatistics(bucket);
      setStats(backupStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleRestore = async (backup: BackupInfo) => {
    try {
      setRestoring(backup.backupPath);
      
      const result: RestoreResult = await restoreImageFromBackup(
        bucket,
        backup.backupPath
      );

      if (result.success) {
        toast.success('Imagem restaurada com sucesso!');
        await loadBackups();
      } else {
        toast.error(`Erro na restauração: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro na restauração:', error);
      toast.error('Erro inesperado na restauração');
    } finally {
      setRestoring(null);
    }
  };

  const handleCleanup = async (daysToKeep: number = 30) => {
    try {
      setCleaning(true);
      
      const result = await cleanupOldBackups(bucket, daysToKeep);
      
      if (result.removed > 0) {
        toast.success(`${result.removed} backups antigos removidos`);
      }
      
      if (result.errors.length > 0) {
        console.warn('Erros na limpeza:', result.errors);
        toast.warning(`${result.errors.length} erros durante a limpeza`);
      }
      
      await loadBackups();
      await loadStats();
    } catch (error) {
      console.error('Erro na limpeza:', error);
      toast.error('Erro durante a limpeza de backups');
    } finally {
      setCleaning(false);
    }
  };

  const toggleBackupSelection = (backupPath: string) => {
    const newSelection = new Set(selectedBackups);
    if (newSelection.has(backupPath)) {
      newSelection.delete(backupPath);
    } else {
      newSelection.add(backupPath);
    }
    setSelectedBackups(newSelection);
  };

  const selectAllBackups = () => {
    if (selectedBackups.size === backups.length) {
      setSelectedBackups(new Set());
    } else {
      setSelectedBackups(new Set(backups.map(b => b.backupPath)));
    }
  };

  const formatFileSize = (bytes: number): string => {
    return formatBytes(bytes);
  };

  const getBackupAge = (createdAt: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    return `${Math.floor(diffDays / 30)} meses atrás`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Carregando backups...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Archive className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total de Backups</p>
                  <p className="text-2xl font-bold">{stats.totalBackups}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Espaço Usado</p>
                  <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Mais Antigo</p>
                  <p className="text-sm font-medium">
                    {stats.oldestBackup ? getBackupAge(stats.oldestBackup) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Mais Recente</p>
                  <p className="text-sm font-medium">
                    {stats.newestBackup ? getBackupAge(stats.newestBackup) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadBackups()}
              disabled={loading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllBackups}
              disabled={backups.length === 0}
            >
              {selectedBackups.size === backups.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleCleanup(30)}
              disabled={cleaning || backups.length === 0}
            >
              {cleaning ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Limpar Antigos (30+ dias)
            </Button>
          </div>

          {backups.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Nenhum backup encontrado para este bucket.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {backups.map((backup) => (
                <Card key={backup.backupPath} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedBackups.has(backup.backupPath)}
                        onChange={() => toggleBackupSelection(backup.backupPath)}
                        className="rounded"
                      />
                      
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      
                      <div>
                        <p className="font-medium text-sm">
                          {backup.originalPath.split('/').pop()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {backup.originalPath}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {formatFileSize(backup.originalSize)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getBackupAge(backup.createdAt)}
                          </Badge>
                          {backup.webpSize && (
                            <Badge variant="default" className="text-xs">
                              WebP: {formatFileSize(backup.webpSize)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(backup)}
                        disabled={restoring === backup.backupPath}
                      >
                        {restoring === backup.backupPath ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Restaurar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupManager;