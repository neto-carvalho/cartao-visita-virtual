# 🚀 Guia Completo: Configurar Backend no Vercel

## 📋 Pré-requisitos

1. Conta no Vercel (já possui)
2. Projeto conectado ao GitHub
3. MongoDB Atlas configurado (já possui)

---

## 🔧 PASSO 1: Configurar Variáveis de Ambiente no Vercel

### 1.1 Acessar as Configurações do Projeto

1. Acesse: https://vercel.com/dashboard
2. Clique no seu projeto **"cartao-visita-virtual"** (ou o nome do seu projeto)
3. No menu lateral, clique em **"Settings"** (Configurações)
4. Clique em **"Environment Variables"** (Variáveis de Ambiente)

### 1.2 Adicionar as Variáveis Necessárias

Adicione **TODAS** as seguintes variáveis:

| Variável | Valor | Ambiente |
|----------|-------|----------|
| `MONGO_URI` | `mongodb+srv://netocarvalhomcpe_db_user:Biografia123.@cluster0.ccxxofx.mongodb.net/visita_virtual?retryWrites=true&w=majority&appName=Cluster0` | Production, Preview, Development |
| `JWT_SECRET` | `sua-chave-secreta-super-segura-aqui` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |
| `FRONTEND_URL` | `https://seu-projeto.vercel.app` | Production, Preview, Development |
| `DATABASE_URL` | `mongodb+srv://netocarvalhomcpe_db_user:Biografia123.@cluster0.ccxxofx.mongodb.net/visita_virtual?retryWrites=true&w=majority&appName=Cluster0` | Production, Preview, Development |
| `VERCEL` | `1` | Production, Preview, Development |

**⚠️ IMPORTANTE:**
- Substitua `https://seu-projeto.vercel.app` pelo URL real do seu projeto no Vercel
- Marque **TODAS** as opções (Production, Preview, Development) para cada variável
- Clique em **"Save"** após adicionar cada variável

---

## 🔍 PASSO 2: Verificar Estrutura do Projeto

### 2.1 Verificar se os Arquivos Estão Corretos

Certifique-se de que você tem esta estrutura:

```
projeto/
├── api/
│   ├── health.js
│   ├── index.js
│   └── test.js
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── ...
├── vercel.json
└── package.json
```

### 2.2 Verificar Conteúdo do vercel.json

O arquivo `vercel.json` deve estar assim:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/health",
      "dest": "/api/health.js"
    },
    {
      "src": "/test",
      "dest": "/api/test.js"
    },
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/public/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*\\.(html|css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))",
      "dest": "/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "functions": {
    "api/**/*.js": {
      "includeFiles": "backend/**"
    }
  }
}
```

---

## 🚀 PASSO 3: Fazer Deploy no Vercel

### 3.1 Push para o GitHub

1. Certifique-se de que todas as alterações foram commitadas:
   ```bash
   git add .
   git commit -m "Configuração para Vercel"
   git push origin main
   ```

### 3.2 Fazer Deploy no Vercel

1. Acesse o dashboard do Vercel
2. Se o projeto estiver conectado ao GitHub, o deploy será automático
3. Se não, clique em **"Deployments"** → **"Create Deployment"**
4. Aguarde o build completar (geralmente 1-3 minutos)

---

## 🔍 PASSO 4: Verificar se as Funções Foram Criadas

### 4.1 Verificar no Dashboard

1. No Vercel Dashboard, clique no último deploy
2. Role para baixo até a seção **"Functions"**
3. Você deve ver:
   - `api/health.js`
   - `api/index.js`
   - `api/test.js`

**❌ Se não aparecer nenhuma função:**
- As funções não foram detectadas
- Verifique se os arquivos estão em `api/` (não `api/` dentro de outra pasta)
- Verifique se o `vercel.json` está na raiz do projeto

---

## 🧪 PASSO 5: Testar as Rotas

### 5.1 Testar `/api/health`

1. Abra uma nova aba anônima no navegador (Ctrl + Shift + N)
2. Acesse: `https://seu-projeto.vercel.app/api/health`
3. **O que deve aparecer:**
   ```json
   {
     "success": true,
     "status": "healthy",
     "timestamp": "2023-11-04T22:25:00.000Z",
     "service": "Cartão Virtual API",
     "environment": "production",
     "vercel": true
   }
   ```

4. **Se aparecer HTML:**
   - Limpe o cache (Ctrl + Shift + Delete)
   - Tente em aba anônima
   - Verifique os logs do Vercel (veja PASSO 6)

### 5.2 Testar `/health` (via rewrite)

1. Acesse: `https://seu-projeto.vercel.app/health`
2. Deve retornar o mesmo JSON

### 5.3 Testar `/api/test`

1. Acesse: `https://seu-projeto.vercel.app/api/test`
2. Deve retornar:
   ```json
   {
     "success": true,
     "message": "API funcionando!",
     "timestamp": "2023-11-04T22:25:00.000Z",
     "path": "/api/test",
     "method": "GET"
   }
   ```

---

## 🐛 PASSO 6: Debug - Verificar Logs

### 6.1 Ver Logs em Tempo Real

1. No Vercel Dashboard, clique no último deploy
2. Clique em **"Functions"**
3. Clique em **"api/health.js"** (ou qualquer função)
4. Clique em **"View Function Logs"**
5. Tente acessar `/api/health` novamente
6. Os logs devem aparecer em tempo real

### 6.2 Verificar Erros Comuns

**Erro: "Cannot find module"**
- Verifique se todas as dependências estão no `package.json`
- Verifique se o `backend/` está incluído no `functions.includeFiles`

**Erro: "MongoDB connection failed"**
- Verifique se `MONGO_URI` está configurada corretamente
- Verifique se o MongoDB Atlas permite conexões de qualquer IP (0.0.0.0/0)

**Erro: "Function not found"**
- Verifique se os arquivos estão em `api/` (não em outra pasta)
- Verifique se o `vercel.json` está correto

---

## 🔄 PASSO 7: Resolver Problema de HTML ao Invés de JSON

### 7.1 Se Ainda Aparecer HTML

**Opção A: Limpar Cache e Forçar Redeploy**
1. No Vercel Dashboard, vá em **"Deployments"**
2. Clique nos **3 pontos** ao lado do último deploy
3. Clique em **"Redeploy"**
4. Marque **"Use existing Build Cache"** como **DESMARCADO**
5. Clique em **"Redeploy"**

**Opção B: Verificar Ordem das Rotas**
1. No `vercel.json`, as rotas de API devem estar **ANTES** das rotas de arquivos estáticos
2. A ordem atual está correta, mas se ainda não funcionar, tente remover a última rota `/(.*)` temporariamente

**Opção C: Verificar Build Output**
1. No Vercel Dashboard, clique no último deploy
2. Clique em **"Build Logs"**
3. Procure por erros relacionados a:
   - `@vercel/node`
   - `api/`
   - `builds`

---

## ✅ PASSO 8: Verificar se Está Funcionando

### 8.1 Checklist Final

- [ ] Variáveis de ambiente configuradas
- [ ] Estrutura de pastas correta (`api/`, `backend/`)
- [ ] `vercel.json` na raiz do projeto
- [ ] Funções aparecem no dashboard
- [ ] `/api/health` retorna JSON
- [ ] `/api/test` retorna JSON
- [ ] Logs não mostram erros

### 8.2 Testar Endpoints Completos

1. **Health Check:**
   ```
   GET https://seu-projeto.vercel.app/api/health
   ```

2. **Test:**
   ```
   GET https://seu-projeto.vercel.app/api/test
   ```

3. **Login (exemplo):**
   ```
   POST https://seu-projeto.vercel.app/api/auth/login
   Content-Type: application/json
   Body: { "email": "teste@teste.com", "password": "senha123" }
   ```

---

## 🆘 Solução de Problemas Adicionais

### Problema: "Function execution timed out"
- **Solução:** Aumente o timeout no `vercel.json`:
  ```json
  "functions": {
    "api/**/*.js": {
      "includeFiles": "backend/**",
      "maxDuration": 30
    }
  }
  ```

### Problema: "Module not found"
- **Solução:** Verifique se todas as dependências estão no `package.json` da raiz

### Problema: "CORS error"
- **Solução:** Verifique se `FRONTEND_URL` está configurada corretamente no Vercel

---

## 📞 Próximos Passos

Após tudo funcionar:

1. ✅ Atualizar `scripts/config.js` para usar o URL do Vercel em produção
2. ✅ Testar todas as rotas da API
3. ✅ Testar login/registro
4. ✅ Testar criação de cartões
5. ✅ Testar visualização pública de cartões

---

## 📝 Notas Importantes

- ⚠️ **NUNCA** commite o arquivo `backend/config.env` com credenciais reais
- ✅ Use variáveis de ambiente do Vercel para dados sensíveis
- ✅ O Vercel detecta automaticamente arquivos em `api/` como serverless functions
- ✅ Arquivos estáticos (HTML, CSS, JS) são servidos automaticamente
- ✅ Rotas de API têm prioridade sobre arquivos estáticos no `vercel.json`

---

**Se ainda tiver problemas, compartilhe:**
1. Screenshot dos logs do Vercel
2. Screenshot das variáveis de ambiente configuradas
3. Screenshot da seção "Functions" no deploy
4. O que aparece quando você acessa `/api/health`

