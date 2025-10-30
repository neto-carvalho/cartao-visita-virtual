const Card = require('../models/Card');

/**
 * Controller para rotas públicas de cartões
 */
class PublicCardController {
    /**
     * Visualizar cartão público por ID
     * GET /public/cards/:id
     */
    async getPublicCard(req, res) {
        try {
            const { id } = req.params;

            const card = await Card.findOne({ _id: id, isActive: true });

            if (!card) {
                return res.status(404).json({
                    success: false,
                    message: 'Cartão não encontrado'
                });
            }

            // Incrementar visualizações
            await card.incrementViews();

            // Retornar dados públicos (sem userId) e com cor nos links
            const obj = card.toObject();
            const publicCard = {
                ...obj,
                userId: undefined,
                links: (obj.links || []).map(l => ({
                    ...l,
                    color: l.color || obj.color || '#00BFFF'
                }))
            };

            return res.status(200).json({
                success: true,
                message: 'Cartão obtido com sucesso',
                data: publicCard
            });

        } catch (error) {
            console.error('Erro ao obter cartão público:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao obter cartão',
                error: error.message
            });
        }
    }

    /**
     * Visualizar cartão público por URL pública
     * GET /public/cards/url/:publicUrl
     */
    async getCardByPublicUrl(req, res) {
        try {
            const { publicUrl } = req.params;

            const card = await Card.findByPublicUrl(publicUrl);

            if (!card) {
                return res.status(404).json({
                    success: false,
                    message: 'Cartão não encontrado'
                });
            }

            // Incrementar visualizações
            await card.incrementViews();

            const obj = card.toObject();
            const publicCard = {
                ...obj,
                userId: undefined,
                links: (obj.links || []).map(l => ({
                    ...l,
                    color: l.color || obj.color || '#00BFFF'
                }))
            };

            return res.status(200).json({
                success: true,
                message: 'Cartão obtido com sucesso',
                data: publicCard
            });

        } catch (error) {
            console.error('Erro ao obter cartão por URL:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao obter cartão',
                error: error.message
            });
        }
    }

    /**
     * Incrementar compartilhamentos
     * POST /public/cards/:id/share
     */
    async incrementShare(req, res) {
        try {
            const { id } = req.params;
            const card = await Card.findOne({ _id: id, isActive: true });
            if (!card) {
                return res.status(404).json({ success: false, message: 'Cartão não encontrado' });
            }
            card.shares = (card.shares || 0) + 1;
            await card.save();
            return res.status(200).json({ success: true, data: { shares: card.shares } });
        } catch (error) {
            console.error('Erro ao incrementar compartilhamentos:', error);
            return res.status(500).json({ success: false, message: 'Erro ao incrementar compartilhamentos' });
        }
    }

    /**
     * Incrementar contatos salvos
     * POST /public/cards/:id/contact
     */
    async incrementContact(req, res) {
        try {
            const { id } = req.params;
            const card = await Card.findOne({ _id: id, isActive: true });
            if (!card) {
                return res.status(404).json({ success: false, message: 'Cartão não encontrado' });
            }
            card.contacts = (card.contacts || 0) + 1;
            await card.save();
            return res.status(200).json({ success: true, data: { contacts: card.contacts } });
        } catch (error) {
            console.error('Erro ao incrementar contatos:', error);
            return res.status(500).json({ success: false, message: 'Erro ao incrementar contatos' });
        }
    }
}

module.exports = new PublicCardController();


