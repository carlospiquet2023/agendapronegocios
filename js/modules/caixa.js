/**
 * CAIXA REGISTRADORA - Agenda Pro Negócios
 * Sistema PDV Profissional Completo
 */

const CaixaModule = {
    // Estado do caixa
    caixaAberto: false,
    vendaAtual: null,
    itensVenda: [],
    
    // Configurações
    config: {
        impressora: false,
        somAtivo: true,
        codigoBarras: true
    },

    /**
     * Inicializa o módulo
     */
    init() {
        console.log('💰 Módulo Caixa Registradora inicializado');
        this.verificarCaixaAberto();
        this.carregarProdutosExemplo();
    },

    /**
     * Carrega produtos de exemplo se não houver nenhum
     */
    carregarProdutosExemplo() {
        const produtos = Storage.get('caixa_produtos') || [];
        if (produtos.length === 0) {
            const exemplos = [
                { id: 'p1', codigo: '001', nome: 'Corte Masculino', preco: 35.00, categoria: 'servicos', estoque: 999, estoqueMinimo: 1, icone: 'cut' },
                { id: 'p2', codigo: '002', nome: 'Corte Feminino', preco: 50.00, categoria: 'servicos', estoque: 999, estoqueMinimo: 1, icone: 'cut' },
                { id: 'p3', codigo: '003', nome: 'Barba', preco: 25.00, categoria: 'servicos', estoque: 999, estoqueMinimo: 1, icone: 'user' },
                { id: 'p4', codigo: '004', nome: 'Corte + Barba', preco: 55.00, categoria: 'combos', estoque: 999, estoqueMinimo: 1, icone: 'star' },
                { id: 'p5', codigo: '005', nome: 'Shampoo 300ml', preco: 28.90, categoria: 'produtos', estoque: 15, estoqueMinimo: 5, icone: 'pump-soap' },
                { id: 'p6', codigo: '006', nome: 'Pomada Modeladora', preco: 35.00, categoria: 'produtos', estoque: 20, estoqueMinimo: 5, icone: 'jar' },
                { id: 'p7', codigo: '007', nome: 'Óleo para Barba', preco: 45.00, categoria: 'produtos', estoque: 12, estoqueMinimo: 3, icone: 'droplet' },
                { id: 'p8', codigo: '008', nome: 'Gel Fixador', preco: 18.90, categoria: 'produtos', estoque: 25, estoqueMinimo: 5, icone: 'spray-can' },
                { id: 'p9', codigo: '009', nome: 'Hidratação Capilar', preco: 40.00, categoria: 'servicos', estoque: 999, estoqueMinimo: 1, icone: 'spa' },
                { id: 'p10', codigo: '010', nome: 'Combo VIP', preco: 85.00, categoria: 'combos', estoque: 999, estoqueMinimo: 1, icone: 'crown' },
                { id: 'p11', codigo: '011', nome: 'Manicure', preco: 30.00, categoria: 'servicos', estoque: 999, estoqueMinimo: 1, icone: 'hand-sparkles' },
                { id: 'p12', codigo: '012', nome: 'Pedicure', preco: 35.00, categoria: 'servicos', estoque: 999, estoqueMinimo: 1, icone: 'hand-sparkles' }
            ];
            Storage.set('caixa_produtos', exemplos);
            console.log('📦 Produtos de exemplo carregados');
        }
    },

    /**
     * Verifica se há caixa aberto do dia
     */
    verificarCaixaAberto() {
        const caixaHoje = this.getCaixaDia(new Date());
        if (caixaHoje && caixaHoje.status === 'aberto') {
            this.caixaAberto = true;
        }
    },

    // ========================================
    // GESTÃO DO CAIXA
    // ========================================

    /**
     * Abre o caixa do dia
     */
    abrirCaixa(valorInicial = 0) {
        const hoje = Helpers.formatDate(new Date(), 'iso');
        const caixaExistente = this.getCaixaDia(new Date());
        
        if (caixaExistente && caixaExistente.status === 'aberto') {
            Toast.show('Já existe um caixa aberto hoje!', 'warning');
            return null;
        }

        const novoCaixa = {
            id: Helpers.generateId(),
            data: hoje,
            dataAbertura: new Date().toISOString(),
            valorInicial: parseFloat(valorInicial) || 0,
            valorFinal: null,
            totalVendas: 0,
            totalDescontos: 0,
            totalDinheiro: 0,
            totalCartaoCredito: 0,
            totalCartaoDebito: 0,
            totalPix: 0,
            totalOutros: 0,
            quantidadeVendas: 0,
            quantidadeCancelamentos: 0,
            status: 'aberto',
            operador: Storage.getConfig().nomeNegocio || 'Operador',
            vendas: [],
            sangrias: [],
            reforcos: [],
            observacoes: ''
        };

        const caixas = this.getAllCaixas();
        caixas.push(novoCaixa);
        Storage.save('caixas', caixas);
        
        this.caixaAberto = true;
        Toast.show('✅ Caixa aberto com sucesso!', 'success');
        
        return novoCaixa;
    },

    /**
     * Fecha o caixa do dia
     */
    fecharCaixa(valorContado, observacoes = '') {
        const caixaHoje = this.getCaixaDia(new Date());
        
        if (!caixaHoje || caixaHoje.status !== 'aberto') {
            Toast.show('Não há caixa aberto para fechar!', 'error');
            return null;
        }

        const valorEsperado = this.calcularValorEsperado(caixaHoje);
        const diferenca = parseFloat(valorContado) - valorEsperado;

        caixaHoje.dataFechamento = new Date().toISOString();
        caixaHoje.valorFinal = parseFloat(valorContado);
        caixaHoje.valorEsperado = valorEsperado;
        caixaHoje.diferenca = diferenca;
        caixaHoje.status = 'fechado';
        caixaHoje.observacoes = observacoes;

        this.updateCaixa(caixaHoje);
        this.caixaAberto = false;
        
        if (diferenca === 0) {
            Toast.show('✅ Caixa fechado! Valores conferem!', 'success');
        } else if (diferenca > 0) {
            Toast.show(`⚠️ Caixa fechado com sobra de ${Helpers.formatCurrency(diferenca)}`, 'warning');
        } else {
            Toast.show(`⚠️ Caixa fechado com falta de ${Helpers.formatCurrency(Math.abs(diferenca))}`, 'warning');
        }

        return caixaHoje;
    },

    /**
     * Calcula valor esperado no caixa
     */
    calcularValorEsperado(caixa) {
        let valor = caixa.valorInicial;
        valor += caixa.totalDinheiro;
        
        // Soma reforços
        caixa.reforcos.forEach(r => valor += r.valor);
        
        // Subtrai sangrias
        caixa.sangrias.forEach(s => valor -= s.valor);
        
        return valor;
    },

    /**
     * Registra sangria (retirada de dinheiro)
     */
    registrarSangria(valor, motivo) {
        const caixaHoje = this.getCaixaDia(new Date());
        
        if (!caixaHoje || caixaHoje.status !== 'aberto') {
            Toast.show('Caixa não está aberto!', 'error');
            return false;
        }

        const sangria = {
            id: Helpers.generateId(),
            data: new Date().toISOString(),
            valor: parseFloat(valor),
            motivo: motivo || 'Sangria'
        };

        caixaHoje.sangrias.push(sangria);
        this.updateCaixa(caixaHoje);
        
        Toast.show(`💸 Sangria de ${Helpers.formatCurrency(valor)} registrada`, 'info');
        return true;
    },

    /**
     * Registra reforço (entrada de dinheiro)
     */
    registrarReforco(valor, motivo) {
        const caixaHoje = this.getCaixaDia(new Date());
        
        if (!caixaHoje || caixaHoje.status !== 'aberto') {
            Toast.show('Caixa não está aberto!', 'error');
            return false;
        }

        const reforco = {
            id: Helpers.generateId(),
            data: new Date().toISOString(),
            valor: parseFloat(valor),
            motivo: motivo || 'Reforço de caixa'
        };

        caixaHoje.reforcos.push(reforco);
        this.updateCaixa(caixaHoje);
        
        Toast.show(`💵 Reforço de ${Helpers.formatCurrency(valor)} registrado`, 'success');
        return true;
    },

    // ========================================
    // VENDAS
    // ========================================

    /**
     * Inicia nova venda
     */
    novaVenda() {
        if (!this.caixaAberto) {
            Toast.show('Abra o caixa antes de iniciar uma venda!', 'warning');
            return null;
        }

        this.vendaAtual = {
            id: Helpers.generateId(),
            numero: this.gerarNumeroVenda(),
            data: new Date().toISOString(),
            itens: [],
            subtotal: 0,
            desconto: 0,
            descontoTipo: 'valor', // 'valor' ou 'percentual'
            total: 0,
            formaPagamento: null,
            valorPago: 0,
            troco: 0,
            cliente: null,
            vendedor: Storage.getConfig().nomeNegocio || 'Vendedor',
            status: 'em_andamento',
            observacoes: ''
        };

        this.itensVenda = [];
        return this.vendaAtual;
    },

    /**
     * Gera número sequencial da venda
     */
    gerarNumeroVenda() {
        const caixaHoje = this.getCaixaDia(new Date());
        const numero = (caixaHoje?.vendas?.length || 0) + 1;
        return String(numero).padStart(4, '0');
    },

    /**
     * Adiciona item à venda
     */
    adicionarItem(produto, quantidade = 1) {
        if (!this.vendaAtual) {
            this.novaVenda();
        }

        // Verifica se produto já está na venda
        const itemExistente = this.itensVenda.find(i => i.produtoId === produto.id);
        
        if (itemExistente) {
            itemExistente.quantidade += quantidade;
            itemExistente.total = itemExistente.quantidade * itemExistente.precoUnitario;
        } else {
            const novoItem = {
                id: Helpers.generateId(),
                produtoId: produto.id,
                codigo: produto.codigo || '',
                nome: produto.nome,
                precoUnitario: parseFloat(produto.preco),
                quantidade: quantidade,
                total: quantidade * parseFloat(produto.preco),
                unidade: produto.unidade || 'UN'
            };
            this.itensVenda.push(novoItem);
        }

        this.calcularTotalVenda();
        
        if (this.config.somAtivo) {
            SoundFX?.play?.('success');
        }

        return this.itensVenda;
    },

    /**
     * Remove item da venda
     */
    removerItem(itemId) {
        this.itensVenda = this.itensVenda.filter(i => i.id !== itemId);
        this.calcularTotalVenda();
        return this.itensVenda;
    },

    /**
     * Altera quantidade do item
     */
    alterarQuantidade(itemId, novaQuantidade) {
        const item = this.itensVenda.find(i => i.id === itemId);
        if (item) {
            if (novaQuantidade <= 0) {
                return this.removerItem(itemId);
            }
            item.quantidade = novaQuantidade;
            item.total = item.quantidade * item.precoUnitario;
            this.calcularTotalVenda();
        }
        return this.itensVenda;
    },

    /**
     * Aplica desconto na venda
     */
    aplicarDesconto(valor, tipo = 'valor') {
        if (!this.vendaAtual) return;

        this.vendaAtual.descontoTipo = tipo;
        
        if (tipo === 'percentual') {
            this.vendaAtual.desconto = (this.vendaAtual.subtotal * valor) / 100;
        } else {
            this.vendaAtual.desconto = parseFloat(valor);
        }

        this.calcularTotalVenda();
    },

    /**
     * Calcula total da venda
     */
    calcularTotalVenda() {
        if (!this.vendaAtual) return 0;

        this.vendaAtual.subtotal = this.itensVenda.reduce((sum, item) => sum + item.total, 0);
        this.vendaAtual.total = this.vendaAtual.subtotal - (this.vendaAtual.desconto || 0);
        this.vendaAtual.itens = [...this.itensVenda];

        return this.vendaAtual.total;
    },

    /**
     * Finaliza venda
     */
    finalizarVenda(formaPagamento, valorPago, clienteId = null) {
        if (!this.vendaAtual || this.itensVenda.length === 0) {
            Toast.show('Adicione itens à venda!', 'warning');
            return null;
        }

        const total = this.vendaAtual.total;
        valorPago = parseFloat(valorPago) || total;

        if (valorPago < total && formaPagamento === 'dinheiro') {
            Toast.show('Valor pago insuficiente!', 'error');
            return null;
        }

        this.vendaAtual.formaPagamento = formaPagamento;
        this.vendaAtual.valorPago = valorPago;
        this.vendaAtual.troco = formaPagamento === 'dinheiro' ? valorPago - total : 0;
        this.vendaAtual.cliente = clienteId;
        this.vendaAtual.status = 'finalizada';
        this.vendaAtual.dataFinalizacao = new Date().toISOString();

        // Atualiza caixa do dia
        const caixaHoje = this.getCaixaDia(new Date());
        if (caixaHoje) {
            caixaHoje.vendas.push({...this.vendaAtual});
            caixaHoje.totalVendas += total;
            caixaHoje.totalDescontos += this.vendaAtual.desconto || 0;
            caixaHoje.quantidadeVendas++;

            // Atualiza por forma de pagamento
            switch (formaPagamento) {
                case 'dinheiro':
                    caixaHoje.totalDinheiro += total;
                    break;
                case 'credito':
                    caixaHoje.totalCartaoCredito += total;
                    break;
                case 'debito':
                    caixaHoje.totalCartaoDebito += total;
                    break;
                case 'pix':
                    caixaHoje.totalPix += total;
                    break;
                default:
                    caixaHoje.totalOutros += total;
            }

            this.updateCaixa(caixaHoje);
        }

        // Salva venda no histórico geral
        this.salvarVendaHistorico(this.vendaAtual);

        // Atualiza estoque
        this.atualizarEstoque(this.vendaAtual.itens);

        const vendaFinalizada = {...this.vendaAtual};
        
        // Limpa venda atual
        this.vendaAtual = null;
        this.itensVenda = [];

        Toast.show(`✅ Venda #${vendaFinalizada.numero} finalizada!`, 'success');
        
        if (this.config.somAtivo) {
            SoundFX?.play?.('complete');
        }

        return vendaFinalizada;
    },

    /**
     * Cancela venda atual
     */
    cancelarVenda() {
        if (!this.vendaAtual) {
            Toast.show('Não há venda para cancelar', 'info');
            return;
        }

        this.vendaAtual = null;
        this.itensVenda = [];
        Toast.show('Venda cancelada', 'info');
    },

    /**
     * Cancela venda já finalizada
     */
    cancelarVendaFinalizada(vendaId, motivo) {
        const caixaHoje = this.getCaixaDia(new Date());
        if (!caixaHoje) return false;

        const vendaIndex = caixaHoje.vendas.findIndex(v => v.id === vendaId);
        if (vendaIndex === -1) {
            Toast.show('Venda não encontrada!', 'error');
            return false;
        }

        const venda = caixaHoje.vendas[vendaIndex];
        
        // Reverte valores
        caixaHoje.totalVendas -= venda.total;
        caixaHoje.quantidadeCancelamentos++;

        switch (venda.formaPagamento) {
            case 'dinheiro':
                caixaHoje.totalDinheiro -= venda.total;
                break;
            case 'credito':
                caixaHoje.totalCartaoCredito -= venda.total;
                break;
            case 'debito':
                caixaHoje.totalCartaoDebito -= venda.total;
                break;
            case 'pix':
                caixaHoje.totalPix -= venda.total;
                break;
            default:
                caixaHoje.totalOutros -= venda.total;
        }

        venda.status = 'cancelada';
        venda.motivoCancelamento = motivo;
        venda.dataCancelamento = new Date().toISOString();

        this.updateCaixa(caixaHoje);

        // Devolve estoque
        this.devolverEstoque(venda.itens);

        Toast.show('Venda cancelada com sucesso!', 'success');
        return true;
    },

    /**
     * Salva venda no histórico
     */
    salvarVendaHistorico(venda) {
        const vendas = Storage.load('vendas_historico', []);
        vendas.push(venda);
        Storage.save('vendas_historico', vendas);
    },

    /**
     * Atualiza estoque após venda
     */
    atualizarEstoque(itens) {
        const produtos = this.getProdutos();
        
        itens.forEach(item => {
            const produto = produtos.find(p => p.id === item.produtoId);
            if (produto && produto.controlaEstoque) {
                produto.estoque = (produto.estoque || 0) - item.quantidade;
            }
        });

        Storage.save('produtos', produtos);
    },

    /**
     * Devolve estoque (cancelamento)
     */
    devolverEstoque(itens) {
        const produtos = this.getProdutos();
        
        itens.forEach(item => {
            const produto = produtos.find(p => p.id === item.produtoId);
            if (produto && produto.controlaEstoque) {
                produto.estoque = (produto.estoque || 0) + item.quantidade;
            }
        });

        Storage.save('produtos', produtos);
    },

    // ========================================
    // PRODUTOS
    // ========================================

    /**
     * Obtém todos os produtos
     */
    getProdutos() {
        return Storage.load('produtos', []);
    },

    /**
     * Salva produtos
     */
    saveProdutos(produtos) {
        return Storage.save('produtos', produtos);
    },

    /**
     * Adiciona produto
     */
    addProduto(produto) {
        const produtos = this.getProdutos();
        
        produto.id = produto.id || Helpers.generateId();
        produto.dataCadastro = new Date().toISOString();
        produto.codigo = produto.codigo || this.gerarCodigoProduto();
        produto.estoque = produto.estoque || 0;
        produto.estoqueMinimo = produto.estoqueMinimo || 0;
        produto.controlaEstoque = produto.controlaEstoque !== false;
        produto.ativo = true;

        produtos.push(produto);
        this.saveProdutos(produtos);
        
        Toast.show('Produto cadastrado com sucesso!', 'success');
        return produto;
    },

    /**
     * Atualiza produto
     */
    updateProduto(id, dados) {
        const produtos = this.getProdutos();
        const index = produtos.findIndex(p => p.id === id);
        
        if (index !== -1) {
            produtos[index] = { ...produtos[index], ...dados, dataAtualizacao: new Date().toISOString() };
            this.saveProdutos(produtos);
            return produtos[index];
        }
        return null;
    },

    /**
     * Remove produto
     */
    deleteProduto(id) {
        const produtos = this.getProdutos();
        const filtered = produtos.filter(p => p.id !== id);
        return this.saveProdutos(filtered);
    },

    /**
     * Busca produto por código ou nome
     */
    buscarProduto(termo) {
        const produtos = this.getProdutos();
        const termoLower = termo.toLowerCase();
        
        return produtos.filter(p => 
            p.ativo && (
                p.codigo?.toLowerCase().includes(termoLower) ||
                p.nome?.toLowerCase().includes(termoLower) ||
                p.codigoBarras?.includes(termo)
            )
        );
    },

    /**
     * Busca produto por código de barras
     */
    buscarPorCodigoBarras(codigo) {
        const produtos = this.getProdutos();
        return produtos.find(p => p.codigoBarras === codigo && p.ativo);
    },

    /**
     * Gera código automático para produto
     */
    gerarCodigoProduto() {
        const produtos = this.getProdutos();
        const ultimoCodigo = produtos
            .map(p => parseInt(p.codigo) || 0)
            .sort((a, b) => b - a)[0] || 0;
        return String(ultimoCodigo + 1).padStart(6, '0');
    },

    /**
     * Obtém categorias de produtos
     */
    getCategorias() {
        return Storage.load('categorias_produtos', [
            { id: '1', nome: 'Geral', cor: '#6366f1' },
            { id: '2', nome: 'Serviços', cor: '#22c55e' },
            { id: '3', nome: 'Produtos', cor: '#f59e0b' }
        ]);
    },

    /**
     * Importa produtos de CSV
     */
    importarCSV(csvText) {
        try {
            const linhas = csvText.trim().split('\n');
            const cabecalho = linhas[0].split(/[,;]/).map(c => c.trim().toLowerCase());
            
            const produtos = [];
            
            for (let i = 1; i < linhas.length; i++) {
                const valores = linhas[i].split(/[,;]/);
                const produto = {};
                
                cabecalho.forEach((col, index) => {
                    const valor = valores[index]?.trim() || '';
                    
                    switch(col) {
                        case 'codigo':
                        case 'código':
                            produto.codigo = valor;
                            break;
                        case 'nome':
                        case 'descrição':
                        case 'descricao':
                        case 'produto':
                            produto.nome = valor;
                            break;
                        case 'preco':
                        case 'preço':
                        case 'valor':
                            produto.preco = parseFloat(valor.replace(',', '.')) || 0;
                            break;
                        case 'estoque':
                        case 'quantidade':
                        case 'qtd':
                            produto.estoque = parseInt(valor) || 0;
                            break;
                        case 'categoria':
                            produto.categoria = valor;
                            break;
                        case 'codigobarras':
                        case 'codigo_barras':
                        case 'ean':
                            produto.codigoBarras = valor;
                            break;
                        case 'unidade':
                        case 'un':
                            produto.unidade = valor || 'UN';
                            break;
                    }
                });

                if (produto.nome) {
                    produtos.push(produto);
                }
            }

            // Adiciona produtos
            let importados = 0;
            produtos.forEach(p => {
                this.addProduto(p);
                importados++;
            });

            Toast.show(`✅ ${importados} produtos importados!`, 'success');
            return importados;

        } catch (error) {
            console.error('Erro ao importar CSV:', error);
            Toast.show('Erro ao importar arquivo CSV', 'error');
            return 0;
        }
    },

    // ========================================
    // RELATÓRIOS E BALANÇO
    // ========================================

    /**
     * Obtém caixa de uma data específica
     */
    getCaixaDia(data) {
        const caixas = this.getAllCaixas();
        const dataStr = Helpers.formatDate(data, 'iso');
        return caixas.find(c => c.data === dataStr);
    },

    /**
     * Obtém todos os caixas
     */
    getAllCaixas() {
        return Storage.load('caixas', []);
    },

    /**
     * Atualiza caixa
     */
    updateCaixa(caixa) {
        const caixas = this.getAllCaixas();
        const index = caixas.findIndex(c => c.id === caixa.id);
        
        if (index !== -1) {
            caixas[index] = caixa;
        }
        
        Storage.save('caixas', caixas);
    },

    /**
     * Balanço do dia
     */
    getBalancoDia(data = new Date()) {
        const caixa = this.getCaixaDia(data);
        
        if (!caixa) {
            return {
                data: Helpers.formatDate(data, 'iso'),
                status: 'sem_movimento',
                totalVendas: 0,
                quantidadeVendas: 0,
                ticketMedio: 0,
                formasPagamento: {}
            };
        }

        return {
            ...caixa,
            ticketMedio: caixa.quantidadeVendas > 0 ? caixa.totalVendas / caixa.quantidadeVendas : 0
        };
    },

    /**
     * Balanço da semana
     */
    getBalancoSemana(dataRef = new Date()) {
        const inicioSemana = new Date(dataRef);
        inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
        
        const balanco = {
            periodo: 'semana',
            inicio: Helpers.formatDate(inicioSemana, 'iso'),
            totalVendas: 0,
            quantidadeVendas: 0,
            totalDinheiro: 0,
            totalCartaoCredito: 0,
            totalCartaoDebito: 0,
            totalPix: 0,
            dias: []
        };

        for (let i = 0; i < 7; i++) {
            const dia = new Date(inicioSemana);
            dia.setDate(dia.getDate() + i);
            
            const balancoDia = this.getBalancoDia(dia);
            balanco.dias.push(balancoDia);
            
            balanco.totalVendas += balancoDia.totalVendas || 0;
            balanco.quantidadeVendas += balancoDia.quantidadeVendas || 0;
            balanco.totalDinheiro += balancoDia.totalDinheiro || 0;
            balanco.totalCartaoCredito += balancoDia.totalCartaoCredito || 0;
            balanco.totalCartaoDebito += balancoDia.totalCartaoDebito || 0;
            balanco.totalPix += balancoDia.totalPix || 0;
        }

        balanco.ticketMedio = balanco.quantidadeVendas > 0 ? balanco.totalVendas / balanco.quantidadeVendas : 0;
        
        return balanco;
    },

    /**
     * Balanço do mês
     */
    getBalancoMes(ano, mes) {
        const caixas = this.getAllCaixas();
        
        const caixasMes = caixas.filter(c => {
            const data = new Date(c.data);
            return data.getFullYear() === ano && data.getMonth() === mes;
        });

        const balanco = {
            periodo: 'mes',
            ano,
            mes,
            totalVendas: 0,
            quantidadeVendas: 0,
            totalDinheiro: 0,
            totalCartaoCredito: 0,
            totalCartaoDebito: 0,
            totalPix: 0,
            diasTrabalhados: caixasMes.length,
            caixas: caixasMes
        };

        caixasMes.forEach(caixa => {
            balanco.totalVendas += caixa.totalVendas || 0;
            balanco.quantidadeVendas += caixa.quantidadeVendas || 0;
            balanco.totalDinheiro += caixa.totalDinheiro || 0;
            balanco.totalCartaoCredito += caixa.totalCartaoCredito || 0;
            balanco.totalCartaoDebito += caixa.totalCartaoDebito || 0;
            balanco.totalPix += caixa.totalPix || 0;
        });

        balanco.ticketMedio = balanco.quantidadeVendas > 0 ? balanco.totalVendas / balanco.quantidadeVendas : 0;
        balanco.mediaDiaria = balanco.diasTrabalhados > 0 ? balanco.totalVendas / balanco.diasTrabalhados : 0;

        return balanco;
    },

    /**
     * Produtos mais vendidos
     */
    getProdutosMaisVendidos(limite = 10) {
        const vendas = Storage.load('vendas_historico', []);
        const produtosVendidos = {};

        vendas.forEach(venda => {
            if (venda.status === 'finalizada') {
                venda.itens?.forEach(item => {
                    if (!produtosVendidos[item.produtoId]) {
                        produtosVendidos[item.produtoId] = {
                            produtoId: item.produtoId,
                            nome: item.nome,
                            quantidade: 0,
                            total: 0
                        };
                    }
                    produtosVendidos[item.produtoId].quantidade += item.quantidade;
                    produtosVendidos[item.produtoId].total += item.total;
                });
            }
        });

        return Object.values(produtosVendidos)
            .sort((a, b) => b.quantidade - a.quantidade)
            .slice(0, limite);
    },

    /**
     * Produtos com estoque baixo
     */
    getProdutosEstoqueBaixo() {
        const produtos = this.getProdutos();
        return produtos.filter(p => 
            p.ativo && 
            p.controlaEstoque && 
            p.estoque <= p.estoqueMinimo
        );
    },

    // ========================================
    // EXPORTAÇÃO DE COMPROVANTES E BALANÇOS
    // ========================================

    /**
     * Gera comprovante de venda em texto
     */
    gerarComprovante(vendaId) {
        const vendas = Storage.load('vendas_historico', []);
        const venda = vendas.find(v => v.id === vendaId);
        
        if (!venda) return null;

        const config = Storage.get('configuracoes') || {};
        const empresa = config.nomeEmpresa || 'Meu Negócio';
        const endereco = config.endereco || '';
        const telefone = config.telefone || '';

        const formasPagamento = {
            dinheiro: 'Dinheiro',
            cartao_credito: 'Cartão de Crédito',
            cartao_debito: 'Cartão de Débito',
            pix: 'PIX'
        };

        let comprovante = '';
        comprovante += '═'.repeat(40) + '\n';
        comprovante += `        ${empresa.toUpperCase()}\n`;
        if (endereco) comprovante += `        ${endereco}\n`;
        if (telefone) comprovante += `        Tel: ${telefone}\n`;
        comprovante += '═'.repeat(40) + '\n';
        comprovante += `CUPOM NÃO FISCAL\n`;
        comprovante += `Data: ${new Date(venda.dataHora).toLocaleString('pt-BR')}\n`;
        comprovante += `Venda #${String(venda.numero || venda.id).padStart(6, '0')}\n`;
        comprovante += '─'.repeat(40) + '\n';
        comprovante += 'ITEM                    QTD   VALOR\n';
        comprovante += '─'.repeat(40) + '\n';

        venda.itens.forEach(item => {
            const nome = item.nome.substring(0, 20).padEnd(20);
            const qtd = String(item.quantidade).padStart(3);
            const valor = `R$ ${item.subtotal.toFixed(2)}`.padStart(10);
            comprovante += `${nome} ${qtd} ${valor}\n`;
        });

        comprovante += '─'.repeat(40) + '\n';
        comprovante += `SUBTOTAL:               R$ ${venda.subtotal.toFixed(2)}\n`;
        if (venda.desconto > 0) {
            comprovante += `DESCONTO:              -R$ ${venda.desconto.toFixed(2)}\n`;
        }
        comprovante += '═'.repeat(40) + '\n';
        comprovante += `TOTAL:                  R$ ${venda.total.toFixed(2)}\n`;
        comprovante += '═'.repeat(40) + '\n';
        comprovante += `Forma de Pagamento: ${formasPagamento[venda.formaPagamento]}\n`;
        if (venda.formaPagamento === 'dinheiro' && venda.valorRecebido) {
            comprovante += `Valor Recebido:         R$ ${venda.valorRecebido.toFixed(2)}\n`;
            comprovante += `Troco:                  R$ ${venda.troco.toFixed(2)}\n`;
        }
        comprovante += '─'.repeat(40) + '\n';
        comprovante += '      OBRIGADO PELA PREFERÊNCIA!\n';
        comprovante += '         Volte Sempre!\n';
        comprovante += '═'.repeat(40) + '\n';

        return comprovante;
    },

    /**
     * Exporta comprovante como arquivo TXT
     */
    exportarComprovante(vendaId) {
        const comprovante = this.gerarComprovante(vendaId);
        if (!comprovante) {
            Toast.show('Venda não encontrada', 'error');
            return;
        }

        const blob = new Blob([comprovante], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comprovante-venda-${vendaId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        Toast.show('Comprovante exportado!', 'success');
    },

    /**
     * Gera relatório de balanço em texto
     */
    gerarRelatorioBalanco(tipo = 'dia', data = new Date()) {
        let balanco;
        let periodo;

        if (tipo === 'dia') {
            balanco = this.getBalancoDia(data);
            periodo = data.toLocaleDateString('pt-BR');
        } else if (tipo === 'semana') {
            balanco = this.getBalancoSemana(data);
            const inicio = new Date(data);
            inicio.setDate(inicio.getDate() - inicio.getDay());
            const fim = new Date(inicio);
            fim.setDate(fim.getDate() + 6);
            periodo = `${inicio.toLocaleDateString('pt-BR')} a ${fim.toLocaleDateString('pt-BR')}`;
        } else if (tipo === 'mes') {
            balanco = this.getBalancoMes(data.getMonth() + 1, data.getFullYear());
            periodo = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        }

        const config = Storage.get('configuracoes') || {};
        const empresa = config.nomeEmpresa || 'Meu Negócio';

        let relatorio = '';
        relatorio += '╔' + '═'.repeat(48) + '╗\n';
        relatorio += '║' + `   RELATÓRIO DE BALANÇO - ${empresa}`.padEnd(48) + '║\n';
        relatorio += '╠' + '═'.repeat(48) + '╣\n';
        relatorio += '║' + `   Período: ${periodo}`.padEnd(48) + '║\n';
        relatorio += '║' + `   Gerado em: ${new Date().toLocaleString('pt-BR')}`.padEnd(48) + '║\n';
        relatorio += '╠' + '═'.repeat(48) + '╣\n';
        relatorio += '║' + '   RESUMO DE VENDAS'.padEnd(48) + '║\n';
        relatorio += '╟' + '─'.repeat(48) + '╢\n';
        relatorio += '║' + `   Total de Vendas:       ${balanco.quantidadeVendas || 0}`.padEnd(48) + '║\n';
        relatorio += '║' + `   Valor Total:           R$ ${(balanco.totalVendas || 0).toFixed(2)}`.padEnd(48) + '║\n';
        relatorio += '║' + `   Ticket Médio:          R$ ${(balanco.ticketMedio || 0).toFixed(2)}`.padEnd(48) + '║\n';
        relatorio += '╠' + '═'.repeat(48) + '╣\n';
        relatorio += '║' + '   FORMAS DE PAGAMENTO'.padEnd(48) + '║\n';
        relatorio += '╟' + '─'.repeat(48) + '╢\n';
        relatorio += '║' + `   💵 Dinheiro:           R$ ${(balanco.totalDinheiro || 0).toFixed(2)}`.padEnd(48) + '║\n';
        relatorio += '║' + `   💳 Cartão Crédito:     R$ ${(balanco.totalCartaoCredito || 0).toFixed(2)}`.padEnd(48) + '║\n';
        relatorio += '║' + `   💳 Cartão Débito:      R$ ${(balanco.totalCartaoDebito || 0).toFixed(2)}`.padEnd(48) + '║\n';
        relatorio += '║' + `   📱 PIX:                R$ ${(balanco.totalPix || 0).toFixed(2)}`.padEnd(48) + '║\n';
        relatorio += '╚' + '═'.repeat(48) + '╝\n';

        return relatorio;
    },

    /**
     * Exporta balanço como arquivo TXT
     */
    exportarBalanco(tipo = 'dia', data = new Date()) {
        const relatorio = this.gerarRelatorioBalanco(tipo, data);
        
        const blob = new Blob([relatorio], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `balanco-${tipo}-${data.toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        Toast.show('Balanço exportado!', 'success');
    },

    /**
     * Exporta balanço como CSV
     */
    exportarBalancoCSV(tipo = 'dia', data = new Date()) {
        const vendas = Storage.load('vendas_historico', []);
        
        // Filtrar vendas pelo período
        let vendasFiltradas = vendas.filter(v => {
            const dataVenda = new Date(v.dataHora);
            if (tipo === 'dia') {
                return dataVenda.toDateString() === data.toDateString();
            } else if (tipo === 'semana') {
                const inicio = new Date(data);
                inicio.setDate(inicio.getDate() - inicio.getDay());
                const fim = new Date(inicio);
                fim.setDate(fim.getDate() + 6);
                return dataVenda >= inicio && dataVenda <= fim;
            } else if (tipo === 'mes') {
                return dataVenda.getMonth() === data.getMonth() && 
                       dataVenda.getFullYear() === data.getFullYear();
            }
            return false;
        });

        // Gerar CSV
        let csv = 'ID;Data/Hora;Itens;Subtotal;Desconto;Total;Forma Pagamento;Status\n';
        
        vendasFiltradas.forEach(v => {
            const itens = v.itens?.map(i => `${i.nome}(${i.quantidade})`).join(', ') || '';
            csv += `${v.id};${new Date(v.dataHora).toLocaleString('pt-BR')};${itens};${v.subtotal.toFixed(2)};${v.desconto.toFixed(2)};${v.total.toFixed(2)};${v.formaPagamento};${v.status}\n`;
        });

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vendas-${tipo}-${data.toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        Toast.show('CSV exportado!', 'success');
    }
};

// API amigável para uso no HTML
const CaixaAPI = {
    init: () => CaixaModule.init(),
    
    // Estado
    caixaAberto: () => CaixaModule.caixaAberto,
    getVendaAtual: () => CaixaModule.vendaAtual,
    getStatusCaixa: () => CaixaModule.getCaixaDia(new Date()),
    
    // Caixa
    abrirCaixa: (valor, operador) => CaixaModule.abrirCaixa(valor, operador),
    fecharCaixa: (valor) => CaixaModule.fecharCaixa(valor),
    
    // Venda
    venda: {
        adicionarItem: (produtoId, qtd) => {
            CaixaModule.novaVenda();
            const produto = CaixaModule.getProdutoById(produtoId);
            if (!produto) return { sucesso: false, erro: 'Produto não encontrado' };
            CaixaModule.adicionarItem(produtoId, qtd);
            return { sucesso: true };
        },
        removerItem: (produtoId) => {
            const item = CaixaModule.itensVenda.find(i => i.produtoId === produtoId);
            if (item) CaixaModule.removerItem(item.id);
        },
        atualizarQuantidade: (produtoId, novaQtd) => {
            const item = CaixaModule.itensVenda.find(i => i.produtoId === produtoId);
            if (item) CaixaModule.alterarQuantidade(item.id, novaQtd);
        },
        aplicarDesconto: (valor) => CaixaModule.aplicarDesconto(valor),
        cancelar: () => CaixaModule.cancelarVenda(),
        finalizar: (forma, valorRecebido) => {
            const venda = CaixaModule.finalizarVenda(forma, valorRecebido);
            if (venda) {
                return { sucesso: true, vendaId: venda.id };
            }
            return { sucesso: false, erro: 'Erro ao finalizar venda' };
        }
    },
    
    // Produtos
    produtos: {
        listar: () => CaixaModule.getProdutos(),
        buscar: (id) => CaixaModule.getProdutoById(id),
        adicionar: (p) => CaixaModule.addProduto(p),
        atualizar: (id, p) => CaixaModule.updateProduto(id, p),
        remover: (id) => CaixaModule.removeProduto(id),
        importarCSV: (csv) => CaixaModule.importarProdutosCSV(csv)
    },
    
    // Balanço
    getBalancoDia: (data) => CaixaModule.getBalancoDia(data),
    getBalancoSemana: (data) => CaixaModule.getBalancoSemana(data),
    getBalancoMes: (mes, ano) => CaixaModule.getBalancoMes(mes, ano),
    
    // Exportação
    gerarComprovante: (vendaId) => CaixaModule.gerarComprovante(vendaId),
    exportarComprovante: (vendaId) => CaixaModule.exportarComprovante(vendaId),
    exportarBalanco: (tipo, data) => CaixaModule.exportarBalanco(tipo, data),
    exportarBalancoCSV: (tipo, data) => CaixaModule.exportarBalancoCSV(tipo, data)
};

// Exporta para uso global
window.CaixaModule = CaixaModule;
window.Caixa = CaixaAPI;
