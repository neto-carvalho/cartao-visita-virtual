const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let authToken = '';
let testUserId = '';
let testCardId = '';

console.log('🧪 Testando API do Cartão de Visita Virtual\n');

// Função auxiliar para fazer requisições
async function makeRequest(method, url, data = null, token = null) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${url}`,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || error.message,
            status: error.response?.status
        };
    }
}

// Teste 1: Health Check
async function testHealthCheck() {
    console.log('📋 Teste 1: Health Check');
    const result = await makeRequest('GET', '/health');
    console.log('✅ Health Check:', result.message || result.status);
    console.log('');
}

// Teste 2: Registro de usuário
async function testRegister() {
    console.log('📋 Teste 2: Registro de usuário');
    const userData = {
        name: 'João Silva',
        email: `joao${Date.now()}@example.com`,
        password: 'senha123'
    };
    
    const result = await makeRequest('POST', '/api/auth/register', userData);
    
    if (result.success) {
        console.log('✅ Usuário registrado:', result.data.name);
        console.log(`   Email: ${result.data.email}`);
        console.log(`   ID: ${result.data.id}`);
    } else {
        console.log('❌ Erro ao registrar:', result.message);
    }
    console.log('');
}

// Teste 3: Login
async function testLogin() {
    console.log('📋 Teste 3: Login');
    const loginData = {
        email: 'joao@example.com',
        password: 'senha123'
    };
    
    const result = await makeRequest('POST', '/api/auth/login', loginData);
    
    if (result.success) {
        authToken = result.data.token;
        testUserId = result.data.user.id;
        console.log('✅ Login realizado com sucesso!');
        console.log(`   Token: ${authToken.substring(0, 20)}...`);
        console.log(`   Usuário: ${result.data.user.name}`);
    } else {
        console.log('❌ Erro no login:', result.message);
    }
    console.log('');
}

// Teste 4: Criar cartão
async function testCreateCard() {
    console.log('📋 Teste 4: Criar cartão');
    const cardData = {
        name: 'João Silva',
        jobTitle: 'Desenvolvedor Full Stack',
        description: 'Especialista em desenvolvimento web moderno',
        email: 'joao@example.com',
        phone: '+55 11 98765-4321',
        color: '#00BFFF',
        theme: 'modern',
        links: [
            {
                title: 'LinkedIn',
                url: 'https://linkedin.com/in/joaosilva',
                type: 'linkedin'
            },
            {
                title: 'GitHub',
                url: 'https://github.com/joaosilva',
                type: 'custom'
            }
        ]
    };
    
    const result = await makeRequest('POST', '/api/cards', cardData, authToken);
    
    if (result.success) {
        testCardId = result.data._id;
        console.log('✅ Cartão criado com sucesso!');
        console.log(`   ID: ${testCardId}`);
        console.log(`   Nome: ${result.data.name}`);
        console.log(`   Visualizações: ${result.data.views}`);
    } else {
        console.log('❌ Erro ao criar cartão:', result.message);
    }
    console.log('');
}

// Teste 5: Listar cartões
async function testGetCards() {
    console.log('📋 Teste 5: Listar cartões');
    const result = await makeRequest('GET', '/api/cards', null, authToken);
    
    if (result.success) {
        console.log(`✅ Total de cartões: ${result.data.length}`);
        result.data.forEach((card, index) => {
            console.log(`   ${index + 1}. ${card.name} (${card.jobTitle})`);
        });
    } else {
        console.log('❌ Erro ao listar cartões:', result.message);
    }
    console.log('');
}

// Teste 6: Obter cartão específico
async function testGetCard() {
    if (!testCardId) {
        console.log('⚠️  Pulando teste - cartão não foi criado');
        return;
    }
    
    console.log('📋 Teste 6: Obter cartão específico');
    const result = await makeRequest('GET', `/api/cards/${testCardId}`, null, authToken);
    
    if (result.success) {
        console.log('✅ Cartão obtido:');
        console.log(`   Nome: ${result.data.name}`);
        console.log(`   Links: ${result.data.links.length}`);
        console.log(`   Visualizações: ${result.data.views}`);
    } else {
        console.log('❌ Erro ao obter cartão:', result.message);
    }
    console.log('');
}

// Teste 7: Atualizar cartão
async function testUpdateCard() {
    if (!testCardId) {
        console.log('⚠️  Pulando teste - cartão não foi criado');
        return;
    }
    
    console.log('📋 Teste 7: Atualizar cartão');
    const updateData = {
        jobTitle: 'Desenvolvedor Sênior Full Stack',
        phone: '+55 11 99999-8888'
    };
    
    const result = await makeRequest('PUT', `/api/cards/${testCardId}`, updateData, authToken);
    
    if (result.success) {
        console.log('✅ Cartão atualizado:');
        console.log(`   Novo cargo: ${result.data.jobTitle}`);
        console.log(`   Novo telefone: ${result.data.phone}`);
    } else {
        console.log('❌ Erro ao atualizar cartão:', result.message);
    }
    console.log('');
}

// Teste 8: Visualização pública
async function testPublicView() {
    if (!testCardId) {
        console.log('⚠️  Pulando teste - cartão não foi criado');
        return;
    }
    
    console.log('📋 Teste 8: Visualização pública');
    const result = await makeRequest('GET', `/public/cards/${testCardId}`);
    
    if (result.success) {
        console.log('✅ Visualização pública funcionando:');
        console.log(`   Nome: ${result.data.name}`);
        console.log(`   Visualizações atualizadas: ${result.data.views}`);
    } else {
        console.log('❌ Erro na visualização pública:', result.message);
    }
    console.log('');
}

// Teste 9: Deletar cartão (soft delete)
async function testDeleteCard() {
    if (!testCardId) {
        console.log('⚠️  Pulando teste - cartão não foi criado');
        return;
    }
    
    console.log('📋 Teste 9: Deletar cartão');
    const result = await makeRequest('DELETE', `/api/cards/${testCardId}`, null, authToken);
    
    if (result.success) {
        console.log('✅ Cartão deletado com sucesso!');
    } else {
        console.log('❌ Erro ao deletar cartão:', result.message);
    }
    console.log('');
}

// Executar todos os testes
async function runAllTests() {
    try {
        await testHealthCheck();
        await testLogin();
        await testCreateCard();
        await testGetCards();
        await testGetCard();
        await testUpdateCard();
        await testPublicView();
        await testDeleteCard();
        
        console.log('🎉 Todos os testes concluídos!\n');
    } catch (error) {
        console.error('❌ Erro ao executar testes:', error.message);
    }
}

runAllTests();


