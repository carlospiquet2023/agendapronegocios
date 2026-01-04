/**
 * HELPERS - Agenda Pro Negócios
 * Funções utilitárias globais
 */

const Helpers = {
    /**
     * Gera um ID único
     * @returns {string} UUID v4
     */
    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * Formata data para exibição
     * @param {string|Date} date - Data a ser formatada
     * @param {string} format - Formato desejado (short, long, time, datetime)
     * @returns {string} Data formatada
     */
    formatDate(date, format = 'short') {
        const d = new Date(date);
        
        if (isNaN(d.getTime())) {
            return 'Data inválida';
        }

        const options = {
            short: { day: '2-digit', month: '2-digit', year: 'numeric' },
            long: { day: '2-digit', month: 'long', year: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit' },
            datetime: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' },
            iso: null
        };

        if (format === 'iso') {
            return d.toISOString().split('T')[0];
        }

        return d.toLocaleDateString('pt-BR', options[format] || options.short);
    },

    /**
     * Formata valor para moeda brasileira
     * @param {number} value - Valor numérico
     * @returns {string} Valor formatado
     */
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    },

    /**
     * Formata número de telefone
     * @param {string} phone - Número de telefone
     * @returns {string} Telefone formatado
     */
    formatPhone(phone) {
        if (!phone) return '';
        
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length === 11) {
            return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,7)}-${cleaned.slice(7)}`;
        } else if (cleaned.length === 10) {
            return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,6)}-${cleaned.slice(6)}`;
        }
        
        return phone;
    },

    /**
     * Remove formatação de telefone
     * @param {string} phone - Telefone formatado
     * @returns {string} Apenas números
     */
    cleanPhone(phone) {
        return phone ? phone.replace(/\D/g, '') : '';
    },

    /**
     * Capitaliza primeira letra de cada palavra
     * @param {string} str - String a ser capitalizada
     * @returns {string} String capitalizada
     */
    capitalize(str) {
        if (!str) return '';
        return str.toLowerCase().replace(/(?:^|\s)\S/g, a => a.toUpperCase());
    },

    /**
     * Trunca texto com reticências
     * @param {string} str - Texto original
     * @param {number} maxLength - Tamanho máximo
     * @returns {string} Texto truncado
     */
    truncate(str, maxLength = 50) {
        if (!str || str.length <= maxLength) return str;
        return str.slice(0, maxLength).trim() + '...';
    },

    /**
     * Debounce para limitar chamadas de função
     * @param {Function} func - Função a ser executada
     * @param {number} wait - Tempo de espera em ms
     * @returns {Function} Função com debounce
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle para limitar execuções por tempo
     * @param {Function} func - Função a ser executada
     * @param {number} limit - Intervalo mínimo em ms
     * @returns {Function} Função com throttle
     */
    throttle(func, limit = 300) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Obtém parâmetros da URL
     * @param {string} param - Nome do parâmetro
     * @returns {string|null} Valor do parâmetro
     */
    getUrlParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    /**
     * Calcula diferença entre datas
     * @param {Date} date1 - Primeira data
     * @param {Date} date2 - Segunda data
     * @returns {Object} Diferença em dias, horas, minutos
     */
    dateDiff(date1, date2) {
        const diff = Math.abs(new Date(date1) - new Date(date2));
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60)
        };
    },

    /**
     * Verifica se é hoje
     * @param {string|Date} date - Data a verificar
     * @returns {boolean}
     */
    isToday(date) {
        const today = new Date();
        const check = new Date(date);
        return today.toDateString() === check.toDateString();
    },

    /**
     * Verifica se data já passou
     * @param {string|Date} date - Data a verificar
     * @returns {boolean}
     */
    isPast(date) {
        return new Date(date) < new Date();
    },

    /**
     * Adiciona dias a uma data
     * @param {Date} date - Data base
     * @param {number} days - Dias a adicionar
     * @returns {Date} Nova data
     */
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    /**
     * Obtém nome do mês
     * @param {number} month - Número do mês (0-11)
     * @returns {string} Nome do mês
     */
    getMonthName(month) {
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return months[month];
    },

    /**
     * Obtém nome do dia da semana
     * @param {number} day - Número do dia (0-6)
     * @returns {string} Nome do dia
     */
    getDayName(day) {
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        return days[day];
    },

    /**
     * Ordena array de objetos por propriedade
     * @param {Array} array - Array a ser ordenado
     * @param {string} prop - Propriedade para ordenação
     * @param {string} order - Ordem (asc/desc)
     * @returns {Array} Array ordenado
     */
    sortBy(array, prop, order = 'asc') {
        return [...array].sort((a, b) => {
            if (a[prop] < b[prop]) return order === 'asc' ? -1 : 1;
            if (a[prop] > b[prop]) return order === 'asc' ? 1 : -1;
            return 0;
        });
    },

    /**
     * Agrupa array por propriedade
     * @param {Array} array - Array a ser agrupado
     * @param {string} prop - Propriedade para agrupamento
     * @returns {Object} Objeto com grupos
     */
    groupBy(array, prop) {
        return array.reduce((acc, item) => {
            const key = item[prop];
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
    },

    /**
     * Filtra array por termo de busca
     * @param {Array} array - Array de objetos
     * @param {string} term - Termo de busca
     * @param {Array} fields - Campos para busca
     * @returns {Array} Array filtrado
     */
    filterBySearch(array, term, fields) {
        if (!term) return array;
        
        const lowerTerm = term.toLowerCase();
        return array.filter(item => 
            fields.some(field => 
                String(item[field] || '').toLowerCase().includes(lowerTerm)
            )
        );
    },

    /**
     * Escapa HTML para prevenir XSS
     * @param {string} str - String a ser escapada
     * @returns {string} String segura
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Gera cor aleatória
     * @returns {string} Cor hexadecimal
     */
    randomColor() {
        const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    /**
     * Obtém iniciais do nome
     * @param {string} name - Nome completo
     * @returns {string} Iniciais
     */
    getInitials(name) {
        if (!name) return '??';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    },

    /**
     * Copia texto para clipboard
     * @param {string} text - Texto a copiar
     * @returns {Promise<boolean>} Sucesso da operação
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback para navegadores antigos
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                return true;
            } catch (e) {
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }
    },

    /**
     * Verifica se está em dispositivo móvel
     * @returns {boolean}
     */
    isMobile() {
        return window.innerWidth <= 768;
    },

    /**
     * Verifica suporte a Service Worker
     * @returns {boolean}
     */
    supportsSW() {
        return 'serviceWorker' in navigator;
    },

    /**
     * Verifica suporte a LocalStorage
     * @returns {boolean}
     */
    supportsStorage() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
};

// Congela objeto para prevenir modificações
Object.freeze(Helpers);
