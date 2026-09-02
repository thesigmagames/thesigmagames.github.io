const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const scoreDisplay = document.getElementById('score');

const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 20,
    height: 20,
    gravity: 0.5,
    velocity: 0,
    jump: -12
};

let pipes = [];
let score = 0;
let gameRunning = false;
let gamePaused = false;
let frameCount = 0;

const pipeWidth = 60;
const pipeGap = 120;
const pipeDistance = 200;

function drawBird() {
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    ctx.strokeStyle = '#00FF9D';
    ctx.lineWidth = 2;
    ctx.strokeRect(bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    ctx.fillStyle = '#00FF9D';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.strokeStyle = '#00FF9D';
        ctx.lineWidth = 2;
        ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.fillRect(pipe.x, pipe.topHeight + pipeGap, pipeWidth, canvas.height - pipe.topHeight - pipeGap);
        ctx.strokeRect(pipe.x, pipe.topHeight + pipeGap, pipeWidth, canvas.height - pipe.topHeight - pipeGap);
    });
}

function update() {
    if (!gameRunning || gamePaused) return;
    
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame();
        return;
    }
    
    frameCount++;
    if (frameCount % pipeDistance === 0) {
        const minHeight = 50;
        const maxHeight = canvas.height - pipeGap - 50;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        pipes.push({x: canvas.width, topHeight: topHeight});
    }
    
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 5;
        
        if (bird.x < pipes[i].x + pipeWidth && bird.x + bird.width > pipes[i].x) {
            if (bird.y < pipes[i].topHeight || bird.y + bird.height > pipes[i].topHeight + pipeGap) {
                endGame();
                return;
            }
        }
        
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
            score++;
            scoreDisplay.textContent = score;
        }
    }
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBird();
    drawPipes();
}

function startGame() {
    gameRunning = true;
    gamePaused = false;
    startBtn.textContent = 'DURAKLAT';
}

function pauseGame() {
    gamePaused = !gamePaused;
    startBtn.textContent = gamePaused ? 'DEVAM ET' : 'DURAKLAT';
}

function endGame() {
    gameRunning = false;
    gamePaused = false;
    startBtn.textContent = 'OYUNU BAŞLAT';
    alert('Oyun Bitti! Skor: ' + score);
}

function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    gameRunning = false;
    gamePaused = false;
    scoreDisplay.textContent = '0';
    startBtn.textContent = 'OYUNU BAŞLAT';
    draw();
}

function jump() {
    if (gameRunning) bird.velocity = bird.jump;
}

startBtn.addEventListener('click', () => {
    if (!gameRunning) startGame();
    else pauseGame();
});

resetBtn.addEventListener('click', resetGame);
canvas.addEventListener('click', jump);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameRunning) startGame();
        else jump();
    }
});

setInterval(() => {
    update();
    draw();
}, 30);

draw();