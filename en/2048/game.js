const gameBoard = document.getElementById('gameBoard');
const scoreDisplay = document.getElementById('score');
const bestDisplay = document.getElementById('best');
const startBtn = document.getElementById('startBtn');
const undoBtn = document.getElementById('undoBtn');

let board = Array(16).fill(0);
let score = 0;
let best = localStorage.getItem('2048-best') || 0;
let history = [];

bestDisplay.textContent = best;

function initBoard() {
    board = Array(16).fill(0);
    score = 0;
    scoreDisplay.textContent = '0';
    history = [];
    addNewTile();
    addNewTile();
}

function addNewTile() {
    const empty = board.map((val, i) => val === 0 ? i : null).filter(val => val !== null);
    if (empty.length > 0) {
        const index = empty[Math.floor(Math.random() * empty.length)];
        board[index] = Math.random() < 0.9 ? 2 : 4;
    }
}

function move(direction) {
    history.push(JSON.stringify(board));
    let moved = false;
    
    if (direction === 'left' || direction === 'right') {
        for (let i = 0; i < 4; i++) {
            const row = board.slice(i * 4, (i + 1) * 4);
            const newRow = compress(direction === 'left' ? row : row.reverse());
            const movedRow = direction === 'left' ? newRow : newRow.reverse();
            if (JSON.stringify(row) !== JSON.stringify(movedRow)) moved = true;
            board.splice(i * 4, 4, ...movedRow);
        }
    } else {
        for (let i = 0; i < 4; i++) {
            const col = [board[i], board[i + 4], board[i + 8], board[i + 12]];
            const newCol = compress(direction === 'up' ? col : col.reverse());
            const movedCol = direction === 'up' ? newCol : newCol.reverse();
            if (JSON.stringify(col) !== JSON.stringify(movedCol)) moved = true;
            board[i] = movedCol[0];
            board[i + 4] = movedCol[1];
            board[i + 8] = movedCol[2];
            board[i + 12] = movedCol[3];
        }
    }
    
    if (moved) {
        addNewTile();
        render();
        checkGameState();
    } else {
        history.pop();
    }
}

function compress(arr) {
    let newArr = arr.filter(val => val !== 0);
    for (let i = 0; i < newArr.length - 1; i++) {
        if (newArr[i] === newArr[i + 1]) {
            newArr[i] *= 2;
            score += newArr[i];
            newArr.splice(i + 1, 1);
        }
    }
    return newArr.concat(Array(4 - newArr.length).fill(0));
}

function render() {
    gameBoard.innerHTML = '';
    board.forEach((val, i) => {
        const tile = document.createElement('div');
        tile.className = 'tile' + (val === 0 ? ' empty' : '');
        tile.textContent = val || '';
        tile.setAttribute('data-value', val);
        gameBoard.appendChild(tile);
    });
    scoreDisplay.textContent = score;
}

function checkGameState() {
    if (score > best) {
        best = score;
        bestDisplay.textContent = best;
        localStorage.setItem('2048-best', best);
    }
    
    const canMove = board.some((val, i) => {
        if (val === 0) return true;
        const row = Math.floor(i / 4);
        const col = i % 4;
        if (col < 3 && board[i + 1] === val) return true;
        if (row < 3 && board[i + 4] === val) return true;
        return false;
    });
    
    if (!canMove && !board.includes(0)) {
        setTimeout(() => alert(`GAME OVER!\nScore: ${score}`), 100);
    }
}

document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        const keyMap = { 'arrowup': 'up', 'arrowdown': 'down', 'arrowleft': 'left', 'arrowright': 'right', 'w': 'up', 's': 'down', 'a': 'left', 'd': 'right' };
        move(keyMap[e.key.toLowerCase()]);
    }
});

startBtn.addEventListener('click', () => {
    initBoard();
    render();
});

undoBtn.addEventListener('click', () => {
    if (history.length > 0) {
        history.pop();
        if (history.length > 0) {
            board = JSON.parse(history[history.length - 1]);
            history.pop();
        }
        render();
    }
});

initBoard();
render();