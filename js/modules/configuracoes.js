/**
 * MÓDULO CONFIGURAÇÕES - Agenda Pro Negócios
 * Gerenciamento de configurações do sistema
 */

const ConfiguracoesModule = {
    formNegocio: null,
    inputNomeNegocio: null,
    inputTipoNegocio: null,
    inputTelefone: null,
    inputEndereco: null,
    inputMsgLembrete: null,
    inputMsgConfirmacao: null,
    btnFazerBackup: null,
    btnRestaurarBackup: null,
    btnLimparDados: null,
    inputRestaurarBackup: null,
    btnSalvarMensagens: null,

    /**
     * Inicializa o módulo de configurações
     */
    init() {
        this.formNegocio = document.getElementById('form-config-negocio');
        this.inputNomeNegocio = document.getElementById('config-nome-negocio');
        this.inputTipoNegocio = document.getElementById('config-tipo-negocio');
        this.inputTelefone = document.getElementById('config-telefone');
        this.inputEndereco = document.getElementById('config-endereco');
        this.inputMsgLembrete = document.getElementById('config-msg-lembrete');
        this.inputMsgConfirmacao = document.getElementById('config-msg-confirmacao');
        this.btnFazerBackup = document.getElementById('btn-fazer-backup');
        this.btnRestaurarBackup = document.getElementById('btn-restaurar-backup');
        this.btnLimparDados = document.getElementById('btn-limpar-dados');
        this.inputRestaurarBackup = document.getElementById('input-restaurar-backup');
        this.btnSalvarMensagens = document.getElementById('btn-salvar-mensagens');

        this.loadConfig();
        this.bindEvents();
    },

    /**
     * Carrega configurações salvas
     */
    loadConfig() {
        const config = Storage.getConfig();

        if (this.inputNomeNegocio) this.inputNomeNegocio.value = config.nomeNegocio || '';
        if (this.inputTipoNegocio) this.inputTipoNegocio.value = config.tipoNegocio || 'outro';
        if (this.inputTelefone) this.inputTelefone.value = Helpers.formatPhone(config.telefone) || '';
        if (this.inputEndereco) this.inputEndereco.value = config.endereco || '';
        if (this.inputMsgLembrete) this.inputMsgLembrete.value = config.msgLembrete || '';
        if (this.inputMsgConfirmacao) this.inputMsgConfirmacao.value = config.msgConfirmacao || '';

        // Atualiza sidebar
        this.updateSidebar(config);
    },

    /**
     * Atualiza informações na sidebar
     * @param {Object} config - Configurações
     */
    updateSidebar(config) {
        const businessName = document.getElementById('business-name');
        const businessType = document.getElementById('business-type');

        const tipoLabels = {
            oficina: 'Oficina Mecânica',
            salao: 'Salão de Beleza',
            barbearia: 'Barbearia',
            autonomo: 'Autônomo',
            loja: 'Loja',
            outro: 'Negócio'
        };

        if (businessName) {
            businessName.textContent = config.nomeNegocio || 'Meu Negócio';
        }
        if (businessType) {
            businessType.textContent = tipoLabels[config.tipoNegocio] || 'Configure seu negócio';
        }
    },

    /**
     * Vincula eventos do módulo
     */
    bindEvents() {
        // Formulário de configurações do negócio
        this.formNegocio?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveConfig();
        });

        // Máscara de telefone
        this.inputTelefone?.addEventListener('input', (e) => {
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

        // Salvar mensagens WhatsApp
        this.btnSalvarMensagens?.addEventListener('click', () => {
            this.saveMessages();
        });

        // Fazer backup
        this.btnFazerBackup?.addEventListener('click', () => {
            this.fazerBackup();
        });

        // Restaurar backup
        this.btnRestaurarBackup?.addEventListener('click', () => {
            this.inputRestaurarBackup?.click();
        });

        this.inputRestaurarBackup?.addEventListener('change', (e) => {
            this.restaurarBackup(e.target.files[0]);
        });

        // Limpar dados
        this.btnLimparDados?.addEventListener('click', () => {
            this.limparDados();
        });
    },

    /**
     * Salva configurações do negócio
     */
    saveConfig() {
        const config = {
            nomeNegocio: this.inputNomeNegocio?.value.trim() || 'Meu Negócio',
            tipoNegocio: this.inputTipoNegocio?.value || 'outro',
            telefone: Helpers.cleanPhone(this.inputTelefone?.value || ''),
            endereco: this.inputEndereco?.value.trim() || ''
        };

        if (Storage.updateConfig(config)) {
            Toast.success('Configurações salvas com sucesso!');
            this.updateSidebar(config);
        } else {
            Toast.error('Erro ao salvar configurações');
        }
    },

    /**
     * Salva mensagens do WhatsApp
     */
    saveMessages() {
        const mensagens = {
            msgLembrete: this.inputMsgLembrete?.value.trim() || '',
            msgConfirmacao: this.inputMsgConfirmacao?.value.trim() || ''
        };

        if (Storage.updateConfig(mensagens)) {
            Toast.success('Mensagens salvas com sucesso!');
        } else {
            Toast.error('Erro ao salvar mensagens');
        }
    },

    /**
     * Faz backup dos dados
     */
    fazerBackup() {
        const loading = Toast.loading('Gerando backup...');

        try {
            const backup = Storage.exportAll();
            const config = Storage.getConfig();
            const nomeArquivo = `backup_${config.nomeNegocio?.replace(/\s+/g, '_') || 'agenda_pro'}_${Helpers.formatDate(new Date(), 'iso')}.json`;

            // Download do arquivo
            const blob = new Blob([backup], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = nomeArquivo;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            loading.done('Backup realizado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao fazer backup:', error);
            loading.done('Erro ao fazer backup', 'error');
        }
    },

    /**
     * Restaura backup
     * @param {File} arquivo - Arquivo de backup
     */
    async restaurarBackup(arquivo) {
        if (!arquivo) return;

        // Verifica se é JSON
        if (!arquivo.name.endsWith('.json')) {
            Toast.error('Selecione um arquivo JSON de backup');
            return;
        }

        // Confirmação
        const confirmado = await Modal.confirm({
            title: 'Restaurar Backup',
            message: 'Isso irá substituir TODOS os dados atuais. Tem certeza?',
            confirmText: 'Restaurar',
            type: 'warning'
        });

        if (!confirmado) {
            this.inputRestaurarBackup.value = '';
            return;
        }

        const loading = Toast.loading('Restaurando backup...');

        try {
            const texto = await arquivo.text();
            const resultado = Storage.importAll(texto);

            if (resultado.success) {
                loading.done(resultado.message, 'success');
                
                // Recarrega a página após restaurar
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                loading.done(resultado.message, 'error');
            }
        } catch (error) {
            console.error('Erro ao restaurar backup:', error);
            loading.done('Erro ao ler arquivo de backup', 'error');
        }

        this.inputRestaurarBackup.value = '';
    },

    /**
     * Limpa todos os dados
     */
    async limparDados() {
        const confirmado = await Modal.confirm({
            title: '⚠️ ATENÇÃO',
            message: 'Esta ação irá APAGAR PERMANENTEMENTE todos os dados (clientes, agendamentos, serviços, etc). Esta ação não pode ser desfeita! Deseja continuar?',
            confirmText: 'Sim, apagar tudo',
            type: 'danger'
        });

        if (!confirmado) return;

        // Segunda confirmação
        const confirmadoFinal = await Modal.confirm({
            title: 'Última confirmação',
            message: 'Você fez backup dos dados? Após limpar, não será possível recuperar.',
            confirmText: 'Limpar dados',
            cancelText: 'Fazer backup primeiro',
            type: 'danger'
        });

        if (!confirmadoFinal) {
            this.fazerBackup();
            return;
        }

        const loading = Toast.loading('Limpando dados...');

        try {
            if (Storage.clearAll()) {
                loading.done('Todos os dados foram apagados', 'success');
                
                // Recarrega a página
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                loading.done('Erro ao limpar dados', 'error');
            }
        } catch (error) {
            console.error('Erro ao limpar dados:', error);
            loading.done('Erro ao limpar dados', 'error');
        }
    }
};
