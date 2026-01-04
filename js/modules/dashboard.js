/**
 * MÓDULO DASHBOARD - Agenda Pro Negócios
 * Painel principal com visão geral, gráficos e animações
 */

const Dashboard = {
    statClientes: null,
    statAgendamentosHoje: null,
    statPendentes: null,
    statFaturamentoMes: null,
    listaAgendamentosHoje: null,
    listaLembretes: null,
    listaUltimosClientes: null,
    listaTopServicos: null,
    chartFaturamento: null,
    chartServicos: null,

    // Cache para celebrações
    milestones: {
        clientes: [10, 25, 50, 100, 250, 500, 1000],
        faturamento: [1000, 5000, 10000, 25000, 50000, 100000]
    },
    celebratedMilestones: null,

    /**
     * Inicializa o dashboard
     */
    init() {
        this.statClientes = document.getElementById('stat-clientes');
        this.statAgendamentosHoje = document.getElementById('stat-agendamentos-hoje');
        this.statPendentes = document.getElementById('stat-pendentes');
        this.statFaturamentoMes = document.getElementById('stat-faturamento-mes');
        this.listaAgendamentosHoje = document.getElementById('lista-agendamentos-hoje');
        this.listaLembretes = document.getElementById('lista-lembretes');
        this.listaUltimosClientes = document.getElementById('lista-ultimos-clientes');
        this.listaTopServicos = document.getElementById('lista-top-servicos');
        this.chartFaturamento = document.getElementById('chart-faturamento');
        this.chartServicos = document.getElementById('chart-servicos');

        // Carrega milestones já celebrados
        this.celebratedMilestones = Storage.get('celebratedMilestones') || {};

        this.bindEvents();
        this.update();
        
        // Inicializa onboarding para novos usuários
        if (typeof Onboarding !== 'undefined') {
            setTimeout(() => Onboarding.init(), 500);
        }

        console.log('📊 Dashboard inicializado');
    },

    /**
     * Vincula eventos do dashboard
     */
    bindEvents() {
        // Marcar todos lembretes como lidos
        document.getElementById('btn-marcar-todos-lidos')?.addEventListener('click', () => {
            this.marcarTodosLembretesLidos();
        });

        // Click em links de navegação
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                App.navigateTo(page);
            });
        });
    },

    /**
     * Atualiza todos os dados do dashboard
     */
    update() {
        this.updateStats();
        this.updateAgendamentosHoje();
        this.updateLembretes();
        this.updateUltimosClientes();
        this.updateTopServicos();
        this.updateCharts();
    },

    /**
     * Atualiza estatísticas com animação
     */
    updateStats() {
        // Total de clientes
        if (this.statClientes) {
            const totalClientes = Storage.getClientes().length;
            this.animateNumber(this.statClientes, totalClientes);
            this.checkMilestone('clientes', totalClientes);
        }

        // Agendamentos hoje
        if (this.statAgendamentosHoje) {
            const hoje = Storage.getAgendamentosHoje();
            this.animateNumber(this.statAgendamentosHoje, hoje.length);
        }

        // Pendentes
        if (this.statPendentes) {
            const agendamentos = Storage.getAgendamentos();
            const pendentes = agendamentos.filter(a => 
                a.status === 'pendente' || a.status === 'confirmado'
            ).length;
            this.animateNumber(this.statPendentes, pendentes);
        }

        // Faturamento do mês
        if (this.statFaturamentoMes) {
            const faturamento = FinanceiroModule.getFaturamentoMes();
            this.animateCurrency(this.statFaturamentoMes, faturamento);
            this.checkMilestone('faturamento', faturamento);
        }
    },

    /**
     * Anima número de 0 até o valor final
     */
    animateNumber(element, endValue) {
        const duration = 1200;
        const startValue = parseInt(element.textContent) || 0;
        const startTime = performance.now();

        const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutExpo(progress);
            
            const currentValue = Math.round(startValue + (endValue - startValue) * easedProgress);
            element.textContent = currentValue.toLocaleString('pt-BR');

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.classList.add('stat-highlight');
                setTimeout(() => element.classList.remove('stat-highlight'), 500);
            }
        };

        requestAnimationFrame(animate);
    },

    /**
     * Anima valor monetário
     */
    animateCurrency(element, endValue) {
        const duration = 1500;
        const startValue = parseFloat(element.textContent.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
        const startTime = performance.now();

        const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutExpo(progress);
            
            const currentValue = startValue + (endValue - startValue) * easedProgress;
            element.textContent = Helpers.formatCurrency(currentValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.classList.add('stat-highlight');
                setTimeout(() => element.classList.remove('stat-highlight'), 500);
            }
        };

        requestAnimationFrame(animate);
    },

    /**
     * Verifica se atingiu um milestone para celebrar
     */
    checkMilestone(type, value) {
        const milestones = this.milestones[type];
        if (!milestones) return;

        for (const milestone of milestones) {
            const key = `${type}_${milestone}`;
            
            if (value >= milestone && !this.celebratedMilestones[key]) {
                this.celebratedMilestones[key] = true;
                Storage.set('celebratedMilestones', this.celebratedMilestones);
                
                // Celebra após um pequeno delay
                setTimeout(() => this.celebrate(type, milestone), 1500);
                break;
            }
        }
    },

    /**
     * Celebra conquista de milestone
     */
    celebrate(type, milestone) {
        const messages = {
            clientes: {
                10: '🎉 10 clientes! Seu negócio está crescendo!',
                25: '🚀 25 clientes! Incrível progresso!',
                50: '⭐ 50 clientes! Você está bombando!',
                100: '🏆 100 CLIENTES! Sucesso absoluto!',
                250: '💎 250 clientes! Você é uma referência!',
                500: '👑 500 clientes! Lenda!',
                1000: '🎊 1000 CLIENTES! ÉPICO!'
            },
            faturamento: {
                1000: '💰 R$ 1.000 este mês! Parabéns!',
                5000: '💵 R$ 5.000! Excelente faturamento!',
                10000: '🤑 R$ 10.000! Negócio próspero!',
                25000: '💎 R$ 25.000! Você está voando!',
                50000: '👑 R$ 50.000! Sucesso empresarial!',
                100000: '🎊 R$ 100.000! INCRÍVEL!'
            }
        };

        const message = messages[type]?.[milestone];
        if (!message) return;

        // Toast especial
        Toast.success(message, '🏆 Conquista Desbloqueada!');

        // Confetti!
        if (typeof Confetti !== 'undefined') {
            if (milestone >= 100 || (type === 'faturamento' && milestone >= 10000)) {
                Confetti.celebrate();
            } else {
                Confetti.cannons();
            }
        }

        // Som de celebração
        SoundFX?.play?.('celebration');
        HapticFeedback?.success?.();
    },

    /**
     * Atualiza gráficos
     */
    updateCharts() {
        // Gráfico de faturamento dos últimos 6 meses
        if (this.chartFaturamento && typeof Charts !== 'undefined') {
            const dados = this.getFaturamentoUltimos6Meses();
            Charts.bar('chart-faturamento', dados, {
                height: 180,
                animate: true,
                colors: ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d4b8ff', '#e9d5ff']
            });
        }

        // Gráfico de serviços
        if (this.chartServicos && typeof Charts !== 'undefined') {
            const servicos = ServicosModule.getTopServicos(5);
            if (servicos.length > 0) {
                const dados = servicos.map(s => ({
                    label: s.nome.substring(0, 10),
                    value: s.total || 0
                }));
                Charts.donut('chart-servicos', dados, {
                    size: 160,
                    thickness: 25,
                    centerText: 'Serviços',
                    showLegend: true
                });
            }
        }
    },

    /**
     * Obtém faturamento dos últimos 6 meses
     * @returns {Array} Dados formatados para gráfico
     */
    getFaturamentoUltimos6Meses() {
        const meses = [];
        const hoje = new Date();

        for (let i = 5; i >= 0; i--) {
            const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
            const mes = data.toLocaleString('pt-BR', { month: 'short' });
            const ano = data.getFullYear();
            const mesNum = data.getMonth();

            const transacoes = Storage.getTransacoes().filter(t => {
                const tData = new Date(t.data);
                return tData.getMonth() === mesNum && 
                       tData.getFullYear() === ano && 
                       t.tipo === 'receita';
            });

            const total = transacoes.reduce((sum, t) => sum + t.valor, 0);

            meses.push({
                label: mes.charAt(0).toUpperCase() + mes.slice(1),
                value: total
            });
        }

        return meses;
    },

    /**
     * Atualiza lista de agendamentos de hoje
     */
    updateAgendamentosHoje() {
        if (!this.listaAgendamentosHoje) return;

        const agendamentos = Storage.getAgendamentosHoje()
            .filter(a => a.status !== 'cancelado')
            .sort((a, b) => a.hora.localeCompare(b.hora));

        if (agendamentos.length === 0) {
            this.listaAgendamentosHoje.innerHTML = `
                <p class="empty-state" style="padding: 20px;">
                    Nenhum agendamento para hoje
                </p>
            `;
            return;
        }

        this.listaAgendamentosHoje.innerHTML = agendamentos.slice(0, 5).map(agend => {
            const cliente = Storage.getClienteById(agend.clienteId);
            const servico = Storage.getServicoById(agend.servicoId);

            const statusColors = {
                pendente: 'var(--color-warning)',
                confirmado: 'var(--color-info)',
                concluido: 'var(--color-success)'
            };

            return `
                <div class="list-item" style="border-left: 3px solid ${statusColors[agend.status] || 'var(--color-gray-300)'}">
                    <div class="list-item-icon">${servico?.icone || '📅'}</div>
                    <div class="list-item-content">
                        <span class="list-item-title">${agend.hora} - ${cliente?.nome || 'Cliente'}</span>
                        <span class="list-item-subtitle">${servico?.nome || 'Serviço'}</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Atualiza lista de lembretes
     */
    updateLembretes() {
        if (!this.listaLembretes) return;

        const lembretes = Storage.getLembretesNaoLidos()
            .sort((a, b) => new Date(a.data) - new Date(b.data))
            .slice(0, 5);

        // Atualiza badge de notificações
        const notificationCount = document.getElementById('notification-count');
        if (notificationCount) {
            notificationCount.textContent = lembretes.length;
            notificationCount.dataset.count = lembretes.length;
        }

        if (lembretes.length === 0) {
            this.listaLembretes.innerHTML = `
                <p class="empty-state" style="padding: 20px;">
                    ✅ Nenhum lembrete pendente
                </p>
            `;
            return;
        }

        this.listaLembretes.innerHTML = lembretes.map(lembrete => `
            <div class="list-item" data-id="${lembrete.id}">
                <div class="list-item-icon">🔔</div>
                <div class="list-item-content">
                    <span class="list-item-title">${Helpers.escapeHtml(lembrete.titulo)}</span>
                    <span class="list-item-subtitle">${Helpers.escapeHtml(lembrete.mensagem)}</span>
                </div>
                <button class="btn-icon" onclick="Dashboard.marcarLembreteLido('${lembrete.id}')" title="Marcar como lido">
                    ✓
                </button>
            </div>
        `).join('');
    },

    /**
     * Atualiza lista de últimos clientes
     */
    updateUltimosClientes() {
        if (!this.listaUltimosClientes) return;

        const clientes = ClientesModule.getRecentes(5);

        if (clientes.length === 0) {
            this.listaUltimosClientes.innerHTML = `
                <p class="empty-state" style="padding: 20px;">
                    Nenhum cliente cadastrado
                </p>
            `;
            return;
        }

        this.listaUltimosClientes.innerHTML = clientes.map(cliente => `
            <div class="list-item">
                <div class="list-item-icon" style="background: ${Helpers.randomColor()}20; font-size: 14px;">
                    ${Helpers.getInitials(cliente.nome)}
                </div>
                <div class="list-item-content">
                    <span class="list-item-title">${Helpers.escapeHtml(cliente.nome)}</span>
                    <span class="list-item-subtitle">${Helpers.formatPhone(cliente.telefone)}</span>
                </div>
            </div>
        `).join('');
    },

    /**
     * Atualiza lista de top serviços
     */
    updateTopServicos() {
        if (!this.listaTopServicos) return;

        const servicos = ServicosModule.getTopServicos(5);

        if (servicos.length === 0) {
            this.listaTopServicos.innerHTML = `
                <p class="empty-state" style="padding: 20px;">
                    Nenhum serviço cadastrado
                </p>
            `;
            return;
        }

        this.listaTopServicos.innerHTML = servicos.map((servico, index) => `
            <div class="list-item">
                <div class="list-item-icon">${servico.icone || '🔧'}</div>
                <div class="list-item-content">
                    <span class="list-item-title">${Helpers.escapeHtml(servico.nome)}</span>
                    <span class="list-item-subtitle">${servico.total} realizado(s) - ${Helpers.formatCurrency(servico.preco)}</span>
                </div>
                <span class="badge badge-${index === 0 ? 'success' : 'primary'}">#${index + 1}</span>
            </div>
        `).join('');
    },

    /**
     * Marca lembrete como lido
     * @param {string} id - ID do lembrete
     */
    marcarLembreteLido(id) {
        if (Storage.marcarLembreteLido(id)) {
            this.updateLembretes();
        }
    },

    /**
     * Marca todos os lembretes como lidos
     */
    marcarTodosLembretesLidos() {
        const lembretes = Storage.getLembretesNaoLidos();
        lembretes.forEach(l => Storage.marcarLembreteLido(l.id));
        this.updateLembretes();
        Toast.success('Todos os lembretes foram marcados como lidos!');
    }
};
