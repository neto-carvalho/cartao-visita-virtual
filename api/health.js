// Health check endpoint para Vercel
// Este arquivo DEVE retornar JSON, não HTML

module.exports = async (req, res) => {
    console.log('🔍 Health endpoint chamado!', {
        url: req.url,
        method: req.method,
        headers: req.headers
    });
    
    // FORÇAR resposta JSON - não pode ser HTML
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Verificar se é uma requisição de API (não HTML)
    const acceptHeader = req.headers.accept || '';
    if (acceptHeader.includes('text/html') && !acceptHeader.includes('application/json')) {
        console.warn('⚠️ Requisição com Accept: text/html, mas forçando JSON');
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
        
        console.log('✅ Enviando resposta JSON:', response);
        
        // Garantir que é JSON válido
        res.status(200).json(response);
        
        // Encerrar resposta explicitamente
        res.end();
    } catch (error) {
        console.error('❌ Erro no health endpoint:', error);
        if (!res.headersSent) {
            res.setHeader('Content-Type', 'application/json');
            res.status(500).json({
                success: false,
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
            res.end();
        }
    }
};
