// Health check endpoint simples para Vercel
// Este arquivo é automaticamente mapeado para /api/health pelo Vercel

module.exports = (req, res) => {
    res.status(200).json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Cartão Virtual API',
        environment: process.env.NODE_ENV || 'development'
    });
};
