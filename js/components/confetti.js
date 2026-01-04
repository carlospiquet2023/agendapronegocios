/**
 * ═══════════════════════════════════════════════════════════════
 * CONFETTI CELEBRATION - Agenda Pro Negócios
 * Sistema de celebração com confetti para conquistas
 * ═══════════════════════════════════════════════════════════════
 */

const Confetti = {
    // Configurações
    defaults: {
        particleCount: 100,
        spread: 70,
        startVelocity: 30,
        decay: 0.95,
        gravity: 1,
        colors: ['#6366f1', '#8b5cf6', '#ec4899', '#22c55e', '#f59e0b', '#3b82f6'],
        shapes: ['square', 'circle'],
        scalar: 1,
        zIndex: 100000,
        duration: 3000
    },

    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,

    /**
     * Inicializa canvas
     */
    init() {
        if (this.canvas) return;

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'confetti-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: ${this.defaults.zIndex};
        `;
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
        console.log('🎉 Confetti System inicializado');
    },

    /**
     * Redimensiona canvas
     */
    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    /**
     * Lança confetti!
     */
    launch(options = {}) {
        this.init();
        
        const config = { ...this.defaults, ...options };
        
        // Ponto de origem
        const originX = (options.x ?? 0.5) * this.canvas.width;
        const originY = (options.y ?? 0.5) * this.canvas.height;

        // Cria partículas
        for (let i = 0; i < config.particleCount; i++) {
            this.particles.push(this.createParticle(originX, originY, config));
        }

        // Som de celebração
        SoundFX?.play?.('celebration');
        HapticFeedback?.success?.();

        // Inicia animação se não estiver rodando
        if (!this.animationId) {
            this.animate();
        }

        // Para após duração
        setTimeout(() => this.stop(), config.duration);
    },

    /**
     * Cria uma partícula
     */
    createParticle(x, y, config) {
        const angle = (Math.random() * config.spread - config.spread / 2) * Math.PI / 180;
        const velocity = config.startVelocity * (0.5 + Math.random() * 0.5);
        
        return {
            x,
            y,
            vx: Math.sin(angle) * velocity,
            vy: -Math.cos(angle) * velocity - Math.random() * 3,
            color: config.colors[Math.floor(Math.random() * config.colors.length)],
            shape: config.shapes[Math.floor(Math.random() * config.shapes.length)],
            size: (4 + Math.random() * 6) * config.scalar,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            decay: config.decay,
            gravity: config.gravity,
            opacity: 1
        };
    },

    /**
     * Anima partículas
     */
    animate() {
        if (!this.ctx || this.particles.length === 0) {
            this.animationId = null;
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles = this.particles.filter(p => {
            // Física
            p.vy += p.gravity * 0.3;
            p.vx *= p.decay;
            p.vy *= p.decay;
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            p.opacity -= 0.01;

            // Remove se fora da tela ou invisível
            if (p.y > this.canvas.height + 50 || p.opacity <= 0) {
                return false;
            }

            // Desenha
            this.drawParticle(p);
            return true;
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    },

    /**
     * Desenha uma partícula
     */
    drawParticle(p) {
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation * Math.PI / 180);
        this.ctx.globalAlpha = p.opacity;
        this.ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }

        this.ctx.restore();
    },

    /**
     * Para animação
     */
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.particles = [];
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    },

    // ==========================================
    // EFEITOS PRÉ-DEFINIDOS
    // ==========================================

    /**
     * Chuva de confetti do topo
     */
    rain(options = {}) {
        const width = window.innerWidth;
        
        // Lança de vários pontos no topo
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.launch({
                    x: (0.1 + Math.random() * 0.8),
                    y: -0.05,
                    particleCount: 30,
                    spread: 100,
                    startVelocity: 10,
                    gravity: 0.8,
                    ...options
                });
            }, i * 100);
        }
    },

    /**
     * Explosão central
     */
    burst(options = {}) {
        this.launch({
            x: 0.5,
            y: 0.5,
            particleCount: 150,
            spread: 180,
            startVelocity: 45,
            ...options
        });
    },

    /**
     * Canhões laterais
     */
    cannons(options = {}) {
        // Esquerda
        this.launch({
            x: 0,
            y: 1,
            particleCount: 60,
            spread: 60,
            startVelocity: 50,
            ...options
        });

        // Direita
        setTimeout(() => {
            this.launch({
                x: 1,
                y: 1,
                particleCount: 60,
                spread: 60,
                startVelocity: 50,
                ...options
            });
        }, 200);
    },

    /**
     * Fogos de artifício
     */
    fireworks(count = 5) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.launch({
                    x: 0.2 + Math.random() * 0.6,
                    y: 0.2 + Math.random() * 0.4,
                    particleCount: 40,
                    spread: 360,
                    startVelocity: 20 + Math.random() * 20,
                    gravity: 0.5
                });
            }, i * 400);
        }
    },

    /**
     * Celebração completa (usa todas)
     */
    celebrate() {
        this.cannons();
        setTimeout(() => this.burst(), 500);
        setTimeout(() => this.rain(), 1000);
    }
};

// Exporta globalmente
window.Confetti = Confetti;

// Inicializa ao carregar
document.addEventListener('DOMContentLoaded', () => Confetti.init());
