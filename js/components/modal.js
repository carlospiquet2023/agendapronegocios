/**
 * MODAL - Agenda Pro Negócios
 * Sistema de modais reutilizável
 */

const Modal = {
    overlay: null,
    container: null,
    titleEl: null,
    bodyEl: null,
    closeBtn: null,
    isOpen: false,
    onCloseCallback: null,

    /**
     * Inicializa o sistema de modal
     */
    init() {
        this.overlay = document.getElementById('modal-overlay');
        this.container = document.getElementById('modal-container');
        this.titleEl = document.getElementById('modal-title');
        this.bodyEl = document.getElementById('modal-body');
        this.closeBtn = document.getElementById('btn-fechar-modal');

        if (!this.overlay || !this.container) {
            console.error('Elementos do modal não encontrados');
            return;
        }

        // Event listeners
        this.closeBtn?.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    },

    /**
     * Abre o modal
     * @param {Object} options - Opções do modal
     * @param {string} options.title - Título do modal
     * @param {string|HTMLElement} options.content - Conteúdo do modal
     * @param {string} options.size - Tamanho (sm, md, lg)
     * @param {Function} options.onClose - Callback ao fechar
     */
    open(options = {}) {
        const { title = '', content = '', size = 'md', onClose = null } = options;

        // Define título
        if (this.titleEl) {
            this.titleEl.textContent = title;
        }

        // Define conteúdo
        if (this.bodyEl) {
            if (typeof content === 'string') {
                this.bodyEl.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                this.bodyEl.innerHTML = '';
                this.bodyEl.appendChild(content);
            }
        }

        // Define tamanho
        this.container.style.maxWidth = {
            sm: '400px',
            md: '500px',
            lg: '700px',
            xl: '900px'
        }[size] || '500px';

        // Callback
        this.onCloseCallback = onClose;

        // Abre modal
        this.overlay.classList.remove('hidden');
        this.isOpen = true;

        // Previne scroll do body
        document.body.style.overflow = 'hidden';

        // Foca no primeiro input se houver
        setTimeout(() => {
            const firstInput = this.bodyEl.querySelector('input, select, textarea');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    },

    /**
     * Fecha o modal
     */
    close() {
        if (!this.isOpen) return;

        this.overlay.classList.add('hidden');
        this.isOpen = false;

        // Restaura scroll
        document.body.style.overflow = '';

        // Limpa conteúdo
        setTimeout(() => {
            if (this.bodyEl) {
                this.bodyEl.innerHTML = '';
            }
        }, 300);

        // Executa callback
        if (typeof this.onCloseCallback === 'function') {
            this.onCloseCallback();
        }
    },

    /**
     * Abre modal de confirmação
     * @param {Object} options - Opções
     * @param {string} options.title - Título
     * @param {string} options.message - Mensagem
     * @param {string} options.confirmText - Texto do botão confirmar
     * @param {string} options.cancelText - Texto do botão cancelar
     * @param {string} options.type - Tipo (danger, warning, info)
     * @returns {Promise<boolean>} Resultado da confirmação
     */
    confirm(options = {}) {
        return new Promise((resolve) => {
            const {
                title = 'Confirmar',
                message = 'Tem certeza?',
                confirmText = 'Confirmar',
                cancelText = 'Cancelar',
                type = 'danger'
            } = options;

            const content = `
                <div class="modal-confirm">
                    <p style="margin-bottom: var(--spacing-lg); color: var(--color-gray-600);">
                        ${Helpers.escapeHtml(message)}
                    </p>
                    <div class="modal-footer" style="padding: 0; border: none; background: none;">
                        <button type="button" class="btn btn-secondary" id="modal-cancel">
                            ${Helpers.escapeHtml(cancelText)}
                        </button>
                        <button type="button" class="btn btn-${type}" id="modal-confirm">
                            ${Helpers.escapeHtml(confirmText)}
                        </button>
                    </div>
                </div>
            `;

            this.open({
                title,
                content,
                size: 'sm',
                onClose: () => resolve(false)
            });

            // Event listeners dos botões
            document.getElementById('modal-cancel')?.addEventListener('click', () => {
                this.close();
                resolve(false);
            });

            document.getElementById('modal-confirm')?.addEventListener('click', () => {
                this.onCloseCallback = null; // Evita chamar o callback de fechar
                this.close();
                resolve(true);
            });
        });
    },

    /**
     * Abre modal de alerta
     * @param {Object} options - Opções
     * @param {string} options.title - Título
     * @param {string} options.message - Mensagem
     * @param {string} options.buttonText - Texto do botão
     * @returns {Promise<void>}
     */
    alert(options = {}) {
        return new Promise((resolve) => {
            const {
                title = 'Aviso',
                message = '',
                buttonText = 'OK'
            } = options;

            const content = `
                <div class="modal-alert">
                    <p style="margin-bottom: var(--spacing-lg); color: var(--color-gray-600);">
                        ${Helpers.escapeHtml(message)}
                    </p>
                    <div class="modal-footer" style="padding: 0; border: none; background: none; justify-content: center;">
                        <button type="button" class="btn btn-primary" id="modal-ok">
                            ${Helpers.escapeHtml(buttonText)}
                        </button>
                    </div>
                </div>
            `;

            this.open({
                title,
                content,
                size: 'sm',
                onClose: () => resolve()
            });

            document.getElementById('modal-ok')?.addEventListener('click', () => {
                this.close();
                resolve();
            });
        });
    },

    /**
     * Abre modal com formulário de cliente
     * @param {Object} cliente - Dados do cliente (para edição)
     * @returns {Promise<Object|null>} Dados do cliente ou null se cancelado
     */
    formCliente(cliente = null) {
        return new Promise((resolve) => {
            const isEdit = cliente !== null;
            const title = isEdit ? 'Editar Cliente' : 'Novo Cliente';

            const content = `
                <form id="form-modal-cliente" class="form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="cliente-nome">Nome *</label>
                            <input type="text" id="cliente-nome" class="input" value="${Helpers.escapeHtml(cliente?.nome || '')}" required>
                        </div>
                        <div class="form-group">
                            <label for="cliente-telefone">Telefone *</label>
                            <input type="tel" id="cliente-telefone" class="input" value="${Helpers.escapeHtml(cliente?.telefone || '')}" placeholder="(00) 00000-0000" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="cliente-email">Email</label>
                        <input type="email" id="cliente-email" class="input" value="${Helpers.escapeHtml(cliente?.email || '')}" placeholder="email@exemplo.com">
                    </div>
                    <div class="form-group">
                        <label for="cliente-endereco">Endereço</label>
                        <input type="text" id="cliente-endereco" class="input" value="${Helpers.escapeHtml(cliente?.endereco || '')}">
                    </div>
                    <div class="form-group">
                        <label for="cliente-observacoes">Observações</label>
                        <textarea id="cliente-observacoes" class="input textarea" rows="2">${Helpers.escapeHtml(cliente?.observacoes || '')}</textarea>
                    </div>
                    <div class="modal-footer" style="margin-top: var(--spacing-lg); padding: var(--spacing-md) 0 0; border-top: 1px solid var(--color-gray-100);">
                        <button type="button" class="btn btn-secondary" id="btn-cancelar-cliente">Cancelar</button>
                        <button type="submit" class="btn btn-primary">${isEdit ? 'Salvar' : 'Cadastrar'}</button>
                    </div>
                </form>
            `;

            this.open({
                title,
                content,
                size: 'md',
                onClose: () => resolve(null)
            });

            const form = document.getElementById('form-modal-cliente');
            
            // Máscara de telefone
            const telefoneInput = document.getElementById('cliente-telefone');
            telefoneInput?.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) value = value.slice(0, 11);
                if (value.length > 6) {
                    value = `(${value.slice(0,2)}) ${value.slice(2,7)}-${value.slice(7)}`;
                } else if (value.length > 2) {
                    value = `(${value.slice(0,2)}) ${value.slice(2)}`;
                } else if (value.length > 0) {
                    value = `(${value}`;
                }
                e.target.value = value;
            });

            // Cancelar
            document.getElementById('btn-cancelar-cliente')?.addEventListener('click', () => {
                this.close();
                resolve(null);
            });

            // Submit
            form?.addEventListener('submit', (e) => {
                e.preventDefault();

                const dados = {
                    nome: document.getElementById('cliente-nome').value.trim(),
                    telefone: document.getElementById('cliente-telefone').value.trim(),
                    email: document.getElementById('cliente-email').value.trim(),
                    endereco: document.getElementById('cliente-endereco').value.trim(),
                    observacoes: document.getElementById('cliente-observacoes').value.trim()
                };

                // Validação
                const validation = Validators.validateForm(dados, {
                    nome: ['required', { minLength: 2 }],
                    telefone: ['required', 'phone'],
                    email: ['email']
                });

                if (!validation.valid) {
                    Object.keys(validation.errors).forEach(field => {
                        const input = document.getElementById(`cliente-${field}`);
                        if (input) {
                            Validators.applyFieldValidation(input, { valid: false, message: validation.errors[field] });
                        }
                    });
                    return;
                }

                if (isEdit) {
                    dados.id = cliente.id;
                }

                this.onCloseCallback = null;
                this.close();
                resolve(dados);
            });
        });
    },

    /**
     * Abre modal com formulário de agendamento
     * @param {Object} agendamento - Dados do agendamento (para edição)
     * @param {string} dataSelecionada - Data pré-selecionada
     * @returns {Promise<Object|null>} Dados do agendamento ou null se cancelado
     */
    formAgendamento(agendamento = null, dataSelecionada = null) {
        return new Promise((resolve) => {
            const isEdit = agendamento !== null;
            const title = isEdit ? 'Editar Agendamento' : 'Novo Agendamento';
            
            const clientes = Storage.getClientes();
            const servicos = Storage.getServicos();
            
            const dataDefault = dataSelecionada || agendamento?.data || Helpers.formatDate(new Date(), 'iso');

            const clientesOptions = clientes.map(c => 
                `<option value="${c.id}" ${agendamento?.clienteId === c.id ? 'selected' : ''}>${Helpers.escapeHtml(c.nome)}</option>`
            ).join('');

            const servicosOptions = servicos.map(s => 
                `<option value="${s.id}" ${agendamento?.servicoId === s.id ? 'selected' : ''}>${Helpers.escapeHtml(s.nome)} - ${Helpers.formatCurrency(s.preco)}</option>`
            ).join('');

            const content = `
                <form id="form-modal-agendamento" class="form">
                    <div class="form-group">
                        <label for="agend-cliente">Cliente *</label>
                        <select id="agend-cliente" class="input-select" required>
                            <option value="">Selecione um cliente</option>
                            ${clientesOptions}
                        </select>
                        ${clientes.length === 0 ? '<span class="form-error">Cadastre um cliente primeiro</span>' : ''}
                    </div>
                    <div class="form-group">
                        <label for="agend-servico">Serviço *</label>
                        <select id="agend-servico" class="input-select" required>
                            <option value="">Selecione um serviço</option>
                            ${servicosOptions}
                        </select>
                        ${servicos.length === 0 ? '<span class="form-error">Cadastre um serviço primeiro</span>' : ''}
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="agend-data">Data *</label>
                            <input type="date" id="agend-data" class="input" value="${dataDefault}" required>
                        </div>
                        <div class="form-group">
                            <label for="agend-hora">Hora *</label>
                            <input type="time" id="agend-hora" class="input" value="${agendamento?.hora || '09:00'}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="agend-prioridade">Prioridade</label>
                            <select id="agend-prioridade" class="input-select">
                                <option value="baixa" ${agendamento?.prioridade === 'baixa' ? 'selected' : ''}>🟢 Baixa</option>
                                <option value="media" ${agendamento?.prioridade === 'media' || !agendamento ? 'selected' : ''}>🟡 Média</option>
                                <option value="alta" ${agendamento?.prioridade === 'alta' ? 'selected' : ''}>🔴 Alta</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="agend-status">Status</label>
                            <select id="agend-status" class="input-select">
                                <option value="pendente" ${agendamento?.status === 'pendente' || !agendamento ? 'selected' : ''}>Pendente</option>
                                <option value="confirmado" ${agendamento?.status === 'confirmado' ? 'selected' : ''}>Confirmado</option>
                                <option value="concluido" ${agendamento?.status === 'concluido' ? 'selected' : ''}>Concluído</option>
                                <option value="cancelado" ${agendamento?.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="agend-observacoes">Observações</label>
                        <textarea id="agend-observacoes" class="input textarea" rows="2">${Helpers.escapeHtml(agendamento?.observacoes || '')}</textarea>
                    </div>
                    <div class="modal-footer" style="margin-top: var(--spacing-lg); padding: var(--spacing-md) 0 0; border-top: 1px solid var(--color-gray-100);">
                        <button type="button" class="btn btn-secondary" id="btn-cancelar-agendamento">Cancelar</button>
                        <button type="submit" class="btn btn-primary" ${clientes.length === 0 || servicos.length === 0 ? 'disabled' : ''}>${isEdit ? 'Salvar' : 'Agendar'}</button>
                    </div>
                </form>
            `;

            this.open({
                title,
                content,
                size: 'md',
                onClose: () => resolve(null)
            });

            // Cancelar
            document.getElementById('btn-cancelar-agendamento')?.addEventListener('click', () => {
                this.close();
                resolve(null);
            });

            // Submit
            const form = document.getElementById('form-modal-agendamento');
            form?.addEventListener('submit', (e) => {
                e.preventDefault();

                const dados = {
                    clienteId: document.getElementById('agend-cliente').value,
                    servicoId: document.getElementById('agend-servico').value,
                    data: document.getElementById('agend-data').value,
                    hora: document.getElementById('agend-hora').value,
                    prioridade: document.getElementById('agend-prioridade').value,
                    status: document.getElementById('agend-status').value,
                    observacoes: document.getElementById('agend-observacoes').value.trim()
                };

                // Validação
                if (!dados.clienteId || !dados.servicoId || !dados.data || !dados.hora) {
                    Toast.show('Preencha todos os campos obrigatórios', 'error');
                    return;
                }

                if (isEdit) {
                    dados.id = agendamento.id;
                }

                this.onCloseCallback = null;
                this.close();
                resolve(dados);
            });
        });
    },

    /**
     * Abre modal com formulário de serviço
     * @param {Object} servico - Dados do serviço (para edição)
     * @returns {Promise<Object|null>} Dados do serviço ou null se cancelado
     */
    formServico(servico = null) {
        return new Promise((resolve) => {
            const isEdit = servico !== null;
            const title = isEdit ? 'Editar Serviço' : 'Novo Serviço';

            const content = `
                <form id="form-modal-servico" class="form">
                    <div class="form-group">
                        <label for="servico-nome">Nome do Serviço *</label>
                        <input type="text" id="servico-nome" class="input" value="${Helpers.escapeHtml(servico?.nome || '')}" placeholder="Ex: Corte de cabelo" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="servico-preco">Preço (R$) *</label>
                            <input type="number" id="servico-preco" class="input" value="${servico?.preco || ''}" step="0.01" min="0" placeholder="0,00" required>
                        </div>
                        <div class="form-group">
                            <label for="servico-duracao">Duração (min)</label>
                            <input type="number" id="servico-duracao" class="input" value="${servico?.duracao || '30'}" min="5" step="5">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="servico-descricao">Descrição</label>
                        <textarea id="servico-descricao" class="input textarea" rows="2">${Helpers.escapeHtml(servico?.descricao || '')}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Ícone</label>
                        <div class="icon-selector" id="icon-selector">
                            ${['🔧', '✂️', '💇', '💅', '🚗', '🔩', '⚙️', '🛠️', '📱', '💻', '🎨', '📦'].map(icon => 
                                `<button type="button" class="icon-option ${servico?.icone === icon ? 'selected' : ''}" data-icon="${icon}">${icon}</button>`
                            ).join('')}
                        </div>
                        <input type="hidden" id="servico-icone" value="${servico?.icone || '🔧'}">
                    </div>
                    <div class="modal-footer" style="margin-top: var(--spacing-lg); padding: var(--spacing-md) 0 0; border-top: 1px solid var(--color-gray-100);">
                        <button type="button" class="btn btn-secondary" id="btn-cancelar-servico">Cancelar</button>
                        <button type="submit" class="btn btn-primary">${isEdit ? 'Salvar' : 'Cadastrar'}</button>
                    </div>
                </form>
                <style>
                    .icon-selector { display: flex; flex-wrap: wrap; gap: 8px; }
                    .icon-option { width: 40px; height: 40px; font-size: 20px; border: 2px solid var(--color-gray-200); border-radius: 8px; cursor: pointer; transition: all 0.2s; }
                    .icon-option:hover { border-color: var(--color-primary); }
                    .icon-option.selected { border-color: var(--color-primary); background: var(--color-primary-bg); }
                </style>
            `;

            this.open({
                title,
                content,
                size: 'md',
                onClose: () => resolve(null)
            });

            // Seletor de ícone
            document.getElementById('icon-selector')?.addEventListener('click', (e) => {
                if (e.target.classList.contains('icon-option')) {
                    document.querySelectorAll('.icon-option').forEach(el => el.classList.remove('selected'));
                    e.target.classList.add('selected');
                    document.getElementById('servico-icone').value = e.target.dataset.icon;
                }
            });

            // Cancelar
            document.getElementById('btn-cancelar-servico')?.addEventListener('click', () => {
                this.close();
                resolve(null);
            });

            // Submit
            const form = document.getElementById('form-modal-servico');
            form?.addEventListener('submit', (e) => {
                e.preventDefault();

                const dados = {
                    nome: document.getElementById('servico-nome').value.trim(),
                    preco: parseFloat(document.getElementById('servico-preco').value) || 0,
                    duracao: parseInt(document.getElementById('servico-duracao').value) || 30,
                    descricao: document.getElementById('servico-descricao').value.trim(),
                    icone: document.getElementById('servico-icone').value
                };

                // Validação
                if (!dados.nome || dados.preco < 0) {
                    Toast.show('Preencha o nome e preço corretamente', 'error');
                    return;
                }

                if (isEdit) {
                    dados.id = servico.id;
                }

                this.onCloseCallback = null;
                this.close();
                resolve(dados);
            });
        });
    },

    /**
     * Abre modal com formulário de transação financeira
     * @param {Object} transacao - Dados da transação (para edição)
     * @returns {Promise<Object|null>} Dados da transação ou null se cancelado
     */
    formTransacao(transacao = null) {
        return new Promise((resolve) => {
            const isEdit = transacao !== null;
            const title = isEdit ? 'Editar Transação' : 'Nova Transação';

            const content = `
                <form id="form-modal-transacao" class="form">
                    <div class="form-group">
                        <label for="trans-tipo">Tipo *</label>
                        <select id="trans-tipo" class="input-select" required>
                            <option value="receita" ${transacao?.tipo === 'receita' || !transacao ? 'selected' : ''}>📈 Receita</option>
                            <option value="despesa" ${transacao?.tipo === 'despesa' ? 'selected' : ''}>📉 Despesa</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="trans-descricao">Descrição *</label>
                        <input type="text" id="trans-descricao" class="input" value="${Helpers.escapeHtml(transacao?.descricao || '')}" placeholder="Ex: Serviço realizado" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="trans-valor">Valor (R$) *</label>
                            <input type="number" id="trans-valor" class="input" value="${transacao?.valor || ''}" step="0.01" min="0" placeholder="0,00" required>
                        </div>
                        <div class="form-group">
                            <label for="trans-data">Data *</label>
                            <input type="date" id="trans-data" class="input" value="${transacao?.data || Helpers.formatDate(new Date(), 'iso')}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="trans-categoria">Categoria</label>
                        <select id="trans-categoria" class="input-select">
                            <option value="servico" ${transacao?.categoria === 'servico' ? 'selected' : ''}>Serviço</option>
                            <option value="produto" ${transacao?.categoria === 'produto' ? 'selected' : ''}>Produto</option>
                            <option value="material" ${transacao?.categoria === 'material' ? 'selected' : ''}>Material</option>
                            <option value="aluguel" ${transacao?.categoria === 'aluguel' ? 'selected' : ''}>Aluguel</option>
                            <option value="salario" ${transacao?.categoria === 'salario' ? 'selected' : ''}>Salário</option>
                            <option value="imposto" ${transacao?.categoria === 'imposto' ? 'selected' : ''}>Imposto</option>
                            <option value="outro" ${transacao?.categoria === 'outro' || !transacao ? 'selected' : ''}>Outro</option>
                        </select>
                    </div>
                    <div class="modal-footer" style="margin-top: var(--spacing-lg); padding: var(--spacing-md) 0 0; border-top: 1px solid var(--color-gray-100);">
                        <button type="button" class="btn btn-secondary" id="btn-cancelar-transacao">Cancelar</button>
                        <button type="submit" class="btn btn-primary">${isEdit ? 'Salvar' : 'Registrar'}</button>
                    </div>
                </form>
            `;

            this.open({
                title,
                content,
                size: 'sm',
                onClose: () => resolve(null)
            });

            // Cancelar
            document.getElementById('btn-cancelar-transacao')?.addEventListener('click', () => {
                this.close();
                resolve(null);
            });

            // Submit
            const form = document.getElementById('form-modal-transacao');
            form?.addEventListener('submit', (e) => {
                e.preventDefault();

                const dados = {
                    tipo: document.getElementById('trans-tipo').value,
                    descricao: document.getElementById('trans-descricao').value.trim(),
                    valor: parseFloat(document.getElementById('trans-valor').value) || 0,
                    data: document.getElementById('trans-data').value,
                    categoria: document.getElementById('trans-categoria').value
                };

                // Validação
                if (!dados.descricao || dados.valor <= 0 || !dados.data) {
                    Toast.show('Preencha todos os campos corretamente', 'error');
                    return;
                }

                if (isEdit) {
                    dados.id = transacao.id;
                }

                this.onCloseCallback = null;
                this.close();
                resolve(dados);
            });
        });
    }
};
