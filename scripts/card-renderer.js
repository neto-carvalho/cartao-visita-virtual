/* ==========================================================================
   CARD-RENDERER.JS - Renderização do cartão de visita
   ========================================================================== */

// Inicializar renderização do cartão
document.addEventListener('DOMContentLoaded', () => {
    renderCard();
});

// Função para obter dados do cartão
const getCardData = () => {
    try {
        // Primeiro, tentar obter da URL (para cartões compartilhados)
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('user');
        
        if (userId) {
            // Em uma implementação real, buscar dados do backend
            // Por enquanto, usar localStorage
            return Utils.loadFromStorage();
        }
        
        // Fallback para localStorage
        return Utils.loadFromStorage();
        
    } catch (error) {
        console.error('Erro ao carregar dados do cartão:', error);
        return null;
    }
};

// Função principal de renderização
const renderCard = () => {
    console.log('🎨 Renderizando cartão...');
    
    const data = getCardData();
    const cardContainer = document.getElementById('cardContainer');
    
    if (!cardContainer) {
        console.error('Container do cartão não encontrado');
        return;
    }
    
    if (!data) {
        renderEmptyCard(cardContainer);
        return;
    }
    
    const { personalInfo, design, image, links } = data;
    const { fullName, jobTitle, description, email, phone } = personalInfo;
    
    // Aplicar tema ao container
    cardContainer.className = `card ${design.theme}`;
    
    // Aplicar cores customizadas
    cardContainer.style.setProperty('--primary-color', design.primaryColor);
    cardContainer.style.setProperty('--secondary-color', design.secondaryColor);
    cardContainer.style.setProperty('--text-color', design.textColor);
    cardContainer.style.setProperty('--button-text-color', design.buttonTextColor);
    
    // Definir título da página
    document.title = `${fullName || 'Cartão de Visita'} - Cartão de Visita Virtual`;
    
    // Gerar HTML do cartão
    const cardHTML = generateCardHTML(personalInfo, image, links, design);
    cardContainer.innerHTML = cardHTML;
    
    // Adicionar efeitos especiais
    addCardEffects(cardContainer);
    
    console.log('✅ Cartão renderizado com sucesso');
};

// Gerar HTML do cartão
const generateCardHTML = (personalInfo, image, links, design) => {
    const { fullName, jobTitle, description, email, phone } = personalInfo;
    
    let html = '<div class="card-content">';
    
    // Imagem de perfil
    if (image) {
        html += `<img src="${image}" alt="Foto de perfil" class="profile-image" onerror="this.style.display='none'">`;
    } else {
        html += `<div class="profile-image placeholder">
            <i class="fas fa-user"></i>
        </div>`;
    }
    
    // Nome
    if (fullName) {
        html += `<div class="name">${escapeHtml(fullName)}</div>`;
    } else {
        html += `<div class="name placeholder">Seu Nome</div>`;
    }
    
    // Cargo
    if (jobTitle) {
        html += `<div class="job-title">${escapeHtml(jobTitle)}</div>`;
    } else {
        html += `<div class="job-title placeholder">Seu Cargo</div>`;
    }
    
    // Descrição
    if (description) {
        html += `<div class="description">${escapeHtml(description)}</div>`;
    } else {
        html += `<div class="description placeholder">Sua descrição</div>`;
    }
    
    // Informações de contato
    html += '<div class="contact-info">';
    
    if (email) {
        html += `<a href="mailto:${email}" class="contact-item">
            <i class="fas fa-envelope"></i>
            <span>${escapeHtml(email)}</span>
        </a>`;
    } else {
        html += `<div class="contact-item placeholder">
            <i class="fas fa-envelope"></i>
            <span>seu@email.com</span>
        </div>`;
    }
    
    if (phone) {
        html += `<a href="tel:${phone}" class="contact-item">
            <i class="fas fa-phone"></i>
            <span>${escapeHtml(phone)}</span>
        </a>`;
    } else {
        html += `<div class="contact-item placeholder">
            <i class="fas fa-phone"></i>
            <span>(11) 99999-9999</span>
        </div>`;
    }
    
    html += '</div>';
    
    // Links personalizados
    if (links && links.length > 0) {
        html += '<div class="link-buttons">';
        links.forEach(link => {
            if (link.url && link.title) {
                const icon = getSocialIcon(link.type);
                html += `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="link-button" 
                    style="background-color: ${link.color}; color: ${design.buttonTextColor};">
                    <div class="link-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="link-text">${escapeHtml(link.title)}</div>
                </a>`;
            }
        });
        html += '</div>';
    } else {
        html += `<div class="link-buttons placeholder">
            <div class="link-button">
                <div class="link-icon">
                    <i class="fas fa-plus"></i>
                </div>
                <div class="link-text">Adicione seus links</div>
            </div>
        </div>`;
    }
    
    html += '</div>';
    return html;
};

// Renderizar cartão vazio (quando não há dados)
const renderEmptyCard = (container) => {
    container.className = 'card gradient-pink';
    container.innerHTML = `
        <div class="card-content">
            <div class="profile-image placeholder">
                <i class="fas fa-user"></i>
            </div>
            <div class="name placeholder">Cartão de Visita Virtual</div>
            <div class="job-title placeholder">Crie seu próprio cartão</div>
            <div class="description placeholder">Visite nosso editor para personalizar</div>
            <div class="contact-info">
                <div class="contact-item placeholder">
                    <i class="fas fa-envelope"></i>
                    <span>editor@cartao.com</span>
                </div>
            </div>
            <div class="link-buttons placeholder">
                <div class="link-button">
                    <div class="link-icon">
                        <i class="fas fa-edit"></i>
                    </div>
                    <div class="link-text">Criar Meu Cartão</div>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar link para o editor
    const createButton = container.querySelector('.link-button');
    if (createButton) {
        createButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        createButton.style.cursor = 'pointer';
    }
};

// Adicionar efeitos especiais ao cartão
const addCardEffects = (container) => {
    // Efeito de hover na imagem de perfil
    const profileImage = container.querySelector('.profile-image');
    if (profileImage) {
        profileImage.addEventListener('mouseenter', () => {
            profileImage.style.transform = 'scale(1.05)';
        });
        
        profileImage.addEventListener('mouseleave', () => {
            profileImage.style.transform = 'scale(1)';
        });
    }
    
    // Efeito de clique nos botões de link
    const linkButtons = container.querySelectorAll('.link-button');
    linkButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Efeito de ripple
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Adicionar estilos para ripple
    if (!document.querySelector('#ripple-styles')) {
        const styles = document.createElement('style');
        styles.id = 'ripple-styles';
        styles.textContent = `
            .link-button {
                position: relative;
                overflow: hidden;
            }
            
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                pointer-events: none;
            }
            
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(styles);
    }
};

// Escapar HTML para segurança
const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// Função para obter ícone de rede social (reutilizada do app.js)
const getSocialIcon = (type) => {
    const icons = {
        instagram: 'fab fa-instagram',
        tiktok: 'fab fa-tiktok',
        youtube: 'fab fa-youtube',
        whatsapp: 'fab fa-whatsapp',
        telegram: 'fab fa-telegram',
        linkedin: 'fab fa-linkedin',
        twitter: 'fab fa-twitter',
        facebook: 'fab fa-facebook',
        shop: 'fas fa-shopping-bag',
        portfolio: 'fas fa-briefcase',
        website: 'fas fa-globe',
        custom: 'fas fa-link'
    };
    return icons[type] || 'fas fa-link';
};

// Função para compartilhar cartão
const shareCard = () => {
    if (navigator.share) {
        navigator.share({
            title: 'Meu Cartão de Visita Virtual',
            text: 'Confira meu cartão de visita digital!',
            url: window.location.href
        });
    } else {
        // Fallback para copiar URL
        Utils.copyToClipboard(window.location.href).then(() => {
            Utils.showNotification('Link copiado para a área de transferência!');
        });
    }
};

// Adicionar botão de compartilhamento (opcional)
const addShareButton = () => {
    const shareButton = document.createElement('button');
    shareButton.innerHTML = '<i class="fas fa-share-alt"></i>';
    shareButton.className = 'share-button';
    shareButton.title = 'Compartilhar cartão';
    shareButton.onclick = shareCard;
    
    shareButton.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: rgba(0, 191, 255, 0.9);
        color: white;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
        z-index: 1000;
    `;
    
    shareButton.addEventListener('mouseenter', () => {
        shareButton.style.transform = 'scale(1.1)';
        shareButton.style.background = 'rgba(0, 191, 255, 1)';
    });
    
    shareButton.addEventListener('mouseleave', () => {
        shareButton.style.transform = 'scale(1)';
        shareButton.style.background = 'rgba(0, 191, 255, 0.9)';
    });
    
    document.body.appendChild(shareButton);
};

// Adicionar botão de compartilhamento se suportado
if (navigator.share || navigator.clipboard) {
    addShareButton();
}

// Exportar funções para uso global
window.renderCard = renderCard;
window.shareCard = shareCard;
