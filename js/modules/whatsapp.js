/**
 * MÓDULO WHATSAPP - Agenda Pro Negócios
 * Integração com WhatsApp Web
 */

const WhatsAppModule = {
    /**
     * Inicializa o módulo
     */
    init() {
        // Módulo não requer inicialização especial
    },

    /**
     * Envia mensagem via WhatsApp Web
     * @param {string} telefone - Número de telefone
     * @param {string} mensagem - Mensagem a enviar
     * @param {string} nome - Nome do destinatário (para log)
     */
    sendMessage(telefone, mensagem = '', nome = '') {
        // Limpa telefone
        let numero = Helpers.cleanPhone(telefone);
        
        if (!numero || numero.length < 10) {
            Toast.error('Número de telefone inválido');
            return;
        }

        // Adiciona código do Brasil se necessário
        if (!numero.startsWith('55')) {
            numero = '55' + numero;
        }

        // Codifica mensagem para URL
        const mensagemEncoded = encodeURIComponent(mensagem);

        // Monta URL do WhatsApp
        const url = `https://wa.me/${numero}${mensagem ? '?text=' + mensagemEncoded : ''}`;

        // Abre em nova aba
        window.open(url, '_blank');

        // Log
        if (nome) {
            Toast.info(`Abrindo WhatsApp para ${nome}...`);
        }
    },

    /**
     * Envia lembrete de agendamento
     * @param {Object} agendamento - Dados do agendamento
     */
    sendLembrete(agendamento) {
        const cliente = Storage.getClienteById(agendamento.clienteId);
        const servico = Storage.getServicoById(agendamento.servicoId);
        const config = Storage.getConfig();

        if (!cliente) {
            Toast.error('Cliente não encontrado');
            return;
        }

        // Prepara mensagem com placeholders
        let mensagem = config.msgLembrete || 'Olá {nome}, lembrando do seu agendamento para {servico} no dia {data} às {hora}. Confirma presença?';

        mensagem = this.replacePlaceholders(mensagem, {
            nome: cliente.nome,
            servico: servico?.nome || 'serviço',
            data: Helpers.formatDate(agendamento.data, 'short'),
            hora: agendamento.hora,
            negocio: config.nomeNegocio || 'nosso estabelecimento'
        });

        this.sendMessage(cliente.telefone, mensagem, cliente.nome);
    },

    /**
     * Envia confirmação de agendamento
     * @param {Object} agendamento - Dados do agendamento
     */
    sendConfirmacao(agendamento) {
        const cliente = Storage.getClienteById(agendamento.clienteId);
        const servico = Storage.getServicoById(agendamento.servicoId);
        const config = Storage.getConfig();

        if (!cliente) {
            Toast.error('Cliente não encontrado');
            return;
        }

        let mensagem = config.msgConfirmacao || 'Olá {nome}, seu agendamento para {servico} foi confirmado para {data} às {hora}. Aguardamos você!';

        mensagem = this.replacePlaceholders(mensagem, {
            nome: cliente.nome,
            servico: servico?.nome || 'serviço',
            data: Helpers.formatDate(agendamento.data, 'short'),
            hora: agendamento.hora,
            negocio: config.nomeNegocio || 'nosso estabelecimento'
        });

        this.sendMessage(cliente.telefone, mensagem, cliente.nome);
    },

    /**
     * Envia mensagem personalizada
     * @param {string} clienteId - ID do cliente
     * @param {string} mensagem - Mensagem customizada
     */
    sendCustomMessage(clienteId, mensagem) {
        const cliente = Storage.getClienteById(clienteId);

        if (!cliente) {
            Toast.error('Cliente não encontrado');
            return;
        }

        this.sendMessage(cliente.telefone, mensagem, cliente.nome);
    },

    /**
     * Substitui placeholders na mensagem
     * @param {string} template - Template da mensagem
     * @param {Object} dados - Dados para substituição
     * @returns {string} Mensagem formatada
     */
    replacePlaceholders(template, dados) {
        let resultado = template;

        Object.keys(dados).forEach(key => {
            const regex = new RegExp(`{${key}}`, 'gi');
            resultado = resultado.replace(regex, dados[key] || '');
        });

        return resultado;
    },

    /**
     * Abre modal para enviar mensagem personalizada
     * @param {string} clienteId - ID do cliente
     */
    async openMessageModal(clienteId) {
        const cliente = Storage.getClienteById(clienteId);

        if (!cliente) {
            Toast.error('Cliente não encontrado');
            return;
        }

        const config = Storage.getConfig();
        const templates = [
            { label: 'Lembrete', value: config.msgLembrete || 'Olá {nome}, lembrando do seu agendamento...' },
            { label: 'Confirmação', value: config.msgConfirmacao || 'Olá {nome}, seu serviço foi confirmado...' },
            { label: 'Personalizada', value: '' }
        ];

        const content = `
            <form id="form-whatsapp" class="form">
                <div class="form-group">
                    <label>Destinatário</label>
                    <input type="text" class="input" value="${Helpers.escapeHtml(cliente.nome)} - ${Helpers.formatPhone(cliente.telefone)}" readonly>
                </div>
                <div class="form-group">
                    <label for="wpp-template">Modelo</label>
                    <select id="wpp-template" class="input-select">
                        ${templates.map((t, i) => `<option value="${i}">${t.label}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="wpp-mensagem">Mensagem</label>
                    <textarea id="wpp-mensagem" class="input textarea" rows="4" placeholder="Digite sua mensagem...">${Helpers.escapeHtml(templates[0].value)}</textarea>
                </div>
                <p style="font-size: 12px; color: var(--color-gray-500); margin-bottom: 16px;">
                    Variáveis disponíveis: {nome}, {servico}, {data}, {hora}, {negocio}
                </p>
                <div class="modal-footer" style="padding: 0; border: none;">
                    <button type="button" class="btn btn-secondary" id="btn-cancelar-wpp">Cancelar</button>
                    <button type="submit" class="btn btn-success">📱 Enviar WhatsApp</button>
                </div>
            </form>
        `;

        Modal.open({
            title: '📱 Enviar WhatsApp',
            content,
            size: 'md'
        });

        const templateSelect = document.getElementById('wpp-template');
        const mensagemTextarea = document.getElementById('wpp-mensagem');

        // Troca de template
        templateSelect?.addEventListener('change', (e) => {
            const index = parseInt(e.target.value);
            mensagemTextarea.value = templates[index].value;
        });

        // Cancelar
        document.getElementById('btn-cancelar-wpp')?.addEventListener('click', () => {
            Modal.close();
        });

        // Enviar
        document.getElementById('form-whatsapp')?.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let mensagem = mensagemTextarea.value;
            
            // Substitui placeholders básicos
            mensagem = this.replacePlaceholders(mensagem, {
                nome: cliente.nome,
                negocio: config.nomeNegocio || 'nosso estabelecimento'
            });

            this.sendMessage(cliente.telefone, mensagem, cliente.nome);
            Modal.close();
        });
    },

    /**
     * Gera link de WhatsApp para o negócio
     * @returns {string} URL do WhatsApp
     */
    getBusinessLink() {
        const config = Storage.getConfig();
        const telefone = Helpers.cleanPhone(config.telefone);

        if (!telefone) return '';

        let numero = telefone;
        if (!numero.startsWith('55')) {
            numero = '55' + numero;
        }

        return `https://wa.me/${numero}`;
    }
};
