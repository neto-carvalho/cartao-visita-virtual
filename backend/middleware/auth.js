const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/environment');
const User = require('../models/User');

/**
 * Middleware de autenticação JWT
 * Lê, valida o token e extrai informações do usuário
 */
class AuthMiddleware {
    /**
     * Verificar token JWT
     * Ler o token do cabeçalho Authorization
     * Validar o token e extrair informações do usuário
     * Bloquear acesso se token inválido ou ausente
     */
    static verifyToken(req, res, next) {
        try {
            // 1. Ler o token JWT do cabeçalho da requisição
            let token = req.header('Authorization');
            
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Token de acesso não fornecido'
                });
            }

            // Remover "Bearer " do token se presente
            token = token.replace('Bearer ', '').trim();
            
            // 2. Validar o token e extrair informações do usuário
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Adicionar informações do usuário à requisição
            req.user = decoded;
            
            // 3. Permitir o acesso (token válido)
            next();
            
        } catch (error) {
            console.error('Erro na verificação do token:', error.message);
            
            // 4. Bloquar o acesso se token inválido ou expirado
            let message = 'Token inválido ou expirado';
            
            if (error.name === 'TokenExpiredError') {
                message = 'Token expirado';
            } else if (error.name === 'JsonWebTokenError') {
                message = 'Token inválido';
            }
            
            return res.status(401).json({
                success: false,
                message
            });
        }
    }


}

module.exports = AuthMiddleware;






