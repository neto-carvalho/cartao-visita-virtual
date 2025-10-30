const mongoose = require('mongoose');

/**
 * Schema do cartão de visita virtual
 * Estruturado para facilitar futuras expansões
 */
const cardSchema = new mongoose.Schema({
    // Referência ao usuário dono do cartão
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'ID do usuário é obrigatório'],
        index: true
    },
    
    // Informações pessoais
    name: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true,
        maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
    },
    jobTitle: {
        type: String,
        trim: true,
        maxlength: [100, 'Cargo deve ter no máximo 100 caracteres']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Descrição deve ter no máximo 500 caracteres']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    
    // Imagem e design
    image: {
        type: String,
        default: null
    },
    color: {
        type: String,
        default: '#00BFFF'
    },
    // Gradiente personalizado gerado no editor (CSS string), opcional
    customGradient: {
        type: String,
        default: null
    },
    theme: {
        type: String,
        // Aceitar qualquer tema definido pelo frontend (gradients diversos ou vazio quando customGradient)
        default: 'modern'
    },
    
    // Lista de links personalizados
    links: [{
        title: {
            type: String,
            required: true,
            trim: true
        },
        url: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: ['website', 'instagram', 'facebook', 'twitter', 'linkedin', 'youtube', 'whatsapp', 'custom'],
            default: 'custom'
        },
        color: {
            type: String,
            default: null
        }
    }],
    
    // Seções de destaque opcionais (cards de conteúdo)
    featureSections: [{
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        image: { type: String, default: null },
        buttonText: { type: String, trim: true },
        buttonUrl: { type: String, trim: true }
    }],
    
    // Contadores (estatísticas)
    views: {
        type: Number,
        default: 0
    },
    shares: {
        type: Number,
        default: 0
    },
    
    // URLs e identificadores
    publicUrl: {
        type: String,
        sparse: true,
        index: { unique: true }
    },
    
    // Status
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Cria automaticamente createdAt e updatedAt
});

// Índices para melhor performance
cardSchema.index({ userId: 1, isActive: 1 });
cardSchema.index({ createdAt: -1 });

// Middleware para gerar URL pública antes de salvar
cardSchema.pre('save', function(next) {
    if (this.isNew && !this.publicUrl) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        this.publicUrl = `card_${timestamp}_${random}`;
    }
    next();
});

// Métodos para incrementar contadores
cardSchema.methods.incrementViews = function() {
    this.views += 1;
    return this.save();
};

cardSchema.methods.incrementShares = function() {
    this.shares += 1;
    return this.save();
};

// Métodos estáticos úteis
cardSchema.statics.findByUser = function(userId) {
    return this.find({ userId, isActive: true }).sort({ createdAt: -1 });
};

cardSchema.statics.findByPublicUrl = function(publicUrl) {
    return this.findOne({ publicUrl, isActive: true });
};

module.exports = mongoose.model('Card', cardSchema);






