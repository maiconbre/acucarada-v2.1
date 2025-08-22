# CI/CD Workflows

Este projeto utiliza GitHub Actions para automação de CI/CD com foco em **usabilidade** e **performance**.

## 📋 Workflows Disponíveis

### 1. Main Branch CI/CD (`main.yml`)
**Trigger:** Push e Pull Requests para `main`

**Funcionalidades:**
- ✅ Instalação de dependências com cache
- 🔍 Linting do código
- 🏗️ Build da aplicação
- 📦 Upload de artefatos
- 🚀 Deploy automático para produção (apenas em push para main)

### 2. Develop Branch CI (`develop.yml`)
**Trigger:** Push e Pull Requests para `develop`

**Funcionalidades:**
- ✅ Instalação de dependências com cache
- 🔍 Linting do código
- 🏗️ Build para desenvolvimento
- ✔️ Validação básica

### 3. Performance & Quality Check (`performance.yml`)
**Trigger:** 
- Schedule (segundas-feiras às 2h)
- Pull Requests para `main`
- Execução manual

**Funcionalidades:**
- 📊 Análise do tamanho do bundle
- 🔍 Detecção de arquivos grandes
- 📈 Relatório de performance

## 🚀 Como Usar

### Para Desenvolvedores
1. **Branch `develop`**: Faça commits normalmente - o CI validará automaticamente
2. **Branch `main`**: Pull requests acionarão validação completa + deploy
3. **Performance**: Monitore os relatórios semanais ou execute manualmente

### Configuração de Deploy
Para configurar o deploy em produção, edite a seção `deploy` em `main.yml`:

```yaml
- name: Deploy to production
  run: |
    # Substitua pelos seus comandos de deploy
    # Exemplos:
    # - Vercel: vercel --prod
    # - Netlify: netlify deploy --prod
    # - AWS S3: aws s3 sync dist/ s3://seu-bucket
```

## 🎯 Benefícios

### Usabilidade
- ✨ Workflows simples e intuitivos
- 📝 Logs claros e informativos
- 🔄 Cache automático para velocidade
- 🎛️ Execução manual disponível

### Performance
- ⚡ Cache de dependências Node.js
- 📊 Monitoramento de bundle size
- 🔍 Detecção proativa de problemas
- 📈 Relatórios regulares de performance

## 🛠️ Personalização

Para adaptar aos seus needs:
1. Ajuste as versões do Node.js conforme necessário
2. Adicione testes específicos do seu projeto
3. Configure deploy para sua plataforma preferida
4. Ajuste os schedules conforme sua necessidade

---

💡 **Dica**: Use `workflow_dispatch` para executar qualquer workflow manualmente através da interface do GitHub!