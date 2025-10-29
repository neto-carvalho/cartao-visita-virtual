# 🚀 Backend - Cartão de Visita Virtual

API backend para o sistema de cartões de visita virtuais, construída com Node.js e Express.

## 📁 Estrutura do Projeto

```
backend/
├── config/                 # Configurações
│   ├── environment.js     # Variáveis de ambiente
│   └── database.js        # Configuração do banco
├── routes/                # Rotas da API
│   └── index.js          # Rotas principais
├── controllers/           # Lógica das rotas
│   └── indexController.js # Controller principal
├── models/               # Esquemas de dados
│   ├── User.js          # Modelo do usuário
│   └── Card.js          # Modelo do cartão
├── middleware/           # Middlewares
│   ├── auth.js          # Autenticação
│   ├── validation.js    # Validação
│   └── errorHandler.js  # Tratamento de erros
├── utils/               # Funções auxiliares
│   ├── response.js      # Padronização de respostas
│   └── validation.js    # Esquemas de validação
├── index.js            # Arquivo principal
├── package.json        # Dependências
└── env.example         # Exemplo de variáveis
```

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados (preparado)
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação (preparado)
- **Joi** - Validação de dados
- **Bcrypt** - Hash de senhas (preparado)
- **CORS** - Cross-Origin Resource Sharing

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar variáveis conforme necessário
```

### 3. Executar em Desenvolvimento
```bash
npm run dev
```

### 4. Executar em Produção
```bash
npm start
```

## 📋 Endpoints Disponíveis

### **GET /** - Status da API
```json
{
  "success": true,
  "message": "API do Cartão de Visita Virtual funcionando!",
  "data": {
    "status": "online",
    "timestamp": "2025-10-22T20:00:00.000Z",
    "environment": "development",
    "version": "1.0.0",
    "api_url": "http://localhost:5000"
  }
}
```

### **GET /health** - Health Check
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-10-22T20:00:00.000Z",
  "uptime": 123.456,
  "memory": {
    "used": "25 MB",
    "total": "50 MB"
  },
  "environment": "development",
  "version": "v18.17.0"
}
```

### **GET /info** - Informações da API
```json
{
  "success": true,
  "data": {
    "name": "Cartão de Visita Virtual API",
    "version": "1.0.0",
    "description": "API para gerenciamento de cartões de visita digitais",
    "endpoints": {
      "base": "/",
      "health": "/health",
      "info": "/info"
    },
    "features": [
      "Criação de cartões digitais",
      "Geração de QR codes",
      "Compartilhamento de links"
    ]
  }
}
```

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `PORT` | Porta do servidor | 5000 |
| `NODE_ENV` | Ambiente | development |
| `FRONTEND_URL` | URL do frontend | http://localhost:3000 |
| `DATABASE_URL` | URL do MongoDB | mongodb://localhost:27017/cartao-visita-virtual |
| `JWT_SECRET` | Chave secreta JWT | sua-chave-secreta-super-segura |

### Banco de Dados

O projeto está preparado para MongoDB com Mongoose. Para conectar:

1. Instale o MongoDB localmente ou use MongoDB Atlas
2. Configure a `DATABASE_URL` no arquivo `.env`
3. O sistema se conectará automaticamente

## 📊 Modelos de Dados

### **User** (Usuário)
```javascript
{
  name: String,
  email: String,
  password: String,
  avatar: String,
  role: String, // 'user' | 'admin'
  isActive: Boolean,
  lastLogin: Date,
  emailVerified: Boolean
}
```

### **Card** (Cartão)
```javascript
{
  userId: ObjectId,
  name: String,
  data: {
    personalInfo: {
      fullName: String,
      jobTitle: String,
      description: String,
      email: String,
      phone: String
    },
    design: {
      theme: String,
      primaryColor: String,
      secondaryColor: String,
      textColor: String,
      textAlignment: String
    },
    image: String,
    links: [{
      title: String,
      url: String,
      type: String,
      color: String
    }],
    featureSections: [{
      title: String,
      description: String,
      image: String,
      buttonText: String,
      buttonUrl: String
    }]
  },
  isActive: Boolean,
  isFavorite: Boolean,
  views: Number,
  shares: Number,
  contacts: Number
}
```

## 🔐 Autenticação (Preparado)

O sistema está preparado para autenticação JWT:

- **POST /api/auth/register** - Registro de usuário
- **POST /api/auth/login** - Login
- **POST /api/auth/logout** - Logout
- **GET /api/auth/me** - Dados do usuário atual

## 📱 CRUD de Cartões (Preparado)

- **GET /api/cards** - Listar cartões
- **GET /api/cards/:id** - Obter cartão específico
- **POST /api/cards** - Criar cartão
- **PUT /api/cards/:id** - Atualizar cartão
- **DELETE /api/cards/:id** - Excluir cartão

## 🛡️ Middlewares

### **Autenticação**
- `AuthMiddleware.verifyToken` - Verificar JWT
- `AuthMiddleware.requireAdmin` - Requer admin
- `AuthMiddleware.requireOwnership` - Requer propriedade

### **Validação**
- `ValidationMiddleware.validate` - Validar body
- `ValidationMiddleware.validateParams` - Validar parâmetros
- `ValidationMiddleware.validateQuery` - Validar query

### **Tratamento de Erros**
- `ErrorHandler.handle` - Tratamento global
- `ErrorHandler.asyncHandler` - Capturar erros assíncronos
- `ErrorHandler.notFound` - Rota não encontrada

## 🚀 Próximos Passos

1. **Implementar autenticação JWT**
2. **Conectar ao MongoDB**
3. **Implementar CRUD de cartões**
4. **Adicionar upload de imagens**
5. **Implementar sistema de usuários**
6. **Adicionar analytics**
7. **Implementar cache com Redis**

## 📝 Scripts Disponíveis

```bash
npm start      # Executar em produção
npm run dev    # Executar em desenvolvimento
npm test       # Executar testes
npm run lint   # Linting
npm run build  # Build
```

## 🌐 URLs

- **Desenvolvimento**: http://localhost:5000
- **Produção**: Configurar conforme deploy

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para o sistema de cartões de visita virtuais**








