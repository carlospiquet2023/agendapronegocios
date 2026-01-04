/**
 * MÓDULO FINANCEIRO - Agenda Pro Negócios
 * Controle de receitas e despesas
 */

const FinanceiroModule = {
    tbodyTransacoes: null,
    filtroMes: null,
    btnNova: null,
    statReceitas: null,
    statDespesas: null,
    statSaldo: null,
    
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth(),

    /**
     * Inicializa o módulo financeiro
     */
    init() {
        this.tbodyTransacoes = document.getElementById('tbody-transacoes');
        this.filtroMes = document.getElementById('filtro-financeiro-mes');
        this.btnNova = document.getElementById('btn-nova-transacao');
        this.statReceitas = document.getElementById('stat-receitas');
        this.statDespesas = document.getElementById('stat-despesas');
        this.statSaldo = document.getElementById('stat-saldo');

        // Define mês atual no filtro
        if (this.filtroMes) {
            this.filtroMes.value = this.currentMonth;
        }

        this.bindEvents();
        this.render();
    },

    /**
     * Vincula eventos do módulo
     */
    bindEvents() {
        // Nova transação
        this.btnNova?.addEventListener('click', () => this.openForm());

        // Filtro de mês
        this.filtroMes?.addEventListener('change', (e) => {
            this.currentMonth = parseInt(e.target.value);
            this.render();
        });

        // Delegação de eventos na tabela
        this.tbodyTransacoes?.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            const id = btn.dataset.id;
            const action = btn.dataset.action;

            switch (action) {
                case 'editar':
                    this.edit(id);
                    break;
                case 'excluir':
                    this.delete(id);
                    break;
            }
        });
    },

    /**
     * Renderiza módulo financeiro
     */
    render() {
        this.updateStats();
        this.renderTransacoes();
    },

    /**
     * Atualiza estatísticas
     */
    updateStats() {
        const transacoes = Storage.getTransacoesByMonth(this.currentYear, this.currentMonth);
        
        let receitas = 0;
        let despesas = 0;

        transacoes.forEach(t => {
            if (t.tipo === 'receita') {
                receitas += t.valor;
            } else {
                despesas += t.valor;
            }
        });

        const saldo = receitas - despesas;

        if (this.statReceitas) {
            this.statReceitas.textContent = Helpers.formatCurrency(receitas);
        }
        if (this.statDespesas) {
            this.statDespesas.textContent = Helpers.formatCurrency(despesas);
        }
        if (this.statSaldo) {
            this.statSaldo.textContent = Helpers.formatCurrency(saldo);
            this.statSaldo.style.color = saldo >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
        }
    },

    /**
     * Renderiza lista de transações
     */
    renderTransacoes() {
        if (!this.tbodyTransacoes) return;

        let transacoes = Storage.getTransacoesByMonth(this.currentYear, this.currentMonth);
        
        // Ordenar por data (mais recente primeiro)
        transacoes = Helpers.sortBy(transacoes, 'data', 'desc');

        if (transacoes.length === 0) {
            this.tbodyTransacoes.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center" style="padding: 40px;">
                        <div class="empty-state">
                            <span class="empty-state-icon">💰</span>
                            <p>Nenhuma transação neste mês</p>
                            <button class="btn btn-primary" onclick="FinanceiroModule.openForm()">Registrar transação</button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        const categoriaIcons = {
            servico: '🔧',
            produto: '📦',
            material: '🧱',
            aluguel: '🏠',
            salario: '👤',
            imposto: '📋',
            outro: '📌'
        };

        this.tbodyTransacoes.innerHTML = transacoes.map(trans => {
            const isReceita = trans.tipo === 'receita';
            
            return `
                <tr>
                    <td>${Helpers.formatDate(trans.data, 'short')}</td>
                    <td>${Helpers.escapeHtml(trans.descricao)}</td>
                    <td>
                        <span class="badge badge-${isReceita ? 'success' : 'warning'}">
                            ${categoriaIcons[trans.categoria] || '📌'} ${Helpers.capitalize(trans.categoria)}
                        </span>
                    </td>
                    <td>
                        <span class="badge ${isReceita ? 'badge-success' : 'badge-danger'}">
                            ${isReceita ? '📈 Receita' : '📉 Despesa'}
                        </span>
                    </td>
                    <td class="${isReceita ? 'text-success' : 'text-danger'}">
                        ${isReceita ? '+' : '-'} ${Helpers.formatCurrency(trans.valor)}
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon" data-action="editar" data-id="${trans.id}" title="Editar">
                                ✏️
                            </button>
                            <button class="btn-icon" data-action="excluir" data-id="${trans.id}" title="Excluir">
                                🗑️
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    /**
     * Abre formulário de transação
     * @param {Object} transacao - Transação para edição
     */
    async openForm(transacao = null) {
        const resultado = await Modal.formTransacao(transacao);
        
        if (resultado) {
            if (resultado.id) {
                // Edição
                const updated = Storage.updateTransacao(resultado.id, resultado);
                if (updated) {
                    Toast.success('Transação atualizada!');
                } else {
                    Toast.error('Erro ao atualizar transação');
                }
            } else {
                // Nova
                const created = Storage.addTransacao(resultado);
                if (created) {
                    Toast.success('Transação registrada!');
                } else {
                    Toast.error('Erro ao registrar transação');
                }
            }
            
            this.render();
            Dashboard.update();
        }
    },

    /**
     * Edita uma transação
     * @param {string} id - ID da transação
     */
    edit(id) {
        const transacoes = Storage.getTransacoes();
        const transacao = transacoes.find(t => t.id === id);
        
        if (transacao) {
            this.openForm(transacao);
        } else {
            Toast.error('Transação não encontrada');
        }
    },

    /**
     * Exclui uma transação
     * @param {string} id - ID da transação
     */
    async delete(id) {
        const confirmado = await Modal.confirm({
            title: 'Excluir Transação',
            message: 'Deseja realmente excluir esta transação?',
            confirmText: 'Excluir',
            type: 'danger'
        });

        if (confirmado) {
            if (Storage.deleteTransacao(id)) {
                Toast.success('Transação excluída!');
                this.render();
                Dashboard.update();
            } else {
                Toast.error('Erro ao excluir transação');
            }
        }
    },

    /**
     * Retorna faturamento do mês atual
     * @returns {number}
     */
    getFaturamentoMes() {
        const today = new Date();
        const transacoes = Storage.getTransacoesByMonth(today.getFullYear(), today.getMonth());
        
        return transacoes
            .filter(t => t.tipo === 'receita')
            .reduce((acc, t) => acc + t.valor, 0);
    },

    /**
     * Retorna resumo financeiro
     * @param {number} year - Ano
     * @param {number} month - Mês
     * @returns {Object}
     */
    getResumo(year = null, month = null) {
        const now = new Date();
        year = year || now.getFullYear();
        month = month !== null ? month : now.getMonth();

        const transacoes = Storage.getTransacoesByMonth(year, month);
        
        const receitas = transacoes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
        const despesas = transacoes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);

        return {
            receitas,
            despesas,
            saldo: receitas - despesas,
            totalTransacoes: transacoes.length
        };
    }
};
