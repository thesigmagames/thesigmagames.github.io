const gameBoard = document.getElementById('gameBoard');
const movesDisplay = document.getElementById('moves');
const matchesDisplay = document.getElementById('matches');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

const symbols = ['⭐', '🔥', '💎', '🎮', '⚡', '🚀', '🏆', '🎯'];
const cards = [...symbols, ...symbols];
let shuffledCards = [];
let flippedCards = [];
let matchedCards = [];
let moves = 0;

function shuffleCards() {
    shuffledCards = [...cards].sort(() => Math.random() - 0.5);
}

function initGame() {
    gameBoard.innerHTML = '';
    flippedCards = [];
    matchedCards = [];
    moves = 0;
    movesDisplay.textContent = '0';
    matchesDisplay.textContent = '0/8';
    shuffleCards();
    
    shuffledCards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.dataset.symbol = symbol;
        card.textContent = '?';
        card.addEventListener('click', () => flipCard(card, index));
        gameBoard.appendChild(card);
    });
}

function flipCard(card, index) {
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    if (flippedCards.length >= 2) return;
    
    card.classList.add('flipped');
    card.textContent = shuffledCards[index];
    flippedCards.push({card, index});
    
    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = moves;
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = shuffledCards[card1.index] === shuffledCards[card2.index];
    
    setTimeout(() => {
        if (isMatch) {
            card1.card.classList.add('matched');
            card2.card.classList.add('matched');
            matchedCards.push(card1.index, card2.index);
            matchesDisplay.textContent = `${matchedCards.length / 2}/8`;
            
            if (matchedCards.length === cards.length) {
                setTimeout(() => alert(`You won! You did it in ${moves} moves!`), 500);
            }
        } else {
            card1.card.classList.remove('flipped');
            card2.card.classList.remove('flipped');
            card1.card.textContent = '?';
            card2.card.textContent = '?';
        }
        flippedCards = [];
    }, 600);
}

startBtn.addEventListener('click', initGame);
resetBtn.addEventListener('click', initGame);

initGame();