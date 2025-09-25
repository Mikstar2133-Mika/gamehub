const canvas = document.getElementById('snake-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('start-btn');

const gridSize = 20;
const tileCount = 20;
let snake, direction, food, score, running, nextDir, gameLoop, gameSpeed = 120, lastMove = 0, animFrame;

function resetGame() {
    snake = [{x: 10, y: 10}];
    direction = {x: 0, y: 0};
    nextDir = {x: 0, y: 0};
    food = randomFood();
    score = 0;
    running = true;
    scoreEl.textContent = score;
    draw();
}

function randomFood() {
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Spielfeld-Box mit Glow und abgerundeter Umrandung
    ctx.save();
    ctx.shadowColor = '#58a6ff';
    ctx.shadowBlur = 18;
    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(0, 0, canvas.width, canvas.height, 18);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
    // Gitter zeichnen
    ctx.save();
    ctx.strokeStyle = 'rgba(88,166,255,0.10)';
    ctx.lineWidth = 1;
    for (let i = 1; i < tileCount; i++) {
        // Vertikale Linien
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        // Horizontale Linien
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    ctx.restore();
    // Snake mit Glow und abgerundet
    for (let i = 0; i < snake.length; i++) {
        ctx.save();
        ctx.shadowColor = i === 0 ? '#58a6ff' : '#a5a8ff';
        ctx.shadowBlur = i === 0 ? 16 : 6;
        ctx.fillStyle = i === 0 ? '#58a6ff' : '#a5a8ff';
        ctx.beginPath();
        ctx.roundRect(snake[i].x * gridSize + 1, snake[i].y * gridSize + 1, gridSize-3, gridSize-3, 6);
        ctx.fill();
        ctx.restore();
    }
    // Food als Kreis mit Glow
    ctx.save();
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2-4, 0, 2*Math.PI);
    ctx.fill();
    ctx.restore();
}

function update() {
    if (!running) return;
    direction = nextDir;
    if (direction.x === 0 && direction.y === 0) return;
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    // Check collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || snake.some(s => s.x === head.x && s.y === head.y)) {
        running = false;
        showGameOver();
        return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreEl.textContent = score;
        food = randomFood();
    } else {
        snake.pop();
    }
    draw();
}

function showGameOver() {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#181e2a';
    ctx.strokeStyle = '#f85149';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(canvas.width/2-140,canvas.height/2-50,280,100,18);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#f85149';
    ctx.font = 'bold 2.2rem Segoe UI, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width/2, canvas.height/2+10);
    ctx.restore();
}

function loop(ts) {
    if (!running) return;
    if (!lastMove) lastMove = ts;
    const interval = gameSpeed;
    if (ts - lastMove > interval) {
        update();
        lastMove = ts;
    }
    draw();
    animFrame = requestAnimationFrame(loop);
}

document.addEventListener('keydown', e => {
    if (!running) return;
    if ((e.key === 'a' || e.key === 'A') && direction.x !== 1) nextDir = {x: -1, y: 0};
    else if ((e.key === 'd' || e.key === 'D') && direction.x !== -1) nextDir = {x: 1, y: 0};
    else if ((e.key === 'w' || e.key === 'W') && direction.y !== 1) nextDir = {x: 0, y: -1};
    else if ((e.key === 's' || e.key === 'S') && direction.y !== -1) nextDir = {x: 0, y: 1};
    else if (e.key === ' ') running = !running;
});


startBtn.addEventListener('click', () => {
    if (animFrame) cancelAnimationFrame(animFrame);
    resetGame();
    nextDir = {x: 0, y: 0};
    setTimeout(() => { running = true; lastMove = 0; loop(); }, 200);
});

const diffSelect = document.getElementById('difficulty-select');
if (diffSelect) {
    diffSelect.addEventListener('change', e => {
        gameSpeed = parseInt(diffSelect.value, 10);
    });
    // Initialwert setzen
    gameSpeed = parseInt(diffSelect.value, 10);
}

resetGame();
loop();
