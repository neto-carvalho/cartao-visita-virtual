// Teste simples para verificar se as funções estão funcionando
module.exports = (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API funcionando!',
        timestamp: new Date().toISOString(),
        path: req.url,
        method: req.method
    });
};

