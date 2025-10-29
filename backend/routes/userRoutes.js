const express = require('express');
const router = express.Router();

// Importar controller e middleware
const userController = require('../controllers/userController');
const AuthMiddleware = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas
// Isso bloqueia acesso se o token for inválido ou ausente
router.use(AuthMiddleware.verifyToken);

// Rotas protegidas (requerem autenticação)
router.get('/profile', userController.getProfile);
router.get('/me', userController.getMe);

module.exports = router;


