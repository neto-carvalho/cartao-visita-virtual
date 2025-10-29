/**
 * Middleware de logging otimizado
 * Produz logs estruturados com diferentes níveis
 */
class Logger {
    constructor() {
        this.logLevel = process.env.LOG_LEVEL || 'info';
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
    }

    shouldLog(level) {
        return this.levels[level] <= this.levels[this.logLevel];
    }

    error(message, data = {}) {
        if (this.shouldLog('error')) {
            console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, data);
        }
    }

    warn(message, data = {}) {
        if (this.shouldLog('warn')) {
            console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
        }
    }

    info(message, data = {}) {
        if (this.shouldLog('info')) {
            console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data);
        }
    }

    debug(message, data = {}) {
        if (this.shouldLog('debug')) {
            console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data);
        }
    }

    // Middleware para log de requisições HTTP
    httpLogger(req, res, next) {
        const start = Date.now();
        const logger = this; // Manter referência ao contexto
        
        res.on('finish', () => {
            const duration = Date.now() - start;
            const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
            
            if (logger.shouldLog(logLevel)) {
                const logData = {
                    method: req.method,
                    url: req.url,
                    status: res.statusCode,
                    duration: `${duration}ms`,
                    ip: req.ip || req.connection.remoteAddress
                };

                // Não logar body em requisições POST/PUT para não expor dados sensíveis
                if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
                    logger[logLevel](`${req.method} ${req.url} - ${res.statusCode}`, logData);
                } else {
                    logger[logLevel](`${req.method} ${req.url} - ${res.statusCode}`, logData);
                }
            }
        });

        next();
    }

    // Middleware para log de erros
    errorLogger(err, req, res, next) {
        const logger = this; // Manter referência ao contexto
        
        if (logger.shouldLog('error')) {
            logger.error('Unhandled error', {
                message: err.message,
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
                url: req.url,
                method: req.method
            });
        }
        
        next(err);
    }
}

// Exportar instância singleton
const logger = new Logger();

module.exports = logger;
