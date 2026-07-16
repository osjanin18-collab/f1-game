// F-1 Race Game - Complete Rewrite

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.difficulty = 1;
        this.currentTrack = 1;
        this.gameState = 'menu';
        this.gameRunning = false;
        
        this.player = null;
        this.opponents = [];
        this.track = null;
        
        this.elapsedTime = 0;
        this.timeLeft = 0;
        this.finished = false;
        this.finishPosition = 0;
        
        this.keys = {};
        this.gearKeyDown = false;
        
        this.lastFrameTime = 0;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.showDifficulty());
        document.getElementById('instructionsBtn').addEventListener('click', () => this.showInstructions());
        document.getElementById('aboutBtn').addEventListener('click', () => this.showAbout());
        
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.difficulty = parseInt(e.currentTarget.dataset.difficulty);
                this.startGame();
            });
        });
        
        document.getElementById('backBtn').addEventListener('click', () => this.showMenu());
        document.getElementById('backFromInstructionsBtn').addEventListener('click', () => this.showMenu());
        document.getElementById('backFromAboutBtn').addEventListener('click', () => this.showMenu());
        document.getElementById('retryBtn').addEventListener('click', () => this.resetTrack());
        document.getElementById('menuBtn').addEventListener('click', () => this.showMenu());
        
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            
            // Handle G key separately
            if (key === 'g') {
                if (!this.gearKeyDown && this.gameRunning && this.player) {
                    console.log('Gear switch triggered');
                    this.gearKeyDown = true;
                    this.player.switchGear();
                }
            } else {
                this.keys[key] = true;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'g') {
                this.gearKeyDown = false;
            } else {
                this.keys[key] = false;
            }
        });
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }
    
    showMenu() {
        this.gameRunning = false;
        this.showScreen('menuScreen');
        this.gameState = 'menu';
    }
    
    showDifficulty() {
        this.showScreen('difficultyScreen');
    }
    
    showInstructions() {
        this.showScreen('instructionsScreen');
    }
    
    showAbout() {
        this.showScreen('aboutScreen');
    }
    
    startGame() {
        this.currentTrack = 1;
        this.startTrack();
    }
    
    startTrack() {
        this.showScreen('gameScreen');
        this.gameState = 'game';
        this.gameRunning = true;
        this.elapsedTime = 0;
        this.finished = false;
        this.finishPosition = 0;
        this.gearKeyDown = false;
        
        // Setup track
        const trackDifficulty = [
            { name: 'Tokyo', timeLimit: 60 },
            { name: 'Paris', timeLimit: 65 },
            { name: 'London', timeLimit: 70 },
            { name: 'New York', timeLimit: 75 },
            { name: 'Sydney', timeLimit: 80 }
        ];
        
        const td = trackDifficulty[this.currentTrack - 1];
        this.timeLeft = td.timeLimit;
        this.track = new Track();
        
        // Player
        this.player = new Car(400, 500, true);
        
        // Opponents
        this.opponents = [
            new Car(360, 500, false),
            new Car(440, 500, false),
            new Car(400, 450, false)
        ];
        
        this.lastFrameTime = performance.now();
        this.gameLoop();
    }
    
    resetTrack() {
        this.startTrack();
    }
    
    gameLoop = () => {
        if (!this.gameRunning) return;
        
        const now = performance.now();
        const deltaTime = Math.min((now - this.lastFrameTime) / 1000, 0.02);
        this.lastFrameTime = now;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame(this.gameLoop);
    }
    
    update(deltaTime) {
        this.elapsedTime += deltaTime;
        this.timeLeft -= deltaTime;
        
        if (this.timeLeft <= 0 && !this.finished) {
            this.gameOver(false);
            return;
        }
        
        // Player input
        if (this.keys['arrowup'] || this.keys['w']) this.player.accelerate();
        if (this.keys['arrowdown'] || this.keys['s']) this.player.brake();
        if (this.keys['arrowleft'] || this.keys['a']) this.player.turnLeft();
        if (this.keys['arrowright'] || this.keys['d']) this.player.turnRight();
        
        // Update cars
        this.player.update(deltaTime, this.track);
        
        this.opponents.forEach(opp => {
            opp.aiUpdate(deltaTime, this.track);
            opp.update(deltaTime, this.track);
        });
        
        // Check positions
        const cars = [this.player, ...this.opponents];
        cars.sort((a, b) => b.progress - a.progress);
        this.finishPosition = cars.indexOf(this.player) + 1;
        
        // Check if player finished
        if (!this.finished && this.player.progress >= 1) {
            this.gameOver(this.finishPosition <= 3);
        }
        
        this.updateUI();
    }
    
    gameOver(won) {
        this.finished = true;
        
        if (won && this.currentTrack < 5) {
            this.currentTrack++;
            setTimeout(() => this.startTrack(), 1000);
        } else if (won) {
            this.showGameOverScreen(true);
        } else {
            this.showGameOverScreen(false);
        }
    }
    
    showGameOverScreen(won) {
        this.gameRunning = false;
        this.showScreen('gameOverScreen');
        
        const title = document.getElementById('gameOverTitle');
        title.textContent = won ? 'CONGRATULATIONS!' : (this.timeLeft <= 0 ? 'TIME UP!' : 'RACE OVER');
        
        document.getElementById('finalPosition').textContent = this.finishPosition;
        document.getElementById('finalTime').textContent = this.formatTime(this.elapsedTime);
        document.getElementById('finalTrack').textContent = this.currentTrack;
    }
    
    updateUI() {
        document.getElementById('position').textContent = `${this.finishPosition}/4`;
        document.getElementById('timer').textContent = this.formatTime(Math.max(0, this.timeLeft));
        document.getElementById('speed').textContent = Math.round(this.player.speed * 3.6);
        document.getElementById('gear').textContent = this.player.gear === 0 ? 'LOW' : 'HI';
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.track.draw(this.ctx, this.player);
        this.player.draw(this.ctx);
        this.opponents.forEach(opp => opp.draw(this.ctx));
    }
}

class Track {
    constructor() {
        this.width = 150;
        this.length = 2000;
    }
    
    isValid(x, y) {
        const roadX = 400 + Math.sin(y / 200) * 50;
        const distFromCenter = Math.abs(x - roadX);
        return distFromCenter < this.width / 2;
    }
    
    getRoadX(y) {
        return 400 + Math.sin(y / 200) * 50;
    }
    
    draw(ctx, player) {
        const cameraY = player.y - 200;
        
        for (let y = Math.floor(cameraY); y < cameraY + 600; y += 20) {
            const roadX = this.getRoadX(y);
            const screenY = y - cameraY;
            
            ctx.fillStyle = '#222';
            ctx.fillRect(roadX - this.width / 2, screenY, this.width, 20);
            
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 2;
            ctx.strokeRect(roadX - this.width / 2, screenY, this.width, 20);
        }
    }
}

class Car {
    constructor(x, y, isPlayer) {
        this.x = x;
        this.y = y;
        this.isPlayer = isPlayer;
        this.width = 16;
        this.height = 24;
        
        this.speed = 0;
        this.maxSpeed = [20, 35]; // LOW, HI
        this.gear = 0; // 0=LOW, 1=HI
        this.angle = 0;
        
        this.acceleration = isPlayer ? 15 : 20;
        this.friction = 0.97;
        this.progress = 0;
        
        this.crashed = false;
        this.crashTime = 0;
        
        this.aiTimer = 0;
    }
    
    switchGear() {
        this.gear = 1 - this.gear;
        console.log('Gear switched to: ' + (this.gear === 0 ? 'LOW' : 'HI'));
    }
    
    accelerate() {
        if (!this.crashed) {
            this.speed = Math.min(this.maxSpeed[this.gear], this.speed + this.acceleration * 0.016);
        }
    }
    
    brake() {
        this.speed = Math.max(0, this.speed - 25 * 0.016);
    }
    
    turnLeft() {
        if (this.speed > 0) this.angle -= 0.08;
    }
    
    turnRight() {
        if (this.speed > 0) this.angle += 0.08;
    }
    
    aiUpdate(deltaTime, track) {
        // AI always accelerates in HI gear
        this.gear = 1;
        this.speed = Math.min(this.maxSpeed[1], this.speed + this.acceleration * 0.016);
        
        // Gentle steering to follow road
        this.aiTimer += deltaTime;
        if (this.aiTimer > 0.1) {
            this.aiTimer = 0;
            
            const roadX = track.getRoadX(this.y);
            const diff = this.x - roadX;
            
            // Smooth steering - don't turn sharply
            if (diff < -10) {
                this.angle -= 0.05;
            } else if (diff > 10) {
                this.angle += 0.05;
            }
        }
    }
    
    update(deltaTime, track) {
        if (this.crashed) {
            this.crashTime -= deltaTime;
            if (this.crashTime <= 0) this.crashed = false;
        }
        
        this.speed *= this.friction;
        
        const newX = this.x + Math.sin(this.angle) * this.speed * deltaTime;
        const newY = this.y - Math.cos(this.angle) * this.speed * deltaTime;
        
        if (track.isValid(newX, newY)) {
            this.x = newX;
            this.y = newY;
        } else {
            this.speed *= 0.5;
            this.crashed = true;
            this.crashTime = 0.3;
        }
        
        this.progress = -this.y / track.length;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.fillStyle = this.isPlayer 
            ? (this.crashed ? '#ff4444' : '#00ff00')
            : (this.crashed ? '#ff4444' : '#ff0000');
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        ctx.fillStyle = '#00aaff';
        ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, this.width - 4, this.height / 3);
        
        ctx.restore();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
