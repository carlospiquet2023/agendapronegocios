/**
 * STORAGE - Agenda Pro Negócios
 * Gerenciamento de dados com LocalStorage
 */

const Storage = {
    // Prefixo para evitar conflitos
    PREFIX: 'agenda_pro_',

    // Chaves do sistema
    KEYS: {
        CLIENTES: 'clientes',
        AGENDAMENTOS: 'agendamentos',
        SERVICOS: 'servicos',
        TRANSACOES: 'transacoes',
        LEMBRETES: 'lembretes',
        CONFIG: 'configuracoes',
        MENSAGENS: 'mensagens_whatsapp'
    },

    /**
     * Salva dados no localStorage
     * @param {string} key - Chave de armazenamento
     * @param {any} data - Dados a serem salvos
     * @returns {boolean} Sucesso da operação
     */
    save(key, data) {
        try {
            const fullKey = this.PREFIX + key;
            const serialized = JSON.stringify({
                data: data,
                timestamp: Date.now(),
                version: '1.0'
            });
            localStorage.setItem(fullKey, serialized);
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            
            // Verifica se é erro de quota
            if (error.name === 'QuotaExceededError') {
                Toast.show('Armazenamento cheio! Faça backup e limpe dados antigos.', 'error');
            }
            return false;
        }
    },

    /**
     * Carrega dados do localStorage
     * @param {string} key - Chave de armazenamento
     * @param {any} defaultValue - Valor padrão se não existir
     * @returns {any} Dados carregados
     */
    load(key, defaultValue = null) {
        try {
            const fullKey = this.PREFIX + key;
            const serialized = localStorage.getItem(fullKey);
            
            if (!serialized) {
                return defaultValue;
            }

            const parsed = JSON.parse(serialized);
            return parsed.data !== undefined ? parsed.data : parsed;
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return defaultValue;
        }
    },

    /**
     * Remove item do localStorage
     * @param {string} key - Chave a ser removida
     * @returns {boolean} Sucesso da operação
     */
    remove(key) {
        try {
            const fullKey = this.PREFIX + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('Erro ao remover dados:', error);
            return false;
        }
    },

    /**
     * Verifica se chave existe
     * @param {string} key - Chave a verificar
     * @returns {boolean}
     */
    exists(key) {
        const fullKey = this.PREFIX + key;
        return localStorage.getItem(fullKey) !== null;
    },

    /**
     * Limpa todos os dados do sistema
     * @returns {boolean} Sucesso da operação
     */
    clearAll() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Erro ao limpar dados:', error);
            return false;
        }
    },

    /**
     * Exporta todos os dados para backup
     * @returns {string} JSON com todos os dados
     */
    exportAll() {
        const backup = {
            version: '1.0',
            date: new Date().toISOString(),
            app: 'Agenda Pro Negócios',
            data: {}
        };

        Object.values(this.KEYS).forEach(key => {
            backup.data[key] = this.load(key, []);
        });

        return JSON.stringify(backup, null, 2);
    },

    /**
     * Importa dados de backup
     * @param {string} jsonString - JSON do backup
     * @returns {Object} Resultado da importação
     */
    importAll(jsonString) {
        try {
            const backup = JSON.parse(jsonString);
            
            // Validação básica
            if (!backup.data || !backup.version) {
                throw new Error('Formato de backup inválido');
            }

            // Importa cada conjunto de dados
            Object.keys(backup.data).forEach(key => {
                if (Object.values(this.KEYS).includes(key)) {
                    this.save(key, backup.data[key]);
                }
            });

            return {
                success: true,
                message: 'Backup restaurado com sucesso!',
                date: backup.date
            };
        } catch (error) {
            console.error('Erro ao importar backup:', error);
            return {
                success: false,
                message: 'Erro ao restaurar backup: ' + error.message
            };
        }
    },

    /**
     * Obtém tamanho total usado pelo app
     * @returns {string} Tamanho formatado
     */
    getSize() {
        let total = 0;
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith(this.PREFIX)) {
                total += localStorage.getItem(key).length * 2; // UTF-16
            }
        });

        // Converte para KB ou MB
        if (total < 1024) {
            return total + ' bytes';
        } else if (total < 1024 * 1024) {
            return (total / 1024).toFixed(2) + ' KB';
        } else {
            return (total / (1024 * 1024)).toFixed(2) + ' MB';
        }
    },

    // ========================================
    // MÉTODOS ESPECÍFICOS PARA CADA ENTIDADE
    // ========================================

    // CLIENTES
    getClientes() {
        return this.load(this.KEYS.CLIENTES, []);
    },

    saveClientes(clientes) {
        return this.save(this.KEYS.CLIENTES, clientes);
    },

    addCliente(cliente) {
        const clientes = this.getClientes();
        cliente.id = cliente.id || Helpers.generateId();
        cliente.dataCadastro = cliente.dataCadastro || new Date().toISOString();
        clientes.push(cliente);
        return this.saveClientes(clientes) ? cliente : null;
    },

    updateCliente(id, dados) {
        const clientes = this.getClientes();
        const index = clientes.findIndex(c => c.id === id);
        if (index !== -1) {
            clientes[index] = { ...clientes[index], ...dados, dataAtualizacao: new Date().toISOString() };
            return this.saveClientes(clientes) ? clientes[index] : null;
        }
        return null;
    },

    deleteCliente(id) {
        const clientes = this.getClientes();
        const filtered = clientes.filter(c => c.id !== id);
        return this.saveClientes(filtered);
    },

    getClienteById(id) {
        const clientes = this.getClientes();
        return clientes.find(c => c.id === id) || null;
    },

    // AGENDAMENTOS
    getAgendamentos() {
        return this.load(this.KEYS.AGENDAMENTOS, []);
    },

    saveAgendamentos(agendamentos) {
        return this.save(this.KEYS.AGENDAMENTOS, agendamentos);
    },

    addAgendamento(agendamento) {
        const agendamentos = this.getAgendamentos();
        agendamento.id = agendamento.id || Helpers.generateId();
        agendamento.dataCriacao = new Date().toISOString();
        agendamento.status = agendamento.status || 'pendente';
        agendamentos.push(agendamento);
        return this.saveAgendamentos(agendamentos) ? agendamento : null;
    },

    updateAgendamento(id, dados) {
        const agendamentos = this.getAgendamentos();
        const index = agendamentos.findIndex(a => a.id === id);
        if (index !== -1) {
            agendamentos[index] = { ...agendamentos[index], ...dados };
            return this.saveAgendamentos(agendamentos) ? agendamentos[index] : null;
        }
        return null;
    },

    deleteAgendamento(id) {
        const agendamentos = this.getAgendamentos();
        const filtered = agendamentos.filter(a => a.id !== id);
        return this.saveAgendamentos(filtered);
    },

    getAgendamentosByDate(date) {
        const agendamentos = this.getAgendamentos();
        const targetDate = Helpers.formatDate(date, 'iso');
        return agendamentos.filter(a => a.data === targetDate);
    },

    getAgendamentosHoje() {
        return this.getAgendamentosByDate(new Date());
    },

    // SERVIÇOS
    getServicos() {
        return this.load(this.KEYS.SERVICOS, []);
    },

    saveServicos(servicos) {
        return this.save(this.KEYS.SERVICOS, servicos);
    },

    addServico(servico) {
        const servicos = this.getServicos();
        servico.id = servico.id || Helpers.generateId();
        servico.dataCriacao = new Date().toISOString();
        servicos.push(servico);
        return this.saveServicos(servicos) ? servico : null;
    },

    updateServico(id, dados) {
        const servicos = this.getServicos();
        const index = servicos.findIndex(s => s.id === id);
        if (index !== -1) {
            servicos[index] = { ...servicos[index], ...dados };
            return this.saveServicos(servicos) ? servicos[index] : null;
        }
        return null;
    },

    deleteServico(id) {
        const servicos = this.getServicos();
        const filtered = servicos.filter(s => s.id !== id);
        return this.saveServicos(filtered);
    },

    getServicoById(id) {
        const servicos = this.getServicos();
        return servicos.find(s => s.id === id) || null;
    },

    // TRANSAÇÕES FINANCEIRAS
    getTransacoes() {
        return this.load(this.KEYS.TRANSACOES, []);
    },

    saveTransacoes(transacoes) {
        return this.save(this.KEYS.TRANSACOES, transacoes);
    },

    addTransacao(transacao) {
        const transacoes = this.getTransacoes();
        transacao.id = transacao.id || Helpers.generateId();
        transacao.dataCriacao = new Date().toISOString();
        transacoes.push(transacao);
        return this.saveTransacoes(transacoes) ? transacao : null;
    },

    updateTransacao(id, dados) {
        const transacoes = this.getTransacoes();
        const index = transacoes.findIndex(t => t.id === id);
        if (index !== -1) {
            transacoes[index] = { ...transacoes[index], ...dados };
            return this.saveTransacoes(transacoes) ? transacoes[index] : null;
        }
        return null;
    },

    deleteTransacao(id) {
        const transacoes = this.getTransacoes();
        const filtered = transacoes.filter(t => t.id !== id);
        return this.saveTransacoes(filtered);
    },

    getTransacoesByMonth(year, month) {
        const transacoes = this.getTransacoes();
        return transacoes.filter(t => {
            const d = new Date(t.data);
            return d.getFullYear() === year && d.getMonth() === month;
        });
    },

    // LEMBRETES
    getLembretes() {
        return this.load(this.KEYS.LEMBRETES, []);
    },

    saveLembretes(lembretes) {
        return this.save(this.KEYS.LEMBRETES, lembretes);
    },

    addLembrete(lembrete) {
        const lembretes = this.getLembretes();
        lembrete.id = lembrete.id || Helpers.generateId();
        lembrete.lido = false;
        lembrete.dataCriacao = new Date().toISOString();
        lembretes.push(lembrete);
        return this.saveLembretes(lembretes) ? lembrete : null;
    },

    marcarLembreteLido(id) {
        const lembretes = this.getLembretes();
        const index = lembretes.findIndex(l => l.id === id);
        if (index !== -1) {
            lembretes[index].lido = true;
            return this.saveLembretes(lembretes);
        }
        return false;
    },

    getLembretesNaoLidos() {
        const lembretes = this.getLembretes();
        return lembretes.filter(l => !l.lido);
    },

    // CONFIGURAÇÕES
    getConfig() {
        return this.load(this.KEYS.CONFIG, {
            nomeNegocio: 'Meu Negócio',
            tipoNegocio: 'outro',
            telefone: '',
            endereco: '',
            msgLembrete: 'Olá {nome}, lembrando do seu agendamento em {data} às {hora}. Confirma presença?',
            msgConfirmacao: 'Olá {nome}, seu serviço foi confirmado para {data} às {hora}. Aguardamos você!'
        });
    },

    saveConfig(config) {
        return this.save(this.KEYS.CONFIG, config);
    },

    updateConfig(dados) {
        const config = this.getConfig();
        const newConfig = { ...config, ...dados };
        return this.saveConfig(newConfig);
    }
};

// Congela objeto para prevenir modificações
Object.freeze(Storage.KEYS);
