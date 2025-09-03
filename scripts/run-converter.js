#!/usr/bin/env node
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
});