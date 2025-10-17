/* ==========================================================================
   APP.JS - Configuração principal da aplicação
   ========================================================================== */

// Estado global da aplicação
const appState = {
    personalInfo: {
        fullName: '',
        jobTitle: '',
        description: '',
        email: '',
        phone: ''
    },
    design: {
        theme: 'gradient-pink',
        primaryColor: '#00BFFF',
        secondaryColor: '#EEE8AA',
        textColor: '#FFFFFF',
        buttonTextColor: '#FFFFFF',
        customGradient: null
    },
    image: null,
    links: [],
    featureSections: [], // Novas seções de destaque
    showSaveContactButton: true, // Mostrar botão "Salvar na Agenda"
    generatedUrl: null
};

// Configurações da aplicação
const CONFIG = {
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    DEFAULT_THEME: 'gradient-pink',
    LOCAL_STORAGE_KEY: 'virtual-card-data'
};

// Utilitários gerais
const Utils = {
    // Salvar dados no localStorage
    saveToStorage: (data) => {
        try {
            // Otimizar dados antes de salvar
            const optimizedData = Utils.optimizeDataForStorage(data);
            
            // Verificar se os dados cabem no localStorage
            const dataString = JSON.stringify(optimizedData);
            const dataSize = new Blob([dataString]).size;
            
            // Limite aproximado do localStorage (5MB)
            const maxSize = 5 * 1024 * 1024;
            
            if (dataSize > maxSize) {
                console.warn('⚠️ Dados muito grandes para localStorage, salvando sem imagens...');
                // Salvar sem imagens se for muito grande
                const dataWithoutImages = Utils.removeImagesFromData(optimizedData);
                localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(dataWithoutImages));
            } else {
                localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, dataString);
            }
            
            return true;
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            
            // Tentar salvar sem imagens se der erro de quota
            if (error.name === 'QuotaExceededError') {
                try {
                    console.log('🔄 Tentando salvar sem imagens...');
                    const dataWithoutImages = Utils.removeImagesFromData(data);
                    localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(dataWithoutImages));
                    console.log('✅ Dados salvos sem imagens');
                    return true;
                } catch (retryError) {
                    console.error('❌ Erro ao salvar mesmo sem imagens:', retryError);
                    return false;
                }
            }
            
            return false;
        }
    },

    // Carregar dados do localStorage
    loadFromStorage: () => {
        try {
            const data = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
            if (!data) return null;
            
            const parsedData = JSON.parse(data);
            
            // Limpar dados corrompidos
            Utils.cleanCorruptedData(parsedData);
            
            return parsedData;
        } catch (error) {
            console.error('Erro ao carregar do localStorage:', error);
            return null;
        }
    },

    // Limpar dados corrompidos
    cleanCorruptedData: (data) => {
        if (!data) return;
        
        // Limpar imagem principal se não for string
        if (data.image && typeof data.image !== 'string') {
            console.warn('🧹 Removendo imagem principal corrompida');
            delete data.image;
        }
        
        // Limpar imagens das seções de destaque se não forem strings
        if (data.featureSections && Array.isArray(data.featureSections)) {
            data.featureSections.forEach((section, index) => {
                if (section.image && typeof section.image !== 'string') {
                    console.warn(`🧹 Removendo imagem corrompida da seção ${index}`);
                    delete section.image;
                }
            });
        }
        
        return data;
    },

    // Gerar URL única para o cartão
    generateUniqueUrl: () => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `${window.location.origin}/card.html?user=${timestamp}${random}`;
    },

    // Validar email
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validar URL
    isValidUrl: (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    // Formatar telefone brasileiro
    formatPhone: (phone) => {
        const numbers = phone.replace(/\D/g, '');
        if (numbers.length === 11) {
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (numbers.length === 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return phone;
    },

    // Debounce para otimizar eventos
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Otimizar dados para armazenamento
    optimizeDataForStorage: (data) => {
        const optimized = { ...data };
        
        // Comprimir imagens se forem muito grandes (apenas se for string base64)
        if (optimized.image && typeof optimized.image === 'string' && optimized.image.length > 100000) {
            console.log('🖼️ Imagem muito grande, comprimindo...');
            // Não comprimir aqui para evitar problemas, apenas avisar
            console.warn('⚠️ Imagem muito grande, mas mantendo original para evitar erros');
        }
        
        // Comprimir imagens das seções de destaque (apenas se for string base64)
        if (optimized.featureSections) {
            optimized.featureSections = optimized.featureSections.map(section => {
                if (section.image && typeof section.image === 'string' && section.image.length > 100000) {
                    console.log('🖼️ Imagem de seção muito grande, comprimindo...');
                    // Não comprimir aqui para evitar problemas, apenas avisar
                    console.warn('⚠️ Imagem de seção muito grande, mas mantendo original para evitar erros');
                }
                return section;
            });
        }
        
        return optimized;
    },

    // Remover imagens dos dados para economizar espaço
    removeImagesFromData: (data) => {
        const dataWithoutImages = { ...data };
        
        // Remover imagem principal
        if (dataWithoutImages.image) {
            delete dataWithoutImages.image;
        }
        
        // Remover imagens das seções de destaque
        if (dataWithoutImages.featureSections) {
            dataWithoutImages.featureSections = dataWithoutImages.featureSections.map(section => {
                const sectionWithoutImage = { ...section };
                if (sectionWithoutImage.image) {
                    delete sectionWithoutImage.image;
                }
                return sectionWithoutImage;
            });
        }
        
        return dataWithoutImages;
    },

    // Comprimir imagem base64
    compressImage: (base64String, quality = 0.7) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Redimensionar se for muito grande
                const maxWidth = 800;
                const maxHeight = 600;
                
                let { width, height } = img;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                ctx.drawImage(img, 0, 0, width, height);
                
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };
            
            img.src = base64String;
        });
    },

    // Limpar localStorage quando necessário
    clearStorageIfNeeded: () => {
        try {
            // Verificar tamanho atual do localStorage
            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length;
                }
            }
            
            // Se estiver usando mais de 4MB, limpar dados antigos
            if (totalSize > 4 * 1024 * 1024) {
                console.log('🧹 localStorage muito cheio, limpando dados antigos...');
                
                // Manter apenas dados essenciais
                const essentialKeys = ['virtual-cards-collection', 'virtual-card-settings'];
                const keysToRemove = [];
                
                for (let key in localStorage) {
                    if (localStorage.hasOwnProperty(key) && !essentialKeys.includes(key)) {
                        keysToRemove.push(key);
                    }
                }
                
                keysToRemove.forEach(key => {
                    localStorage.removeItem(key);
                });
                
                console.log(`✅ Removidos ${keysToRemove.length} itens do localStorage`);
            }
        } catch (error) {
            console.error('Erro ao limpar localStorage:', error);
        }
    },

    // Mostrar notificação
    showNotification: (message, type = 'success') => {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Adicionar estilos se não existirem
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 16px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 1000;
                    animation: slideInRight 0.3s ease;
                    max-width: 300px;
                }
                .notification-success {
                    background: #10B981;
                }
                .notification-error {
                    background: #EF4444;
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        // Adicionar ao DOM
        document.body.appendChild(notification);

        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    },

    // Copiar texto para clipboard
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Erro ao copiar:', error);
            return false;
        }
    },

    // Gerar vCard (arquivo de contato)
    generateVCard: (personalInfo, image = null) => {
        const { fullName, jobTitle, email, phone } = personalInfo;
        
        let vcard = 'BEGIN:VCARD\n';
        vcard += 'VERSION:3.0\n';
        vcard += `FN:${fullName || 'Sem Nome'}\n`;
        
        if (jobTitle) {
            vcard += `TITLE:${jobTitle}\n`;
        }
        
        if (email) {
            vcard += `EMAIL;TYPE=INTERNET:${email}\n`;
        }
        
        if (phone) {
            const cleanPhone = phone.replace(/\D/g, '');
            vcard += `TEL;TYPE=CELL:+55${cleanPhone}\n`;
        }
        
        // Adicionar foto se disponível (base64)
        if (image && image.startsWith('data:image')) {
            const base64Data = image.split(',')[1];
            const imageType = image.split(';')[0].split('/')[1].toUpperCase();
            vcard += `PHOTO;ENCODING=b;TYPE=${imageType}:${base64Data}\n`;
        }
        
        vcard += 'END:VCARD';
        
        return vcard;
    },

    // Baixar vCard
    downloadVCard: (personalInfo, image = null) => {
        const vcard = Utils.generateVCard(personalInfo, image);
        const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${personalInfo.fullName || 'contato'}.vcf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        Utils.showNotification('Contato salvo com sucesso!', 'success');
    }
};

// Inicializar aplicação
const initializeApp = () => {
    console.log('🚀 Inicializando aplicação...');
    
    // Limpar localStorage se necessário
    Utils.clearStorageIfNeeded();
    
    // Verificar se está editando um cartão existente
    const editingCardId = localStorage.getItem('editing-card-id');
    if (editingCardId) {
        console.log('📝 Modo de edição detectado para cartão:', editingCardId);
        loadCardForEditing(editingCardId);
    } else {
        // Verificar se é uma nova criação (não deve carregar dados antigos)
        const isNewCard = localStorage.getItem('creating-new-card');
        if (isNewCard) {
            console.log('🆕 Criando novo cartão - mantendo campos limpos');
            localStorage.removeItem('creating-new-card');
            // Manter o estado inicial limpo
        } else {
            // Carregar dados salvos apenas se não for uma nova criação
            const savedData = Utils.loadFromStorage();
            if (savedData) {
                Object.assign(appState, savedData);
                console.log('✅ Dados carregados do localStorage');
            }
        }
    }

    // Configurar eventos globais
    setupGlobalEvents();
    
    console.log('✅ Aplicação inicializada');
};

// Carregar dados de um cartão específico para edição
const loadCardForEditing = (cardId) => {
    console.log('🔄 Carregando cartão para edição:', cardId);
    
    // Tentar carregar via CardsManager primeiro
    if (window.CardsManager) {
        const card = window.CardsManager.getCardById(cardId);
        if (card && card.data) {
            console.log('✅ Cartão encontrado via CardsManager:', card);
            Object.assign(appState, card.data);
            console.log('✅ Dados do cartão carregados no appState');
            return;
        }
    }
    
    // Fallback: tentar carregar do localStorage
    const cardData = localStorage.getItem('virtual-card-data');
    if (cardData) {
        try {
            const data = JSON.parse(cardData);
            Object.assign(appState, data);
            console.log('✅ Dados carregados do localStorage (fallback)');
        } catch (error) {
            console.error('❌ Erro ao carregar dados do cartão:', error);
        }
    }
};

// Configurar eventos globais
const setupGlobalEvents = () => {
    // Auto-save com debounce (só salva após 5 segundos de inatividade)
    const debouncedSave = Utils.debounce(() => {
        if (window.appState) {
            console.log('💾 Auto-save executado...');
            Utils.saveToStorage(window.appState);
        }
    }, 5000);
    
    // Salvar quando houver mudanças no appState
    let saveTimeout;
    
    // Interceptar mudanças no appState
    const proxyAppState = new Proxy(appState, {
        set(target, property, value) {
            target[property] = value;
            
            // Cancelar save anterior e agendar novo
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                debouncedSave();
            }, 1000);
            
            return true;
        }
    });
    
    // Substituir o appState original pelo proxy
    window.appState = proxyAppState;

    // Salvar antes de sair da página
    window.addEventListener('beforeunload', () => {
        Utils.saveToStorage(appState);
    });

    // Atualizar preview quando dados mudarem
    const updatePreviewDebounced = Utils.debounce(() => {
        if (typeof updatePreview === 'function') {
            updatePreview();
        }
    }, 300);

    // Observer para mudanças no estado
    const observer = new MutationObserver(updatePreviewDebounced);
    observer.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true
    });
};

// Função para obter ícone de rede social
const getSocialIcon = (type) => {
    const icons = {
        instagram: 'fab fa-instagram',
        tiktok: 'fab fa-tiktok',
        youtube: 'fab fa-youtube',
        whatsapp: 'fab fa-whatsapp',
        telegram: 'fab fa-telegram',
        linkedin: 'fab fa-linkedin',
        twitter: 'fab fa-twitter',
        facebook: 'fab fa-facebook',
        shop: 'fas fa-shopping-bag',
        portfolio: 'fas fa-briefcase',
        website: 'fas fa-globe',
        custom: 'fas fa-link'
    };
    return icons[type] || 'fas fa-link';
};

// Exportar para uso global
window.appState = appState;
window.CONFIG = CONFIG;
window.Utils = Utils;
window.getSocialIcon = getSocialIcon;

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
