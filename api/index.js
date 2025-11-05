// API principal - mapeia para /api/* no Vercel
// Este arquivo é o ponto de entrada para todas as rotas da API

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Carregar variáveis de ambiente
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    try {
        dotenv.config({ path: path.join(__dirname, '../backend/config.env') });
    } catch (e) {}
}

const { NODE_ENV } = require('../backend/config/environment');
const connectDB = require('../backend/config/database');
const ErrorHandler = require('../backend/middleware/errorHandler');
const logger = require('../backend/middleware/logger');

// Importar rotas
const indexRoutes = require('../backend/routes/index');
const authRoutes = require('../backend/routes/authRoutes');
const userRoutes = require('../backend/routes/userRoutes');
const cardRoutes = require('../backend/routes/cardRoutes');
const publicCardRoutes = require('../backend/routes/publicCardRoutes');

// Criar aplicação Express
const app = express();

app.set('trust proxy', 1);

// Helmet
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

// CORS
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'http://localhost:3000',
            'http://127.0.0.1:3000'
        ];
        const allowedPatterns = [
            /^https?:\/\/([a-z0-9-]+\.)*vercel\.app$/i
        ];
        
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

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 100 : 1000,
    message: {
        success: false,
        message: 'Muitas requisições deste IP, tente novamente mais tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Middlewares
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(logger.httpLogger);

// Rotas
app.use('/', indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cards', cardRoutes);
app.use('/public/cards', publicCardRoutes);

// Error handling
app.use(ErrorHandler.notFound);
app.use(ErrorHandler.handle);

// Conexão com banco
let dbConnected = false;
const connectDatabase = async () => {
    if (!dbConnected) {
        try {
            await connectDB();
            dbConnected = true;
            logger.info('✅ Banco de dados conectado');
        } catch (error) {
            logger.error(`❌ Falha ao conectar ao banco: ${error.message}`);
        }
    }
};

// Exportar handler para Vercel
module.exports = async (req, res) => {
    try {
        await connectDatabase();
        app(req, res);
    } catch (error) {
        console.error('Erro no handler:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
};

