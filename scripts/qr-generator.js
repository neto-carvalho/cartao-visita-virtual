/* ==========================================================================
   QR-GENERATOR.JS - Geração e download de QR Code
   ========================================================================== */

// Inicializar gerador de QR Code
document.addEventListener('DOMContentLoaded', () => {
    initializeQRGenerator();
});

const initializeQRGenerator = () => {
    console.log('📱 Inicializando gerador de QR Code...');
    
    // Event listeners já são configurados em editor.js
    // Apenas configurar funções auxiliares aqui
    
    console.log('✅ Gerador de QR Code inicializado');
};

// Função generateCard já está definida em editor.js

// Gerar QR Code
const generateQRCode = async (url) => {
    const qrContainer = document.getElementById('qrcode');
    if (!qrContainer) return;
    
    // Limpar container
    qrContainer.innerHTML = '';
    
    // Configurações do QR Code
    const qrOptions = {
        text: url,
        width: 200,
        height: 200,
        colorDark: '#1C1C1C',
        colorLight: '#FFFFFF',
        correctLevel: QRCode.CorrectLevel.M
    };
    
    try {
        // Gerar QR Code
        const qrCode = new QRCode(qrContainer, qrOptions);
        
        // Aguardar geração
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('✅ QR Code gerado');
        
    } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        throw error;
    }
};

// Mostrar informações geradas
const showGeneratedInfo = (url) => {
    const generatedInfo = document.getElementById('generatedInfo');
    const shareUrlInput = document.getElementById('shareUrl');
    
    if (generatedInfo) {
        generatedInfo.style.display = 'block';
    }
    
    if (shareUrlInput) {
        shareUrlInput.value = url;
    }
    
    // Scroll para a seção
    generatedInfo?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
    });
};

// Baixar QR Code
const downloadQR = () => {
    const qrContainer = document.getElementById('qrcode');
    if (!qrContainer) return;
    
    const canvas = qrContainer.querySelector('canvas');
    if (!canvas) {
        Utils.showNotification('QR Code ainda não foi gerado. Clique em "Gerar Cartão" primeiro.', 'error');
        return;
    }
    
    try {
        // Criar link de download
        const link = document.createElement('a');
        link.download = 'qrcode-cartao-visita.png';
        link.href = canvas.toDataURL('image/png');
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Utils.showNotification('QR Code baixado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao baixar QR Code:', error);
        Utils.showNotification('Erro ao baixar QR Code.', 'error');
    }
};

// Copiar URL
const copyUrl = async () => {
    const shareUrlInput = document.getElementById('shareUrl');
    if (!shareUrlInput || !shareUrlInput.value) {
        Utils.showNotification('URL ainda não foi gerada.', 'error');
        return;
    }
    
    try {
        const success = await Utils.copyToClipboard(shareUrlInput.value);
        
        if (success) {
            // Feedback visual
            const copyBtn = document.getElementById('copyUrl');
            if (copyBtn) {
                const originalIcon = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                copyBtn.style.background = '#10B981';
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalIcon;
                    copyBtn.style.background = '';
                }, 2000);
            }
            
            Utils.showNotification('Link copiado para a área de transferência!');
        } else {
            // Fallback para navegadores mais antigos
            shareUrlInput.select();
            shareUrlInput.setSelectionRange(0, 99999);
            
            try {
                document.execCommand('copy');
                Utils.showNotification('Link copiado para a área de transferência!');
            } catch (fallbackError) {
                Utils.showNotification('Erro ao copiar link.', 'error');
            }
        }
        
    } catch (error) {
        console.error('Erro ao copiar URL:', error);
        Utils.showNotification('Erro ao copiar link.', 'error');
    }
};

// Compartilhar via redes sociais
const shareToSocial = (platform) => {
    const url = document.getElementById('shareUrl')?.value;
    if (!url) {
        Utils.showNotification('URL ainda não foi gerada.', 'error');
        return;
    }
    
    const { personalInfo } = window.appState || {};
    const title = `Cartão de Visita Virtual - ${personalInfo.fullName || 'Visitante'}`;
    const text = `Confira meu cartão de visita virtual!`;
    
    const shareUrls = {
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title}\n${text}\n${url}`)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };
    
    const shareUrl = shareUrls[platform];
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
};

// Gerar código para embed
const generateEmbedCode = () => {
    const url = document.getElementById('shareUrl')?.value;
    if (!url) return null;
    
    return `<iframe src="${url}" width="100%" height="600" frameborder="0"></iframe>`;
};

// Exportar funções
window.generateQRCode = generateQRCode;
window.showGeneratedInfo = showGeneratedInfo;
window.downloadQR = downloadQR;
window.copyUrl = copyUrl;
window.shareToSocial = shareToSocial;
window.generateEmbedCode = generateEmbedCode;
