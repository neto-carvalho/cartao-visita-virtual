/**
 * Sistema de Modais Personalizados
 * Substitui prompt() e alert() nativos por modais bonitos
 */

console.log('🎨 Inicializando sistema de modais personalizados...');

// Função para mostrar modal de nome do cartão
function showCardNameModal(defaultName = 'Meu Cartão') {
    return new Promise((resolve) => {
        // Criar overlay
        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';
        overlay.id = 'cardNameModal';

        // Criar modal
        const modal = document.createElement('div');
        modal.className = 'custom-modal';

        modal.innerHTML = `
            <div class="custom-modal-header">
                <h3>💾 Salvar Cartão</h3>
            </div>
            <div class="custom-modal-body">
                <p>Dê um nome para este cartão para identificá-lo facilmente:</p>
                <input 
                    type="text" 
                    class="custom-modal-input" 
                    id="cardNameInput"
                    placeholder="Nome do cartão"
                    value="${defaultName}"
                    maxlength="50"
                >
            </div>
            <div class="custom-modal-footer">
                <button class="custom-modal-btn custom-modal-btn-secondary" id="cancelBtn">
                    Cancelar
                </button>
                <button class="custom-modal-btn custom-modal-btn-primary" id="confirmBtn">
                    <i class="fas fa-save"></i> Salvar
                </button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Mostrar modal com animação
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);

        // Focar no input
        const input = modal.querySelector('#cardNameInput');
        input.focus();
        input.select();

        // Event listeners
        const confirmBtn = modal.querySelector('#confirmBtn');
        const cancelBtn = modal.querySelector('#cancelBtn');

        const closeModal = (result) => {
            overlay.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve(result);
            }, 300);
        };

        confirmBtn.addEventListener('click', () => {
            const name = input.value.trim();
            if (name) {
                closeModal(name);
            } else {
                // Mostrar erro se nome estiver vazio
                input.style.borderColor = '#ef4444';
                input.placeholder = 'Nome é obrigatório!';
                setTimeout(() => {
                    input.style.borderColor = '#e5e7eb';
                    input.placeholder = 'Nome do cartão';
                }, 2000);
            }
        });

        cancelBtn.addEventListener('click', () => {
            closeModal(null);
        });

        // Fechar com ESC
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal(null);
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);

        // Fechar clicando no overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(null);
            }
        });

        // Enter para confirmar
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                confirmBtn.click();
            }
        });
    });
}

// Função para mostrar modal de confirmação
function showConfirmModal(title, message, confirmText = 'Confirmar', cancelText = 'Cancelar') {
    return new Promise((resolve) => {
        // Criar overlay
        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';
        overlay.id = 'confirmModal';

        // Criar modal
        const modal = document.createElement('div');
        modal.className = 'custom-modal';

        modal.innerHTML = `
            <div class="custom-modal-header">
                <h3>${title}</h3>
            </div>
            <div class="custom-modal-body">
                <p>${message}</p>
            </div>
            <div class="custom-modal-footer">
                <button class="custom-modal-btn custom-modal-btn-secondary" id="cancelBtn">
                    ${cancelText}
                </button>
                <button class="custom-modal-btn custom-modal-btn-primary" id="confirmBtn">
                    ${confirmText}
                </button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Mostrar modal com animação
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);

        // Event listeners
        const confirmBtn = modal.querySelector('#confirmBtn');
        const cancelBtn = modal.querySelector('#cancelBtn');

        const closeModal = (result) => {
            overlay.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve(result);
            }, 300);
        };

        confirmBtn.addEventListener('click', () => {
            closeModal(true);
        });

        cancelBtn.addEventListener('click', () => {
            closeModal(false);
        });

        // Fechar com ESC
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal(false);
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);

        // Fechar clicando no overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(false);
            }
        });
    });
}

// Função para mostrar notificação personalizada
function showCustomNotification(message, type = 'success', duration = 4000) {
    // Criar overlay
    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    overlay.id = `alert-${Date.now()}`;

    const icon = type === 'success' ? '✅' : '❌';
    const title = type === 'success' ? 'Sucesso!' : 'Erro!';

    overlay.innerHTML = `
        <div class="custom-alert custom-alert-${type}">
            <div class="custom-alert-icon">${icon}</div>
            <div class="custom-alert-content">
                <div class="custom-alert-title">${title}</div>
                <div class="custom-alert-message">${message}</div>
            </div>
            <button class="custom-alert-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Mostrar com animação
    setTimeout(() => {
        overlay.classList.add('show');
    }, 10);

    // Auto-remover após duração especificada
    setTimeout(() => {
        if (overlay.parentElement) {
            overlay.classList.remove('show');
            setTimeout(() => {
                if (overlay.parentElement) {
                    document.body.removeChild(overlay);
                }
            }, 400);
        }
    }, duration);
}

// Função para mostrar alert personalizado (substitui alert nativo)
function showCustomAlert(message, title = 'Informação') {
    return new Promise((resolve) => {
        // Criar overlay
        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';
        overlay.id = 'alertModal';

        // Criar modal
        const modal = document.createElement('div');
        modal.className = 'custom-modal';

        modal.innerHTML = `
            <div class="custom-modal-header">
                <h3>${title}</h3>
            </div>
            <div class="custom-modal-body">
                <p>${message}</p>
            </div>
            <div class="custom-modal-footer">
                <button class="custom-modal-btn custom-modal-btn-primary" id="okBtn">
                    OK
                </button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Mostrar modal com animação
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);

        // Event listeners
        const okBtn = modal.querySelector('#okBtn');

        const closeModal = () => {
            overlay.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve();
            }, 300);
        };

        okBtn.addEventListener('click', closeModal);

        // Fechar com ESC
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);

        // Fechar clicando no overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });

        // Focar no botão OK
        okBtn.focus();
    });
}

// Exportar funções globalmente
window.showCardNameModal = showCardNameModal;
window.showConfirmModal = showConfirmModal;
window.showCustomNotification = showCustomNotification;
window.showCustomAlert = showCustomAlert;

console.log('✅ Sistema de modais personalizados inicializado!');
