# ⚡ Início Rápido - Sistema de Cartão Virtual

## 🚀 Iniciar o Sistema em 3 Passos

### 1️⃣ **Iniciar MongoDB** (Se ainda não estiver rodando)
- MongoDB deve estar instalado e rodando
- Verifique no Gerenciador de Tarefas se há processo `mongod.exe`

### 2️⃣ **Iniciar Backend**
- **Clique duas vezes** em `iniciar-backend.bat`
- Aguarde ver a mensagem: "✅ Conectado ao MongoDB"
- **NÃO FECHE essa janela!**

### 3️⃣ **Iniciar Frontend**
- Abra um **novo terminal**
- Execute: `npm start`
- Navegador abrirá automaticamente em `http://localhost:3000`

---

## ✅ Pronto! Sistema Funcionando

### **Como Usar:**
1. Clique em **"Entrar / Criar Conta"**
2. Crie sua conta (nome, email, senha)
3. Acesse seu perfil
4. Crie seus cartões de visita
5. Compartilhe!

---

## 👥 Múltiplos Usuários

### **Sim! É possível:**
- Cada pessoa cria sua própria conta
- Cada conta tem seus próprios cartões
- Tudo salvo no MongoDB (não no navegador)
- Várias pessoas podem usar simultaneamente

### **Como funciona:**
- Usuário 1: cria conta → login → cria cartões → logout
- Usuário 2: cria outra conta → login → cria seus cartões
- Usuário 3: e assim por diante...

---

## 🛑 Parar o Sistema

- **Backend:** Feche a janela do terminal ou clique em `parar-backend.bat`
- **Frontend:** Pressione `Ctrl + C` no terminal

---

## ❓ Problemas?

### Backend não inicia?
- Verifique se MongoDB está rodando
- Verifique se a porta 5000 está livre
- Veja os erros no terminal

### Frontend não abre?
- Verifique se a porta 3000 está livre
- Abra: `http://localhost:3000`

### Erro "Failed to fetch"?
- Backend não está rodando
- Inicie o backend primeiro!

---

**Agora é só usar! 🎉**


