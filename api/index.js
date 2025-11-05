// Wrapper para Vercel Serverless Functions
// Este arquivo adapta o Express app para funcionar no Vercel

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Carregar variáveis de ambiente
// No Vercel, as variáveis são injetadas automaticamente via Environment Variables
// Este dotenv.config é apenas para desenvolvimento local
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    try {
        dotenv.config({ path: path.join(__dirname, '../backend/config.env') });
    } catch (e) {
        // Ignorar erro se arquivo não existir (produção)
    }
}

// Importar configurações
const { NODE_ENV } = require('../backend/config/environment');

// Importar função de conexão com o banco de dados
const connectDB = require('../backend/config/database');

// Importar middleware de tratamento de erros
const ErrorHandler = require('../backend/middleware/errorHandler');

// Importar logger
const logger = require('../backend/middleware/logger');

// Importar rotas
const indexRoutes = require('../backend/routes/index');
const authRoutes = require('../backend/routes/authRoutes');
const userRoutes = require('../backend/routes/userRoutes');
const cardRoutes = require('../backend/routes/cardRoutes');
const publicCardRoutes = require('../backend/routes/publicCardRoutes');

// Criar aplicação Express
const app = express();

// Rodando no Vercel (atrás de proxy)
app.set('trust proxy', 1);

// ============================================
// BOAS PRÁTICAS DE SEGURANÇA
// ============================================

// 1. Helmet - Configurar cabeçalhos HTTP seguros
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// Endpoint de health aberto (sem CORS), necessário para health checks
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// 2. CORS - Configuração para Vercel
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3001'
        ];
        const allowedPatterns = [
            /^https?:\/\/([a-z0-9-]+\.)*vercel\.app$/i
        ];
        
        // Permitir requisições sem origin (health checks, servidores, Postman, etc)
        if (!origin) {
            return callback(null, true);
        }
        
        const isAllowed =
            allowedOrigins.includes(origin) ||
            allowedPatterns.some((re) => re.test(origin));

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Não permitido por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 3. Rate Limiting - Limitação de requisições para evitar abuso
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'production' ? 100 : 1000,
    message: {
        success: false,
        message: 'Muitas requisições deste IP, tente novamente mais tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Middlewares globais
// Aceitar payloads maiores (imagens base64) para criação/edição de cartões
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// 4. Middleware de logging otimizado
app.use(logger.httpLogger);

// Rotas
app.use('/', indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cards', cardRoutes);
app.use('/public/cards', publicCardRoutes);

// Middleware para rotas não encontradas
app.use(ErrorHandler.notFound);

// Middleware global de tratamento de erros
app.use(ErrorHandler.handle);

// Conectar ao banco de dados quando a função for executada pela primeira vez
let dbConnected = false;

const connectDatabase = async () => {
    if (!dbConnected) {
        try {
            await connectDB();
            dbConnected = true;
            logger.info('✅ Banco de dados conectado');
        } catch (error) {
            logger.error(`❌ Falha ao conectar ao banco de dados: ${error.message}`);
            // Não fazer exit no Vercel, apenas logar o erro
        }
    }
};

// Exportar handler para Vercel Serverless Functions
// Vercel espera um handler padrão que recebe (req, res)
module.exports = async (req, res) => {
    try {
        // Conectar ao banco antes de processar a requisição
        await connectDatabase();
        
        // Passar a requisição para o Express
        app(req, res);
    } catch (error) {
        console.error('Erro no handler:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

