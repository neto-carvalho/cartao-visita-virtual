/* ==========================================================================
   PREVIEW.JS - Sistema de pré-visualização em tempo real
   ========================================================================== */

// Inicializar preview
document.addEventListener('DOMContentLoaded', () => {
    initializePreview();
});

const initializePreview = () => {
    console.log('👁️ Inicializando sistema de preview...');
    
    // Atualizar preview inicial
    updatePreview();
    
    console.log('✅ Sistema de preview inicializado');
};

// Função principal de atualização do preview
const updatePreview = (resetScroll = false) => {
    const previewContainer = document.getElementById('cardPreview');
    if (!previewContainer) return;

    const { personalInfo, design, image, links, featureSections, showSaveContactButton } = appState;
    
    // Salvar posição atual do scroll
    const currentScrollPosition = previewContainer.scrollTop;
    
    // Aplicar tema ao container
    if (design.customGradient) {
        previewContainer.className = 'card-content';
        previewContainer.style.background = design.customGradient;
    } else {
        previewContainer.className = `card-content ${design.theme}`;
        previewContainer.style.background = '';
    }
    
    // Aplicar cores customizadas
    previewContainer.style.setProperty('--primary-color', design.primaryColor);
    previewContainer.style.setProperty('--secondary-color', design.secondaryColor);
    previewContainer.style.setProperty('--text-color', design.textColor);
    previewContainer.style.setProperty('--button-text-color', design.buttonTextColor);
    
    // Gerar conteúdo do cartão
    const cardContent = generateCardContent(personalInfo, image, links, featureSections, showSaveContactButton);
    previewContainer.innerHTML = cardContent;
    
    // Adicionar event listener para o botão de salvar contato
    const saveContactBtn = previewContainer.querySelector('.save-contact-btn');
    if (saveContactBtn) {
        saveContactBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Utils.downloadVCard(appState.personalInfo, appState.image);
        });
    }
    
    // Adicionar event listeners para botões das seções de destaque
    const featureButtons = previewContainer.querySelectorAll('.feature-action-btn');
    featureButtons.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const section = appState.featureSections[index];
            if (section && section.buttonUrl) {
                window.open(section.buttonUrl, '_blank');
            }
        });
    });
    
    // Restaurar posição do scroll ou resetar se solicitado
    setTimeout(() => {
        if (resetScroll) {
            previewContainer.scrollTop = 0;
        } else {
            previewContainer.scrollTop = currentScrollPosition;
        }
    }, 10);
};

// Gerar conteúdo HTML do cartão
const generateCardContent = (personalInfo, image, links, featureSections = [], showSaveContactButton = true) => {
    const { fullName, jobTitle, description, email, phone } = personalInfo;
    
    let content = '';
    
    // Imagem de perfil
    if (image) {
        content += `<img src="${image}" alt="Foto de perfil" class="profile-image">`;
    } else {
        content += `<div class="profile-image placeholder">
            <i class="fas fa-user"></i>
        </div>`;
    }
    
    // Nome
    if (fullName) {
        content += `<div class="name">${fullName}</div>`;
    } else {
        content += `<div class="name placeholder">Seu Nome</div>`;
    }
    
    // Cargo
    if (jobTitle) {
        content += `<div class="job-title">${jobTitle}</div>`;
    } else {
        content += `<div class="job-title placeholder">Seu Cargo</div>`;
    }
    
    // Descrição
    if (description) {
        content += `<div class="description">${description}</div>`;
    } else {
        content += `<div class="description placeholder">Sua descrição</div>`;
    }
    
    // Botão Salvar na Agenda
    if (showSaveContactButton && fullName && email) {
        content += `
            <button class="save-contact-btn">
                <i class="fas fa-address-book"></i>
                Salvar na agenda
            </button>
        `;
    }
    
    // Informações de contato
    content += '<div class="contact-info">';
    if (email) {
        content += `<a href="mailto:${email}" class="contact-item">
            <i class="fas fa-envelope"></i>
            <span>${email}</span>
        </a>`;
    } else {
        content += `<div class="contact-item placeholder">
            <i class="fas fa-envelope"></i>
            <span>seu@email.com</span>
        </div>`;
    }
    
    // Telefone (apenas se existir)
    if (phone) {
        content += `<a href="tel:${phone}" class="contact-item">
            <i class="fas fa-phone"></i>
            <span>${phone}</span>
        </a>`;
    }
    content += '</div>';
    
    // Seções de Destaque
    if (featureSections && featureSections.length > 0) {
        featureSections.forEach((section, index) => {
            content += `
                <div class="feature-section">
                    <div class="feature-section-content">
                        <h3 class="feature-title">${section.title || 'Título da Seção'}</h3>
                        <p class="feature-description">${section.description || 'Descrição da seção'}</p>
                        ${section.image ? `<img src="${section.image}" alt="${section.title}" class="feature-image">` : ''}
                        ${section.buttonText ? `
                            <button class="feature-action-btn" data-index="${index}">
                                ${section.buttonText}
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
    }
    
    // Links personalizados
    if (links && links.length > 0) {
        content += '<div class="link-buttons">';
        links.forEach(link => {
            const icon = getSocialIcon(link.type);
            content += `<a href="${link.url}" target="_blank" class="link-button" 
                style="background-color: ${link.color}; color: ${appState.design.buttonTextColor};">
                <div class="link-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="link-text">${link.title}</div>
            </a>`;
        });
        content += '</div>';
    } else {
        content += `<div class="link-buttons placeholder">
            <div class="link-button">
                <div class="link-icon">
                    <i class="fas fa-plus"></i>
                </div>
                <div class="link-text">Adicione seus links</div>
            </div>
        </div>`;
    }
    
    return content;
};

// Adicionar estilos para placeholders
const addPlaceholderStyles = () => {
    if (document.querySelector('#placeholder-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'placeholder-styles';
    styles.textContent = `
        .card-preview .placeholder {
            opacity: 0.6;
            font-style: italic;
        }
        
        .card-preview .profile-image.placeholder {
            background: rgba(255,255,255,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: rgba(255,255,255,0.7);
        }
        
        .card-preview .contact-item.placeholder {
            pointer-events: none;
        }
        
        .card-preview .link-buttons.placeholder .link-button {
            background: rgba(255,255,255,0.2) !important;
            cursor: default;
        }
        
        .card-preview .link-buttons.placeholder .link-button:hover {
            transform: none;
            background: rgba(255,255,255,0.2) !important;
        }
    `;
    document.head.appendChild(styles);
};

// Inicializar estilos de placeholder
addPlaceholderStyles();

// Função para capturar screenshot do cartão (para futuras funcionalidades)
const captureCardScreenshot = async () => {
    const previewContainer = document.getElementById('cardPreview');
    if (!previewContainer) return null;

    try {
        // Usar html2canvas se disponível
        if (typeof html2canvas !== 'undefined') {
            const canvas = await html2canvas(previewContainer, {
                backgroundColor: null,
                scale: 2,
                useCORS: true
            });
            return canvas.toDataURL('image/png');
        }
        return null;
    } catch (error) {
        console.error('Erro ao capturar screenshot:', error);
        return null;
    }
};

// Função para validar se o cartão está completo
const validateCard = () => {
    const { personalInfo, links } = appState;
    const errors = [];
    
    if (!personalInfo.fullName || personalInfo.fullName.trim() === '') {
        errors.push('Nome é obrigatório');
    }
    
    if (!personalInfo.email || personalInfo.email.trim() === '') {
        errors.push('E-mail é obrigatório');
    } else if (!Utils.isValidEmail(personalInfo.email)) {
        errors.push('E-mail inválido');
    }
    
    if (links && links.length > 0) {
        const linkErrors = validateLinks();
        errors.push(...linkErrors);
    }
    
    return errors;
};

// Função para obter estatísticas do cartão
const getCardStats = () => {
    const { personalInfo, links } = appState;
    
    return {
        hasImage: !!appState.image,
        hasName: !!personalInfo.fullName,
        hasJobTitle: !!personalInfo.jobTitle,
        hasDescription: !!personalInfo.description,
        hasEmail: !!personalInfo.email,
        hasPhone: !!personalInfo.phone,
        linksCount: links ? links.length : 0,
        isComplete: validateCard().length === 0
    };
};

// Exportar funções
window.updatePreview = updatePreview;
window.captureCardScreenshot = captureCardScreenshot;
window.validateCard = validateCard;
window.getCardStats = getCardStats;
