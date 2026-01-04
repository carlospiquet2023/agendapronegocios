/**
 * ═══════════════════════════════════════════════════════════════
 * DRAG & DROP SYSTEM - Agenda Pro Negócios
 * Sistema avançado de arrastar e soltar com animações fluidas
 * ═══════════════════════════════════════════════════════════════
 */

const DragDrop = {
    // Configurações
    config: {
        draggableSelector: '[data-draggable]',
        dropzoneSelector: '[data-dropzone]',
        ghostOpacity: 0.8,
        animationDuration: 200,
        hapticFeedback: true
    },

    // Estado
    state: {
        dragging: null,
        ghost: null,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0,
        dropzones: [],
        currentDropzone: null
    },

    /**
     * Inicializa o sistema de drag & drop
     */
    init() {
        this.injectStyles();
        this.bindEvents();
        console.log('🎯 Drag & Drop System inicializado');
    },

    /**
     * Injeta estilos CSS necessários
     */
    injectStyles() {
        if (document.getElementById('drag-drop-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'drag-drop-styles';
        styles.textContent = `
            /* Elemento sendo arrastado */
            [data-draggable] {
                cursor: grab;
                user-select: none;
                touch-action: none;
            }

            [data-draggable]:active {
                cursor: grabbing;
            }

            .drag-ghost {
                position: fixed;
                pointer-events: none;
                z-index: 10000;
                opacity: 0.9;
                transform: rotate(3deg) scale(1.02);
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
                transition: transform 0.1s ease;
            }

            .drag-ghost.dropping {
                transform: rotate(0deg) scale(1);
                transition: all 0.2s ease;
            }

            /* Elemento original durante arrasto */
            .dragging-source {
                opacity: 0.3;
                transform: scale(0.98);
                transition: all 0.2s ease;
            }

            /* Dropzone ativa */
            [data-dropzone] {
                transition: all 0.2s ease;
            }

            [data-dropzone].dropzone-active {
                background: var(--color-primary-alpha, rgba(99, 102, 241, 0.1));
                border: 2px dashed var(--color-primary, #6366f1);
                border-radius: 12px;
            }

            [data-dropzone].dropzone-hover {
                background: var(--color-primary-alpha, rgba(99, 102, 241, 0.2));
                transform: scale(1.01);
                box-shadow: 0 0 20px var(--color-primary-alpha, rgba(99, 102, 241, 0.3));
            }

            /* Placeholder para indicar posição */
            .drag-placeholder {
                background: linear-gradient(135deg, 
                    var(--color-primary-alpha, rgba(99, 102, 241, 0.1)) 0%,
                    var(--color-primary-alpha, rgba(99, 102, 241, 0.2)) 100%
                );
                border: 2px dashed var(--color-primary, #6366f1);
                border-radius: 8px;
                transition: all 0.2s ease;
                min-height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .drag-placeholder::after {
                content: 'Solte aqui';
                color: var(--color-primary, #6366f1);
                font-size: 0.85rem;
                font-weight: 500;
            }

            /* Animação de entrada do placeholder */
            @keyframes placeholder-pulse {
                0%, 100% { opacity: 0.5; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.01); }
            }

            .drag-placeholder {
                animation: placeholder-pulse 1s ease infinite;
            }

            /* Handle de arrasto */
            .drag-handle {
                cursor: grab;
                padding: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.5;
                transition: opacity 0.2s;
            }

            .drag-handle:hover {
                opacity: 1;
            }

            .drag-handle::before {
                content: '⋮⋮';
                font-size: 1rem;
                letter-spacing: 2px;
            }

            /* Feedback visual de sucesso */
            @keyframes drop-success {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); background: rgba(34, 197, 94, 0.2); }
                100% { transform: scale(1); }
            }

            .drop-success {
                animation: drop-success 0.4s ease;
            }

            /* Ripple effect ao soltar */
            .drop-ripple {
                position: absolute;
                border-radius: 50%;
                background: var(--color-primary, #6366f1);
                opacity: 0.3;
                transform: scale(0);
                animation: ripple-expand 0.6s ease forwards;
                pointer-events: none;
            }

            @keyframes ripple-expand {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(styles);
    },

    /**
     * Vincula eventos de arrasto
     */
    bindEvents() {
        // Mouse events
        document.addEventListener('mousedown', this.handleDragStart.bind(this));
        document.addEventListener('mousemove', this.handleDragMove.bind(this));
        document.addEventListener('mouseup', this.handleDragEnd.bind(this));

        // Touch events (mobile)
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this));
    },

    /**
     * Inicia o arrasto (mouse)
     */
    handleDragStart(e) {
        const draggable = e.target.closest(this.config.draggableSelector);
        if (!draggable) return;

        // Se tem handle, verifica se clicou nele
        const handle = draggable.querySelector('.drag-handle');
        if (handle && !e.target.closest('.drag-handle')) return;

        e.preventDefault();
        this.startDrag(draggable, e.clientX, e.clientY);
    },

    /**
     * Inicia o arrasto (touch)
     */
    handleTouchStart(e) {
        const draggable = e.target.closest(this.config.draggableSelector);
        if (!draggable) return;

        const handle = draggable.querySelector('.drag-handle');
        if (handle && !e.target.closest('.drag-handle')) return;

        const touch = e.touches[0];
        
        // Delay para diferenciar de scroll
        this.touchStartTimer = setTimeout(() => {
            e.preventDefault();
            this.startDrag(draggable, touch.clientX, touch.clientY);
            
            // Haptic feedback
            if (this.config.hapticFeedback && navigator.vibrate) {
                navigator.vibrate(10);
            }
        }, 150);
    },

    /**
     * Lógica comum de início de arrasto
     */
    startDrag(element, x, y) {
        const rect = element.getBoundingClientRect();
        
        this.state.dragging = element;
        this.state.startX = x;
        this.state.startY = y;
        this.state.offsetX = x - rect.left;
        this.state.offsetY = y - rect.top;

        // Cria ghost (clone visual)
        this.createGhost(element, x, y);

        // Marca elemento original
        element.classList.add('dragging-source');

        // Ativa dropzones
        this.activateDropzones();

        // Dispara evento customizado
        element.dispatchEvent(new CustomEvent('drag:start', { 
            detail: { x, y },
            bubbles: true 
        }));

        // Som de início
        SoundFX?.play?.('swoosh');
    },

    /**
     * Cria elemento ghost para arrastar
     */
    createGhost(element, x, y) {
        const ghost = element.cloneNode(true);
        const rect = element.getBoundingClientRect();

        ghost.className = 'drag-ghost';
        ghost.style.width = rect.width + 'px';
        ghost.style.height = rect.height + 'px';
        ghost.style.left = (x - this.state.offsetX) + 'px';
        ghost.style.top = (y - this.state.offsetY) + 'px';

        document.body.appendChild(ghost);
        this.state.ghost = ghost;
    },

    /**
     * Move o ghost durante arrasto (mouse)
     */
    handleDragMove(e) {
        if (!this.state.dragging) return;
        e.preventDefault();
        this.moveDrag(e.clientX, e.clientY);
    },

    /**
     * Move o ghost durante arrasto (touch)
     */
    handleTouchMove(e) {
        if (this.touchStartTimer) {
            clearTimeout(this.touchStartTimer);
            this.touchStartTimer = null;
        }

        if (!this.state.dragging) return;
        e.preventDefault();

        const touch = e.touches[0];
        this.moveDrag(touch.clientX, touch.clientY);
    },

    /**
     * Lógica comum de movimento
     */
    moveDrag(x, y) {
        // Atualiza posição do ghost
        if (this.state.ghost) {
            this.state.ghost.style.left = (x - this.state.offsetX) + 'px';
            this.state.ghost.style.top = (y - this.state.offsetY) + 'px';
        }

        // Verifica dropzones
        this.checkDropzones(x, y);
    },

    /**
     * Ativa todas as dropzones
     */
    activateDropzones() {
        const dropzones = document.querySelectorAll(this.config.dropzoneSelector);
        
        this.state.dropzones = Array.from(dropzones).map(zone => ({
            element: zone,
            rect: zone.getBoundingClientRect()
        }));

        dropzones.forEach(zone => zone.classList.add('dropzone-active'));
    },

    /**
     * Verifica se está sobre uma dropzone
     */
    checkDropzones(x, y) {
        let found = null;

        for (const zone of this.state.dropzones) {
            const { rect, element } = zone;

            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                found = element;
                break;
            }
        }

        // Atualiza hover
        if (found !== this.state.currentDropzone) {
            if (this.state.currentDropzone) {
                this.state.currentDropzone.classList.remove('dropzone-hover');
            }

            if (found) {
                found.classList.add('dropzone-hover');
                
                // Haptic feedback leve
                if (this.config.hapticFeedback && navigator.vibrate) {
                    navigator.vibrate(5);
                }
            }

            this.state.currentDropzone = found;
        }
    },

    /**
     * Finaliza o arrasto (mouse)
     */
    handleDragEnd(e) {
        if (!this.state.dragging) return;
        this.endDrag(e.clientX, e.clientY);
    },

    /**
     * Finaliza o arrasto (touch)
     */
    handleTouchEnd(e) {
        if (this.touchStartTimer) {
            clearTimeout(this.touchStartTimer);
            this.touchStartTimer = null;
        }

        if (!this.state.dragging) return;

        const touch = e.changedTouches[0];
        this.endDrag(touch.clientX, touch.clientY);
    },

    /**
     * Lógica comum de finalização
     */
    endDrag(x, y) {
        const element = this.state.dragging;
        const dropzone = this.state.currentDropzone;

        // Animação de drop
        if (this.state.ghost) {
            this.state.ghost.classList.add('dropping');
        }

        // Se soltou em dropzone válida
        if (dropzone) {
            // Efeito ripple
            this.createRipple(dropzone, x, y);

            // Evento de drop
            const dropEvent = new CustomEvent('drag:drop', {
                detail: {
                    element,
                    dropzone,
                    x, y
                },
                bubbles: true
            });
            dropzone.dispatchEvent(dropEvent);

            // Animação de sucesso
            element.classList.add('drop-success');
            setTimeout(() => element.classList.remove('drop-success'), 400);

            // Som e haptic
            SoundFX?.play?.('success');
            if (this.config.hapticFeedback && navigator.vibrate) {
                navigator.vibrate([10, 50, 10]);
            }
        }

        // Limpa
        this.cleanup();

        // Evento de fim
        element.dispatchEvent(new CustomEvent('drag:end', {
            detail: { dropped: !!dropzone, dropzone },
            bubbles: true
        }));
    },

    /**
     * Cria efeito ripple ao soltar
     */
    createRipple(element, x, y) {
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('div');
        
        ripple.className = 'drop-ripple';
        ripple.style.left = (x - rect.left) + 'px';
        ripple.style.top = (y - rect.top) + 'px';
        ripple.style.width = ripple.style.height = '50px';
        
        element.style.position = 'relative';
        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    },

    /**
     * Limpa estado e elementos temporários
     */
    cleanup() {
        // Remove ghost
        if (this.state.ghost) {
            setTimeout(() => {
                this.state.ghost?.remove();
                this.state.ghost = null;
            }, this.config.animationDuration);
        }

        // Remove classes do elemento original
        if (this.state.dragging) {
            this.state.dragging.classList.remove('dragging-source');
        }

        // Desativa dropzones
        document.querySelectorAll(this.config.dropzoneSelector).forEach(zone => {
            zone.classList.remove('dropzone-active', 'dropzone-hover');
        });

        // Reset estado
        this.state.dragging = null;
        this.state.currentDropzone = null;
        this.state.dropzones = [];
    },

    /**
     * Torna um elemento arrastável
     */
    makeDraggable(element, options = {}) {
        element.setAttribute('data-draggable', 'true');
        
        if (options.handle) {
            const handle = document.createElement('div');
            handle.className = 'drag-handle';
            element.insertBefore(handle, element.firstChild);
        }

        if (options.data) {
            element.dataset.dragData = JSON.stringify(options.data);
        }

        return element;
    },

    /**
     * Torna um elemento zona de drop
     */
    makeDropzone(element, options = {}) {
        element.setAttribute('data-dropzone', 'true');
        
        if (options.accept) {
            element.dataset.dropAccept = options.accept;
        }

        return element;
    }
};

// Auto-inicializa quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => DragDrop.init());

// Exporta para uso global
window.DragDrop = DragDrop;
