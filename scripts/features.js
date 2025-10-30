/* ==========================================================================
   FEATURES.JS - Gerenciamento de Seções de Destaque
   ========================================================================== */

// Inicializar gerenciamento de seções de destaque
const initializeFeatures = () => {
    console.log('⭐ Inicializando sistema de seções de destaque...');
    
    const addFeatureBtn = document.getElementById('addFeatureBtn');
    if (addFeatureBtn) {
        addFeatureBtn.addEventListener('click', () => addFeatureSection());
    } else {
        console.error('❌ Botão addFeatureBtn não encontrado!');
    }
    
    // Carregar seções salvas (sempre re-renderizar do zero para evitar duplicação)
    const container = document.getElementById('featuresContainer');
    if (container) {
        container.innerHTML = '';
    }
    if (window.appState && Array.isArray(window.appState.featureSections) && window.appState.featureSections.length > 0) {
        window.appState.featureSections.forEach((feature, index) => {
            addFeatureSection(feature, index);
        });
    }
    
    // Atualizar preview após montar a UI
    if (typeof window.updatePreview === 'function') {
        window.updatePreview(true);
    }
    console.log('✅ Sistema de seções de destaque inicializado');
};

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFeatures);
} else {
    // DOM já está pronto
    initializeFeatures();
}

// Adicionar nova seção de destaque
const addFeatureSection = (existingData = null, index = null) => {
    console.log('📝 Adicionando seção de destaque...', existingData, index);
    
    const container = document.getElementById('featuresContainer');
    if (!container) {
        console.error('❌ Container featuresContainer não encontrado!');
        return;
    }
    
    // Garantir que featureSections existe
    if (!window.appState.featureSections) {
        window.appState.featureSections = [];
    }
    
    const featureIndex = index !== null ? index : window.appState.featureSections.length;
    console.log('📊 Índice da seção:', featureIndex);
    
    // Criar elemento da seção
    const featureDiv = document.createElement('div');
    featureDiv.className = 'bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3';
    featureDiv.dataset.featureIndex = featureIndex;
    
    featureDiv.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <h3 class="font-semibold text-gray-700 flex items-center">
                <i class="fas fa-star text-purple-600 mr-2"></i>
                Seção de Destaque #${featureIndex + 1}
            </h3>
            <button class="remove-feature text-red-600 hover:text-red-800 transition-colors" data-index="${featureIndex}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        
        <div class="space-y-3">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Título da Seção</label>
                <input type="text" 
                    class="feature-title-input form-input w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Ex: Avaliação Nutricional"
                    data-index="${featureIndex}"
                    value="${existingData?.title || ''}">
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea 
                    class="feature-description-input form-input w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    rows="3"
                    placeholder="Descreva o serviço ou produto..."
                    data-index="${featureIndex}">${existingData?.description || ''}</textarea>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Imagem da Seção</label>
                <input type="file" 
                    class="feature-image-input" 
                    accept="image/*"
                    data-index="${featureIndex}"
                    style="display: none;">
                <div class="upload-area border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 cursor-pointer" data-index="${featureIndex}">
                    <div class="feature-image-preview ${existingData?.image ? '' : 'hidden'}">
                        <img src="${existingData?.image || ''}" alt="Preview" class="max-w-full h-32 object-cover rounded mx-auto mb-2">
                    </div>
                    <div class="feature-image-placeholder ${existingData?.image ? 'hidden' : ''}">
                        <i class="fas fa-image text-4xl text-gray-400 mb-2"></i>
                        <p class="text-sm text-gray-600">Clique para adicionar imagem</p>
                        <p class="text-xs text-gray-500 mt-1">PNG, JPG ou WEBP (max. 5MB)</p>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Texto do Botão</label>
                    <input type="text" 
                        class="feature-button-text-input form-input w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="Ex: Agendar"
                        data-index="${featureIndex}"
                        value="${existingData?.buttonText || ''}">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">URL do Botão</label>
                    <input type="url" 
                        class="feature-button-url-input form-input w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="https://..."
                        data-index="${featureIndex}"
                        value="${existingData?.buttonUrl || ''}">
                </div>
            </div>
        </div>
    `;
    
    container.appendChild(featureDiv);
    
    // Se não existe no estado, adicionar
    if (!existingData) {
        window.appState.featureSections.push({
            title: '',
            description: '',
            image: null,
            buttonText: '',
            buttonUrl: ''
        });
    }
    
    // Adicionar event listeners
    const titleInput = featureDiv.querySelector('.feature-title-input');
    const descInput = featureDiv.querySelector('.feature-description-input');
    const imageInput = featureDiv.querySelector('.feature-image-input');
    const buttonTextInput = featureDiv.querySelector('.feature-button-text-input');
    const buttonUrlInput = featureDiv.querySelector('.feature-button-url-input');
    const removeBtn = featureDiv.querySelector('.remove-feature');
    const uploadArea = featureDiv.querySelector('.upload-area');
    
    console.log('🎯 Elementos encontrados:', {
        titleInput: !!titleInput,
        descInput: !!descInput,
        imageInput: !!imageInput,
        uploadArea: !!uploadArea,
        imageInputType: imageInput?.type
    });
    
    // Event listeners para inputs
    titleInput.addEventListener('input', (e) => {
        updateFeatureSection(featureIndex, 'title', e.target.value);
    });
    
    descInput.addEventListener('input', (e) => {
        updateFeatureSection(featureIndex, 'description', e.target.value);
    });
    
    buttonTextInput.addEventListener('input', (e) => {
        updateFeatureSection(featureIndex, 'buttonText', e.target.value);
    });
    
    buttonUrlInput.addEventListener('input', (e) => {
        updateFeatureSection(featureIndex, 'buttonUrl', e.target.value);
    });
    
    // Upload de imagem
    if (uploadArea && imageInput) {
        uploadArea.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖼️ Clicou na área de upload, abrindo seletor...');
            console.log('📂 Input file:', imageInput);
            imageInput.click();
        });
        
        imageInput.addEventListener('change', (e) => {
            console.log('📁 Evento change disparado!');
            console.log('📁 Arquivo selecionado:', e.target.files[0]);
            console.log('📁 Total de arquivos:', e.target.files.length);
            if (e.target.files && e.target.files.length > 0) {
                handleFeatureImageUpload(e, featureIndex);
            } else {
                console.error('❌ Nenhum arquivo no evento change');
            }
        });
        
        // Adicionar também evento direto no input para garantir
        imageInput.addEventListener('input', (e) => {
            console.log('📁 Evento input disparado!');
            if (e.target.files && e.target.files.length > 0) {
                console.log('📁 Arquivo via input:', e.target.files[0]);
                handleFeatureImageUpload(e, featureIndex);
            }
        });
        
        console.log('✅ Event listeners de upload registrados para índice', featureIndex);
    } else {
        console.error('❌ Upload area ou image input não encontrados!');
    }
    
    // Remover seção
    removeBtn.addEventListener('click', () => {
        removeFeatureSection(featureIndex);
    });
};

// Atualizar seção de destaque
const updateFeatureSection = (index, field, value) => {
    if (!window.appState.featureSections[index]) return;
    
    window.appState.featureSections[index][field] = value;
    console.log(`📝 Seção ${index} atualizada - ${field}:`, value);
    
    // Atualizar preview
    if (typeof window.updatePreview === 'function') {
        window.updatePreview();
    }
    
    // Salvar no localStorage
    if (window.Utils && typeof window.Utils.saveToStorage === 'function') {
        window.Utils.saveToStorage(window.appState);
    }
};

// Upload de imagem da seção
const handleFeatureImageUpload = (event, index) => {
    const file = event.target.files[0];
    if (!file) {
        console.log('❌ Nenhum arquivo selecionado');
        return;
    }
    
    console.log('📤 Processando upload de imagem:', file.name, file.type, file.size);
    
    // Validações
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        console.error('❌ Tipo de arquivo não suportado:', file.type);
        if (window.Utils && typeof window.Utils.showNotification === 'function') {
            window.Utils.showNotification('Formato de imagem não suportado. Use PNG, JPG ou WEBP.', 'error');
        } else {
            alert('Formato de imagem não suportado. Use PNG, JPG ou WEBP.');
        }
        return;
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        console.error('❌ Arquivo muito grande:', file.size);
        if (window.Utils && typeof window.Utils.showNotification === 'function') {
            window.Utils.showNotification('Imagem muito grande. Máximo 5MB.', 'error');
        } else {
            alert('Imagem muito grande. Máximo 5MB.');
        }
        return;
    }
    
    // Converter para base64
    const reader = new FileReader();
    reader.onload = (e) => {
        const imageData = e.target.result;
        console.log('✅ Imagem convertida para base64');
        
        // Atualizar estado (garantir que é uma string)
        if (typeof imageData === 'string') {
            window.appState.featureSections[index].image = imageData;
            console.log('💾 Estado atualizado com imagem');
        } else {
            console.error('❌ Erro: imageData não é uma string válida:', typeof imageData);
            return;
        }
        
        // Atualizar preview da imagem
        const featureDiv = document.querySelector(`[data-feature-index="${index}"]`);
        if (featureDiv) {
            const preview = featureDiv.querySelector('.feature-image-preview img');
            const previewContainer = featureDiv.querySelector('.feature-image-preview');
            const placeholder = featureDiv.querySelector('.feature-image-placeholder');
            
            if (preview && previewContainer && placeholder && typeof imageData === 'string') {
                preview.src = imageData;
                previewContainer.classList.remove('hidden');
                placeholder.classList.add('hidden');
                console.log('🖼️ Preview da imagem atualizado');
            }
        }
        
        // Atualizar preview do cartão
        if (typeof window.updatePreview === 'function') {
            window.updatePreview();
            console.log('🔄 Preview do cartão atualizado');
        }
        
        // Salvar
        if (window.Utils && typeof window.Utils.saveToStorage === 'function') {
            window.Utils.saveToStorage(window.appState);
        }
        
        if (window.Utils && typeof window.Utils.showNotification === 'function') {
            window.Utils.showNotification('Imagem adicionada com sucesso!', 'success');
        } else {
            console.log('✅ Imagem adicionada com sucesso!');
        }
    };
    
    reader.onerror = () => {
        console.error('❌ Erro ao carregar imagem');
        if (window.Utils && typeof window.Utils.showNotification === 'function') {
            window.Utils.showNotification('Erro ao carregar imagem.', 'error');
        } else {
            alert('Erro ao carregar imagem.');
        }
    };
    
    console.log('📖 Iniciando leitura do arquivo...');
    reader.readAsDataURL(file);
};

// Remover seção de destaque
const removeFeatureSection = (index) => {
    console.log('🗑️ Removendo seção:', index);
    
    // Remover do estado
    window.appState.featureSections.splice(index, 1);
    
    // Remover do DOM e reindexar
    const container = document.getElementById('featuresContainer');
    if (container) {
        container.innerHTML = '';
        window.appState.featureSections.forEach((feature, newIndex) => {
            addFeatureSection(feature, newIndex);
        });
    }
    
    // Atualizar preview
    if (typeof window.updatePreview === 'function') {
        window.updatePreview();
    }
    
    // Salvar
    if (window.Utils && typeof window.Utils.saveToStorage === 'function') {
        window.Utils.saveToStorage(window.appState);
    }
    
    if (window.Utils && typeof window.Utils.showNotification === 'function') {
        window.Utils.showNotification('Seção removida!', 'success');
    }
};

// Exportar funções
window.initializeFeatures = initializeFeatures;
window.addFeatureSection = addFeatureSection;

