/**
 * Script utilitário para conversão em lote de imagens para WebP
 * Converte todas as imagens existentes nos buckets de produtos e sabores
 * Mantém backup das originais e atualiza os caminhos no banco de dados
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';
import * as sharp from 'sharp';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente do .env.local
dotenv.config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ConversionStats {
  totalImages: number;
  converted: number;
  skipped: number;
  errors: number;
  sizeSaved: number;
}

interface ImageRecord {
  id: string;
  image_url: string;
  table: string;
  column: string;
}

interface FlavorImageRecord {
  id: string;
  image_url: string;
  product_id: string;
}

class ImageConverter {
  private stats: ConversionStats = {
    totalImages: 0,
    converted: 0,
    skipped: 0,
    errors: 0,
    sizeSaved: 0
  };

  private logFile: string;

  constructor() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFile = `conversion-log-${timestamp}.txt`;
    this.log('🚀 Iniciando conversão em lote para WebP');
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }

  private async downloadImage(url: string): Promise<Buffer> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      throw new Error(`Erro ao baixar imagem: ${error}`);
    }
  }

  private async convertImageToWebP(imageBuffer: Buffer, originalName: string): Promise<{
    webpBuffer: Buffer;
    originalSize: number;
    webpSize: number;
    fileName: string;
  }> {
    try {
      // Usar Sharp para conversão em Node.js
      const webpBuffer = await sharp.default(imageBuffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({
          quality: 85,
          effort: 4
        })
        .toBuffer();

      const fileName = this.getWebPFileName(originalName);

      return {
        webpBuffer,
        originalSize: imageBuffer.length,
        webpSize: webpBuffer.length,
        fileName
      };
    } catch (error) {
      throw new Error(`Erro na conversão WebP: ${error}`);
    }
  }

  private getWebPFileName(originalName: string): string {
    const nameWithoutExt = path.parse(originalName).name;
    const timestamp = Date.now();
    return `${timestamp}_${nameWithoutExt}.webp`;
  }

  private getMimeType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      case '.webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  }

  private async backupOriginalImage(
    bucket: string,
    originalPath: string,
    imageBuffer: Buffer
  ): Promise<void> {
    const backupPath = `backup/${originalPath}`;
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(backupPath, imageBuffer, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw new Error(`Erro ao fazer backup: ${error.message}`);
    }
  }

  private async uploadWebPImage(
    bucket: string,
    filePath: string,
    webpBuffer: Buffer
  ): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, webpBuffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/webp'
      });

    if (error) {
      throw new Error(`Erro ao fazer upload WebP: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  private async updateDatabaseRecord(
    table: string,
    id: string,
    column: string,
    newUrl: string
  ): Promise<void> {
    const { error } = await supabase
      .from(table)
      .update({ [column]: newUrl })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao atualizar banco: ${error.message}`);
    }
  }

  private async getProductImages(): Promise<ImageRecord[]> {
    const { data, error } = await supabase
      .from('products')
      .select('id, image_url')
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '');

    if (error) {
      throw new Error(`Erro ao buscar produtos: ${error.message}`);
    }

    return data.map(item => ({
      id: item.id,
      image_url: item.image_url,
      table: 'products',
      column: 'image_url'
    }));
  }

  private async getFlavorImages(): Promise<FlavorImageRecord[]> {
    const { data, error } = await supabase
      .from('product_flavors')
      .select('id, image_url, product_id')
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '');

    if (error) {
      throw new Error(`Erro ao buscar sabores: ${error.message}`);
    }

    return data || [];
  }

  private isAlreadyWebP(url: string): boolean {
    return url.toLowerCase().includes('.webp');
  }

  private extractPathFromUrl(url: string, bucket: string): string {
    // Extrair o caminho do arquivo da URL do Supabase
    const bucketUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/`;
    return url.replace(bucketUrl, '');
  }

  private getBucketFromUrl(url: string): string {
    if (url.includes('product-images')) {
      return 'product-images';
    } else if (url.includes('product-flavor-images')) {
      return 'product-flavor-images';
    }
    return 'product-images'; // default
  }

  private async convertSingleImage(
    record: ImageRecord | FlavorImageRecord,
    isFlavorImage: boolean = false
  ): Promise<void> {
    try {
      const { image_url } = record;
      
      // Verificar se já é WebP
      if (this.isAlreadyWebP(image_url)) {
        this.log(`⏭️  Pulando ${image_url} (já é WebP)`);
        this.stats.skipped++;
        return;
      }

      this.log(`🔄 Convertendo: ${image_url}`);

      // Determinar bucket e caminho
      const bucket = this.getBucketFromUrl(image_url);
      const originalPath = this.extractPathFromUrl(image_url, bucket);

      // Baixar imagem original
      const imageBuffer = await this.downloadImage(image_url);

      // Fazer backup da original
      await this.backupOriginalImage(bucket, originalPath, imageBuffer);

      // Converter para WebP
      const { webpBuffer, originalSize, webpSize, fileName } = 
        await this.convertImageToWebP(imageBuffer, path.basename(originalPath));

      // Determinar novo caminho
      const folder = isFlavorImage ? 'flavors' : 'products';
      const newPath = `${folder}/${fileName}`;

      // Upload da versão WebP
      const newUrl = await this.uploadWebPImage(bucket, newPath, webpBuffer);

      // Atualizar banco de dados
      if (isFlavorImage) {
        await this.updateDatabaseRecord('product_flavors', record.id, 'image_url', newUrl);
      } else {
        const imgRecord = record as ImageRecord;
        await this.updateDatabaseRecord(imgRecord.table, imgRecord.id, imgRecord.column, newUrl);
      }

      // Atualizar estatísticas
      this.stats.converted++;
      this.stats.sizeSaved += (originalSize - webpSize);

      const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
      this.log(`✅ Convertido: ${fileName} (economia: ${savings}%)`);

    } catch (error) {
      this.stats.errors++;
      this.log(`❌ Erro ao converter ${record.image_url}: ${error}`);
    }
  }

  public async convertAllImages(): Promise<void> {
    try {
      this.log('📊 Buscando imagens para conversão...');

      // Buscar todas as imagens
      const productImages = await this.getProductImages();
      const flavorImages = await this.getFlavorImages();

      this.stats.totalImages = productImages.length + flavorImages.length;
      this.log(`📈 Total de imagens encontradas: ${this.stats.totalImages}`);

      // Converter imagens de produtos
      this.log('🍰 Convertendo imagens de produtos...');
      for (const image of productImages) {
        await this.convertSingleImage(image, false);
      }

      // Converter imagens de sabores
      this.log('🎨 Convertendo imagens de sabores...');
      for (const image of flavorImages) {
        await this.convertSingleImage(image, true);
      }

      this.printFinalStats();

    } catch (error) {
      this.log(`💥 Erro fatal: ${error}`);
      throw error;
    }
  }

  private printFinalStats(): void {
    const sizeSavedMB = (this.stats.sizeSaved / 1024 / 1024).toFixed(2);
    
    this.log('\n📊 RELATÓRIO FINAL:');
    this.log(`📸 Total de imagens: ${this.stats.totalImages}`);
    this.log(`✅ Convertidas: ${this.stats.converted}`);
    this.log(`⏭️  Puladas (já WebP): ${this.stats.skipped}`);
    this.log(`❌ Erros: ${this.stats.errors}`);
    this.log(`💾 Espaço economizado: ${sizeSavedMB} MB`);
    this.log(`📄 Log salvo em: ${this.logFile}`);
  }
}

// Executar conversão
async function main() {
  try {
    const converter = new ImageConverter();
    await converter.convertAllImages();
    console.log('🎉 Conversão concluída com sucesso!');
  } catch (error) {
    console.error('💥 Erro na conversão:', error);
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ImageConverter };