/**
 * MÓDULO AGENDA - Agenda Pro Negócios
 * Gerenciamento de agendamentos e calendário
 */

const AgendaModule = {
    calendarDays: null,
    mesAtual: null,
    btnMesAnterior: null,
    btnMesProximo: null,
    btnHoje: null,
    btnNovoAgendamento: null,
    agendaDiaTitulo: null,
    agendaDiaLista: null,
    
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    selectedDate: null,

    /**
     * Inicializa o módulo de agenda
     */
    init() {
        this.calendarDays = document.getElementById('calendar-days');
        this.mesAtual = document.getElementById('mes-atual');
        this.btnMesAnterior = document.getElementById('btn-mes-anterior');
        this.btnMesProximo = document.getElementById('btn-mes-proximo');
        this.btnHoje = document.getElementById('btn-hoje');
        this.btnNovoAgendamento = document.getElementById('btn-novo-agendamento');
        this.agendaDiaTitulo = document.getElementById('agenda-dia-titulo');
        this.agendaDiaLista = document.getElementById('agenda-dia-lista');

        this.selectedDate = Helpers.formatDate(new Date(), 'iso');
        
        this.bindEvents();
        this.render();
    },

    /**
     * Vincula eventos do módulo
     */
    bindEvents() {
        // Navegação do calendário
        this.btnMesAnterior?.addEventListener('click', () => this.changeMonth(-1));
        this.btnMesProximo?.addEventListener('click', () => this.changeMonth(1));
        this.btnHoje?.addEventListener('click', () => this.goToToday());

        // Novo agendamento
        this.btnNovoAgendamento?.addEventListener('click', () => this.openForm());

        // Click nos dias do calendário
        this.calendarDays?.addEventListener('click', (e) => {
            const dayEl = e.target.closest('.calendar-day');
            if (dayEl && !dayEl.classList.contains('other-month')) {
                const date = dayEl.dataset.date;
                this.selectDate(date);
            }
        });

        // Ações na lista de agendamentos
        this.agendaDiaLista?.addEventListener('click', (e) => {
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
                case 'concluir':
                    this.changeStatus(id, 'concluido');
                    break;
                case 'cancelar':
                    this.changeStatus(id, 'cancelado');
                    break;
                case 'whatsapp':
                    this.sendLembrete(id);
                    break;
            }
        });
    },

    /**
     * Renderiza o calendário
     */
    render() {
        this.renderCalendar();
        this.renderDayList();
    },

    /**
     * Renderiza o grid do calendário
     */
    renderCalendar() {
        if (!this.calendarDays) return;

        // Atualiza título do mês
        if (this.mesAtual) {
            this.mesAtual.textContent = `${Helpers.getMonthName(this.currentMonth)} ${this.currentYear}`;
        }

        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();

        // Dias do mês anterior
        const prevMonth = new Date(this.currentYear, this.currentMonth, 0);
        const prevMonthDays = prevMonth.getDate();

        // Agendamentos do mês
        const agendamentos = Storage.getAgendamentos();
        const agendamentosPorDia = {};
        
        agendamentos.forEach(a => {
            if (!agendamentosPorDia[a.data]) {
                agendamentosPorDia[a.data] = [];
            }
            agendamentosPorDia[a.data].push(a);
        });

        let html = '';
        const today = Helpers.formatDate(new Date(), 'iso');

        // Dias do mês anterior
        for (let i = startingDay - 1; i >= 0; i--) {
            const day = prevMonthDays - i;
            html += `<div class="calendar-day other-month"><span class="day-number">${day}</span></div>`;
        }

        // Dias do mês atual
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === today;
            const isSelected = dateStr === this.selectedDate;
            const hasEvents = agendamentosPorDia[dateStr] && agendamentosPorDia[dateStr].length > 0;

            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (isSelected) classes += ' selected';
            if (hasEvents) classes += ' has-events';

            html += `
                <div class="${classes}" data-date="${dateStr}">
                    <span class="day-number">${day}</span>
                </div>
            `;
        }

        // Dias do próximo mês
        const remainingDays = 42 - (startingDay + totalDays);
        for (let day = 1; day <= remainingDays; day++) {
            html += `<div class="calendar-day other-month"><span class="day-number">${day}</span></div>`;
        }

        this.calendarDays.innerHTML = html;
    },

    /**
     * Renderiza lista de agendamentos do dia selecionado
     */
    renderDayList() {
        if (!this.agendaDiaLista || !this.selectedDate) return;

        const date = new Date(this.selectedDate + 'T00:00:00');
        const dayName = Helpers.getDayName(date.getDay());
        const formattedDate = Helpers.formatDate(this.selectedDate, 'long');

        if (this.agendaDiaTitulo) {
            this.agendaDiaTitulo.textContent = `${dayName}, ${formattedDate}`;
        }

        const agendamentos = Storage.getAgendamentosByDate(this.selectedDate);
        
        // Ordenar por hora
        agendamentos.sort((a, b) => a.hora.localeCompare(b.hora));

        if (agendamentos.length === 0) {
            this.agendaDiaLista.innerHTML = `
                <div class="empty-state" style="padding: 20px;">
                    <p>Nenhum agendamento para este dia</p>
                    <button class="btn btn-primary btn-sm" onclick="AgendaModule.openForm()">+ Agendar</button>
                </div>
            `;
            return;
        }

        this.agendaDiaLista.innerHTML = agendamentos.map(agend => {
            const cliente = Storage.getClienteById(agend.clienteId);
            const servico = Storage.getServicoById(agend.servicoId);

            const statusBadges = {
                pendente: '<span class="badge badge-warning">Pendente</span>',
                confirmado: '<span class="badge badge-info">Confirmado</span>',
                concluido: '<span class="badge badge-success">Concluído</span>',
                cancelado: '<span class="badge badge-danger">Cancelado</span>'
            };

            return `
                <div class="agenda-item ${agend.prioridade}">
                    <span class="agenda-item-time">${agend.hora}</span>
                    <div class="agenda-item-info">
                        <span class="agenda-item-title">
                            ${servico ? Helpers.escapeHtml(servico.nome) : 'Serviço removido'}
                        </span>
                        <span class="agenda-item-client">
                            👤 ${cliente ? Helpers.escapeHtml(cliente.nome) : 'Cliente removido'}
                        </span>
                        ${statusBadges[agend.status] || ''}
                    </div>
                    <div class="agenda-item-actions">
                        ${agend.status === 'pendente' || agend.status === 'confirmado' ? `
                            <button class="btn-icon" data-action="whatsapp" data-id="${agend.id}" title="Enviar lembrete">📱</button>
                            <button class="btn-icon" data-action="concluir" data-id="${agend.id}" title="Marcar concluído">✅</button>
                        ` : ''}
                        <button class="btn-icon" data-action="editar" data-id="${agend.id}" title="Editar">✏️</button>
                        <button class="btn-icon" data-action="excluir" data-id="${agend.id}" title="Excluir">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');

        // Adiciona estilos
        this.addStyles();
    },

    /**
     * Adiciona estilos dinâmicos
     */
    addStyles() {
        if (document.getElementById('agenda-styles')) return;

        const style = document.createElement('style');
        style.id = 'agenda-styles';
        style.textContent = `
            .agenda-item-actions {
                display: flex;
                gap: 4px;
                opacity: 0;
                transition: opacity 0.2s;
            }
            .agenda-item:hover .agenda-item-actions {
                opacity: 1;
            }
            .agenda-item-actions .btn-icon {
                width: 28px;
                height: 28px;
                font-size: 14px;
            }
        `;
        document.head.appendChild(style);
    },

    /**
     * Muda o mês visualizado
     * @param {number} delta - Direção (-1 ou 1)
     */
    changeMonth(delta) {
        this.currentMonth += delta;
        
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }

        this.renderCalendar();
    },

    /**
     * Vai para o dia atual
     */
    goToToday() {
        const today = new Date();
        this.currentMonth = today.getMonth();
        this.currentYear = today.getFullYear();
        this.selectedDate = Helpers.formatDate(today, 'iso');
        this.render();
    },

    /**
     * Seleciona uma data
     * @param {string} date - Data no formato YYYY-MM-DD
     */
    selectDate(date) {
        this.selectedDate = date;
        this.render();
    },

    /**
     * Abre formulário de agendamento
     * @param {Object} agendamento - Agendamento para edição
     */
    async openForm(agendamento = null) {
        const resultado = await Modal.formAgendamento(agendamento, this.selectedDate);
        
        if (resultado) {
            if (resultado.id) {
                // Edição
                const updated = Storage.updateAgendamento(resultado.id, resultado);
                if (updated) {
                    Toast.success('Agendamento atualizado!');
                } else {
                    Toast.error('Erro ao atualizar agendamento');
                }
            } else {
                // Novo
                const created = Storage.addAgendamento(resultado);
                if (created) {
                    Toast.success('Agendamento criado!');
                    
                    // Cria lembrete automático
                    this.createLembrete(created);
                } else {
                    Toast.error('Erro ao criar agendamento');
                }
            }
            
            this.render();
            Dashboard.update();
        }
    },

    /**
     * Edita um agendamento
     * @param {string} id - ID do agendamento
     */
    edit(id) {
        const agendamentos = Storage.getAgendamentos();
        const agendamento = agendamentos.find(a => a.id === id);
        
        if (agendamento) {
            this.openForm(agendamento);
        } else {
            Toast.error('Agendamento não encontrado');
        }
    },

    /**
     * Exclui um agendamento
     * @param {string} id - ID do agendamento
     */
    async delete(id) {
        const confirmado = await Modal.confirm({
            title: 'Excluir Agendamento',
            message: 'Deseja realmente excluir este agendamento?',
            confirmText: 'Excluir',
            type: 'danger'
        });

        if (confirmado) {
            if (Storage.deleteAgendamento(id)) {
                Toast.success('Agendamento excluído!');
                this.render();
                Dashboard.update();
            } else {
                Toast.error('Erro ao excluir agendamento');
            }
        }
    },

    /**
     * Altera status do agendamento
     * @param {string} id - ID do agendamento
     * @param {string} novoStatus - Novo status
     */
    changeStatus(id, novoStatus) {
        const updated = Storage.updateAgendamento(id, { status: novoStatus });
        
        if (updated) {
            const mensagens = {
                concluido: 'Agendamento marcado como concluído!',
                cancelado: 'Agendamento cancelado!',
                confirmado: 'Agendamento confirmado!'
            };
            
            Toast.success(mensagens[novoStatus] || 'Status atualizado!');

            // Se concluído, cria transação financeira
            if (novoStatus === 'concluido') {
                this.createTransacao(updated);
            }

            this.render();
            Dashboard.update();
        } else {
            Toast.error('Erro ao atualizar status');
        }
    },

    /**
     * Cria transação financeira ao concluir agendamento
     * @param {Object} agendamento - Agendamento concluído
     */
    createTransacao(agendamento) {
        const servico = Storage.getServicoById(agendamento.servicoId);
        const cliente = Storage.getClienteById(agendamento.clienteId);
        
        if (servico) {
            Storage.addTransacao({
                tipo: 'receita',
                descricao: `${servico.nome} - ${cliente?.nome || 'Cliente'}`,
                valor: servico.preco,
                data: agendamento.data,
                categoria: 'servico'
            });
        }
    },

    /**
     * Cria lembrete automático para agendamento
     * @param {Object} agendamento - Agendamento criado
     */
    createLembrete(agendamento) {
        const cliente = Storage.getClienteById(agendamento.clienteId);
        const servico = Storage.getServicoById(agendamento.servicoId);
        
        if (cliente && servico) {
            Storage.addLembrete({
                tipo: 'agendamento',
                titulo: `Lembrar: ${cliente.nome}`,
                mensagem: `${servico.nome} em ${Helpers.formatDate(agendamento.data, 'short')} às ${agendamento.hora}`,
                data: agendamento.data,
                agendamentoId: agendamento.id
            });
        }
    },

    /**
     * Envia lembrete via WhatsApp
     * @param {string} id - ID do agendamento
     */
    sendLembrete(id) {
        const agendamentos = Storage.getAgendamentos();
        const agendamento = agendamentos.find(a => a.id === id);
        
        if (!agendamento) {
            Toast.error('Agendamento não encontrado');
            return;
        }

        const cliente = Storage.getClienteById(agendamento.clienteId);
        const servico = Storage.getServicoById(agendamento.servicoId);
        
        if (!cliente) {
            Toast.error('Cliente não encontrado');
            return;
        }

        // Prepara mensagem
        const config = Storage.getConfig();
        let mensagem = config.msgLembrete || 'Olá {nome}, lembrando do seu agendamento em {data} às {hora}.';
        
        mensagem = mensagem
            .replace('{nome}', cliente.nome)
            .replace('{data}', Helpers.formatDate(agendamento.data, 'short'))
            .replace('{hora}', agendamento.hora)
            .replace('{servico}', servico?.nome || 'serviço');

        WhatsAppModule.sendMessage(cliente.telefone, mensagem, cliente.nome);
    },

    /**
     * Retorna agendamentos de hoje
     * @returns {Array}
     */
    getAgendamentosHoje() {
        return Storage.getAgendamentosHoje();
    },

    /**
     * Retorna total de pendentes
     * @returns {number}
     */
    getTotalPendentes() {
        const agendamentos = Storage.getAgendamentos();
        return agendamentos.filter(a => 
            a.status === 'pendente' || a.status === 'confirmado'
        ).length;
    }
};
