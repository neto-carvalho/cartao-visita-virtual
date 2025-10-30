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
    saveToStorage: async (data) => {
        try {
            // Otimizar dados antes de salvar (agora é assíncrono)
            const optimizedData = await Utils.optimizeDataForStorage(data);
            
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
                    // Última tentativa: limpar localStorage e salvar apenas dados essenciais
                    try {
                        console.log('🧹 Limpando localStorage completamente...');
                        localStorage.clear();
                        const minimalData = {
                            personalInfo: data.personalInfo || {},
                            design: data.design || {},
                            links: data.links || [],
                            featureSections: []
                        };
                        localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(minimalData));
                        console.log('✅ Dados mínimos salvos');
                        return true;
                    } catch (finalError) {
                        console.error('❌ Erro final ao salvar:', finalError);
                        return false;
                    }
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
    optimizeDataForStorage: async (data) => {
        const optimized = { ...data };
        
        // Comprimir imagem principal se for muito grande
        if (optimized.image && typeof optimized.image === 'string' && optimized.image.length > 30000) {
            console.log('🖼️ Imagem muito grande, comprimindo...');
            try {
                optimized.image = await Utils.compressImage(optimized.image);
                console.log('✅ Imagem principal comprimida');
            } catch (error) {
                console.warn('⚠️ Erro ao comprimir imagem principal:', error);
                // Se falhar, remover a imagem
                optimized.image = null;
            }
        }
        
        // Comprimir imagens das seções de destaque
        if (optimized.featureSections) {
            for (let i = 0; i < optimized.featureSections.length; i++) {
                const section = optimized.featureSections[i];
                if (section.image && typeof section.image === 'string' && section.image.length > 30000) {
                    console.log('🖼️ Imagem de seção muito grande, comprimindo...');
                    try {
                        optimized.featureSections[i].image = await Utils.compressImage(section.image);
                        console.log('✅ Imagem de seção comprimida');
                    } catch (error) {
                        console.warn('⚠️ Erro ao comprimir imagem de seção:', error);
                        // Se falhar, remover a imagem
                        optimized.featureSections[i].image = null;
                    }
                }
            }
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
    compressImage: (base64String, quality = 0.2) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Redimensionar mais agressivamente
                const maxWidth = 300;
                const maxHeight = 200;
                
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
                console.log(`📊 Imagem comprimida: ${base64String.length} -> ${compressedBase64.length} bytes`);
                resolve(compressedBase64);
            };
            
            img.onerror = () => {
                console.warn('⚠️ Erro ao carregar imagem para compressão');
                resolve(base64String);
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
            
            // Se estiver usando mais de 2MB, limpar dados antigos
            if (totalSize > 2 * 1024 * 1024) {
                console.log('🧹 localStorage muito cheio, limpando dados antigos...');
                
                // Manter apenas dados essenciais E dados de edição
                const essentialKeys = [
                    'virtual-cards-collection', 
                    'virtual-card-settings',
                    'editing-card-id',
                    'virtual-card-data',
                    'creating-new-card'
                ];
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
const initializeApp = async () => {
    console.log('🚀 Inicializando aplicação...');
    
    // Verificar se está editando um cartão existente ANTES de limpar
    const editingCardId = localStorage.getItem('editing-card-id');
    const cardDataBeforeClear = localStorage.getItem('virtual-card-data');
    console.log('📋 Dados ANTES de clearStorageIfNeeded:', cardDataBeforeClear ? cardDataBeforeClear.substring(0, 200) : 'null');
    
    // Limpar localStorage se necessário (mas preservar dados de edição)
    Utils.clearStorageIfNeeded();
    
    const cardDataAfterClear = localStorage.getItem('virtual-card-data');
    console.log('📋 Dados DEPOIS de clearStorageIfNeeded:', cardDataAfterClear ? cardDataAfterClear.substring(0, 200) : 'null');
    console.log('🔍 Verificando editing-card-id no app.js:', editingCardId);
    if (editingCardId) {
        console.log('📝 Modo de edição detectado para cartão:', editingCardId);
        await loadCardForEditing(editingCardId);
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
const loadCardForEditing = async (cardId) => {
    console.log('🔄 Carregando cartão para edição:', cardId);
    
    // SEMPRE buscar o cartão da API para garantir dados atualizados
    if (typeof apiService !== 'undefined' && apiService.getCard) {
        try {
            console.log('🌐 Buscando cartão na API...');
            const card = await apiService.getCard(cardId);
            console.log('✅ Cartão obtido da API:', card);
            
            // Limpar appState primeiro
            Object.keys(appState).forEach(key => {
                delete appState[key];
            });
            
            // Converter dados da API para o formato esperado
            const cardData = {
                personalInfo: {
                    fullName: card.name || '',
                    jobTitle: card.jobTitle || '',
                    description: card.description || '',
                    email: card.email || '',
                    phone: card.phone || ''
                },
                image: card.image || null,
                design: {
                    primaryColor: card.color || '#00BFFF',
                    theme: card.theme || 'modern',
                    secondaryColor: '#EEE8AA',
                    textColor: '#FFFFFF',
                    buttonTextColor: '#FFFFFF'
                },
                links: (card.links || []).map(link => ({
                    id: link._id || Math.random().toString(36).substring(7),
                    title: link.title || '',
                    url: link.url || '',
                    type: link.type || 'custom',
                    color: link.color || (card.color || '#00BFFF')
                })),
                featureSections: (card.featureSections || []).map(section => ({
                    title: section.title || '',
                    description: section.description || '',
                    image: section.image || null,
                    buttonText: section.buttonText || '',
                    buttonUrl: section.buttonUrl || ''
                }))
            };
            
            // Carregar dados no appState
            Object.assign(appState, cardData);
            console.log('✅ Dados do cartão carregados da API:', appState);
            console.log('✅ Nome após carregar:', appState.personalInfo?.fullName);
            
            // Limpar localStorage para evitar conflitos
            localStorage.removeItem('virtual-card-data');
            
            return;
        } catch (error) {
            console.error('❌ Erro ao buscar cartão da API:', error);
            console.error('❌ Tentando fallback via localStorage...');
        }
    }
    
    // Fallback: verificar localStorage (apenas se API falhar)
    const cardData = localStorage.getItem('virtual-card-data');
    if (cardData) {
        try {
            console.log('📋 Dados encontrados no localStorage (fallback)');
            const data = JSON.parse(cardData);
            
            // Limpar appState primeiro
            Object.keys(appState).forEach(key => {
                delete appState[key];
            });
            
            // Carregar dados do localStorage
            Object.assign(appState, data);
            console.log('✅ Dados carregados do localStorage (fallback):', appState);
            return;
        } catch (error) {
            console.error('❌ Erro ao carregar dados do localStorage:', error);
        }
    }
    
    console.warn('⚠️ Nenhum dado encontrado');
};

// Configurar eventos globais
const setupGlobalEvents = () => {
    // Auto-save com debounce (só salva após 5 segundos de inatividade)
    const debouncedSave = Utils.debounce(async () => {
        if (window.appState) {
            console.log('💾 Auto-save executado...');
            await Utils.saveToStorage(window.appState);
        }
    }, 5000);
    
    // Salvar quando houver mudanças no appState
    let saveTimeout;
    
    // Interceptar mudanças no appState
    const proxyAppState = new Proxy(appState, {
        set(target, property, value) {
            target[property] = value;
            
            // NÃO salvar no localStorage se estiver editando um cartão existente
            const editingCardId = localStorage.getItem('editing-card-id');
            if (editingCardId) {
                console.log('⚠️ Editando cartão existente, pulando auto-save no localStorage');
                return true;
            }
            
            // Verificar se há imagens grandes antes de salvar
            const hasLargeImages = (target.image && target.image.length > 100000) || 
                                 (target.featureSections && target.featureSections.some(section => 
                                     section.image && section.image.length > 100000));
            
            if (!hasLargeImages) {
                // Cancelar save anterior e agendar novo
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    debouncedSave();
                }, 1000);
            } else {
                console.log('⚠️ Imagens grandes detectadas, pulando auto-save');
            }
            
            return true;
        }
    });
    
    // Substituir o appState original pelo proxy
    window.appState = proxyAppState;

    // Salvar antes de sair da página
    window.addEventListener('beforeunload', async () => {
        await Utils.saveToStorage(appState);
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
