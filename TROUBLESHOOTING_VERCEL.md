# 🔧 Troubleshooting - Erros no Vercel

## Problema: 404 NOT_FOUND

Se você está recebendo erro 404, siga estes passos:

### 1. Verificar Estrutura de Arquivos

Certifique-se de que os arquivos existem:
```
api/
├── health.js    ✅
├── test.js      ✅
└── index.js     ✅
```

### 2. Testar Endpoints Diretos

Teste estes endpoints na ordem:
1. `https://seu-projeto.vercel.app/api/health` - Deve funcionar automaticamente
2. `https://seu-projeto.vercel.app/api/test` - Deve funcionar automaticamente
3. `https://seu-projeto.vercel.app/health` - Precisa de rewrite

### 3. Verificar Logs de Runtime

No Vercel Dashboard:
1. Vá em **Deployments** → Último deploy
2. Clique em **Functions** (ou **Runtime Logs**)
3. Procure por erros ao acessar os endpoints

### 4. Verificar Variáveis de Ambiente

No Vercel Dashboard:
1. **Settings** → **Environment Variables**
2. Certifique-se de que estão configuradas:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `NODE_ENV` = `production`

### 5. Testar Localmente

```bash
# Instalar Vercel CLI
npm i -g vercel

# Testar localmente
vercel dev
```

Acesse `http://localhost:3000/api/health` e veja se funciona.

## Erro: FUNCTION_INVOCATION_FAILED

Se você recebe este erro:

1. **Verifique os logs** - Veja qual linha está falhando
2. **Verifique dependências** - Certifique-se de que todas estão no `package.json`
3. **Verifique caminhos** - Os `require('../backend/...')` podem falhar

## Solução Alternativa: Usar Railway ou Render

Se o Vercel continuar dando problemas, você pode:

1. **Railway** - Plano gratuito com créditos
2. **Render** - Plano gratuito (pode "dormir" após inatividade)
3. **Fly.io** - Plano gratuito

Todos suportam Node.js/Express diretamente sem precisar de serverless functions.

