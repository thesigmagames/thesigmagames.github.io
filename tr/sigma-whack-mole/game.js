const gameBoard = document.getElementById('gameBoard');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

let score = 0;
let timeLeft = 30;
let gameRunning = false;
let moles = [];
let activeMole = null;

function initGame() {
    gameBoard.innerHTML = '';
    moles = [];
    score = 0;
    timeLeft = 30;
    scoreDisplay.textContent = '0';
    timeDisplay.textContent = '30';
    
    for (let i = 0; i < 9; i++) {
        const hole = document.createElement('div');
        hole.className = 'hole';
        
        const mole = document.createElement('div');
        mole.className = 'mole';
        mole.textContent = '🐭';
        mole.addEventListener('click', (e) => {
            e.stopPropagation();
            if (mole.classList.contains('active')) {
                score++;
                scoreDisplay.textContent = score;
                mole.classList.remove('active');
                activeMole = null;
            }
        });
        
        hole.appendChild(mole);
        gameBoard.appendChild(hole);
        moles.push(mole);
    }
}

function showRandomMole() {
    if (!gameRunning) return;
    
    if (activeMole) activeMole.classList.remove('active');
    
    const randomMole = moles[Math.floor(Math.random() * moles.length)];
    randomMole.classList.add('active');
    activeMole = randomMole;
    
    setTimeout(() => {
        if (randomMole === activeMole) {
            randomMole.classList.remove('active');
            activeMole = null;
        }
    }, 600);
}

function startGame() {
    gameRunning = true;
    startBtn.textContent = 'OYNANIYOR';
    startBtn.disabled = true;
    
    const moleInterval = setInterval(() => {
        if (gameRunning) showRandomMole();
    }, 700);
    
    const timerInterval = setInterval(() => {
        if (gameRunning) {
            timeLeft--;
            timeDisplay.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                gameRunning = false;
                clearInterval(moleInterval);
                clearInterval(timerInterval);
                if (activeMole) activeMole.classList.remove('active');
                startBtn.disabled = false;
                startBtn.textContent = 'OYUNU BAŞLAT';
                alert('Oyun Bitti! Skor: ' + score);
            }
        }
    }, 1000);
}

function resetGame() {
    gameRunning = false;
    initGame();
    startBtn.disabled = false;
    startBtn.textContent = 'OYUNU BAŞLAT';
}

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

initGame();