/**
 * MÓDULO SERVIÇOS - Agenda Pro Negócios
 * Gerenciamento de serviços oferecidos
 */

const ServicosModule = {
    gridServicos: null,
    inputBusca: null,
    btnNovo: null,

    /**
     * Inicializa o módulo de serviços
     */
    init() {
        this.gridServicos = document.getElementById('grid-servicos');
        this.inputBusca = document.getElementById('busca-servico');
        this.btnNovo = document.getElementById('btn-novo-servico');

        this.bindEvents();
        this.render();
    },

    /**
     * Vincula eventos do módulo
     */
    bindEvents() {
        // Novo serviço
        this.btnNovo?.addEventListener('click', () => this.openForm());

        // Busca
        this.inputBusca?.addEventListener('input', Helpers.debounce((e) => {
            this.render(e.target.value);
        }, 300));

        // Delegação de eventos no grid
        this.gridServicos?.addEventListener('click', (e) => {
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
                case 'agendar':
                    this.scheduleService(id);
                    break;
            }
        });
    },

    /**
     * Renderiza grid de serviços
     * @param {string} searchTerm - Termo de busca
     */
    render(searchTerm = '') {
        if (!this.gridServicos) return;

        let servicos = Storage.getServicos();

        // Filtrar por busca
        if (searchTerm) {
            servicos = Helpers.filterBySearch(servicos, searchTerm, ['nome', 'descricao']);
        }

        // Ordenar por nome
        servicos = Helpers.sortBy(servicos, 'nome', 'asc');

        if (servicos.length === 0) {
            this.gridServicos.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; padding: 60px;">
                    <span class="empty-state-icon">🔧</span>
                    <p>${searchTerm ? 'Nenhum serviço encontrado' : 'Nenhum serviço cadastrado'}</p>
                    ${!searchTerm ? '<button class="btn btn-primary" onclick="ServicosModule.openForm()">Cadastrar primeiro serviço</button>' : ''}
                </div>
            `;
            return;
        }

        this.gridServicos.innerHTML = servicos.map(servico => {
            const totalAgendamentos = this.getTotalAgendamentos(servico.id);

            return `
                <div class="service-card">
                    <div class="service-card-header">
                        <div class="service-icon">${servico.icone || '🔧'}</div>
                        <div>
                            <h4 class="service-name">${Helpers.escapeHtml(servico.nome)}</h4>
                            <span style="font-size: 12px; color: var(--color-gray-500);">${totalAgendamentos} agendamento(s)</span>
                        </div>
                    </div>
                    <div class="service-price">${Helpers.formatCurrency(servico.preco)}</div>
                    <div class="service-duration">⏱️ ${servico.duracao || 30} minutos</div>
                    ${servico.descricao ? `<p style="font-size: 14px; color: var(--color-gray-600); margin-bottom: 16px;">${Helpers.escapeHtml(servico.descricao)}</p>` : ''}
                    <div class="service-actions">
                        <button class="btn btn-secondary btn-sm" data-action="agendar" data-id="${servico.id}">
                            📅 Agendar
                        </button>
                        <button class="btn-icon" data-action="editar" data-id="${servico.id}" title="Editar">
                            ✏️
                        </button>
                        <button class="btn-icon" data-action="excluir" data-id="${servico.id}" title="Excluir">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Obtém total de agendamentos de um serviço
     * @param {string} servicoId - ID do serviço
     * @returns {number}
     */
    getTotalAgendamentos(servicoId) {
        const agendamentos = Storage.getAgendamentos();
        return agendamentos.filter(a => a.servicoId === servicoId).length;
    },

    /**
     * Abre formulário de serviço
     * @param {Object} servico - Serviço para edição
     */
    async openForm(servico = null) {
        const resultado = await Modal.formServico(servico);
        
        if (resultado) {
            if (resultado.id) {
                // Edição
                const updated = Storage.updateServico(resultado.id, resultado);
                if (updated) {
                    Toast.success('Serviço atualizado!');
                } else {
                    Toast.error('Erro ao atualizar serviço');
                }
            } else {
                // Novo
                const created = Storage.addServico(resultado);
                if (created) {
                    Toast.success('Serviço cadastrado!');
                } else {
                    Toast.error('Erro ao cadastrar serviço');
                }
            }
            
            this.render();
            Dashboard.update();
        }
    },

    /**
     * Edita um serviço
     * @param {string} id - ID do serviço
     */
    edit(id) {
        const servico = Storage.getServicoById(id);
        if (servico) {
            this.openForm(servico);
        } else {
            Toast.error('Serviço não encontrado');
        }
    },

    /**
     * Exclui um serviço
     * @param {string} id - ID do serviço
     */
    async delete(id) {
        const servico = Storage.getServicoById(id);
        if (!servico) {
            Toast.error('Serviço não encontrado');
            return;
        }

        // Verifica agendamentos vinculados
        const agendamentos = Storage.getAgendamentos().filter(a => a.servicoId === id);
        
        let message = `Deseja realmente excluir o serviço "${servico.nome}"?`;
        if (agendamentos.length > 0) {
            message += ` Este serviço possui ${agendamentos.length} agendamento(s) vinculado(s).`;
        }

        const confirmado = await Modal.confirm({
            title: 'Excluir Serviço',
            message,
            confirmText: 'Excluir',
            type: 'danger'
        });

        if (confirmado) {
            if (Storage.deleteServico(id)) {
                Toast.success('Serviço excluído!');
                this.render();
            } else {
                Toast.error('Erro ao excluir serviço');
            }
        }
    },

    /**
     * Abre agendamento com serviço pré-selecionado
     * @param {string} id - ID do serviço
     */
    scheduleService(id) {
        // Navega para agenda e abre modal
        App.navigateTo('agenda');
        setTimeout(() => {
            AgendaModule.openForm({ servicoId: id });
        }, 300);
    },

    /**
     * Retorna serviços mais populares
     * @param {number} limit - Limite de resultados
     * @returns {Array}
     */
    getTopServicos(limit = 5) {
        const servicos = Storage.getServicos();
        const agendamentos = Storage.getAgendamentos().filter(a => a.status === 'concluido');
        
        // Conta agendamentos por serviço
        const contagem = {};
        agendamentos.forEach(a => {
            contagem[a.servicoId] = (contagem[a.servicoId] || 0) + 1;
        });

        // Ordena serviços por quantidade
        return servicos
            .map(s => ({ ...s, total: contagem[s.id] || 0 }))
            .sort((a, b) => b.total - a.total)
            .slice(0, limit);
    }
};
