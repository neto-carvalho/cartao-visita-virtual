const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/environment');

/**
 * Controller de autenticação
 */
class AuthController {
    /**
     * Registro de usuário
     * POST /api/auth/register
     */
    async register(req, res) {
        try {
            const { name, email, password } = req.body;

            // Validação de campos obrigatórios
            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome, email e senha são obrigatórios'
                });
            }

            // Verificar se usuário já existe
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email já está em uso'
                });
            }

            // Criar novo usuário (a senha será criptografada automaticamente)
            const user = await User.create({
                name,
                email,
                password
            });

            // Retornar sucesso (sem senha)
            return res.status(201).json({
                success: true,
                message: 'Usuário registrado com sucesso',
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt
                }
            });

        } catch (error) {
            console.error('Erro no registro:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao registrar usuário',
                error: error.message
            });
        }
    }

    /**
     * Login de usuário
     * POST /api/auth/login
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validação de campos obrigatórios
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email e senha são obrigatórios'
                });
            }

            // Buscar usuário por email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou senha inválidos'
                });
            }

            // Verificar senha (usa o método comparePassword do modelo)
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou senha inválidos'
                });
            }

            // Gerar token JWT
            const token = jwt.sign(
                { 
                    id: user._id,
                    email: user.email 
                },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            // Retornar sucesso com token e nome
            return res.status(200).json({
                success: true,
                message: 'Login realizado com sucesso',
                data: {
                    token,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email
                    }
                }
            });

        } catch (error) {
            console.error('Erro no login:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao fazer login',
                error: error.message
            });
        }
    }
}

module.exports = new AuthController();


