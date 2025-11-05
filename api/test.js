// Teste simples para verificar se as funções estão funcionando
module.exports = async (req, res) => {
    console.log('🧪 Test endpoint chamado!', req.url, req.method);
    
    // Definir headers explicitamente
    if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    
    try {
        const response = {
            success: true,
            message: 'API funcionando!',
            timestamp: new Date().toISOString(),
            path: req.url,
            method: req.method,
            vercel: !!process.env.VERCEL,
            nodeVersion: process.version
        };
        
        console.log('✅ Enviando resposta:', response);
        res.status(200).json(response);
    } catch (error) {
        console.error('❌ Erro no test endpoint:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};
