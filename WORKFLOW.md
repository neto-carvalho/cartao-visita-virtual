# 🔄 Workflow de Desenvolvimento

Este documento explica como trabalhar com o projeto utilizando Git e GitHub Pages.

## 🌿 Estrutura de Branches

### **`main`** - Branch de Produção
- ✅ Conectada ao GitHub Pages
- 🌐 Site público: https://neto-carvalho.github.io/cartao-visita-virtual/
- 🔒 Apenas código testado e estável
- 🔄 Atualiza o site automaticamente a cada push

### **`develop`** - Branch de Desenvolvimento
- 🧪 Para testes e novas funcionalidades
- 🔧 Ambiente de desenvolvimento
- 💡 Commits experimentais
- 📋 Merge para `main` quando estiver pronto

---

## 🚀 Workflow Recomendado

### **1. Desenvolver Nova Funcionalidade:**

```bash
# Mudar para branch develop
git checkout develop

# Fazer suas alterações no código
# ... editar arquivos ...

# Adicionar e commitar
git add .
git commit -m "Adicionar [nova funcionalidade]"

# Enviar para GitHub
git push
```

### **2. Testar Localmente:**

```bash
# Abrir o arquivo no navegador
# Testar todas as funcionalidades
# Corrigir bugs se necessário
```

### **3. Publicar no GitHub Pages:**

```bash
# Voltar para main
git checkout main

# Mesclar develop na main
git merge develop

# Enviar para GitHub (atualiza o site automaticamente!)
git push
```

**⏱️ Em 1-2 minutos, o site estará atualizado!**

---

## 📋 Comandos Rápidos

### Ver em qual branch você está:
```bash
git branch
```

### Trocar de branch:
```bash
# Para desenvolvimento
git checkout develop

# Para produção
git checkout main
```

### Ver status do repositório:
```bash
git status
```

### Ver histórico de commits:
```bash
git log --oneline --graph --all
```

### Desfazer alterações não commitadas:
```bash
git checkout .
```

---

## 🎯 Cenários Comuns

### **Cenário 1: Pequena Correção**
```bash
# Direto na main (se for algo simples e urgente)
git checkout main
# ... fazer correção ...
git add .
git commit -m "Corrigir bug X"
git push
# Site atualiza automaticamente!
```

### **Cenário 2: Nova Funcionalidade Grande**
```bash
# Usar develop para testar bem
git checkout develop
# ... implementar funcionalidade ...
git add .
git commit -m "Implementar funcionalidade Y"
git push

# Testar bastante em develop
# Quando estiver pronto:
git checkout main
git merge develop
git push
# Site atualiza com a nova funcionalidade!
```

### **Cenário 3: Reverter para Versão Anterior**
```bash
# Ver histórico
git log --oneline

# Reverter para commit específico
git checkout main
git revert [hash-do-commit]
git push
```

---

## ⚡ Atualização Automática do GitHub Pages

### Como funciona:
1. Você faz `git push` na branch **main**
2. GitHub detecta a mudança
3. GitHub Pages reconstrói automaticamente
4. Site atualizado em **1-2 minutos**

### Para verificar o status do deploy:
1. Vá em: https://github.com/neto-carvalho/cartao-visita-virtual
2. Clique em **Actions** (se habilitado)
3. Ou vá em **Settings** → **Pages** para ver o status

---

## 🔔 Dicas Importantes

✅ **Sempre commitar com mensagens descritivas**
```bash
# ❌ Ruim
git commit -m "update"

# ✅ Bom
git commit -m "Adicionar preview em tempo real no editor"
```

✅ **Fazer commits pequenos e frequentes**
- Melhor 5 commits pequenos que 1 commit enorme

✅ **Testar antes de fazer merge em main**
- develop é seu ambiente seguro de testes

✅ **Fazer pull antes de começar a trabalhar**
```bash
git pull
```

✅ **Ver o que mudou antes de commitar**
```bash
git diff
```

---

## 🆘 Resolução de Problemas

### "Already up to date" ao fazer merge
- Significa que não há mudanças para mesclar
- Normal se develop e main estão sincronizados

### Conflito ao fazer merge
```bash
# Resolver manualmente os conflitos nos arquivos
# Depois:
git add .
git commit -m "Resolver conflitos"
git push
```

### Esqueci em qual branch estou
```bash
git branch
# A branch com * é a atual
```

### Site não atualizou no GitHub Pages
- Aguarde 2-5 minutos
- Limpe o cache do navegador (Ctrl+Shift+R)
- Verifique em Settings → Pages se está ativo

---

## 📞 Referências Rápidas

- **Repositório**: https://github.com/neto-carvalho/cartao-visita-virtual
- **Site (GitHub Pages)**: https://neto-carvalho.github.io/cartao-visita-virtual/
- **Documentação Git**: https://git-scm.com/doc

---

**Desenvolvido com ❤️ - Workflow otimizado para desenvolvimento contínuo**

