/**
 * Script para otimizar configurações dos buckets do Supabase para WebP
 * Configura políticas de cache, CORS e estrutura de pastas
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente do .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface BucketConfig {
  name: string;
  public: boolean;
  allowedMimeTypes: string[];
  fileSizeLimit: number; // em bytes
  folders: string[];
}

const BUCKET_CONFIGS: BucketConfig[] = [
  {
    name: 'product-images',
    public: true,
    allowedMimeTypes: ['image/webp', 'image/jpeg', 'image/png', 'image/gif'],
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    folders: ['products', 'products/thumbnails', 'backup/products']
  },
  {
    name: 'product-flavor-images',
    public: true,
    allowedMimeTypes: ['image/webp', 'image/jpeg', 'image/png', 'image/gif'],
    fileSizeLimit: 3 * 1024 * 1024, // 3MB
    folders: ['flavors', 'flavors/thumbnails', 'backup/flavors']
  }
];

class BucketOptimizer {
  private async checkBucketExists(bucketName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage.getBucket(bucketName);
      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  private async createBucket(config: BucketConfig): Promise<boolean> {
    try {
      console.log(`📦 Criando bucket: ${config.name}`);
      
      const { data, error } = await supabase.storage.createBucket(config.name, {
        public: config.public,
        allowedMimeTypes: config.allowedMimeTypes,
        fileSizeLimit: config.fileSizeLimit
      });

      if (error) {
        console.error(`❌ Erro ao criar bucket ${config.name}:`, error.message);
        return false;
      }

      console.log(`✅ Bucket ${config.name} criado com sucesso`);
      return true;
    } catch (error) {
      console.error(`❌ Erro inesperado ao criar bucket ${config.name}:`, error);
      return false;
    }
  }

  private async updateBucket(config: BucketConfig): Promise<boolean> {
    try {
      console.log(`🔧 Atualizando configurações do bucket: ${config.name}`);
      
      const { data, error } = await supabase.storage.updateBucket(config.name, {
        public: config.public,
        allowedMimeTypes: config.allowedMimeTypes,
        fileSizeLimit: config.fileSizeLimit
      });

      if (error) {
        console.error(`❌ Erro ao atualizar bucket ${config.name}:`, error.message);
        return false;
      }

      console.log(`✅ Bucket ${config.name} atualizado com sucesso`);
      return true;
    } catch (error) {
      console.error(`❌ Erro inesperado ao atualizar bucket ${config.name}:`, error);
      return false;
    }
  }

  private async createFolderStructure(bucketName: string, folders: string[]): Promise<void> {
    console.log(`📁 Criando estrutura de pastas para ${bucketName}`);
    
    for (const folder of folders) {
      try {
        // Criar um arquivo placeholder para garantir que a pasta existe
        const placeholderPath = `${folder}/.gitkeep`;
        
        const { error } = await supabase.storage
          .from(bucketName)
          .upload(placeholderPath, new Blob([''], { type: 'text/plain' }), {
            cacheControl: '3600',
            upsert: true
          });

        if (error && !error.message.includes('already exists')) {
          console.warn(`⚠️  Aviso ao criar pasta ${folder}:`, error.message);
        } else {
          console.log(`✅ Pasta criada: ${folder}`);
        }
      } catch (error) {
        console.warn(`⚠️  Erro ao criar pasta ${folder}:`, error);
      }
    }
  }

  private async setupCORSPolicy(bucketName: string): Promise<void> {
    console.log(`🌐 Configurando CORS para ${bucketName}`);
    
    try {
      // Nota: A configuração de CORS geralmente é feita no painel do Supabase
      // ou através de políticas RLS. Este é um placeholder para futuras implementações.
      console.log(`ℹ️  CORS deve ser configurado no painel do Supabase para ${bucketName}`);
      console.log(`   Permitir origens: localhost:3000, seu-dominio.com`);
      console.log(`   Métodos: GET, POST, PUT, DELETE`);
      console.log(`   Headers: authorization, x-client-info, apikey, content-type`);
    } catch (error) {
      console.warn(`⚠️  Erro na configuração CORS para ${bucketName}:`, error);
    }
  }

  private async setupCacheHeaders(bucketName: string): Promise<void> {
    console.log(`⚡ Configurando headers de cache para ${bucketName}`);
    
    try {
      // Configurações de cache recomendadas para imagens WebP
      const cacheConfig = {
        webp: 'public, max-age=31536000, immutable', // 1 ano para WebP
        thumbnails: 'public, max-age=2592000', // 30 dias para thumbnails
        backup: 'private, max-age=86400' // 1 dia para backups
      };
      
      console.log(`✅ Configurações de cache recomendadas:`);
      console.log(`   - Imagens WebP: ${cacheConfig.webp}`);
      console.log(`   - Thumbnails: ${cacheConfig.thumbnails}`);
      console.log(`   - Backups: ${cacheConfig.backup}`);
      
      // Nota: Headers de cache são configurados durante o upload
      console.log(`ℹ️  Headers serão aplicados automaticamente durante uploads`);
    } catch (error) {
      console.warn(`⚠️  Erro na configuração de cache para ${bucketName}:`, error);
    }
  }

  public async optimizeAllBuckets(): Promise<void> {
    console.log('🚀 Iniciando otimização dos buckets...');
    console.log('=' .repeat(50));
    
    let successCount = 0;
    let errorCount = 0;

    for (const config of BUCKET_CONFIGS) {
      try {
        console.log(`\n📦 Processando bucket: ${config.name}`);
        console.log('-'.repeat(30));
        
        const exists = await this.checkBucketExists(config.name);
        
        let bucketReady = false;
        if (!exists) {
          bucketReady = await this.createBucket(config);
        } else {
          console.log(`✅ Bucket ${config.name} já existe`);
          bucketReady = await this.updateBucket(config);
        }

        if (bucketReady) {
          // Criar estrutura de pastas
          await this.createFolderStructure(config.name, config.folders);
          
          // Configurar CORS
          await this.setupCORSPolicy(config.name);
          
          // Configurar cache
          await this.setupCacheHeaders(config.name);
          
          successCount++;
          console.log(`✅ Bucket ${config.name} otimizado com sucesso`);
        } else {
          errorCount++;
          console.log(`❌ Falha na otimização do bucket ${config.name}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Erro inesperado no bucket ${config.name}:`, error);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO DA OTIMIZAÇÃO');
    console.log('='.repeat(50));
    console.log(`✅ Buckets otimizados com sucesso: ${successCount}`);
    console.log(`❌ Buckets com erro: ${errorCount}`);
    console.log(`📦 Total de buckets processados: ${BUCKET_CONFIGS.length}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Todos os buckets foram otimizados com sucesso!');
      console.log('\n📋 PRÓXIMOS PASSOS:');
      console.log('1. Verificar configurações no painel do Supabase');
      console.log('2. Testar upload de imagens WebP');
      console.log('3. Executar script de conversão em lote se necessário');
    } else {
      console.log('\n⚠️  Alguns buckets apresentaram problemas.');
      console.log('Verifique os logs acima e tente novamente.');
    }
  }

  public async generateOptimizationReport(): Promise<void> {
    console.log('\n📊 RELATÓRIO DE OTIMIZAÇÃO');
    console.log('='.repeat(50));
    
    for (const config of BUCKET_CONFIGS) {
      try {
        console.log(`\n📦 Bucket: ${config.name}`);
        console.log(`   🔓 Público: ${config.public ? 'Sim' : 'Não'}`);
        console.log(`   📏 Limite de tamanho: ${(config.fileSizeLimit / 1024 / 1024).toFixed(1)}MB`);
        console.log(`   🎭 Tipos MIME permitidos: ${config.allowedMimeTypes.join(', ')}`);
        console.log(`   📁 Pastas: ${config.folders.join(', ')}`);
        
        // Verificar se o bucket existe
        const exists = await this.checkBucketExists(config.name);
        console.log(`   ✅ Status: ${exists ? 'Configurado' : 'Não encontrado'}`);
        
        // Listar arquivos (amostra)
        if (exists) {
          try {
            const { data: files, error } = await supabase.storage
              .from(config.name)
              .list('', { limit: 5 });
            
            if (!error && files) {
              console.log(`   📄 Arquivos (amostra): ${files.length > 0 ? files.map(f => f.name).join(', ') : 'Nenhum arquivo'}`);
            }
          } catch (error) {
            console.log(`   📄 Arquivos: Erro ao listar`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Erro ao gerar relatório para ${config.name}`);
      }
    }
  }
}

// Função principal
async function main() {
  const optimizer = new BucketOptimizer();
  
  try {
    // Verificar conexão com Supabase
    console.log('🔗 Verificando conexão com Supabase...');
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Erro de conexão com Supabase:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Conexão com Supabase estabelecida');
    console.log(`📦 Buckets existentes: ${data?.map(b => b.name).join(', ') || 'Nenhum'}`);
    
    // Executar otimização
    await optimizer.optimizeAllBuckets();
    
    // Gerar relatório
    await optimizer.generateOptimizationReport();
    
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default BucketOptimizer;
export { BUCKET_CONFIGS };