const canvas = document.getElementById('snake-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('start-btn');

const gridSize = 16;
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
    ctx.shadowBlur = 14;
    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(0, 0, canvas.width, canvas.height, 14);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
    // Snake
    for (let i = 0; i < snake.length; i++) {
        ctx.save();
        ctx.shadowColor = i === 0 ? '#58a6ff' : '#a5a8ff';
        ctx.shadowBlur = i === 0 ? 10 : 4;
        ctx.fillStyle = i === 0 ? '#58a6ff' : '#a5a8ff';
        ctx.beginPath();
        ctx.roundRect(snake[i].x * gridSize + 1, snake[i].y * gridSize + 1, gridSize-2, gridSize-2, 4);
        ctx.fill();
        ctx.restore();
    }
    // Food
    ctx.save();
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2-2, 0, 2*Math.PI);
    ctx.fill();
    ctx.restore();
}

function update() {
    if (!running) return;
    direction = nextDir;
    if (direction.x === 0 && direction.y === 0) return;
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
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
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(canvas.width/2-80,canvas.height/2-30,160,60,12);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#f85149';
    ctx.font = 'bold 1.3rem Segoe UI, Arial';
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

// Touch-Steuerung
function setDir(x, y) {
    if (!running) return;
    if (x === -1 && direction.x !== 1) nextDir = {x: -1, y: 0};
    else if (x === 1 && direction.x !== -1) nextDir = {x: 1, y: 0};
    else if (y === -1 && direction.y !== 1) nextDir = {x: 0, y: -1};
    else if (y === 1 && direction.y !== -1) nextDir = {x: 0, y: 1};
}

document.getElementById('btn-up').addEventListener('touchstart', e => { e.preventDefault(); setDir(0, -1); });
document.getElementById('btn-down').addEventListener('touchstart', e => { e.preventDefault(); setDir(0, 1); });
document.getElementById('btn-left').addEventListener('touchstart', e => { e.preventDefault(); setDir(-1, 0); });
document.getElementById('btn-right').addEventListener('touchstart', e => { e.preventDefault(); setDir(1, 0); });

startBtn.addEventListener('touchstart', e => {
    e.preventDefault();
    if (animFrame) cancelAnimationFrame(animFrame);
    resetGame();
    nextDir = {x: 0, y: 0};
    setTimeout(() => { running = true; lastMove = 0; loop(); }, 200);
});

resetGame();
loop();
