/**
 * VALIDATORS - Agenda Pro Negócios
 * Validação de dados e formulários
 */

const Validators = {
    /**
     * Valida se campo está preenchido
     * @param {string} value - Valor a validar
     * @returns {Object} Resultado da validação
     */
    required(value) {
        const isValid = value !== null && value !== undefined && String(value).trim() !== '';
        return {
            valid: isValid,
            message: isValid ? '' : 'Este campo é obrigatório'
        };
    },

    /**
     * Valida tamanho mínimo
     * @param {string} value - Valor a validar
     * @param {number} min - Tamanho mínimo
     * @returns {Object} Resultado da validação
     */
    minLength(value, min) {
        const isValid = String(value).length >= min;
        return {
            valid: isValid,
            message: isValid ? '' : `Mínimo de ${min} caracteres`
        };
    },

    /**
     * Valida tamanho máximo
     * @param {string} value - Valor a validar
     * @param {number} max - Tamanho máximo
     * @returns {Object} Resultado da validação
     */
    maxLength(value, max) {
        const isValid = String(value).length <= max;
        return {
            valid: isValid,
            message: isValid ? '' : `Máximo de ${max} caracteres`
        };
    },

    /**
     * Valida formato de email
     * @param {string} value - Email a validar
     * @returns {Object} Resultado da validação
     */
    email(value) {
        if (!value) return { valid: true, message: '' }; // Email opcional
        
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = regex.test(value);
        return {
            valid: isValid,
            message: isValid ? '' : 'Email inválido'
        };
    },

    /**
     * Valida telefone brasileiro
     * @param {string} value - Telefone a validar
     * @returns {Object} Resultado da validação
     */
    phone(value) {
        if (!value) return { valid: true, message: '' }; // Opcional
        
        const cleaned = value.replace(/\D/g, '');
        const isValid = cleaned.length >= 10 && cleaned.length <= 11;
        return {
            valid: isValid,
            message: isValid ? '' : 'Telefone inválido (use DDD + número)'
        };
    },

    /**
     * Valida valor numérico positivo
     * @param {any} value - Valor a validar
     * @returns {Object} Resultado da validação
     */
    positiveNumber(value) {
        const num = parseFloat(value);
        const isValid = !isNaN(num) && num >= 0;
        return {
            valid: isValid,
            message: isValid ? '' : 'Valor deve ser um número positivo'
        };
    },

    /**
     * Valida valor monetário
     * @param {any} value - Valor a validar
     * @returns {Object} Resultado da validação
     */
    currency(value) {
        // Remove formatação
        const cleaned = String(value).replace(/[R$\s.]/g, '').replace(',', '.');
        const num = parseFloat(cleaned);
        const isValid = !isNaN(num) && num >= 0;
        return {
            valid: isValid,
            message: isValid ? '' : 'Valor monetário inválido'
        };
    },

    /**
     * Valida data
     * @param {string} value - Data a validar
     * @returns {Object} Resultado da validação
     */
    date(value) {
        if (!value) return { valid: false, message: 'Data é obrigatória' };
        
        const date = new Date(value);
        const isValid = !isNaN(date.getTime());
        return {
            valid: isValid,
            message: isValid ? '' : 'Data inválida'
        };
    },

    /**
     * Valida se data não é passada
     * @param {string} value - Data a validar
     * @returns {Object} Resultado da validação
     */
    futureDate(value) {
        if (!value) return { valid: false, message: 'Data é obrigatória' };
        
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const isValid = date >= today;
        return {
            valid: isValid,
            message: isValid ? '' : 'Data não pode ser no passado'
        };
    },

    /**
     * Valida hora
     * @param {string} value - Hora a validar (HH:MM)
     * @returns {Object} Resultado da validação
     */
    time(value) {
        if (!value) return { valid: false, message: 'Hora é obrigatória' };
        
        const regex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
        const isValid = regex.test(value);
        return {
            valid: isValid,
            message: isValid ? '' : 'Hora inválida (use HH:MM)'
        };
    },

    /**
     * Valida CPF
     * @param {string} value - CPF a validar
     * @returns {Object} Resultado da validação
     */
    cpf(value) {
        if (!value) return { valid: true, message: '' }; // Opcional
        
        const cleaned = value.replace(/\D/g, '');
        
        if (cleaned.length !== 11) {
            return { valid: false, message: 'CPF deve ter 11 dígitos' };
        }

        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cleaned)) {
            return { valid: false, message: 'CPF inválido' };
        }

        // Validação dos dígitos verificadores
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleaned.charAt(i)) * (10 - i);
        }
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleaned.charAt(9))) {
            return { valid: false, message: 'CPF inválido' };
        }

        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cleaned.charAt(i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleaned.charAt(10))) {
            return { valid: false, message: 'CPF inválido' };
        }

        return { valid: true, message: '' };
    },

    /**
     * Valida CNPJ
     * @param {string} value - CNPJ a validar
     * @returns {Object} Resultado da validação
     */
    cnpj(value) {
        if (!value) return { valid: true, message: '' }; // Opcional
        
        const cleaned = value.replace(/\D/g, '');
        
        if (cleaned.length !== 14) {
            return { valid: false, message: 'CNPJ deve ter 14 dígitos' };
        }

        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cleaned)) {
            return { valid: false, message: 'CNPJ inválido' };
        }

        // Validação dos dígitos verificadores
        let size = cleaned.length - 2;
        let numbers = cleaned.substring(0, size);
        const digits = cleaned.substring(size);
        let sum = 0;
        let pos = size - 7;

        for (let i = size; i >= 1; i--) {
            sum += numbers.charAt(size - i) * pos--;
            if (pos < 2) pos = 9;
        }

        let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(0))) {
            return { valid: false, message: 'CNPJ inválido' };
        }

        size = size + 1;
        numbers = cleaned.substring(0, size);
        sum = 0;
        pos = size - 7;

        for (let i = size; i >= 1; i--) {
            sum += numbers.charAt(size - i) * pos--;
            if (pos < 2) pos = 9;
        }

        result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(1))) {
            return { valid: false, message: 'CNPJ inválido' };
        }

        return { valid: true, message: '' };
    },

    /**
     * Valida formulário completo
     * @param {Object} formData - Dados do formulário
     * @param {Object} rules - Regras de validação
     * @returns {Object} Resultado com erros por campo
     */
    validateForm(formData, rules) {
        const errors = {};
        let isValid = true;

        Object.keys(rules).forEach(field => {
            const fieldRules = rules[field];
            const value = formData[field];

            for (const rule of fieldRules) {
                let result;

                if (typeof rule === 'string') {
                    // Regra simples (nome do validador)
                    result = this[rule] ? this[rule](value) : { valid: true, message: '' };
                } else if (typeof rule === 'object') {
                    // Regra com parâmetros
                    const [validatorName, ...params] = Object.entries(rule)[0];
                    result = this[validatorName] ? this[validatorName](value, ...params) : { valid: true, message: '' };
                }

                if (!result.valid) {
                    errors[field] = result.message;
                    isValid = false;
                    break;
                }
            }
        });

        return { valid: isValid, errors };
    },

    /**
     * Aplica validação visual em campo
     * @param {HTMLElement} input - Elemento input
     * @param {Object} validation - Resultado da validação
     */
    applyFieldValidation(input, validation) {
        const formGroup = input.closest('.form-group');
        const existingError = formGroup?.querySelector('.form-error');

        // Remove erro anterior
        if (existingError) {
            existingError.remove();
        }
        input.classList.remove('input-error');

        // Aplica novo erro se inválido
        if (!validation.valid && validation.message) {
            input.classList.add('input-error');
            
            if (formGroup) {
                const errorEl = document.createElement('span');
                errorEl.className = 'form-error';
                errorEl.textContent = validation.message;
                formGroup.appendChild(errorEl);
            }
        }
    },

    /**
     * Limpa validações visuais do formulário
     * @param {HTMLFormElement} form - Elemento form
     */
    clearFormValidation(form) {
        const errors = form.querySelectorAll('.form-error');
        errors.forEach(el => el.remove());

        const inputs = form.querySelectorAll('.input-error');
        inputs.forEach(input => input.classList.remove('input-error'));
    }
};

// Congela objeto para prevenir modificações
Object.freeze(Validators);
