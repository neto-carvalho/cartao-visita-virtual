// Catch-all route para todas as rotas de API
// Este arquivo captura todas as requisições para /api/* que não foram capturadas por rotas específicas

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
            'http://localhost:3000',
            'http://localhost:5000',
            /\.vercel\.app$/,
            process.env.FRONTEND_URL
        ].filter(Boolean);

        if (!origin || allowedOrigins.some(allowed => {
            if (typeof allowed === 'string') return origin === allowed;
            if (allowed instanceof RegExp) return allowed.test(origin);
            return false;
        })) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});

app.use('/api/', limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

