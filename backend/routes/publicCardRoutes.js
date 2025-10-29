const express = require('express');
const router = express.Router();

// Importar controller público
const publicCardController = require('../controllers/publicCardController');

// Rotas públicas (não requerem autenticação)
router.get('/:id', publicCardController.getPublicCard);              // Obter cartão por ID
router.get('/url/:publicUrl', publicCardController.getCardByPublicUrl); // Obter cartão por URL pública

module.exports = router;


