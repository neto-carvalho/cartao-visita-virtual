// Health check endpoint para Vercel
// URL: /api/health

module.exports = async (req, res) => {
    // Definir headers explicitamente
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        res.status(200).json({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'Cartão Virtual API',
            environment: process.env.NODE_ENV || 'development',
            vercel: !!process.env.VERCEL,
            message: 'API funcionando corretamente!'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
