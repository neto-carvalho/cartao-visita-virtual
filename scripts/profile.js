/* ==========================================================================
   PROFILE.JS - Lógica da Interface de Perfil
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initializeProfile();
});

const initializeProfile = () => {
    console.log('👤 Inicializando perfil...');
    
    loadUserInfo();
    loadStats();
    loadCards();
    initializeSearch();
    initializeFilters();
    initializeMobileMenu();
    
    console.log('✅ Perfil inicializado');
};

// ========== CARREGAR INFORMAÇÕES DO USUÁRIO ==========
const loadUserInfo = () => {
    const user = CardsManager.getUser();
    
    // Atualizar avatar
    const avatarEl = document.querySelector('.user-avatar');
    if (avatarEl) {
        if (user.avatar) {
            avatarEl.innerHTML = `<img src="${user.avatar}" alt="${user.name}">`;
        } else {
            const initials = user.name.split(' ').map(n => n[0]).join('').substr(0, 2).toUpperCase();
            avatarEl.textContent = initials;
        }
    }
    
    // Atualizar nome
    const nameEl = document.querySelector('.user-name');
    if (nameEl) nameEl.textContent = user.name;
    
    // Atualizar email
    const emailEl = document.querySelector('.user-email');
    if (emailEl) emailEl.textContent = user.email;
    
    // Atualizar saudação
    const greetingEl = document.querySelector('.header h1');
    if (greetingEl) greetingEl.textContent = `Bem-vindo, ${user.name.split(' ')[0]}! 👋`;
};

// ========== CARREGAR ESTATÍSTICAS ==========
const loadStats = () => {
    const stats = CardsManager.getStats();
    
    // Atualizar cards de estatísticas
    updateStatCard('total-cards', stats.totalCards, `+${stats.activeCards} ativos`);
    updateStatCard('total-views', formatNumber(stats.totalViews), '+15% esta semana');
    updateStatCard('total-shares', formatNumber(stats.totalShares), '+8% hoje');
    updateStatCard('total-contacts', formatNumber(stats.totalContacts), `+12 hoje`);
};

const updateStatCard = (id, number, change) => {
    const numberEl = document.getElementById(id);
    if (numberEl) numberEl.textContent = number;
    
    const changeEl = document.getElementById(`${id}-change`);
    if (changeEl) changeEl.innerHTML = `<i class="fas fa-arrow-up"></i> ${change}`;
};

const formatNumber = (num) => {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
};

// ========== CARREGAR CARTÕES ==========
const loadCards = (filter = null, searchQuery = null) => {
    let cards = CardsManager.getAllCards();
    
    // Aplicar pesquisa
    if (searchQuery) {
        cards = CardsManager.searchCards(searchQuery);
    }
    
    // Aplicar filtro
    if (filter) {
        cards = CardsManager.filterCards(filter);
    }
    
    // Renderizar
    renderCards(cards);
};

const renderCards = (cards) => {
    const container = document.getElementById('cardsContainer');
    if (!container) return;
    
    if (cards.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-id-card"></i>
                </div>
                <h3 class="empty-title">Nenhum cartão encontrado</h3>
                <p class="empty-text">Comece criando seu primeiro cartão de visita digital!</p>
                <a href="editor.html" class="btn btn-primary">
                    <i class="fas fa-plus"></i>
                    Criar Primeiro Cartão
                </a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = cards.map(card => createCardHTML(card)).join('');
    
    // Adicionar event listeners
    attachCardEventListeners();
};

const createCardHTML = (card) => {
    const date = new Date(card.createdAt).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    });
    
    const theme = card.data?.design?.theme || 'gradient-purple';
    const fullName = card.data?.personalInfo?.fullName || 'Sem Nome';
    const jobTitle = card.data?.personalInfo?.jobTitle || 'Sem Cargo';
    const hasImage = card.data?.image;
    
    return `
        <div class="card-item" data-card-id="${card.id}">
            <div class="card-preview ${theme}">
                <div class="card-favorite ${card.isFavorite ? 'starred' : ''}" onclick="toggleFavorite('${card.id}')">
                    <i class="fas fa-star"></i>
                </div>
                <div class="card-status ${card.isActive ? 'active' : 'inactive'}" onclick="toggleActive('${card.id}')">
                    <i class="fas fa-${card.isActive ? 'check-circle' : 'pause-circle'}"></i>
                    ${card.isActive ? 'Ativo' : 'Inativo'}
                </div>
                <div style="text-align: center;">
                    <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.3); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 2rem; overflow: hidden;">
                        ${hasImage ? `<img src="${card.data.image}" style="width: 100%; height: 100%; object-fit: cover;">` : '👤'}
                    </div>
                    <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">${fullName}</h3>
                    <p style="opacity: 0.9;">${jobTitle}</p>
                </div>
            </div>
            <div class="card-info">
                <h3 class="card-name">${card.name}</h3>
                <div class="card-meta">
                    <span class="card-meta-item">
                        <i class="fas fa-calendar"></i>
                        ${date}
                    </span>
                    ${card.isFavorite ? '<span class="badge badge-primary">Principal</span>' : ''}
                </div>
                <div class="card-stats">
                    <div class="card-stat">
                        <div class="card-stat-number">${card.views || 0}</div>
                        <div class="card-stat-label">Visualizações</div>
                    </div>
                    <div class="card-stat">
                        <div class="card-stat-number">${card.shares || 0}</div>
                        <div class="card-stat-label">Compartilhamentos</div>
                    </div>
                    <div class="card-stat">
                        <div class="card-stat-number">${card.contacts || 0}</div>
                        <div class="card-stat-label">Contatos</div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="card-action-btn primary" onclick="viewCard('${card.id}')">
                        <i class="fas fa-eye"></i>
                        Ver
                    </button>
                    <button class="card-action-btn" onclick="editCard('${card.id}')">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                    <button class="card-action-btn" onclick="shareCard('${card.id}')">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <button class="card-action-btn" onclick="openCardMenu('${card.id}', event)">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
};

const attachCardEventListeners = () => {
    // Event listeners já são adicionados via onclick no HTML
    console.log('✅ Event listeners dos cartões anexados');
};

// ========== AÇÕES DOS CARTÕES ==========
window.viewCard = (cardId) => {
    console.log('👁️ Visualizar cartão:', cardId);
    CardsManager.incrementViews(cardId);
    window.open(`view-card.html?id=${cardId}`, '_blank');
};

window.editCard = (cardId) => {
    console.log('✏️ Editar cartão:', cardId);
    const card = CardsManager.getCardById(cardId);
    if (card && card.data) {
        // Salvar dados do cartão no localStorage para o editor carregar
        localStorage.setItem('virtual-card-data', JSON.stringify(card.data));
        localStorage.setItem('editing-card-id', cardId);
        window.location.href = 'editor.html';
    }
};

window.shareCard = (cardId) => {
    console.log('🔗 Compartilhar cartão:', cardId);
    CardsManager.incrementShares(cardId);
    if (typeof window.openShareModal === 'function') {
        window.openShareModal(cardId);
    } else {
        alert('Modal de compartilhamento será aberto aqui!');
    }
};

window.toggleFavorite = (cardId) => {
    const card = CardsManager.toggleFavorite(cardId);
    if (card) {
        console.log(card.isFavorite ? '⭐ Favoritado' : '☆ Desfavoritado');
        loadCards();
        loadStats();
    }
};

window.toggleActive = (cardId) => {
    const card = CardsManager.toggleActive(cardId);
    if (card) {
        console.log(card.isActive ? '✅ Ativado' : '⏸️ Desativado');
        loadCards();
        loadStats();
    }
};

window.openCardMenu = (cardId, event) => {
    event.stopPropagation();
    
    const options = [
        { label: '📋 Duplicar', action: () => duplicateCard(cardId) },
        { label: '📥 Exportar PDF', action: () => exportCardPDF(cardId) },
        { label: '📱 Exportar vCard', action: () => exportCardVCard(cardId) },
        { label: '🗑️ Deletar', action: () => deleteCard(cardId), danger: true }
    ];
    
    showContextMenu(event, options);
};

const duplicateCard = (cardId) => {
    const newCard = CardsManager.duplicateCard(cardId);
    if (newCard) {
        console.log('📋 Cartão duplicado');
        loadCards();
        loadStats();
        alert('Cartão duplicado com sucesso!');
    }
};

const deleteCard = (cardId) => {
    const card = CardsManager.getCardById(cardId);
    if (!card) return;
    
    const confirmed = confirm(`Tem certeza que deseja deletar "${card.name}"?\n\nEsta ação não pode ser desfeita.`);
    if (confirmed) {
        CardsManager.deleteCard(cardId);
        console.log('🗑️ Cartão deletado');
        loadCards();
        loadStats();
    }
};

const exportCardPDF = (cardId) => {
    console.log('📥 Exportar PDF:', cardId);
    alert('Exportação para PDF será implementada em breve!');
};

const exportCardVCard = (cardId) => {
    const card = CardsManager.getCardById(cardId);
    if (!card || !card.data) return;
    
    if (window.Utils && typeof window.Utils.downloadVCard === 'function') {
        window.Utils.downloadVCard(card.data.personalInfo, card.data.image);
    } else {
        alert('Função de exportação vCard não disponível.');
    }
};

// ========== MENU DE CONTEXTO ==========
const showContextMenu = (event, options) => {
    // Remove menu existente
    const existing = document.querySelector('.context-menu');
    if (existing) existing.remove();
    
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    
    // Criar menu temporariamente para calcular dimensões
    menu.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 0.5rem;
        z-index: 9999;
        min-width: 200px;
        opacity: 0;
    `;
    
    options.forEach(option => {
        const item = document.createElement('button');
        item.textContent = option.label;
        item.style.cssText = `
            display: block;
            width: 100%;
            padding: 0.75rem 1rem;
            border: none;
            background: none;
            text-align: left;
            cursor: pointer;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            color: ${option.danger ? '#EF4444' : '#374151'};
        `;
        
        item.addEventListener('mouseenter', () => {
            item.style.background = option.danger ? 'rgba(239,68,68,0.1)' : '#F3F4F6';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.background = 'none';
        });
        
        item.addEventListener('click', () => {
            option.action();
            menu.remove();
        });
        
        menu.appendChild(item);
    });
    
    document.body.appendChild(menu);
    
    // Calcular posição otimizada
    const menuRect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let finalTop = event.clientY;
    let finalLeft = event.clientX;
    
    // Ajustar posição horizontal se sair da tela
    if (finalLeft + menuRect.width > viewportWidth) {
        finalLeft = viewportWidth - menuRect.width - 10; // 10px de margem
    }
    if (finalLeft < 10) {
        finalLeft = 10;
    }
    
    // Ajustar posição vertical se sair da tela
    if (finalTop + menuRect.height > viewportHeight) {
        finalTop = event.clientY - menuRect.height; // Mostrar acima do clique
    }
    if (finalTop < 10) {
        finalTop = 10;
    }
    
    // Aplicar posição final
    menu.style.cssText = `
        position: fixed;
        top: ${finalTop}px;
        left: ${finalLeft}px;
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 0.5rem;
        z-index: 9999;
        min-width: 200px;
        opacity: 1;
        animation: contextMenuFadeIn 0.2s ease-out;
    `;
    
    // Fechar ao clicar fora
    setTimeout(() => {
        document.addEventListener('click', () => menu.remove(), { once: true });
    }, 100);
};

// ========== PESQUISA ==========
const initializeSearch = () => {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    let timeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const query = e.target.value.trim();
            loadCards(null, query || null);
        }, 300);
    });
};

// ========== FILTROS ==========
const initializeFilters = () => {
    const filterBtn = document.getElementById('filterBtn');
    if (!filterBtn) return;
    
    filterBtn.addEventListener('click', () => {
        const filters = ['all', 'active', 'inactive', 'favorites', 'recent'];
        const currentFilter = filterBtn.dataset.currentFilter || 'all';
        const currentIndex = filters.indexOf(currentFilter);
        const nextFilter = filters[(currentIndex + 1) % filters.length];
        
        filterBtn.dataset.currentFilter = nextFilter;
        
        const labels = {
            all: 'Todos',
            active: 'Ativos',
            inactive: 'Inativos',
            favorites: 'Favoritos',
            recent: 'Recentes'
        };
        
        filterBtn.innerHTML = `<i class="fas fa-filter"></i> ${labels[nextFilter]}`;
        
        loadCards(nextFilter === 'all' ? null : nextFilter);
    });
};

// ========== MENU MOBILE ==========
const initializeMobileMenu = () => {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    
    if (!menuBtn || !sidebar) return;
    
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
    });
    
    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
    
    // Fechar ao clicar em link (mobile)
    const navItems = sidebar.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('active');
            }
        });
    });
};

// ========== NAVEGAÇÃO ==========
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        const href = item.getAttribute('href');
        if (href === '#' || href.startsWith('#')) {
            e.preventDefault();
            // Implementar navegação entre seções aqui se necessário
        }
    });
});

// Exportar funções globais
window.initializeProfile = initializeProfile;
window.loadCards = loadCards;
window.loadStats = loadStats;

