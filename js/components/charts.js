/**
 * GRÁFICOS E VISUALIZAÇÕES - Agenda Pro Negócios
 * Charts em CSS puro + Canvas helpers
 */

const Charts = {
    /**
     * Cria gráfico de barras
     * @param {string} containerId - ID do container
     * @param {Array} data - Array de {label, value, color?}
     * @param {Object} options - Opções do gráfico
     */
    bar(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const maxValue = Math.max(...data.map(d => d.value));
        const {
            height = 200,
            showValues = true,
            showLabels = true,
            animate = true,
            colors = ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
        } = options;

        container.innerHTML = `
            <div class="chart-bar" style="height: ${height}px;">
                <div class="chart-bar__bars">
                    ${data.map((item, i) => {
                        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                        const color = item.color || colors[i % colors.length];
                        return `
                            <div class="chart-bar__item ${animate ? 'animate' : ''}" style="--delay: ${i * 100}ms">
                                <div class="chart-bar__bar" 
                                     style="height: ${percentage}%; background: ${color};"
                                     title="${item.label}: ${item.value}">
                                    ${showValues ? `<span class="chart-bar__value">${this.formatValue(item.value)}</span>` : ''}
                                </div>
                                ${showLabels ? `<span class="chart-bar__label">${item.label}</span>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Cria gráfico de rosca (donut)
     * @param {string} containerId - ID do container
     * @param {Array} data - Array de {label, value, color}
     * @param {Object} options - Opções do gráfico
     */
    donut(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const total = data.reduce((sum, d) => sum + d.value, 0);
        const {
            size = 180,
            thickness = 30,
            showLegend = true,
            showCenter = true,
            centerText = '',
            colors = ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
        } = options;

        // Calcula os segmentos
        let currentAngle = 0;
        const segments = data.map((item, i) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            const angle = (percentage / 100) * 360;
            const segment = {
                ...item,
                percentage,
                startAngle: currentAngle,
                endAngle: currentAngle + angle,
                color: item.color || colors[i % colors.length]
            };
            currentAngle += angle;
            return segment;
        });

        // Gera gradiente cônico
        const conicGradient = segments.map(s => 
            `${s.color} ${s.startAngle}deg ${s.endAngle}deg`
        ).join(', ');

        container.innerHTML = `
            <div class="chart-donut" style="width: ${size}px;">
                <div class="chart-donut__ring" 
                     style="width: ${size}px; height: ${size}px; 
                            background: conic-gradient(${conicGradient});
                            --thickness: ${thickness}px;">
                    ${showCenter ? `
                        <div class="chart-donut__center">
                            <span class="chart-donut__total">${this.formatValue(total)}</span>
                            <span class="chart-donut__label">${centerText || 'Total'}</span>
                        </div>
                    ` : ''}
                </div>
                ${showLegend ? `
                    <div class="chart-donut__legend">
                        ${segments.map(s => `
                            <div class="chart-donut__legend-item">
                                <span class="chart-donut__legend-color" style="background: ${s.color}"></span>
                                <span class="chart-donut__legend-label">${s.label}</span>
                                <span class="chart-donut__legend-value">${s.percentage.toFixed(1)}%</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    },

    /**
     * Cria gráfico de linha simples
     * @param {string} containerId - ID do container
     * @param {Array} data - Array de {label, value}
     * @param {Object} options - Opções do gráfico
     */
    line(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const maxValue = Math.max(...data.map(d => d.value));
        const minValue = Math.min(...data.map(d => d.value));
        const range = maxValue - minValue || 1;

        const {
            height = 150,
            color = '#6366f1',
            fillColor = 'rgba(99, 102, 241, 0.1)',
            showDots = true,
            showArea = true,
            animate = true
        } = options;

        // Calcula pontos
        const points = data.map((item, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((item.value - minValue) / range) * 100;
            return { x, y, ...item };
        });

        // Gera path SVG
        const linePath = points.map((p, i) => 
            `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
        ).join(' ');

        const areaPath = `${linePath} L 100 100 L 0 100 Z`;

        container.innerHTML = `
            <div class="chart-line" style="height: ${height}px;">
                <svg class="chart-line__svg ${animate ? 'animate' : ''}" viewBox="0 0 100 100" preserveAspectRatio="none">
                    ${showArea ? `
                        <path class="chart-line__area" d="${areaPath}" fill="${fillColor}" />
                    ` : ''}
                    <path class="chart-line__path" d="${linePath}" 
                          stroke="${color}" fill="none" stroke-width="2" 
                          vector-effect="non-scaling-stroke" />
                    ${showDots ? points.map(p => `
                        <circle class="chart-line__dot" cx="${p.x}" cy="${p.y}" r="4" 
                                fill="${color}" vector-effect="non-scaling-stroke">
                            <title>${p.label}: ${p.value}</title>
                        </circle>
                    `).join('') : ''}
                </svg>
                <div class="chart-line__labels">
                    ${points.filter((_, i) => i % Math.ceil(points.length / 6) === 0 || i === points.length - 1).map(p => `
                        <span class="chart-line__label">${p.label}</span>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Cria barra de progresso animada
     * @param {string} containerId - ID do container
     * @param {number} value - Valor atual
     * @param {number} max - Valor máximo
     * @param {Object} options - Opções
     */
    progress(containerId, value, max, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const percentage = Math.min(100, (value / max) * 100);
        const {
            color = '#6366f1',
            height = 8,
            showLabel = true,
            animate = true
        } = options;

        container.innerHTML = `
            <div class="chart-progress">
                ${showLabel ? `
                    <div class="chart-progress__header">
                        <span class="chart-progress__value">${this.formatValue(value)}</span>
                        <span class="chart-progress__max">/ ${this.formatValue(max)}</span>
                    </div>
                ` : ''}
                <div class="chart-progress__track" style="height: ${height}px;">
                    <div class="chart-progress__bar ${animate ? 'animate' : ''}" 
                         style="width: ${percentage}%; background: ${color};"></div>
                </div>
            </div>
        `;
    },

    /**
     * Cria sparkline (mini gráfico inline)
     * @param {string} containerId - ID do container
     * @param {Array} values - Array de números
     * @param {Object} options - Opções
     */
    sparkline(containerId, values, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const max = Math.max(...values);
        const min = Math.min(...values);
        const range = max - min || 1;

        const {
            width = 100,
            height = 30,
            color = '#6366f1',
            fillColor = 'rgba(99, 102, 241, 0.2)'
        } = options;

        const points = values.map((v, i) => {
            const x = (i / (values.length - 1)) * 100;
            const y = 100 - ((v - min) / range) * 100;
            return `${x},${y}`;
        }).join(' ');

        const areaPoints = `0,100 ${points} 100,100`;

        container.innerHTML = `
            <svg class="sparkline" width="${width}" height="${height}" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polygon points="${areaPoints}" fill="${fillColor}" />
                <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke" />
            </svg>
        `;
    },

    /**
     * Formata valores
     */
    formatValue(value) {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
        }
        if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K';
        }
        return value.toLocaleString('pt-BR');
    },

    /**
     * Atualiza gráfico com animação
     */
    update(containerId, type, data, options) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.classList.add('chart-updating');
        
        setTimeout(() => {
            this[type](containerId, data, options);
            container.classList.remove('chart-updating');
        }, 300);
    }
};

// Estilos CSS para os gráficos (adicionar ao CSS)
const chartStyles = `
/* ============================================
   GRÁFICO DE BARRAS
   ============================================ */

.chart-bar {
    display: flex;
    flex-direction: column;
}

.chart-bar__bars {
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    height: 100%;
    gap: 8px;
    padding: 0 8px;
}

.chart-bar__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    max-width: 60px;
}

.chart-bar__item.animate .chart-bar__bar {
    animation: growUp 0.6s ease-out forwards;
    animation-delay: var(--delay, 0ms);
}

@keyframes growUp {
    from { 
        height: 0 !important; 
        opacity: 0;
    }
    to { 
        opacity: 1;
    }
}

.chart-bar__bar {
    width: 100%;
    min-height: 4px;
    border-radius: 4px 4px 0 0;
    position: relative;
    transition: height 0.3s ease;
}

.chart-bar__value {
    position: absolute;
    top: -24px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-primary);
    white-space: nowrap;
}

.chart-bar__label {
    margin-top: 8px;
    font-size: 11px;
    color: var(--color-text-muted);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

/* ============================================
   GRÁFICO DONUT
   ============================================ */

.chart-donut {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.chart-donut__ring {
    border-radius: 50%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.chart-donut__ring::before {
    content: '';
    position: absolute;
    inset: var(--thickness, 30px);
    background: var(--color-bg-secondary);
    border-radius: 50%;
}

.chart-donut__center {
    position: relative;
    z-index: 1;
    text-align: center;
}

.chart-donut__total {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: var(--color-text-primary);
}

.chart-donut__label {
    font-size: 12px;
    color: var(--color-text-muted);
}

.chart-donut__legend {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
}

.chart-donut__legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
}

.chart-donut__legend-color {
    width: 12px;
    height: 12px;
    border-radius: 3px;
}

.chart-donut__legend-label {
    color: var(--color-text-secondary);
}

.chart-donut__legend-value {
    color: var(--color-text-muted);
    font-weight: 500;
}

/* ============================================
   GRÁFICO DE LINHA
   ============================================ */

.chart-line {
    position: relative;
}

.chart-line__svg {
    width: 100%;
    height: calc(100% - 24px);
}

.chart-line__svg.animate .chart-line__path {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: drawLine 1.5s ease-out forwards;
}

@keyframes drawLine {
    to { stroke-dashoffset: 0; }
}

.chart-line__svg.animate .chart-line__area {
    opacity: 0;
    animation: fadeIn 0.5s ease-out 1s forwards;
}

.chart-line__svg.animate .chart-line__dot {
    opacity: 0;
    animation: popIn 0.3s ease-out forwards;
    animation-delay: calc(var(--index, 0) * 0.1s + 1s);
}

@keyframes popIn {
    from { 
        opacity: 0;
        transform: scale(0);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.chart-line__dot {
    cursor: pointer;
    transition: r 0.2s ease;
}

.chart-line__dot:hover {
    r: 6;
}

.chart-line__labels {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
}

.chart-line__label {
    font-size: 11px;
    color: var(--color-text-muted);
}

/* ============================================
   BARRA DE PROGRESSO
   ============================================ */

.chart-progress__header {
    display: flex;
    align-items: baseline;
    gap: 4px;
    margin-bottom: 8px;
}

.chart-progress__value {
    font-size: 20px;
    font-weight: 700;
    color: var(--color-text-primary);
}

.chart-progress__max {
    font-size: 14px;
    color: var(--color-text-muted);
}

.chart-progress__track {
    background: var(--color-bg-tertiary);
    border-radius: 100px;
    overflow: hidden;
}

.chart-progress__bar {
    height: 100%;
    border-radius: 100px;
    transition: width 0.5s ease-out;
}

.chart-progress__bar.animate {
    animation: progressGrow 1s ease-out;
}

@keyframes progressGrow {
    from { width: 0; }
}

/* ============================================
   SPARKLINE
   ============================================ */

.sparkline {
    display: block;
}

/* ============================================
   ESTADOS
   ============================================ */

.chart-updating {
    opacity: 0.5;
    pointer-events: none;
}
`;

// Injeta estilos se não existirem
if (!document.getElementById('chart-styles')) {
    const style = document.createElement('style');
    style.id = 'chart-styles';
    style.textContent = chartStyles;
    document.head.appendChild(style);
}

// Exporta
window.Charts = Charts;
