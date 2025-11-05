// Configuração dinâmica da API baseada no ambiente
// Detecta automaticamente se está rodando no Vercel e usa a API do próprio Vercel

(function() {
    // Detectar se está rodando no Vercel
    const isVercel = typeof window !== 'undefined' && 
                     (window.location.hostname.endsWith('vercel.app') || 
                      window.location.hostname.endsWith('vercel.com'));
    
    // Se estiver no Vercel, usar a API do próprio Vercel
    // Se não, usar a URL configurada ou localhost
    let apiBaseUrl;
    
    if (isVercel) {
        // Usar a API do próprio Vercel (mesmo domínio)
        apiBaseUrl = window.location.origin;
    } else if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        // Desenvolvimento local
        apiBaseUrl = 'http://localhost:5000';
    } else {
        // Fallback: usar a URL configurada (pode ser Koyeb ou outro)
        apiBaseUrl = 'https://alleged-giralda-visitavirtual-e8216580.koyeb.app';
    }
    
    window.APP_CONFIG = {
        API_BASE_URL: apiBaseUrl
    };
    
    console.log('🔧 API Config:', {
        environment: isVercel ? 'Vercel' : 'Local/Koyeb',
        apiBaseUrl: apiBaseUrl
    });
})();
