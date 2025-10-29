const express = require('express');
const router = express.Router();

// Importar controllers
const indexController = require('../controllers/indexController');

// Rota principal
router.get('/', indexController.getStatus);

// Rota de health check
router.get('/health', indexController.getHealth);

// Rota de informações da API
router.get('/info', indexController.getInfo);

module.exports = router;








