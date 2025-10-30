/* ==========================================================================
   API SERVICE - Comunicação com o backend
   ========================================================================== */

// Detectar URL da API por ambiente: usa window.APP_CONFIG quando disponível, com fallback para localhost em desenvolvimento
const API_BASE_URL = (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL)
    ? window.APP_CONFIG.API_BASE_URL
    : 'http://localhost:5000';

// Classe para gerenciar comunicação com a API
class APIService {
    constructor() {
        this.token = localStorage.getItem('auth_token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }

    // Função auxiliar para fazer requisições
    async request(endpoint, options = {}) {
        try {
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };

            // Adicionar token se existir
            if (this.token) {
                headers['Authorization'] = `Bearer ${this.token}`;
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao fazer requisição');
            }

            return data;
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    }

    // ============================================
    // AUTENTICAÇÃO
    // ============================================

    async login(email, password) {
        const data = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        this.setAuth(data.data.token, data.data.user);
        return data;
    }

    async register(name, email, password) {
        const data = await this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });

        // Fazer login automático após registro
        if (data.success) {
            await this.login(email, password);
        }

        return data;
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        
        // Limpar dados de cartões do localStorage
        if (typeof CardsManager !== 'undefined') {
            CardsManager.clearAll();
        }
    }

    setAuth(token, user) {
        // Limpar dados antigos antes de fazer login
        if (typeof CardsManager !== 'undefined') {
            CardsManager.clearAll();
        }
        
        this.token = token;
        this.user = user;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Sincronizar com CardsManager para o perfil
        this.syncUserToCardsManager(user);
    }

    // Atualizar apenas o objeto de usuário local (sem chamar backend)
    updateLocalUser(partialUser) {
        this.user = { ...(this.user || {}), ...(partialUser || {}) };
        try {
            localStorage.setItem('user', JSON.stringify(this.user));
        } catch (e) {}
        // Re-sincronizar com CardsManager (para refletir na UI)
        this.syncUserToCardsManager(this.user);
        return this.user;
    }
    
    // Sincronizar usuário do login com CardsManager
    syncUserToCardsManager(user) {
        if (typeof CardsManager !== 'undefined') {
            CardsManager.saveUser({
                id: user.id || `user_${Date.now()}`,
                name: user.name,
                email: user.email,
                avatar: null,
                createdAt: user.createdAt || new Date().toISOString()
            });
            console.log('✅ Usuário sincronizado com CardsManager');
        }
    }

    isAuthenticated() {
        return !!this.token;
    }

    getCurrentUser() {
        return this.user;
    }

    // ============================================
    // CARTÕES
    // ============================================

    async getCards() {
        const data = await this.request('/api/cards', {
            method: 'GET'
        });

        return data.data || [];
    }

    async getCard(cardId) {
        const data = await this.request(`/api/cards/${cardId}`, {
            method: 'GET'
        });

        return data.data;
    }

    async createCard(cardData) {
        const data = await this.request('/api/cards', {
            method: 'POST',
            body: JSON.stringify(cardData)
        });

        return data.data;
    }

    async updateCard(cardId, cardData) {
        const data = await this.request(`/api/cards/${cardId}`, {
            method: 'PUT',
            body: JSON.stringify(cardData)
        });

        return data.data;
    }

    async deleteCard(cardId) {
        const data = await this.request(`/api/cards/${cardId}`, {
            method: 'DELETE'
        });

        return data;
    }

    async getPublicCard(cardId) {
        const data = await this.request(`/public/cards/${cardId}`, {
            method: 'GET'
        });

        return data.data;
    }
}

// Criar instância global do serviço de API
const apiService = new APIService();
