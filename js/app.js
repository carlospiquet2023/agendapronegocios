/**
 * APP PRINCIPAL - Agenda Pro Negócios
 * Controlador principal da aplicação
 */

const App = {
    currentPage: 'dashboard',
    sidebarOpen: false,

    /**
     * Inicializa a aplicação
     */
    init() {
        console.log('🚀 Iniciando Agenda Pro Negócios...');

        // Verifica suporte a LocalStorage
        if (!Helpers.supportsStorage()) {
            alert('Seu navegador não suporta armazenamento local. O sistema não funcionará corretamente.');
            return;
        }

        // Inicializa componentes
        Toast.init();
        Modal.init();

        // Inicializa módulos
        this.initModules();

        // Configura navegação
        this.setupNavigation();

        // Configura sidebar mobile
        this.setupMobileSidebar();

        // Configura menu rápido
        this.setupQuickMenu();

        // Configura busca global
        this.setupGlobalSearch();

        // Registra Service Worker para PWA
        this.registerServiceWorker();

        // Verifica dados iniciais
        this.checkInitialData();

        // Esconde loader
        this.hideLoader();

        console.log('✅ Sistema iniciado com sucesso!');
    },

    /**
     * Inicializa todos os módulos
     */
    initModules() {
        // Ordem importa - alguns módulos dependem de outros
        ClientesModule.init();
        ServicosModule.init();
        AgendaModule.init();
        FinanceiroModule.init();
        RelatoriosModule.init();
        ConfiguracoesModule.init();
        WhatsAppModule.init();
        Dashboard.init();
    },

    /**
     * Configura sistema de navegação
     */
    setupNavigation() {
        // Links do menu
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateTo(page);
            });
        });

        // Navegação por hash
        window.addEventListener('hashchange', () => {
            const page = window.location.hash.slice(1) || 'dashboard';
            this.navigateTo(page, false);
        });

        // Carrega página inicial
        const initialPage = window.location.hash.slice(1) || 'dashboard';
        this.navigateTo(initialPage, false);
    },

    /**
     * Navega para uma página
     * @param {string} page - Nome da página
     * @param {boolean} updateHash - Se deve atualizar o hash da URL
     */
    navigateTo(page, updateHash = true) {
        // Esconde todas as páginas
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // Mostra página selecionada
        const pageEl = document.getElementById(`page-${page}`);
        if (pageEl) {
            pageEl.classList.add('active');
        }

        // Atualiza menu
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });

        // Atualiza título da página
        const titles = {
            dashboard: 'Dashboard',
            clientes: 'Clientes',
            agenda: 'Agenda',
            servicos: 'Serviços',
            financeiro: 'Financeiro',
            relatorios: 'Relatórios',
            configuracoes: 'Configurações'
        };

        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = titles[page] || 'Dashboard';
        }

        // Atualiza hash
        if (updateHash) {
            window.location.hash = page;
        }

        // Fecha sidebar mobile
        this.closeMobileSidebar();

        // Atualiza módulo se necessário
        this.refreshModule(page);

        this.currentPage = page;
    },

    /**
     * Atualiza dados do módulo ao entrar na página
     * @param {string} page - Nome da página
     */
    refreshModule(page) {
        switch (page) {
            case 'dashboard':
                Dashboard.update();
                break;
            case 'clientes':
                ClientesModule.render();
                break;
            case 'agenda':
                AgendaModule.render();
                break;
            case 'servicos':
                ServicosModule.render();
                break;
            case 'financeiro':
                FinanceiroModule.render();
                break;
        }
    },

    /**
     * Configura sidebar para mobile
     */
    setupMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const btnMenu = document.getElementById('btn-menu-mobile');
        const btnClose = document.getElementById('btn-toggle-sidebar');

        // Cria overlay
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.id = 'sidebar-overlay';
        document.body.appendChild(overlay);

        // Abre sidebar
        btnMenu?.addEventListener('click', () => {
            this.openMobileSidebar();
        });

        // Fecha sidebar
        btnClose?.addEventListener('click', () => {
            this.closeMobileSidebar();
        });

        overlay.addEventListener('click', () => {
            this.closeMobileSidebar();
        });
    },

    /**
     * Abre sidebar mobile
     */
    openMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        sidebar?.classList.add('open');
        overlay?.classList.add('active');
        this.sidebarOpen = true;
    },

    /**
     * Fecha sidebar mobile
     */
    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        sidebar?.classList.remove('open');
        overlay?.classList.remove('active');
        this.sidebarOpen = false;
    },

    /**
     * Configura menu rápido
     */
    setupQuickMenu() {
        const btnQuickAdd = document.getElementById('btn-quick-add');
        const quickMenu = document.getElementById('quick-menu');

        // Toggle menu
        btnQuickAdd?.addEventListener('click', (e) => {
            e.stopPropagation();
            quickMenu?.classList.toggle('hidden');
        });

        // Fecha ao clicar fora
        document.addEventListener('click', (e) => {
            if (!quickMenu?.contains(e.target) && e.target !== btnQuickAdd) {
                quickMenu?.classList.add('hidden');
            }
        });

        // Ações do menu rápido
        document.querySelectorAll('.quick-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                quickMenu?.classList.add('hidden');

                switch (action) {
                    case 'novo-cliente':
                        this.navigateTo('clientes');
                        setTimeout(() => ClientesModule.openForm(), 300);
                        break;
                    case 'novo-agendamento':
                        this.navigateTo('agenda');
                        setTimeout(() => AgendaModule.openForm(), 300);
                        break;
                    case 'novo-servico':
                        this.navigateTo('servicos');
                        setTimeout(() => ServicosModule.openForm(), 300);
                        break;
                    case 'nova-transacao':
                        this.navigateTo('financeiro');
                        setTimeout(() => FinanceiroModule.openForm(), 300);
                        break;
                }
            });
        });
    },

    /**
     * Configura busca global
     */
    setupGlobalSearch() {
        const searchInput = document.getElementById('global-search');

        searchInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const termo = e.target.value.trim();
                if (termo) {
                    this.globalSearch(termo);
                }
            }
        });
    },

    /**
     * Realiza busca global
     * @param {string} termo - Termo de busca
     */
    globalSearch(termo) {
        // Busca em clientes
        const clientes = Helpers.filterBySearch(Storage.getClientes(), termo, ['nome', 'telefone', 'email']);
        
        // Busca em serviços
        const servicos = Helpers.filterBySearch(Storage.getServicos(), termo, ['nome', 'descricao']);

        const totalResultados = clientes.length + servicos.length;

        if (totalResultados === 0) {
            Toast.info('Nenhum resultado encontrado');
            return;
        }

        // Se encontrou apenas em uma categoria, navega direto
        if (clientes.length > 0 && servicos.length === 0) {
            this.navigateTo('clientes');
            setTimeout(() => ClientesModule.render(termo), 100);
        } else if (servicos.length > 0 && clientes.length === 0) {
            this.navigateTo('servicos');
            setTimeout(() => ServicosModule.render(termo), 100);
        } else {
            // Mostra modal com resultados
            this.showSearchResults(termo, clientes, servicos);
        }
    },

    /**
     * Mostra resultados da busca
     * @param {string} termo - Termo buscado
     * @param {Array} clientes - Clientes encontrados
     * @param {Array} servicos - Serviços encontrados
     */
    showSearchResults(termo, clientes, servicos) {
        let content = `<p style="margin-bottom: 16px; color: var(--color-gray-600);">Resultados para "${Helpers.escapeHtml(termo)}":</p>`;

        if (clientes.length > 0) {
            content += `
                <h4 style="margin-bottom: 8px;">👥 Clientes (${clientes.length})</h4>
                <div style="margin-bottom: 16px;">
                    ${clientes.slice(0, 3).map(c => `
                        <div class="list-item" style="cursor: pointer;" onclick="App.navigateTo('clientes'); Modal.close();">
                            <span>${Helpers.escapeHtml(c.nome)}</span>
                        </div>
                    `).join('')}
                    ${clientes.length > 3 ? `<p style="font-size: 12px; color: var(--color-gray-500);">+${clientes.length - 3} mais...</p>` : ''}
                </div>
            `;
        }

        if (servicos.length > 0) {
            content += `
                <h4 style="margin-bottom: 8px;">🔧 Serviços (${servicos.length})</h4>
                <div>
                    ${servicos.slice(0, 3).map(s => `
                        <div class="list-item" style="cursor: pointer;" onclick="App.navigateTo('servicos'); Modal.close();">
                            <span>${s.icone || '🔧'} ${Helpers.escapeHtml(s.nome)}</span>
                        </div>
                    `).join('')}
                    ${servicos.length > 3 ? `<p style="font-size: 12px; color: var(--color-gray-500);">+${servicos.length - 3} mais...</p>` : ''}
                </div>
            `;
        }

        Modal.open({
            title: '🔍 Busca',
            content,
            size: 'sm'
        });
    },

    /**
     * Registra Service Worker para PWA
     */
    registerServiceWorker() {
        if (Helpers.supportsSW()) {
            window.addEventListener('load', async () => {
                try {
                    const registration = await navigator.serviceWorker.register('sw.js');
                    console.log('✅ Service Worker registrado:', registration.scope);
                } catch (error) {
                    console.log('❌ Erro ao registrar Service Worker:', error);
                }
            });
        }
    },

    /**
     * Verifica e inicializa dados iniciais
     */
    checkInitialData() {
        const clientes = Storage.getClientes();
        const servicos = Storage.getServicos();

        // Se não há dados, mostra boas-vindas
        if (clientes.length === 0 && servicos.length === 0) {
            this.showWelcome();
        }
    },

    /**
     * Mostra modal de boas-vindas
     */
    showWelcome() {
        setTimeout(() => {
            Modal.open({
                title: '👋 Bem-vindo ao Agenda Pro!',
                content: `
                    <div style="text-align: center;">
                        <p style="font-size: 48px; margin-bottom: 16px;">📅</p>
                        <p style="margin-bottom: 16px; color: var(--color-gray-600);">
                            Sistema completo de gestão para seu negócio.
                        </p>
                        <p style="margin-bottom: 24px; color: var(--color-gray-600);">
                            Para começar, configure seu negócio e cadastre seus primeiros clientes e serviços.
                        </p>
                        <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                            <button class="btn btn-primary" onclick="App.navigateTo('configuracoes'); Modal.close();">
                                ⚙️ Configurar Negócio
                            </button>
                            <button class="btn btn-secondary" onclick="Modal.close();">
                                Depois
                            </button>
                        </div>
                    </div>
                `,
                size: 'sm'
            });
        }, 500);
    },

    /**
     * Esconde loader inicial
     */
    hideLoader() {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => {
                loader.remove();
            }, 300);
        }
    }
};

// Inicializa quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Expõe para debug
window.App = App;
window.Storage = Storage;
window.Helpers = Helpers;
