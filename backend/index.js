const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Carregar variáveis de ambiente
dotenv.config({ path: './config.env' });

// Importar configurações
const { PORT, NODE_ENV } = require('./config/environment');

// Importar função de conexão com o banco de dados
const connectDB = require('./config/database');

// Importar middleware de tratamento de erros
const ErrorHandler = require('./middleware/errorHandler');

// Importar logger
const logger = require('./middleware/logger');

// Importar rotas
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cardRoutes = require('./routes/cardRoutes');
const publicCardRoutes = require('./routes/publicCardRoutes');

// Criar aplicação Express
const app = express();

// Rodando atrás de proxy (Koyeb/Reverse proxy): necessário para rate limit e IP correto
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

// Endpoint de health aberto (sem CORS), necessário para health checks do provedor
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// 2. CORS - Configuração restritiva, com suporte a domínios vercel.app
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
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Máximo de requisições
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
app.use('/api/users', userRoutes); // Rotas protegidas
app.use('/api/cards', cardRoutes); // Rotas protegidas de cartões
app.use('/public/cards', publicCardRoutes); // Rotas públicas de cartões

// Middleware para rotas não encontradas (deve vir antes do tratamento de erros)
app.use(ErrorHandler.notFound);

// Middleware global de tratamento de erros (deve ser o último)
app.use(ErrorHandler.handle);

// Iniciar servidor
const server = app.listen(PORT, async () => {
    logger.info(`🚀 Servidor rodando na porta ${PORT}`);
    logger.info(`🌍 Ambiente: ${NODE_ENV}`);
    logger.info(`📅 Iniciado em: ${new Date().toISOString()}`);
    
    // Conectar ao banco de dados
    try {
        await connectDB();
    } catch (error) {
        logger.error(`❌ Falha ao conectar ao banco de dados: ${error.message}`);
        process.exit(1);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('🛑 SIGTERM recebido, encerrando servidor...');
    server.close(() => {
        logger.info('✅ Servidor encerrado');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('🛑 SIGINT recebido, encerrando servidor...');
    server.close(() => {
        logger.info('✅ Servidor encerrado');
        process.exit(0);
    });
});

module.exports = app;
