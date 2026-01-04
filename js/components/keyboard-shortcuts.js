/**
 * ═══════════════════════════════════════════════════════════════
 * KEYBOARD SHORTCUTS - Agenda Pro Negócios
 * Sistema de atalhos de teclado para produtividade
 * ═══════════════════════════════════════════════════════════════
 */

const KeyboardShortcuts = {
    // Mapeamento de atalhos
    shortcuts: {
        // Navegação
        'ctrl+1': { action: 'navigate', page: 'dashboard', desc: 'Ir para Dashboard' },
        'ctrl+2': { action: 'navigate', page: 'clientes', desc: 'Ir para Clientes' },
        'ctrl+3': { action: 'navigate', page: 'agenda', desc: 'Ir para Agenda' },
        'ctrl+4': { action: 'navigate', page: 'servicos', desc: 'Ir para Serviços' },
        'ctrl+5': { action: 'navigate', page: 'financeiro', desc: 'Ir para Financeiro' },
        'ctrl+6': { action: 'navigate', page: 'relatorios', desc: 'Ir para Relatórios' },
        'ctrl+7': { action: 'navigate', page: 'configuracoes', desc: 'Ir para Configurações' },

        // Ações rápidas
        'ctrl+n': { action: 'novo', desc: 'Novo item (contextual)' },
        'ctrl+shift+c': { action: 'novoCliente', desc: 'Novo Cliente' },
        'ctrl+shift+a': { action: 'novoAgendamento', desc: 'Novo Agendamento' },
        'ctrl+shift+s': { action: 'novoServico', desc: 'Novo Serviço' },
        'ctrl+shift+t': { action: 'novaTransacao', desc: 'Nova Transação' },

        // Interface
        'ctrl+b': { action: 'toggleSidebar', desc: 'Mostrar/ocultar menu' },
        'ctrl+k': { action: 'search', desc: 'Busca rápida' },
        'ctrl+/': { action: 'showShortcuts', desc: 'Ver atalhos' },
        'escape': { action: 'closeModal', desc: 'Fechar modal/cancelar' },

        // Tema
        'ctrl+shift+d': { action: 'toggleTheme', desc: 'Alternar tema claro/escuro' },
    },

    // Estado
    enabled: true,

    /**
     * Inicializa o sistema
     */
    init() {
        this.bindEvents();
        console.log('⌨️ Keyboard Shortcuts inicializados');
    },

    /**
     * Vincula eventos de teclado
     */
    bindEvents() {
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    },

    /**
     * Trata evento de tecla
     */
    handleKeydown(e) {
        if (!this.enabled) return;

        // Ignora se estiver em input/textarea
        const tagName = e.target.tagName.toLowerCase();
        if (['input', 'textarea', 'select'].includes(tagName) && e.key !== 'Escape') {
            return;
        }

        // Monta string do atalho
        const keys = [];
        if (e.ctrlKey || e.metaKey) keys.push('ctrl');
        if (e.shiftKey) keys.push('shift');
        if (e.altKey) keys.push('alt');
        keys.push(e.key.toLowerCase());

        const shortcut = keys.join('+');

        // Verifica se existe atalho
        const action = this.shortcuts[shortcut];
        if (action) {
            e.preventDefault();
            this.executeAction(action);
        }
    },

    /**
     * Executa ação do atalho
     */
    executeAction(config) {
        SoundFX?.play?.('click');

        switch (config.action) {
            case 'navigate':
                this.navigateTo(config.page);
                break;

            case 'novo':
                this.novoContextual();
                break;

            case 'novoCliente':
                document.querySelector('[data-action="novo-cliente"]')?.click();
                break;

            case 'novoAgendamento':
                document.querySelector('[data-action="novo-agendamento"]')?.click();
                break;

            case 'novoServico':
                document.querySelector('[data-action="novo-servico"]')?.click();
                break;

            case 'novaTransacao':
                document.querySelector('[data-action="nova-transacao"]')?.click();
                break;

            case 'toggleSidebar':
                document.getElementById('sidebar')?.classList.toggle('collapsed');
                break;

            case 'search':
                this.openSearchModal();
                break;

            case 'showShortcuts':
                this.showShortcutsModal();
                break;

            case 'closeModal':
                Modal?.closeAll?.();
                break;

            case 'toggleTheme':
                ThemeManager?.toggle?.();
                break;
        }
    },

    /**
     * Navega para uma página
     */
    navigateTo(page) {
        const link = document.querySelector(`[data-page="${page}"]`);
        if (link) {
            link.click();
            Toast?.info?.(`Navegando para ${page}`);
        }
    },

    /**
     * Novo item baseado na página atual
     */
    novoContextual() {
        const activePage = document.querySelector('.page.active')?.dataset?.page;
        
        const actions = {
            clientes: 'novo-cliente',
            agenda: 'novo-agendamento',
            servicos: 'novo-servico',
            financeiro: 'nova-transacao'
        };

        const action = actions[activePage];
        if (action) {
            document.querySelector(`[data-action="${action}"]`)?.click();
        } else {
            // Abre menu rápido
            document.getElementById('fab-main')?.click();
        }
    },

    /**
     * Abre modal de busca rápida
     */
    openSearchModal() {
        // Cria modal de busca se não existir
        if (!document.getElementById('search-modal')) {
            const modal = document.createElement('div');
            modal.id = 'search-modal';
            modal.className = 'search-modal-overlay';
            modal.innerHTML = `
                <div class="search-modal">
                    <div class="search-input-wrapper">
                        <span class="search-icon">🔍</span>
                        <input type="text" id="global-search-input" 
                               placeholder="Buscar clientes, serviços, agendamentos..." 
                               autocomplete="off">
                        <kbd>ESC</kbd>
                    </div>
                    <div id="search-results" class="search-results"></div>
                </div>
            `;
            document.body.appendChild(modal);

            // Fechar ao clicar fora
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('active');
            });

            // Busca
            const input = modal.querySelector('#global-search-input');
            input.addEventListener('input', (e) => this.performSearch(e.target.value));
        }

        // Mostra e foca
        const modal = document.getElementById('search-modal');
        modal.classList.add('active');
        setTimeout(() => {
            document.getElementById('global-search-input').focus();
        }, 100);
    },

    /**
     * Realiza busca
     */
    performSearch(query) {
        const resultsContainer = document.getElementById('search-results');
        
        if (query.length < 2) {
            resultsContainer.innerHTML = '<p class="search-hint">Digite pelo menos 2 caracteres...</p>';
            return;
        }

        const results = [];
        const q = query.toLowerCase();

        // Busca clientes
        const clientes = Storage.get('clientes') || [];
        clientes.filter(c => 
            c.nome?.toLowerCase().includes(q) || 
            c.telefone?.includes(q) ||
            c.email?.toLowerCase().includes(q)
        ).slice(0, 3).forEach(c => {
            results.push({
                type: 'cliente',
                icon: '👤',
                title: c.nome,
                subtitle: c.telefone,
                action: () => {
                    this.navigateTo('clientes');
                    document.getElementById('search-modal').classList.remove('active');
                }
            });
        });

        // Busca serviços
        const servicos = Storage.get('servicos') || [];
        servicos.filter(s => s.nome?.toLowerCase().includes(q))
            .slice(0, 3).forEach(s => {
            results.push({
                type: 'servico',
                icon: '🔧',
                title: s.nome,
                subtitle: Helpers.formatCurrency(s.preco),
                action: () => {
                    this.navigateTo('servicos');
                    document.getElementById('search-modal').classList.remove('active');
                }
            });
        });

        // Busca páginas
        const pages = [
            { name: 'Dashboard', page: 'dashboard', icon: '📊' },
            { name: 'Clientes', page: 'clientes', icon: '👥' },
            { name: 'Agenda', page: 'agenda', icon: '📅' },
            { name: 'Serviços', page: 'servicos', icon: '🔧' },
            { name: 'Financeiro', page: 'financeiro', icon: '💰' },
            { name: 'Relatórios', page: 'relatorios', icon: '📈' },
            { name: 'Configurações', page: 'configuracoes', icon: '⚙️' }
        ];
        
        pages.filter(p => p.name.toLowerCase().includes(q)).forEach(p => {
            results.push({
                type: 'page',
                icon: p.icon,
                title: p.name,
                subtitle: 'Página',
                action: () => {
                    this.navigateTo(p.page);
                    document.getElementById('search-modal').classList.remove('active');
                }
            });
        });

        // Renderiza resultados
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="search-no-results">Nenhum resultado encontrado</p>';
            return;
        }

        resultsContainer.innerHTML = results.map((r, i) => `
            <button class="search-result-item" data-index="${i}">
                <span class="search-result-icon">${r.icon}</span>
                <div class="search-result-content">
                    <span class="search-result-title">${r.title}</span>
                    <span class="search-result-subtitle">${r.subtitle}</span>
                </div>
            </button>
        `).join('');

        // Adiciona eventos
        resultsContainer.querySelectorAll('.search-result-item').forEach((item, i) => {
            item.addEventListener('click', () => results[i].action());
        });
    },

    /**
     * Mostra modal com lista de atalhos
     */
    showShortcutsModal() {
        const groups = {
            'Navegação': [],
            'Ações Rápidas': [],
            'Interface': []
        };

        // Agrupa atalhos
        Object.entries(this.shortcuts).forEach(([key, config]) => {
            const item = { key: this.formatShortcut(key), desc: config.desc };
            
            if (config.action === 'navigate') {
                groups['Navegação'].push(item);
            } else if (config.action.startsWith('novo') || config.action.startsWith('Nova')) {
                groups['Ações Rápidas'].push(item);
            } else {
                groups['Interface'].push(item);
            }
        });

        // HTML do modal
        const html = `
            <div class="shortcuts-modal">
                <h2>⌨️ Atalhos de Teclado</h2>
                ${Object.entries(groups).map(([title, items]) => `
                    <div class="shortcuts-group">
                        <h3>${title}</h3>
                        ${items.map(i => `
                            <div class="shortcut-item">
                                <kbd>${i.key}</kbd>
                                <span>${i.desc}</span>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        `;

        Modal.show({
            title: 'Atalhos de Teclado',
            content: html,
            size: 'medium'
        });
    },

    /**
     * Formata atalho para exibição
     */
    formatShortcut(shortcut) {
        return shortcut
            .replace('ctrl', '⌘/Ctrl')
            .replace('shift', '⇧')
            .replace('alt', '⌥')
            .replace('escape', 'Esc')
            .replace('+', ' + ')
            .toUpperCase();
    }
};

// Auto-inicializa
document.addEventListener('DOMContentLoaded', () => KeyboardShortcuts.init());

// Exporta globalmente
window.KeyboardShortcuts = KeyboardShortcuts;
