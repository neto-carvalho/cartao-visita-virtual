/* ==========================================================================
   LINKS.JS - Gerenciamento de links personalizados
   ========================================================================== */

// Inicializar sistema de links
document.addEventListener('DOMContentLoaded', () => {
    initializeLinks();
});

const initializeLinks = () => {
    console.log('🔗 Inicializando sistema de links...');
    
    // Carregar links existentes
    loadExistingLinks();
    
    // Configurar botão de adicionar link
    const addLinkBtn = document.querySelector('.add-link-btn');
    if (addLinkBtn) {
        addLinkBtn.addEventListener('click', addLinkItem);
    }

    // Delegação: qualquer alteração em inputs/seletores atualiza o estado e o preview
    const linksContainer = document.querySelector('.links-container');
    if (linksContainer && !linksContainer.__linksDelegationBound) {
        const handler = () => {
            updateLinksArray();
            if (typeof updatePreview === 'function') updatePreview();
        };
        linksContainer.addEventListener('input', handler, true);
        linksContainer.addEventListener('change', handler, true);
        linksContainer.__linksDelegationBound = true;
    }
    
    console.log('✅ Sistema de links inicializado');
};

// Carregar links existentes
const loadExistingLinks = () => {
    const linksContainer = document.querySelector('.links-container');
    if (!linksContainer) return;

    // Limpar container
    linksContainer.innerHTML = '';

    // Adicionar links existentes
    if (Array.isArray(appState.links) && appState.links.length > 0) {
        appState.links.forEach((link, index) => {
            addLinkItem(link, index);
        });
    } else {
        // Não criar item vazio automaticamente quando editando um cartão
        // Apenas exiba vazio se realmente não houver links
        // addLinkItem();
    }
};

// Adicionar novo item de link
const addLinkItem = (linkData = null, index = null) => {
    const linksContainer = document.querySelector('.links-container');
    if (!linksContainer) return;

    const linkItem = document.createElement('div');
    linkItem.className = 'link-item';
    linkItem.innerHTML = `
        <div class="link-header">
            <select class="link-type">
                <option value="">Selecione o tipo</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="telegram">Telegram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter</option>
                <option value="facebook">Facebook</option>
                <option value="shop">Loja/Produtos</option>
                <option value="portfolio">Portfólio</option>
                <option value="website">Website</option>
                <option value="custom">Personalizado</option>
            </select>
            <button class="remove-link" type="button" onclick="removeLinkItem(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="link-content">
            <input type="text" class="link-title" placeholder="Título do link (ex: Meu Instagram)">
            <input type="url" class="link-url" placeholder="https://...">
            <div class="link-color">
                <label>Cor do botão:</label>
                <input type="color" class="link-button-color" value="#00BFFF">
            </div>
        </div>
    `;

    // Se há dados existentes, preencher os campos
    if (linkData) {
        const typeSelect = linkItem.querySelector('.link-type');
        const titleInput = linkItem.querySelector('.link-title');
        const urlInput = linkItem.querySelector('.link-url');
        const colorInput = linkItem.querySelector('.link-button-color');

        if (typeSelect) typeSelect.value = linkData.type || '';
        if (titleInput) titleInput.value = linkData.title || '';
        if (urlInput) urlInput.value = linkData.url || '';
        if (colorInput) colorInput.value = linkData.color || '#00BFFF';
    }

    // Adicionar event listeners
    addLinkEventListeners(linkItem);

    // Adicionar ao container
    linksContainer.appendChild(linkItem);

    // Se não há dados, focar no primeiro campo
    if (!linkData) {
        const firstSelect = linkItem.querySelector('.link-type');
        if (firstSelect) firstSelect.focus();
    }
};

// Adicionar event listeners a um item de link
const addLinkEventListeners = (linkItem) => {
    const typeSelect = linkItem.querySelector('.link-type');
    const titleInput = linkItem.querySelector('.link-title');
    const urlInput = linkItem.querySelector('.link-url');
    const colorInput = linkItem.querySelector('.link-button-color');

    // Auto-preenchimento baseado no tipo
    if (typeSelect) {
        typeSelect.addEventListener('change', (e) => {
            const type = e.target.value;
            const titleInput = linkItem.querySelector('.link-title');
            const urlInput = linkItem.querySelector('.link-url');

            // Preencher título automaticamente
            if (titleInput && !titleInput.value) {
                const titles = {
                    instagram: 'Meu Instagram',
                    tiktok: 'Meu TikTok',
                    youtube: 'Meu YouTube',
                    whatsapp: 'WhatsApp',
                    telegram: 'Telegram',
                    linkedin: 'LinkedIn',
                    twitter: 'Twitter',
                    facebook: 'Facebook',
                    shop: 'Minha Loja',
                    portfolio: 'Meu Portfólio',
                    website: 'Meu Website',
                    custom: 'Link Personalizado'
                };
                titleInput.value = titles[type] || '';
            }

            // Preencher URL baseada no tipo
            if (urlInput && !urlInput.value) {
                const urlPlaceholders = {
                    instagram: 'https://instagram.com/seuusuario',
                    tiktok: 'https://tiktok.com/@seuusuario',
                    youtube: 'https://youtube.com/@seuusuario',
                    whatsapp: 'https://wa.me/5511999999999',
                    telegram: 'https://t.me/seuusuario',
                    linkedin: 'https://linkedin.com/in/seuusuario',
                    twitter: 'https://twitter.com/seuusuario',
                    facebook: 'https://facebook.com/seuusuario',
                    shop: 'https://suastore.com',
                    portfolio: 'https://seuportfolio.com',
                    website: 'https://seuwebsite.com',
                    custom: 'https://...'
                };
                urlInput.placeholder = urlPlaceholders[type] || 'https://...';
            }

            updateLinksArray();
        });
    }

    // Atualizar array quando campos mudarem
    [titleInput, urlInput, colorInput].forEach(input => {
        if (input) {
            input.addEventListener('input', updateLinksArray);
        }
    });
};

// Atualizar array de links
const updateLinksArray = () => {
    const linkItems = document.querySelectorAll('.links-container .link-item, #linksContainer .link-item');
    const links = [];

    linkItems.forEach(item => {
        const type = item.querySelector('.link-type')?.value || 'custom';
        const title = item.querySelector('.link-title')?.value || '';
        const url = item.querySelector('.link-url')?.value || '';
        const color = item.querySelector('.link-button-color')?.value || (appState?.design?.primaryColor || '#00BFFF');

        // Adicionar mesmo que parcial; preview lida com placeholders
        links.push({ type, title, url, color });
    });

    // Atualizar estado
    appState.links = links;
    if (typeof Utils?.saveToStorage === 'function') {
        Utils.saveToStorage(appState);
    }

    // Atualizar preview
    if (typeof updatePreview === 'function') {
        updatePreview();
    }
};

// Remover item de link
window.removeLinkItem = (button) => {
    const linkItem = button.closest('.link-item');
    if (linkItem) {
        linkItem.remove();
        updateLinksArray();
        if (typeof Utils?.showNotification === 'function') {
            Utils.showNotification('Link removido');
        }
    }
};

// Validar links
const validateLinks = () => {
    const errors = [];
    
    appState.links.forEach((link, index) => {
        if (!link.title || link.title.trim() === '') {
            errors.push(`Link ${index + 1}: Título é obrigatório`);
        }
        
        if (!link.url || link.url.trim() === '') {
            errors.push(`Link ${index + 1}: URL é obrigatória`);
        } else if (!Utils.isValidUrl(link.url)) {
            errors.push(`Link ${index + 1}: URL inválida`);
        }
        
        if (!link.type || link.type.trim() === '') {
            errors.push(`Link ${index + 1}: Tipo é obrigatório`);
        }
    });
    
    return errors;
};

// Obter estatísticas dos links
const getLinksStats = () => {
    const stats = {
        total: appState.links.length,
        byType: {},
        hasInvalid: false
    };
    
    appState.links.forEach(link => {
        stats.byType[link.type] = (stats.byType[link.type] || 0) + 1;
        
        if (!link.title || !link.url || !link.type) {
            stats.hasInvalid = true;
        }
    });
    
    return stats;
};

// Exportar funções
window.validateLinks = validateLinks;
window.getLinksStats = getLinksStats;
