const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const healthDisplay = document.getElementById('health');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

const player = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 30,
    width: 30,
    height: 20,
    speed: 5
};

let bullets = [];
let enemies = [];
let score = 0;
let health = 3;
let gameRunning = false;
let keys = {};
let frameCount = 0;

function drawPlayer() {
    ctx.fillStyle = '#00FF9D';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(player.x + 5, player.y - 8, 20, 8);
}

function drawBullets() {
    ctx.fillStyle = '#FFD700';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, 3, 8);
    });
}

function drawEnemies() {
    ctx.fillStyle = '#FF6B6B';
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.strokeStyle = '#00FF9D';
        ctx.lineWidth = 2;
        ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function update() {
    if (!gameRunning) return;
    
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x + player.width < canvas.width) player.x += player.speed;
    
    bullets = bullets.filter(b => b.y > 0);
    bullets.forEach(bullet => bullet.y -= 7);
    
    frameCount++;
    if (frameCount % 40 === 0) {
        enemies.push({
            x: Math.random() * (canvas.width - 30),
            y: 0,
            width: 30,
            height: 20,
            speed: 2 + Math.random() * 2
        });
    }
    
    enemies.forEach(enemy => {
        enemy.y += enemy.speed;
        
        bullets.forEach((bullet, bIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + 3 > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + 8 > enemy.y) {
                
                bullets.splice(bIndex, 1);
                enemies.splice(enemies.indexOf(enemy), 1);
                score += 10;
                scoreDisplay.textContent = score;
            }
        });
        
        if (enemy.y > canvas.height) {
            enemies.splice(enemies.indexOf(enemy), 1);
            health--;
            healthDisplay.textContent = health;
            
            if (health <= 0) {
                gameRunning = false;
                alert('Game Over! Score: ' + score);
            }
        }
    });
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawPlayer();
    drawBullets();
    drawEnemies();
}

function startGame() {
    gameRunning = true;
    startBtn.textContent = 'PLAYING';
}

function resetGame() {
    player.x = canvas.width / 2 - 15;
    bullets = [];
    enemies = [];
    score = 0;
    health = 3;
    frameCount = 0;
    gameRunning = false;
    scoreDisplay.textContent = '0';
    healthDisplay.textContent = '3';
    startBtn.textContent = 'START GAME';
    draw();
}

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.code === 'Space' && gameRunning) {
        bullets.push({
            x: player.x + player.width / 2 - 1.5,
            y: player.y
        });
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

setInterval(() => {
    update();
    draw();
}, 30);

draw();