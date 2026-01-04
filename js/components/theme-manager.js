/**
 * SISTEMA DE TEMAS - Agenda Pro Negócios
 * Gerencia temas, modo escuro/claro e preferências
 */

const ThemeManager = {
    currentTheme: 'dark',
    themes: ['dark', 'light', 'ocean', 'purple', 'nature', 'sunset', 'pink'],

    /**
     * Inicializa o gerenciador de temas
     */
    init() {
        // Carrega tema salvo ou detecta preferência do sistema
        const savedTheme = localStorage.getItem('agenda-pro-theme');
        
        if (savedTheme && this.themes.includes(savedTheme)) {
            this.setTheme(savedTheme, false);
        } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            this.setTheme('light', false);
        } else {
            this.setTheme('dark', false);
        }

        // Escuta mudanças de preferência do sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('agenda-pro-theme')) {
                this.setTheme(e.matches ? 'dark' : 'light', false);
            }
        });

        // Inicializa controles de tema
        this.initControls();
    },

    /**
     * Define o tema
     * @param {string} theme - Nome do tema
     * @param {boolean} save - Se deve salvar a preferência
     */
    setTheme(theme, save = true) {
        if (!this.themes.includes(theme)) return;

        // Adiciona classe de transição
        document.body.classList.add('theme-transitioning');

        // Remove tema anterior e aplica novo
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;

        // Atualiza meta theme-color
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            const colors = {
                dark: '#1e293b',
                light: '#ffffff',
                ocean: '#132f4c',
                purple: '#2d1b4e',
                nature: '#14331a',
                sunset: '#3d1f0d',
                pink: '#3d1430'
            };
            metaTheme.content = colors[theme] || colors.dark;
        }

        // Atualiza controles
        this.updateControls();

        // Salva preferência
        if (save) {
            localStorage.setItem('agenda-pro-theme', theme);
        }

        // Remove classe de transição
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.body.classList.remove('theme-transitioning');
            });
        });

        // Dispara evento customizado
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    },

    /**
     * Alterna entre claro e escuro
     */
    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    },

    /**
     * Vai para o próximo tema
     */
    nextTheme() {
        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.setTheme(this.themes[nextIndex]);
    },

    /**
     * Inicializa controles de tema
     */
    initControls() {
        // Toggle dark/light
        document.querySelectorAll('.theme-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => this.toggle());
        });

        // Seletor de tema
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                if (theme) this.setTheme(theme);
            });
        });
    },

    /**
     * Atualiza estado visual dos controles
     */
    updateControls() {
        // Atualiza opções de tema
        document.querySelectorAll('.theme-option').forEach(option => {
            const isActive = option.dataset.theme === this.currentTheme;
            option.classList.toggle('active', isActive);
        });

        // Atualiza toggles
        document.querySelectorAll('.theme-toggle').forEach(toggle => {
            toggle.setAttribute('aria-checked', this.currentTheme === 'light');
        });
    },

    /**
     * Obtém cor CSS do tema atual
     * @param {string} varName - Nome da variável CSS
     * @returns {string} Valor da cor
     */
    getColor(varName) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(varName).trim();
    },

    /**
     * Renderiza seletor de temas
     * @param {string} containerId - ID do container
     */
    renderSelector(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const themeNames = {
            dark: 'Escuro',
            light: 'Claro',
            ocean: 'Oceano',
            purple: 'Roxo',
            nature: 'Natureza',
            sunset: 'Pôr do Sol',
            pink: 'Rosa'
        };

        container.innerHTML = `
            <div class="theme-switcher">
                <span class="theme-switcher__label">🎨 Tema</span>
                <div class="theme-options">
                    ${this.themes.map(theme => `
                        <button class="theme-option ${theme === this.currentTheme ? 'active' : ''}" 
                                data-theme="${theme}"
                                title="${themeNames[theme]}"
                                aria-label="Tema ${themeNames[theme]}">
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Re-inicializa controles
        this.initControls();
    }
};

// Inicializa quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});

// Exporta
window.ThemeManager = ThemeManager;
