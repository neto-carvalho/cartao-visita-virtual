# 🚀 Guia de Migração do Backend para Vercel

Este guia explica como migrar o backend do Koyeb para o Vercel Serverless Functions.

## 📋 Pré-requisitos

1. Conta no Vercel (já tem)
2. Projeto já conectado ao Vercel
3. Variáveis de ambiente do backend

## 🔧 Passos para Migração

### 1. Configurar Variáveis de Ambiente no Vercel

No painel do Vercel:

1. Vá em **Settings** → **Environment Variables**
2. Adicione todas as variáveis do arquivo `backend/config.env`:
   - `MONGO_URI` - URI de conexão do MongoDB
   - `JWT_SECRET` - Chave secreta para JWT
   - `JWT_EXPIRES_IN` - Tempo de expiração do token (opcional)
   - `NODE_ENV` - `production`
   - `FRONTEND_URL` - URL do seu frontend no Vercel

### 2. Atualizar Configuração do Frontend

Após fazer o deploy, atualize `scripts/config.js`:

```javascript
window.APP_CONFIG = {
    // Substitua pela URL do seu projeto Vercel
    API_BASE_URL: 'https://seu-projeto.vercel.app'
};
```

### 3. Fazer Deploy

1. Commit e push das alterações:
   ```bash
   git add .
   git commit -m "feat: migrar backend para Vercel Serverless Functions"
   git push origin main
   ```

2. O Vercel detectará automaticamente as mudanças e fará o deploy

### 4. Verificar Deploy

Após o deploy, teste os endpoints:

- Health: `https://seu-projeto.vercel.app/health`
- API Auth: `https://seu-projeto.vercel.app/api/auth/login`

## 📝 Notas Importantes

1. **Conexão com MongoDB**: A conexão será reutilizada entre requisições (connection pooling)
2. **Cold Start**: A primeira requisição pode ser mais lenta (~1-2s)
3. **Timeout**: Funções serverless têm timeout de 10s (Hobby) ou 60s (Pro)
4. **Limites**: Plano gratuito tem 100GB de bandwidth e 100 horas de execução/mês

## 🔍 Verificar se Funcionou

1. Acesse `https://seu-projeto.vercel.app/health`
2. Deve retornar: `{"success": true, "status": "healthy", ...}`
3. Teste login no frontend
4. Verifique os logs no Vercel Dashboard → Functions

## ⚠️ Troubleshooting

### Erro de conexão com MongoDB
- Verifique se `MONGO_URI` está configurada corretamente no Vercel
- Verifique se o IP do Vercel está na whitelist do MongoDB Atlas

### Erro de CORS
- Verifique se o domínio do frontend está permitido no CORS
- O padrão já permite `*.vercel.app`

### Timeout
- Verifique se alguma operação está demorando muito
- Considere otimizar queries ou usar Pro plan para 60s de timeout

## 🎉 Pronto!

Após seguir estes passos, seu backend estará rodando no Vercel e você não precisará mais do Koyeb!

