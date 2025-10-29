const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Schema do usuário para autenticação
 * Campos: nome, email (único), senha (criptografada) e data de criação
 */
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email é obrigatório'],
        lowercase: true,
        trim: true,
        index: { unique: true }
    },
    password: {
        type: String,
        required: [true, 'Senha é obrigatória']
    },
}, {
    timestamps: true // Cria automaticamente createdAt e updatedAt
});

// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function(next) {
    // Só fazer hash se a senha foi modificada
    if (!this.isModified('password')) return next();

    try {
        // Hash da senha com salt de 12 rounds
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};



module.exports = mongoose.model('User', userSchema);






