const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const scoreDisplay = document.getElementById('score');
const bricksDisplay = document.getElementById('bricks');

const paddle = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 20,
    width: 80,
    height: 10,
    speed: 6
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height - 40,
    radius: 5,
    dx: 4,
    dy: -4
};

let bricks = [];
let score = 0;
let gameRunning = false;
let keys = {};

const brickRows = 3;
const brickCols = 8;
const brickWidth = 80;
const brickHeight = 15;
const brickPadding = 10;

function initBricks() {
    bricks = [];
    for (let row = 0; row < brickRows; row++) {
        for (let col = 0; col < brickCols; col++) {
            bricks.push({
                x: col * (brickWidth + brickPadding) + 10,
                y: row * (brickHeight + brickPadding) + 30,
                width: brickWidth,
                height: brickHeight,
                active: true
            });
        }
    }
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#00FF9D';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#00FF9D';
    bricks.forEach(brick => {
        if (brick.active) {
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            ctx.strokeStyle = '#FF6B6B';
            ctx.lineWidth = 1;
            ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
        }
    });
}

function update() {
    if (!gameRunning) return;
    
    if (keys['ArrowLeft'] && paddle.x > 0) paddle.x -= paddle.speed;
    if (keys['ArrowRight'] && paddle.x + paddle.width < canvas.width) paddle.x += paddle.speed;
    
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) ball.dx *= -1;
    if (ball.y - ball.radius < 0) ball.dy *= -1;
    
    if (ball.y - ball.radius > canvas.height) {
        gameRunning = false;
        alert('Game Over! Score: ' + score);
        return;
    }
    
    if (ball.y + ball.radius > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        ball.dy = -ball.dy;
        ball.y = paddle.y - ball.radius;
    }
    
    bricks.forEach(brick => {
        if (!brick.active) return;
        
        if (ball.x > brick.x && ball.x < brick.x + brick.width &&
            ball.y > brick.y && ball.y < brick.y + brick.height) {
            brick.active = false;
            ball.dy *= -1;
            score += 10;
            scoreDisplay.textContent = score;
            const activeBricks = bricks.filter(b => b.active).length;
            bricksDisplay.textContent = activeBricks;
            
            if (activeBricks === 0) {
                gameRunning = false;
                alert('You won! Score: ' + score);
            }
        }
    });
}

function startGame() {
    gameRunning = true;
    startBtn.textContent = 'PLAYING';
}

function resetGame() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 40;
    ball.dx = 4;
    ball.dy = -4;
    paddle.x = canvas.width / 2 - 40;
    score = 0;
    gameRunning = false;
    scoreDisplay.textContent = '0';
    startBtn.textContent = 'START GAME';
    initBricks();
    bricksDisplay.textContent = bricks.length;
    draw();
}

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.code === 'Space') gameRunning = !gameRunning;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

initBricks();
bricksDisplay.textContent = bricks.length;

setInterval(() => {
    update();
    draw();
}, 30);

draw();