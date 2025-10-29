# 🚀 Como Iniciar o Sistema

## 📋 Passo a Passo

### 1️⃣ **Abrir Terminal 1 - Backend**

1. Abra o **CMD** ou **PowerShell**
2. Navegue até a pasta do backend:
   ```cmd
   cd C:\Users\netoc\Desktop\VisitaVirtual\backend
   ```
3. Execute:
   ```cmd
   npm start
   ```
4. **AGUARDE** até aparecer:
   ```
   ✅ Servidor rodando na porta 5000
   ✅ Conectado ao MongoDB com sucesso
   ```
5. **NÃO FECHE ESSA JANELA!**

---

### 2️⃣ **Abrir Terminal 2 - Frontend** (Opcional)

1. Abra um **SEGUNDO** CMD ou PowerShell
2. Navegue até a pasta do projeto:
   ```cmd
   cd C:\Users\netoc\Desktop\VisitaVirtual
   ```
3. Execute:
   ```cmd
   npm start
   ```
4. O navegador deve abrir automaticamente em `http://localhost:3000`

---

### 3️⃣ **Usar o Sistema**

1. Acesse: `http://localhost:3000`
2. Clique em **"Entrar / Criar Conta"**
3. Crie uma conta ou faça login
4. Comece a usar!

---

## 🔧 Alternativa Rápida (Recomendado)

### Usar os arquivos BAT:

1. **Clique duas vezes em**: `iniciar-backend.bat`
2. Aguarde o backend iniciar
3. Abra seu navegador em: `http://localhost:3000`

---

## ❌ Problemas Comuns

### "Porta 5000 em uso"
- Feche todos os terminais abertos
- Execute: `taskkill /PID [número] /F` (substitua [número] pelo PID que aparece no erro)

### "MongoDB não conectado"
- Verifique se o MongoDB está rodando
- Abra o **MongoDB Compass** para testar

### "Failed to fetch"
- O backend não está rodando
- Reinicie o backend seguindo os passos acima

---

## ✅ Checklist

- [ ] Backend rodando na porta 5000
- [ ] MongoDB conectado
- [ ] Frontend acessível em `http://localhost:3000`
- [ ] Página de login funcionando
- [ ] Consigo criar uma conta

---

**Pronto! Sistema funcionando! 🎉**


