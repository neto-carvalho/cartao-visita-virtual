const mongoose = require('mongoose');

/**
 * Função para conectar ao banco de dados MongoDB
 * Utiliza a variável de ambiente MONGO_URI
 */
async function connectDB() {
    try {
        const MONGO_URI = process.env.MONGO_URI;
        
        if (!MONGO_URI) {
            throw new Error('MONGO_URI não encontrada nas variáveis de ambiente');
        }

        const options = {
            maxPoolSize: 10, // Máximo de conexões
            serverSelectionTimeoutMS: 5000, // Timeout de seleção de servidor
            socketTimeoutMS: 45000, // Timeout de socket
            bufferCommands: false, // Desabilitar buffering de comandos
        };

        // Configurações específicas para produção
        // Observação: Para MongoDB Atlas, não é necessário forçar ssl/tls via options;
        // o driver negocia automaticamente a conexão segura a partir da URI.
        // Removemos opções não suportadas como sslValidate para evitar erros.
        if (process.env.NODE_ENV === 'production') {
            // Mantemos apenas timeouts/ajustes genéricos definidos acima
        }

        const connection = await mongoose.connect(MONGO_URI, options);
        
        console.log('✅ Conectado ao MongoDB com sucesso!');
        console.log(`📊 Database: ${connection.connection.name}`);
        console.log(`🌍 Host: ${connection.connection.host}`);
        console.log(`🔌 Port: ${connection.connection.port}`);
        
        return connection;
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error.message);
        throw error;
    }
}

// Event listeners para monitoramento
mongoose.connection.on('connected', () => {
    console.log('🔗 MongoDB conectado');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Erro no MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('🔌 MongoDB desconectado');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('✅ Conexão MongoDB fechada devido ao encerramento da aplicação');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao fechar conexão MongoDB:', error);
        process.exit(1);
    }
});

module.exports = connectDB;
