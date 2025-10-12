/* ==========================================================================
   SHARE-MODAL.JS - Modal de Compartilhamento com QR Code
   ========================================================================== */

// Abrir modal de compartilhamento
window.openShareModal = (cardId) => {
    console.log('🔗 Abrindo modal de compartilhamento para:', cardId);
    
    const card = window.CardsManager.getCardById(cardId);
    if (!card) {
        console.error('❌ Cartão não encontrado:', cardId);
        return;
    }
    
    // Gerar URL correta baseada na localização atual
    const currentUrl = window.location.href;
    const baseUrl = currentUrl.includes('github.io') 
        ? 'https://neto-carvalho.github.io/cartao-visita-virtual'
        : window.location.origin;
    
    // Incluir dados essenciais do cartão na URL (sem imagem para evitar URL muito longa)
    const cardDataWithoutImage = {
        id: card.id,
        name: card.name,
        data: {
            ...card.data,
            image: null // Remover imagem da URL para evitar URL muito longa
        }
    };
    
    const cardData = encodeURIComponent(JSON.stringify(cardDataWithoutImage));
    
    const shareUrl = `${baseUrl}/view-card.html?id=${cardId}&data=${cardData}`;
    console.log('🌐 URL de compartilhamento gerada:', shareUrl);
    
    // Criar modal
    const modal = createShareModal(card, shareUrl);
    document.body.appendChild(modal);
    
    // Gerar QR Code com delay para garantir que a biblioteca esteja carregada
    setTimeout(() => {
        // Verificar se QRCode está disponível, se não, tentar novamente
        if (typeof QRCode === 'undefined') {
            console.log('⏳ QRCode ainda não carregado, tentando novamente...');
            setTimeout(() => generateQRCode(shareUrl), 500);
        } else {
            generateQRCode(shareUrl);
        }
    }, 100);
    
    // Animar entrada
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
        modal.querySelector('.share-modal-content').style.transform = 'scale(1)';
    });
};

const createShareModal = (card, shareUrl) => {
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
        padding: 1rem;
    `;
    
    modal.innerHTML = `
        <div class="share-modal-content" style="
            background: white;
            border-radius: 1.5rem;
            max-width: 500px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        ">
            <div style="padding: 2rem;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="font-size: 1.5rem; font-weight: 700; color: #111827;">
                        <i class="fas fa-share-alt" style="color: #3B82F6; margin-right: 0.5rem;"></i>
                        Compartilhar Cartão
                    </h2>
                    <button onclick="closeShareModal()" style="
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        border: none;
                        background: #F3F4F6;
                        color: #6B7280;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1.25rem;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='#E5E7EB'" onmouseout="this.style.background='#F3F4F6'">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Card Info -->
                <div style="
                    background: linear-gradient(135deg, #3B82F6, #8B5CF6);
                    color: white;
                    padding: 1.5rem;
                    border-radius: 1rem;
                    margin-bottom: 1.5rem;
                ">
                    <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.25rem;">${card.name}</h3>
                    <p style="opacity: 0.9; font-size: 0.875rem;">${card.data?.personalInfo?.fullName || 'Cartão Virtual'}</p>
                </div>
                
                <!-- QR Code -->
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="
                        background: white;
                        padding: 1.5rem;
                        border-radius: 1rem;
                        border: 2px dashed #E5E7EB;
                        display: inline-block;
                    ">
                        <div id="qrcode-container"></div>
                        <p style="margin-top: 1rem; color: #6B7280; font-size: 0.875rem;">
                            Escaneie para visualizar
                        </p>
                    </div>
                </div>
                
                <!-- Link to Share -->
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151; font-size: 0.875rem;">
                        Link do Cartão
                    </label>
                    <div style="display: flex; gap: 0.5rem;">
                        <input 
                            type="text" 
                            value="${shareUrl}" 
                            readonly 
                            id="shareUrlInput"
                            style="
                                flex: 1;
                                padding: 0.75rem;
                                border: 1px solid #D1D5DB;
                                border-radius: 0.5rem;
                                font-size: 0.875rem;
                                color: #6B7280;
                                background: #F9FAFB;
                            "
                        />
                        <button onclick="copyShareLink()" style="
                            padding: 0.75rem 1.25rem;
                            background: #3B82F6;
                            color: white;
                            border: none;
                            border-radius: 0.5rem;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            white-space: nowrap;
                        " onmouseover="this.style.background='#2563EB'" onmouseout="this.style.background='#3B82F6'">
                            <i class="fas fa-copy"></i> Copiar
                        </button>
                    </div>
                </div>
                
                <!-- Social Share -->
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-weight: 600; margin-bottom: 0.75rem; color: #374151; font-size: 0.875rem;">
                        Compartilhar via
                    </label>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem;">
                        <button onclick="shareViaWhatsApp('${shareUrl}', '${card.name}')" style="
                            padding: 1rem;
                            border: 1px solid #E5E7EB;
                            border-radius: 0.75rem;
                            background: white;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 0.5rem;
                        " onmouseover="this.style.borderColor='#25D366'; this.style.background='rgba(37,211,102,0.1)'" onmouseout="this.style.borderColor='#E5E7EB'; this.style.background='white'">
                            <i class="fab fa-whatsapp" style="font-size: 1.5rem; color: #25D366;"></i>
                            <span style="font-size: 0.75rem; color: #6B7280;">WhatsApp</span>
                        </button>
                        
                        <button onclick="shareViaEmail('${shareUrl}', '${card.name}')" style="
                            padding: 1rem;
                            border: 1px solid #E5E7EB;
                            border-radius: 0.75rem;
                            background: white;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 0.5rem;
                        " onmouseover="this.style.borderColor='#3B82F6'; this.style.background='rgba(59,130,246,0.1)'" onmouseout="this.style.borderColor='#E5E7EB'; this.style.background='white'">
                            <i class="fas fa-envelope" style="font-size: 1.5rem; color: #3B82F6;"></i>
                            <span style="font-size: 0.75rem; color: #6B7280;">E-mail</span>
                        </button>
                        
                        <button onclick="shareViaTelegram('${shareUrl}', '${card.name}')" style="
                            padding: 1rem;
                            border: 1px solid #E5E7EB;
                            border-radius: 0.75rem;
                            background: white;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 0.5rem;
                        " onmouseover="this.style.borderColor='#0088CC'; this.style.background='rgba(0,136,204,0.1)'" onmouseout="this.style.borderColor='#E5E7EB'; this.style.background='white'">
                            <i class="fab fa-telegram" style="font-size: 1.5rem; color: #0088CC;"></i>
                            <span style="font-size: 0.75rem; color: #6B7280;">Telegram</span>
                        </button>
                        
                        <button onclick="downloadQRCode()" style="
                            padding: 1rem;
                            border: 1px solid #E5E7EB;
                            border-radius: 0.75rem;
                            background: white;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 0.5rem;
                        " onmouseover="this.style.borderColor='#8B5CF6'; this.style.background='rgba(139,92,246,0.1)'" onmouseout="this.style.borderColor='#E5E7EB'; this.style.background='white'">
                            <i class="fas fa-download" style="font-size: 1.5rem; color: #8B5CF6;"></i>
                            <span style="font-size: 0.75rem; color: #6B7280;">Baixar QR</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Fechar ao clicar no overlay
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeShareModal();
        }
    });
    
    return modal;
};

// Gerar QR Code usando canvas (funciona offline e não é bloqueado por AdBlock)
const generateQRCode = (url) => {
    console.log('📱 Gerando QR Code para URL:', url);
    
    const container = document.getElementById('qrcode-container');
    if (!container) {
        console.error('❌ Container qrcode-container não encontrado');
        return;
    }
    
    container.innerHTML = '<div style="text-align: center; padding: 1rem;"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #3b82f6;"></i><br/><small>Gerando...</small></div>';
    
    try {
        // Verificar se a biblioteca QRCode está disponível
        if (typeof QRCode === 'undefined') {
            console.error('❌ Biblioteca QRCode não carregada');
            
            // Fallback: usar API como segunda opção
            console.log('🔄 Tentando API como fallback...');
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
            
            const img = document.createElement('img');
            img.src = qrApiUrl;
            img.alt = 'QR Code';
            img.style.cssText = 'width: 200px; height: 200px; border-radius: 0.5rem; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
            img.title = 'Clique para testar o QR Code';
            
            img.onload = () => {
                console.log('✅ QR Code gerado com sucesso via API (fallback)');
                container.innerHTML = '';
                container.appendChild(img);
                img.addEventListener('click', () => window.open(url, '_blank'));
            };
            
            img.onerror = () => {
                console.error('❌ API também falhou (bloqueador de anúncios?)');
                container.innerHTML = `
                    <div style="width: 200px; height: 200px; background: #FEF9E6; border: 2px solid #FCD34D; border-radius: 0.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #92400E; text-align: center; padding: 1rem;">
                        <i class="fas fa-shield-alt" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                        <strong>Bloqueador Ativo</strong>
                        <small style="margin-top: 0.5rem;">Desabilite o AdBlock para ver o QR Code</small>
                        <button onclick="window.open('${url}', '_blank')" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                            Abrir Link
                        </button>
                    </div>
                `;
            };
            return;
        }
        
        console.log('✅ Biblioteca QRCode disponível, gerando...');
        
        // Limpar container e criar canvas
        container.innerHTML = '';
        
        // Criar QR Code usando canvas
        new QRCode(container, {
            text: url,
            width: 200,
            height: 200,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
        });
        
        console.log('✅ QR Code gerado com sucesso via biblioteca local');
        
        // Adicionar estilo e clique ao canvas
        setTimeout(() => {
            const canvas = container.querySelector('canvas');
            const img = container.querySelector('img');
            
            if (canvas) {
                canvas.style.cssText = 'border-radius: 0.5rem; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
                canvas.title = 'Clique para testar o QR Code';
                canvas.addEventListener('click', () => {
                    console.log('🔍 Testando QR Code - abrindo URL:', url);
                    window.open(url, '_blank');
                });
            }
            
            if (img) {
                img.style.cssText = 'border-radius: 0.5rem; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: none;';
            }
        }, 100);
        
    } catch (error) {
        console.error('❌ Erro ao gerar QR Code:', error);
        container.innerHTML = `
            <div style="width: 200px; height: 200px; background: #FEF2F2; border: 2px solid #FECACA; border-radius: 0.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #DC2626; text-align: center; padding: 1rem;">
                <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                <strong>Erro ao gerar</strong>
                <button onclick="window.open('${url}', '_blank')" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                    Abrir Link
                </button>
            </div>
        `;
    }
};

// Fechar modal
window.closeShareModal = () => {
    const modal = document.querySelector('.share-modal');
    if (modal) {
        modal.style.opacity = '0';
        modal.querySelector('.share-modal-content').style.transform = 'scale(0.9)';
        setTimeout(() => modal.remove(), 300);
    }
};

// Copiar link
window.copyShareLink = () => {
    const input = document.getElementById('shareUrlInput');
    if (input) {
        input.select();
        document.execCommand('copy');
        
        // Feedback visual
        const btn = event.target.closest('button');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        btn.style.background = '#10B981';
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '#3B82F6';
        }, 2000);
    }
};

// Compartilhar via WhatsApp
window.shareViaWhatsApp = (url, cardName) => {
    console.log('📱 Compartilhando via WhatsApp:', url);
    const text = `Confira meu cartão de visita digital: ${cardName}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`;
    window.open(whatsappUrl, '_blank');
};

// Compartilhar via E-mail
window.shareViaEmail = (url, cardName) => {
    console.log('📧 Compartilhando via Email:', url);
    const subject = `Cartão de Visita Digital - ${cardName}`;
    const body = `Olá!\n\nGostaria de compartilhar meu cartão de visita digital com você.\n\nAcesse: ${url}\n\nAtenciosamente`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
};

// Compartilhar via Telegram
window.shareViaTelegram = (url, cardName) => {
    console.log('📨 Compartilhando via Telegram:', url);
    const text = `Confira meu cartão de visita digital: ${cardName}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank');
};

// Baixar QR Code
window.downloadQRCode = () => {
    const canvas = document.querySelector('#qrcode-container canvas');
    if (canvas) {
        const link = document.createElement('a');
        link.download = 'qrcode-cartao.png';
        link.href = canvas.toDataURL();
        link.click();
    } else {
        alert('QR Code não disponível para download.');
    }
};

console.log('✅ Modal de compartilhamento inicializado');

