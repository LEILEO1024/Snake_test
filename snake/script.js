const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

const GRID_SIZE = 20;       // 20x20 grid
const TILE_SIZE = canvas.width / GRID_SIZE;
const TICK_INTERVAL = 150;  // ms

let snake, direction, nextDirection, food, score, gameLoop, running;

function init() {
  const mid = Math.floor(GRID_SIZE / 2);
  snake = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  running = false;
  scoreEl.textContent = '0';
  spawnFood();
  draw();
}

function spawnFood() {
  const total = GRID_SIZE * GRID_SIZE;
  if (snake.length >= total) return; // win condition

  // collect occupied cells
  const occupied = new Set(snake.map(c => `${c.x},${c.y}`));
  const free = [];
  for (let i = 0; i < total; i++) {
    const x = i % GRID_SIZE;
    const y = Math.floor(i / GRID_SIZE);
    if (!occupied.has(`${x},${y}`)) free.push({ x, y });
  }
  if (free.length === 0) return;
  food = free[Math.floor(Math.random() * free.length)];
}

function getNextHead() {
  return {
    x: (snake[0].x + nextDirection.x + GRID_SIZE) % GRID_SIZE,
    y: (snake[0].y + nextDirection.y + GRID_SIZE) % GRID_SIZE,
  };
}

function tick() {
  direction = { ...nextDirection };
  const head = getNextHead();

  // check self-collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    if (snake.length === GRID_SIZE * GRID_SIZE) {
      // win
      clearInterval(gameLoop);
      running = false;
      startBtn.textContent = '你赢了！';
      draw();
      return;
    }
    spawnFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw grid lines
  ctx.strokeStyle = '#1a2a44';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * TILE_SIZE, 0);
    ctx.lineTo(i * TILE_SIZE, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * TILE_SIZE);
    ctx.lineTo(canvas.width, i * TILE_SIZE);
    ctx.stroke();
  }

  // draw snake
  snake.forEach((seg, i) => {
    const isHead = i === 0;
    ctx.fillStyle = isHead ? '#4ade80' : '#22c55e';
    ctx.shadowColor = isHead ? '#4ade80' : 'transparent';
    ctx.shadowBlur = isHead ? 8 : 0;
    ctx.fillRect(seg.x * TILE_SIZE + 1, seg.y * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    ctx.shadowBlur = 0;

    // eyes on head
    if (isHead) {
      ctx.fillStyle = '#000';
      const cx = seg.x * TILE_SIZE + TILE_SIZE / 2;
      const cy = seg.y * TILE_SIZE + TILE_SIZE / 2;
      const offset = 3;
      ctx.beginPath();
      ctx.arc(cx - offset - 1, cy - offset - 1, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + offset + 1, cy - offset - 1, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // draw food
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(
    food.x * TILE_SIZE + TILE_SIZE / 2,
    food.y * TILE_SIZE + TILE_SIZE / 2,
    TILE_SIZE / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;
}

function gameOver() {
  clearInterval(gameLoop);
  running = false;
  startBtn.textContent = '重新开始';
  draw();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, canvas.height / 2 - 24, canvas.width, 48);
  ctx.fillStyle = '#e94560';
  ctx.font = 'bold 28px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2);
}

function startGame() {
  if (running) return;
  if (startBtn.textContent === '你赢了！') {
    init();
  }
  running = true;
  startBtn.textContent = '游戏中...';
  gameLoop = setInterval(tick, TICK_INTERVAL);
}

function resetGame() {
  clearInterval(gameLoop);
  init();
  startBtn.textContent = '开始游戏';
}

// ——— Input handling ———

document.addEventListener('keydown', (e) => {
  if (!running && e.key !== 'Enter') return;

  const keyMap = {
    ArrowUp:    { x: 0, y: -1 },
    ArrowDown:  { x: 0, y: 1 },
    ArrowLeft:  { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    W: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    S: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    A: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
    D: { x: 1, y: 0 },
  };

  const newDir = keyMap[e.key];
  if (!newDir) return;
  e.preventDefault();

  // prevent 180° reversal
  if (direction.x + newDir.x === 0 && direction.y + newDir.y === 0) return;

  nextDirection = newDir;
});

// ——— Button events ———

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

// ——— Init ———

init();
