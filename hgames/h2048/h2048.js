// --- 2048 Touch Grundlogik ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('start-btn');

const SIZE = 4;
let board, score, running, gameOver;

function resetGame() {
  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  score = 0;
  running = true;
  gameOver = false;
  addTile();
  addTile();
  draw();
  scoreEl.textContent = score;
}

function addTile() {
  let empty = [];
  for (let r=0; r<SIZE; r++) for (let c=0; c<SIZE; c++) if (!board[r][c]) empty.push([r,c]);
  if (empty.length) {
    let [r,c] = empty[Math.floor(Math.random()*empty.length)];
    board[r][c] = Math.random()<0.9 ? 2 : 4;
  }
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#181e2a';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  for (let r=0; r<SIZE; r++) {
    for (let c=0; c<SIZE; c++) {
      drawTile(r, c, board[r][c]);
    }
  }
  if (gameOver) {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#181e2a';
    ctx.strokeStyle = '#f85149';
    ctx.lineWidth = 4;
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
}

function drawTile(r, c, val) {
  const x = c*80+8, y = r*80+8, w = 64, h = 64;
  ctx.fillStyle = val ? tileColor(val) : '#222b3a';
  ctx.strokeStyle = val ? '#58a6ff' : '#30363d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill();
  ctx.stroke();
  if (val) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 1.5rem Segoe UI, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(val, x+w/2, y+h/2);
  }
}

function tileColor(val) {
  switch(val) {
    case 2: return '#58a6ff';
    case 4: return '#79c0ff';
    case 8: return '#a5a8ff';
    case 16: return '#ffd700';
    case 32: return '#f85149';
    case 64: return '#2ea043';
    case 128: return '#ff6b6b';
    case 256: return '#a5a8ff';
    case 512: return '#ffd700';
    case 1024: return '#f85149';
    case 2048: return '#2ea043';
    default: return '#30363d';
  }
}

function move(dir) {
  if (!running) return;
  let moved = false;
  let merged = Array.from({length: SIZE}, () => Array(SIZE).fill(false));
  function slide(r1,c1,r2,c2) {
    if (board[r2][c2]===0 && board[r1][c1]!==0) {
      board[r2][c2]=board[r1][c1]; board[r1][c1]=0; moved=true;
    } else if (board[r2][c2]===board[r1][c1] && board[r1][c1]!==0 && !merged[r2][c2] && !merged[r1][c1]) {
      board[r2][c2]*=2; board[r1][c1]=0; score+=board[r2][c2]; merged[r2][c2]=true; moved=true;
    }
  }
  if (dir==='left') {
    for (let r=0;r<SIZE;r++) for (let c=1;c<SIZE;c++) for (let k=c;k>0;k--) slide(r,k,r,k-1);
  } else if (dir==='right') {
    for (let r=0;r<SIZE;r++) for (let c=SIZE-2;c>=0;c--) for (let k=c;k<SIZE-1;k++) slide(r,k,r,k+1);
  } else if (dir==='up') {
    for (let c=0;c<SIZE;c++) for (let r=1;r<SIZE;r++) for (let k=r;k>0;k--) slide(k,c,k-1,c);
  } else if (dir==='down') {
    for (let c=0;c<SIZE;c++) for (let r=SIZE-2;r>=0;r--) for (let k=r;k<SIZE-1;k++) slide(k,c,k+1,c);
  }
  if (moved) {
    addTile();
    draw();
    scoreEl.textContent = score;
    if (isGameOver()) {
      running = false;
      gameOver = true;
      draw();
    }
  }
}

function isGameOver() {
  for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) if (!board[r][c]) return false;
  for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE-1;c++) if (board[r][c]===board[r][c+1]) return false;
  for (let c=0;c<SIZE;c++) for (let r=0;r<SIZE-1;r++) if (board[r][c]===board[r+1][c]) return false;
  return true;
}

// Pfeiltasten-Steuerung
document.getElementById('btn-up').addEventListener('click', () => {
  move('up');
  navigator.vibrate(50);
});
document.getElementById('btn-left').addEventListener('click', () => {
  move('left');
  navigator.vibrate(50);
});
document.getElementById('btn-down').addEventListener('click', () => {
  move('down');
  navigator.vibrate(50);
});
document.getElementById('btn-right').addEventListener('click', () => {
  move('right');
  navigator.vibrate(50);
});

startBtn.addEventListener('touchstart', e => {
  e.preventDefault();
  resetGame();
});

resetGame();
