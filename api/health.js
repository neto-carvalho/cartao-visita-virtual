// Health check endpoint para Vercel
module.exports = (req, res) => {
    res.status(200).json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Cartão Virtual API'
    });
};

