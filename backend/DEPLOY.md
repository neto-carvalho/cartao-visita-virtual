# 🚀 Guia de Deploy para Produção

Este guia explica como fazer o deploy do backend em produção usando Render, Railway ou Vercel.

## 📋 Pré-requisitos

- Conta no MongoDB Atlas (ou banco de dados MongoDB)
- Conta no provedor de deploy (Render, Railway ou Vercel)
- Node.js 14+ instalado localmente

## 🔐 Configuração de Variáveis de Ambiente

### 1. Gerar JWT_SECRET

Execute um dos comandos abaixo para gerar uma chave secreta segura:

```bash
# Opção 1: Usando OpenSSL
openssl rand -base64 32

# Opção 2: Usando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Opção 3: Online
# Acesse: https://randomkeygen.com/
```

### 2. Configurar MongoDB Atlas

1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie um cluster gratuito
3. Crie um usuário de banco de dados
4. Configure o IP Whitelist (adicione `0.0.0.0/0` para permitir qualquer IP)
5. Obtenha a connection string
6. A string deve ter o formato:
   ```
   mongodb+srv://usuario:senha@cluster.xxxxx.mongodb.net/nome-do-banco?retryWrites=true&w=majority
   ```

### 3. Arquivo .env Local

Para desenvolvimento local, copie o arquivo de exemplo:

```bash
cp env.example config.env
```

Edite o arquivo `config.env` com suas configurações:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://usuario:senha@cluster.xxxxx.mongodb.net/cartao-visita?retryWrites=true&w=majority
JWT_SECRET=sua-chave-secreta-gerada-anteriormente
JWT_EXPIRES_IN=30d
FRONTEND_URL=https://seu-frontend.vercel.app
LOG_LEVEL=info
```

---

## 🎯 Deploy no Render

### Passo a Passo

1. **Crie uma conta no [Render](https://render.com/)**

2. **Conecte seu repositório**
   - Clique em "New +" → "Web Service"
   - Conecte seu repositório GitHub/GitLab
   - Selecione o repositório do projeto

3. **Configure o serviço**
   - **Name**: `cartao-visita-virtual-api`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: deixe vazio

4. **Configure as variáveis de ambiente**
   
   Clique em "Environment" e adicione:
   
   | Chave | Valor |
   |-------|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGO_URI` | `mongodb+srv://...` (sua string de conexão) |
   | `JWT_SECRET` | `sua-chave-secreta` (gerada anteriormente) |
   | `JWT_EXPIRES_IN` | `30d` |
   | `FRONTEND_URL` | `https://seu-frontend.vercel.app` |
   | `LOG_LEVEL` | `info` |

5. **Deploy**
   - Clique em "Create Web Service"
   - O deploy será iniciado automaticamente

6. **Teste a aplicação**
   - Aguarde o deploy terminar (5-10 minutos)
   - Acesse a URL fornecida: `https://seu-app.onrender.com`
   - Teste o endpoint de health: `https://seu-app.onrender.com/health`

---

## 🚂 Deploy no Railway

### Passo a Passo

1. **Crie uma conta no [Railway](https://railway.app/)**

2. **Conecte seu repositório**
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Escolha seu repositório

3. **Configure o projeto**
   - Railway detecta automaticamente que é um projeto Node.js
   - O arquivo `railway.toml` será usado para configurações

4. **Configure as variáveis de ambiente**
   
   Clique em "Variables" e adicione:
   
   | Chave | Valor |
   |-------|-------|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | `mongodb+srv://...` |
   | `JWT_SECRET` | `sua-chave-secreta` |
   | `JWT_EXPIRES_IN` | `30d` |
   | `FRONTEND_URL` | `https://seu-frontend.vercel.app` |
   | `LOG_LEVEL` | `info` |

5. **Deploy**
   - Railway faz o deploy automaticamente
   - O processo é mais rápido que Render

6. **Configure o domínio**
   - Acesse "Settings" → "Networking"
   - Ative "Generate Domain"
   - Ou configure um domínio customizado

---

## ▼ Deploy no Vercel

### Passo a Passo

1. **Instale o Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Configure o projeto**
   - No diretório `backend`, crie `vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/index.js"
       }
     ]
   }
   ```

3. **Deploy**
   ```bash
   cd backend
   vercel
   ```

4. **Configure variáveis de ambiente**
   - Acesse o dashboard do Vercel
   - Vá em "Settings" → "Environment Variables"
   - Adicione as mesmas variáveis do Render

---

## ✅ Testando o Deploy

Após o deploy, teste os seguintes endpoints:

### 1. Health Check
```bash
curl https://seu-app.onrender.com/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "message": "API funcionando corretamente"
}
```

### 2. Testar Registro de Usuário
```bash
curl -X POST https://seu-app.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

### 3. Testar Login
```bash
curl -X POST https://seu-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

---

## 🔧 Configurações Adicionais

### Logs em Produção

- **Render**: Acesse "Logs" no dashboard
- **Railway**: Acesse "Deployments" → "View Logs"
- **Vercel**: `vercel logs`

### Domínio Customizado

1. No dashboard do provedor, vá em "Settings" → "Custom Domain"
2. Adicione seu domínio
3. Configure o DNS conforme instruções
4. Aguarde a verificação (pode levar até 24h)

### SSL/HTTPS

Todos os provedores oferecem HTTPS gratuito e automático.

---

## 🐛 Troubleshooting

### Erro de conexão com MongoDB

**Problema**: `MongooseError: Operation timeout`

**Solução**: 
- Verifique se o IP está na whitelist do MongoDB Atlas
- Confirme que a MONGO_URI está correta
- Tente adicionar `0.0.0.0/0` na whitelist

### Erro de porta

**Problema**: `Port already in use`

**Solução**: Use a variável `PORT` fornecida pelo provedor (não defina manualmente)

### Erro de CORS

**Problema**: Requisições bloqueadas pelo CORS

**Solução**: Configure `FRONTEND_URL` com a URL exata do seu frontend

---

## 📊 Monitoramento

### Recomendações

1. **Uptime Monitoring**: Use [UptimeRobot](https://uptimerobot.com/) para monitorar disponibilidade
2. **Error Tracking**: Integre [Sentry](https://sentry.io/) para rastreamento de erros
3. **Logs**: Configure logs estruturados (Winston, Pino)

---

## 🔄 Atualizações

Para atualizar o deploy:

1. Faça push das alterações para o GitHub
2. O provedor fará o rebuild automático
3. Aguarde o deploy terminar (consulte os logs)

---

## 📝 Checklist Final

- [ ] MongoDB Atlas configurado
- [ ] JWT_SECRET gerado e configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] Health check funcionando
- [ ] Testes de API realizados
- [ ] Logs verificados
- [ ] Domínio configurado (opcional)

---

## 🆘 Suporte

- **Documentação Render**: https://render.com/docs
- **Documentação Railway**: https://docs.railway.app
- **Documentação Vercel**: https://vercel.com/docs

---

## 📄 Licença

MIT


