const canvas = document.getElementById('tetrisCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const linesDisplay = document.getElementById('lines');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const BLOCK_SIZE = canvas.width / GRID_WIDTH;

let grid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0));
let score = 0;
let level = 1;
let lines = 0;
let gameRunning = false;
let gamePaused = false;
let currentPiece = null;
let nextPiece = null;

const TETRIS_PIECES = [
    { shape: [[1,1],[1,1]], color: '#FFD700' },
    { shape: [[0,1,0],[1,1,1]], color: '#FF0000' },
    { shape: [[1,0,0],[1,1,1]], color: '#FFA500' },
    { shape: [[0,0,1],[1,1,1]], color: '#0000FF' },
    { shape: [[1,1,0],[0,1,1]], color: '#00FF00' },
    { shape: [[0,1,1],[1,1,0]], color: '#FF1493' },
    { shape: [[1,1,1,1]], color: '#00CED1' }
];

class TetrisPiece {
    constructor(template = TETRIS_PIECES[Math.floor(Math.random() * TETRIS_PIECES.length)]) {
        this.shape = template.shape.map(row => [...row]);
        this.color = template.color;
        this.x = Math.floor(GRID_WIDTH / 2) - Math.floor(this.shape[0].length / 2);
        this.y = 0;
    }
    
    rotate() {
        const rotated = this.shape[0].map((_, i) => 
            this.shape.map(row => row[i]).reverse()
        );
        const temp = this.shape;
        this.shape = rotated;
        if (!this.isValid()) this.shape = temp;
    }
    
    isValid() {
        for (let i = 0; i < this.shape.length; i++) {
            for (let j = 0; j < this.shape[i].length; j++) {
                if (this.shape[i][j]) {
                    const x = this.x + j;
                    const y = this.y + i;
                    if (x < 0 || x >= GRID_WIDTH || y >= GRID_HEIGHT) return false;
                    if (y >= 0 && grid[y][x]) return false;
                }
            }
        }
        return true;
    }
}

function initGame() {
    currentPiece = new TetrisPiece();
    nextPiece = new TetrisPiece();
}

function updateScore(points) {
    score += points;
    scoreDisplay.textContent = score;
}

function clearLines() {
    let clearedLines = 0;
    for (let i = GRID_HEIGHT - 1; i >= 0; i--) {
        if (grid[i].every(cell => cell)) {
            grid.splice(i, 1);
            grid.unshift(Array(GRID_WIDTH).fill(0));
            clearedLines++;
        }
    }
    if (clearedLines) {
        const points = [0, 40, 100, 300, 1200][clearedLines];
        updateScore(points * level);
        lines += clearedLines;
        linesDisplay.textContent = lines;
        level = Math.floor(lines / 10) + 1;
        levelDisplay.textContent = level;
    }
}

function placePiece() {
    for (let i = 0; i < currentPiece.shape.length; i++) {
        for (let j = 0; j < currentPiece.shape[i].length; j++) {
            if (currentPiece.shape[i][j]) {
                const x = currentPiece.x + j;
                const y = currentPiece.y + i;
                if (y >= 0) grid[y][x] = currentPiece.color;
            }
        }
    }
    clearLines();
    currentPiece = nextPiece;
    nextPiece = new TetrisPiece();
    if (!currentPiece.isValid()) endGame();
}

function movePiece(dx, dy) {
    currentPiece.x += dx;
    currentPiece.y += dy;
    if (!currentPiece.isValid()) {
        currentPiece.x -= dx;
        currentPiece.y -= dy;
        if (dy > 0) placePiece();
        return false;
    }
    return true;
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < GRID_HEIGHT; i++) {
        for (let j = 0; j < GRID_WIDTH; j++) {
            if (grid[i][j]) {
                ctx.fillStyle = grid[i][j];
                ctx.fillRect(j * BLOCK_SIZE, i * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            }
        }
    }
    
    if (currentPiece) {
        ctx.fillStyle = currentPiece.color;
        for (let i = 0; i < currentPiece.shape.length; i++) {
            for (let j = 0; j < currentPiece.shape[i].length; j++) {
                if (currentPiece.shape[i][j]) {
                    ctx.fillRect(
                        (currentPiece.x + j) * BLOCK_SIZE,
                        (currentPiece.y + i) * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            }
        }
    }
}

function gameLoop() {
    if (!gameRunning) return;
    if (!gamePaused) movePiece(0, 1);
    draw();
    setTimeout(gameLoop, Math.max(100, 500 - (level * 30)));
}

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        startBtn.textContent = 'DURAKLAT';
        initGame();
        gameLoop();
    } else {
        gamePaused = !gamePaused;
        startBtn.textContent = gamePaused ? 'DEVAM ET' : 'DURAKLAT';
    }
}

function resetGame() {
    grid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0));
    score = 0;
    level = 1;
    lines = 0;
    gameRunning = false;
    gamePaused = false;
    scoreDisplay.textContent = '0';
    levelDisplay.textContent = '1';
    linesDisplay.textContent = '0';
    startBtn.textContent = 'OYUNU BAŞLAT';
    draw();
}

function endGame() {
    gameRunning = false;
    startBtn.textContent = 'OYUNU BAŞLAT';
    alert(`OYUN BİTTİ!\nPuan: ${score}\nSeviye: ${level}`);
}

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    if (e.key === 'ArrowLeft') currentPiece.x > 0 && movePiece(-1, 0);
    if (e.key === 'ArrowRight') currentPiece.x < GRID_WIDTH - 1 && movePiece(1, 0);
    if (e.key === 'ArrowUp') currentPiece.rotate();
    if (e.key === 'ArrowDown') movePiece(0, 1);
    if (e.key === ' ') {
        e.preventDefault();
        gamePaused = !gamePaused;
        startBtn.textContent = gamePaused ? 'DEVAM ET' : 'DURAKLAT';
    }
});

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);
resetGame();