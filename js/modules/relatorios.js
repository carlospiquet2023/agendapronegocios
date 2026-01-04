/**
 * MÓDULO RELATÓRIOS - Agenda Pro Negócios
 * Exportação de dados em diferentes formatos
 */

const RelatoriosModule = {
    /**
     * Inicializa o módulo de relatórios
     */
    init() {
        this.bindEvents();
    },

    /**
     * Vincula eventos do módulo
     */
    bindEvents() {
        // Botões de exportação
        document.querySelectorAll('.btn-export').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tipo = e.target.dataset.type;
                this.exportar(tipo);
            });
        });
    },

    /**
     * Exporta relatório
     * @param {string} tipo - Tipo do relatório (clientes, servicos, financeiro, agendamentos)
     */
    async exportar(tipo) {
        const loading = Toast.loading(`Gerando relatório de ${tipo}...`);

        try {
            let dados;
            let nomeArquivo;
            let headers;

            switch (tipo) {
                case 'clientes':
                    dados = this.prepararRelatorioClientes();
                    headers = ['Nome', 'Telefone', 'Email', 'Endereço', 'Data Cadastro', 'Total Atendimentos'];
                    nomeArquivo = 'relatorio_clientes';
                    break;

                case 'servicos':
                    dados = this.prepararRelatorioServicos();
                    headers = ['Serviço', 'Preço', 'Duração (min)', 'Total Realizados', 'Faturamento'];
                    nomeArquivo = 'relatorio_servicos';
                    break;

                case 'financeiro':
                    dados = this.prepararRelatorioFinanceiro();
                    headers = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor'];
                    nomeArquivo = 'relatorio_financeiro';
                    break;

                case 'agendamentos':
                    dados = this.prepararRelatorioAgendamentos();
                    headers = ['Data', 'Hora', 'Cliente', 'Serviço', 'Status', 'Prioridade'];
                    nomeArquivo = 'relatorio_agendamentos';
                    break;

                default:
                    throw new Error('Tipo de relatório inválido');
            }

            // Pergunta o formato
            const formato = await this.selecionarFormato();
            
            if (!formato) {
                loading.remove();
                return;
            }

            // Gera arquivo
            if (formato === 'csv') {
                this.exportarCSV(dados, headers, nomeArquivo);
            } else if (formato === 'json') {
                this.exportarJSON(dados, nomeArquivo);
            } else if (formato === 'pdf') {
                this.exportarPDF(dados, headers, nomeArquivo, tipo);
            }

            loading.done('Relatório exportado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao exportar:', error);
            loading.done('Erro ao exportar relatório', 'error');
        }
    },

    /**
     * Abre modal para seleção de formato
     * @returns {Promise<string|null>}
     */
    selecionarFormato() {
        return new Promise((resolve) => {
            const content = `
                <div class="format-selector">
                    <p style="margin-bottom: 16px; color: var(--color-gray-600);">Escolha o formato do relatório:</p>
                    <div class="format-options" style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <button class="btn btn-secondary format-btn" data-format="csv">
                            📊 CSV (Excel)
                        </button>
                        <button class="btn btn-secondary format-btn" data-format="json">
                            📄 JSON
                        </button>
                        <button class="btn btn-secondary format-btn" data-format="pdf">
                            📕 PDF
                        </button>
                    </div>
                </div>
            `;

            Modal.open({
                title: 'Formato do Relatório',
                content,
                size: 'sm',
                onClose: () => resolve(null)
            });

            document.querySelectorAll('.format-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const format = btn.dataset.format;
                    Modal.onCloseCallback = null;
                    Modal.close();
                    resolve(format);
                });
            });
        });
    },

    /**
     * Prepara dados do relatório de clientes
     * @returns {Array}
     */
    prepararRelatorioClientes() {
        const clientes = Storage.getClientes();
        const agendamentos = Storage.getAgendamentos();

        return clientes.map(cliente => {
            const totalAtendimentos = agendamentos.filter(
                a => a.clienteId === cliente.id && a.status === 'concluido'
            ).length;

            return {
                nome: cliente.nome,
                telefone: Helpers.formatPhone(cliente.telefone),
                email: cliente.email || '-',
                endereco: cliente.endereco || '-',
                dataCadastro: Helpers.formatDate(cliente.dataCadastro, 'short'),
                totalAtendimentos
            };
        });
    },

    /**
     * Prepara dados do relatório de serviços
     * @returns {Array}
     */
    prepararRelatorioServicos() {
        const servicos = Storage.getServicos();
        const agendamentos = Storage.getAgendamentos().filter(a => a.status === 'concluido');

        return servicos.map(servico => {
            const realizados = agendamentos.filter(a => a.servicoId === servico.id).length;
            const faturamento = realizados * servico.preco;

            return {
                nome: servico.nome,
                preco: Helpers.formatCurrency(servico.preco),
                duracao: servico.duracao || 30,
                totalRealizados: realizados,
                faturamento: Helpers.formatCurrency(faturamento)
            };
        });
    },

    /**
     * Prepara dados do relatório financeiro
     * @returns {Array}
     */
    prepararRelatorioFinanceiro() {
        const transacoes = Storage.getTransacoes();

        return Helpers.sortBy(transacoes, 'data', 'desc').map(trans => ({
            data: Helpers.formatDate(trans.data, 'short'),
            descricao: trans.descricao,
            tipo: trans.tipo === 'receita' ? 'Receita' : 'Despesa',
            categoria: Helpers.capitalize(trans.categoria),
            valor: (trans.tipo === 'receita' ? '+' : '-') + ' ' + Helpers.formatCurrency(trans.valor)
        }));
    },

    /**
     * Prepara dados do relatório de agendamentos
     * @returns {Array}
     */
    prepararRelatorioAgendamentos() {
        const agendamentos = Storage.getAgendamentos();
        const clientes = Storage.getClientes();
        const servicos = Storage.getServicos();

        return Helpers.sortBy(agendamentos, 'data', 'desc').map(agend => {
            const cliente = clientes.find(c => c.id === agend.clienteId);
            const servico = servicos.find(s => s.id === agend.servicoId);

            const statusLabels = {
                pendente: 'Pendente',
                confirmado: 'Confirmado',
                concluido: 'Concluído',
                cancelado: 'Cancelado'
            };

            const prioridadeLabels = {
                baixa: 'Baixa',
                media: 'Média',
                alta: 'Alta'
            };

            return {
                data: Helpers.formatDate(agend.data, 'short'),
                hora: agend.hora,
                cliente: cliente?.nome || 'Removido',
                servico: servico?.nome || 'Removido',
                status: statusLabels[agend.status] || agend.status,
                prioridade: prioridadeLabels[agend.prioridade] || agend.prioridade
            };
        });
    },

    /**
     * Exporta dados para CSV
     * @param {Array} dados - Dados a exportar
     * @param {Array} headers - Cabeçalhos
     * @param {string} nomeArquivo - Nome do arquivo
     */
    exportarCSV(dados, headers, nomeArquivo) {
        if (dados.length === 0) {
            Toast.warning('Nenhum dado para exportar');
            return;
        }

        // BOM para UTF-8
        let csv = '\ufeff';
        
        // Headers
        csv += headers.join(';') + '\n';

        // Dados
        dados.forEach(item => {
            const valores = Object.values(item).map(v => {
                // Escapa aspas e adiciona aspas ao redor
                const str = String(v).replace(/"/g, '""');
                return `"${str}"`;
            });
            csv += valores.join(';') + '\n';
        });

        this.downloadFile(csv, `${nomeArquivo}_${Helpers.formatDate(new Date(), 'iso')}.csv`, 'text/csv;charset=utf-8');
    },

    /**
     * Exporta dados para JSON
     * @param {Array} dados - Dados a exportar
     * @param {string} nomeArquivo - Nome do arquivo
     */
    exportarJSON(dados, nomeArquivo) {
        const json = JSON.stringify({
            exportadoEm: new Date().toISOString(),
            totalRegistros: dados.length,
            dados
        }, null, 2);

        this.downloadFile(json, `${nomeArquivo}_${Helpers.formatDate(new Date(), 'iso')}.json`, 'application/json');
    },

    /**
     * Exporta dados para PDF (versão simplificada HTML)
     * @param {Array} dados - Dados a exportar
     * @param {Array} headers - Cabeçalhos
     * @param {string} nomeArquivo - Nome do arquivo
     * @param {string} titulo - Título do relatório
     */
    exportarPDF(dados, headers, nomeArquivo, titulo) {
        if (dados.length === 0) {
            Toast.warning('Nenhum dado para exportar');
            return;
        }

        const config = Storage.getConfig();
        const tituloFormatado = Helpers.capitalize(titulo);

        // Cria tabela HTML
        let tableRows = dados.map(item => {
            return '<tr>' + Object.values(item).map(v => `<td>${Helpers.escapeHtml(String(v))}</td>`).join('') + '</tr>';
        }).join('');

        const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório de ${tituloFormatado}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
        .header h1 { color: #2563eb; margin-bottom: 5px; }
        .header p { color: #666; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; font-size: 12px; }
        th { background-color: #2563eb; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f8f9fa; }
        tr:hover { background-color: #e9ecef; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        @media print {
            body { padding: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${config.nomeNegocio || 'Agenda Pro Negócios'}</h1>
        <p>Relatório de ${tituloFormatado}</p>
        <p>Gerado em: ${Helpers.formatDate(new Date(), 'datetime')}</p>
    </div>
    
    <table>
        <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
            ${tableRows}
        </tbody>
    </table>
    
    <div class="footer">
        <p>Total de registros: ${dados.length}</p>
        <p>Agenda Pro Negócios - Sistema de Gestão</p>
    </div>
    
    <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
            🖨️ Imprimir / Salvar PDF
        </button>
    </div>
</body>
</html>
        `;

        // Abre em nova janela para impressão
        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
    },

    /**
     * Faz download de arquivo
     * @param {string} content - Conteúdo do arquivo
     * @param {string} filename - Nome do arquivo
     * @param {string} mimeType - Tipo MIME
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
};
