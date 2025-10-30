/* ==========================================================================
   PROFILE.JS - Lógica da Interface de Perfil
   ========================================================================== */

console.log('📄 Profile.js carregado!');

document.addEventListener('DOMContentLoaded', () => {
    initializeProfile();
});

let apiCardsCache = [];

const initializeProfile = async () => {
    console.log('👤 Inicializando perfil...');
    
    // Verificar se o usuário está autenticado
    const isAuthenticated = typeof apiService !== 'undefined' && apiService.isAuthenticated();
    
    if (!isAuthenticated) {
        console.log('⚠️ Usuário não autenticado, redirecionando para login...');
        alert('Você precisa fazer login para acessar seu perfil.');
        window.location.href = 'login.html';
        return;
    }
    
    // Limpar dados antigos do localStorage que possam estar sobrando
    console.log('🧹 Limpando dados antigos do localStorage do perfil...');
    const hasEditingCardId = localStorage.getItem('editing-card-id');
    if (!hasEditingCardId) {
        // Se não há cartão sendo editado, limpar virtual-card-data
        localStorage.removeItem('virtual-card-data');
        console.log('✅ Dados antigos de edição removidos');
    }
    
    try {
        // Verificar se retornou da edição de um cartão
        console.log('🔄 Verificando atualizações de cartões...');
        checkForCardUpdates();
        
        // Fazer limpeza automática se necessário
        console.log('🧹 Verificando limpeza automática...');
        autoCleanupIfNeeded();
        
        console.log('👤 Carregando informações do usuário...');
        loadUserInfo();
        
        console.log('📊 Carregando estatísticas...');
        await loadStats();
        
        console.log('📋 Carregando cartões...');
        await loadCards();
        
        console.log('🔍 Inicializando pesquisa...');
        initializeSearch();
        
        console.log('🔧 Inicializando filtros...');
        initializeFilters();
        
        console.log('📱 Inicializando menu mobile...');
        initializeMobileMenu();
        
        console.log('🧭 Inicializando navegação...');
        initializeNavigation();
        
        console.log('⚙️ Inicializando configurações...');
        initializeSettings();
        
        console.log('👁️ Inicializando listener de foco...');
        initializePageFocusListener();
        
        console.log('✅ Perfil inicializado com sucesso');
    } catch (error) {
        console.error('❌ Erro na inicialização do perfil:', error);
        // Mostrar erro na interface
        const container = document.getElementById('cardsContainer');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 class="empty-title">Erro na inicialização</h3>
                    <p class="empty-text">Ocorreu um erro ao inicializar o perfil.</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-refresh"></i>
                        Recarregar Página
                    </button>
                </div>
            `;
        }
    }
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
        setTimeout(async () => {
            try {
                loadStats();
                await loadCards();
            } catch (error) {
                console.error('❌ Erro ao recarregar dados:', error);
            }
        }, 500);
    }
};

// ========== CARREGAR INFORMAÇÕES DO USUÁRIO ==========
const loadUserInfo = () => {
    let user = CardsManager.getUser();
    
    // Verificar se há usuário autenticado no apiService
    if (typeof apiService !== 'undefined' && apiService.isAuthenticated()) {
        const authUser = apiService.getCurrentUser();
        if (authUser) {
            console.log('🔄 Sincronizando usuário do login:', authUser.name);
            // Salvar no CardsManager
            CardsManager.saveUser({
                id: authUser.id || `user_${Date.now()}`,
                name: authUser.name,
                email: authUser.email,
                avatar: null,
                createdAt: authUser.createdAt || new Date().toISOString()
            });
            // Usar o usuário autenticado
            user = {
                id: authUser.id || `user_${Date.now()}`,
                name: authUser.name,
                email: authUser.email,
                avatar: null
            };
            console.log('✅ Usuário sincronizado:', user.name, user.email);
        }
    }
    
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
const loadStats = async () => {
    try {
        // Usar cache quando existir; senão, buscar
        if (!apiCardsCache || apiCardsCache.length === 0) {
            let cards = await apiService.getCards();
            apiCardsCache = cards.map(card => ({
                id: card._id || card.id,
                name: card.name,
                isActive: card.isActive,
                views: card.views || 0,
                shares: card.shares || 0,
                contacts: card.contacts || 0,
                createdAt: card.createdAt,
                updatedAt: card.updatedAt
            }));
        }
        const stats = {
            totalCards: apiCardsCache.length,
            activeCards: apiCardsCache.filter(c => c.isActive).length,
            totalViews: apiCardsCache.reduce((s, c) => s + (c.views || 0), 0),
            totalShares: apiCardsCache.reduce((s, c) => s + (c.shares || 0), 0),
            totalContacts: apiCardsCache.reduce((s, c) => s + (c.contacts || 0), 0)
        };
        updateStatCard('total-cards', stats.totalCards, `+${stats.activeCards} ativos`);
        updateStatCard('total-views', formatNumber(stats.totalViews), '');
        updateStatCard('total-shares', formatNumber(stats.totalShares), '');
        updateStatCard('total-contacts', formatNumber(stats.totalContacts), '');
    } catch (e) {
        console.error('❌ Erro ao carregar estatísticas:', e);
    }
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
const loadCards = async (filter = null, searchQuery = null) => {
    console.log('📋 Carregando cartões...', { filter, searchQuery });
    
    try {
        // Verificar se apiService está disponível
        if (typeof apiService === 'undefined' || !apiService.isAuthenticated()) {
            console.warn('⚠️ API não disponível ou usuário não autenticado');
            renderCards([]);
            return;
        }
        
        // Carregar cartões da API
        console.log('🌐 Buscando cartões na API...');
        let cards = await apiService.getCards();
        console.log('📋 Cartões obtidos da API:', cards.length);
        
        // Converter para o formato esperado pelo CardsManager
        cards = cards.map(card => ({
            id: card._id || card.id,
            name: card.name,
            publicUrl: card.publicUrl,
            data: {
                personalInfo: {
                    fullName: card.name,
                    jobTitle: card.jobTitle || '',
                    description: card.description || '',
                    email: card.email || '',
                    phone: card.phone || ''
                },
                image: card.image || null,
                design: {
                    primaryColor: card.color || '#00BFFF',
                    theme: card.theme || 'modern',
                    customGradient: card.customGradient || null
                },
                featureSections: (card.featureSections || []).map(s => ({
                    title: s.title,
                    description: s.description,
                    image: s.image || null,
                    buttonText: s.buttonText,
                    buttonUrl: s.buttonUrl
                })),
                links: (card.links || []).map(link => ({
                    label: link.title,
                    url: link.url,
                    type: link.type || 'custom',
                    color: link.color || (card.color || '#00BFFF')
                }))
            },
            isActive: card.isActive,
            isFavorite: false,
            createdAt: card.createdAt,
            updatedAt: card.updatedAt,
            views: card.views || 0,
            shares: card.shares || 0
        })).map(c => ({
            ...c,
            isFavorite: (typeof CardsManager !== 'undefined') ? CardsManager.isFavorite(c.id) : false
        }));
        
        // Aplicar pesquisa
        if (searchQuery) {
            cards = cards.filter(card => 
                card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (card.data.personalInfo?.description || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
            console.log('🔍 Após pesquisa:', cards.length);
        }
        
        // Aplicar filtro
        if (filter) {
            if (filter === 'favorites') {
                cards = cards.filter(card => card.isFavorite);
            }
            console.log('🔍 Após filtro:', cards.length);
        }
        
        // Atualizar cache para estatísticas e outras seções
        apiCardsCache = cards.map(c => ({
            id: c.id,
            name: c.name,
            isActive: c.isActive,
            views: c.views || 0,
            shares: c.shares || 0,
            contacts: c.contacts || 0,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
        }));

        // Renderizar
        console.log('🎨 Renderizando cartões...');
        renderCards(cards);
        console.log('✅ Cartões renderizados');
    } catch (error) {
        console.error('❌ Erro ao carregar cartões:', error);
        const container = document.getElementById('cardsContainer');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 class="empty-title">Erro ao carregar cartões</h3>
                    <p class="empty-text">Ocorreu um erro ao carregar os cartões. Tente recarregar a página.</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-refresh"></i>
                        Recarregar Página
                    </button>
                </div>
            `;
        }
    }
};

const renderCards = (cards) => {
    console.log('🎨 Renderizando cartões:', cards.length);
    
    const container = document.getElementById('cardsContainer');
    if (!container) {
        console.error('❌ Container de cartões não encontrado');
        return;
    }
    
    try {
        if (cards.length === 0) {
            console.log('📭 Nenhum cartão encontrado, mostrando estado vazio');
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
        
        console.log('🎨 Gerando HTML dos cartões...');
        const cardsHTML = cards.map(card => {
            console.log('📋 Processando cartão:', card.id, card.name);
            return createCardHTML(card);
        }).join('');
        
        console.log('📝 Inserindo HTML no container...');
        container.innerHTML = cardsHTML;
        
        console.log('🔗 Adicionando event listeners...');
        // Adicionar event listeners
        attachCardEventListeners();
        
        console.log('✅ Cartões renderizados com sucesso');
    } catch (error) {
        console.error('❌ Erro ao renderizar cartões:', error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 class="empty-title">Erro ao renderizar cartões</h3>
                <p class="empty-text">Ocorreu um erro ao renderizar os cartões.</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-refresh"></i>
                    Recarregar Página
                </button>
            </div>
        `;
    }
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
                    <button class="card-action-btn primary" onclick="viewCard('${card.id}', '${card.publicUrl || ''}')">
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
window.viewCard = (cardId, publicUrl = '') => {
    console.log('👁️ Visualizar cartão:', cardId, publicUrl);
    try { CardsManager.incrementViews(cardId); } catch (e) {}
    if (publicUrl) {
        window.open(`view-card.html?public=${encodeURIComponent(publicUrl)}`, '_blank');
    } else {
        window.open(`view-card.html?id=${cardId}`, '_blank');
    }
};

window.editCard = async (cardId) => {
    console.log('✏️ Editar cartão:', cardId);
    
    try {
        // Limpar dados antigos do localStorage antes de carregar
        console.log('🧹 Limpando dados antigos do localStorage...');
        localStorage.removeItem('virtual-card-data');
        localStorage.removeItem('editing-card-id');
        
        // Buscar cartão da API
        const cardFromAPI = await apiService.getCard(cardId);
        console.log('📋 Dados do cartão encontrados na API:', cardFromAPI);
        
        // Converter para o formato esperado
        const card = {
            id: cardFromAPI._id,
            name: cardFromAPI.name,
            data: {
                personalInfo: {
                    fullName: cardFromAPI.name,
                    jobTitle: cardFromAPI.jobTitle || '',
                    description: cardFromAPI.description || '',
                    email: cardFromAPI.email || '',
                    phone: cardFromAPI.phone || ''
                },
                image: cardFromAPI.image || null,
                design: {
                    primaryColor: cardFromAPI.color || '#00BFFF',
                    theme: cardFromAPI.theme || 'modern',
                    customGradient: cardFromAPI.customGradient || null
                },
                featureSections: (cardFromAPI.featureSections || []).map(s => ({
                    title: s.title,
                    description: s.description,
                    image: s.image || null,
                    buttonText: s.buttonText,
                    buttonUrl: s.buttonUrl
                })),
                links: (cardFromAPI.links || []).map(link => ({
                    title: link.title,
                    url: link.url,
                    type: link.type || 'custom',
                    color: link.color || (cardFromAPI.color || '#00BFFF')
                }))
            }
        };
        
        if (card && card.data) {
            console.log('📋 Dados convertidos:', card);
            console.log('📋 fullName:', card.data.personalInfo.fullName);
            console.log('📋 jobTitle:', card.data.personalInfo.jobTitle);
            
            try {
                // Tentar salvar dados do cartão no localStorage
                const cardDataString = JSON.stringify(card.data);
                console.log('📋 String a ser salva:', cardDataString.substring(0, 200));
                
                localStorage.setItem('virtual-card-data', cardDataString);
                localStorage.setItem('editing-card-id', cardId);
                
                console.log('✅ Dados salvos no localStorage para edição');
                console.log('🔍 Verificando se editing-card-id foi salvo:', localStorage.getItem('editing-card-id'));
                console.log('🔍 Verificando se virtual-card-data foi salvo:', localStorage.getItem('virtual-card-data') ? 'Sim' : 'Não');
                
                // Verificar o que foi realmente salvo
                const savedData = localStorage.getItem('virtual-card-data');
                const parsedSaved = JSON.parse(savedData);
                console.log('📋 Dados salvos recuperados:', parsedSaved);
                console.log('📋 fullName salvo:', parsedSaved.personalInfo?.fullName);
                console.log('📋 Card ID que será editado:', cardId);
                console.log('📋 Card Name:', cardFromAPI.name);
                
                // Aguardar um pouco para garantir que o localStorage foi atualizado
                console.log('⏳ Aguardando localStorage ser atualizado...');
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Verificar novamente após o delay
                const finalCheck = localStorage.getItem('virtual-card-data');
                const finalParsed = JSON.parse(finalCheck);
                console.log('🔍 Verificação final - fullName:', finalParsed.personalInfo?.fullName);
                
                // Forçar atualização do localStorage
                localStorage.setItem('virtual-card-data', JSON.stringify(card.data));
                localStorage.setItem('editing-card-id', cardId);
                
                console.log('🔄 Redirecionando para o editor...');
                
                // Forçar atualização imediatamente antes do redirecionamento
                localStorage.setItem('virtual-card-data', JSON.stringify(card.data));
                localStorage.setItem('editing-card-id', cardId);
                
                // Aguardar mais um pouco para garantir
                await new Promise(resolve => setTimeout(resolve, 50));
                
                // Redirecionar para o editor
                window.location.href = 'editor.html' + '?t=' + Date.now();
            
        } catch (error) {
            console.error('❌ Erro ao salvar dados do cartão:', error);
            
            if (error.name === 'QuotaExceededError') {
                console.log('🧹 localStorage cheio, tentando limpar e comprimir dados...');
                
                try {
                    // Limpar dados antigos primeiro
                    clearOldData();
                    
                    // Comprimir dados do cartão (sem await, usando Promise)
                    compressCardData(card.data).then(compressedData => {
                        // Tentar salvar dados comprimidos
                        localStorage.setItem('virtual-card-data', JSON.stringify(compressedData));
                        localStorage.setItem('editing-card-id', cardId);
                        
                        console.log('✅ Dados comprimidos salvos com sucesso');
                        window.location.href = 'editor.html';
                    }).catch(compressError => {
                        console.error('❌ Erro ao comprimir dados:', compressError);
                        // Se falhar a compressão, tentar salvar dados essenciais
                        const essentialData = extractEssentialData(card.data);
                        localStorage.setItem('virtual-card-data', JSON.stringify(essentialData));
                        localStorage.setItem('editing-card-id', cardId);
                        
                        console.log('✅ Dados essenciais salvos (compressão falhou)');
                        alert('⚠️ Dados grandes foram removidos para economizar espaço. Algumas imagens podem não aparecer no editor.');
                        window.location.href = 'editor.html';
                    });
                    
                } catch (retryError) {
                    console.error('❌ Erro mesmo após limpeza e compressão:', retryError);
                    
                    // Última tentativa: salvar apenas dados essenciais
                    try {
                        const essentialData = extractEssentialData(card.data);
                        localStorage.setItem('virtual-card-data', JSON.stringify(essentialData));
                        localStorage.setItem('editing-card-id', cardId);
                        
                        console.log('✅ Dados essenciais salvos');
                        alert('⚠️ Dados grandes foram removidos para economizar espaço. Algumas imagens podem não aparecer no editor.');
                        window.location.href = 'editor.html';
                        
                    } catch (finalError) {
                        console.error('❌ Erro final ao salvar:', finalError);
                        alert('❌ Erro: Não foi possível carregar o cartão para edição. Tente limpar o cache do navegador.');
                    }
                }
            } else {
                console.error('❌ Erro inesperado:', error);
                alert('❌ Erro inesperado ao carregar o cartão para edição.');
            }
            }
        } else {
            console.error('❌ Cartão não encontrado ou sem dados:', cardId);
            alert('Erro: Cartão não encontrado ou sem dados para editar.');
        }
    } catch (error) {
        console.error('❌ Erro ao buscar cartão da API:', error);
        alert('Erro ao carregar cartão para edição. Tente novamente.');
    }
};

window.shareCard = async (cardId) => {
    console.log('🔗 Compartilhar cartão:', cardId);
    try {
        // Nota: incrementar shares no backend será implementado depois
        if (typeof window.openShareModal === 'function') {
            window.openShareModal(cardId);
        } else {
            alert('Modal de compartilhamento será aberto aqui!');
        }
    } catch (error) {
        console.error('❌ Erro ao compartilhar:', error);
    }
};

window.toggleFavorite = async (cardId) => {
    try {
        console.log('⭐ Toggle favorito:', cardId);
        if (typeof CardsManager !== 'undefined') {
            const fav = CardsManager.toggleFavoriteById(cardId);
            console.log('⭐ Favorito agora:', fav);
        }
        await loadCards();
        loadStats();
    } catch (error) {
        console.error('❌ Erro ao favoritar:', error);
    }
};

window.toggleActive = async (cardId) => {
    try {
        // Nota: ativar/desativar será implementado no backend depois
        console.log('✅ Toggle ativo:', cardId);
        // Por enquanto, apenas recarregar
        await loadCards();
        loadStats();
    } catch (error) {
        console.error('❌ Erro ao alterar status:', error);
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

const duplicateCard = async (cardId) => {
    const newCard = CardsManager.duplicateCard(cardId);
    if (newCard) {
        console.log('📋 Cartão duplicado');
        await loadCards();
        loadStats();
        alert('Cartão duplicado com sucesso!');
    }
};

const deleteCard = async (cardId) => {
    try {
        // Buscar cartão da API para obter o nome
        const card = await apiService.getCard(cardId);
        
        const confirmed = confirm(`Tem certeza que deseja deletar "${card.name}"?\n\nEsta ação não pode ser desfeita.`);
        
        if (confirmed) {
            console.log('🗑️ Deletando cartão via API...');
            await apiService.deleteCard(cardId);
            console.log('🗑️ Cartão deletado com sucesso');
            
            // Atualizar interface
            await loadCards();
            loadStats();
            
            // Mostrar notificação
            if (typeof window.showCustomNotification === 'function') {
                window.showCustomNotification('Cartão deletado com sucesso!', 'success', 3000);
            }
        }
    } catch (error) {
        console.error('❌ Erro ao deletar cartão:', error);
        alert('Erro ao deletar cartão. Tente novamente.');
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

const navigateToSection = async (sectionName) => {
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
                await loadCards();
                break;
            case 'my-cards':
                await loadMyCards();
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
const loadMyCards = async () => {
    const container = document.getElementById('myCardsContainer');
    if (!container) return;
    
    try {
        // Buscar cartões da API
        let cards = await apiService.getCards();
        
        // Converter para o formato esperado
        cards = cards.map(card => ({
            id: card._id || card.id,
            name: card.name,
            data: {
                personalInfo: {
                    fullName: card.name,
                    jobTitle: card.jobTitle || '',
                    description: card.description || '',
                    email: card.email || '',
                    phone: card.phone || ''
                },
                image: card.image || null,
                design: {
                    primaryColor: card.color || '#00BFFF',
                    theme: card.theme || 'modern'
                },
                links: (card.links || []).map(link => ({
                    label: link.title,
                    url: link.url,
                    type: link.type || 'custom',
                    color: link.color || (card.color || '#00BFFF')
                }))
            },
            isActive: card.isActive,
            isFavorite: false,
            createdAt: card.createdAt,
            updatedAt: card.updatedAt
        }));
        
        renderMyCards(cards);
        
        // Inicializar pesquisa e filtros para esta seção
        initializeMyCardsSearch();
        initializeMyCardsFilters();
    } catch (error) {
        console.error('❌ Erro ao carregar cartões:', error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 class="empty-title">Erro ao carregar cartões</h3>
                <p class="empty-text">Não foi possível carregar os cartões. Tente recarregar a página.</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-refresh"></i>
                    Recarregar Página
                </button>
            </div>
        `;
    }
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
const loadStatistics = async () => {
    // Garantir cache
    if (!apiCardsCache || apiCardsCache.length === 0) {
        await loadStats();
    }
    const cards = apiCardsCache;
    const totals = {
        totalViews: cards.reduce((s, c) => s + (c.views || 0), 0),
        totalShares: cards.reduce((s, c) => s + (c.shares || 0), 0)
    };
    updateStatCard('stats-total-views', formatNumber(totals.totalViews));
    updateStatCard('stats-total-shares', formatNumber(totals.totalShares));
    createSimpleChart('viewsChartCanvas', generateChartDataApi(cards, 'views'));
    createSimpleChart('sharesChartCanvas', generateChartDataApi(cards, 'shares'));
    loadTopCards(cards);
};

const generateChartDataApi = (cards, metric) => {
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
const loadFavorites = async () => {
    const container = document.getElementById('favoritesContainer');
    if (!container) return;
    try {
        let cards = await apiService.getCards();
        const favMap = (typeof CardsManager !== 'undefined') ? CardsManager.getFavoritesMap() : {};
        cards = cards
            .filter(c => favMap[c._id || c.id])
            .map(card => ({
                id: card._id || card.id,
                name: card.name,
                data: {
                    personalInfo: {
                        fullName: card.name,
                        jobTitle: card.jobTitle || '',
                        description: card.description || '',
                        email: card.email || '',
                        phone: card.phone || ''
                    },
                    image: card.image || null,
                    design: {
                        primaryColor: card.color || '#00BFFF',
                        theme: card.theme || 'modern'
                    },
                    links: (card.links || []).map(link => ({
                        label: link.title,
                        url: link.url,
                        type: link.type || 'custom'
                    }))
                },
                isActive: card.isActive,
                isFavorite: true,
                createdAt: card.createdAt,
                updatedAt: card.updatedAt,
                views: card.views || 0,
                shares: card.shares || 0,
                contacts: card.contacts || 0
            }));
        renderFavorites(cards);
        initializeFavoritesSearch();
    } catch (e) {
        console.error('❌ Erro ao carregar favoritos:', e);
        container.innerHTML = '<p class="empty-text">Erro ao carregar favoritos.</p>';
    }
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

    // Botões de ação
    const exportBtn = document.getElementById('exportUserDataBtn');
    if (exportBtn) exportBtn.addEventListener('click', window.exportUserData);

    const clearCacheBtn = document.getElementById('clearCacheBtn');
    if (clearCacheBtn) clearCacheBtn.addEventListener('click', window.clearCache);

    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) deleteAccountBtn.addEventListener('click', window.deleteAccount);

    const updateProfileBtn = document.getElementById('updateUserProfileBtn');
    if (updateProfileBtn) updateProfileBtn.addEventListener('click', window.updateUserProfile);
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
    // Criar modal de logout
    const modal = document.createElement('div');
    modal.className = 'logout-modal';
    modal.innerHTML = `
        <div class="logout-modal-overlay"></div>
        <div class="logout-modal-content">
            <div class="logout-icon">
                <i class="fas fa-sign-out-alt"></i>
            </div>
            <h3>Confirmar Logout</h3>
            <p>Tem certeza que deseja sair da sua conta?</p>
            <div class="logout-modal-buttons">
                <button class="btn-logout-cancel" onclick="closeLogoutModal()">
                    <i class="fas fa-times"></i>
                    Cancelar
                </button>
                <button class="btn-logout-confirm" onclick="confirmLogout()">
                    <i class="fas fa-sign-out-alt"></i>
                    Sim, Sair
                </button>
            </div>
        </div>
    `;
    
    // Adicionar estilos inline
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    const overlay = modal.querySelector('.logout-modal-overlay');
    overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
    `;
    
    const content = modal.querySelector('.logout-modal-content');
    content.style.cssText = `
        position: relative;
        background: white;
        padding: 2rem;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        max-width: 400px;
        width: 90%;
        text-align: center;
        animation: modalSlideIn 0.3s ease-out;
    `;
    
    const icon = modal.querySelector('.logout-icon');
    icon.style.cssText = `
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
        font-size: 24px;
        color: white;
    `;
    
    const buttons = modal.querySelector('.logout-modal-buttons');
    buttons.style.cssText = `
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
    `;
    
    const cancelBtn = modal.querySelector('.btn-logout-cancel');
    cancelBtn.style.cssText = `
        flex: 1;
        padding: 12px 24px;
        border: 2px solid #e5e7eb;
        background: white;
        color: #6b7280;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
    `;
    
    const confirmBtn = modal.querySelector('.btn-logout-confirm');
    confirmBtn.style.cssText = `
        flex: 1;
        padding: 12px 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
    `;
    
    // Adicionar animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .btn-logout-cancel:hover {
            background: #f9fafb;
            border-color: #d1d5db;
        }
        
        .btn-logout-confirm:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(modal);
    
    // Salvar referência global do modal
    window.currentLogoutModal = modal;
    
    // Fechar ao clicar no overlay
    overlay.addEventListener('click', closeLogoutModal);
};

window.closeLogoutModal = () => {
    if (window.currentLogoutModal) {
        window.currentLogoutModal.remove();
        window.currentLogoutModal = null;
    }
};

window.confirmLogout = () => {
    console.log('👋 Realizando logout...');
    
    // Usar apiService se disponível
    if (typeof apiService !== 'undefined') {
        apiService.logout();
        console.log('✅ Logout via apiService realizado');
    }
    
    // Limpar todos os dados de autenticação
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('virtual-card-temp');
    localStorage.removeItem('virtual-card-draft');
    localStorage.removeItem('virtual-card-data');
    localStorage.removeItem('editing-card-id');
    
    console.log('🧹 Dados limpos');
    
    // Fechar modal
    closeLogoutModal();
    
    // Redirecionar com pequeno delay para melhor UX
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 300);
};

// ========== FUNÇÕES DE LIMPEZA E COMPRESSÃO ==========
const clearOldData = () => {
    console.log('🧹 Limpando dados antigos do localStorage...');
    
    // Manter apenas dados essenciais
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
    
    console.log(`✅ Removidos ${keysToRemove.length} itens antigos`);
};

const compressCardData = (cardData) => {
    console.log('🗜️ Comprimindo dados do cartão...');
    
    return new Promise(async (resolve, reject) => {
        try {
            const compressed = { ...cardData };
            
            // Comprimir imagem principal se existir
            if (compressed.image && typeof compressed.image === 'string' && compressed.image.length > 50000) {
                console.log('🖼️ Comprimindo imagem principal...');
                try {
                    compressed.image = await compressImage(compressed.image);
                    console.log('✅ Imagem principal comprimida');
                } catch (error) {
                    console.warn('⚠️ Erro ao comprimir imagem principal:', error);
                    // Se falhar, remover a imagem
                    compressed.image = null;
                }
            }
            
            // Comprimir imagens das seções de destaque
            if (compressed.featureSections && Array.isArray(compressed.featureSections)) {
                for (let i = 0; i < compressed.featureSections.length; i++) {
                    const section = compressed.featureSections[i];
                    if (section.image && typeof section.image === 'string' && section.image.length > 50000) {
                        console.log(`🖼️ Comprimindo imagem da seção ${i}...`);
                        try {
                            compressed.featureSections[i].image = await compressImage(section.image);
                            console.log(`✅ Imagem da seção ${i} comprimida`);
                        } catch (error) {
                            console.warn(`⚠️ Erro ao comprimir imagem da seção ${i}:`, error);
                            // Se falhar, remover a imagem
                            compressed.featureSections[i].image = null;
                        }
                    }
                }
            }
            
            resolve(compressed);
        } catch (error) {
            reject(error);
        }
    });
};

const compressImage = (base64String, quality = 0.3) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Redimensionar mais agressivamente
            const maxWidth = 400;
            const maxHeight = 300;
            
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
};

const extractEssentialData = (cardData) => {
    console.log('📋 Extraindo dados essenciais...');
    
    // Manter apenas dados essenciais, removendo imagens
    const essentialData = {
        personalInfo: cardData.personalInfo || {},
        design: cardData.design || {},
        links: cardData.links || [],
        featureSections: cardData.featureSections ? cardData.featureSections.map(section => ({
            title: section.title,
            description: section.description,
            // Remover imagem
            image: null
        })) : [],
        showSaveContactButton: cardData.showSaveContactButton !== false
    };
    
    console.log('✅ Dados essenciais extraídos (imagens removidas)');
    return essentialData;
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

// ========== FUNÇÃO DE LIMPEZA AUTOMÁTICA ==========
const autoCleanupIfNeeded = () => {
    try {
        // Verificar tamanho atual do localStorage
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length;
            }
        }
        
        // Se estiver usando mais de 3MB, fazer limpeza automática
        const maxSize = 3 * 1024 * 1024; // 3MB
        if (totalSize > maxSize) {
            console.log('🧹 localStorage muito cheio, fazendo limpeza automática...');
            
            // Limpar dados antigos mas manter cartões
            clearOldData();
            
            // Verificar se ainda está cheio
            let newSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    newSize += localStorage[key].length;
                }
            }
            
            console.log(`📊 Tamanho antes: ${(totalSize / 1024 / 1024).toFixed(2)}MB, depois: ${(newSize / 1024 / 1024).toFixed(2)}MB`);
            
            // Se ainda estiver cheio, mostrar aviso
            if (newSize > maxSize) {
                console.warn('⚠️ localStorage ainda muito cheio após limpeza');
                if (typeof window.showCustomNotification === 'function') {
                    window.showCustomNotification('⚠️ Armazenamento cheio. Considere remover cartões antigos.', 'warning', 5000);
                }
            }
        }
    } catch (error) {
        console.error('❌ Erro na limpeza automática:', error);
    }
};

// Exportar funções globais
window.initializeProfile = initializeProfile;
window.loadCards = loadCards;
window.loadStats = loadStats;
window.navigateToSection = navigateToSection;
window.refreshProfile = refreshProfile;

