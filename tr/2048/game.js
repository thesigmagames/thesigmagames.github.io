/**
 * THE SIGMA GAMES - SIGMA 2048
 * Full Vanilla JS Engine with Web Audio API, TV Remote & Mobile Support
 */

class Sigma2048Audio {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.isMusicPlaying = false;
        this.musicInterval = null;
        this.step = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playMove() {
        if (this.isMuted) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.08);
        
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    }

    playMerge(value) {
        if (this.isMuted) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        const baseFreq = 200 + Math.log2(value) * 60;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    playGameOver() {
        if (this.isMuted) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.6);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.6);
    }

    toggleMusic() {
        this.isMusicPlaying = !this.isMusicPlaying;
        if (this.isMusicPlaying) {
            this.init();
            this.startMusicLoop();
        } else {
            clearInterval(this.musicInterval);
        }
        return this.isMusicPlaying;
    }

    startMusicLoop() {
        const notes = [130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94];
        this.musicInterval = setInterval(() => {
            if (this.isMuted || !this.isMusicPlaying) return;
            const freq = notes[this.step % notes.length];
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.25);

            this.step = (this.step + (this.step % 2 === 0 ? 2 : 1)) % notes.length;
        }, 300);
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.radius = Math.random() * 4 + 2;
        this.alpha = 1;
        this.decay = Math.random() * 0.03 + 0.02;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Sigma2048Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.audio = new Sigma2048Audio();

        this.gridSize = 4;
        this.tileSize = 100;
        this.gap = 15;
        this.boardPadding = 15;

        this.grid = [];
        this.renderTiles = [];
        this.particles = [];
        
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('sigma2048_bestScore')) || 0;
        this.history = [];
        this.isGameOver = false;
        this.isPaused = false;

        this.shakeTime = 0;
        this.shakeIntensity = 0;

        this.touchStartX = 0;
        this.touchStartY = 0;

        this.colors = {
            2: { bg: '#e2e8f0', text: '#0f172a' },
            4: { bg: '#cbd5e1', text: '#0f172a' },
            8: { bg: '#ffb703', text: '#ffffff' },
            16: { bg: '#fb8500', text: '#ffffff' },
            32: { bg: '#f72585', text: '#ffffff' },
            64: { bg: '#7209b7', text: '#ffffff' },
            128: { bg: '#3f37c9', text: '#ffffff' },
            256: { bg: '#4361ee', text: '#ffffff' },
            512: { bg: '#4895ef', text: '#ffffff' },
            1024: { bg: '#4cc9f0', text: '#ffffff' },
            2048: { bg: '#00f5d4', text: '#0f172a' },
            4096: { bg: '#ff0055', text: '#ffffff' }
        };

        this.initCanvas();
        this.initEvents();
        this.restart();
        this.loop();
    }

    initCanvas() {
        const size = Math.min(window.innerWidth - 30, window.innerHeight - 200, 480);
        this.canvas.width = size;
        this.canvas.height = size;
        this.canvasSize = size;

        this.tileSize = (this.canvasSize - (this.boardPadding * 2) - (this.gap * (this.gridSize - 1))) / this.gridSize;
    }

    restart() {
        this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(0));
        this.renderTiles = [];
        this.history = [];
        this.score = 0;
        this.isGameOver = false;
        this.isPaused = false;

        // HTML Ekran Katmanlarını Gizle
        const pauseOverlay = document.getElementById('sigma-pause-overlay');
        if (pauseOverlay) pauseOverlay.classList.remove('active');

        const gameOverOverlay = document.getElementById('sigma-gameover-overlay');
        if (gameOverOverlay) gameOverOverlay.classList.remove('active');

        this.addRandomTile();
        this.addRandomTile();
        this.updateScoreUI();
    }

    togglePause() {
        if (this.isGameOver) return;
        this.isPaused = !this.isPaused;
        
        // HTML Duraklatma Katmanını Aç/Kapat
        const pauseOverlay = document.getElementById('sigma-pause-overlay');
        if (pauseOverlay) {
            pauseOverlay.classList.toggle('active', this.isPaused);
        }
    }

    saveState() {
        if (this.history.length > 5) this.history.shift();
        this.history.push({
            grid: JSON.parse(JSON.stringify(this.grid)),
            score: this.score
        });
    }

    undo() {
        if (this.history.length === 0 || this.isGameOver || this.isPaused) return;
        const previous = this.history.pop();
        this.grid = previous.grid;
        this.score = previous.score;
        this.syncRenderTiles();
        this.updateScoreUI();
    }

    addRandomTile() {
        let emptyCells = [];
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.grid[r][c] === 0) emptyCells.push({ r, c });
            }
        }
        if (emptyCells.length > 0) {
            let cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            let val = Math.random() < 0.9 ? 2 : 4;
            this.grid[cell.r][cell.c] = val;

            let pos = this.getTilePos(cell.r, cell.c);
            this.renderTiles.push({
                r: cell.r, c: cell.c,
                x: pos.x, y: pos.y,
                targetX: pos.x, targetY: pos.y,
                value: val,
                scale: 0.1,
                targetScale: 1
            });
        }
    }

    getTilePos(r, c) {
        return {
            x: this.boardPadding + c * (this.tileSize + this.gap),
            y: this.boardPadding + r * (this.tileSize + this.gap)
        };
    }

    syncRenderTiles() {
        this.renderTiles = [];
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.grid[r][c] !== 0) {
                    let pos = this.getTilePos(r, c);
                    this.renderTiles.push({
                        r, c, x: pos.x, y: pos.y,
                        targetX: pos.x, targetY: pos.y,
                        value: this.grid[r][c],
                        scale: 1, targetScale: 1
                    });
                }
            }
        }
    }

    move(direction) {
        if (this.isGameOver || this.isPaused) return;
        this.audio.init();

        this.saveState();
        let moved = false;
        let mergedScore = 0;

        let rotateGrid = (g) => g[0].map((_, i) => g.map(row => row[i]).reverse());

        let rotations = 0;
        if (direction === 'UP') rotations = 3;
        if (direction === 'RIGHT') rotations = 2;
        if (direction === 'DOWN') rotations = 1;

        for (let i = 0; i < rotations; i++) {
            this.grid = rotateGrid(this.grid);
        }

        for (let r = 0; r < this.gridSize; r++) {
            let row = this.grid[r].filter(val => val !== 0);
            for (let i = 0; i < row.length - 1; i++) {
                if (row[i] === row[i + 1]) {
                    row[i] *= 2;
                    mergedScore += row[i];
                    row.splice(i + 1, 1);
                    moved = true;

                    let pos = this.getTilePos(r, i);
                    this.spawnParticles(pos.x + this.tileSize / 2, pos.y + this.tileSize / 2, this.colors[row[i]]?.bg || '#fff');
                    this.audio.playMerge(row[i]);

                    if (row[i] >= 64) {
                        this.shakeTime = 10;
                        this.shakeIntensity = Math.min(row[i] / 16, 15);
                    }
                }
            }
            while (row.length < this.gridSize) row.push(0);

            if (row.join(',') !== this.grid[r].join(',')) {
                moved = true;
            }
            this.grid[r] = row;
        }

        for (let i = 0; i < (4 - rotations) % 4; i++) {
            this.grid = rotateGrid(this.grid);
        }

        if (moved) {
            this.score += mergedScore;
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem('sigma2048_bestScore', this.bestScore);
            }
            this.audio.playMove();
            this.addRandomTile();
            this.syncRenderTiles();
            this.updateScoreUI();

            if (this.checkGameOver()) {
                this.isGameOver = true;
                this.audio.playGameOver();
                const gameOverOverlay = document.getElementById('sigma-gameover-overlay');
                if (gameOverOverlay) gameOverOverlay.classList.add('active');
            }
        } else {
            this.history.pop();
        }
    }

    checkGameOver() {
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.grid[r][c] === 0) return false;
                if (c < this.gridSize - 1 && this.grid[r][c] === this.grid[r][c + 1]) return false;
                if (r < this.gridSize - 1 && this.grid[r][c] === this.grid[r + 1][c]) return false;
            }
        }
        return true;
    }

    spawnParticles(x, y, color) {
        for (let i = 0; i < 16; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    updateScoreUI() {
        const scoreElem = document.getElementById('sigma-score');
        const bestElem = document.getElementById('sigma-best');
        if (scoreElem) scoreElem.innerText = this.score;
        if (bestElem) bestElem.innerText = this.bestScore;
    }

    initEvents() {
        window.addEventListener('resize', () => this.initCanvas());

        // Klavyeler, Oyun Kolları ve Tüm TV Kumandaları (D-Pad Yön Okları + OK + Back)
        window.addEventListener('keydown', (e) => {
            const key = e.key;
            const code = e.keyCode || e.which;

            // YUKARI OK: TV Kumanda D-Pad Yukarı / W / ArrowUp (Code: 38)
            if (key === 'ArrowUp' || key === 'w' || key === 'W' || code === 38) {
                e.preventDefault();
                this.move('UP');
            } 
            // AŞAĞI OK: TV Kumanda D-Pad Aşağı / S / ArrowDown (Code: 40)
            else if (key === 'ArrowDown' || key === 's' || key === 'S' || code === 40) {
                e.preventDefault();
                this.move('DOWN');
            } 
            // SOL OK: TV Kumanda D-Pad Sol / A / ArrowLeft (Code: 37)
            else if (key === 'ArrowLeft' || key === 'a' || key === 'A' || code === 37) {
                e.preventDefault();
                this.move('LEFT');
            } 
            // SAĞ OK: TV Kumanda D-Pad Sağ / D / ArrowRight (Code: 39)
            else if (key === 'ArrowRight' || key === 'd' || key === 'D' || code === 39) {
                e.preventDefault();
                this.move('RIGHT');
            } 
            // OK / SELECT / ENTER: TV Kumanda Orta Buton (Code: 13, 29443)
            else if (key === 'Enter' || key === ' ' || key === 'Select' || code === 13 || code === 29443) {
                e.preventDefault();
                if (this.isGameOver) {
                    this.restart();
                } else {
                    this.togglePause();
                }
            }
            // GERİ / BACK / ESCAPE: TV Kumanda Geri Tuşu (Samsung: 10009, LG: 461, Esc: 27)
            else if (key === 'Escape' || key === 'Back' || key === 'GoBack' || code === 27 || code === 10009 || code === 461) {
                e.preventDefault();
                this.togglePause();
            }
        });

        // Mobil Dokunmatik (Swipe) Desteği
        this.canvas.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Mobilde sayfa kaymasını engeller
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            if (!this.touchStartX || !this.touchStartY) return;
            let diffX = e.changedTouches[0].clientX - this.touchStartX;
            let diffY = e.changedTouches[0].clientY - this.touchStartY;

            if (Math.max(Math.abs(diffX), Math.abs(diffY)) > 25) {
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    this.move(diffX > 0 ? 'RIGHT' : 'LEFT');
                } else {
                    this.move(diffY > 0 ? 'DOWN' : 'UP');
                }
            }
            this.touchStartX = 0;
            this.touchStartY = 0;
        }, { passive: false });
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    update() {
        if (this.isPaused) return;

        this.renderTiles.forEach(tile => {
            tile.x += (tile.targetX - tile.x) * 0.35;
            tile.y += (tile.targetY - tile.y) * 0.35;
            tile.scale += (tile.targetScale - tile.scale) * 0.2;
        });

        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => p.alpha > 0);

        if (this.shakeTime > 0) {
            this.shakeTime--;
        }
    }

    draw() {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.shakeTime > 0) {
            const dx = (Math.random() - 0.5) * this.shakeIntensity;
            const dy = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.translate(dx, dy);
        }

        // Board Background
        this.ctx.fillStyle = '#0f172a';
        this.drawRoundedRect(0, 0, this.canvasSize, this.canvasSize, 16);

        // Grid Slots
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                let pos = this.getTilePos(r, c);
                this.ctx.fillStyle = '#1e293b';
                this.drawRoundedRect(pos.x, pos.y, this.tileSize, this.tileSize, 10);
            }
        }

        // Active Tiles
        this.renderTiles.forEach(tile => {
            let config = this.colors[tile.value] || { bg: '#334155', text: '#fff' };
            this.ctx.save();
            let centerX = tile.x + this.tileSize / 2;
            let centerY = tile.y + this.tileSize / 2;

            this.ctx.translate(centerX, centerY);
            this.ctx.scale(tile.scale, tile.scale);
            this.ctx.translate(-centerX, -centerY);

            this.ctx.fillStyle = config.bg;
            this.drawRoundedRect(tile.x, tile.y, this.tileSize, this.tileSize, 10);

            if (tile.value >= 128) {
                this.ctx.shadowColor = config.bg;
                this.ctx.shadowBlur = 15;
            }

            this.ctx.fillStyle = config.text;
            this.ctx.font = `bold ${tile.value > 512 ? this.tileSize * 0.32 : this.tileSize * 0.4}px system-ui, sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(tile.value, centerX, centerY);

            this.ctx.restore();
        });

        this.particles.forEach(p => p.draw(this.ctx));

        this.ctx.restore();
    }

    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();
    }
}

let sigmaGame;
window.addEventListener('DOMContentLoaded', () => {
    sigmaGame = new Sigma2048Game('sigma-2048-canvas');
});
