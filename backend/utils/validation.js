const Joi = require('joi');

/**
 * Esquemas de validação usando Joi
 */
class ValidationSchemas {
    /**
     * Validação de dados do usuário
     */
    static user = {
        create: Joi.object({
            name: Joi.string().min(2).max(100).required().messages({
                'string.min': 'Nome deve ter pelo menos 2 caracteres',
                'string.max': 'Nome deve ter no máximo 100 caracteres',
                'any.required': 'Nome é obrigatório'
            }),
            email: Joi.string().email().required().messages({
                'string.email': 'Email deve ter um formato válido',
                'any.required': 'Email é obrigatório'
            }),
            password: Joi.string().min(6).required().messages({
                'string.min': 'Senha deve ter pelo menos 6 caracteres',
                'any.required': 'Senha é obrigatória'
            })
        }),

        update: Joi.object({
            name: Joi.string().min(2).max(100).optional(),
            email: Joi.string().email().optional(),
            avatar: Joi.string().uri().optional()
        })
    };

    /**
     * Validação de dados do cartão
     */
    static card = {
        create: Joi.object({
            name: Joi.string().min(1).max(100).required().messages({
                'string.min': 'Nome do cartão é obrigatório',
                'string.max': 'Nome deve ter no máximo 100 caracteres',
                'any.required': 'Nome do cartão é obrigatório'
            }),
            data: Joi.object({
                personalInfo: Joi.object({
                    fullName: Joi.string().min(1).max(100).required().messages({
                        'string.min': 'Nome completo é obrigatório',
                        'string.max': 'Nome deve ter no máximo 100 caracteres',
                        'any.required': 'Nome completo é obrigatório'
                    }),
                    jobTitle: Joi.string().max(100).optional(),
                    description: Joi.string().max(500).optional(),
                    email: Joi.string().email().required().messages({
                        'string.email': 'Email deve ter um formato válido',
                        'any.required': 'Email é obrigatório'
                    }),
                    phone: Joi.string().max(20).optional()
                }).required(),
                design: Joi.object({
                    theme: Joi.string().valid(
                        'gradient-pink', 'gradient-blue', 'gradient-purple',
                        'gradient-green', 'gradient-orange', 'gradient-red'
                    ).optional(),
                    primaryColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
                    secondaryColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
                    textColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
                    textAlignment: Joi.string().valid('center', 'left').optional()
                }).optional(),
                image: Joi.string().uri().optional(),
                links: Joi.array().items(
                    Joi.object({
                        title: Joi.string().max(50).required(),
                        url: Joi.string().uri().required(),
                        type: Joi.string().valid(
                            'website', 'instagram', 'facebook', 'twitter',
                            'linkedin', 'youtube', 'whatsapp', 'telegram',
                            'tiktok', 'shop', 'portfolio', 'custom'
                        ).optional(),
                        color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional()
                    })
                ).optional(),
                featureSections: Joi.array().items(
                    Joi.object({
                        title: Joi.string().max(100).required(),
                        description: Joi.string().max(500).optional(),
                        image: Joi.string().uri().optional(),
                        buttonText: Joi.string().max(50).optional(),
                        buttonUrl: Joi.string().uri().optional()
                    })
                ).optional(),
                showSaveContactButton: Joi.boolean().optional()
            }).required()
        }),

        update: Joi.object({
            name: Joi.string().min(1).max(100).optional(),
            data: Joi.object().optional(),
            isActive: Joi.boolean().optional(),
            isFavorite: Joi.boolean().optional()
        })
    };

    /**
     * Validação de parâmetros de paginação
     */
    static pagination = Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        sort: Joi.string().valid('createdAt', 'updatedAt', 'views', 'shares').default('createdAt'),
        order: Joi.string().valid('asc', 'desc').default('desc')
    });

    /**
     * Validação de ID do MongoDB
     */
    static mongoId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
        'string.pattern.base': 'ID deve ser um ObjectId válido do MongoDB'
    });

    /**
     * Validação de email
     */
    static email = Joi.string().email().required().messages({
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório'
    });

    /**
     * Validação de senha
     */
    static password = Joi.string().min(6).required().messages({
        'string.min': 'Senha deve ter pelo menos 6 caracteres',
        'any.required': 'Senha é obrigatória'
    });
}

module.exports = ValidationSchemas;








