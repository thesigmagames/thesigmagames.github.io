const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const scoreDisplay = document.getElementById('score');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};
let direction = {x: 1, y: 0};
let nextDirection = {x: 1, y: 0};
let score = 0;
let gameRunning = false;
let gamePaused = false;

function drawGame() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#00FF9D';
    snake.forEach((segment, index) => {
        ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
        if (index === 0) {
            ctx.strokeStyle = '#FF6B6B';
            ctx.lineWidth = 2;
            ctx.strokeRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
        }
    });
    
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
}

function update() {
    if (!gameRunning || gamePaused) return;
    
    direction = nextDirection;
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        endGame();
        return;
    }
    
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            endGame();
            return;
        }
    }
    
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreDisplay.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
}

function startGame() {
    gameRunning = true;
    gamePaused = false;
    startBtn.textContent = 'PAUSE';
}

function pauseGame() {
    gamePaused = !gamePaused;
    startBtn.textContent = gamePaused ? 'RESUME' : 'PAUSE';
}

function endGame() {
    gameRunning = false;
    gamePaused = false;
    startBtn.textContent = 'START GAME';
    alert('Game Over! Score: ' + score);
}

function resetGame() {
    snake = [{x: 10, y: 10}];
    food = {x: 15, y: 15};
    direction = {x: 1, y: 0};
    nextDirection = {x: 1, y: 0};
    score = 0;
    gameRunning = false;
    gamePaused = false;
    scoreDisplay.textContent = '0';
    startBtn.textContent = 'START GAME';
    drawGame();
}

startBtn.addEventListener('click', () => {
    if (!gameRunning) startGame();
    else pauseGame();
});

resetBtn.addEventListener('click', resetGame);

document.addEventListener('keydown', (e) => {
    if (!gameRunning && e.code !== 'Space') return;
    
    switch(e.code) {
        case 'KeyW':
        case 'ArrowUp':
            if (direction.y === 0) nextDirection = {x: 0, y: -1};
            break;
        case 'KeyS':
        case 'ArrowDown':
            if (direction.y === 0) nextDirection = {x: 0, y: 1};
            break;
        case 'KeyA':
        case 'ArrowLeft':
            if (direction.x === 0) nextDirection = {x: -1, y: 0};
            break;
        case 'KeyD':
        case 'ArrowRight':
            if (direction.x === 0) nextDirection = {x: 1, y: 0};
            break;
        case 'Space':
            if (!gameRunning) startGame();
            else pauseGame();
            break;
    }
});

setInterval(() => {
    update();
    drawGame();
}, 100);

drawGame();