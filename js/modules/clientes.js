/**
 * MÓDULO CLIENTES - Agenda Pro Negócios
 * Gerenciamento completo de clientes
 */

const ClientesModule = {
    containerLista: null,
    inputBusca: null,
    btnNovo: null,

    /**
     * Inicializa o módulo de clientes
     */
    init() {
        this.containerLista = document.getElementById('tbody-clientes');
        this.inputBusca = document.getElementById('busca-cliente');
        this.btnNovo = document.getElementById('btn-novo-cliente');

        this.bindEvents();
        this.render();
    },

    /**
     * Vincula eventos do módulo
     */
    bindEvents() {
        // Novo cliente
        this.btnNovo?.addEventListener('click', () => this.openForm());

        // Busca com debounce
        this.inputBusca?.addEventListener('input', Helpers.debounce((e) => {
            this.render(e.target.value);
        }, 300));

        // Delegação de eventos na tabela
        this.containerLista?.addEventListener('click', (e) => {
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
                case 'whatsapp':
                    this.sendWhatsApp(id);
                    break;
                case 'ver':
                    this.view(id);
                    break;
            }
        });
    },

    /**
     * Renderiza lista de clientes
     * @param {string} searchTerm - Termo de busca
     */
    render(searchTerm = '') {
        if (!this.containerLista) return;

        let clientes = Storage.getClientes();

        // Filtrar por busca
        if (searchTerm) {
            clientes = Helpers.filterBySearch(clientes, searchTerm, ['nome', 'telefone', 'email']);
        }

        // Ordenar por nome
        clientes = Helpers.sortBy(clientes, 'nome', 'asc');

        if (clientes.length === 0) {
            this.containerLista.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center" style="padding: 40px;">
                        <div class="empty-state">
                            <span class="empty-state-icon">👥</span>
                            <p>${searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}</p>
                            ${!searchTerm ? '<button class="btn btn-primary" onclick="ClientesModule.openForm()">Cadastrar primeiro cliente</button>' : ''}
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        this.containerLista.innerHTML = clientes.map(cliente => {
            const ultimaVisita = this.getUltimaVisita(cliente.id);
            
            return `
                <tr>
                    <td>
                        <div class="client-info">
                            <span class="client-avatar" style="background: ${Helpers.randomColor()}20; color: ${Helpers.randomColor()};">
                                ${Helpers.getInitials(cliente.nome)}
                            </span>
                            <div>
                                <strong>${Helpers.escapeHtml(cliente.nome)}</strong>
                                ${cliente.observacoes ? `<br><small style="color: var(--color-gray-500);">${Helpers.truncate(cliente.observacoes, 30)}</small>` : ''}
                            </div>
                        </div>
                    </td>
                    <td>
                        <a href="tel:${Helpers.cleanPhone(cliente.telefone)}" style="color: var(--color-primary);">
                            ${Helpers.formatPhone(cliente.telefone)}
                        </a>
                    </td>
                    <td>${cliente.email ? Helpers.escapeHtml(cliente.email) : '<span style="color: var(--color-gray-400);">-</span>'}</td>
                    <td>${ultimaVisita || '<span style="color: var(--color-gray-400);">Nunca</span>'}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon" data-action="whatsapp" data-id="${cliente.id}" title="WhatsApp">
                                📱
                            </button>
                            <button class="btn-icon" data-action="editar" data-id="${cliente.id}" title="Editar">
                                ✏️
                            </button>
                            <button class="btn-icon" data-action="excluir" data-id="${cliente.id}" title="Excluir">
                                🗑️
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Adiciona estilo inline para avatar
        this.addStyles();
    },

    /**
     * Adiciona estilos dinâmicos
     */
    addStyles() {
        if (document.getElementById('clientes-styles')) return;

        const style = document.createElement('style');
        style.id = 'clientes-styles';
        style.textContent = `
            .client-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .client-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 14px;
                flex-shrink: 0;
            }
        `;
        document.head.appendChild(style);
    },

    /**
     * Obtém data da última visita do cliente
     * @param {string} clienteId - ID do cliente
     * @returns {string|null} Data formatada
     */
    getUltimaVisita(clienteId) {
        const agendamentos = Storage.getAgendamentos();
        const doCliente = agendamentos
            .filter(a => a.clienteId === clienteId && a.status === 'concluido')
            .sort((a, b) => new Date(b.data) - new Date(a.data));

        if (doCliente.length > 0) {
            return Helpers.formatDate(doCliente[0].data, 'short');
        }
        return null;
    },

    /**
     * Abre formulário de cliente (novo ou edição)
     * @param {Object} cliente - Cliente para edição
     */
    async openForm(cliente = null) {
        const resultado = await Modal.formCliente(cliente);
        
        if (resultado) {
            if (resultado.id) {
                // Edição
                const updated = Storage.updateCliente(resultado.id, resultado);
                if (updated) {
                    Toast.success('Cliente atualizado com sucesso!');
                } else {
                    Toast.error('Erro ao atualizar cliente');
                }
            } else {
                // Novo
                const created = Storage.addCliente(resultado);
                if (created) {
                    Toast.success('Cliente cadastrado com sucesso!');
                } else {
                    Toast.error('Erro ao cadastrar cliente');
                }
            }
            
            this.render();
            Dashboard.update(); // Atualiza dashboard se estiver visível
        }
    },

    /**
     * Edita um cliente
     * @param {string} id - ID do cliente
     */
    edit(id) {
        const cliente = Storage.getClienteById(id);
        if (cliente) {
            this.openForm(cliente);
        } else {
            Toast.error('Cliente não encontrado');
        }
    },

    /**
     * Exclui um cliente
     * @param {string} id - ID do cliente
     */
    async delete(id) {
        const cliente = Storage.getClienteById(id);
        if (!cliente) {
            Toast.error('Cliente não encontrado');
            return;
        }

        // Verifica agendamentos vinculados
        const agendamentos = Storage.getAgendamentos().filter(a => a.clienteId === id);
        
        let message = `Deseja realmente excluir o cliente "${cliente.nome}"?`;
        if (agendamentos.length > 0) {
            message += ` Este cliente possui ${agendamentos.length} agendamento(s) vinculado(s).`;
        }

        const confirmado = await Modal.confirm({
            title: 'Excluir Cliente',
            message,
            confirmText: 'Excluir',
            type: 'danger'
        });

        if (confirmado) {
            // Guarda para possível undo
            const backup = { ...cliente };
            
            if (Storage.deleteCliente(id)) {
                this.render();
                Dashboard.update();
                
                Toast.undo(`Cliente "${cliente.nome}" excluído`, () => {
                    Storage.addCliente(backup);
                    this.render();
                    Dashboard.update();
                });
            } else {
                Toast.error('Erro ao excluir cliente');
            }
        }
    },

    /**
     * Envia mensagem via WhatsApp
     * @param {string} id - ID do cliente
     */
    sendWhatsApp(id) {
        const cliente = Storage.getClienteById(id);
        if (!cliente) {
            Toast.error('Cliente não encontrado');
            return;
        }

        WhatsAppModule.sendMessage(cliente.telefone, '', cliente.nome);
    },

    /**
     * Visualiza detalhes do cliente
     * @param {string} id - ID do cliente
     */
    view(id) {
        const cliente = Storage.getClienteById(id);
        if (!cliente) {
            Toast.error('Cliente não encontrado');
            return;
        }

        const agendamentos = Storage.getAgendamentos().filter(a => a.clienteId === id);
        const total = agendamentos.length;
        const concluidos = agendamentos.filter(a => a.status === 'concluido').length;

        const content = `
            <div class="client-detail">
                <div class="detail-row">
                    <span class="detail-label">📞 Telefone:</span>
                    <span class="detail-value">${Helpers.formatPhone(cliente.telefone)}</span>
                </div>
                ${cliente.email ? `
                    <div class="detail-row">
                        <span class="detail-label">📧 Email:</span>
                        <span class="detail-value">${Helpers.escapeHtml(cliente.email)}</span>
                    </div>
                ` : ''}
                ${cliente.endereco ? `
                    <div class="detail-row">
                        <span class="detail-label">📍 Endereço:</span>
                        <span class="detail-value">${Helpers.escapeHtml(cliente.endereco)}</span>
                    </div>
                ` : ''}
                <div class="detail-row">
                    <span class="detail-label">📅 Cadastro:</span>
                    <span class="detail-value">${Helpers.formatDate(cliente.dataCadastro, 'long')}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📊 Atendimentos:</span>
                    <span class="detail-value">${concluidos} de ${total} agendamentos</span>
                </div>
                ${cliente.observacoes ? `
                    <div class="detail-row">
                        <span class="detail-label">📝 Observações:</span>
                        <span class="detail-value">${Helpers.escapeHtml(cliente.observacoes)}</span>
                    </div>
                ` : ''}
            </div>
            <style>
                .client-detail { display: flex; flex-direction: column; gap: 12px; }
                .detail-row { display: flex; gap: 8px; }
                .detail-label { font-weight: 600; color: var(--color-gray-600); min-width: 120px; }
                .detail-value { color: var(--color-gray-800); }
            </style>
        `;

        Modal.open({
            title: cliente.nome,
            content,
            size: 'sm'
        });
    },

    /**
     * Retorna total de clientes
     * @returns {number}
     */
    getTotal() {
        return Storage.getClientes().length;
    },

    /**
     * Retorna clientes recentes
     * @param {number} limit - Limite de resultados
     * @returns {Array}
     */
    getRecentes(limit = 5) {
        const clientes = Storage.getClientes();
        return Helpers.sortBy(clientes, 'dataCadastro', 'desc').slice(0, limit);
    }
};
