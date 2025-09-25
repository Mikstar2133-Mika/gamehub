
// --- Tetris Grundlogik ---
const canvas = document.getElementById('tetris-canvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('start-btn');
const diffSelect = document.getElementById('difficulty-select');

const COLS = 10, ROWS = 20, BLOCK = 24;
const COLORS = ['#222b3a', '#58a6ff', '#79c0ff', '#a5a8ff', '#f85149', '#ffd700', '#2ea043', '#ff6b6b'];
const SHAPES = [
	[], // 0
	[[1,1,1,1]], // I
	[[2,2],[2,2]], // O
	[[0,3,0],[3,3,3]], // T
	[[4,4,0],[0,4,4]], // S
	[[0,5,5],[5,5,0]], // Z
	[[6,0,0],[6,6,6]], // J
	[[0,0,7],[7,7,7]]  // L
];

let board, current, next, score, running, dropInterval = 500, dropTimer, gameOver;

function resetGame() {
	board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
	score = 0;
	running = true;
	gameOver = false;
	scoreEl.textContent = score;
	next = randomPiece();
	spawn();
	draw();
	drawNext();
	clearInterval(dropTimer);
	dropTimer = setInterval(tick, dropInterval);
}

function randomPiece() {
	const id = 1 + Math.floor(Math.random()*7);
	const shape = SHAPES[id].map(row => row.slice());
	return {id, shape, x: Math.floor(COLS/2)-Math.ceil(shape[0].length/2), y: 0};
}

function spawn() {
	current = next;
	current.x = Math.floor(COLS/2)-Math.ceil(current.shape[0].length/2);
	current.y = 0;
	next = randomPiece();
	if (collide(current.shape, current.x, current.y)) {
		running = false;
		gameOver = true;
		draw();
		clearInterval(dropTimer);
	}
}

function collide(shape, x, y) {
	for (let r=0; r<shape.length; r++) {
		for (let c=0; c<shape[r].length; c++) {
			if (shape[r][c] && (board[y+r] && board[y+r][x+c]) !== 0) return true;
			if (shape[r][c] && (x+c<0 || x+c>=COLS || y+r>=ROWS)) return true;
		}
	}
	return false;
}

function merge() {
	for (let r=0; r<current.shape.length; r++)
		for (let c=0; c<current.shape[r].length; c++)
			if (current.shape[r][c]) board[current.y+r][current.x+c] = current.shape[r][c];
}

function rotate(shape) {
	return shape[0].map((_,i) => shape.map(row => row[i])).reverse();
}

function tick() {
	if (!running) return;
	if (!move(0,1)) {
		merge();
		clearLines();
		spawn();
	}
	draw();
	drawNext();
}

function move(dx,dy) {
	if (!running) return false;
	const {shape,x,y} = current;
	if (!collide(shape, x+dx, y+dy)) {
		current.x += dx;
		current.y += dy;
		draw();
		return true;
	}
	return false;
}

function hardDrop() {
	while(move(0,1));
	tick();
}

function tryRotate() {
	const newShape = rotate(current.shape);
	if (!collide(newShape, current.x, current.y)) {
		current.shape = newShape;
		draw();
	}
}

function clearLines() {
	let lines = 0;
	for (let r=ROWS-1; r>=0; r--) {
		if (board[r].every(x=>x)) {
			board.splice(r,1);
			board.unshift(Array(COLS).fill(0));
			lines++;
			r++;
		}
	}
	if (lines) {
		score += [0,40,100,300,1200][lines];
		scoreEl.textContent = score;
	}
}

function draw() {
	ctx.clearRect(0,0,canvas.width,canvas.height);
	// Draw board
	for (let r=0; r<ROWS; r++) {
		for (let c=0; c<COLS; c++) {
			ctx.fillStyle = COLORS[board[r][c]];
			ctx.fillRect(c*BLOCK, r*BLOCK, BLOCK-1, BLOCK-1);
		}
	}
	// Draw current
	if (current) {
		for (let r=0; r<current.shape.length; r++)
			for (let c=0; c<current.shape[r].length; c++)
				if (current.shape[r][c]) {
					ctx.fillStyle = COLORS[current.shape[r][c]];
					ctx.fillRect((current.x+c)*BLOCK, (current.y+r)*BLOCK, BLOCK-1, BLOCK-1);
				}
	}
	if (gameOver) {
		ctx.save();
		ctx.globalAlpha = 0.85;
		ctx.fillStyle = '#181e2a';
		ctx.strokeStyle = '#f85149';
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.roundRect(canvas.width/2-120,canvas.height/2-40,240,80,18);
		ctx.fill();
		ctx.stroke();
		ctx.globalAlpha = 1;
		ctx.fillStyle = '#f85149';
		ctx.font = 'bold 2.2rem Segoe UI, Arial';
		ctx.textAlign = 'center';
		ctx.fillText('Game Over', canvas.width/2, canvas.height/2+10);
		ctx.restore();
	}
}

function drawNext() {
	nextCtx.clearRect(0,0,nextCanvas.width,nextCanvas.height);
	if (!next) return;
	const shape = next.shape;
	const color = COLORS[next.id];
	const offsetX = Math.floor((nextCanvas.width/BLOCK-shape[0].length)/2);
	const offsetY = Math.floor((nextCanvas.height/BLOCK-shape.length)/2);
	for (let r=0; r<shape.length; r++)
		for (let c=0; c<shape[r].length; c++)
			if (shape[r][c]) {
				nextCtx.fillStyle = color;
				nextCtx.fillRect((offsetX+c)*BLOCK, (offsetY+r)*BLOCK, BLOCK-1, BLOCK-1);
			}
}

document.addEventListener('keydown', e => {
	if (!running) return;
	if (e.key === 'a' || e.key === 'A') move(-1,0);
	else if (e.key === 'd' || e.key === 'D') move(1,0);
	else if (e.key === 's' || e.key === 'S') move(0,1);
	else if (e.key === 'w' || e.key === 'W') tryRotate();
	else if (e.key === ' ') hardDrop();
});

startBtn.addEventListener('click', () => {
	resetGame();
});

if (diffSelect) {
	diffSelect.addEventListener('change', e => {
		dropInterval = parseInt(diffSelect.value, 10);
		if (running) {
			clearInterval(dropTimer);
			dropTimer = setInterval(tick, dropInterval);
		}
	});
	dropInterval = parseInt(diffSelect.value, 10);
}

resetGame();
