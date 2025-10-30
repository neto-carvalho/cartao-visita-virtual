const Card = require('../models/Card');

/**
 * Controller de cartões virtuais
 */
class CardController {
    /**
     * Criar novo cartão
     * POST /api/cards
     */
    async createCard(req, res) {
        try {
            console.log('📝 Criando cartão com dados:', req.body);
            console.log('👤 Usuário:', req.user);
            
            const userId = req.user.id;
            // Normalizar links: garantir title e type
            const normalizedLinks = Array.isArray(req.body.links)
                ? req.body.links.map(link => ({
                    title: link.title || link.type || 'link',
                    url: link.url,
                    type: link.type || 'custom',
                    color: link.color || req.body.color || '#00BFFF'
                }))
                : [];

            const cardData = {
                userId,
                ...req.body,
                links: normalizedLinks,
                featureSections: Array.isArray(req.body.featureSections) ? req.body.featureSections.map(sec => ({
                    title: sec.title || '',
                    description: sec.description || '',
                    image: sec.image || null,
                    buttonText: sec.buttonText || '',
                    buttonUrl: sec.buttonUrl || ''
                })) : []
            };

            console.log('💾 Dados do cartão a serem salvos:', cardData);

            const card = await Card.create(cardData);

            console.log('✅ Cartão criado com sucesso:', card._id);

            return res.status(201).json({
                success: true,
                message: 'Cartão criado com sucesso',
                data: card
            });

        } catch (error) {
            console.error('❌ Erro ao criar cartão:', error);
            console.error('Stack:', error.stack);
            return res.status(500).json({
                success: false,
                message: 'Erro ao criar cartão',
                error: error.message,
                details: error.toString()
            });
        }
    }

    /**
     * Listar todos os cartões do usuário
     * GET /api/cards
     */
    async getCards(req, res) {
        try {
            const userId = req.user.id;
            let cards = await Card.findByUser(userId);

            // Garantir que cada link tenha cor (compatibilidade retroativa)
            cards = cards.map((card) => {
                const obj = card.toObject();
                obj.links = (obj.links || []).map((l) => ({
                    ...l,
                    color: l.color || obj.color || '#00BFFF',
                }));
                return obj;
            });

            return res.status(200).json({
                success: true,
                message: 'Cartões obtidos com sucesso',
                data: cards
            });

        } catch (error) {
            console.error('Erro ao listar cartões:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao listar cartões',
                error: error.message
            });
        }
    }

    /**
     * Obter cartão específico do usuário
     * GET /api/cards/:id
     */
    async getCard(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const card = await Card.findOne({ _id: id, userId, isActive: true });

            if (!card) {
                return res.status(404).json({
                    success: false,
                    message: 'Cartão não encontrado'
                });
            }

            // Compatibilidade retroativa: garantir cor nos links
            const obj = card.toObject();
            obj.links = (obj.links || []).map((l) => ({
                ...l,
                color: l.color || obj.color || '#00BFFF',
            }));

            return res.status(200).json({
                success: true,
                message: 'Cartão obtido com sucesso',
                data: obj
            });

        } catch (error) {
            console.error('Erro ao obter cartão:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao obter cartão',
                error: error.message
            });
        }
    }

    /**
     * Atualizar cartão
     * PUT /api/cards/:id
     */
    async updateCard(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const card = await Card.findOne({ _id: id, userId, isActive: true });

            if (!card) {
                return res.status(404).json({
                    success: false,
                    message: 'Cartão não encontrado'
                });
            }

            // Atualizar campos
            Object.keys(req.body).forEach(key => {
                if (req.body[key] !== undefined) {
                    card[key] = req.body[key];
                }
            });

            await card.save();

            return res.status(200).json({
                success: true,
                message: 'Cartão atualizado com sucesso',
                data: card
            });

        } catch (error) {
            console.error('Erro ao atualizar cartão:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao atualizar cartão',
                error: error.message
            });
        }
    }

    /**
     * Deletar cartão
     * DELETE /api/cards/:id
     */
    async deleteCard(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const card = await Card.findOne({ _id: id, userId, isActive: true });

            if (!card) {
                return res.status(404).json({
                    success: false,
                    message: 'Cartão não encontrado'
                });
            }

            // Soft delete
            card.isActive = false;
            await card.save();

            return res.status(200).json({
                success: true,
                message: 'Cartão deletado com sucesso'
            });

        } catch (error) {
            console.error('Erro ao deletar cartão:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao deletar cartão',
                error: error.message
            });
        }
    }
}

module.exports = new CardController();
