const { API_URL, NODE_ENV } = require('../config/environment');

/**
 * Controller principal da aplicação
 */
class IndexController {
    /**
     * GET / - Status da API
     */
    async getStatus(req, res) {
        try {
            const response = {
                success: true,
                message: 'API do Cartão de Visita Virtual funcionando!',
                data: {
                    status: 'online',
                    timestamp: new Date().toISOString(),
                    environment: NODE_ENV,
                    version: '1.0.0',
                    api_url: API_URL
                }
            };

            res.status(200).json(response);
        } catch (error) {
            console.error('Erro no getStatus:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * GET /health - Health check da aplicação
     */
    async getHealth(req, res) {
        try {
            const health = {
                success: true,
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
                },
                environment: NODE_ENV,
                version: process.version
            };

            res.status(200).json(health);
        } catch (error) {
            console.error('Erro no getHealth:', error);
            res.status(500).json({
                success: false,
                status: 'unhealthy',
                message: 'Erro no health check',
                error: NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * GET /info - Informações detalhadas da API
     */
    async getInfo(req, res) {
        try {
            const info = {
                success: true,
                data: {
                    name: 'Cartão de Visita Virtual API',
                    version: '1.0.0',
                    description: 'API para gerenciamento de cartões de visita digitais',
                    author: 'Neto Carvalho',
                    repository: 'https://github.com/neto-carvalho/cartao-visita-virtual',
                    endpoints: {
                        base: '/',
                        health: '/health',
                        info: '/info',
                        cards: '/api/cards (futuro)',
                        users: '/api/users (futuro)',
                        auth: '/api/auth (futuro)'
                    },
                    features: [
                        'Criação de cartões digitais',
                        'Geração de QR codes',
                        'Compartilhamento de links',
                        'Analytics de visualizações',
                        'Sistema de usuários (futuro)',
                        'Autenticação JWT (futuro)',
                        'Upload de imagens (futuro)'
                    ],
                    technologies: [
                        'Node.js',
                        'Express.js',
                        'MongoDB (futuro)',
                        'JWT (futuro)',
                        'Multer (futuro)',
                        'Bcrypt (futuro)'
                    ],
                    status: 'Em desenvolvimento',
                    last_updated: new Date().toISOString()
                }
            };

            res.status(200).json(info);
        } catch (error) {
            console.error('Erro no getInfo:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao obter informações da API',
                error: NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = new IndexController();








