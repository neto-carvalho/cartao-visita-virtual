/* ==========================================================================
   PROFILE.JS - Lógica da Interface de Perfil
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initializeProfile();
});

const initializeProfile = () => {
    console.log('👤 Inicializando perfil...');
    
    // Verificar se retornou da edição de um cartão
    checkForCardUpdates();
    
    loadUserInfo();
    loadStats();
    loadCards();
    initializeSearch();
    initializeFilters();
    initializeMobileMenu();
    initializeNavigation();
    initializeSettings();
    initializePageFocusListener();
    
    console.log('✅ Perfil inicializado');
};

// Listener para detectar quando a página é focada novamente
const initializePageFocusListener = () => {
    // Detectar quando a página volta a ter foco (retorno da edição)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            console.log('👁️ Página focada novamente, verificando atualizações...');
            checkForCardUpdates();
        }
    });
    
    // Também detectar quando a janela ganha foco
    window.addEventListener('focus', () => {
        console.log('👁️ Janela focada, verificando atualizações...');
        checkForCardUpdates();
    });
};

// Verificar se houve atualizações de cartões
const checkForCardUpdates = () => {
    // Verificar se há indicadores de que um cartão foi atualizado
    const hasRecentUpdate = localStorage.getItem('card-updated');
    if (hasRecentUpdate) {
        console.log('🔄 Cartão foi atualizado, recarregando dados...');
        localStorage.removeItem('card-updated');
        
        // Forçar recarregamento dos dados
        setTimeout(() => {
            loadStats();
            loadCards();
        }, 500);
    }
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
                <a href="editor.html" class="btn btn-primary" onclick="createNewCard()">
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
        console.log('📋 Dados do cartão encontrados:', card);
        
        // Salvar dados do cartão no localStorage para o editor carregar
        localStorage.setItem('virtual-card-data', JSON.stringify(card.data));
        localStorage.setItem('editing-card-id', cardId);
        
        console.log('✅ Dados salvos no localStorage para edição');
        console.log('🔄 Redirecionando para o editor...');
        
        // Redirecionar para o editor
        window.location.href = 'editor.html';
    } else {
        console.error('❌ Cartão não encontrado ou sem dados:', cardId);
        alert('Erro: Cartão não encontrado ou sem dados para editar.');
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

// ========== SISTEMA DE NAVEGAÇÃO ==========
const initializeNavigation = () => {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            navigateToSection(section);
            updateActiveNavItem(item);
        });
    });
};

const navigateToSection = (sectionName) => {
    // Esconder todas as seções
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Mostrar seção selecionada
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Carregar dados específicos da seção
        switch(sectionName) {
            case 'dashboard':
                loadStats();
                loadCards();
                break;
            case 'my-cards':
                loadMyCards();
                break;
            case 'statistics':
                loadStatistics();
                break;
            case 'favorites':
                loadFavorites();
                break;
            case 'settings':
                loadSettings();
                break;
        }
    }
};

const updateActiveNavItem = (activeItem) => {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    activeItem.classList.add('active');
};

// ========== SEÇÃO MEUS CARTÕES ==========
const loadMyCards = () => {
    const container = document.getElementById('myCardsContainer');
    if (!container) return;
    
    const cards = CardsManager.getAllCards();
    renderMyCards(cards);
    
    // Inicializar pesquisa e filtros para esta seção
    initializeMyCardsSearch();
    initializeMyCardsFilters();
};

const renderMyCards = (cards) => {
    const container = document.getElementById('myCardsContainer');
    if (!container) return;
    
    if (cards.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-id-card"></i>
                </div>
                <h3 class="empty-title">Nenhum cartão encontrado</h3>
                <p class="empty-text">Comece criando seu primeiro cartão de visita digital!</p>
                <a href="editor.html" class="btn btn-primary" onclick="createNewCard()">
                    <i class="fas fa-plus"></i>
                    Criar Primeiro Cartão
                </a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = cards.map(card => createCardHTML(card)).join('');
    attachCardEventListeners();
};

const initializeMyCardsSearch = () => {
    const searchInput = document.getElementById('myCardsSearchInput');
    if (!searchInput) return;
    
    let timeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const query = e.target.value.trim();
            let cards = CardsManager.getAllCards();
            if (query) {
                cards = CardsManager.searchCards(query);
            }
            renderMyCards(cards);
        }, 300);
    });
};

const initializeMyCardsFilters = () => {
    const filterBtn = document.getElementById('myCardsFilterBtn');
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
        
        let cards = CardsManager.getAllCards();
        if (nextFilter !== 'all') {
            cards = CardsManager.filterCards(nextFilter);
        }
        renderMyCards(cards);
    });
};

// ========== SEÇÃO ESTATÍSTICAS ==========
const loadStatistics = () => {
    const stats = CardsManager.getStats();
    const cards = CardsManager.getAllCards();
    
    // Atualizar números principais
    updateStatCard('stats-total-views', formatNumber(stats.totalViews));
    updateStatCard('stats-total-shares', formatNumber(stats.totalShares));
    
    // Criar gráficos simples
    createSimpleChart('viewsChartCanvas', generateChartData(cards, 'views'));
    createSimpleChart('sharesChartCanvas', generateChartData(cards, 'shares'));
    
    // Carregar top cartões
    loadTopCards(cards);
};

const generateChartData = (cards, metric) => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayCards = cards.filter(card => {
            const cardDate = new Date(card.createdAt);
            return cardDate.toDateString() === date.toDateString();
        });
        
        const total = dayCards.reduce((sum, card) => sum + (card[metric] || 0), 0);
        last7Days.push(total);
    }
    
    return last7Days;
};

const createSimpleChart = (canvasId, data) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Limpar canvas
    ctx.clearRect(0, 0, width, height);
    
    // Configurações
    const padding = 20;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    const maxValue = Math.max(...data, 1);
    const stepX = chartWidth / (data.length - 1);
    
    // Desenhar linha
    ctx.strokeStyle = canvasId.includes('views') ? '#10B981' : '#8B5CF6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((value, index) => {
        const x = padding + (index * stepX);
        const y = padding + chartHeight - (value / maxValue) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Desenhar pontos
    ctx.fillStyle = canvasId.includes('views') ? '#10B981' : '#8B5CF6';
    data.forEach((value, index) => {
        const x = padding + (index * stepX);
        const y = padding + chartHeight - (value / maxValue) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
};

const loadTopCards = (cards) => {
    const container = document.getElementById('topCardsContainer');
    if (!container) return;
    
    // Ordenar por visualizações
    const topCards = cards
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);
    
    if (topCards.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <p>Nenhum dado disponível</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = topCards.map((card, index) => `
        <div class="top-card-item">
            <div class="top-card-rank">${index + 1}</div>
            <div class="top-card-info">
                <div class="top-card-name">${card.name}</div>
                <div class="top-card-views">${card.views || 0} visualizações</div>
            </div>
        </div>
    `).join('');
};

// ========== SEÇÃO FAVORITOS ==========
const loadFavorites = () => {
    const container = document.getElementById('favoritesContainer');
    if (!container) return;
    
    const favoriteCards = CardsManager.getAllCards().filter(card => card.isFavorite);
    renderFavorites(favoriteCards);
    
    // Inicializar pesquisa para favoritos
    initializeFavoritesSearch();
};

const renderFavorites = (cards) => {
    const container = document.getElementById('favoritesContainer');
    if (!container) return;
    
    if (cards.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-star"></i>
                </div>
                <h3 class="empty-title">Nenhum favorito ainda</h3>
                <p class="empty-text">Marque seus cartões como favoritos para vê-los aqui!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = cards.map(card => createCardHTML(card)).join('');
    attachCardEventListeners();
};

const initializeFavoritesSearch = () => {
    const searchInput = document.getElementById('favoritesSearchInput');
    if (!searchInput) return;
    
    let timeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const query = e.target.value.trim();
            let cards = CardsManager.getAllCards().filter(card => card.isFavorite);
            if (query) {
                cards = CardsManager.searchCards(query).filter(card => card.isFavorite);
            }
            renderFavorites(cards);
        }, 300);
    });
};

// ========== SEÇÃO CONFIGURAÇÕES ==========
const initializeSettings = () => {
    // Carregar configurações salvas
    loadUserSettings();
    
    // Configurar event listeners
    setupSettingsEventListeners();
};

const loadSettings = () => {
    loadUserSettings();
};

const loadUserSettings = () => {
    const user = CardsManager.getUser();
    const settings = CardsManager.getSettings();
    
    // Preencher campos do usuário
    const userNameInput = document.getElementById('userName');
    const userEmailInput = document.getElementById('userEmail');
    
    if (userNameInput) userNameInput.value = user.name || '';
    if (userEmailInput) userEmailInput.value = user.email || '';
    
    // Preencher configurações
    const emailNotifications = document.getElementById('emailNotifications');
    const autoSave = document.getElementById('autoSave');
    
    if (emailNotifications) emailNotifications.checked = settings.emailNotifications !== false;
    if (autoSave) autoSave.checked = settings.autoSave !== false;
};

const setupSettingsEventListeners = () => {
    // Avatar upload
    const avatarInput = document.getElementById('userAvatar');
    if (avatarInput) {
        avatarInput.addEventListener('change', handleAvatarUpload);
    }
    
    // Toggle switches
    const toggles = document.querySelectorAll('.toggle-switch input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', saveSettings);
    });
};

const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const user = CardsManager.getUser();
        user.avatar = e.target.result;
        CardsManager.saveUser(user);
        loadUserInfo(); // Atualizar avatar na interface
    };
    reader.readAsDataURL(file);
};

const saveSettings = () => {
    const settings = {
        emailNotifications: document.getElementById('emailNotifications')?.checked,
        autoSave: document.getElementById('autoSave')?.checked
    };
    
    CardsManager.saveSettings(settings);
    console.log('⚙️ Configurações salvas');
};

// ========== FUNÇÕES DE CONFIGURAÇÕES ==========
window.updateUserProfile = () => {
    const userName = document.getElementById('userName')?.value;
    const userEmail = document.getElementById('userEmail')?.value;
    
    if (!userName || !userEmail) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    const user = CardsManager.getUser();
    user.name = userName;
    user.email = userEmail;
    
    CardsManager.saveUser(user);
    loadUserInfo();
    
    alert('Perfil atualizado com sucesso!');
};

window.exportUserData = () => {
    const user = CardsManager.getUser();
    const cards = CardsManager.getAllCards();
    const settings = CardsManager.getSettings();
    
    const data = {
        user,
        cards,
        settings,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `cartoes-virtuais-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('📥 Dados exportados');
};

window.clearCache = () => {
    const confirmed = confirm('Tem certeza que deseja limpar o cache?\n\nIsso removerá dados temporários, mas manterá seus cartões.');
    if (confirmed) {
        // Limpar apenas dados temporários, manter cartões
        localStorage.removeItem('virtual-card-temp');
        localStorage.removeItem('virtual-card-draft');
        alert('Cache limpo com sucesso!');
    }
};

window.deleteAccount = () => {
    const confirmed = confirm('⚠️ ATENÇÃO: Esta ação é irreversível!\n\nTem certeza que deseja deletar sua conta e todos os seus dados?');
    if (confirmed) {
        const doubleConfirm = confirm('Última chance! Todos os seus cartões e dados serão perdidos permanentemente.\n\nDigite "CONFIRMAR" para continuar.');
        if (doubleConfirm) {
            // Limpar todos os dados
            localStorage.removeItem('virtual-card-user');
            localStorage.removeItem('virtual-card-cards');
            localStorage.removeItem('virtual-card-settings');
            localStorage.removeItem('virtual-card-temp');
            localStorage.removeItem('virtual-card-draft');
            localStorage.removeItem('virtual-card-data');
            localStorage.removeItem('editing-card-id');
            
            alert('Conta deletada. Redirecionando...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }
};

// ========== FUNÇÃO DE LOGOUT ==========
window.logout = () => {
    const confirmed = confirm('Tem certeza que deseja sair?');
    if (confirmed) {
        // Limpar dados temporários mas manter cartões
        localStorage.removeItem('virtual-card-temp');
        localStorage.removeItem('virtual-card-draft');
        localStorage.removeItem('virtual-card-data');
        localStorage.removeItem('editing-card-id');
        
        console.log('👋 Logout realizado');
        window.location.href = 'index.html';
    }
};

// ========== FUNÇÃO DE REFRESH ==========
window.refreshProfile = () => {
    console.log('🔄 Atualizando perfil...');
    loadStats();
    loadCards();
    
    // Recarregar seções específicas se estiverem ativas
    const activeSection = document.querySelector('.content-section.active');
    if (activeSection) {
        const sectionId = activeSection.id;
        switch(sectionId) {
            case 'my-cards-section':
                loadMyCards();
                break;
            case 'statistics-section':
                loadStatistics();
                break;
            case 'favorites-section':
                loadFavorites();
                break;
        }
    }
    
    console.log('✅ Perfil atualizado');
};

// ========== FUNÇÃO PARA CRIAR NOVO CARTÃO ==========
window.createNewCard = () => {
    console.log('🆕 Criando novo cartão...');
    
    // Limpar dados temporários de edição
    localStorage.removeItem('editing-card-id');
    localStorage.removeItem('virtual-card-data');
    
    // Marcar que está criando um novo cartão
    localStorage.setItem('creating-new-card', 'true');
    
    // Limpar dados salvos para garantir que o editor abra limpo
    localStorage.removeItem('virtual-card-data');
    
    console.log('✅ Dados limpos, redirecionando para o editor...');
    
    // Redirecionar para o editor
    window.location.href = 'editor.html';
};

// ========== FUNÇÃO PARA LIMPAR CACHE ==========
window.clearCache = () => {
    console.log('🧹 Limpando cache do navegador...');
    
    try {
        // Limpar dados temporários
        localStorage.removeItem('virtual-card-data');
        localStorage.removeItem('editing-card-id');
        localStorage.removeItem('creating-new-card');
        localStorage.removeItem('card-updated');
        
        // Manter apenas dados essenciais (cartões salvos e configurações)
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
        
        console.log(`✅ Cache limpo! Removidos ${keysToRemove.length} itens.`);
        
        // Mostrar notificação
        if (typeof window.showCustomNotification === 'function') {
            window.showCustomNotification('Cache limpo com sucesso!', 'success', 3000);
        }
        
        // Recarregar a página
        setTimeout(() => {
            window.location.reload();
        }, 1000);
        
    } catch (error) {
        console.error('❌ Erro ao limpar cache:', error);
        if (typeof window.showCustomNotification === 'function') {
            window.showCustomNotification('Erro ao limpar cache', 'error', 3000);
        }
    }
};

// Exportar funções globais
window.initializeProfile = initializeProfile;
window.loadCards = loadCards;
window.loadStats = loadStats;
window.navigateToSection = navigateToSection;
window.refreshProfile = refreshProfile;

