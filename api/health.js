// Health check endpoint para Vercel
// Este arquivo é automaticamente mapeado para /api/health

module.exports = async (req, res) => {
    console.log('🔍 Health endpoint chamado!', req.url, req.method);
    
    // Definir headers explicitamente ANTES de qualquer resposta
    if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    
    try {
        const response = {
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'Cartão Virtual API',
            environment: process.env.NODE_ENV || 'development',
            vercel: !!process.env.VERCEL,
            message: 'API funcionando corretamente!',
            url: req.url,
            method: req.method
        };
        
        console.log('✅ Enviando resposta:', response);
        res.status(200).json(response);
    } catch (error) {
        console.error('❌ Erro no health endpoint:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
};
