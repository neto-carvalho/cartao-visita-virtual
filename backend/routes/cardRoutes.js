const express = require('express');
const router = express.Router();

// Importar controller e middleware
const cardController = require('../controllers/cardController');
const AuthMiddleware = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(AuthMiddleware.verifyToken);

// Rotas protegidas (requerem autenticação)
router.post('/', cardController.createCard);        // Criar cartão
router.get('/', cardController.getCards);           // Listar cartões do usuário
router.get('/:id', cardController.getCard);         // Obter cartão específico
router.put('/:id', cardController.updateCard);      // Atualizar cartão
router.delete('/:id', cardController.deleteCard);   // Deletar cartão

module.exports = router;


