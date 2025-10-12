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
        buttonTextColor: '#FFFFFF'
    },
    image: null,
    links: [],
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
            localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            return false;
        }
    },

    // Carregar dados do localStorage
    loadFromStorage: () => {
        try {
            const data = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erro ao carregar do localStorage:', error);
            return null;
        }
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
    }
};

// Inicializar aplicação
const initializeApp = () => {
    console.log('🚀 Inicializando aplicação...');
    
    // Carregar dados salvos
    const savedData = Utils.loadFromStorage();
    if (savedData) {
        Object.assign(appState, savedData);
        console.log('✅ Dados carregados do localStorage');
    }

    // Configurar eventos globais
    setupGlobalEvents();
    
    console.log('✅ Aplicação inicializada');
};

// Configurar eventos globais
const setupGlobalEvents = () => {
    // Auto-save a cada 30 segundos
    setInterval(() => {
        Utils.saveToStorage(appState);
    }, 30000);

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
