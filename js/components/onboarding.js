/**
 * ONBOARDING - Agenda Pro Negócios
 * Tour interativo e guiado para novos usuários
 */

const Onboarding = {
    steps: [
        {
            id: 'welcome',
            title: 'Bem-vindo ao Agenda Pro! 🎉',
            content: 'Seu novo sistema de gestão de negócios. Vamos fazer um tour rápido?',
            target: null,
            position: 'center'
        },
        {
            id: 'sidebar',
            title: 'Menu de Navegação',
            content: 'Use o menu lateral para acessar todas as funcionalidades: Agenda, Clientes, Serviços, Financeiro e mais.',
            target: '#sidebar',
            position: 'right'
        },
        {
            id: 'dashboard',
            title: 'Dashboard',
            content: 'Aqui você vê um resumo do seu negócio: agendamentos do dia, faturamento e lembretes.',
            target: '.stats-grid',
            position: 'bottom'
        },
        {
            id: 'quick-add',
            title: 'Acesso Rápido',
            content: 'Clique aqui para adicionar rapidamente um cliente, agendamento ou serviço.',
            target: '#btn-quick-add',
            position: 'left'
        },
        {
            id: 'config',
            title: 'Configure Seu Negócio',
            content: 'Acesse as configurações para personalizar o nome, tipo de negócio e mensagens do WhatsApp.',
            target: '[data-page="configuracoes"]',
            position: 'right'
        },
        {
            id: 'complete',
            title: 'Tudo Pronto! 🚀',
            content: 'Agora é só começar a usar. Cadastre seus serviços, adicione clientes e organize sua agenda!',
            target: null,
            position: 'center'
        }
    ],
    currentStep: 0,
    overlay: null,
    tooltip: null,
    spotlight: null,

    /**
     * Inicializa o onboarding
     */
    init() {
        // Verifica se já fez o tour
        if (localStorage.getItem('agenda-pro-onboarding-complete')) {
            return;
        }

        // Verifica se é primeiro acesso (sem dados)
        const clientes = JSON.parse(localStorage.getItem('agenda-pro-clientes') || '[]');
        if (clientes.length > 0) {
            return;
        }

        // Inicia após um delay
        setTimeout(() => this.start(), 1500);
    },

    /**
     * Inicia o tour
     */
    start() {
        this.currentStep = 0;
        this.createOverlay();
        this.showStep(0);
    },

    /**
     * Cria elementos do overlay
     */
    createOverlay() {
        // Remove se já existir
        this.destroy();

        // Overlay de fundo
        this.overlay = document.createElement('div');
        this.overlay.className = 'onboarding-overlay';
        this.overlay.innerHTML = '<div class="onboarding-backdrop"></div>';
        document.body.appendChild(this.overlay);

        // Spotlight
        this.spotlight = document.createElement('div');
        this.spotlight.className = 'onboarding-spotlight';
        this.overlay.appendChild(this.spotlight);

        // Tooltip
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'onboarding-tooltip';
        this.overlay.appendChild(this.tooltip);

        // Previne scroll
        document.body.style.overflow = 'hidden';
    },

    /**
     * Mostra um passo específico
     * @param {number} stepIndex - Índice do passo
     */
    showStep(stepIndex) {
        const step = this.steps[stepIndex];
        if (!step) {
            this.complete();
            return;
        }

        // Atualiza spotlight
        if (step.target) {
            const target = document.querySelector(step.target);
            if (target) {
                const rect = target.getBoundingClientRect();
                const padding = 8;

                this.spotlight.style.display = 'block';
                this.spotlight.style.top = `${rect.top - padding}px`;
                this.spotlight.style.left = `${rect.left - padding}px`;
                this.spotlight.style.width = `${rect.width + padding * 2}px`;
                this.spotlight.style.height = `${rect.height + padding * 2}px`;
                this.spotlight.style.borderRadius = '12px';
            }
        } else {
            this.spotlight.style.display = 'none';
        }

        // Atualiza tooltip
        const progress = this.steps.map((_, i) => 
            `<span class="onboarding-dot ${i === stepIndex ? 'active' : ''} ${i < stepIndex ? 'completed' : ''}"></span>`
        ).join('');

        this.tooltip.innerHTML = `
            <div class="onboarding-tooltip__content animate-fadeInUp">
                <h3 class="onboarding-tooltip__title">${step.title}</h3>
                <p class="onboarding-tooltip__text">${step.content}</p>
                <div class="onboarding-tooltip__progress">${progress}</div>
                <div class="onboarding-tooltip__actions">
                    ${stepIndex > 0 ? '<button class="btn btn-secondary btn-sm" id="onboarding-prev">Anterior</button>' : ''}
                    <button class="btn btn-ghost btn-sm" id="onboarding-skip">Pular Tour</button>
                    <button class="btn btn-primary btn-sm" id="onboarding-next">
                        ${stepIndex === this.steps.length - 1 ? 'Começar!' : 'Próximo'}
                    </button>
                </div>
            </div>
        `;

        // Posiciona tooltip
        this.positionTooltip(step);

        // Event listeners
        document.getElementById('onboarding-next')?.addEventListener('click', () => this.next());
        document.getElementById('onboarding-prev')?.addEventListener('click', () => this.prev());
        document.getElementById('onboarding-skip')?.addEventListener('click', () => this.complete());
    },

    /**
     * Posiciona o tooltip
     * @param {Object} step - Passo atual
     */
    positionTooltip(step) {
        const tooltip = this.tooltip.querySelector('.onboarding-tooltip__content');
        if (!tooltip) return;

        if (step.position === 'center' || !step.target) {
            this.tooltip.style.top = '50%';
            this.tooltip.style.left = '50%';
            this.tooltip.style.transform = 'translate(-50%, -50%)';
            return;
        }

        const target = document.querySelector(step.target);
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const margin = 16;

        let top, left;
        this.tooltip.style.transform = 'none';

        switch (step.position) {
            case 'top':
                top = rect.top - tooltipRect.height - margin;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                top = rect.bottom + margin;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - margin;
                break;
            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + margin;
                break;
        }

        // Garante que não saia da tela
        top = Math.max(margin, Math.min(top, window.innerHeight - tooltipRect.height - margin));
        left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));

        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${left}px`;
    },

    /**
     * Vai para o próximo passo
     */
    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.showStep(this.currentStep);
        } else {
            this.complete();
        }
    },

    /**
     * Volta para o passo anterior
     */
    prev() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    },

    /**
     * Completa o onboarding
     */
    complete() {
        localStorage.setItem('agenda-pro-onboarding-complete', 'true');
        this.destroy();
        
        // Celebração
        this.celebrate();
    },

    /**
     * Remove elementos do onboarding
     */
    destroy() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        document.body.style.overflow = '';
    },

    /**
     * Reinicia o tour
     */
    restart() {
        localStorage.removeItem('agenda-pro-onboarding-complete');
        this.start();
    },

    /**
     * Efeito de celebração
     */
    celebrate() {
        const colors = ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            container.appendChild(confetti);
        }

        setTimeout(() => container.remove(), 5000);
    }
};

// Estilos do onboarding
const onboardingStyles = `
.onboarding-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
}

.onboarding-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
}

.onboarding-spotlight {
    position: absolute;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75);
    border: 2px solid var(--color-primary);
    transition: all 0.4s ease;
    z-index: 1;
}

.onboarding-tooltip {
    position: absolute;
    z-index: 2;
}

.onboarding-tooltip__content {
    background: var(--color-bg-secondary);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 24px;
    max-width: 360px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.onboarding-tooltip__title {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 12px;
    color: var(--color-text-primary);
}

.onboarding-tooltip__text {
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin-bottom: 20px;
}

.onboarding-tooltip__progress {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 20px;
}

.onboarding-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-bg-tertiary);
    transition: all 0.3s ease;
}

.onboarding-dot.active {
    width: 24px;
    border-radius: 4px;
    background: var(--color-primary);
}

.onboarding-dot.completed {
    background: var(--color-success);
}

.onboarding-tooltip__actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}

.btn-sm {
    padding: 8px 16px;
    font-size: 14px;
}

.btn-ghost {
    background: transparent;
    color: var(--color-text-muted);
}

.btn-ghost:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-tertiary);
}
`;

// Injeta estilos
if (!document.getElementById('onboarding-styles')) {
    const style = document.createElement('style');
    style.id = 'onboarding-styles';
    style.textContent = onboardingStyles;
    document.head.appendChild(style);
}

// Exporta
window.Onboarding = Onboarding;
