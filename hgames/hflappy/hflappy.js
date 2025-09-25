// Flappy Bird Mobile Game - Touch optimiert
class FlappyBirdMobile {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreEl = document.getElementById('score');
        this.highscoreEl = document.getElementById('highscore');
        this.startBtn = document.getElementById('start-btn');
        this.diffSelect = document.getElementById('difficulty-select');
        this.touchInstructions = document.getElementById('touch-instructions');
        
        // Game state
        this.gameRunning = false;
        this.gameStarted = false;
        this.score = 0;
        this.highscore = localStorage.getItem('flappy-mobile-highscore') || 0;
        this.difficulty = 'medium';
        this.showingInstructions = false;
        
        // Mobile-optimierte Bird properties für Standard Canvas
        this.bird = {
            x: 80,
            y: 250,
            width: 35,
            height: 25,
            velocity: 0,
            gravity: 0.5,
            jumpPower: -10,
            rotation: 0
        };
        
        // Mobile-optimierte Pipes für Standard Canvas
        this.pipes = [];
        this.pipeWidth = 70;
        this.pipeGap = 180;
        this.pipeSpeed = 2.5;
        this.lastPipeTime = 0;
        this.pipeInterval = 1800; // ms between pipes
        
        // Background
        this.clouds = [];
        this.groundOffset = 0;
        
        this.initGame();
        this.initTouchControls();
        this.gameLoop();
        this.updateDisplay();
        this.createClouds();
    }
    
    initGame() {
        this.bird.y = 250;
        this.bird.velocity = 0;
        this.pipes = [];
        this.score = 0;
        this.lastPipeTime = 0;
        this.updateDifficulty();
    }
    
    updateDifficulty() {
        // Mobile-angepasste Schwierigkeitsgrade für Standard Canvas
        const difficulties = {
            easy: { pipeSpeed: 2, pipeInterval: 2500, pipeGap: 220, gravity: 0.4 },
            medium: { pipeSpeed: 2.5, pipeInterval: 2000, pipeGap: 180, gravity: 0.5 },
            hard: { pipeSpeed: 3, pipeInterval: 1700, pipeGap: 150, gravity: 0.6 },
            extreme: { pipeSpeed: 3.5, pipeInterval: 1500, pipeGap: 120, gravity: 0.7 }
        };
        
        const diff = difficulties[this.difficulty];
        this.pipeSpeed = diff.pipeSpeed;
        this.pipeInterval = diff.pipeInterval;
        this.pipeGap = diff.pipeGap;
        this.bird.gravity = diff.gravity;
    }
    
    initTouchControls() {
        // Touch Events für Mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput();
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Verhindert Scrollen
        }, { passive: false });
        
        // Click Events für Desktop-Fallback
        this.canvas.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleInput();
        });
        
        // Keyboard Events
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                this.handleInput();
            }
        });
        
        // Start button
        this.startBtn.addEventListener('click', () => {
            this.resetGame();
        });
        
        // Difficulty selector
        this.diffSelect.addEventListener('change', () => {
            this.difficulty = this.diffSelect.value;
            this.updateDifficulty();
        });
        
        // Verhindere Kontext-Menü auf langem Drücken
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    handleInput() {
        if (!this.gameStarted) {
            this.startGame();
            this.hideInstructions();
        } else if (this.gameRunning) {
            this.jump();
        } else {
            this.resetGame();
        }
    }
    
    showInstructions() {
        if (!this.showingInstructions && !this.gameStarted) {
            this.touchInstructions.style.display = 'block';
            this.showingInstructions = true;
            setTimeout(() => {
                this.hideInstructions();
            }, 3000);
        }
    }
    
    hideInstructions() {
        this.touchInstructions.style.display = 'none';
        this.showingInstructions = false;
    }
    
    jump() {
        this.bird.velocity = this.bird.jumpPower;
        this.bird.rotation = -8;
        
        // Touch Feedback (Haptic Vibration falls verfügbar)
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
    
    startGame() {
        this.gameStarted = true;
        this.gameRunning = true;
        this.initGame();
        this.hideInstructions();
    }
    
    resetGame() {
        this.gameStarted = false;
        this.gameRunning = false;
        this.initGame();
        this.startGame();
    }
    
    createClouds() {
        this.clouds = [];
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * 150 + 30,
                size: Math.random() * 40 + 25,
                speed: Math.random() * 0.3 + 0.1
            });
        }
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Update bird
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Bird rotation based on velocity (sanft)
        this.bird.rotation = Math.min(Math.max(this.bird.velocity * 1.5, -15), 45);
        
        // Ground collision für Standard Canvas
        if (this.bird.y + this.bird.height >= this.canvas.height - 80) {
            this.gameOver();
            return;
        }
        
        // Ceiling collision
        if (this.bird.y <= 0) {
            this.bird.y = 0;
            this.bird.velocity = 0;
        }
        
        // Create pipes
        const currentTime = Date.now();
        if (currentTime - this.lastPipeTime > this.pipeInterval) {
            this.createPipe();
            this.lastPipeTime = currentTime;
        }
        
        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;
            
            // Remove off-screen pipes
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
                continue;
            }
            
            // Score when passing pipe
            if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
                this.score++;
                pipe.scored = true;
                this.updateDisplay();
                
                // Score Feedback
                if (navigator.vibrate) {
                    navigator.vibrate([20, 10, 20]);
                }
            }
            
            // Collision detection
            if (this.checkCollision(this.bird, pipe)) {
                this.gameOver();
                return;
            }
        }
        
        // Update clouds
        for (const cloud of this.clouds) {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.size < 0) {
                cloud.x = this.canvas.width;
                cloud.y = Math.random() * 150 + 30;
            }
        }
        
        // Update ground
        this.groundOffset -= this.pipeSpeed;
        if (this.groundOffset <= -30) {
            this.groundOffset = 0;
        }
    }
    
    createPipe() {
        const minHeight = 60;
        const maxHeight = this.canvas.height - this.pipeGap - minHeight - 80; // 80 for ground
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        this.pipes.push({
            x: this.canvas.width,
            topHeight: topHeight,
            bottomY: topHeight + this.pipeGap,
            bottomHeight: this.canvas.height - 80 - (topHeight + this.pipeGap),
            scored: false
        });
    }
    
    checkCollision(bird, pipe) {
        const birdLeft = bird.x;
        const birdRight = bird.x + bird.width;
        const birdTop = bird.y;
        const birdBottom = bird.y + bird.height;
        
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + this.pipeWidth;
        
        // Check if bird is in pipe's x range
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Check collision with top pipe
            if (birdTop < pipe.topHeight) {
                return true;
            }
            // Check collision with bottom pipe
            if (birdBottom > pipe.bottomY) {
                return true;
            }
        }
        
        return false;
    }
    
    gameOver() {
        this.gameRunning = false;
        
        // Game Over Vibration
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 200]);
        }
        
        // Update highscore
        if (this.score > this.highscore) {
            this.highscore = this.score;
            localStorage.setItem('flappy-mobile-highscore', this.highscore);
            this.updateDisplay();
        }
    }
    
    render() {
        // Clear canvas with sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(1, '#98d8e8');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw clouds
        this.ctx.fillStyle = '#ffffff';
        for (const cloud of this.clouds) {
            this.drawCloud(cloud.x, cloud.y, cloud.size);
        }
        
        // Draw pipes
        this.ctx.fillStyle = '#2ea043';
        this.ctx.strokeStyle = '#1a7f37';
        this.ctx.lineWidth = 2;
        
        for (const pipe of this.pipes) {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            this.ctx.strokeRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            
            // Top pipe cap
            this.ctx.fillRect(pipe.x - 8, pipe.topHeight - 20, this.pipeWidth + 16, 20);
            this.ctx.strokeRect(pipe.x - 8, pipe.topHeight - 20, this.pipeWidth + 16, 20);
            
            // Bottom pipe
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, pipe.bottomHeight);
            this.ctx.strokeRect(pipe.x, pipe.bottomY, this.pipeWidth, pipe.bottomHeight);
            
            // Bottom pipe cap
            this.ctx.fillRect(pipe.x - 8, pipe.bottomY, this.pipeWidth + 16, 20);
            this.ctx.strokeRect(pipe.x - 8, pipe.bottomY, this.pipeWidth + 16, 20);
        }
        
        // Draw ground für Standard Canvas
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.canvas.height - 80, this.canvas.width, 80);
        
        // Ground pattern
        this.ctx.fillStyle = '#A0522D';
        for (let x = this.groundOffset; x < this.canvas.width; x += 40) {
            this.ctx.fillRect(x, this.canvas.height - 80, 20, 80);
        }
        
        // Draw bird
        this.ctx.save();
        this.ctx.translate(this.bird.x + this.bird.width/2, this.bird.y + this.bird.height/2);
        this.ctx.rotate(this.bird.rotation * Math.PI / 180);
        
        // Bird body
        this.ctx.fillStyle = '#ffd700';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.bird.width/2, this.bird.height/2, 0, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Wing
        this.ctx.fillStyle = '#58a6ff';
        this.ctx.beginPath();
        this.ctx.ellipse(-3, -1, 8, 5, 0, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Beak
        this.ctx.fillStyle = '#f85149';
        this.ctx.beginPath();
        this.ctx.moveTo(this.bird.width/2 - 3, 0);
        this.ctx.lineTo(this.bird.width/2 + 6, -2);
        this.ctx.lineTo(this.bird.width/2 - 3, 3);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Eye
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(3, -3, 4, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(4, -2, 2, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.restore();
        
        // Game messages
        if (!this.gameStarted) {
            this.drawMessage('👆 Tippe zum Starten', this.canvas.width/2, this.canvas.height/2, '18px');
            this.drawMessage('Touch-Steuerung: Überall antippen', this.canvas.width/2, this.canvas.height/2 + 30, '12px');
        } else if (!this.gameRunning) {
            this.drawMessage('GAME OVER', this.canvas.width/2, this.canvas.height/2, '24px', '#f85149');
            this.drawMessage(`Punkte: ${this.score} | Highscore: ${this.highscore}`, this.canvas.width/2, this.canvas.height/2 + 35, '14px');
            this.drawMessage('👆 Tippe für neues Spiel', this.canvas.width/2, this.canvas.height/2 + 55, '12px');
        }
    }
    
    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.5, 0, 2 * Math.PI);
        this.ctx.arc(x + size * 0.4, y, size * 0.4, 0, 2 * Math.PI);
        this.ctx.arc(x + size * 0.8, y, size * 0.3, 0, 2 * Math.PI);
        this.ctx.arc(x + size * 0.2, y - size * 0.3, size * 0.3, 0, 2 * Math.PI);
        this.ctx.arc(x + size * 0.6, y - size * 0.2, size * 0.3, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    drawMessage(text, x, y, fontSize = '16px', color = '#ffffff') {
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        const metrics = this.ctx.measureText(text);
        const textWidth = metrics.width || text.length * 8;
        this.ctx.fillRect(x - textWidth/2 - 10, y - 15, textWidth + 20, 30);
        
        this.ctx.fillStyle = color;
        this.ctx.font = `bold ${fontSize} Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, x, y + 5);
    }
    
    updateDisplay() {
        this.scoreEl.textContent = this.score;
        this.highscoreEl.textContent = this.highscore;
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize mobile game when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Verhindere Zoom auf Double-Tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Starte Spiel
    new FlappyBirdMobile();
});