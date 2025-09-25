// Flappy Bird Game
class FlappyBirdGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreEl = document.getElementById('score');
        this.highscoreEl = document.getElementById('highscore');
        this.startBtn = document.getElementById('start-btn');
        this.diffSelect = document.getElementById('difficulty-select');
        
        // Game state
        this.gameRunning = false;
        this.gameStarted = false;
        this.score = 0;
        this.highscore = localStorage.getItem('flappy-highscore') || 0;
        this.difficulty = 'medium';
        
        // Bird properties
        this.bird = {
            x: 200,
            y: 500,
            width: 60,
            height: 40,
            velocity: 0,
            gravity: 0.7,
            jumpPower: -15,
            rotation: 0
        };
        
        // Pipes
        this.pipes = [];
        this.pipeWidth = 140;
        this.pipeGap = 350;
        this.pipeSpeed = 4;
        this.lastPipeTime = 0;
        this.pipeInterval = 1500; // ms between pipes
        
        // Background
        this.clouds = [];
        this.groundOffset = 0;
        
        this.initGame();
        this.initEventListeners();
        this.gameLoop();
        this.updateDisplay();
        this.createClouds();
    }
    
    initGame() {
        this.bird.y = 500;
        this.bird.velocity = 0;
        this.pipes = [];
        this.score = 0;
        this.lastPipeTime = 0;
        this.updateDifficulty();
    }
    
    updateDifficulty() {
        const difficulties = {
            easy: { pipeSpeed: 3, pipeInterval: 2800, pipeGap: 400, gravity: 0.6 },
            medium: { pipeSpeed: 4, pipeInterval: 2200, pipeGap: 350, gravity: 0.7 },
            hard: { pipeSpeed: 5, pipeInterval: 1900, pipeGap: 300, gravity: 0.8 },
            extreme: { pipeSpeed: 6, pipeInterval: 1600, pipeGap: 250, gravity: 0.9 }
        };
        
        const diff = difficulties[this.difficulty];
        this.pipeSpeed = diff.pipeSpeed;
        this.pipeInterval = diff.pipeInterval;
        this.pipeGap = diff.pipeGap;
        this.bird.gravity = diff.gravity;
    }
    
    initEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                if (!this.gameStarted) {
                    this.startGame();
                } else if (this.gameRunning) {
                    this.jump();
                } else {
                    this.resetGame();
                }
            }
        });
        
        // Mouse/Touch events
        this.canvas.addEventListener('click', (e) => {
            e.preventDefault();
            if (!this.gameStarted) {
                this.startGame();
            } else if (this.gameRunning) {
                this.jump();
            } else {
                this.resetGame();
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
    }
    
    jump() {
        this.bird.velocity = this.bird.jumpPower;
        this.bird.rotation = -8; // Sanftere Sprung-Rotation
        
        // Kein Canvas-Wackeln mehr - Animation entfernt
    }
    
    startGame() {
        this.gameStarted = true;
        this.gameRunning = true;
        this.initGame();
    }
    
    resetGame() {
        this.gameStarted = false;
        this.gameRunning = false;
        this.initGame();
        this.startGame();
    }
    
    createClouds() {
        this.clouds = [];
        for (let i = 0; i < 8; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * 200 + 50,
                size: Math.random() * 60 + 40,
                speed: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Update bird
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Bird rotation based on velocity (sanfter)
        this.bird.rotation = Math.min(Math.max(this.bird.velocity * 1.2, -15), 45);
        
        // Ground collision
        if (this.bird.y + this.bird.height >= this.canvas.height - 150) {
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
                cloud.y = Math.random() * 200 + 50;
            }
        }
        
        // Update ground
        this.groundOffset -= this.pipeSpeed;
        if (this.groundOffset <= -50) {
            this.groundOffset = 0;
        }
    }
    
    createPipe() {
        const minHeight = 120;
        const maxHeight = this.canvas.height - this.pipeGap - minHeight - 100; // 100 for ground
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        this.pipes.push({
            x: this.canvas.width,
            topHeight: topHeight,
            bottomY: topHeight + this.pipeGap,
            bottomHeight: this.canvas.height - 100 - (topHeight + this.pipeGap),
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
        
        // Update highscore
        if (this.score > this.highscore) {
            this.highscore = this.score;
            localStorage.setItem('flappy-highscore', this.highscore);
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
        this.ctx.lineWidth = 3;
        
        for (const pipe of this.pipes) {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            this.ctx.strokeRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            
            // Top pipe cap
            this.ctx.fillRect(pipe.x - 10, pipe.topHeight - 30, this.pipeWidth + 20, 30);
            this.ctx.strokeRect(pipe.x - 10, pipe.topHeight - 30, this.pipeWidth + 20, 30);
            
            // Bottom pipe
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, pipe.bottomHeight);
            this.ctx.strokeRect(pipe.x, pipe.bottomY, this.pipeWidth, pipe.bottomHeight);
            
            // Bottom pipe cap
            this.ctx.fillRect(pipe.x - 10, pipe.bottomY, this.pipeWidth + 20, 30);
            this.ctx.strokeRect(pipe.x - 10, pipe.bottomY, this.pipeWidth + 20, 30);
        }
        
        // Draw ground
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.canvas.height - 100, this.canvas.width, 100);
        
        // Ground pattern
        this.ctx.fillStyle = '#A0522D';
        for (let x = this.groundOffset; x < this.canvas.width; x += 60) {
            this.ctx.fillRect(x, this.canvas.height - 100, 30, 100);
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
        this.ctx.ellipse(-5, -2, 12, 8, 0, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Beak
        this.ctx.fillStyle = '#f85149';
        this.ctx.beginPath();
        this.ctx.moveTo(this.bird.width/2 - 5, 0);
        this.ctx.lineTo(this.bird.width/2 + 10, -3);
        this.ctx.lineTo(this.bird.width/2 - 5, 5);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Eye
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(5, -5, 6, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(6, -4, 3, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.restore();
        
        // Game messages
        if (!this.gameStarted) {
            this.drawMessage('Klicke oder drücke LEERTASTE zum Starten', this.canvas.width/2, this.canvas.height/2);
            this.drawMessage('Steuerung: LEERTASTE, W oder Mausklick', this.canvas.width/2, this.canvas.height/2 + 40, '16px');
        } else if (!this.gameRunning) {
            this.drawMessage('GAME OVER', this.canvas.width/2, this.canvas.height/2, '36px', '#f85149');
            this.drawMessage(`Punkte: ${this.score} | Highscore: ${this.highscore}`, this.canvas.width/2, this.canvas.height/2 + 50, '18px');
            this.drawMessage('Klicke für neues Spiel', this.canvas.width/2, this.canvas.height/2 + 80, '16px');
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
    
    drawMessage(text, x, y, fontSize = '24px', color = '#ffffff') {
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(x - 250, y - 20, 500, 40);
        
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

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new FlappyBirdGame();
});