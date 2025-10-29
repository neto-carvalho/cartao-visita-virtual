# 📘 Como Usar o Sistema - Guia Completo

## 🚀 Iniciando o Sistema

### 1. **Iniciar o Backend (Sempre fazer isso primeiro!)**

**Opção 1 - Usando o script automático:**
- Clique duas vezes no arquivo `iniciar-backend.bat`
- O backend vai rodar continuamente usando PM2
- Não feche a janela do terminal

**Opção 2 - Iniciar manualmente:**
```bash
cd backend
npm start
```

### 2. **Iniciar o Frontend**

**Opção 1 - Usando npm:**
```bash
npm start
```

**Opção 2 - Iniciar manualmente:**
```bash
npx http-server . -p 3000 -o
```

### 3. **Acessar o Sistema**

Abra o navegador e acesse:
- `http://localhost:3000` ou
- `http://127.0.0.1:3000`

---

## 👥 Usando com Múltiplos Usuários

### ✅ **O que funciona:**
- Cada usuário pode criar sua própria conta
- Cada usuário tem seu próprio perfil com seus cartões
- Os dados são salvos no MongoDB (não no localStorage do navegador)
- Vários usuários podem usar simultaneamente

### 🔄 **Fluxo de Uso:**

1. **Primeiro Usuário:**
   - Acessa `login.html`
   - Cria uma conta (ex: joao@email.com)
   - Faz login
   - Cria seus cartões
   - Faz logout

2. **Segundo Usuário:**
   - Acessa `login.html`
   - Cria outra conta (ex: maria@email.com)
   - Faz login
   - Cria seus próprios cartões
   - Os cartões são salvos separadamente

3. **Usuários Subsequentes:**
   - Seguem o mesmo processo
   - Cada um tem dados independentes

---

## 🛠️ Comandos Úteis

### **Gerenciar o Backend com PM2:**

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs backend-api

# Reiniciar
pm2 restart backend-api

# Parar
pm2 stop backend-api

# Parar e remover
pm2 delete backend-api
```

### **Parar o Backend:**
- Clique duas vezes em `parar-backend.bat`

---

## 📋 Checklist de Funcionamento

Antes de usar, verifique:

- [ ] MongoDB está rodando
- [ ] Backend está rodando na porta 5000
- [ ] Frontend está rodando na porta 3000
- [ ] Console do backend não mostra erros

---

## ❓ Solução de Problemas

### **Erro "Failed to fetch"**
- Verifique se o backend está rodando
- Verifique se a porta 5000 está livre
- Reinicie o backend: clique em `iniciar-backend.bat`

### **Erro "ERR_CONNECTION_REFUSED"**
- O backend não está rodando
- Inicie o backend antes de acessar o frontend

### **Erro de CORS**
- Verifique se o frontend está em `http://localhost:3000` ou `http://localhost:3001`
- O backend está configurado para aceitar essas origens

### **Backend reinicia sempre**
- Verifique os logs: `pm2 logs backend-api`
- Verifique se o MongoDB está rodando
- Verifique se há erros de configuração

---

## 🔐 Segurança

- **Nunca compartilhe** o arquivo `backend/config.env`
- **Use senhas fortes** ao criar contas
- O JWT tem validade de 7 dias
- Os dados são salvos no MongoDB local

---

## 📊 Arquitetura do Sistema

```
Frontend (Porta 3000)
    ↓
Backend API (Porta 5000)
    ↓
MongoDB (Porta 27017)
```

**Fluxo de Dados:**
1. Usuário acessa `login.html`
2. Faz login ou cria conta
3. Recebe um token JWT
4. Token é armazenado no localStorage
5. Todas as requisições incluem o token
6. Backend valida o token
7. Dados são salvos no MongoDB associados ao usuário

---

## 🎯 Próximos Passos

1. **Produção:** Configurar servidor de produção
2. **Email:** Configurar envio de emails
3. **Upload de Imagens:** Salvar no servidor ou cloud
4. **Deploy:** Publicar online

---

**Desenvolvido com ❤️ para facilitar o networking digital**
