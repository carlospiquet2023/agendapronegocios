/**
 * TOAST - Agenda Pro Negócios
 * Sistema de notificações toast
 */

const Toast = {
    container: null,
    queue: [],
    maxVisible: 5,

    /**
     * Inicializa o sistema de toast
     */
    init() {
        this.container = document.getElementById('toast-container');
        
        if (!this.container) {
            // Cria container se não existir
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },

    /**
     * Exibe uma notificação toast
     * @param {string} message - Mensagem da notificação
     * @param {string} type - Tipo: success, error, warning, info
     * @param {Object} options - Opções adicionais
     * @param {number} options.duration - Duração em ms (padrão: 4000)
     * @param {string} options.title - Título opcional
     * @param {boolean} options.persistent - Se não deve fechar automaticamente
     */
    show(message, type = 'info', options = {}) {
        const {
            duration = 4000,
            title = null,
            persistent = false
        } = options;

        // Cria elemento do toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Ícone baseado no tipo
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        // Títulos padrão baseados no tipo
        const defaultTitles = {
            success: 'Sucesso',
            error: 'Erro',
            warning: 'Atenção',
            info: 'Informação'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <div class="toast-content">
                <span class="toast-title">${Helpers.escapeHtml(title || defaultTitles[type] || '')}</span>
                <span class="toast-message">${Helpers.escapeHtml(message)}</span>
            </div>
            <button class="btn-icon btn-close-toast" aria-label="Fechar">✕</button>
        `;

        // Botão de fechar
        const closeBtn = toast.querySelector('.btn-close-toast');
        closeBtn?.addEventListener('click', () => this.remove(toast));

        // Limita número de toasts visíveis
        const currentToasts = this.container.querySelectorAll('.toast:not(.removing)');
        if (currentToasts.length >= this.maxVisible) {
            this.remove(currentToasts[0]);
        }

        // Adiciona ao container
        this.container.appendChild(toast);

        // Remove automaticamente após duração (se não for persistente)
        if (!persistent) {
            setTimeout(() => {
                this.remove(toast);
            }, duration);
        }

        return toast;
    },

    /**
     * Remove um toast específico
     * @param {HTMLElement} toast - Elemento do toast
     */
    remove(toast) {
        if (!toast || toast.classList.contains('removing')) return;

        toast.classList.add('removing');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300); // Tempo da animação
    },

    /**
     * Remove todos os toasts
     */
    clear() {
        const toasts = this.container?.querySelectorAll('.toast');
        toasts?.forEach(toast => this.remove(toast));
    },

    // Métodos de conveniência
    
    /**
     * Toast de sucesso
     * @param {string} message - Mensagem
     * @param {Object} options - Opções
     */
    success(message, options = {}) {
        return this.show(message, 'success', options);
    },

    /**
     * Toast de erro
     * @param {string} message - Mensagem
     * @param {Object} options - Opções
     */
    error(message, options = {}) {
        return this.show(message, 'error', { duration: 6000, ...options });
    },

    /**
     * Toast de aviso
     * @param {string} message - Mensagem
     * @param {Object} options - Opções
     */
    warning(message, options = {}) {
        return this.show(message, 'warning', { duration: 5000, ...options });
    },

    /**
     * Toast informativo
     * @param {string} message - Mensagem
     * @param {Object} options - Opções
     */
    info(message, options = {}) {
        return this.show(message, 'info', options);
    },

    /**
     * Toast com ação de desfazer
     * @param {string} message - Mensagem
     * @param {Function} onUndo - Callback ao desfazer
     * @param {number} timeout - Tempo para desfazer em ms
     */
    undo(message, onUndo, timeout = 5000) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-info';
        
        toast.innerHTML = `
            <span class="toast-icon">↩️</span>
            <div class="toast-content">
                <span class="toast-message">${Helpers.escapeHtml(message)}</span>
            </div>
            <button class="btn btn-sm btn-primary btn-undo">Desfazer</button>
        `;

        const undoBtn = toast.querySelector('.btn-undo');
        let undone = false;

        undoBtn?.addEventListener('click', () => {
            if (!undone) {
                undone = true;
                if (typeof onUndo === 'function') {
                    onUndo();
                }
                this.remove(toast);
                this.success('Ação desfeita!');
            }
        });

        this.container.appendChild(toast);

        setTimeout(() => {
            if (!undone) {
                this.remove(toast);
            }
        }, timeout);

        return toast;
    },

    /**
     * Toast de loading
     * @param {string} message - Mensagem
     * @returns {Object} Objeto com método done() para finalizar
     */
    loading(message = 'Processando...') {
        const toast = document.createElement('div');
        toast.className = 'toast toast-info';
        
        toast.innerHTML = `
            <div class="loader-spinner" style="width: 24px; height: 24px; border-width: 2px;"></div>
            <div class="toast-content">
                <span class="toast-message">${Helpers.escapeHtml(message)}</span>
            </div>
        `;

        this.container.appendChild(toast);

        return {
            /**
             * Finaliza o loading
             * @param {string} finalMessage - Mensagem final
             * @param {string} type - Tipo final (success, error)
             */
            done: (finalMessage = 'Concluído!', type = 'success') => {
                this.remove(toast);
                this.show(finalMessage, type);
            },
            /**
             * Atualiza mensagem do loading
             * @param {string} newMessage - Nova mensagem
             */
            update: (newMessage) => {
                const msgEl = toast.querySelector('.toast-message');
                if (msgEl) {
                    msgEl.textContent = newMessage;
                }
            },
            /**
             * Remove o loading
             */
            remove: () => {
                this.remove(toast);
            }
        };
    }
};
