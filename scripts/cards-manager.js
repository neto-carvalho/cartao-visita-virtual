/* ==========================================================================
   CARDS-MANAGER.JS - Gerenciamento de Múltiplos Cartões
   ========================================================================== */

// Estrutura de dados dos cartões
const CardsManager = {
    STORAGE_KEY: 'virtual-cards-collection',
    
    // Inicializar sistema
    init() {
        console.log('🎴 Inicializando gerenciador de cartões...');
        this.ensureStorage();
        console.log('✅ Gerenciador de cartões inicializado');
    },
    
    // Garantir estrutura de storage
    ensureStorage() {
        const data = this.loadAll();
        if (!data || !data.cards) {
            this.saveAll({
                user: this.getDefaultUser(),
                cards: []
            });
        }
    },
    
    // Usuário padrão
    getDefaultUser() {
        return {
            id: 'user_' + Date.now(),
            name: 'Usuário',
            email: 'usuario@email.com',
            avatar: null,
            createdAt: new Date().toISOString()
        };
    },
    
    // Carregar todos os dados
    loadAll() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return null;
        }
    },
    
    // Salvar todos os dados
    saveAll(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            return false;
        }
    },
    
    // Obter todos os cartões
    getAllCards() {
        const data = this.loadAll();
        return data?.cards || [];
    },
    
    // Obter cartão por ID
    getCardById(cardId) {
        const cards = this.getAllCards();
        return cards.find(card => card.id === cardId);
    },
    
    // Criar novo cartão
    createCard(cardData) {
        const data = this.loadAll();
        
        const newCard = {
            id: 'card_' + Date.now(),
            name: cardData.name || 'Novo Cartão',
            data: cardData.data || window.appState || {},
            thumbnail: cardData.thumbnail || null,
            isActive: true,
            isFavorite: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            views: 0,
            shares: 0,
            contacts: 0
        };
        
        data.cards.push(newCard);
        this.saveAll(data);
        
        console.log('✅ Cartão criado:', newCard.id);
        return newCard;
    },
    
    // Atualizar cartão
    updateCard(cardId, updates) {
        console.log('🔄 Atualizando cartão:', cardId, updates);
        
        const data = this.loadAll();
        if (!data || !data.cards) {
            console.error('❌ Dados não encontrados');
            return null;
        }
        
        const cardIndex = data.cards.findIndex(card => card.id === cardId);
        
        if (cardIndex === -1) {
            console.error('❌ Cartão não encontrado:', cardId);
            return null;
        }
        
        // Criar uma cópia do cartão atual
        const currentCard = { ...data.cards[cardIndex] };
        
        // Aplicar as atualizações
        const updatedCard = {
            ...currentCard,
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        // Substituir o cartão na lista
        data.cards[cardIndex] = updatedCard;
        
        // Salvar no localStorage
        const saveResult = this.saveAll(data);
        
        if (saveResult) {
            console.log('✅ Cartão atualizado com sucesso:', updatedCard);
            return updatedCard;
        } else {
            console.error('❌ Erro ao salvar atualização do cartão');
            return null;
        }
    },
    
    // Deletar cartão
    deleteCard(cardId) {
        const data = this.loadAll();
        const cardIndex = data.cards.findIndex(card => card.id === cardId);
        
        if (cardIndex === -1) {
            console.error('Cartão não encontrado:', cardId);
            return false;
        }
        
        data.cards.splice(cardIndex, 1);
        this.saveAll(data);
        
        console.log('🗑️ Cartão deletado:', cardId);
        return true;
    },
    
    // Duplicar cartão
    duplicateCard(cardId) {
        const originalCard = this.getCardById(cardId);
        if (!originalCard) {
            console.error('Cartão não encontrado:', cardId);
            return null;
        }
        
        const duplicatedCard = {
            ...originalCard,
            id: 'card_' + Date.now(),
            name: originalCard.name + ' (Cópia)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            views: 0,
            shares: 0,
            contacts: 0,
            isFavorite: false
        };
        
        const data = this.loadAll();
        data.cards.push(duplicatedCard);
        this.saveAll(data);
        
        console.log('📋 Cartão duplicado:', duplicatedCard.id);
        return duplicatedCard;
    },
    
    // Toggle favorito
    toggleFavorite(cardId) {
        const card = this.getCardById(cardId);
        if (!card) return null;
        
        return this.updateCard(cardId, {
            isFavorite: !card.isFavorite
        });
    },
    
    // Toggle ativo/inativo
    toggleActive(cardId) {
        const card = this.getCardById(cardId);
        if (!card) return null;
        
        return this.updateCard(cardId, {
            isActive: !card.isActive
        });
    },
    
    // Incrementar visualizações
    incrementViews(cardId) {
        const card = this.getCardById(cardId);
        if (!card) return null;
        
        return this.updateCard(cardId, {
            views: (card.views || 0) + 1
        });
    },
    
    // Incrementar compartilhamentos
    incrementShares(cardId) {
        const card = this.getCardById(cardId);
        if (!card) return null;
        
        return this.updateCard(cardId, {
            shares: (card.shares || 0) + 1
        });
    },
    
    // Incrementar contatos salvos
    incrementContacts(cardId) {
        const card = this.getCardById(cardId);
        if (!card) return null;
        
        return this.updateCard(cardId, {
            contacts: (card.contacts || 0) + 1
        });
    },
    
    // Obter estatísticas gerais
    getStats() {
        const cards = this.getAllCards();
        
        return {
            totalCards: cards.length,
            activeCards: cards.filter(c => c.isActive).length,
            inactiveCards: cards.filter(c => !c.isActive).length,
            favoriteCards: cards.filter(c => c.isFavorite).length,
            totalViews: cards.reduce((sum, c) => sum + (c.views || 0), 0),
            totalShares: cards.reduce((sum, c) => sum + (c.shares || 0), 0),
            totalContacts: cards.reduce((sum, c) => sum + (c.contacts || 0), 0)
        };
    },
    
    // Pesquisar cartões
    searchCards(query) {
        const cards = this.getAllCards();
        const lowerQuery = query.toLowerCase();
        
        return cards.filter(card => 
            card.name.toLowerCase().includes(lowerQuery) ||
            card.data?.personalInfo?.fullName?.toLowerCase().includes(lowerQuery) ||
            card.data?.personalInfo?.jobTitle?.toLowerCase().includes(lowerQuery)
        );
    },
    
    // Filtrar cartões
    filterCards(filter) {
        const cards = this.getAllCards();
        
        switch(filter) {
            case 'active':
                return cards.filter(c => c.isActive);
            case 'inactive':
                return cards.filter(c => !c.isActive);
            case 'favorites':
                return cards.filter(c => c.isFavorite);
            case 'recent':
                return cards.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            default:
                return cards;
        }
    },
    
    // Obter informações do usuário
    getUser() {
        const data = this.loadAll();
        return data?.user || this.getDefaultUser();
    },
    
    // Atualizar informações do usuário
    updateUser(updates) {
        const data = this.loadAll();
        data.user = {
            ...data.user,
            ...updates
        };
        this.saveAll(data);
        console.log('✅ Usuário atualizado');
        return data.user;
    },
    
    // Salvar usuário completo
    saveUser(user) {
        const data = this.loadAll();
        data.user = user;
        this.saveAll(data);
        console.log('✅ Usuário salvo');
        return user;
    },
    
    // Obter configurações
    getSettings() {
        try {
            const settings = localStorage.getItem('virtual-card-settings');
            return settings ? JSON.parse(settings) : {
                emailNotifications: true,
                autoSave: true
            };
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            return {
                emailNotifications: true,
                autoSave: true
            };
        }
    },
    
    // Salvar configurações
    saveSettings(settings) {
        try {
            localStorage.setItem('virtual-card-settings', JSON.stringify(settings));
            console.log('✅ Configurações salvas');
            return settings;
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            return null;
        }
    }
};

// Inicializar ao carregar
if (typeof window !== 'undefined') {
    window.CardsManager = CardsManager;
    CardsManager.init();
}

