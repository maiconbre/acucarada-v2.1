/**
 * Script de configuração para o conversor de imagens WebP
 * Verifica dependências e configura o ambiente para execução
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ConverterSetup {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.envFile = path.join(this.projectRoot, '.env.local');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  checkNodeVersion() {
    this.log('Verificando versão do Node.js...');
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 16) {
      throw new Error(`Node.js 16+ é necessário. Versão atual: ${nodeVersion}`);
    }
    
    this.log(`Node.js ${nodeVersion} ✓`, 'success');
  }

  checkPackageJson() {
    this.log('Verificando package.json...');
    const packagePath = path.join(this.projectRoot, 'package.json');
    
    if (!fs.existsSync(packagePath)) {
      throw new Error('package.json não encontrado');
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Verificar dependências necessárias
    const requiredDeps = {
      '@supabase/supabase-js': 'Supabase client',
      'node-fetch': 'HTTP requests',
      'typescript': 'TypeScript support',
      'ts-node': 'TypeScript execution',
      'sharp': 'Image processing library',
      'dotenv': 'Environment variables loader'
    };
    
    const missingDeps = [];
    
    for (const [dep, description] of Object.entries(requiredDeps)) {
      if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]) {
        missingDeps.push({ dep, description });
      }
    }
    
    if (missingDeps.length > 0) {
      this.log('Dependências faltando:', 'warning');
      missingDeps.forEach(({ dep, description }) => {
        this.log(`  - ${dep} (${description})`, 'warning');
      });
      
      this.log('Instalando dependências faltando...');
      const depsToInstall = missingDeps.map(({ dep }) => dep).join(' ');
      
      try {
        execSync(`npm install ${depsToInstall}`, { 
          cwd: this.projectRoot,
          stdio: 'inherit'
        });
        this.log('Dependências instaladas com sucesso!', 'success');
      } catch (error) {
        throw new Error(`Erro ao instalar dependências: ${error.message}`);
      }
    } else {
      this.log('Todas as dependências estão instaladas ✓', 'success');
    }
  }

  checkEnvironmentVariables() {
    this.log('Verificando variáveis de ambiente...');
    
    const requiredVars = {
      'NEXT_PUBLIC_SUPABASE_URL': 'URL do projeto Supabase',
      'SUPABASE_SERVICE_ROLE_KEY': 'Chave de serviço do Supabase (com permissões de admin)'
    };
    
    const missingVars = [];
    
    // Verificar se existe arquivo .env.local
    if (fs.existsSync(this.envFile)) {
      const envContent = fs.readFileSync(this.envFile, 'utf8');
      
      // Carregar variáveis manualmente do arquivo .env.local
      const envLines = envContent.split('\n');
      envLines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          const value = valueParts.join('=').trim();
          if (key && value) {
            process.env[key.trim()] = value;
          }
        }
      });
      
      for (const [varName, description] of Object.entries(requiredVars)) {
        if (!process.env[varName] || process.env[varName].trim() === '') {
          missingVars.push({ varName, description });
        }
      }
    } else {
      this.log('Arquivo .env.local não encontrado', 'warning');
      missingVars.push(...Object.entries(requiredVars).map(([varName, description]) => ({ varName, description })));
    }
    
    if (missingVars.length > 0) {
      this.log('Variáveis de ambiente faltando:', 'error');
      missingVars.forEach(({ varName, description }) => {
        this.log(`  - ${varName}: ${description}`, 'error');
      });
      
      this.log('\n📝 Para configurar as variáveis de ambiente:');
      this.log('1. Acesse o painel do Supabase (https://supabase.com/dashboard)');
      this.log('2. Vá em Settings > API');
      this.log('3. Copie a URL do projeto e a chave de serviço');
      this.log('4. Adicione as variáveis no arquivo .env.local:');
      this.log('');
      this.log('NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui');
      this.log('SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_aqui');
      this.log('');
      
      throw new Error('Configure as variáveis de ambiente antes de continuar');
    }
    
    this.log('Variáveis de ambiente configuradas ✓', 'success');
  }

  checkSupabaseBuckets() {
    this.log('Verificando configuração dos buckets do Supabase...');
    
    const bucketsInfo = [
      {
        name: 'product-images',
        description: 'Bucket para imagens de produtos',
        folders: ['products', 'products/thumbs', 'backup']
      },
      {
        name: 'product-flavor-images',
        description: 'Bucket para imagens de sabores',
        folders: ['flavors', 'flavors/thumbs', 'backup']
      }
    ];
    
    this.log('\n📦 Buckets necessários:');
    bucketsInfo.forEach(bucket => {
      this.log(`  - ${bucket.name}: ${bucket.description}`);
      bucket.folders.forEach(folder => {
        this.log(`    └── ${folder}/`);
      });
    });
    
    this.log('\n⚠️  Certifique-se de que os buckets existem e têm as políticas corretas:', 'warning');
    this.log('   - Leitura pública habilitada');
    this.log('   - Upload/Update/Delete para usuários autenticados');
  }

  createRunScript() {
    this.log('Criando script de execução...');
    
    const runScriptContent = `#!/usr/bin/env node
/**
 * Script para executar o conversor de imagens WebP
 */

const { spawn } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, 'convert-images-to-webp.ts');

console.log('🚀 Iniciando conversão de imagens para WebP...');
console.log('📄 Script:', scriptPath);
console.log('');

const child = spawn('npx', ['ts-node', scriptPath], {
  stdio: 'inherit',
  cwd: path.dirname(__dirname)
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('\n🎉 Conversão concluída com sucesso!');
  } else {
    console.log('\n💥 Conversão falhou com código:', code);
    process.exit(code);
  }
});

child.on('error', (error) => {
  console.error('💥 Erro ao executar script:', error);
  process.exit(1);
});`;
    
    const runScriptPath = path.join(__dirname, 'run-converter.js');
    fs.writeFileSync(runScriptPath, runScriptContent);
    
    // Tornar executável no Unix
    if (process.platform !== 'win32') {
      try {
        execSync(`chmod +x "${runScriptPath}"`);
      } catch (error) {
        // Ignorar erro no Windows
      }
    }
    
    this.log(`Script de execução criado: ${runScriptPath}`, 'success');
  }

  addPackageScripts() {
    this.log('Adicionando scripts ao package.json...');
    
    const packagePath = path.join(this.projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    const newScripts = {
      'convert:images': 'node scripts/run-converter.js',
      'convert:setup': 'node scripts/setup-image-converter.js'
    };
    
    let scriptsAdded = false;
    for (const [scriptName, scriptCommand] of Object.entries(newScripts)) {
      if (!packageJson.scripts[scriptName]) {
        packageJson.scripts[scriptName] = scriptCommand;
        scriptsAdded = true;
        this.log(`  + ${scriptName}: ${scriptCommand}`);
      }
    }
    
    if (scriptsAdded) {
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      this.log('Scripts adicionados ao package.json ✓', 'success');
    } else {
      this.log('Scripts já existem no package.json ✓', 'success');
    }
  }

  printUsageInstructions() {
    this.log('\n📚 INSTRUÇÕES DE USO:', 'success');
    this.log('');
    this.log('1. Para executar a conversão:');
    this.log('   npm run convert:images');
    this.log('');
    this.log('2. Para executar este setup novamente:');
    this.log('   npm run convert:setup');
    this.log('');
    this.log('3. Execução direta:');
    this.log('   node scripts/run-converter.js');
    this.log('');
    this.log('⚠️  IMPORTANTE:');
    this.log('   - Faça backup do banco de dados antes da conversão');
    this.log('   - Teste em ambiente de desenvolvimento primeiro');
    this.log('   - O script criará backups automáticos das imagens originais');
    this.log('   - Monitore os logs durante a execução');
    this.log('');
  }

  async run() {
    try {
      this.log('🔧 Configurando conversor de imagens WebP...', 'info');
      this.log('');
      
      this.checkNodeVersion();
      this.checkPackageJson();
      this.checkEnvironmentVariables();
      this.checkSupabaseBuckets();
      this.createRunScript();
      this.addPackageScripts();
      
      this.log('');
      this.log('✅ Configuração concluída com sucesso!', 'success');
      
      this.printUsageInstructions();
      
    } catch (error) {
      this.log(`Erro na configuração: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Executar configuração
if (require.main === module) {
  const setup = new ConverterSetup();
  setup.run();
}

module.exports = { ConverterSetup };