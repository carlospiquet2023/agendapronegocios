/**
 * ═══════════════════════════════════════════════════════════════
 * SOUND FX SYSTEM - Agenda Pro Negócios
 * Sistema de efeitos sonoros e feedback auditivo
 * ═══════════════════════════════════════════════════════════════
 */

const SoundFX = {
    // Configurações
    enabled: true,
    volume: 0.3,
    
    // Cache de áudios
    sounds: {},

    // Definições de sons (data URIs base64 para sons curtos)
    definitions: {
        // Som de clique suave
        click: {
            frequency: 800,
            duration: 50,
            type: 'sine',
            volume: 0.2
        },
        // Som de sucesso
        success: {
            frequency: 880,
            duration: 150,
            type: 'sine',
            volume: 0.3,
            sequence: [880, 1100, 1320]
        },
        // Som de erro
        error: {
            frequency: 200,
            duration: 200,
            type: 'sawtooth',
            volume: 0.2
        },
        // Som de notificação
        notification: {
            frequency: 587.33, // D5
            duration: 200,
            type: 'sine',
            volume: 0.4,
            sequence: [587.33, 880]
        },
        // Som de swoosh (arrasto)
        swoosh: {
            frequency: 400,
            duration: 100,
            type: 'sine',
            volume: 0.15,
            sweep: true
        },
        // Som de pop (aparição)
        pop: {
            frequency: 600,
            duration: 80,
            type: 'sine',
            volume: 0.25
        },
        // Som de delete
        delete: {
            frequency: 300,
            duration: 150,
            type: 'triangle',
            volume: 0.2,
            sequence: [300, 200, 100]
        },
        // Som de toggle
        toggle: {
            frequency: 700,
            duration: 60,
            type: 'sine',
            volume: 0.2
        },
        // Som de celebração
        celebration: {
            frequency: 523.25, // C5
            duration: 100,
            type: 'sine',
            volume: 0.3,
            sequence: [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
        },
        // Som de typing
        typing: {
            frequency: 1200,
            duration: 30,
            type: 'square',
            volume: 0.05
        }
    },

    // Audio Context (lazy loaded)
    _audioContext: null,

    /**
     * Obtém ou cria Audio Context
     */
    get audioContext() {
        if (!this._audioContext) {
            this._audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this._audioContext;
    },

    /**
     * Inicializa o sistema
     */
    init() {
        // Carrega preferência do usuário
        const saved = Storage.get('soundSettings');
        if (saved) {
            this.enabled = saved.enabled ?? true;
            this.volume = saved.volume ?? 0.3;
        }

        // Ativa audio context no primeiro clique (necessário para browsers)
        document.addEventListener('click', () => {
            if (this._audioContext?.state === 'suspended') {
                this._audioContext.resume();
            }
        }, { once: true });

        console.log('🔊 Sound FX System inicializado');
    },

    /**
     * Toca um som
     */
    play(soundName, options = {}) {
        if (!this.enabled) return;
        
        const def = this.definitions[soundName];
        if (!def) {
            console.warn(`Som "${soundName}" não encontrado`);
            return;
        }

        try {
            // Resume context se suspenso
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            // Se tem sequência de notas
            if (def.sequence) {
                this.playSequence(def.sequence, def.duration, def.type, def.volume * this.volume);
            } 
            // Se é um sweep
            else if (def.sweep) {
                this.playSweep(def.frequency, def.duration, def.type, def.volume * this.volume);
            }
            // Som simples
            else {
                this.playTone(def.frequency, def.duration, def.type, def.volume * this.volume);
            }
        } catch (e) {
            console.warn('Erro ao tocar som:', e);
        }
    },

    /**
     * Toca uma nota simples
     */
    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        // Envelope suave
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration / 1000);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration / 1000 + 0.1);
    },

    /**
     * Toca uma sequência de notas
     */
    playSequence(frequencies, duration, type = 'sine', volume = 0.3) {
        const ctx = this.audioContext;
        const interval = duration / 1000;

        frequencies.forEach((freq, i) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

            const startTime = ctx.currentTime + (i * interval);
            const endTime = startTime + interval;

            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, endTime);

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.start(startTime);
            oscillator.stop(endTime + 0.1);
        });
    },

    /**
     * Toca um sweep de frequência
     */
    playSweep(startFreq, duration, type = 'sine', volume = 0.3) {
        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(startFreq, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(startFreq * 2, ctx.currentTime + duration / 1000);

        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration / 1000);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration / 1000 + 0.1);
    },

    /**
     * Ativa/desativa sons
     */
    toggle() {
        this.enabled = !this.enabled;
        this.save();
        
        if (this.enabled) {
            this.play('toggle');
        }
        
        return this.enabled;
    },

    /**
     * Define volume
     */
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        this.save();
    },

    /**
     * Salva configurações
     */
    save() {
        Storage.set('soundSettings', {
            enabled: this.enabled,
            volume: this.volume
        });
    },

    /**
     * Retorna estado atual
     */
    getState() {
        return {
            enabled: this.enabled,
            volume: this.volume
        };
    }
};

/**
 * ═══════════════════════════════════════════════════════════════
 * HAPTIC FEEDBACK SYSTEM
 * Sistema de feedback tátil para dispositivos móveis
 * ═══════════════════════════════════════════════════════════════
 */

const HapticFeedback = {
    enabled: true,
    
    /**
     * Inicializa o sistema
     */
    init() {
        // Verifica suporte
        this.supported = 'vibrate' in navigator;
        
        // Carrega preferência
        const saved = Storage.get('hapticSettings');
        if (saved) {
            this.enabled = saved.enabled ?? true;
        }

        console.log('📳 Haptic Feedback System:', this.supported ? 'Suportado' : 'Não suportado');
    },

    /**
     * Vibração leve (tap)
     */
    light() {
        if (!this.enabled || !this.supported) return;
        navigator.vibrate(10);
    },

    /**
     * Vibração média (seleção)
     */
    medium() {
        if (!this.enabled || !this.supported) return;
        navigator.vibrate(20);
    },

    /**
     * Vibração forte (erro/alerta)
     */
    heavy() {
        if (!this.enabled || !this.supported) return;
        navigator.vibrate(50);
    },

    /**
     * Vibração de sucesso (padrão)
     */
    success() {
        if (!this.enabled || !this.supported) return;
        navigator.vibrate([10, 50, 10, 50, 20]);
    },

    /**
     * Vibração de erro (padrão)
     */
    error() {
        if (!this.enabled || !this.supported) return;
        navigator.vibrate([50, 100, 50]);
    },

    /**
     * Vibração de notificação
     */
    notification() {
        if (!this.enabled || !this.supported) return;
        navigator.vibrate([20, 100, 20, 100, 40]);
    },

    /**
     * Padrão customizado
     */
    pattern(pattern) {
        if (!this.enabled || !this.supported) return;
        navigator.vibrate(pattern);
    },

    /**
     * Toggle on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        this.save();
        
        if (this.enabled) {
            this.light();
        }
        
        return this.enabled;
    },

    /**
     * Salva preferência
     */
    save() {
        Storage.set('hapticSettings', { enabled: this.enabled });
    }
};

// Auto-inicializa
document.addEventListener('DOMContentLoaded', () => {
    SoundFX.init();
    HapticFeedback.init();
});

// Exporta globalmente
window.SoundFX = SoundFX;
window.HapticFeedback = HapticFeedback;
