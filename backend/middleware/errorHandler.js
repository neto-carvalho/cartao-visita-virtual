/**
 * Middleware global de tratamento de erros
 * Intercepta, classifica e retorna respostas padronizadas em JSON
 */
class ErrorHandler {
    /**
     * Middleware principal de tratamento de erros
     * Intercepta erros não tratados e retorna respostas padronizadas
     */
    static handle(err, req, res, next) {
        // Log do erro para debug
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        // Sanitizar mensagens de erro para não expor informações sensíveis
        let sanitizedMessage = err.message;
        
        // Remover possíveis senhas/tokens expostos acidentalmente
        sanitizedMessage = sanitizedMessage.replace(/password['":\s]*[=:]\s*[\w\s]+/gi, 'password=[REDACTED]');
        sanitizedMessage = sanitizedMessage.replace(/token['":\s]*[=:]\s*[\w\s.-]+/gi, 'token=[REDACTED]');
        sanitizedMessage = sanitizedMessage.replace(/authorization['":\s]*[=:]\s*[\w\s.-]+/gi, 'authorization=[REDACTED]');
        
        console.error('❌ Erro capturado:', {
            message: sanitizedMessage,
            name: err.name,
            url: req.url,
            method: req.method,
            timestamp: new Date().toISOString(),
            ...(isDevelopment && { stack: err.stack })
        });

        // 1. Erro de validação (Mongoose)
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Dados de entrada inválidos',
                errors: Object.values(err.errors).map(e => ({
                    field: e.path,
                    message: e.message
                })),
                ...(isDevelopment && { details: err.message })
            });
        }

        // 2. Erro de cast (ID inválido)
        if (err.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID inválido',
                field: err.path,
                ...(isDevelopment && { details: err.message })
            });
        }

        // 3. Erros de autenticação JWT
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token de autenticação inválido',
                ...(isDevelopment && { details: err.message })
            });
        }

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token de autenticação expirado',
                ...(isDevelopment && { details: err.message })
            });
        }

        // 4. Erro de duplicação (MongoDB)
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            return res.status(409).json({
                success: false,
                message: `${field} já está em uso`,
                field,
                ...(isDevelopment && { details: err.message })
            });
        }

        // 5. Erro de sintaxe JSON
        if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
            return res.status(400).json({
                success: false,
                message: 'JSON inválido no corpo da requisição',
                ...(isDevelopment && { details: err.message })
            });
        }

        // 6. Erro de limite de upload
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                success: false,
                message: 'Arquivo muito grande',
                ...(isDevelopment && { details: err.message })
            });
        }

        // 7. Erro interno do servidor (padrão)
        const statusCode = err.statusCode || err.status || 500;
        const message = err.message || 'Erro interno do servidor';

        return res.status(statusCode).json({
            success: false,
            message,
            ...(isDevelopment && {
                stack: err.stack,
                details: err.message,
                name: err.name
            })
        });
    }

    /**
     * Middleware para capturar erros assíncronos
     * Facilita o tratamento de erros em funções async
     */
    static asyncHandler(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }

    /**
     * Middleware para rotas não encontradas
     * Retorna erro 404 padronizado
     */
    static notFound(req, res, next) {
        const error = new Error(`Rota não encontrada: ${req.originalUrl}`);
        error.statusCode = 404;
        next(error);
    }
}

module.exports = ErrorHandler;






