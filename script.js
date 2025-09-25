// Animierter Hintergrund mit Maus-Interaktion
class BackgroundAnimation {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.init();
        this.animate();
        this.setupEventListeners();
    }

    init() {
        // Canvas erstellen und zum Background-Element hinzufügen
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        const backgroundElement = document.getElementById('background-animation');
        backgroundElement.appendChild(this.canvas);
        
        // Canvas-Styling
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        
        this.resize();
        this.createParticles();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 15000);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }

    setupEventListeners() {
        // Maus-Bewegung verfolgen
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Fenster-Größenänderung
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Partikel aktualisieren und zeichnen
        this.particles.forEach((particle, index) => {
            // Maus-Interaktion
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                const force = (150 - distance) / 150;
                particle.vx += (dx / distance) * force * 0.01;
                particle.vy += (dy / distance) * force * 0.01;
            }
            
            // Partikel bewegen
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Geschwindigkeit dämpfen
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            
            // Grenzen überprüfen
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx *= -0.5;
                particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy *= -0.5;
                particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
            }
            
            // Partikel zeichnen
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(88, 166, 255, ${particle.opacity})`;
            this.ctx.fill();
            
            // Verbindungslinien zu nahen Partikeln
            this.particles.slice(index + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const opacity = (100 - distance) / 100 * 0.2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.strokeStyle = `rgba(88, 166, 255, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Revolutionary Card Animations mit Maus-Tracking
class RevolutionaryCardAnimations {
    constructor() {
        this.setupCardAnimations();
        this.setupMouseTracking();
    }

    setupCardAnimations() {
        const cards = document.querySelectorAll('.game-card');
        
        cards.forEach((card, index) => {
            // Staggered Animation beim Laden
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px) scale(0.9)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.320, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
            }, index * 150);
            
            // Subtile Hover-Effekte - nur bei direkter Mausinteraktion
            card.addEventListener('mouseenter', () => {
                // Keine extremen Effekte mehr
            });
            
            card.addEventListener('mouseleave', () => {
                this.resetCardEffects(card);
            });
        });
    }

    setupMouseTracking() {
        const cards = document.querySelectorAll('.game-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                card.style.setProperty('--mouse-x', `${x}%`);
                card.style.setProperty('--mouse-y', `${y}%`);
                
                // Subtile 3D Drehung zum Mauszeiger
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                const rotateX = (mouseY - centerY) / centerY * -3;
                const rotateY = (mouseX - centerX) / centerX * 3;
                
                card.style.transform = `
                    translateY(-8px) 
                    scale(1.02) 
                    perspective(1000px) 
                    rotateX(${rotateX}deg) 
                    rotateY(${rotateY}deg)
                `;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.setProperty('--mouse-x', '50%');
                card.style.setProperty('--mouse-y', '50%');
                card.style.transform = '';
            });
        });
    }

    createMagicEffect(card) {
        // Magic Circle Effect
        const magicCircle = document.createElement('div');
        magicCircle.style.position = 'absolute';
        magicCircle.style.width = '150px';
        magicCircle.style.height = '150px';
        magicCircle.style.border = '2px solid rgba(88, 166, 255, 0.6)';
        magicCircle.style.borderRadius = '50%';
        magicCircle.style.pointerEvents = 'none';
        magicCircle.style.zIndex = '999';
        magicCircle.style.mixBlendMode = 'screen';
        
        const rect = card.getBoundingClientRect();
        magicCircle.style.left = (rect.left + rect.width/2 - 75) + 'px';
        magicCircle.style.top = (rect.top + rect.height/2 - 75) + 'px';
        
        document.body.appendChild(magicCircle);
        
        // Magic Circle Animation
        magicCircle.animate([
            { 
                opacity: 0, 
                transform: 'scale(0) rotate(0deg)',
                borderColor: 'rgba(88, 166, 255, 0.8)'
            },
            { 
                opacity: 1, 
                transform: 'scale(1) rotate(180deg)',
                borderColor: 'rgba(121, 192, 255, 0.6)'
            },
            { 
                opacity: 0, 
                transform: 'scale(1.5) rotate(360deg)',
                borderColor: 'rgba(165, 168, 255, 0.4)'
            }
        ], {
            duration: 1200,
            easing: 'cubic-bezier(0.23, 1, 0.320, 1)'
        }).onfinish = () => {
            magicCircle.remove();
        };
    }

    createFloatingParticles(card) {
        // Erstelle 8 schwebende Partikel
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.position = 'absolute';
                particle.style.width = '6px';
                particle.style.height = '6px';
                particle.style.background = `hsl(${200 + Math.random() * 60}, 70%, 60%)`;
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '1000';
                particle.style.boxShadow = '0 0 10px currentColor';
                
                const rect = card.getBoundingClientRect();
                const startX = rect.left + Math.random() * rect.width;
                const startY = rect.top + rect.height;
                
                particle.style.left = startX + 'px';
                particle.style.top = startY + 'px';
                
                document.body.appendChild(particle);
                
                // Floating Animation
                particle.animate([
                    { 
                        opacity: 0, 
                        transform: 'translateY(0px) scale(0)',
                    },
                    { 
                        opacity: 1, 
                        transform: `translateY(-${50 + Math.random() * 50}px) translateX(${(Math.random() - 0.5) * 40}px) scale(1)`,
                    },
                    { 
                        opacity: 0, 
                        transform: `translateY(-${100 + Math.random() * 50}px) translateX(${(Math.random() - 0.5) * 80}px) scale(0)`,
                    }
                ], {
                    duration: 2000 + Math.random() * 1000,
                    easing: 'cubic-bezier(0.23, 1, 0.320, 1)'
                }).onfinish = () => {
                    particle.remove();
                };
            }, i * 80);
        }
    }

    resetCardEffects(card) {
        // Sanft zurücksetzen
        card.style.transition = 'all 0.6s cubic-bezier(0.23, 1, 0.320, 1)';
    }
}

// App initialisieren
document.addEventListener('DOMContentLoaded', () => {
    new BackgroundAnimation();
    new RevolutionaryCardAnimations();
    
    console.log('🎮 mikajo.de Game Hub geladen! ✨ Revolutionary Edition');
});