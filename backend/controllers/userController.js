/**
 * Controller de usuário
 * Exemplo de rotas protegidas
 */
class UserController {
    /**
     * GET /api/users/profile - Obter perfil do usuário autenticado
     */
    async getProfile(req, res) {
        try {
            // O req.user foi adicionado pelo middleware de autenticação
            const userId = req.user.id;
            const userEmail = req.user.email;

            return res.status(200).json({
                success: true,
                message: 'Perfil obtido com sucesso',
                data: {
                    id: userId,
                    email: userEmail,
                    message: 'Você está autenticado!'
                }
            });

        } catch (error) {
            console.error('Erro ao obter perfil:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao obter perfil',
                error: error.message
            });
        }
    }

    /**
     * GET /api/users/me - Informações do usuário autenticado
     */
    async getMe(req, res) {
        try {
            return res.status(200).json({
                success: true,
                message: 'Informações do usuário',
                data: {
                    userId: req.user.id,
                    email: req.user.email,
                    authenticated: true
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao obter informações',
                error: error.message
            });
        }
    }
}

module.exports = new UserController();


