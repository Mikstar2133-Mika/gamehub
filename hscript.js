// Mobile/Tablet optimiertes JavaScript für mikajo.de Game Hub
class MobileBackgroundAnimation {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.touch = { x: 0, y: 0, active: false };
        this.animationId = null;
        this.isLowPowerMode = false;
        this.init();
        this.animate();
        this.setupEventListeners();
    }

    init() {
        // Canvas erstellen - Performance optimiert für Mobile
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        const backgroundElement = document.getElementById('background-animation');
        backgroundElement.appendChild(this.canvas);
        
        // Canvas-Styling
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        
        // Performance Check für Low-Power Modus
        this.checkPerformance();
        
        this.resize();
        this.createParticles();
    }

    checkPerformance() {
        // Einfacher Performance-Check für Mobile Geräte
        const deviceMemory = navigator.deviceMemory || 4;
        const connectionSpeed = navigator.connection?.effectiveType || '4g';
        
        // Low-Power Modus bei schwächeren Geräten
        if (deviceMemory < 4 || connectionSpeed === 'slow-2g' || connectionSpeed === '2g') {
            this.isLowPowerMode = true;
            console.log('📱 Low-Power Modus aktiviert für bessere Performance');
        }
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        // Canvas-Größe für Retina-Displays optimieren
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.ctx.scale(dpr, dpr);
    }

    createParticles() {
        this.particles = [];
        // Weniger Partikel für bessere Performance auf Mobile
        const baseCount = this.isLowPowerMode ? 15 : 25;
        const particleCount = Math.min(baseCount, Math.floor((window.innerWidth * window.innerHeight) / 25000));
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.4 + 0.2
            });
        }
    }

    setupEventListeners() {
        // Touch-Events für Mobile
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                this.touch.x = e.touches[0].clientX;
                this.touch.y = e.touches[0].clientY;
                this.touch.active = true;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.touch.x = e.touches[0].clientX;
                this.touch.y = e.touches[0].clientY;
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            this.touch.active = false;
        }, { passive: true });

        // Maus-Events für Tablets mit Maus-Support
        document.addEventListener('mousemove', (e) => {
            if (!this.touch.active) {
                this.touch.x = e.clientX;
                this.touch.y = e.clientY;
            }
        }, { passive: true });

        // Resize-Handler mit Debouncing
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.resize();
                this.createParticles();
            }, 250);
        });

        // Visibility API für Performance-Optimierung
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
            } else {
                this.animate();
            }
        });
    }

    animate() {
        if (document.hidden) return;

        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        // Partikel aktualisieren und zeichnen
        this.particles.forEach((particle, index) => {
            // Touch-Interaktion (weniger intensiv als Desktop)
            if (this.touch.active || !this.isLowPowerMode) {
                const dx = this.touch.x - particle.x;
                const dy = this.touch.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const force = (100 - distance) / 100;
                    particle.vx += (dx / distance) * force * 0.005;
                    particle.vy += (dy / distance) * force * 0.005;
                }
            }
            
            // Partikel bewegen
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Geschwindigkeit dämpfen
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            
            // Grenzen überprüfen
            if (particle.x < 0 || particle.x > window.innerWidth) {
                particle.vx *= -0.5;
                particle.x = Math.max(0, Math.min(window.innerWidth, particle.x));
            }
            if (particle.y < 0 || particle.y > window.innerHeight) {
                particle.vy *= -0.5;
                particle.y = Math.max(0, Math.min(window.innerHeight, particle.y));
            }
            
            // Partikel zeichnen
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(88, 166, 255, ${particle.opacity})`;
            this.ctx.fill();
            
            // Verbindungslinien nur im High-Performance Modus
            if (!this.isLowPowerMode) {
                this.particles.slice(index + 1).forEach(otherParticle => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 80) {
                        const opacity = (80 - distance) / 80 * 0.15;
                        this.ctx.beginPath();
                        this.ctx.moveTo(particle.x, particle.y);
                        this.ctx.lineTo(otherParticle.x, otherParticle.y);
                        this.ctx.strokeStyle = `rgba(88, 166, 255, ${opacity})`;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.stroke();
                    }
                });
            }
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// Mobile-optimierte Karten-Animationen
class MobileCardAnimations {
    constructor() {
        this.setupCardAnimations();
        this.setupTouchFeedback();
    }

    setupCardAnimations() {
        const cards = document.querySelectorAll('.game-card');
        
        cards.forEach((card, index) => {
            // Staggered Animation beim Laden (schneller für Mobile)
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    setupTouchFeedback() {
        const cards = document.querySelectorAll('.game-card');
        
        cards.forEach(card => {
            // Touch-Feedback mit Haptic (falls verfügbar)
            card.addEventListener('touchstart', () => {
                if (navigator.vibrate) {
                    navigator.vibrate(10); // Kurze Vibration
                }
            }, { passive: true });

            // Visual Touch-Feedback
            card.addEventListener('touchstart', () => {
                card.style.transform = 'scale(0.98)';
            }, { passive: true });

            card.addEventListener('touchend', () => {
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                }, 100);
            }, { passive: true });
        });
    }
}

// Performance Monitor für Mobile
class MobilePerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        this.monitor();
    }

    monitor() {
        const now = performance.now();
        this.frameCount++;
        
        if (now - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
            this.frameCount = 0;
            this.lastTime = now;
            
            // Warnung bei schlechter Performance
            if (this.fps < 30) {
                console.warn(`⚠️ Niedrige FPS erkannt: ${this.fps}fps`);
            }
        }
        
        requestAnimationFrame(() => this.monitor());
    }
}

// App initialisieren
document.addEventListener('DOMContentLoaded', () => {
    new MobileBackgroundAnimation();
    new MobileCardAnimations();
    
    // Performance Monitor nur in Development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        new MobilePerformanceMonitor();
    }
    
    console.log('📱 mikajo.de Game Hub Mobile geladen!');
    
    // Service Worker für bessere Performance (optional)
    if ('serviceWorker' in navigator) {
        console.log('💾 Service Worker Support verfügbar');
    }
});

// Mobile Overlay-Menü
const menuToggle = document.getElementById('menu-toggle');
const menuOverlay = document.getElementById('mobile-menu-overlay');
const menuClose = document.getElementById('menu-close');

if (menuToggle && menuOverlay && menuClose) {
    menuToggle.addEventListener('click', () => {
        menuOverlay.classList.add('open');
    });
    menuClose.addEventListener('click', () => {
        menuOverlay.classList.remove('open');
    });
    // Optional: Schließe Menü beim Klick außerhalb der Links
    menuOverlay.addEventListener('click', (e) => {
        if (e.target === menuOverlay) {
            menuOverlay.classList.remove('open');
        }
    });
}