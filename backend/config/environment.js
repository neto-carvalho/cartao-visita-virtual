const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

const config = {
    // Configurações do servidor
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // URLs
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    API_URL: process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`,
    
    // Banco de dados (preparado para futuras implementações)
    DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/cartao-visita-virtual',
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/cartao-visita-virtual',
    
    // JWT (preparado para autenticação)
    JWT_SECRET: process.env.JWT_SECRET || 'sua-chave-secreta-super-segura',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    
    // Upload de arquivos
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '10MB',
    UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
    
    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
    
    // Rate limiting
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 900000, // 15 minutos
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
    
    // Logs
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    
    // Email (preparado para notificações)
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT || 587,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    
    // Redis (preparado para cache)
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379'
};

// Validação de variáveis obrigatórias em produção
if (config.NODE_ENV === 'production') {
    const requiredVars = ['JWT_SECRET', 'DATABASE_URL'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.error('❌ Variáveis de ambiente obrigatórias não encontradas:', missingVars);
        process.exit(1);
    }
}

module.exports = config;
