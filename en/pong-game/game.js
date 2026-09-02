const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const score1Display = document.getElementById('score1');
const score2Display = document.getElementById('score2');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

// Oyun Değişkenleri
let gameRunning = false;
let score1 = 0;
let score2 = 0;

// Paddle Ayarları
const paddleWidth = 10;
const paddleHeight = 80;
const paddleSpeed = 6;

const paddle1 = {
    x: 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

const paddle2 = {
    x: canvas.width - 30,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

// Top Ayarları
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    dx: 5,
    dy: 5,
    speed: 5
};

// Klavye Kontrolleri
const keys = {};
const scrollPreventKeys = ['ArrowUp', 'ArrowDown', ' '];

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Scroll'u engelleyen tuşlar
    if (scrollPreventKeys.includes(e.key)) {
        e.preventDefault();
    }
    
    if (e.key === ' ') {
        gameRunning = !gameRunning;
        startBtn.textContent = gameRunning ? 'PAUSE' : 'START GAME';
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Scroll olayını tamamen engelle
window.addEventListener('wheel', (e) => {
    if (document.activeElement === canvas || document.activeElement === document.body) {
        e.preventDefault();
    }
}, { passive: false });

startBtn.addEventListener('click', () => {
    gameRunning = !gameRunning;
    startBtn.textContent = gameRunning ? 'PAUSE' : 'START GAME';
});

resetBtn.addEventListener('click', () => {
    score1 = 0;
    score2 = 0;
    score1Display.textContent = '0';
    score2Display.textContent = '0';
    resetBall();
    gameRunning = false;
    startBtn.textContent = 'START GAME';
});

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 8;
}

function updatePaddles() {
    // Oyuncu 1 Kontrolü (W/S)
    if (keys['w'] || keys['W']) {
        paddle1.y = Math.max(0, paddle1.y - paddleSpeed);
    }
    if (keys['s'] || keys['S']) {
        paddle1.y = Math.min(canvas.height - paddle1.height, paddle1.y + paddleSpeed);
    }
    
    // Oyuncu 2 Kontrolü (Arrow Keys)
    if (keys['ArrowUp']) {
        paddle2.y = Math.max(0, paddle2.y - paddleSpeed);
    }
    if (keys['ArrowDown']) {
        paddle2.y = Math.min(canvas.height - paddle2.height, paddle2.y + paddleSpeed);
    }
}

function updateBall() {
    if (!gameRunning) return;
    
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Üst ve Alt Çarpışma
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy *= -1;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }
    
    // Paddle Çarpışmaları
    if (
        ball.x - ball.radius < paddle1.x + paddle1.width &&
        ball.y > paddle1.y &&
        ball.y < paddle1.y + paddle1.height
    ) {
        ball.dx *= -1.05;
        ball.x = paddle1.x + paddle1.width + ball.radius;
        ball.dy += (ball.y - (paddle1.y + paddle1.height / 2)) * 0.1;
    }
    
    if (
        ball.x + ball.radius > paddle2.x &&
        ball.y > paddle2.y &&
        ball.y < paddle2.y + paddle2.height
    ) {
        ball.dx *= -1.05;
        ball.x = paddle2.x - ball.radius;
        ball.dy += (ball.y - (paddle2.y + paddle2.height / 2)) * 0.1;
    }
    
    // Skor Güncelleme
    if (ball.x < 0) {
        score2++;
        score2Display.textContent = score2;
        resetBall();
        gameRunning = false;
        startBtn.textContent = 'START GAME';
    }
    if (ball.x > canvas.width) {
        score1++;
        score1Display.textContent = score1;
        resetBall();
        gameRunning = false;
        startBtn.textContent = 'START GAME';
    }
}

function draw() {
    // Arka Plan
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Orta Çizgi
    ctx.strokeStyle = '#00FF9D';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Paddle 1 (Mavi)
    ctx.fillStyle = '#00FF9D';
    ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
    
    // Paddle 2 (Kırmızı)
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
    
    // Top
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Glow Effect
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
}

function gameLoop() {
    updatePaddles();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// Oyunu Başlat
gameLoop();
