/* ==========================================================================
   EDITOR.JS - Lógica do editor de cartão com layout de duas colunas
   ========================================================================== */

// Usar referência direta ao estado global
const getEditorState = () => window.appState;

// Inicializar editor quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar app.js inicializar
    setTimeout(() => {
        if (window.appState) {
            initializeEditor();
        }
    }, 100);
});

// Inicializar editor
const initializeEditor = () => {
    console.log('📝 Inicializando editor...');
    
    // Verificar se é um novo cartão e limpar dados se necessário
    const isNewCard = localStorage.getItem('creating-new-card');
    if (isNewCard) {
        console.log('🆕 Novo cartão detectado - limpando dados...');
        clearEditorData();
        localStorage.removeItem('creating-new-card');
    }
    
    loadSavedData();
    initializePersonalInfo();
    initializeDesign();
    initializeImageUpload();
    initializeLinksEditor();
    initializeActions();
    initializePreviewControls();
    // updatePreview() é chamado automaticamente por preview.js
    
    console.log('✅ Editor inicializado');
};

// Limpar dados do editor para novo cartão
const clearEditorData = () => {
    console.log('🧹 Limpando dados do editor...');
    
    // Resetar para estado inicial
    Object.assign(window.appState, {
        personalInfo: {
            fullName: '',
            jobTitle: '',
            description: '',
            email: '',
            phone: ''
        },
        design: {
            theme: 'gradient-pink',
            primaryColor: '#00BFFF',
            secondaryColor: '#EEE8AA',
            textColor: '#FFFFFF',
            buttonTextColor: '#FFFFFF',
            customGradient: null
        },
        image: null,
        links: [],
        featureSections: [],
        showSaveContactButton: true,
        generatedUrl: null
    });
    
    // Limpar localStorage
    localStorage.removeItem('virtual-card-data');
    
    console.log('✅ Dados do editor limpos');
};

// ==========================================================================
// UTILITÁRIOS
// ==========================================================================

const loadSavedData = () => {
    // Os dados já estão carregados em window.appState pelo app.js
    console.log('📋 Dados carregados no editor:', window.appState);
    console.log('📋 Personal Info:', window.appState.personalInfo);
    console.log('📋 Design:', window.appState.design);
    console.log('📋 Links:', window.appState.links);
    console.log('📋 Feature Sections:', window.appState.featureSections);
    
    // Verificar se está editando um cartão
    const editingCardId = localStorage.getItem('editing-card-id');
    if (editingCardId) {
        console.log('🔍 Modo de edição detectado. ID do cartão:', editingCardId);
        
        // Aguardar um pouco para garantir que os dados foram carregados
        setTimeout(() => {
            console.log('📋 Dados após timeout:', window.appState);
            if (window.appState.personalInfo && window.appState.personalInfo.fullName) {
                console.log('✅ Dados do cartão carregados corretamente');
            } else {
                console.warn('⚠️ Dados do cartão não foram carregados, tentando novamente...');
                // Tentar carregar novamente
                if (window.CardsManager) {
                    const card = window.CardsManager.getCardById(editingCardId);
                    if (card && card.data) {
                        console.log('🔄 Recarregando dados do cartão...');
                        Object.assign(window.appState, card.data);
                        console.log('✅ Dados recarregados:', window.appState);
                    }
                }
            }
        }, 500);
    }
};

const saveData = async () => {
    // Salvar no localStorage através do app.js
    if (window.Utils && typeof window.Utils.saveToStorage === 'function') {
        console.log('💾 Salvando dados do editor...');
        const success = await window.Utils.saveToStorage(window.appState);
        if (!success) {
            console.warn('⚠️ Falha ao salvar dados, mas continuando...');
        }
    } else {
        localStorage.setItem('virtual-card-data', JSON.stringify(window.appState));
    }
};

const showNotification = (message, type = 'success') => {
    // Criar notificação simples
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
};

// ==========================================================================
// INFORMAÇÕES PESSOAIS
// ==========================================================================

const initializePersonalInfo = () => {
    const inputs = {
        fullName: document.getElementById('fullName'),
        jobTitle: document.getElementById('jobTitle'),
        description: document.getElementById('description'),
        email: document.getElementById('email')
    };

    // Carregar dados existentes
    Object.keys(inputs).forEach(key => {
        if (inputs[key] && window.appState.personalInfo[key]) {
            inputs[key].value = window.appState.personalInfo[key];
        }
    });

    // Adicionar event listeners
    Object.keys(inputs).forEach(key => {
        if (inputs[key]) {
            inputs[key].addEventListener('input', async (e) => {
                window.appState.personalInfo[key] = e.target.value;
                await saveData();
                if (typeof window.updatePreview === 'function') {
                    window.updatePreview();
                }
            });
        }
    });
};

// ==========================================================================
// DESIGN
// ==========================================================================

const initializeDesign = () => {
    initializeThemes();
    initializeColors();
    initializeCustomGradient();
};

const initializeThemes = () => {
    const themeButtons = document.querySelectorAll('.theme-btn');
    
    // Marcar tema ativo
    themeButtons.forEach(btn => {
        if (btn.dataset.theme === window.appState.design.theme) {
            btn.classList.add('active');
        }
    });

    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.dataset.theme;
            
            // Remover active de todos os botões
            themeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adicionar active ao clicado
            button.classList.add('active');
            
            // Atualizar estado
            window.appState.design.theme = theme;
            saveData();
            if (typeof window.updatePreview === 'function') {
                window.updatePreview(true);
            }
        });
    });
};

const initializeCustomGradient = () => {
    const applyBtn = document.getElementById('applyCustomGradient');
    const clearBtn = document.getElementById('clearCustomGradient');
    const color1Input = document.getElementById('gradientColor1');
    const color2Input = document.getElementById('gradientColor2');
    
    if (applyBtn && color1Input && color2Input) {
        applyBtn.addEventListener('click', () => {
            const color1 = color1Input.value;
            const color2 = color2Input.value;
            const customGradient = `linear-gradient(135deg, ${color1}, ${color2})`;
            
            // Atualizar estado
            window.appState.design.customGradient = customGradient;
            window.appState.design.theme = ''; // Limpar tema pré-definido
            
            // Desmarcar todos os botões de tema
            document.querySelectorAll('.theme-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            saveData();
            if (typeof window.updatePreview === 'function') {
                window.updatePreview(true);
            }
            
            Utils.showNotification('Gradiente personalizado aplicado!', 'success');
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            window.appState.design.customGradient = null;
            window.appState.design.theme = 'gradient-pink'; // Voltar para padrão
            
            // Marcar tema padrão
            const defaultThemeBtn = document.querySelector('[data-theme="gradient-pink"]');
            if (defaultThemeBtn) {
                document.querySelectorAll('.theme-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                defaultThemeBtn.classList.add('active');
            }
            
            saveData();
            if (typeof window.updatePreview === 'function') {
                window.updatePreview(true);
            }
            
            Utils.showNotification('Gradiente personalizado removido!', 'success');
        });
    }
};

const initializeColors = () => {
    const primaryColorInput = document.getElementById('primaryColor');
    
    if (primaryColorInput) {
        // Carregar cor existente
        if (window.appState.design.primaryColor) {
            primaryColorInput.value = window.appState.design.primaryColor;
        }
        
        // Adicionar event listener
        primaryColorInput.addEventListener('change', (e) => {
            window.appState.design.primaryColor = e.target.value;
            saveData();
            if (typeof window.updatePreview === 'function') {
                window.updatePreview();
            }
        });
    }
};


// ==========================================================================
// UPLOAD DE IMAGEM
// ==========================================================================

const initializeImageUpload = () => {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');

    if (!uploadArea || !imageInput || !imagePreview) return;

    // Carregar imagem existente
    if (window.appState.image) {
        showImagePreview(window.appState.image);
    }

    // Click para abrir seletor de arquivo
    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageFile(files[0]);
        }
    });

    // Seleção de arquivo
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageFile(e.target.files[0]);
        }
    });
};

const handleImageFile = (file) => {
    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        (window.Utils?.showNotification || showNotification)('Tipo de arquivo não suportado. Use JPG, PNG ou WebP.', 'error');
        return;
    }

    // Validar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        (window.Utils?.showNotification || showNotification)('Arquivo muito grande. Máximo 5MB.', 'error');
        return;
    }

    // Mostrar loading
        (window.Utils?.showNotification || showNotification)('Processando imagem...', 'success');

    // Converter para base64
    const reader = new FileReader();
    reader.onload = async (e) => {
        window.appState.image = e.target.result;
        await saveData();
        showImagePreview(e.target.result);
        if (typeof window.updatePreview === 'function') {
            window.updatePreview(true);
        }
        (window.Utils?.showNotification || showNotification)('Imagem carregada com sucesso!');
    };
    
    reader.onerror = () => {
        (window.Utils?.showNotification || showNotification)('Erro ao carregar imagem. Tente novamente.', 'error');
    };
    
    reader.readAsDataURL(file);
};

const showImagePreview = (imageSrc) => {
    const uploadArea = document.getElementById('uploadArea');
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');

    if (!imagePreview || !previewImage) return;

    previewImage.src = imageSrc;
    imagePreview.classList.remove('hidden');
    uploadArea.classList.add('hidden');
};

// Função global para remover imagem
window.removeImage = async () => {
    const uploadArea = document.getElementById('uploadArea');
    const imagePreview = document.getElementById('imagePreview');
    const imageInput = document.getElementById('imageInput');

    window.appState.image = null;
    await saveData();

    if (imagePreview) {
        imagePreview.classList.add('hidden');
    }

    if (uploadArea) {
        uploadArea.classList.remove('hidden');
    }

    if (imageInput) {
        imageInput.value = '';
    }

    if (typeof window.updatePreview === 'function') {
        window.updatePreview(true);
    }
    showNotification('Imagem removida com sucesso');
};

// ==========================================================================
// GERENCIAMENTO DE LINKS - Funções auxiliares específicas do editor
// ==========================================================================

// Inicializar sistema de links no editor
const initializeLinksEditor = () => {
    const addLinkBtn = document.getElementById('addLinkBtn');
    if (addLinkBtn) {
        addLinkBtn.addEventListener('click', addNewLink);
    }
    
    // Carregar links existentes
    renderLinks();
};

const addNewLink = async () => {
    const newLink = {
        id: Date.now(),
        type: '',
        title: '',
        url: '',
        color: window.appState.design.primaryColor
    };
    
    window.appState.links.push(newLink);
    await saveData();
    renderLinks();
    if (typeof window.updatePreview === 'function') {
        window.updatePreview();
    }
};

const removeLink = async (linkId) => {
    window.appState.links = window.appState.links.filter(link => link.id !== linkId);
    await saveData();
    renderLinks();
    if (typeof window.updatePreview === 'function') {
        window.updatePreview();
    }
};

const updateLink = async (linkId, field, value) => {
    const link = window.appState.links.find(l => l.id === linkId);
    if (link) {
        link[field] = value;
        await saveData();
        if (typeof window.updatePreview === 'function') {
            window.updatePreview();
        }
    }
};

const renderLinks = () => {
    const container = document.getElementById('linksContainer');
    if (!container) return;
    
    if (window.appState.links.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhum link adicionado ainda</p>';
        return;
    }
    
    container.innerHTML = window.appState.links.map(link => `
        <div class="link-item bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div class="flex justify-between items-center mb-4">
                <select class="link-type px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        onchange="updateLink(${link.id}, 'type', this.value)">
                    <option value="">Selecione o tipo</option>
                    <option value="instagram" ${link.type === 'instagram' ? 'selected' : ''}>Instagram</option>
                    <option value="tiktok" ${link.type === 'tiktok' ? 'selected' : ''}>TikTok</option>
                    <option value="youtube" ${link.type === 'youtube' ? 'selected' : ''}>YouTube</option>
                    <option value="whatsapp" ${link.type === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
                    <option value="telegram" ${link.type === 'telegram' ? 'selected' : ''}>Telegram</option>
                    <option value="linkedin" ${link.type === 'linkedin' ? 'selected' : ''}>LinkedIn</option>
                    <option value="twitter" ${link.type === 'twitter' ? 'selected' : ''}>Twitter</option>
                    <option value="facebook" ${link.type === 'facebook' ? 'selected' : ''}>Facebook</option>
                    <option value="shop" ${link.type === 'shop' ? 'selected' : ''}>Loja/Produtos</option>
                    <option value="portfolio" ${link.type === 'portfolio' ? 'selected' : ''}>Portfólio</option>
                    <option value="website" ${link.type === 'website' ? 'selected' : ''}>Website</option>
                    <option value="custom" ${link.type === 'custom' ? 'selected' : ''}>Personalizado</option>
                </select>
                <button onclick="removeLink(${link.id})" class="ml-2 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="space-y-3">
                <input type="text" class="link-title w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                       placeholder="Título do link (ex: Meu Instagram)" 
                       value="${link.title}"
                       oninput="updateLink(${link.id}, 'title', this.value)">
                <input type="url" class="link-url w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                       placeholder="https://..." 
                       value="${link.url}"
                       oninput="updateLink(${link.id}, 'url', this.value)">
                <div class="flex items-center space-x-3">
                    <label class="text-sm font-medium text-gray-700">Cor do botão:</label>
                    <input type="color" class="link-button-color w-12 h-8 border border-gray-300 rounded cursor-pointer" 
                           value="${link.color}"
                           onchange="updateLink(${link.id}, 'color', this.value)">
                </div>
            </div>
        </div>
    `).join('');
};

// ==========================================================================
// AÇÕES
// ==========================================================================

const initializeActions = () => {
    const generateBtn = document.getElementById('generateCard');
    const saveBtn = document.getElementById('saveCard');
    const qrBtn = document.getElementById('generateQRCode');
    
    if (generateBtn) {
        generateBtn.addEventListener('click', generateCard);
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', saveCard);
    }
    
    if (qrBtn) {
        qrBtn.addEventListener('click', () => {
            (window.Utils?.showNotification || showNotification)('Função de QR Code em desenvolvimento!', 'error');
        });
    }
};

const initializePreviewControls = () => {
    const rotateBtn = document.getElementById('previewRotate');
    const zoomBtn = document.getElementById('previewZoom');
    
    if (rotateBtn) {
        rotateBtn.addEventListener('click', () => {
            const preview = document.querySelector('.mobile-preview');
            if (preview) {
                preview.style.transform = preview.style.transform === 'rotate(90deg)' ? 'rotate(0deg)' : 'rotate(90deg)';
            }
        });
    }
    
    if (zoomBtn) {
        zoomBtn.addEventListener('click', () => {
            const preview = document.querySelector('.mobile-preview');
            if (preview) {
                const currentScale = preview.style.transform.includes('scale') ? 
                    parseFloat(preview.style.transform.match(/scale\(([^)]+)\)/)?.[1] || 1) : 1;
                const newScale = currentScale === 1 ? 1.2 : 1;
                preview.style.transform = `scale(${newScale})`;
            }
        });
    }
};

const generateCard = async () => {
    // Validar dados obrigatórios
    if (!window.appState.personalInfo.fullName || !window.appState.personalInfo.email) {
        (window.Utils?.showNotification || showNotification)('Nome e e-mail são obrigatórios', 'error');
        return;
    }
    
    try {
        // Gerar URL única
        const cardUrl = window.Utils?.generateUniqueUrl() || `${window.location.origin}/card.html?id=${Date.now().toString(36)}`;
        window.appState.generatedUrl = cardUrl;
        
        // Salvar dados para o cartão
        await saveData();
        
        // Gerar QR Code usando função do qr-generator.js
        if (typeof generateQRCode === 'function') {
            await generateQRCode(cardUrl);
        } else {
            // Fallback se a função não estiver disponível
            const qrcodeDiv = document.getElementById('qrcode');
            if (qrcodeDiv && typeof QRCode !== 'undefined') {
                qrcodeDiv.innerHTML = '';
                QRCode.toCanvas(qrcodeDiv, cardUrl, {
                    width: 200,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
            }
        }
        
        // Mostrar informações geradas
        if (typeof window.showGeneratedInfo === 'function') {
            window.showGeneratedInfo(cardUrl);
        } else if (typeof showGeneratedInfo === 'function') {
            showGeneratedInfo(cardUrl);
        }
        
        (window.Utils?.showNotification || showNotification)('Cartão gerado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao gerar cartão:', error);
        (window.Utils?.showNotification || showNotification)('Erro ao gerar cartão. Tente novamente.', 'error');
    }
};

// Função showGeneratedInfo está implementada em qr-generator.js

const saveCard = async () => {
    console.log('💾 Iniciando processo de salvamento...');
    
    // Verificar se o usuário está autenticado
    const isAuthenticated = typeof apiService !== 'undefined' && apiService.isAuthenticated();
    
    if (!isAuthenticated) {
        console.log('⚠️ Usuário não autenticado, redirecionando para login...');
        
        // Mostrar modal para fazer login
        const needsLogin = await showLoginRequiredModal();
        
        if (needsLogin) {
            // Salvar dados temporariamente para depois do login
            localStorage.setItem('virtual-card-draft', JSON.stringify(window.appState));
            
            // Redirecionar para login
            window.location.href = 'login.html';
        }
        
        return;
    }
    
    // Verificar se está editando um cartão existente
    const editingCardId = localStorage.getItem('editing-card-id');
    console.log('🔍 Verificando modo de edição. editing-card-id:', editingCardId);
    
    if (editingCardId) {
        console.log('📝 Atualizando cartão existente:', editingCardId);
        
        // Obter o cartão atual para manter o nome se não for alterado
        const currentCard = window.CardsManager?.getCardById(editingCardId);
        const defaultName = currentCard ? currentCard.name : (window.appState.personalInfo.fullName || 'Meu Cartão');
        
        const cardName = await window.showCardNameModal(defaultName);
        
        if (cardName) {
            console.log('✅ Atualizando cartão na API com nome:', cardName);
            
            try {
                // Preparar dados para API
                const cardData = {
                    name: cardName,
                    jobTitle: window.appState.personalInfo?.jobTitle || '',
                    description: window.appState.personalInfo?.description || '',
                    email: window.appState.personalInfo?.email || '',
                    phone: window.appState.personalInfo?.phone || '',
                    image: window.appState.image || null,
                    color: window.appState.design?.primaryColor || '#00BFFF',
                    theme: window.appState.design?.theme || 'modern',
                    customGradient: window.appState.design?.customGradient || null,
                    links: (window.appState.links || []).map(link => ({
                        title: link.title || link.label || link.type || 'link',
                        url: link.url,
                        type: link.type || 'custom',
                        color: link.color || window.appState.design?.primaryColor || '#00BFFF'
                    }))
                };
                
                // Atualizar via API
                const updatedCard = await apiService.updateCard(editingCardId, cardData);
                
                console.log('✅ Cartão atualizado na API:', updatedCard);
                
                // Marcar que houve uma atualização
                localStorage.setItem('card-updated', 'true');
                
                // Mostrar notificação de sucesso
                window.showCustomNotification('Cartão atualizado e salvo no seu perfil!', 'success', 3000);
                
                // Limpar dados temporários APÓS mostrar a notificação
                setTimeout(() => {
                    localStorage.removeItem('editing-card-id');
                    localStorage.removeItem('virtual-card-data');
                    window.location.href = 'profile.html';
                }, 2000);
                return;
            } catch (error) {
                console.error('❌ Erro ao atualizar cartão na API:', error);
                window.showCustomNotification('Erro ao atualizar cartão. Tente novamente.', 'error', 3000);
                return;
            }
        }
    }
    
    // Salvar novo cartão
    console.log('🆕 Criando novo cartão...');
    
    const defaultName = window.appState.personalInfo?.fullName || 'Meu Cartão';
    const cardName = await window.showCardNameModal(defaultName);
    
    if (cardName) {
        console.log('✅ Criando cartão na API com nome:', cardName);
        
        try {
            // Preparar dados para API
            const cardData = {
                name: cardName,
                jobTitle: window.appState.personalInfo?.jobTitle || '',
                description: window.appState.personalInfo?.description || '',
                email: window.appState.personalInfo?.email || '',
                phone: window.appState.personalInfo?.phone || '',
                image: window.appState.image || null,
                color: window.appState.design?.primaryColor || '#00BFFF',
                theme: window.appState.design?.theme || 'modern',
                customGradient: window.appState.design?.customGradient || null,
                links: (window.appState.links || []).map(link => ({
                    title: link.title || link.label || link.type || 'link',
                    url: link.url,
                    type: link.type || 'custom',
                    color: link.color || window.appState.design?.primaryColor || '#00BFFF'
                }))
            };
            
            // Criar via API
            const newCard = await apiService.createCard(cardData);
            
            console.log('✅ Novo cartão criado na API:', newCard);
            
            // Marcar que houve uma atualização para forçar refresh no perfil
            localStorage.setItem('card-updated', 'true');
            
            // Mostrar notificação de sucesso
            window.showCustomNotification('Cartão salvo no seu perfil com sucesso!', 'success', 3000);
            
            // Perguntar se deseja ir para o perfil
            setTimeout(async () => {
                const goToProfile = await window.showConfirmModal(
                    '🎉 Cartão Salvo!',
                    'Seu cartão foi salvo no seu perfil. Deseja visualizar agora?',
                    'Sim, ver perfil',
                    'Continuar editando'
                );
                
                if (goToProfile) {
                    window.location.href = 'profile.html';
                }
            }, 1000);
        } catch (error) {
            console.error('❌ Erro ao criar cartão na API:', error);
            window.showCustomNotification('Erro ao criar cartão. Tente novamente.', 'error', 3000);
        }
    }
};

// ==========================================================================
// PREVIEW E QR CODE - Delegado para arquivos específicos
// ==========================================================================
// As funções updatePreview, generateCardContent e generateQRCode
// estão implementadas em preview.js e qr-generator.js

// ==========================================================================
// FUNÇÕES AUXILIARES E UTILITÁRIOS
// ==========================================================================

/**
 * Validar se o cartão está completo para geração
 */
const validateCardForGeneration = () => {
    const errors = [];
    
    if (!window.appState.personalInfo.fullName?.trim()) {
        errors.push('Nome é obrigatório');
    }
    
    if (!window.appState.personalInfo.email?.trim()) {
        errors.push('E-mail é obrigatório');
    } else if (!isValidEmail(window.appState.personalInfo.email)) {
        errors.push('E-mail inválido');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

/**
 * Validar formato de e-mail
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Exportar dados do cartão para JSON
 */
const exportCardData = () => {
    return JSON.stringify(window.appState, null, 2);
};

/**
 * Importar dados do cartão de JSON
 */
const importCardData = async (jsonData) => {
    try {
        const importedData = JSON.parse(jsonData);
        Object.assign(window.appState, importedData);
        await saveData();
        if (typeof window.updatePreview === 'function') {
            window.updatePreview(true);
        }
        showNotification('Dados importados com sucesso!');
        return true;
    } catch (error) {
        showNotification('Erro ao importar dados. Verifique o formato.', 'error');
        return false;
    }
};

// ==========================================================================
// MODAL DE LOGIN NECESSÁRIO
// ==========================================================================

const showLoginRequiredModal = () => {
    return new Promise((resolve) => {
        // Criar modal
        const modal = document.createElement('div');
        modal.className = 'login-required-modal';
        modal.innerHTML = `
            <div class="login-modal-overlay"></div>
            <div class="login-modal-content">
                <div class="login-modal-icon">
                    <i class="fas fa-lock"></i>
                </div>
                <h3>Login Necessário</h3>
                <p>Você precisa fazer login para salvar seus cartões no perfil.</p>
                <div class="login-modal-buttons">
                    <button class="btn-login-cancel" onclick="closeLoginModal()">
                        <i class="fas fa-times"></i>
                        Cancelar
                    </button>
                    <button class="btn-login-confirm" onclick="confirmLogin()">
                        <i class="fas fa-sign-in-alt"></i>
                        Fazer Login
                    </button>
                </div>
            </div>
        `;
        
        // Estilos inline
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
        
        const overlay = modal.querySelector('.login-modal-overlay');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
        `;
        
        const content = modal.querySelector('.login-modal-content');
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
        
        const icon = modal.querySelector('.login-modal-icon');
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
        
        const buttons = modal.querySelector('.login-modal-buttons');
        buttons.style.cssText = `
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
        `;
        
        const cancelBtn = modal.querySelector('.btn-login-cancel');
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
        
        const confirmBtn = modal.querySelector('.btn-login-confirm');
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
        
        // Animações
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
            .btn-login-cancel:hover {
                background: #f9fafb;
                border-color: #d1d5db;
            }
            .btn-login-confirm:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(modal);
        
        // Funções de callback
        window.closeLoginModal = () => {
            modal.remove();
            document.head.removeChild(style);
            resolve(false);
        };
        
        window.confirmLogin = () => {
            modal.remove();
            document.head.removeChild(style);
            resolve(true);
        };
        
        // Fechar ao clicar no overlay
        overlay.addEventListener('click', () => {
            window.closeLoginModal();
        });
    });
};

// Exportar funções globais
window.updateLink = updateLink;
window.removeLink = removeLink;
window.removeImage = removeImage;
// window.generateQRCode está em qr-generator.js
window.exportCardData = exportCardData;
window.importCardData = importCardData;
window.showLoginRequiredModal = showLoginRequiredModal;
