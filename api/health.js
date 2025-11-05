// Health check endpoint para Vercel
// FORÇAR JSON - NUNCA HTML

module.exports = async (req, res) => {
    // LOGS para debug
    console.log('========== HEALTH ENDPOINT CHAMADO ==========');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    
    // FORÇAR headers JSON ANTES de qualquer coisa
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Function-Executed', 'true');
    
    // Handle OPTIONS (CORS preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
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
            method: req.method,
            nodeVersion: process.version,
            functionExecuted: true
        };
        
        console.log('✅ Enviando resposta JSON:', JSON.stringify(response, null, 2));
        
        // Garantir que é JSON válido
        res.status(200);
        res.write(JSON.stringify(response));
        res.end();
        
        console.log('✅ Resposta enviada com sucesso');
    } catch (error) {
        console.error('❌ Erro no health endpoint:', error);
        console.error('Stack:', error.stack);
        
        if (!res.headersSent) {
            res.setHeader('Content-Type', 'application/json');
            res.status(500);
            res.write(JSON.stringify({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            }));
            res.end();
        }
    }
};
