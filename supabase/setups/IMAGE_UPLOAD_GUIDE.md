# Guia do Sistema de Upload de Imagens

## 📋 Visão Geral

O sistema de upload de imagens foi implementado com foco em performance e otimização, incluindo:

- ✅ **Conversão automática para WebP** para melhor compressão
- ✅ **Compressão inteligente** baseada no tamanho da imagem
- ✅ **Geração automática de thumbnails**
- ✅ **Validação de tipos de arquivo** (JPEG, PNG, WebP, GIF)
- ✅ **Preview em tempo real** durante o upload
- ✅ **Progress bar** para acompanhar o progresso
- ✅ **Drag & Drop** para facilitar o uso
- ✅ **Sistema de limpeza** para imagens órfãs

## 🚀 Como Usar

### 1. Configurar o Bucket no Supabase

Antes de usar o sistema, execute o script SQL no Supabase Dashboard:

```bash
# Acesse: https://supabase.com/dashboard
# Vá para: SQL Editor
# Execute o arquivo: setup_storage_bucket.sql
```

### 2. Usar o Componente ImageUpload

```tsx
import { ImageUpload } from '@/components/ui/image-upload';

function MyForm() {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <ImageUpload
      value={imageUrl}
      onChange={setImageUrl}
      bucketName="product-images"
      folder="products"
      showPreview={true}
      processingOptions={{
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85,
        generateThumbnail: true,
        thumbnailSize: 300
      }}
    />
  );
}
```

### 3. Propriedades do Componente

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `value` | `string` | - | URL da imagem atual |
| `onChange` | `(url: string) => void` | - | Callback quando a imagem é alterada |
| `bucketName` | `string` | `'product-images'` | Nome do bucket no Supabase |
| `folder` | `string` | `'products'` | Pasta dentro do bucket |
| `showPreview` | `boolean` | `true` | Mostrar preview da imagem |
| `showMetadata` | `boolean` | `false` | Mostrar metadados da imagem |
| `processingOptions` | `ImageProcessingOptions` | `{}` | Opções de processamento |

### 4. Opções de Processamento

```tsx
interface ImageProcessingOptions {
  maxWidth?: number;        // Largura máxima (padrão: 1200)
  maxHeight?: number;       // Altura máxima (padrão: 1200)
  quality?: number;         // Qualidade WebP 0-1 (padrão: 0.85)
  generateThumbnail?: boolean; // Gerar thumbnail (padrão: true)
  thumbnailSize?: number;   // Tamanho do thumbnail (padrão: 300)
}
```

## 🔧 Funcionalidades Técnicas

### Processamento de Imagens

1. **Validação**: Verifica tipo, tamanho e dimensões
2. **Redimensionamento**: Ajusta para as dimensões máximas
3. **Conversão WebP**: Converte para formato otimizado
4. **Compressão**: Aplica qualidade configurada
5. **Thumbnail**: Gera versão reduzida se solicitado

### Estrutura de Pastas no Storage

```
product-images/
├── products/
│   ├── image-uuid.webp
│   └── image-uuid-2.webp
├── products/thumbs/
│   ├── image-uuid.webp
│   └── image-uuid-2.webp
├── categories/
│   └── category-image.webp
└── temp/
    └── temporary-uploads.webp
```

### Políticas de Segurança

- **Leitura pública**: Qualquer pessoa pode visualizar imagens
- **Upload**: Apenas usuários autenticados
- **Exclusão**: Apenas usuários autenticados
- **Pastas permitidas**: `products`, `categories`, `temp`

## 🧹 Sistema de Limpeza

### Limpeza Manual

```sql
-- Executar no SQL Editor do Supabase
SELECT * FROM cleanup_orphaned_images();
```

### Limpeza Automática (Recomendado)

Configure um cron job no Supabase para executar diariamente:

```sql
-- Criar extensão se não existir
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agendar limpeza diária às 2:00 AM
SELECT cron.schedule(
  'cleanup-orphaned-images',
  '0 2 * * *',
  'SELECT cleanup_orphaned_images();'
);
```

## 📊 Monitoramento

### Estatísticas de Storage

```sql
-- Ver estatísticas gerais
SELECT * FROM storage_statistics;

-- Ver uso detalhado por pasta
SELECT * FROM optimize_storage_usage();

-- Ver logs de upload
SELECT * FROM storage_logs 
ORDER BY created_at DESC 
LIMIT 50;
```

## 🚨 Troubleshooting

### Erro: "Bucket não encontrado"

1. Verifique se executou o script `setup_storage_bucket.sql`
2. Confirme se o bucket `product-images` foi criado
3. Verifique as políticas de acesso

### Erro: "Permissão negada"

1. Verifique se o usuário está autenticado
2. Confirme as políticas RLS no storage
3. Verifique se a pasta está nas permitidas

### Erro: "Arquivo muito grande"

1. Limite atual: 10MB por arquivo
2. Ajuste no bucket se necessário
3. Implemente compressão adicional

### Erro: "Tipo de arquivo não suportado"

1. Tipos permitidos: JPEG, PNG, WebP, GIF
2. Verifique a extensão do arquivo
3. Confirme o MIME type

## 🔄 Atualizações Futuras

### Melhorias Planejadas

- [ ] Upload múltiplo de imagens
- [ ] Redimensionamento responsivo automático
- [ ] Integração com CDN
- [ ] Compressão avançada com diferentes qualidades
- [ ] Watermark automático
- [ ] Detecção de conteúdo inadequado

### Otimizações

- [ ] Cache de thumbnails
- [ ] Lazy loading inteligente
- [ ] Preload de imagens críticas
- [ ] Compressão progressiva

## 📝 Logs e Debugging

### Habilitar Logs Detalhados

```tsx
// No componente ImageUpload
const [debugMode, setDebugMode] = useState(true);

// Logs automáticos no console durante desenvolvimento
if (process.env.NODE_ENV === 'development') {
  console.log('Image processing:', processedImage);
  console.log('Upload progress:', uploadState.progress);
}
```

### Monitorar Performance

```tsx
// Medir tempo de processamento
const startTime = performance.now();
// ... processamento ...
const endTime = performance.now();
console.log(`Processamento levou ${endTime - startTime} ms`);
```

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique este guia primeiro
2. Consulte os logs no console do navegador
3. Verifique os logs do Supabase
4. Teste com imagens menores primeiro

**Última atualização**: Janeiro 2025
**Versão do sistema**: 1.0.0